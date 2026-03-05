export class UserController {
    #userView;    
    #userService;
    #ratingService;    
    #events;

    constructor({
        userView,
        userService,
        ratingService,
        events,        
    }) {
        this.#userView = userView;
        this.#userService = userService;
        this.#ratingService = ratingService;
        this.#events = events;        
    }

    static init(deps) {
        return new UserController(deps);
    }

    async renderUsers(nonTrainedUser) {
        const users = await this.#userService.getUsers();

        this.#userService.addUser(nonTrainedUser);
        const defaultAndNonTrained = [nonTrainedUser, ...users];

        this.#userView.renderUserOptions(defaultAndNonTrained);
        this.setupCallbacks();

        this.#events.dispatchUsersUpdated({ users: defaultAndNonTrained });
    }

    setupCallbacks() {
        this.#userView.registerUserSelectCallback(
            this.handleUserSelect.bind(this)
        );
    }

    async handleUserSelect(userId) {
        const user = await this.#userService.getUserById(userId);
        this.#events.dispatchUserSelected(user);

        return this.displayUserDetails(user);
    }

    async displayUserDetails(user) {
        this.#userView.renderUserDetails(user);

        const ratings = await this.#ratingService.getRatingsByUser(user.id);

        this.#userView.renderPastRatings(ratings, user.name);
    }

    getSelectedUserId() {
        return this.#userView.getSelectedUserId();
    }
}