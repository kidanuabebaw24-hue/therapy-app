import './env-setup.js';
import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import { neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;

const connectionString = process.env.DATABASE_URL;

console.log('📡 Initializing Prisma WebSocket pool with DATABASE_URL:', connectionString ? connectionString.substring(0, 20) + '...' : 'MISSING');

const adapter = new PrismaNeon({ connectionString });
const prisma = new PrismaClient({ adapter });

console.log('📡 Neon WebSocket adapter initialized successfully (Transactions supported!).');

export default prisma;
