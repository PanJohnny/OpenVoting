// src/util/blind_token.js
import crypto from 'crypto';
import { query } from './db.js';

export const BlindTokenModel = {
    // Generování bázových tokenů pro hlasování v anketě
    async generateTokens(pollId, count) {
        const tokens = [];

        // Vygenerujeme páry klíčů pro anketu, pokud ještě neexistují
        const pollResult = await query('SELECT signing_key, verification_key FROM polls WHERE id = $1', [pollId]);
        let { signing_key, verification_key } = pollResult.rows[0];

        if (!signing_key || !verification_key) {
            // Vygenerujeme nové klíče
            const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
                modulusLength: 2048,
                publicKeyEncoding: { type: 'spki', format: 'pem' },
                privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
            });

            // Uložíme klíče do ankety
            await query(
                'UPDATE polls SET signing_key = $1, verification_key = $2 WHERE id = $3',
                [privateKey, publicKey, pollId]
            );

            signing_key = privateKey;
            verification_key = publicKey;
        }

        // Vygenerujeme tokeny
        for (let i = 0; i < count; i++) {
            // Vygenerujeme unikátní token
            const baseToken = crypto.randomBytes(32).toString('hex');

            // Vytvoříme hash tokenu pro uložení na server
            const tokenHash = crypto.createHash('sha256').update(baseToken).digest('hex');

            // Podepíšeme baseToken pomocí privátního klíče
            const signer = crypto.createSign('SHA256');
            signer.update(baseToken);
            signer.end();
            const signature = signer.sign(signing_key, 'base64');

            // Vytvoříme odkaz s enkódovanými daty
            const tokenData = Buffer.from(JSON.stringify({
                t: baseToken,
                s: signature,
                p: pollId
            })).toString('base64url');

            tokens.push({
                tokenHash,
                tokenData
            });
        }

        return tokens;
    }
};