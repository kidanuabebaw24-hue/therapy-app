import prisma from './src/config/prisma.js';

async function main() {
  console.log('Listing users...');
  try {
    const users = await prisma.user.findMany({
      select: { email: true, createdAt: true }
    });
    console.log('✅ Users found:', users);
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to list users:', error);
    process.exit(1);
  }
}

main();
