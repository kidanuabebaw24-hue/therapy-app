export const formatPatientForTherapist = (patient) => {
  if (!patient) return null;
  const user = patient.user || {};
  return {
    id: patient.id,
    userId: patient.userId,
    name: user.name || patient.name || 'Client',
    email: user.email || patient.email || '',
    phone: user.phone || patient.phone || null,
    primaryPhobia: patient.primaryPhobia ?? null,
    currentAnxietyLevel: patient.currentAnxietyLevel ?? null,
    age: patient.age ?? null,
    gender: patient.gender ?? null,
  };
};

export const formatTherapistForAdmin = (therapist) => {
  if (!therapist) return null;
  const user = therapist.user || {};
  return {
    id: therapist.id,
    userId: therapist.userId,
    name: user.name || therapist.name || 'Therapist',
    email: user.email || therapist.email || '',
    phone: user.phone || therapist.phone || null,
    specialization: therapist.specialization ?? null,
    yearsOfExperience: therapist.yearsOfExperience ?? null,
    isVerified: therapist.isVerified ?? false,
  };
};

export const formatAssignmentForTherapist = (assignment) => ({
  id: assignment.id,
  patientId: assignment.patientId,
  therapistId: assignment.therapistId,
  assignedDate: assignment.assignedAt,
  assignedAt: assignment.assignedAt,
  status: assignment.status,
  isActive: assignment.status === 'active',
  patient: formatPatientForTherapist(assignment.patient),
  therapist: formatTherapistForAdmin(assignment.therapist),
});
