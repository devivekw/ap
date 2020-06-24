<template>
    <header>
        <b-navbar toggleable="sm"  variant='light'>
            <b-navbar-brand to="/home">
                <img
                    src="../assets/images/logo static.svg"
                    width="31px"
                    height="31px"
                    class="d-inline-block align-top"
                    alt="Logo"
                />
                <span style="margin-left:5px">Aawaaz Portal</span>
            </b-navbar-brand>
            <div class="w-100">
                <b-nav pills class='nav-color' align="right">
                    <b-nav-item to='/home' exact exact-active-class="active">Home</b-nav-item>
                    <b-nav-item to="/admin" exact exact-active-class="active" v-if='admin'>Admin Tools</b-nav-item>
                    <b-nav-item to="/chat" exact exact-active-class="active">Chat <b-icon-chat-square scale=0.9 shift-v="1" shift-h="1"></b-icon-chat-square></b-nav-item>
                    <b-nav-item to="/assignments" exact exact-active-class="active" v-if='!teacher'>Assignments</b-nav-item>
                    <b-nav-item to="/reports" exact exact-active-class="active" v-if='!teacher'>Reports</b-nav-item>
                    <b-nav-item to="/gallery" exact exact-active-class="active" v-if='!teacher'>Gallery <b-icon-images shift-v=2 shift-h="2"></b-icon-images></b-nav-item>
                    <b-nav-dropdown text='Settings' right>
                        <b-dropdown-item to='/profile'>Change Profile Picture</b-dropdown-item>
                        <b-dropdown-divider></b-dropdown-divider>
                        <b-dropdown-item @click="logout">Logout</b-dropdown-item>
                    </b-nav-dropdown>
                </b-nav>
            </div>

            <!--
            <b-navbar-toggle target="nav-text-collapse"></b-navbar-toggle>
            <b-collapse id="nav-text-collapse" is-nav>
            <b-navbar-nav>
                <b-nav-item to='/chat'>Chat </b-nav-item>
                <b-nav-item to='/assignments'>Assignments </b-nav-item>
                <b-nav-item to='/reports'>Reports </b-nav-item>
                <b-nav-item @click="logout">Logout</b-nav-item>
            </b-navbar-nav>
            </b-collapse>
            -->
        </b-navbar>
    </header>
</template>

<script>
import { mapState } from 'vuex'
const fb = require("../firebaseConfig.js");

export default {
    computed: {
        ...mapState(['teacher','admin'])
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