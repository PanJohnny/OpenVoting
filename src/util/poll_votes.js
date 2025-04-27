// src/util/poll_votes.js
import { query } from './db.js';
import crypto from 'crypto';

export const PollVoteModel = {
    // Přidání hlasu k anketě (pro nepřihlášeného uživatele s keypair)
    async createAnonymous({ poll_id, option_id, voter_key_id, data }) {
        // Získání veřejného klíče
        const voterResult = await query('SELECT * FROM poll_voters WHERE id = $1', [voter_key_id]);
        const voter = voterResult.rows[0];

        if (!voter) throw new Error('Voter key not found');

        // Vytvoření signatury
        const signature = crypto.createSign('SHA256');
        signature.update(JSON.stringify(data));
        const signatureString = signature.sign(voter.private_key, 'base64');

        // Uložení hlasu
        const result = await query(
            'INSERT INTO poll_votes (poll_id, option_id, voter_key_id, signature) VALUES ($1, $2, $3, $4) RETURNING *',
            [poll_id, option_id, voter_key_id, signatureString]
        );
        return result.rows[0];
    },

    // Přidání hlasu k anketě (pro přihlášeného uživatele)
    async createAuthenticated({ poll_id, option_id, user_id }) {
        const result = await query(
            'INSERT INTO poll_votes (poll_id, option_id, user_id) VALUES ($1, $2, $3) RETURNING *',
            [poll_id, option_id, user_id]
        );
        return result.rows[0];
    },

    // Získání výsledků hlasování
    async getPollResults(poll_id) {
        const result = await query(`
      SELECT po.id, po.content, COUNT(pv.id) as vote_count
      FROM poll_options po
      LEFT JOIN poll_votes pv ON po.id = pv.option_id
      WHERE po.poll_id = $1
      GROUP BY po.id, po.content
      ORDER BY po.option_order
    `, [poll_id]);
        return result.rows;
    },

    // Kontrola, zda uživatel již hlasoval
    async hasUserVoted(poll_id, user_id) {
        const result = await query(
            'SELECT EXISTS(SELECT 1 FROM poll_votes WHERE poll_id = $1 AND user_id = $2)',
            [poll_id, user_id]
        );
        return result.rows[0].exists;
    },

    // Kontrola, zda klíč již byl použit pro hlasování
    async hasVoterKeyVoted(poll_id, voter_key_id) {
        const result = await query(
            'SELECT EXISTS(SELECT 1 FROM poll_votes WHERE poll_id = $1 AND voter_key_id = $2)',
            [poll_id, voter_key_id]
        );
        return result.rows[0].exists;
    },

    async getPollsVotedByUser(user_id) {
        const result = await query(`
            SELECT p.id, p.name, p.created_at
            FROM polls p
            JOIN poll_votes pv ON p.id = pv.poll_id
            WHERE pv.user_id = $1
        `, [user_id]);
        return result.rows;
    },

    async getUsernameAndChosenOptionOfVoters(poll_id) {
        const result = await query(`
            SELECT u.name, po.content
            FROM poll_votes pv
            JOIN users u ON pv.user_id = u.id
            JOIN poll_options po ON pv.option_id = po.id
            WHERE pv.poll_id = $1
        `, [poll_id]);
        return result.rows;
    }
};