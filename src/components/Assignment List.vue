<template>
    <div id="assignments" style="padding:30px;">
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
        <b-overlay :show="comp" no-wrap fixed>
            <template v-slot:overlay>
                <img
                    src="../assets/images/logo anim.svg"
                    width="100px"
                    height="100px"
                    style="position:relative;"
                />
            </template>
        </b-overlay>
        <b-overlay :show="confirm" no-wrap id="confirmComplete" fixed>
            <template v-slot:overlay>
                <div class="text-center p-3" style="position:relative;top:-0px">
                    <p>
                        <strong
                            id="form-confirm-label"
                        >There are still students left to submit. Are you sure?</strong>
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
                            @click="confirm=false;complete(open)"
                        >Yes</b-button>
                    </div>
                </div>
            </template>
        </b-overlay>
        <b-overlay :show="confirm2" no-wrap id="confirmDelete" fixed>
            <template v-slot:overlay>
                <div class="text-center p-3" style="position:relative;top:-0px">
                    <p>
                        <strong
                            id="form-confirm-label"
                        >Are you sure you want to delete this assignment?</strong>
                    </p>
                    <div class="d-flex justify-content-center">
                        <b-button
                            variant="outline-danger"
                            class="mr-3"
                            @click="confirm2=false"
                        >Cancel</b-button>
                        <b-button
                            variant="outline-success"
                            class="ml-3"
                            @click="confirm2=false;deleteAssignment()"
                        >Yes</b-button>
                    </div>
                </div>
            </template>
        </b-overlay>
        <b-modal centered style="display:flex;justify-content:center;align-items:center" v-model="showDesc" size="lg" :title="selAssignment.name">
            <div v-html='selAssignment.description'></div>
            <template v-slot:modal-footer>
                <div style="display:none"></div>
            </template>
        </b-modal>
        <div v-if="noAuth && !teacher">You are not authorised to view this page.</div>
        <div v-else>
            <div v-if="!formOpen">
                <b-button size="sm" variant="outline-primary" :to="{name:'Classroom'}">
                    <b-icon-arrow90deg-left></b-icon-arrow90deg-left>Back to Classroom
                </b-button>
                <h4>
                    <br />Assignments
                </h4>
                <!-- For teachers -->
                <b-button
                    size="sm"
                    variant="outline-primary"
                    class="float-right"
                    v-on:click="showAssignmentForm=true;formOpen=true"
                    v-if="teacher"
                >Create Assignment</b-button>
                <div v-if="!assignmentempty">Currently active assignments</div>
                <div v-if="!teacher">Go to 'Assignments' to submit your assignment</div>
                <div v-for="assignment in assignments" v-bind:key="assignment.name">
                    <hr />
                    <h5>{{ assignment.name }}</h5>

                    <!-- For teachers -->
                    <b-button-group size="sm" class="float-right" v-if="teacher">
                        <b-button
                            variant="info"
                            @click="getSubmissions(assignment)"
                        >View Submissions</b-button>
                        <b-button variant="primary" @click="getGrades(assignment)">Grade Submissions</b-button>
                        <b-button variant="success" @click="prepare(assignment)">Complete Assignment</b-button>
                        <b-button
                            variant="danger"
                            @click="potDelete=assignment; confirm2 = true"
                        >Delete Assignment</b-button>
                    </b-button-group>
                    <div>Due Date: {{ assignment.dueDate | timestamp }}</div>
                    <div style='color:blue; cursor:pointer' @click='selAssignment=assignment;showDesc=true'>Show description</div>
                </div>
                <p v-if="assignmentempty">No assignments available</p>
            </div>
            <b-button
                size="sm"
                variant="outline-primary"
                v-else
                @click="showAssignmentForm=false;showGradeForm=false;showSubmissions=false;formOpen=false"
            >
                <b-icon-arrow90deg-left></b-icon-arrow90deg-left>Back to Assignments
            </b-button>

            <div v-if="showAssignmentForm">
                <br />
                <b-form v-on:submit.prevent>
                    <b-form-group
                        label="Name:"
                        description="Assignment names must be unique in classroom"
                    >
                        <b-form-input id="input-1" v-model="create.name" placeholder="Enter name"></b-form-input>
                    </b-form-group>

                    <label>Description:</label>
                    <div class="editor">
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
                        <editor-content class="editor__content editor-border" :editor="editor" />
                    </div>
                    <br>
                    <label>Due Date:</label>
                    <b-form-datepicker v-model="create.dueDate"></b-form-datepicker>
                    <br />
                    <b-button type="submit" variant="success" @click='createAssignment()'>Submit</b-button>
                </b-form>
            </div>
            <div v-if="showSubmissions">
                <br />
                <h5>Submissions for {{ open.name }}</h5>
                <div v-if="submissions.length">
                    <ul>
                        <li v-for="submission in submissions" v-bind:key="submission.name">
                            <a
                                @click="getFiles(submission)"
                                style="color:#0275d8;cursor:pointer"
                            >{{submission.name}}</a>
                        </li>
                    </ul>
                    <div v-if="showFiles">
                        <b-card>
                            <ul>
                                <li v-for="file in files" v-bind:key="file.name">
                                    <a v-bind:href="file.link" target="_blank">{{ file.name }}</a>
                                </li>
                            </ul>
                        </b-card>
                    </div>
                </div>
                <p v-else>No submissions available</p>
            </div>
            <div v-if="showGradeForm">
                <br />
                <h5>Grades for {{ open.name }}</h5>
                <div v-if="gradesAvailable">
                    <b-tooltip target="grading-info-tooltip" triggers="hover">
                        <span style="color:green">Green</span> indicates submission before deadline
                        <br />
                        <span style="color:red">Red</span> indicates submission after deadline
                    </b-tooltip>
                    <br />
                    <table class="table">
                        <thead>
                            <tr>
                                <th>
                                    Name
                                    <b-icon-info-circle id="grading-info-tooltip"></b-icon-info-circle>
                                </th>
                                <th>Grade</th>
                                <th>Comments</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="grade in open.grades" v-bind:key="grade.name">
                                <th
                                    v-bind:style="open.lateToSubmit.indexOf(grade.name) != -1 ? 'color:red' : 'color:green'"
                                >
                                    <span
                                        :title="grade.student"
                                    >{{ classDeets.userData[grade.student].name }}</span>
                                </th>
                                <!-- Use v-model.number to pass value as number -->
                                <th style="width:200px">
                                    <b-form-input v-model="grade.grade" placeholder="Enter grade"></b-form-input>
                                </th>
                                <th>
                                    <b-textarea v-model="grade.comments" rows="1" no-resize></b-textarea>
                                </th>
                            </tr>
                        </tbody>
                    </table>
                    <b-tooltip target="tosubmit" triggers="hover">
                        <span v-html="yettosubmit"></span>
                    </b-tooltip>
                    <div v-if="!allsubmit">
                        {{open.yetToSubmit.length}}
                        <b-icon-question-circle id="tosubmit"></b-icon-question-circle>&nbsp;student(s) left to submit
                    </div>
                    <div v-else>All students have submitted</div>
                    <br />
                    <b-button variant="outline-info" @click="submitGrades">Submit</b-button>
                </div>
                <div v-else>No one has submitted!</div>
            </div>
        </div>
    </div>
</template>

<script>
// TODO 5 make createAssignment modal
import { mapState } from "vuex";
const fb = require("../firebaseConfig.js");
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
import { CustomLink } from "./CustomLink";

export default {
    components: {
        EditorContent,
        EditorMenuBar,
        EditorMenuBubble
    },
    data() {
        return {
            showFiles: false,
            files: [],
            noAuth: true,
            comp: false,
            yettosubmit: "",
            allsubmit: false,
            assignmentempty: true,
            confirm: false,
            promises: [],
            process: true,
            formOpen: false,
            gradesAvailable: false,
            showAssignmentForm: false,
            showGradeForm: false,
            showSubmissions: false,
            classDeets: {},
            assignments: [],
            completedAssignments: [],
            create: {
                name: "",
                dueDate: "",
                desc: ""
            },
            open: {},
            submissions: [],
            confirm2: false,
            potDelete: null,
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
                    this.create.desc = getHTML();
                }
            }),
            linkUrl: null,
            linkMenuIsActive: false,
            showDesc:false,
            selAssignment: {name: '', description: ''}
        };
    },
    computed: {
        ...mapState(["teacher", "admin", "rolePromise"])
    },
    created: async function() {
        await this.rolePromise;
        this.getClassDeets();
        Promise.all(this.promises).then(() => {
            if (this.noAuth) {
                this.process = false;
                return;
            }
            this.getAssignments();
            Promise.all(this.promises).then(() => {
                if (this.assignments.length) {
                    this.assignmentempty = false;
                }
                this.process = false;
            });
        });
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
        deleteAssignment() {
            fb.db
                .collection("assignments")
                .where("class", "==", this.classDeets.name)
                .where("name", "==", this.potDelete.name)
                .get()
                .then(querySnapshot => {
                    querySnapshot.forEach(doc => {
                        fb.db
                            .collection("assignments")
                            .doc(doc.id)
                            .delete()
                            .then(() => {
                                const index = this.assignments.indexOf(
                                    this.potDelete
                                );
                                this.assignments.splice(index, 1);
                            });
                    });
                });
        },
        getAssignments() {
            const vue = this;
            vue.promises.push(
                fb.assignmentsCollection
                    .where("class", "==", vue.$route.params.class)
                    .orderBy("dueDate")
                    .get()
                    .then(function(querySnapshot) {
                        querySnapshot.forEach(function(doc) {
                            if (!doc.data().completed) {
                                vue.assignments.push(doc.data());
                            } else {
                                vue.completedAssignments.push(doc.data().name);
                            }
                        });
                    })
            );
        },
        getClassDeets() {
            const vue = this;
            if (vue.teacher) {
                vue.promises.push(
                    fb.classesCollection
                        .where("name", "==", vue.$route.params.class)
                        .get()
                        .then(querySnapshot => {
                            querySnapshot.forEach(doc => {
                                vue.noAuth = false;
                                vue.classDeets = doc.data();
                            });
                        })
                );
            } else {
                vue.promises.push(
                    fb.classesCollection
                        .where(
                            "students",
                            "array-contains",
                            fb.auth.currentUser.email
                        )
                        .where("name", "==", vue.$route.params.class)
                        .get()
                        .then(querySnapshot => {
                            querySnapshot.forEach(doc => {
                                vue.noAuth = false;
                                vue.classDeets = doc.data();
                            });
                        })
                );
            }
        },
        createAssignment() {
            const vue = this;
            if (vue.create.name == "") {
                vue.makeToast("err", "Empty name field");
                return;
            } else if (vue.create.desc == "") {
                vue.makeToast("err", "Empty description field");
                return;
            } else if (isNaN(Date.parse(vue.create.dueDate))) {
                vue.makeToast("err", "Invalid date format");
                return;
            } else if (
                Date.parse(new Date()) >
                Date.parse(vue.create.dueDate) - 19800000
            ) {
                vue.makeToast("err", "Invalid date");
                return;
            }
            const index = vue.completedAssignments.indexOf(vue.create.name);
            if (index != -1) {
                vue.makeToast("err", "Assignment name taken");
                return;
            }
            const newAssignment = {
                name: vue.create.name,
                description: vue.create.desc,
                dueDate: fb.firebase.firestore.Timestamp.fromMillis(
                    Date.parse(vue.create.dueDate) - 19800000
                ),
                yetToSubmit: vue.classDeets.students,
                lateToSubmit: [],
                grades: [],
                completed: false,
                class: vue.classDeets.name,
                timestamp: fb.firebase.firestore.Timestamp.now()
            };
            vue.promises = [];
            vue.process = true;
            vue.promises.push(fb.assignmentsCollection.add(newAssignment));
            Promise.all(vue.promises).then(() => {
                vue.makeToast("suc", "Assignment created successfully");
                vue.create.name = "";
                vue.create.dueDate = "";
                vue.create.desc = "";
                vue.assignmentempty = false;
                vue.showAssignmentForm = false;
                vue.assignments.push(newAssignment);
                vue.formOpen = false;
                vue.process = false;
            });
        },
        getSubmissions(a) {
            this.open = a;
            this.process = true;
            const vue = this;
            const refPath =
                this.$route.params.class + "/assignments/" + a.name + "/";
            const ref = fb.storageRef.child(refPath);
            vue.promises = [];
            vue.submissions = [];
            const p = ref.listAll().then(res => {
                res.prefixes.forEach(item => {
                    const submission = {
                        name: item.name,
                        location: item.location
                    };
                    vue.submissions.push(submission);
                });
            });
            vue.promises.push(p);
            Promise.all(vue.promises).then(() => {
                this.formOpen = true;
                this.showSubmissions = true;
                this.process = false;
            });
        },
        getFiles(a) {
            const vue = this;
            this.process = true;
            this.files = [];
            vue.promises = [];
            const filesRef = fb.storageRef.child(a.location.path);
            filesRef.listAll().then(res => {
                res.items.forEach(itemRef => {
                    const p = new Promise(resolve => {
                        fb.storageRef
                            .child(itemRef.fullPath)
                            .getDownloadURL()
                            .then(url => {
                                fb.storageRef
                                    .child(itemRef.fullPath)
                                    .getMetadata()
                                    .then(metadata => {
                                        const file = {
                                            name: itemRef.name,
                                            link: url,
                                            timeCreated: metadata.timeCreated
                                        };

                                        vue.files.push(file);
                                        resolve();
                                    });
                            });
                    });
                    vue.promises.push(p);
                    Promise.all(vue.promises).then(() => {
                        vue.files.sort(function(a, b) {
                            return -(
                                Date.parse(a.timeCreated) -
                                Date.parse(b.timeCreated)
                            );
                        });
                        vue.showFiles = true;
                        vue.process = false;
                    });
                });
            });
        },
        getGrades(a) {
            this.open = a;
            if (a.yetToSubmit.length) {
                this.allsubmit = false;
            } else {
                this.allsubmit = true;
            }
            this.yettosubmit = "";
            a.yetToSubmit.forEach((item, index) => {
                if (index == a.yetToSubmit.length - 1) {
                    this.yettosubmit += this.classDeets.userData[item].name;
                } else {
                    this.yettosubmit +=
                        this.classDeets.userData[item].name + "<br>";
                }
            });
            if (a.grades.length) {
                this.gradesAvailable = true;
            } else {
                this.gradesAvailable = false;
            }
            this.formOpen = true;
            this.showGradeForm = true;
        },
        submitGrades() {
            var updateId;
            const vue = this;
            vue.process = true;
            fb.assignmentsCollection
                .where("name", "==", vue.open.name)
                .get()
                .then(querySnapshot => {
                    querySnapshot.forEach(doc => {
                        updateId = doc.id;
                    });
                })
                .then(() => {
                    fb.assignmentsCollection
                        .doc(updateId)
                        .set(vue.open)
                        .then(() => {
                            vue.process = false;
                            vue.showGradeForm = false;
                            vue.makeToast("suc", "Grades updated successfully");
                            vue.formOpen = false;
                        });
                });
        },
        prepare(a) {
            const vue = this;
            var ungrade = false;
            if (Date.parse(new Date()) < a.dueDate.toMillis()) {
                vue.makeToast("err", "There is still time left for submission");
                return;
            }
            a.grades.forEach(item => {
                if (item.grade == -1) {
                    ungrade = true;
                    return;
                }
            });
            if (ungrade) {
                vue.makeToast("err", "There are ungraded assignments");
                return;
            }
            if (a.yetToSubmit.length) {
                vue.open = a;
                vue.confirm = true;
                return;
            }
            vue.complete(a);
        },
        complete(a) {
            const vue = this;
            var updateId;
            vue.comp = true;
            var promisesB = [];
            const reports = a.grades;
            a.yetToSubmit.forEach(item => {
                const grade = { student: item, grade: "NS", comments: "" };
                reports.push(grade);
            });
            reports.forEach(item => {
                promisesB.push(
                    fb.db
                        .collection("reports")
                        .add({
                            type: "assignment",
                            name: a.name,
                            class: vue.$route.params.class,
                            student: item.student,
                            grade: item.grade,
                            comments: item.comments,
                            timestamp: fb.firebase.firestore.Timestamp.now()
                        })
                        .then(docRef => {
                            fb.db
                                .collection("reports")
                                .doc(docRef.id)
                                .get()
                                .then(doc => {
                                    promisesB.push(
                                        fb.db
                                            .collection("reportReceipts")
                                            .doc(doc.id)
                                            .set({
                                                read: false,
                                                student: item.student
                                            })
                                    );
                                });
                        })
                );
            });
            Promise.all(promisesB).then(() => {
                fb.assignmentsCollection
                    .where("name", "==", a.name)
                    .get()
                    .then(querySnapshot => {
                        querySnapshot.forEach(doc => {
                            updateId = doc.id;
                        });
                    })
                    .then(() => {
                        fb.assignmentsCollection
                            .doc(updateId)
                            .update({
                                completed: true
                            })
                            .then(() => {
                                const index = vue.assignments.indexOf(a);
                                vue.assignments.splice(index, 1);
                                vue.comp = false;
                                vue.makeToast(
                                    "suc",
                                    "Assignment completed successfully"
                                );
                            });
                    });
            });
        }
    },
    filters: {
        timestamp(a) {
            return a
                .toDate()
                .toString()
                .slice(0, 15);
        }
    }
};
</script>

