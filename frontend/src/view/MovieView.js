import { View } from './View.js';

export class MovieView extends View {
    // DOM elements
    #recommendationList = document.querySelector('#recommendationList');
    #movieList = document.querySelector('#movieList');

    // Templates and callbacks
    #movieTemplate;
    #recommendationTemplate;
    #ratingSelects;
    #onRateMovie;

    constructor() {
        super();
        this.init();
    }

    async init() {
        this.#movieTemplate = await this.loadTemplate('./src/view/templates/movie-card.html');
        this.#recommendationTemplate = await this.loadTemplate('./src/view/templates/recommendation-card.html');
    }

    onUserSelected(user) {
        // Enable buttons if a user is selected, otherwise disable them
        this.setButtonsState(user.id ? false : true);
    }

    registerRateMovieCallback(callback) {
        this.#onRateMovie = callback;
    }

    render(movies, userRatings = {}) {
        const html = movies.map(movie => {

            const userRating = userRatings[movie.id];

            const ratingBadge = userRating
                ? `<span class="badge bg-primary mb-2">
                    Sua nota: ⭐ ${userRating}
                </span>`
                : '';

            return this.replaceTemplate(this.#movieTemplate, {
                id: movie.id,
                title: movie.title,
                genre: movie.genre,
                releaseYear: movie.releaseYear,
                averageRating: movie.averageRating
                    ? movie.averageRating.toFixed(1)
                    : 0,
                ratingsCount: movie.ratingsCount,
                userRatingBadge: ratingBadge,
                ratedClass: userRating ? 'border-primary border-2' : ''
            });

        }).join('');

        this.#movieList.innerHTML = html;

        this.attachRatingListeners();
    }

    renderRecommendations(recommendations, movies, user) {
        const titleElement = document.querySelector('#recommendationTitle');

        if (user && user.name) {
            titleElement.innerText = `Recomendações para ${user.name}`;
        }

        // exibe apenas 4 recomendações
        const html = recommendations.slice(0, 4).map(recommendation => {
            const movie = movies.find(m => m.id === recommendation.id);

            console.log('movie: ', movie)

            return this.replaceTemplate(this.#recommendationTemplate, {
                id: movie.id,
                title: movie.title,
                genre: movie.genre,
                releaseYear: movie.releaseYear,
                averageRating: movie.averageRating
                    ? movie.averageRating.toFixed(1)
                    : 0,
                ratingsCount: movie.ratingsCount,
                score: (recommendation.score * 100).toFixed(1)
            });

        }).join('');

        this.#recommendationList.innerHTML = html;
    }

    setButtonsState(disabled) {
        this.#ratingSelects = document.querySelectorAll('.rating-select');

        this.#ratingSelects.forEach(select => {
            select.disabled = disabled;
        });
    }

    attachRatingListeners() {
        this.#ratingSelects = document.querySelectorAll('.rating-select');

        this.#ratingSelects.forEach(select => {
            select.addEventListener('change', (event) => {
                if (!this.#onRateMovie) return;

                const movieId = Number(select.dataset.movieId);
                const rating = Number(select.value);

                if (!rating) return;

                this.#onRateMovie(movieId, rating, select);
            });
        });
    }
}
