import prisma from '../src/config/prisma.js';

async function main() {
  try {
    const therapists = await prisma.therapist.findMany({
      include: { user: true }
    });
    console.log('--- Database Therapists ---');
    console.log(JSON.stringify(therapists, null, 2));
    
    const assignments = await prisma.therapistAssignment.findMany();
    console.log('--- Therapist Assignments ---');
    console.log(JSON.stringify(assignments, null, 2));
  } catch (error) {
    console.error('Error querying db:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
