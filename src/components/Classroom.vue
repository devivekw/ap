<template>
    <div style="padding:30px" id="classroom">
        <b-overlay :show="process" no-wrap>
            <template v-slot:overlay>
                <img
                    src="../assets/images/logo anim.svg"
                    width="100px"
                    height="100px"
                    style="position:relative;top:-70px"
                />
            </template>
        </b-overlay>
        <b-overlay :show="confirm" no-wrap id="confirmComplete" fixed>
            <template v-slot:overlay>
                <div class="text-center p-3" style="position:relative;top:-0px">
                    <p>
                        <strong id="form-confirm-label">Are you sure you want to delete this post?</strong>
                    </p>
                    <div class="d-flex justify-content-center">
                        <b-button
                            variant="outline-danger"
                            class="mr-3"
                            @click="confirm=false"
                        >Cancel</b-button>
                        <b-button
                            variant="outline-success"
                            class="ml-3"
                            @click="confirm=false;deletePost()"
                        >OK</b-button>
                    </div>
                </div>
            </template>
        </b-overlay>
        <b-modal v-model="modalShow" title="Rate Teacher">
            <b-form-group label="Enter your rating:">
                <b-form-rating variant="warning" v-model="rating"></b-form-rating>
            </b-form-group>
            <b-form-group label="Comments:" description="Be as descriptive as possible.">
                <b-form-textarea v-model="comments" rows="3" no-resize></b-form-textarea>
            </b-form-group>
            <template v-slot:modal-footer>
                <b-button variant="success" @click="rateTeacher()">Submit</b-button>
            </template>
        </b-modal>
        <b-modal v-model="showDeets" size="lg" title="Student Details">
            <table class="table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Parent's Email</th>
                        <th>School</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="stud in studentData" v-bind:key="stud.email">
                        <th>{{stud.name}}</th>
                        <th>{{stud.email}}</th>
                        <th>{{stud.parentEmail}}</th>
                        <th>{{stud.school}}</th>
                    </tr>
                </tbody>
            </table>
            <template v-slot:modal-footer>
                <div style="display:none"></div>
            </template>
        </b-modal>
        <b-modal v-model="showFeedbacks" size="lg" title="Student Feedbacks">
            <table class="table">
                <thead>
                    <tr>
                        <th>Student</th>
                        <th>Rating</th>
                        <th>Comments</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="feedback in feedbacks" v-bind:key="feedback.comments">
                        <th>{{feedback.student}}</th>
                        <th>{{feedback.rating}}</th>
                        <th>{{feedback.comments}}</th>
                    </tr>
                </tbody>
            </table>
            <template v-slot:modal-footer>
                <div style="display:none"></div>
            </template>
        </b-modal>
        <div v-if="noAuth">You are not authorised to view this page.</div>
        <div v-else style="display:flex;flex-direction:column">
            <div style="display:flex;justify-content:space-between">
                <h4>{{ $route.params.class }}</h4>
                <div>
                    <b-button
                        size="sm"
                        variant="outline-dark"
                        :to="{name:'Assignment List'}"
                    >Assignments</b-button>
                    <b-button
                        size="sm"
                        variant="outline-dark"
                        class="ml-2"
                        :to="{name:'Resources'}"
                    >Resources</b-button>
                    <b-button
                        v-if="teacher"
                        size="sm"
                        class="ml-2"
                        variant="outline-dark"
                        @click="studentDeets()"
                    >Student Details</b-button>
                    <b-button
                        v-if="teacher"
                        size="sm"
                        class="ml-2"
                        variant="outline-dark"
                        @click="studentFeedbacks()"
                    >Student Feedbacks</b-button>
                </div>
            </div>
            <div>
                <br />
                <b-row>
                    <b-col class="col-5" v-if="classDeets.teachers.includes(userProfile.email)">
                        <b-card title="Add Post">
                            <!-- <div class="editor">
                                <editor-menu-bar :editor="editor" v-slot="{ commands, isActive }">
                                    <div class="menubar">
                                        <button
                                            class="menubar__button"
                                            :class="{ 'is-active': isActive.bold() }"
                                            @click="commands.bold"
                                        >
                                            <b-icon-type-bold></b-icon-type-bold>
                                        </button>

                                        <button
                                            class="menubar__button"
                                            :class="{ 'is-active': isActive.italic() }"
                                            @click="commands.italic"
                                        >
                                            <b-icon-type-italic></b-icon-type-italic>
                                        </button>
                                        <button
                                            class="menubar__button"
                                            :class="{ 'is-active': isActive.underline() }"
                                            @click="commands.underline"
                                        >
                                            <b-icon-type-underline></b-icon-type-underline>
                                        </button>
                                        <button
                                            class="menubar__button"
                                            :class="{ 'is-active': isActive.paragraph() }"
                                            @click="commands.paragraph"
                                        >
                                            <b-icon-card-text></b-icon-card-text>
                                        </button>

                                        <button
                                            class="menubar__button"
                                            :class="{ 'is-active': isActive.heading({ level: 1 }) }"
                                            @click="commands.heading({ level: 1 })"
                                        >
                                            <b-icon-type-h1></b-icon-type-h1>
                                        </button>

                                        <button
                                            class="menubar__button"
                                            :class="{ 'is-active': isActive.heading({ level: 2 }) }"
                                            @click="commands.heading({ level: 2 })"
                                        >
                                            <b-icon-type-h2></b-icon-type-h2>
                                        </button>

                                        <button
                                            class="menubar__button"
                                            :class="{ 'is-active': isActive.heading({ level: 3 }) }"
                                            @click="commands.heading({ level: 3 })"
                                        >
                                            <b-icon-type-h3></b-icon-type-h3>
                                        </button>

                                        <button
                                            class="menubar__button"
                                            :class="{ 'is-active': isActive.bullet_list() }"
                                            @click="commands.bullet_list"
                                        >
                                            <b-icon-list-ul></b-icon-list-ul>
                                        </button>

                                        <button
                                            class="menubar__button"
                                            :class="{ 'is-active': isActive.ordered_list() }"
                                            @click="commands.ordered_list"
                                        >
                                            <b-icon-list-ol></b-icon-list-ol>
                                        </button>
                                        <button class="menubar__button" @click="commands.undo">
                                            <b-icon-arrow-counterclockwise></b-icon-arrow-counterclockwise>
                                        </button>

                                        <button class="menubar__button" @click="commands.redo">
                                            <b-icon-arrow-clockwise></b-icon-arrow-clockwise>
                                        </button>
                                    </div>
                                </editor-menu-bar>
                                <editor-menu-bubble
                                    class="menububble"
                                    :editor="editor"
                                    @hide="hideLinkMenu"
                                    v-slot="{ commands, isActive, getMarkAttrs, menu }"
                                >
                                    <div
                                        class="menububble"
                                        :class="{ 'is-active': menu.isActive }"
                                        :style="`left: ${menu.left}px; bottom: ${menu.bottom}px;`"
                                    >
                                        <form
                                            class="menububble__form"
                                            v-if="linkMenuIsActive"
                                            @submit.prevent="setLinkUrl(commands.link, linkUrl)"
                                        >
                                            <input
                                                class="menububble__input"
                                                type="text"
                                                v-model="linkUrl"
                                                placeholder="https://"
                                                ref="linkInput"
                                                @keydown.esc="hideLinkMenu"
                                            />
                                            <button
                                                class="menububble__button"
                                                @click="setLinkUrl(commands.link, null)"
                                                type="button"
                                            >
                                                <b-icon-trash scale="1.2"></b-icon-trash>
                                            </button>
                                        </form>

                                        <template v-else>
                                            <button
                                                class="menububble__button"
                                                @click="showLinkMenu(getMarkAttrs('link'))"
                                                :class="{ 'is-active': isActive.link() }"
                                            >
                                                <span>{{ isActive.link() ? 'Update Link' : 'Add Link'}}</span>
                                                <b-icon-link shift-h="5" shift-v="-4" scale="1.2"></b-icon-link>
                                            </button>
                                        </template>
                                    </div>
                                </editor-menu-bubble>
                                <editor-content
                                    class="editor__content editor-border"
                                    :editor="editor"
                                />
                            </div> -->
                            <!-- <ckeditor :editor="ckeditor" v-model="editorData"></ckeditor> -->
                            <vue-editor v-model="content"></vue-editor>
                            <b-button
                                size="sm"
                                class="float-right mt-3"
                                variant="outline-success"
                                @click="submitPost()"
                            >Submit</b-button>
                        </b-card>
                    </b-col>
                    <b-col>
                        <b-card
                            v-for="post in posts"
                            class="mb-3"
                            :key="post.text"
                            header-tag="header"
                        >
                            <template v-slot:header>
                                <div
                                    style="display:flex;justify-content:space-between;align-items:center"
                                >
                                    <div style="display:flex;flex-direction:row;align-items:center">
                                        <b-avatar
                                            :src="classDeets.userData[post.author].profilePicUrl"
                                        ></b-avatar>
                                        <div class="ml-3">
                                            <div>{{classDeets.userData[post.author].name}}</div>
                                            <div>{{post.createdAt | fromNow }}</div>
                                        </div>
                                    </div>
                                    <b-icon-x
                                        scale="1.2"
                                        v-if="teacher"
                                        @click="potDelete=post;confirm=true"
                                    ></b-icon-x>
                                </div>
                            </template>
                            <b-card-text v-html="post.text"></b-card-text>
                        </b-card>
                    </b-col>
                    <b-col class="col-3" v-if="!teacher">
                        <b-card
                            v-for="teacher in classDeets.teachers"
                            :key="teacher"
                            class="mb-3"
                            border-variant="primary"
                            header="Teacher"
                            header-bg-variant="primary"
                            header-text-variant="white"
                            align="center"
                        >
                            <div
                                style="display:flex;flex-direction:row;align-items:center;justify-content:space-around"
                            >
                                <b-avatar
                                    size="3rem"
                                    :src="classDeets.userData[teacher].profilePicUrl"
                                ></b-avatar>
                                <div
                                    class="ml-3"
                                    style="display:flex;flex-direction:column;font-size:9pt;align-text:center"
                                >
                                    <div>{{classDeets.userData[teacher].name}}</div>
                                    <div>{{ teacher }}</div>
                                    <div
                                        @click="teacherSel=teacher;modalShow = !modalShow"
                                        style="color:blue;cursor:pointer"
                                    >Rate Teacher</div>
                                </div>
                            </div>
                        </b-card>
                    </b-col>
                </b-row>
            </div>
        </div>
    </div>
</template>

<script>
// TODO 2 report modal (after template work)

const fb = require("../firebaseConfig.js");
import { mapState } from "vuex";
import moment from "moment";
import { Editor, EditorContent, EditorMenuBar, EditorMenuBubble } from "tiptap";
import {
    Heading,
    OrderedList,
    BulletList,
    ListItem,
    Bold,
    Italic,
    Link,
    Underline,
    History
} from "tiptap-extensions";
import { CustomLink } from './CustomLink'
import ClassicEditor from '@ckeditor/ckeditor5-build-classic'
import { VueEditor } from "vue2-editor";

export default {
    components: {
        EditorContent,
        EditorMenuBar,
        EditorMenuBubble,
        VueEditor
    },
    data() {
        return {
            modalShow: false,
            showFeedbacks: false,
            feedbacks: [],
            studentData: [],
            showDeets: false,
            teacherSel: "",
            rating: 0,
            comments: "",
            posts: [],
            process: true,
            promises: [],
            noAuth: true,
            classDeets: "",
            classId: "",
            classTeacher: false,
            html: "",
            editor: new Editor({
                extensions: [
                    new BulletList(),
                    new Heading({ levels: [1, 2, 3] }),
                    new ListItem(),
                    new OrderedList(),
                    new CustomLink(),
                    new Bold(),
                    new Italic(),
                    new Underline(),
                    new History()
                ],
                content: "",
                onUpdate: ({ getHTML }) => {
                    this.html = getHTML();
                }
            }),
            linkUrl: null,
            linkMenuIsActive: false,
            confirm: false,
            potDelete: null,
            ckeditor: ClassicEditor,
            editorData: '<p>Type something here</p>',
            content: '<p>Something</p>'
           
        };
    },
    created: async function() {
        await this.promise;
        await this.rolePromise;
        const vue = this;
        if (vue.teacher) {
            await fb.classesCollection
                .where("name", "==", vue.$route.params.class)
                .get()
                .then(querySnapshot => {
                    querySnapshot.forEach(doc => {
                        vue.noAuth = false;
                        vue.classId = doc.id;
                        vue.classDeets = doc.data();
                    });
                });
        } else {
            await fb.classesCollection
                .where("students", "array-contains", fb.auth.currentUser.email)
                .where("name", "==", vue.$route.params.class)
                .get()
                .then(querySnapshot => {
                    querySnapshot.forEach(doc => {
                        vue.noAuth = false;
                        vue.classId = doc.id;
                        vue.classDeets = doc.data();
                    });
                });
        }
        await fb.db
            .collection("classes")
            .doc(this.classId)
            .collection("posts")
            .orderBy("createdAt", "desc")
            .get()
            .then(querySnapshot => {
                querySnapshot.forEach(doc => {
                    this.posts.push(doc.data());
                });
            });
        this.process = false;
    },
    computed: {
        ...mapState([
            "admin",
            "teacher",
            "rolePromise",
            "currentUser",
            "userProfile",
            "promise"
        ])
    },
    methods: {
        showLinkMenu(attrs) {
            this.linkUrl = attrs.href;
            this.linkMenuIsActive = true;
            this.$nextTick(() => {
                this.$refs.linkInput.focus();
            });
        },
        hideLinkMenu() {
            this.linkUrl = null;
            this.linkMenuIsActive = false;
        },
        setLinkUrl(command, url) {
            command({ href: url });
            this.hideLinkMenu();
        },
        deletePost() {
            this.process = true;
            fb.db
                .collection("classes")
                .doc(this.classId)
                .collection("posts")
                .where("createdAt", "==", this.potDelete.createdAt)
                .get()
                .then(querySnapshot => {
                    querySnapshot.forEach(doc => {
                        fb.db
                            .collection("classes")
                            .doc(this.classId)
                            .collection("posts")
                            .doc(doc.id)
                            .delete()
                            .then(() => {
                                const index = this.posts.indexOf(
                                    this.potDelete
                                );
                                this.posts.splice(index, 1);
                                this.process = false;
                            });
                    });
                });
        },
        makeToast(type, msg) {
            switch (type) {
                case "err":
                    var variant = "danger";
                    var title = "Error";
                    break;
                case "suc":
                    var variant = "success";
                    var title = "Success";
                    break;
            }
            this.$bvToast.toast(msg, {
                title: title,
                variant: variant,
                solid: true
            });
        },
        studentFeedbacks() {
            if (this.feedbacks.length != 0) {
                this.showFeedbacks = true;
                return;
            }
            fb.db
                .collection("feedbacks")
                .where("teacher", "==", this.currentUser.email)
                .where("class", "==", this.$route.params.class)
                .orderBy("timestamp", "desc")
                .get()
                .then(querySnapshot => {
                    querySnapshot.forEach(doc => {
                        this.feedbacks.push(doc.data());
                    });
                })
                .then(() => {
                    this.showFeedbacks = true;
                });
        },
        studentDeets() {
            if (this.studentData.length != 0) {
                this.showDeets = true;
                return;
            }
            fb.db
                .collection("users")
                .where("classes", "array-contains", this.$route.params.class)
                .where("type", "==", "student")
                .orderBy("name")
                .get()
                .then(querySnapshot => {
                    querySnapshot.forEach(doc => {
                        this.studentData.push({
                            name: doc.data().name,
                            email: doc.data().email,
                            parentEmail: doc.data().parentEmail,
                            school: doc.data().school
                        });
                    });
                })
                .then(() => {
                    this.showDeets = true;
                });
        },
        submitPost() {
            const userEmail = fb.auth.currentUser.email;
            fb.db
                .collection("classes")
                .doc(this.classId)
                .collection("posts")
                .add({
                    text: this.content,
                    author: userEmail,
                    createdAt: fb.firebase.firestore.Timestamp.now()
                })
                .then(docRef => {
                    fb.db
                        .collection("classes")
                        .doc(this.classId)
                        .update({
                            lastUpdated: fb.firebase.firestore.Timestamp.now()
                        });
                    fb.db
                        .collection("classes")
                        .doc(this.classId)
                        .collection("posts")
                        .doc(docRef.id)
                        .get()
                        .then(doc => {
                            this.posts.unshift(doc.data());
                            this.content = '<p>Type something here...</p>'
                        });
                });
        },
        rateTeacher() {
            if (this.rating == 0) {
                this.makeToast("err", "Select a rating");
                return;
            }
            fb.db
                .collection("feedbacks")
                .add({
                    teacher: this.teacherSel,
                    student: this.currentUser.email,
                    class: this.$route.params.class,
                    rating: this.rating,
                    comments: this.comments,
                    timestamp: fb.firebase.firestore.Timestamp.now()
                })
                .then(docRef => {
                    this.makeToast("suc", "Successfully submitted rating");
                    this.modalShow = false;
                    (this.comments = ""), (this.rating = 0);
                });
        }
    },
    filters: {
        fromNow(a) {
            return moment(a.toMillis()).fromNow();
        }
    }
};
</script>