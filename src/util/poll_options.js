// src/util/poll_options.js
import { query } from './db.js';

export const PollOptionModel = {
    // Přidání možnosti k anketě
    async create({ poll_id, content, option_order = 0 }) {
        const result = await query(
            'INSERT INTO poll_options (poll_id, content, option_order) VALUES ($1, $2, $3) RETURNING *',
            [poll_id, content, option_order]
        );
        return result.rows[0];
    },

    // Získání možnosti podle ID
    async getById(id) {
        const result = await query('SELECT * FROM poll_options WHERE id = $1', [id]);
        return result.rows[0];
    },

    // Aktualizace možnosti
    async update(id, { content, option_order }) {
        const result = await query(
            'UPDATE poll_options SET content = $1, option_order = $2 WHERE id = $3 RETURNING *',
            [content, option_order, id]
        );
        return result.rows[0];
    },

    // Smazání možnosti
    async delete(id) {
        const result = await query('DELETE FROM poll_options WHERE id = $1 RETURNING id', [id]);
        return result.rows[0];
    },

    // Získání všech možností pro anketu
    async getByPollId(poll_id) {
        const result = await query('SELECT * FROM poll_options WHERE poll_id = $1 ORDER BY option_order', [poll_id]);
        return result.rows;
    },

    // Přidání více možností najednou
    async createBulk(poll_id, options) {
        const client = await getClient();
        try {
            await client.query('BEGIN');

            const results = [];
            for (let i = 0; i < options.length; i++) {
                const { content, option_order = i } = options[i];
                const res = await client.query(
                    'INSERT INTO poll_options (poll_id, content, option_order) VALUES ($1, $2, $3) RETURNING *',
                    [poll_id, content, option_order]
                );
                results.push(res.rows[0]);
            }

            await client.query('COMMIT');
            return results;
        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }
    }
};