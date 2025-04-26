// src/util/db.js
import { Pool } from 'pg';

// Workaround for Vite processing middleware
let env;
if (!process) {
    env = import.meta.env;
} else {
    env = process.env;
}

const pool = new Pool({
    user: env.POSTGRES_USER || 'postgres',
    password: env.POSTGRES_PASSWORD || 'postgres',
    host:env.POSTGRES_HOST || 'localhost',
    port: env.POSTGRES_PORT || 5432,
    database: env.POSTGRES_DB || 'astro_db',
});

export const query = async (text, params) => {
    const start = Date.now();
    try {
        const res = await pool.query(text, params);
        const duration = Date.now() - start;
        console.log('Executed:', { text, duration, rows: res.rowCount });
        return res;
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
};

export const getClient = async () => {
    const client = await pool.connect();
    return client;
};