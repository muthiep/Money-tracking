import fs from 'node:fs';
import path from 'node:path';
import mysql from 'mysql2/promise';

const g = globalThis;

function sslConfig() {
  let ca;
  if (process.env.DB_CA_PATH) {            // lokal saja, mis. ./ca.pem
    ca = fs.readFileSync(path.resolve(process.cwd(), process.env.DB_CA_PATH), 'utf-8');
  } else if (process.env.DB_CA_CERT) {
    const raw = process.env.DB_CA_CERT.trim().replace(/^["']|["']$/g, '');
    ca = raw.includes('BEGIN CERTIFICATE')
      ? raw.replace(/\\n/g, '\n')
      : Buffer.from(raw.replace(/\s+/g, ''), 'base64').toString('utf-8');
  }
  return ca ? { ca, rejectUnauthorized: true } : undefined;
}

export function getPool() {
  if (!g.__sakuPool) {
    g.__sakuPool = mysql.createPool({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      ssl: sslConfig(),
      waitForConnections: true,
      connectionLimit: 5,
      maxIdle: 5,
      idleTimeout: 60000,
      dateStrings: true,
      decimalNumbers: true,
    });
  }
  return g.__sakuPool;
}

export const pool = { query: (...a) => getPool().query(...a) };

export const USER_ID = 1;