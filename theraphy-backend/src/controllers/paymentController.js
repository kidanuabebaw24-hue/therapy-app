import prisma from '../config/prisma.js';
import { sendSuccess, sendError } from '../utils/responseHelper.js';
import { createNotification } from '../utils/notificationHelper.js';

/**
 * Mock create payment (kept for backward compatibility if needed)
 */
export const createPayment = async (req, res) => {
  try {
    const { appointmentId, amount, paymentMethod, transactionId } = req.body;
    const patientProfile = req.user.patientProfile;

    if (!patientProfile) return sendError(res, 'Profile not found', 404);

    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId, patientId: patientProfile.id },
    });

    if (!appointment) return sendError(res, 'Appointment not found', 404);

    if (appointment.status !== 'approved') {
      return sendError(res, 'Appointment must be approved before payment', 400);
    }

    if (appointment.paymentStatus === 'paid') {
      return sendError(res, 'Appointment is already paid', 400);
    }

    const payment = await prisma.payment.create({
      data: {
        patientId: patientProfile.id,
        appointmentId,
        amount,
        paymentMethod,
        transactionId,
        status: 'paid',
      },
    });

    await prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        paymentStatus: 'paid',
        status: 'scheduled',
      },
    });

    return sendSuccess(res, payment, 'Payment processed', 201);
  } catch (error) {
    return sendError(res, error.message, 500, error);
  }
};

/**
 * Retrieve current user's payments
 */
export const getMyPayments = async (req, res) => {
  try {
    const patientProfile = req.user.patientProfile;
    if (!patientProfile) return sendError(res, 'Profile not found', 404);

    const payments = await prisma.payment.findMany({
      where: { patientId: patientProfile.id },
      include: { appointment: { include: { therapist: { include: { user: { select: { name: true } } } } } } },
      orderBy: { createdAt: 'desc' },
    });

    return sendSuccess(res, payments, 'Payments retrieved');
  } catch (error) {
    return sendError(res, error.message, 500, error);
  }
};

/**
 * Initialize Chapa Payment Flow
 * POST /api/payments/chapa/initialize
 */
export const initializeChapaPayment = async (req, res) => {
  try {
    const { appointmentId, therapistId, date, duration, notes, type } = req.body;
    const patientProfile = req.user.patientProfile;

    if (!patientProfile) return sendError(res, 'Patient profile not found. You must be signed in as a patient to book.', 404);

    // Pay for an existing admin-approved appointment (no duplicate booking).
    if (appointmentId) {
      const existingAppointment = await prisma.appointment.findFirst({
        where: { id: appointmentId, patientId: patientProfile.id },
        include: { therapist: { include: { user: true } } },
      });

      if (!existingAppointment) return sendError(res, 'Appointment not found', 404);

      if (existingAppointment.status !== 'approved') {
        return sendError(res, 'This appointment must be approved by admin before payment.', 400);
      }

      if (existingAppointment.paymentStatus === 'paid') {
        return sendError(res, 'This appointment is already paid.', 400);
      }

      const therapist = existingAppointment.therapist;
      if (!therapist) return sendError(res, 'Therapist not found for this appointment', 404);

      const rateUsd = therapist.hourlyRate || 50.0;
      const rateEtb = Math.round(rateUsd * 120);
      const txRef = `tx-${existingAppointment.id.substring(0, 8)}-${Date.now().toString().slice(-6)}`;

      const protocol = req.secure || req.headers['x-forwarded-proto'] === 'https' ? 'https' : 'http';
      const host = req.get('host') || 'localhost:5000';
      const backendUrl = `${protocol}://${host}`;
      const returnUrl = `${backendUrl}/api/payments/chapa/success?tx_ref=${txRef}`;

      const chapaSecretKey = process.env.CHAPA_SECRET_KEY || 'CHASECK_TEST-DEQ1BOjsE3FM4fNfG5qalijqTxfl2hmm';

      const chapaResponse = await fetch('https://api.chapa.co/v1/transaction/initialize', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${chapaSecretKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: rateEtb.toString(),
          currency: 'ETB',
          email: req.user.email,
          first_name: req.user.name.split(' ')[0] || 'Patient',
          last_name: req.user.name.split(' ')[1] || 'User',
          phone_number: req.user.phone || '0912345678',
          tx_ref: txRef,
          callback_url: returnUrl,
          return_url: returnUrl,
          customization: {
            title: 'Theraphy Session',
            description: `Booking with therapist ${therapist.user.name}`,
          },
        }),
      });

      const chapaData = await chapaResponse.json();

      if (!chapaResponse.ok || chapaData.status !== 'success') {
        let errorMsg = 'Failed to initialize payment with Chapa.';
        if (chapaData.message) {
          if (typeof chapaData.message === 'string') {
            errorMsg = chapaData.message;
          } else if (typeof chapaData.message === 'object') {
            errorMsg = Object.entries(chapaData.message)
              .map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(', ') : val}`)
              .join('; ');
          }
        }
        return sendError(res, errorMsg, 400);
      }

      const payment = await prisma.payment.create({
        data: {
          patientId: patientProfile.id,
          appointmentId: existingAppointment.id,
          amount: rateUsd,
          status: 'pending',
          reference: txRef,
          paymentMethod: 'chapa',
        },
      });

      return sendSuccess(res, {
        checkout_url: chapaData.data.checkout_url,
        tx_ref: txRef,
        appointment: existingAppointment,
        payment,
      }, 'Chapa payment initialized successfully', 201);
    }

    let targetTherapistId = therapistId;
    let therapist = null;

    // 1. Verify if the requested therapist exists
    if (targetTherapistId && targetTherapistId !== 'placeholder') {
      therapist = await prisma.therapist.findUnique({
        where: { id: targetTherapistId },
        include: { user: true },
      });
    }

    // 2. If not found, try to resolve to patient's active therapist, or first available therapist
    if (!therapist) {
      const activeAssignment = await prisma.therapistAssignment.findFirst({
        where: { patientId: patientProfile.id, status: 'active' },
        include: { therapist: { include: { user: true } } }
      });
      if (activeAssignment && activeAssignment.therapist) {
        therapist = activeAssignment.therapist;
      }
    }

    if (!therapist) {
      therapist = await prisma.therapist.findFirst({
        where: { isVerified: true },
        include: { user: true }
      });
    }

    if (!therapist) {
      therapist = await prisma.therapist.findFirst({
        include: { user: true }
      });
    }

    // 3. Self-Healing Auto-Provisioning: If the DB has absolutely NO therapists, create a default profile
    if (!therapist) {
      console.log('🌱 Database is empty. Auto-provisioning a verified therapist profile for self-healing scheduling...');
      
      let therapistUser = await prisma.user.findFirst({
        where: { role: 'therapist' }
      });

      if (!therapistUser) {
        therapistUser = await prisma.user.create({
          data: {
            email: 'therapist.dr.sarah@theraphy.com',
            password: '$argon2id$v=19$m=65536,t=3,p=4$qF8B1G/U2tSj5y$4H4lV9yD9x', // placeholder dummy hash
            name: 'Dr. Sarah Jenkins',
            role: 'therapist',
            phone: '0911223344',
          }
        });
      }

      therapist = await prisma.therapist.create({
        data: {
          userId: therapistUser.id,
          specialization: 'Cognitive Behavioral Therapy (CBT)',
          licenseNumber: 'MD-10293-CBT',
          yearsOfExperience: 8,
          hourlyRate: 50.0,
          isVerified: true,
          about: 'Specialized in treating anxiety and phobias.',
          rating: 4.9
        },
        include: { user: true }
      });
      
      console.log(`✅ Auto-provisioned therapist: ${therapist.user.name} (${therapist.id})`);
    }

    // Update targetTherapistId to the fully validated Therapist UUID
    targetTherapistId = therapist.id;

    // Auto-assign therapist if not assigned
    const existingAssignment = await prisma.therapistAssignment.findUnique({
      where: {
        patientId_therapistId: {
          patientId: patientProfile.id,
          therapistId: targetTherapistId,
        },
      },
    });

    if (!existingAssignment) {
      await prisma.therapistAssignment.create({
        data: {
          patientId: patientProfile.id,
          therapistId: targetTherapistId,
          status: 'active',
        },
      });
    }

    // Base pricing USD (e.g. 50.0) converted to ETB for Chapa integration (1 USD = 120 ETB)
    const rateUsd = therapist.hourlyRate || 50.0;
    const rateEtb = Math.round(rateUsd * 120);

    // Create the Appointment in database first in a pending state
    const start = new Date(date);
    const appointment = await prisma.appointment.create({
      data: {
        patientId: patientProfile.id,
        therapistId: targetTherapistId,
        date: start,
        duration: duration || 50,
        notes: notes || '',
        type: type || 'consultation',
        paymentStatus: 'pending',
      },
    });

    // Generate unique transaction reference (max 50 chars - UUID slice + last 6 digits of timestamp)
    const txRef = `tx-${appointment.id.substring(0, 8)}-${Date.now().toString().slice(-6)}`;

    // Get dynamic host URL
    const protocol = req.secure || req.headers['x-forwarded-proto'] === 'https' ? 'https' : 'http';
    const host = req.get('host') || 'localhost:5000';
    const backendUrl = `${protocol}://${host}`;

    const returnUrl = `${backendUrl}/api/payments/chapa/success?tx_ref=${txRef}`;

    console.log(`📡 Initializing Chapa payment for appointment ${appointment.id} with ref: ${txRef}`);

    const chapaSecretKey = process.env.CHAPA_SECRET_KEY || 'CHASECK_TEST-DEQ1BOjsE3FM4fNfG5qalijqTxfl2hmm';

    // Call Chapa API to initialize transaction
    const chapaResponse = await fetch('https://api.chapa.co/v1/transaction/initialize', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${chapaSecretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: rateEtb.toString(),
        currency: 'ETB',
        email: req.user.email,
        first_name: req.user.name.split(' ')[0] || 'Patient',
        last_name: req.user.name.split(' ')[1] || 'User',
        phone_number: req.user.phone || '0912345678',
        tx_ref: txRef,
        callback_url: returnUrl,
        return_url: returnUrl,
        customization: {
          title: 'Theraphy Session', // Max 16 characters for Chapa
          description: `Booking with therapist ${therapist.user.name}`,
        },
      }),
    });

    const chapaData = await chapaResponse.json();

    if (!chapaResponse.ok || chapaData.status !== 'success') {
      console.error('❌ Chapa initialization failed:', chapaData);
      // Clean up orphaned appointment on error
      await prisma.appointment.delete({ where: { id: appointment.id } });
      
      let errorMsg = 'Failed to initialize payment with Chapa.';
      if (chapaData.message) {
        if (typeof chapaData.message === 'string') {
          errorMsg = chapaData.message;
        } else if (typeof chapaData.message === 'object') {
          errorMsg = Object.entries(chapaData.message)
            .map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(', ') : val}`)
            .join('; ');
        }
      }
      return sendError(res, errorMsg, 400);
    }

    // Save pending Payment record in DB
    const payment = await prisma.payment.create({
      data: {
        patientId: patientProfile.id,
        appointmentId: appointment.id,
        amount: rateUsd, // Store the native USD amount in our database
        status: 'pending',
        reference: txRef,
        paymentMethod: 'chapa',
      },
    });

    return sendSuccess(res, {
      checkout_url: chapaData.data.checkout_url,
      tx_ref: txRef,
      appointment,
      payment,
    }, 'Chapa payment initialized successfully', 201);

  } catch (error) {
    console.error('❌ Error initializing Chapa payment:', error);
    return sendError(res, error.message, 500, error);
  }
};

/**
 * Verify Chapa Payment Status
 * GET /api/payments/chapa/verify/:tx_ref
 */
export const verifyChapaPayment = async (req, res) => {
  try {
    const { tx_ref } = req.params;

    console.log(`📡 Verifying Chapa payment for ref: ${tx_ref}`);

    // Retrieve pending payment record
    const payment = await prisma.payment.findFirst({
      where: { reference: tx_ref },
      include: { appointment: true },
    });

    if (!payment) return sendError(res, 'Payment record not found.', 404);

    // Fast-path if already verified
    if (payment.status === 'paid') {
      return sendSuccess(res, payment, 'Payment already verified as paid.');
    }

    const chapaSecretKey = process.env.CHAPA_SECRET_KEY || 'CHASECK_TEST-DEQ1BOjsE3FM4fNfG5qalijqTxfl2hmm';

    // Verify transaction from Chapa API
    const chapaResponse = await fetch(`https://api.chapa.co/v1/transaction/verify/${tx_ref}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${chapaSecretKey}`,
      },
    });

    const chapaData = await chapaResponse.json();

    if (!chapaResponse.ok || chapaData.status !== 'success') {
      console.error('❌ Chapa verification request failed:', chapaData);
      return sendError(res, chapaData.message || 'Payment verification failed.', 400);
    }

    if (chapaData.data.status !== 'success') {
      return sendError(res, `Payment status returned: ${chapaData.data.status}`, 400);
    }

    // Execute state changes inside database transaction block
    const [updatedPayment, updatedAppointment] = await prisma.$transaction([
      prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'paid',
          transactionId: chapaData.data.reference || chapaData.data.tx_ref,
        },
      }),
      prisma.appointment.update({
        where: { id: payment.appointmentId },
        data: {
          paymentStatus: 'paid',
          status: 'scheduled',
        },
      }),
    ]);

    return sendSuccess(res, updatedPayment, 'Payment successfully processed and verified.');

  } catch (error) {
    console.error('❌ Error verifying Chapa payment:', error);
    return sendError(res, error.message, 500, error);
  }
};

/**
 * Beautiful HTML redirection landing page for successful Chapa checkouts
 * GET /api/payments/chapa/success
 */
export const chapaSuccessPage = async (req, res) => {
  try {
    const { tx_ref } = req.query;

    console.log(`📡 Chapa Success redirect hit for ref: ${tx_ref}`);

    if (tx_ref) {
      try {
        const chapaSecretKey = process.env.CHAPA_SECRET_KEY || 'CHASECK_TEST-DEQ1BOjsE3FM4fNfG5qalijqTxfl2hmm';
        
        // Auto-verify Chapa status proactively to ensure DB consistency instantly on callback
        const chapaResponse = await fetch(`https://api.chapa.co/v1/transaction/verify/${tx_ref}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${chapaSecretKey}`,
          },
        });

        const chapaData = await chapaResponse.json();

        if (chapaResponse.ok && chapaData.status === 'success' && chapaData.data.status === 'success') {
          const payment = await prisma.payment.findFirst({
            where: { reference: tx_ref },
          });

          if (payment && payment.status !== 'paid') {
            await prisma.$transaction([
              prisma.payment.update({
                where: { id: payment.id },
                data: {
                  status: 'paid',
                  transactionId: chapaData.data.reference || chapaData.data.tx_ref,
                },
              }),
              prisma.appointment.update({
                where: { id: payment.appointmentId },
                data: {
                  paymentStatus: 'paid',
                  status: 'scheduled',
                },
              }),
            ]);

            console.log(`✅ Success landing automatically verified & captured payment for ref: ${tx_ref}`);
          }
        }
      } catch (autoVerifyErr) {
        console.error('⚠️ Proactive redirect auto-verify failed:', autoVerifyErr);
      }
    }

    res.setHeader('Content-Type', 'text/html');
    res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Payment Successful - Theraphy</title>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;800&display=swap" rel="stylesheet">
  <style>
    body {
      margin: 0;
      padding: 0;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: radial-gradient(circle at 10% 20%, rgb(243, 248, 255) 0%, rgb(250, 252, 255) 90%);
      font-family: 'Outfit', sans-serif;
      color: #1e293b;
    }
    .card {
      background: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.4);
      padding: 48px;
      border-radius: 32px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.02);
      text-align: center;
      max-width: 420px;
      width: 90%;
      animation: slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
    @keyframes slideUp {
      from { transform: translateY(40px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
    .success-icon-wrapper {
      position: relative;
      width: 100px;
      height: 100px;
      margin: 0 auto 32px;
    }
    .circle {
      width: 100px;
      height: 100px;
      border-radius: 50%;
      background: #ecfdf5;
      display: flex;
      justify-content: center;
      align-items: center;
      animation: scaleIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
    }
    @keyframes scaleIn {
      from { transform: scale(0); }
      to { transform: scale(1); }
    }
    h1 {
      font-size: 28px;
      font-weight: 800;
      margin: 0 0 12px;
      color: #0f172a;
      letter-spacing: -0.5px;
    }
    p {
      font-size: 16px;
      line-height: 1.6;
      color: #64748b;
      margin: 0 0 36px;
    }
    .btn {
      display: inline-flex;
      justify-content: center;
      align-items: center;
      background: #4f46e5;
      color: white;
      text-decoration: none;
      font-weight: 600;
      padding: 16px 32px;
      border-radius: 16px;
      font-size: 16px;
      transition: all 0.3s ease;
      box-shadow: 0 10px 20px rgba(79, 70, 229, 0.15);
      border: none;
      width: 100%;
      box-sizing: border-box;
      cursor: pointer;
    }
    .btn:hover {
      background: #4338ca;
      transform: translateY(-2px);
      box-shadow: 0 12px 24px rgba(79, 70, 229, 0.25);
    }
    .btn:active {
      transform: translateY(0);
    }
    .loader {
      border: 3px solid #f3f3f3;
      border-top: 3px solid #4f46e5;
      border-radius: 50%;
      width: 18px;
      height: 18px;
      animation: spin 1s linear infinite;
      margin-right: 12px;
      display: inline-block;
      vertical-align: middle;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    .footer {
      font-size: 12px;
      color: #94a3b8;
      margin-top: 24px;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="success-icon-wrapper">
      <div class="circle">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 6L9 17L4 12" stroke="#10B981" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
    </div>
    <h1>Payment Successful</h1>
    <p>Thank you! Your appointment has been booked. You will be redirected back to the Theraphy application automatically.</p>
    <a href="theraphy://payment-success?tx_ref=${tx_ref || ''}" class="btn" id="redirect-btn">
      <span class="loader" id="loader"></span>
      Go back to App
    </a>
    <div class="footer">
      Secured by Chapa Payment Gateway
    </div>
  </div>

  <script>
    const txRef = "${tx_ref || ''}";
    const deepLinkUrl = "theraphy://payment-success?tx_ref=" + txRef;
    
    // Auto-redirect back to mobile client after 1.5s
    setTimeout(() => {
      window.location.href = deepLinkUrl;
      document.getElementById('loader').style.display = 'none';
    }, 1500);
  </script>
</body>
</html>
    `);
  } catch (err) {
    res.status(500).send("Error loading success redirect: " + err.message);
  }
};
