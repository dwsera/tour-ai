import mysql from 'mysql2/promise';

let pool: mysql.Pool;

export async function connectToTiDB(): Promise<mysql.Pool> {
  if (!pool) {
    try {
      pool = mysql.createPool({
        host: process.env.TIDB_HOST,
        port: Number(process.env.TIDB_PORT) || 4000,
        user: process.env.TIDB_USER,
        password: process.env.TIDB_PASSWORD,
        database: process.env.TIDB_DATABASE || 'test',
        ssl: { rejectUnauthorized: true },
        connectionLimit: 10,
      });
    } catch (err) {
      console.error('Failed to connect to TiDB:', err);
      throw err;
    }
  }
  return pool;
}