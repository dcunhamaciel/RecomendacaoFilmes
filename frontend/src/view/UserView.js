import { View } from './View.js';

export class UserView extends View {
    #userSelect = document.querySelector('#userSelect');
    #userAge = document.querySelector('#userAge');
    #pastRatingsList = document.querySelector('#pastRatingsList');
    #lastRatingsTitle = document.querySelector('#lastRatingsTitle');

    #ratingTemplate;
    #onUserSelect;

    constructor() {
        super();
        this.init();
    }

    async init() {
        this.#ratingTemplate = await this.loadTemplate('./src/view/templates/past-rating.html');
        this.attachUserSelectListener();
    }

    registerUserSelectCallback(callback) {
        this.#onUserSelect = callback;
    }

    renderUserOptions(users) {
        const options = users.map(user =>
            `<option value="${user.id}">${user.name}</option>`
        ).join('');

        this.#userSelect.innerHTML += options;
    }

    renderUserDetails(user) {
        this.#userAge.value = user.age;
    }

    renderPastRatings(ratings, userName) {
        if (!this.#ratingTemplate) return;

        this.#lastRatingsTitle.innerText =
            `Últimas Avaliações - ${userName}`;

        if (!ratings || ratings.length === 0) {
            this.#pastRatingsList.innerHTML =
                '<p>Nenhuma avaliação encontrada.</p>';
            return;
        }

        const html = ratings.map(rating => {
            return this.replaceTemplate(this.#ratingTemplate, {
                movieTitle: rating.movie.title,
                rating: rating.rating,
                releaseYear: rating.movie.releaseYear
            });
        }).join('');

        this.#pastRatingsList.innerHTML = html;
    }

    attachUserSelectListener() {
        this.#userSelect.addEventListener('change', (event) => {
            const userId = event.target.value
                ? Number(event.target.value)
                : null;

            if (userId) {
                this.#onUserSelect?.(userId);
            } else {
                this.#userAge.value = '';
                this.#pastRatingsList.innerHTML = '';
            }
        });
    }

    getSelectedUserId() {
        return this.#userSelect.value
            ? Number(this.#userSelect.value)
            : null;
    }
}