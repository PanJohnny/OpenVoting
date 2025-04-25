// src/util/poll_voters.js
import { query } from './db.js';
import crypto from 'crypto';

export const PollVoterModel = {
    // Generování keypair pro voliče
    async generateKeypair(poll_id) {
        const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
            modulusLength: 2048,
            publicKeyEncoding: {
                type: 'spki',
                format: 'pem'
            },
            privateKeyEncoding: {
                type: 'pkcs8',
                format: 'pem'
            }
        });

        const result = await query(
            'INSERT INTO poll_voters (poll_id, private_key, public_key) VALUES ($1, $2, $3) RETURNING *',
            [poll_id, privateKey, publicKey]
        );
        return result.rows[0];
    },

    // Získání klíče podle ID
    async getById(id) {
        const result = await query('SELECT * FROM poll_voters WHERE id = $1', [id]);
        return result.rows[0];
    },

    // Generování keypairů pro všechny členy skupiny
    async generateKeypairsForGroup(poll_id, group_id) {
        const client = await getClient();
        try {
            await client.query('BEGIN');

            // Získání členů skupiny
            const membersRes = await client.query(`
        SELECT user_id FROM group_memberships WHERE group_id = $1
      `, [group_id]);

            // Generování keypairs
            const keypairs = [];
            for (const member of membersRes.rows) {
                const keypair = await this.generateKeypair(poll_id);
                keypairs.push({ user_id: member.user_id, ...keypair });
            }

            await client.query('COMMIT');
            return keypairs;
        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }
    }
};