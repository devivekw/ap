//dueDate can be made use of during submission in terms of alerting the user

import Vue from 'vue'
import Vuex from 'vuex'
const fb = require('./firebaseConfig.js')

Vue.use(Vuex)

fb.auth.onAuthStateChanged(user => {
    if (user) {
        store.commit('setCurrentUser', user)
        store.dispatch('fetchUserProfile')
        store.dispatch('fetchUserRoles')
        store.dispatch('fetchMaintStat')

    }
})

export const store = new Vuex.Store({
    state: {
        currentUser: null,
        userProfile: {},
        promise: null,
        rolePromise: null,
        admin: false,
        teacher: false,
        popup: false
    },
    actions: {
        fetchMaintStat({ commit, state }) {
            fb.db.collection('misc').doc('maint').get().then(doc => {
                commit('setPopup', doc.data().show)
            })
        },
        fetchUserRoles({ commit, state }) {
            state.rolePromise = state.currentUser
                .getIdTokenResult()
                .then(idTokenResult => {
                    if (idTokenResult.claims.admin) {
                        commit('setAdminRole', true)
                    }
                    if (idTokenResult.claims.teacher) {
                        commit('setTeacherRole', true)
                    }
                })
                .catch(err => {
                    console.log(err);
                })
        },
        clearData({ commit, state }) {
            commit('setCurrentUser', null)
            commit('setUserProfile', {})
            commit('setTeacherRole', false)
            commit('setAdminRole', false)
            commit('setPopup', false)
        },
        fetchUserProfile({ commit, state }) {
            state.promise = fb.usersCollection.doc(state.currentUser.uid).get().then(res => {
                commit('setUserProfile', res.data())
            }).catch(err => {
                console.log(err)
            })
        }
    },
    mutations: {
        setCurrentUser(state, val) {
            state.currentUser = val
        },
        setUserProfile(state, val) {
            state.userProfile = val
        },
        setTeacherRole(state, val) {
            state.teacher = val
        },
        setAdminRole(state, val) {
            state.admin = val
        },
        setPopup(state, val) {
            state.popup = val
        }
    }
})