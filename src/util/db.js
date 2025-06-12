// src/util/db.js
import {Pool} from 'pg';
import {loadEnv} from "vite";

// Workaround for Vite processing middleware
let env;
if (!process || !process.env) {
    env = import.meta.env;
} else {
    env = loadEnv(process.env.NODE_ENV, process.cwd(), "");
}

console.log("using env " + JSON.stringify(env));

const pool = new Pool({
    user: env.POSTGRES_USER || 'postgres',
    password: env.POSTGRES_PASSWORD || 'postgres',
    host:env.POSTGRES_HOST || 'db',
    port: env.POSTGRES_PORT || 5432,
    database: env.POSTGRES_DB || 'astro_db',
});

export const query = async (text, params) => {
    const start = Date.now();
    try {
        const res = await pool.query(text, params);
        const duration = Date.now() - start;
        return res;
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
};

export const getClient = async () => {
    return await pool.connect();
};