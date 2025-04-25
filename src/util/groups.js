// src/util/groups.js
import { query } from './db.js';

export const GroupModel = {
    // Vytvoření nové skupiny
    async create({ name, owner_id }) {
        const result = await query(
            'INSERT INTO groups (name, owner_id) VALUES ($1, $2) RETURNING *',
            [name, owner_id]
        );
        return result.rows[0];
    },

    // Získání skupiny podle ID
    async getById(id) {
        const result = await query('SELECT * FROM groups WHERE id = $1', [id]);
        return result.rows[0];
    },

    // Aktualizace skupiny
    async update(id, { name }) {
        const result = await query(
            'UPDATE groups SET name = $1 WHERE id = $2 RETURNING *',
            [name, id]
        );
        return result.rows[0];
    },

    // Smazání skupiny
    async delete(id) {
        const result = await query('DELETE FROM groups WHERE id = $1 RETURNING id', [id]);
        return result.rows[0];
    },

    // Získání všech skupin
    async getAll() {
        const result = await query('SELECT * FROM groups');
        return result.rows;
    },

    // Získání skupin uživatele (jako vlastník)
    async getByOwnerId(owner_id) {
        const result = await query('SELECT * FROM groups WHERE owner_id = $1', [owner_id]);
        return result.rows;
    },

    // Získání skupin, kterých je uživatel členem
    async getByMemberId(user_id) {
        const result = await query(`
      SELECT g.* FROM groups g
      JOIN group_memberships gm ON g.id = gm.group_id
      WHERE gm.user_id = $1
    `, [user_id]);
        return result.rows;
    },

    // Přidání členů do skupiny (batch insert)
    async addMembers(group_id, user_ids) {
        const values = user_ids.map(uid => `(${uid}, ${group_id})`).join(', ');
        const result = await query(`
      INSERT INTO group_memberships (user_id, group_id) 
      VALUES ${values}
      ON CONFLICT DO NOTHING
    `);
        return result.rowCount;
    }
};