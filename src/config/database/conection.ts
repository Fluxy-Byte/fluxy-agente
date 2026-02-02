import pg from 'pg'
const { Pool, Client } = pg;

const connectionString = process.env.DATABASE_URL;

const pool = new Pool({
    connectionString
});

pool.on('connect', () => {
    console.log("✅ PostgreSQL conectado");
});

pool.on('error', (err) => {
    console.log('❌ Erro no pool:', err);
});

export default pool;