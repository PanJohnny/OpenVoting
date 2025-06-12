// src/util/audit_logger.js
import { query } from './db.js';

export const AuditLogger = {
    async log(eventType, entityType, entityId, metadata = {}) {
        try {
            const sanitizedMetadata = { ...metadata };

            // Odstraníme citlivé údaje
            if (sanitizedMetadata.token) delete sanitizedMetadata.token;
            if (sanitizedMetadata.signature) delete sanitizedMetadata.signature;
            if (sanitizedMetadata.tokenHash) delete sanitizedMetadata.tokenHash;

            const result = await query(
                'INSERT INTO audit_logs (event_type, entity_type, entity_id, metadata) VALUES ($1, $2, $3, $4) RETURNING id',
                [eventType, entityType, entityId, JSON.stringify(sanitizedMetadata)]
            );

            return result.rows[0].id;
        } catch (error) {
            console.error('Nepodařilo se zaznamenat událost do audit logu:', error);
        }
    }, /** Filters: eventType, entityType, entityId, startDate, endDate */
    async query(filters = {}, limit = 50, offset = 0) {
        const { eventType, entityType, entityId, startDate, endDate } = filters;
        const conditions = [];
        const params = [];

        if (eventType) {
            conditions.push('event_type = $' + (params.length + 1));
            params.push(eventType);
        }
        if (entityType) {
            conditions.push('entity_type = $' + (params.length + 1));
            params.push(entityType);
        }
        if (entityId) {
            conditions.push('entity_id = $' + (params.length + 1));
            params.push(entityId);
        }
        if (startDate) {
            conditions.push('created_at >= $' + (params.length + 1));
            params.push(startDate);
        }
        if (endDate) {
            conditions.push('created_at <= $' + (params.length + 1));
            params.push(endDate);
        }

        let queryStr = 'SELECT * FROM audit_logs';
        if (conditions.length > 0) {
            queryStr += ' WHERE ' + conditions.join(' AND ');
        }
        queryStr += ' ORDER BY created_at DESC';

        queryStr += ' LIMIT $' + (params.length + 1);
        params.push(limit);

        queryStr += ' OFFSET $' + (params.length + 1);
        params.push(offset);

        const result = await query(queryStr, params);
        return result.rows;
    }
};