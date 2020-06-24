import Vue from 'vue'
import Router from 'vue-router'
import firebase from 'firebase'

import Login from '@/components/Login'
import Assignment from '@/components/Assignment Upload'
import List from '@/components/Assignment List'


import Home from '@/components/Home'
import Chat from '@/components/Chat'
import Class from '@/components/Classroom'
import Reports from '@/components/Reports'
import Resource from '@/components/Resource'
import Gallery from '@/components/Gallery'
import Admin from '@/components/Admin'
import Test from '@/components/Test'
import Profile from '@/components/Profile'

Vue.use(Router)

const router = new Router({
    mode: 'history',
    routes: [
        {
            path: '*',
            redirect: '/home'
        },
        {
            path: '/profile',
            component:Profile,
            name: 'Profile',
            meta: {
                requiresAuth: true
            }
        },
        {
            path: '/test',
            component: Test
        },
        {
            path: '/classroom/:class',
            name: 'Classroom',
            component: Class,
            meta: {
                requiresAuth: true
            }
        },
        {
            path: '/admin',
            name: 'Admin Tools',
            component: Admin,
            meta: {
                requiresAuth:true
            }
        },
        {
            path: '/classroom/:class/assignments',
            name: 'Assignment List',
            component: List,
            meta: {
                requiresAuth: true
            }
        },
        {
            path: '/classroom/:class/resources',
            name: 'Resources',
            component: Resource,
            meta: {
                requiresAuth: true
            }
        },
        {
            path: '/reports',
            name: 'Reports',
            component: Reports,
            meta: {
                requiresAuth: true
            }
        },
        {
            path: '/chat',
            name: 'Chat',
            component: Chat,
            meta: {
                requiresAuth: true
            }
        },
        {
            path: '/gallery',
            name: 'Gallery',
            component: Gallery,
            meta: {
                requiresAuth: true
            }
        },
        {
            path: '/home',
            name: 'Home',
            component: Home,
            meta: {
                requiresAuth: true
            }
        },
        {
            path: '/login',
            name: 'Login',
            component: Login
        },
        {
            path: '/assignments',
            name: 'Assignments',
            component: Assignment,
            meta: {
                requiresAuth: true
            }
        }
    ]
})

router.beforeEach((to, from, next) => {
    
    const requiresAuth = to.matched.some(x => x.meta.requiresAuth)
    const currentUser = firebase.auth().currentUser

    if (requiresAuth && !currentUser) {
        next('/login')
    } else if (requiresAuth && currentUser) {
        next()
    } else if (!requiresAuth && currentUser) {
        next('/home')
    } else {
        next()
    }
})

export default router
