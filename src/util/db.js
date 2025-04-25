// src/util/db.js
import { Pool } from 'pg';

// Konfigurace připojení z proměnných prostředí
const pool = new Pool({
    user: import.meta.env.POSTGRES_USER || 'postgres',
    password: import.meta.env.POSTGRES_PASSWORD || 'postgres',
    host:import. meta.env.POSTGRES_HOST || 'localhost',
    port: import.meta.env.POSTGRES_PORT || 5432,
    database: import.meta.env.POSTGRES_DB || 'astro_db',
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