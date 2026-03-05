import { View } from './View.js';

export class UserView extends View {
    #userSelect = document.querySelector('#userSelect');
    #userAge = document.querySelector('#userAge');
    #pastRatingsList = document.querySelector('#pastRatingsList');

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