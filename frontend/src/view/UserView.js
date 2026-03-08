import { View } from './View.js';

export class UserView extends View {
    #userSelect = document.querySelector('#userSelect');
    #userAge = document.querySelector('#userAge');

    #onUserSelect;

    constructor() {
        super();
        this.init();
    }

    async init() {
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
            }
        });
    }

    getSelectedUserId() {
        return this.#userSelect.value
            ? Number(this.#userSelect.value)
            : null;
    }
}