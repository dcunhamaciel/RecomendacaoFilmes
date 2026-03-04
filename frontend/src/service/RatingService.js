import { API_BASE_URL } from '../config/config.js';

export class RatingService {

    async createRating(userId, movieId, rating) {
        const response = await fetch(`${API_BASE_URL}/ratings`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId,
                movieId,
                rating
            })
        });

        if (!response.ok) {
            console.error('Erro ao criar avaliação:', await response.text());
            throw new Error('Erro ao salvar avaliação');
        }

        return await response.json();
    }
}