import dotenv from 'dotenv';
import { parse } from 'pg-connection-string';

dotenv.config();

if (process.env.DATABASE_URL) {
  const config = parse(process.env.DATABASE_URL);
  process.env.PGHOST = config.host;
  process.env.PGUSER = config.user;
  process.env.PGDATABASE = config.database;
  process.env.PGPASSWORD = config.password;
  process.env.PGPORT = config.port;
  process.env.NEON_DATABASE_URL = process.env.DATABASE_URL;
  console.log('📡 Environment variables for Neon injected.');
}
