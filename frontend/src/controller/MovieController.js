export class MovieController {
    #movieView;
    #currentUser = null;
    #events;
    #movieService;
    #ratingService;

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

        const movies = await this.#movieService.getMovies();
        this.#movieView.render(movies);
        this.#movieView.setButtonsState(true); // começa desabilitado
    }

    setupEventListeners() {
        this.#events.onUserSelected((user) => {
            this.#currentUser = user;
            this.#movieView.onUserSelected(user);
            this.#events.dispatchRecommend(user);
        });

        this.#events.onRecommendationsReady(async ({ recommendations }) => {
            this.#movieView.render(recommendations);
            this.#movieView.setButtonsState(false);
        });
    }

    setupCallbacks() {
        this.#movieView.registerRateMovieCallback(
            this.handleRateMovie.bind(this)
        );
    }

    async handleRateMovie(movieId, rating, selectElement) {
        if (!this.#currentUser) return;

        try {
            await this.#ratingService.createRating(
                this.#currentUser.id,
                movieId,
                rating
            );

            // feedback visual
            selectElement.classList.add('is-valid');
            setTimeout(() => {
                selectElement.classList.remove('is-valid');
            }, 800);

            // opcional: recarregar filmes pra atualizar média
            const movies = await this.#movieService.getMovies();
            this.#movieView.render(movies);
            this.#movieView.setButtonsState(false);

        } catch (error) {
            console.error(error);
            alert('Erro ao salvar avaliação');
        }
    }
}