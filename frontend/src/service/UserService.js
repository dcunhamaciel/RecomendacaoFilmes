import { API_BASE_URL } from '../config/config.js';

export class UserService {
    async getUsers() {
        const response = await fetch(`${API_BASE_URL}/users`);
        if (!response.ok) throw new Error('Erro ao buscar usuários: ' + response.statusText);
        const users = await response.json();
        return users;
    }

    async getUserById(userId) {
        const response = await fetch(`${API_BASE_URL}/users/${userId}`);
        if (!response.ok) throw new Error('Usuário não encontrado');
        const user = await response.json();
        return user;
    }

    async updateUser(user) {
        const response = await fetch(`${API_BASE_URL}/users/${user.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(user)
        });
        if (!response.ok) throw new Error('Erro ao atualizar usuário');
        const updatedUser = await response.json();
        return updatedUser;
    }

    async addUser(user) {
        const response = await fetch(`${API_BASE_URL}/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(user)
        });
        if (!response.ok) throw new Error('Erro ao adicionar usuário');
        const newUser = await response.json();
        return newUser;
    }
}