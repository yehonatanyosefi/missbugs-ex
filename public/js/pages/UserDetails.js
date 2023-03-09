import { userService } from "../services/user.service.js"

export default {
    template: `
        <section class="user-details" v-if="user">
            <h5 v-if="isMyProfile">My Profile</h5>
            <pre>{{user}}</pre>    
        </section>
    `,
    data() {
        return {
            loggedInUser: userService.getLoggedInUser(),
            user: null
        }
    },
    created() {
        const { userId } = this.$route.params
        this.loadUser(userId)
    },
    computed: {
        userId() {
            return this.$route.params.userId
        },
        isMyProfile() {
            if (!this.loggedInUser) return false
            return this.loggedInUser._id === this.user._id
        }
    },
    methods: {
        loadUser(userId) {
            userService.get(userId)
                .then(user => this.user = user)
        }
    }
}