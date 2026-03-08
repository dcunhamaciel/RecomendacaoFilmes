export class MovieController {
    #movieView;
    #currentUser = null;
    #events;
    #movieService;
    #ratingService;
    #movies = [];

    constructor({
        movieView,
        events,
        movieService,
        ratingService
    }) {
        this.#movieView = movieView;
        this.#movieService = movieService;
        this.#ratingService = ratingService;
        this.#events = events;
        this.init();
    }

    static init(deps) {
        return new MovieController(deps);
    }

    async init() {
        this.setupCallbacks();
        this.setupEventListeners();

        // carrega filmes uma vez só
        this.#movies = await this.#movieService.getMovies();

        // render inicial sem usuário
        this.#movieView.render(this.#movies, {});
        this.#movieView.setButtonsState(true);
    }

    setupEventListeners() {
        this.#events.onUserSelected(async (user) => {
            await this.handleUserSelected(user);
        });

        this.#events.onRecommendationsReady(async ({ recommendations }) => {
            this.#movieView.renderRecommendations(
                recommendations,
                this.#movies,
                this.#currentUser
            );
        });
    }

    setupCallbacks() {
        this.#movieView.registerRateMovieCallback(
            this.handleRateMovie.bind(this)
        );
    }

    async handleUserSelected(user) {
        this.#currentUser = user;

        this.#movieView.onUserSelected(user);

        const userRatingsMap = await this.#buildUserRatingsMap();

        this.#movieView.render(this.#movies, userRatingsMap);

        this.#events.dispatchRecommend(user);
    }

    async handleRateMovie(movieId, rating, selectElement) {
        if (!this.#currentUser) return;

        try {
            await this.#ratingService.createRating(
                this.#currentUser.id,
                movieId,
                rating
            );

            selectElement.classList.add('is-valid');
            setTimeout(() => {
                selectElement.classList.remove('is-valid');
            }, 800);

            // reconstrói mapa e re-renderiza mantendo estado
            const userRatingsMap = await this.#buildUserRatingsMap();
            this.#movieView.render(this.#movies, userRatingsMap);

        } catch (error) {
            console.error(error);
            alert('Erro ao salvar avaliação');
        }
    }

    async #buildUserRatingsMap() {
        if (!this.#currentUser) return {};

        const ratings = await this.#ratingService.getRatingsByUser(
            this.#currentUser.id
        );

        const map = {};

        ratings.forEach(r => {
            map[Number(r.movieId)] = r.rating;
        });

        return map;
    }
}