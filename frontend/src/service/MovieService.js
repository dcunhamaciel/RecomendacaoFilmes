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

    async saveEmbeddings(embeddings) {
        const response = await fetch(`${API_BASE_URL}/movies/embeddings`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(embeddings)
        });
        if (!response.ok) throw new Error('Erro ao salvar embeddings: ' + response.statusText);       
        const result = await response.json();
        return result
    }

    async getCandidateMovies(queryVector) {
        const response = await fetch(`${API_BASE_URL}/movies/search`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ queryVector })
        });
        if (!response.ok) throw new Error('Erro ao buscar filmes candidatos: ' + response.statusText);
        const movies = await response.json();
        return movies;
    }
}