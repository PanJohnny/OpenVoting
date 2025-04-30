// src/util/blind_signatures.js
import { query } from './db.js';
import crypto from 'crypto';

export const BlindSignatureModel = {
    // Vytvoření nového požadavku na slepý podpis
    async create(pollId, blindedMessage) {
        const nonce = crypto.randomBytes(32).toString('hex');
        const result = await query(
            'INSERT INTO blind_signature_requests (poll_id, blinded_message, nonce) VALUES ($1, $2, $3) RETURNING *',
            [pollId, blindedMessage, nonce]
        );
        return result.rows[0];
    },

    // Získání požadavku podle ID
    async getById(id) {
        const result = await query('SELECT * FROM blind_signature_requests WHERE id = $1', [id]);
        return result.rows[0];
    },

    // Podepsání požadavku (pro autoritu)
    async sign(id, signature) {
        const result = await query(
            'UPDATE blind_signature_requests SET blind_signature = $1, issued = true WHERE id = $2 RETURNING *',
            [signature, id]
        );
        return result.rows[0];
    },

    // Získání nevyřízených požadavků pro anketu
    async getPendingByPollId(pollId) {
        const result = await query(
            'SELECT * FROM blind_signature_requests WHERE poll_id = $1 AND issued = false',
            [pollId]
        );
        return result.rows;
    }
};

export const UsedTokenModel = {
    // Přidání použitého tokenu
    async add(pollId, tokenHash) {
        try {
            const result = await query(
                'INSERT INTO used_voting_tokens (poll_id, token_hash) VALUES ($1, $2) RETURNING *',
                [pollId, tokenHash]
            );
            return result.rows[0];
        } catch (error) {
            // Unique constraint violation = token už byl použit
            if (error.code === '23505') {
                return false;
            }
            throw error;
        }
    },

    // Kontrola, zda byl token již použit
    async isUsed(pollId, tokenHash) {
        const result = await query(
            'SELECT EXISTS(SELECT 1 FROM used_voting_tokens WHERE poll_id = $1 AND token_hash = $2)',
            [pollId, tokenHash]
        );
        return result.rows[0].exists;
    }
};