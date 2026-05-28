import './env-setup.js';
import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import { neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;

const connectionString = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL;
const hasConnectionString = typeof connectionString === 'string' && connectionString.length > 0;
const looksLocal =
  hasConnectionString &&
  (connectionString.includes('localhost') || connectionString.includes('127.0.0.1'));

console.log('📡 Initializing Prisma WebSocket pool with DATABASE_URL:', connectionString ? connectionString.substring(0, 20) + '...' : 'MISSING');

if (!hasConnectionString) {
  throw new Error('Missing Neon connection string. Set NEON_DATABASE_URL (or DATABASE_URL) to your Neon Postgres URL.');
}

if (looksLocal) {
  throw new Error(
    'Neon adapter is configured, but connection string points to localhost. Set NEON_DATABASE_URL to your Neon Postgres URL.',
  );
}

const adapter = new PrismaNeon({ connectionString });
const prisma = new PrismaClient({ adapter });

console.log('📡 Neon WebSocket adapter initialized successfully (Transactions supported!).');

export default prisma;
