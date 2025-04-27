// src/util/polls.js
import { query } from './db.js';

export const PollModel = {
    // Vytvoření nové ankety
    async create({ name, owner_id, expires, anonymous, group_id, max_options }) {
        const result = await query(
            'INSERT INTO polls (name, owner_id, expires, anonymous, group_id, max_options) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [name, owner_id, expires, anonymous, group_id, max_options]
        );
        return result.rows[0];
    },

    // Získání ankety podle ID
    async getById(id) {
        const result = await query('SELECT * FROM polls WHERE id = $1', [id]);
        return result.rows[0];
    },

    // Aktualizace ankety
    async update(id, { name, expires, max_options }) {
        const result = await query(
            'UPDATE polls SET name = $1, expires = $2, max_options = $3 WHERE id = $4 RETURNING *',
            [name, expires, max_options, id]
        );
        return result.rows[0];
    },

    // Smazání ankety
    async delete(id) {
        const result = await query('DELETE FROM polls WHERE id = $1 RETURNING id', [id]);
        return result.rows[0];
    },

    // Získání všech anket
    async getAll() {
        const result = await query('SELECT * FROM polls ORDER BY updated_at DESC');
        return result.rows;
    },

    // Získání anket podle vlastníka
    async getByOwnerId(owner_id) {
        const result = await query('SELECT * FROM polls WHERE owner_id = $1 ORDER BY updated_at DESC', [owner_id]);
        return result.rows;
    },

    // Získání anket podle skupiny
    async getByGroupId(group_id) {
        const result = await query('SELECT * FROM polls WHERE group_id = $1', [group_id]);
        return result.rows;
    },

    // Získání aktivních anket (nezaexpirovaných)
    async getActive() {
        const result = await query('SELECT * FROM polls WHERE expires > CURRENT_TIMESTAMP OR expires IS NULL ORDER BY updated_at DESC');
        return result.rows;
    }
};