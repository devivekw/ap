<template>
    <div id="app">
        <b-overlay :show="popup && !admin" no-wrap fixed>
            <template v-slot:overlay>
                <div id="popup-close">
                    <b-icon-x scale="2" @click="popup=false"></b-icon-x>
                </div>
                <div id="popup-content">
                    <h1 id="popup-header">We&rsquo;ll be back soon!</h1>
                    <div id="popup-icon">
                        <b-icon-cone-striped scale="7" style="color:#ffa20d"></b-icon-cone-striped>
                    </div>
                    <p id="popup-body">
                        Sorry for the inconvenience but we're performing some maintenance at the moment. If you need to, you can always
                        <a href="mailto:portal@aawaaz.co">contact us</a>, otherwise we&rsquo;ll be back online shortly!
                    </p>
                    <p>&mdash; The Aawaaz Portal Team</p>
                    <div id="popup-logout">
                        <a @click="logout()">Logout</a>
                    </div>
                </div>
            </template>
        </b-overlay>
        <Navigation v-if="currentUser"></Navigation>
        <router-view />
    </div>
</template>

<script>
import "../src/assets/scss/chat.scss";
import { mapState } from "vuex";
import Navigation from "./components/Navigation.vue";
const fb = require("../src/firebaseConfig.js");

export default {
    data() {
        return {};
    },
    components: { Navigation },
    computed: {
        ...mapState(["currentUser", "popup", "admin"])
    },
    methods: {
        logout() {
            fb.auth
                .signOut()
                .then(() => {
                    this.$store.dispatch("clearData");
                    this.$router.push("/login");
                })
                .catch(err => {
                    console.log(err);
                });
        }
    }
};
</script>