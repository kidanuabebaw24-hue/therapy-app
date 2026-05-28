/**
 * Seed verified therapist (and optional admin) accounts with known passwords.
 *
 * Run from theraphy-backend:
 *   npm run seed:therapists
 *
 * Requires DATABASE_URL or NEON_DATABASE_URL in .env
 */
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import pg from 'pg';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

dotenv.config();

const connectionString =
  process.env.NEON_DATABASE_URL || process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('Set DATABASE_URL or NEON_DATABASE_URL in .env');
}

const pool = new pg.Pool({ connectionString });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

const THERAPIST_PASSWORD = 'Therapist@123';
const ADMIN_PASSWORD = 'Admin@123';

const THERAPISTS = [
  {
    email: 'henok@theraphy.com',
    name: 'Dr. Henok Melese',
    phone: '0911110001',
    specialization: 'General',
    licenseNumber: 'TH-HENOK-001',
    yearsOfExperience: 5,
    hourlyRate: 50,
    about: 'Experienced in anxiety and mood disorders.',
  },
  {
    email: 'nardos@theraphy.com',
    name: 'Dr. Nardos Abebe',
    phone: '0911110002',
    specialization: 'General',
    licenseNumber: 'TH-NARDOS-001',
    yearsOfExperience: 4,
    hourlyRate: 50,
    about: 'Focus on CBT and exposure therapy.',
  },
  {
    email: 'hilina@theraphy.com',
    name: 'Dr. Hilina Abraham',
    phone: '0911110003',
    specialization: 'General',
    licenseNumber: 'TH-HILINA-001',
    yearsOfExperience: 6,
    hourlyRate: 55,
    about: 'Supports clients with phobias and panic symptoms.',
  },
];

const ADMIN = {
  email: 'admin@theraphy.com',
  name: 'Therapy Admin',
  phone: '0911000000',
};

async function upsertTherapist(profile) {
  const passwordHash = await bcrypt.hash(THERAPIST_PASSWORD, 10);
  const existing = await prisma.user.findUnique({
    where: { email: profile.email },
    include: { therapistProfile: true },
  });

  const therapistData = {
    specialization: profile.specialization,
    licenseNumber: profile.licenseNumber,
    yearsOfExperience: profile.yearsOfExperience,
    hourlyRate: profile.hourlyRate,
    isVerified: true,
    about: profile.about,
    rating: 4.8,
  };

  if (existing) {
    await prisma.user.update({
      where: { id: existing.id },
      data: {
        name: profile.name,
        phone: profile.phone,
        password: passwordHash,
        role: 'therapist',
      },
    });

    if (existing.therapistProfile) {
      await prisma.therapist.update({
        where: { id: existing.therapistProfile.id },
        data: therapistData,
      });
    } else {
      await prisma.therapist.create({
        data: { userId: existing.id, ...therapistData },
      });
    }

    console.log(`  ↻ Updated therapist: ${profile.email}`);
    return;
  }

  await prisma.user.create({
    data: {
      email: profile.email,
      password: passwordHash,
      name: profile.name,
      phone: profile.phone,
      role: 'therapist',
      therapistProfile: {
        create: therapistData,
      },
    },
  });

  console.log(`  ✓ Created therapist: ${profile.email}`);
}

async function upsertAdmin() {
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
  const existing = await prisma.user.findUnique({
    where: { email: ADMIN.email },
  });

  if (existing) {
    await prisma.user.update({
      where: { id: existing.id },
      data: {
        name: ADMIN.name,
        phone: ADMIN.phone,
        password: passwordHash,
        role: 'admin',
      },
    });
    console.log(`  ↻ Updated admin: ${ADMIN.email}`);
    return;
  }

  await prisma.user.create({
    data: {
      email: ADMIN.email,
      password: passwordHash,
      name: ADMIN.name,
      phone: ADMIN.phone,
      role: 'admin',
    },
  });

  console.log(`  ✓ Created admin: ${ADMIN.email}`);
}

/** Fix auto-provisioned Dr. Sarah account so login works. */
async function fixSarahPlaceholder() {
  const email = 'therapist.dr.sarah@theraphy.com';
  const user = await prisma.user.findUnique({
    where: { email },
    include: { therapistProfile: true },
  });
  if (!user) return;

  const passwordHash = await bcrypt.hash(THERAPIST_PASSWORD, 10);
  await prisma.user.update({
    where: { id: user.id },
    data: { password: passwordHash },
  });

  if (user.therapistProfile) {
    await prisma.therapist.update({
      where: { id: user.therapistProfile.id },
      data: { isVerified: true },
    });
  }

  console.log(`  ↻ Fixed login for: ${email}`);
}

async function main() {
  console.log('🌱 Seeding therapist accounts...\n');

  for (const therapist of THERAPISTS) {
    await upsertTherapist(therapist);
  }

  await fixSarahPlaceholder();
  await upsertAdmin();

  console.log('\n✅ Seed complete. Use these credentials:\n');
  console.log('── Therapists (web therapist login / mobile if supported) ──');
  for (const t of THERAPISTS) {
    console.log(`   ${t.email}  /  ${THERAPIST_PASSWORD}`);
  }
  console.log(`   therapist.dr.sarah@theraphy.com  /  ${THERAPIST_PASSWORD}  (if auto-created)`);
  console.log('\n── Admin (web admin login) ──');
  console.log(`   ${ADMIN.email}  /  ${ADMIN_PASSWORD}\n`);
}

main()
  .catch((err) => {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
