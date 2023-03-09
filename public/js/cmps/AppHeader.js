'use strict'
import { userService } from "../services/user.service.js"
import LoginSignup from './LoginSignup.js'
import { loadBugs } from "../services/event-bus.service.js"

export default {
    template: `
        <header>
            <h1>Miss Bug</h1>    
        </header>
            <hr />
            <section v-if="loggedInUser">
                <RouterLink :to="'/user/' + loggedInUser._id">
                    {{ loggedInUser.fullName }}
                </RouterLink>
                <button @click="logout">Logout</button>
            </section>
            <section v-else>
                <LoginSignup @onChangeLoginStatus="changeLoginStatus" />
            </section>
    `,
    data() {
        return {
            loggedInUser: userService.getLoggedInUser()
        }
    },
    methods: {
        changeLoginStatus() {
            this.loggedInUser = userService.getLoggedInUser()
            loadBugs()
        },
        logout() {
            userService.logout()
                .then(() => {
                    this.loggedInUser = null
                    loadBugs()
                })
        },
    },
    components: {
        LoginSignup
    },
}
