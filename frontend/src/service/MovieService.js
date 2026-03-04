import { API_BASE_URL } from '../config/config.js';

export class MovieService {
    async getMovies() {
        const response = await fetch(`${API_BASE_URL}/movies`);
        if (!response.ok) throw new Error('Erro ao buscar filmes: ' + response.statusText);
        const movies = await response.json();
        return movies;
    }

    async getMovieById(movieId) {
        const response = await fetch(`${API_BASE_URL}/movies/${movieId}`);
        if (!response.ok) throw new Error('Filme não encontrado');
        const movie = await response.json();
        return movie;
    }
}