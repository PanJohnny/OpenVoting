// src/util/group_memberships.js
import { query } from './db.js';

export const GroupMembershipModel = {
    // Přidání uživatele do skupiny
    async addMember(user_id, group_id) {
        const result = await query(
            'INSERT INTO group_memberships (user_id, group_id) VALUES ($1, $2) ON CONFLICT DO NOTHING RETURNING *',
            [user_id, group_id]
        );
        return result.rows[0];
    },

    // Odebrání uživatele ze skupiny
    async removeMember(user_id, group_id) {
        const result = await query(
            'DELETE FROM group_memberships WHERE user_id = $1 AND group_id = $2 RETURNING *',
            [user_id, group_id]
        );
        return result.rows[0];
    },

    // Získání všech členství pro skupinu
    async getMembersByGroupId(group_id) {
        const result = await query(`
      SELECT u.id, u.name, u.organizator, u.administrator
      FROM users u
      JOIN group_memberships gm ON u.id = gm.user_id
      WHERE gm.group_id = $1
    `, [group_id]);
        return result.rows;
    },

    // Zjištění, zda je uživatel členem skupiny
    async isMember(user_id, group_id) {
        const result = await query(
            'SELECT EXISTS(SELECT 1 FROM group_memberships WHERE user_id = $1 AND group_id = $2)',
            [user_id, group_id]
        );
        return result.rows[0].exists;
    }
};