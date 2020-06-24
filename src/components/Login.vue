<template>
    <!--Why are we using the trim modifier? Got to try that out.-->
    <div id="login" style>
        <b-overlay :show="performingRequest" no-wrap>
            <template v-slot:overlay>
                <img
                    src="../assets/images/logo anim.svg"
                    width="100px"
                    height="100px"
                    style="position:relative;top:-15px"
                />
            </template>
        </b-overlay>
        <b-overlay id="error" :show="errorMsg !== ''" no-wrap>
            <template v-slot:overlay>
                <p>{{errorMsg}}</p>
                <div class='d-flex justify-content-center'> <b-button  variant="outline-danger" @click="errorMsg=''">Close</b-button></div>
            </template>
        </b-overlay>
        <div style="display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center">
            <img
                id="logo"
                src="../assets/images/logo static.svg"
                width="200px"
                height="200px"
                style="filter: grayscale(100%)"
            />
            <br />
            <b-form v-if="showLoginForm" @submit.prevent>
                <div
                    style="display:flex;flex-direction:column;justify-content:center;align-items:center;"
                >
                    <h1>Aawaaz Portal</h1>
                </div>

                <label for="email1" class="mt-3">Email address:</label>
                <b-input
                    id="email1"
                    v-model.trim="loginForm.email"
                    type="email"
                    required
                ></b-input>
                <br />

                <label for="password1">Password:</label>
                <b-input
                    type="password"
                    id="password1"
                    v-model.trim="loginForm.password"
                    required
                ></b-input>

                <br />
                <div
                    style="display:flex;flex-direction:column;justify-content:center;align-items:center;"
                >
                    <b-button @click="login" id='login-btn'>Log In</b-button>
                    <br />
                    <b-link @click="togglePasswordReset">Forgot Password</b-link>
                    <!-- <b-link @click="toggleForm">Create an Account</b-link> -->
                </div>
            </b-form>
            <!-- <b-form v-if="!showLoginForm && !showForgotPassword" @submit.prevent>
                <div
                    style="display:flex;flex-direction:column;align-items:center;justify-content:center"
                >
                    <h1>Get Started</h1>
                </div>
                <br />

                <b-form-group label="Name:" label-for="name">
                    <b-form-input
                        id="name"
                        v-model="signupForm.name"
                        required
                    ></b-form-input>
                </b-form-group>

                <b-form-group
                    label="Email address:"
                    label-for="email2"
                    description="We'll never share your email with anyone else."
                >
                    <b-form-input
                        id="email2"
                        v-model.trim="signupForm.email"
                        type="email"
                        required
                    ></b-form-input>
                </b-form-group>

                <label for="password2">Password:</label>
                <b-input
                    type="password"
                    id="password2"
                    v-model.trim="signupForm.password"
                    required
                ></b-input>

                <br />
                <div
                    style="display:flex;flex-direction:column;align-items:center;justify-content:center"
                >
                    <b-button @click="signup">Sign Up</b-button>

                    <br />
                    <b-link @click="toggleForm">Back to Log In</b-link>
                </div>
            </b-form> -->
            <b-form v-if="showForgotPassword" @submit.prevent>
                <div v-if="!passwordResetSuccess">
                    <div
                        style="display:flex;flex-direction:column;justify-content:center;align-items:center"
                    >
                        <h1>Reset Password</h1>
                    </div>

                    <b-form-group label-for="email3" class="mt-3" label="Email address:">
                        <b-form-input
                            id="email3"
                            v-model="passwordForm.email"
                            type="email"
                            required
                            style="width:100%"
                        ></b-form-input>
                    </b-form-group>
                    <div
                        style="display:flex;flex-direction:column;justify-content:center;align-items:center"
                    >
                        <b-button @click="resetPassword">Submit</b-button>
                        <br />
                        <b-link @click="togglePasswordReset">Back to Log In</b-link>
                    </div>
                </div>
                <div v-else>
                    <h1>Email Sent</h1>
                    <p>Check your email for a link to reset your password</p>
                    <b-button @click="togglePasswordReset" class="button">Back to login</b-button>
                </div>
            </b-form>
            
        </div>
        
    </div>
</template>

<script>
import AppVue from "../App.vue";
const fb = require("../firebaseConfig.js");
const $ = require('jquery')

export default {
    data() {
        return {
            loginForm: {
                email: "",
                password: ""
            },
            signupForm: {
                name: "",
                email: null,
                password: null
            },
            passwordForm: {
                email: ""
            },
            showLoginForm: true,
            showForgotPassword: false,
            passwordResetSuccess: false,
            performingRequest: false,
            errorMsg: "",
            newUser: false
        };
    },
    mounted: function() {
        $(document).keypress(function(event) { 
            if (event.keyCode === 13) {
                $("#login-btn").click(); 
            } 
        }); 
    },
    methods: {
        togglePasswordReset() {
            if (this.showForgotPassword) {
                this.showLoginForm = true;
                this.showForgotPassword = false;
                this.passwordResetSuccess = false;
            } else {
                this.showLoginForm = false;
                this.showForgotPassword = true;
            }
        },
        login() {
            this.performingRequest = true;
            fb.auth
                .signInWithEmailAndPassword(
                    this.loginForm.email,
                    this.loginForm.password
                )
                .then(user => {
                    this.performingRequest = false;
                    this.$router.push("/");
                })
                .catch(err => {
                    console.log(err);
                    this.performingRequest = false;
                    this.errorMsg = err.message;
                });
        },
        // signup() {
        //     this.performingRequest = true;
        //     fb.auth
        //         .createUserWithEmailAndPassword(
        //             this.signupForm.email,
        //             this.signupForm.password
        //         )
        //         .then(user => {
        //             this.newUser = true;
        //             var LoginVue = this;
        //             fb.auth.onAuthStateChanged(function(user) {
        //                 if (user) {
        //                     if (LoginVue.newUser) {
        //                         fb.usersCollection
        //                             .doc(user.uid)
        //                             .set({
        //                                 name: LoginVue.signupForm.name,
        //                                 email: LoginVue.signupForm.email,
        //                                 profilePicUrl:
        //                                     "https://randomuser.me/api/portraits/lego/1.jpg",
        //                                 classes: [],
        //                                 type:'student',
        //                                 timestamp: fb.firebase.firestore.Timestamp.now()
        //                             })
        //                             .then(() => {
        //                                 LoginVue.$store.dispatch(
        //                                     "fetchUserProfile"
        //                                 );
        //                                 LoginVue.newUser = false
        //                                 LoginVue.performingRequest = false;
        //                                 LoginVue.$router.push("/");
        //                             })
        //                             .catch(err => {
        //                                 console.log(err);
        //                                 LoginVue.performingRequest = false;
        //                             });
        //                     }
        //                 }
        //             });
        //         })
        //         .catch(err => {
        //             console.log(err)
        //             this.errorMsg = err.message;
        //         });
        // },
        toggleForm() {
            this.showLoginForm = !this.showLoginForm;
        },
        resetPassword() {
            this.performingRequest = true;

            fb.auth
                .sendPasswordResetEmail(this.passwordForm.email)
                .then(() => {
                    this.performingRequest = false;
                    this.passwordResetSuccess = true;
                    this.passwordForm.email = "";
                })
                .catch(err => {
                    console.log(err);
                    this.performingRequest = false;
                    this.errorMsg = err.message;
                });
        }
    }
};
</script>