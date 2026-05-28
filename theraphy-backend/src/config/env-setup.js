import dotenv from 'dotenv';
import { parse } from 'pg-connection-string';

dotenv.config();

const rawConnectionString = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL;

if (rawConnectionString) {
  const config = parse(rawConnectionString);
  process.env.PGHOST = config.host;
  process.env.PGUSER = config.user;
  process.env.PGDATABASE = config.database;
  process.env.PGPASSWORD = config.password;
  process.env.PGPORT = config.port;
  process.env.NEON_DATABASE_URL = rawConnectionString;
  process.env.DATABASE_URL = rawConnectionString;
  console.log('📡 Environment variables for Neon injected.');
}
