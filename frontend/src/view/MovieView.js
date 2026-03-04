import { View } from './View.js';

export class MovieView extends View {
    // DOM elements
    #movieList = document.querySelector('#movieList');

    // Templates and callbacks
    #movieTemplate;
    #ratingSelects;
    #onRateMovie;

    constructor() {
        super();
        this.init();
    }

    async init() {
        this.#movieTemplate = await this.loadTemplate('./src/view/templates/movie-card.html');
    }

    onUserSelected(user) {
        // Enable buttons if a user is selected, otherwise disable them
        this.setButtonsState(user.id ? false : true);
    }

    registerRateMovieCallback(callback) {
        this.#onRateMovie = callback;
    }

    render(movies) {
        if (!this.#movieTemplate) return;

        const html = movies.map(movie => {
            return this.replaceTemplate(this.#movieTemplate, {
                id: movie.id,
                title: movie.title,
                genre: movie.genre,
                releaseYear: movie.releaseYear,
                averageRating: movie.averageRating ? movie.averageRating.toFixed(1) : 0,
                ratingsCount: movie.ratingsCount
            });
        }).join('');

        this.#movieList.innerHTML = html;

        this.attachRatingListeners();
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
