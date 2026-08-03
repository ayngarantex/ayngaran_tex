import mysql from 'mysql2/promise';

const isCloudDb = process.env.DB_HOST && !process.env.DB_HOST.includes('localhost') && !process.env.DB_HOST.includes('127.0.0.1');

const pool = mysql.createPool({
    host: process.env.DB_HOST ?? 'localhost',
    user: process.env.DB_USER ?? 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME ?? 'ayngarntex',
    port: Number(process.env.DB_PORT ?? 3306),
    waitForConnections: true,
    connectionLimit: 10,
    maxIdle: 10, // Maximum number of idle connections
    idleTimeout: 60000, // Idle connections timeout in milliseconds (1 minute)
    enableKeepAlive: true, // Keep connection active
    keepAliveInitialDelay: 10000, // Delay before sending keep-alive packets (10s)
    ssl: isCloudDb ? { rejectUnauthorized: false, minVersion: 'TLSv1.2' } : undefined,
});

export default pool;
