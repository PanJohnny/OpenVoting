// src/util/users.js
import { query } from './db.js';
import bcrypt from 'bcrypt';

export const UserModel = {
    // Vytvoření nového uživatele
    async create({ name, password, organizator = false, administrator = false }) {
        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await query(
            'INSERT INTO users (name, password, organizator, administrator) VALUES ($1, $2, $3, $4) RETURNING *',
            [name, hashedPassword, organizator, administrator]
        );
        return result.rows[0];
    },

    // Získání uživatele podle ID
    async getById(id) {
        const result = await query('SELECT id, name, organizator, administrator, created_at, updated_at FROM users WHERE id = $1', [id]);
        return result.rows[0];
    },

    // Získání uživatele podle jména
    async getByName(name) {
        const result = await query('SELECT * FROM users WHERE name = $1', [name]);
        return result.rows[0];
    },

    // Ověření hesla
    async verifyPassword(name, password) {
        const user = await this.getByName(name);
        if (!user) {
            return false;
        }
        return bcrypt.compare(password, user.password);
    },

    // Aktualizace uživatele
    async update(id, { name, organizator, administrator }) {
        const result = await query(
            'UPDATE users SET name = $1, organizator = $2, administrator = $3 WHERE id = $4 RETURNING id, name, organizator, administrator, created_at, updated_at',
            [name, organizator, administrator, id]
        );
        return result.rows[0];
    },

    async isEmpty() {
        const result = await query('SELECT COUNT(*) FROM users');
        return result.rows[0].count === '0';
    },

    async count() {
        const result = await query('SELECT COUNT(*) FROM users');
        return parseInt(result.rows[0].count, 10);
    },

    // Změna hesla
    async updatePassword(id, newPassword) {
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        const result = await query(
            'UPDATE users SET password = $1 WHERE id = $2 RETURNING id',
            [hashedPassword, id]
        );
        return result.rows[0];
    },

    // Smazání uživatele
    async delete(id) {
        const result = await query('DELETE FROM users WHERE id = $1 RETURNING id', [id]);
        return result.rows[0];
    },

    // Seznam všech uživatelů
    async getAll() {
        const result = await query('SELECT id, name, organizator, administrator, created_at, updated_at FROM users');
        return result.rows;
    },

    async isLatest(user) {
        // checks if the user updated_at matches the DB, if not, it means the user is not the latest
        const result = await query('SELECT updated_at FROM users WHERE id = $1', [user.id]);
        const dbUser = result.rows[0];
        if (!dbUser) {
            return false; // User not found
        }


        return user.updated_at.getTime() === dbUser.updated_at.getTime();
    }
};