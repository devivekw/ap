// FIXME selection for class
<template>
    <div id="admin" v-if="admin">
        <b-overlay :show="upload" no-wrap>
            <template v-slot:overlay>
                <div class="text-center p-4 bg-primary text-light rounded">
                    <b-icon icon="cloud-upload" font-scale="4"></b-icon>
                    <div
                        class="mb-3"
                    >Uploading {{files[index].name}}... ({{index+1}}/{{files.length}})</div>
                    <b-progress
                        min="0"
                        max="100"
                        :value="progress"
                        variant="success"
                        height="3px"
                        class="mx-n4 rounded-0"
                    ></b-progress>
                    <b-button
                        variant="outline-light"
                        class="mt-3"
                        size="sm"
                        @click="upload=false;cancel=true"
                    >Cancel</b-button>
                </div>
            </template>
        </b-overlay>
        <b-button @click="toggleMaint()">
            <span v-if="popup">Disable</span>
            <span v-else>Enable</span> Maintenance Pop-up
        </b-button>
        <br />
        <br />
        <b-button @click="showUser = !showUser">Create Users</b-button>
        <br />
        <div v-if="showUser">
            <div v-if="!parse">
                <b-form-group
                    class="mt-3"
                    description="Only .csv file accepted"
                    label="Select file"
                >
                    <b-form-file
                        v-model="file"
                        placeholder="Choose file or drop it here..."
                        drop-placeholder="Drop file here..."
                        accept=".csv"
                    ></b-form-file>
                </b-form-group>
                <b-button variant="outline-success" @click="parseFile()">Parse</b-button>
            </div>
            <div v-else>
                <br />
                <table class="table">
                    <thead>
                        <tr>
                            <th>Email</th>
                            <th>Display Name</th>
                            <th>Type</th>
                            <th>Parent Email</th>
                            <th>School</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="user in userData" v-bind:key="user.email">
                            <th>{{ user.email }}</th>
                            <th>{{ user.name }}</th>
                            <th>{{ user.type }}</th>
                            <th>{{ user.parentEmail }}
                            <th>{{ user.school }}</th>
                        </tr>
                    </tbody>
                </table>
                <b-button variant="outline-info" @click="submitUser">Create</b-button>
            </div>
        </div>
        <br />
        <b-button @click="showAdmin = !showAdmin">Assign Admin Role</b-button>
        <br />
        <div v-if="showAdmin">
            <br />
            <label for="email1">Enter user email:</label>
            <b-input v-model.trim="adminEmail" id="email1"></b-input>
            <br />
            <b-button variant="primary" @click="showAdmin=false;assignAdmin()">Submit</b-button>
        </div>
        <!-- <br />
        <b-button @click="showTeacher = !showTeacher">Assign Teacher Role</b-button>
        <br />
        <div v-if="showTeacher">
            <br />
            <label for="email2">Enter user email:</label>
            <b-input v-model.trim="teacherEmail" id="email2"></b-input>
            <br />
            <b-button variant="primary" @click="showAdmin=false;assignTeacher()">Submit</b-button>
        </div> -->
        <br />
        <b-button @click="showClass=!showClass">Create Class</b-button>
        <br />
        <div v-if="showClass">
            <br />
            <label for="name">Enter name for class:</label>
            <b-input v-model="name" id="name"></b-input>
            <br />
            <div class="container">
                <div class="row">
                    <div class="col">
                        <b-input
                            v-model="search"
                            @change="searchFn()"
                            placeholder="Student Search (Press Enter for results)"
                        ></b-input>
                        <br />
                    </div>
                </div>
                <div class="row">
                    <div class="col">
                        All Students:
                        <br />
                    </div>
                    <div class="col">
                        Selected students:
                        <br />
                    </div>
                </div>

                <div class="row">
                    <div class="col">
                        <b-list-group>
                            <br />
                            <b-list-group-item
                                button
                                v-for="studentN in searchResults"
                                @click="selectStudent(studentN)"
                                v-bind:key="studentN.value"
                            >{{studentN.text}}</b-list-group-item>
                            <br />
                        </b-list-group>
                    </div>
                    <div class="col">
                        <b-list-group>
                            <br />
                            <b-list-group-item
                                variant="success"
                                button
                                v-for="studentSel in studentSelected"
                                @click="removeStudent(studentSel)"
                                v-bind:key="studentSel.value"
                            >{{studentSel.text}}</b-list-group-item>
                            <br />
                        </b-list-group>
                    </div>
                </div>
                <div class="row">
                    <div class="col">
                        <b-input
                            v-model="search2"
                            @change="searchFn2()"
                            placeholder="Teacher Search (Press Enter for results)"
                        ></b-input>
                        <br />
                    </div>
                </div>
                <div class="row">
                    <div class="col">
                        All Teachers:
                        <br />
                    </div>
                    <div class="col">
                        Selected teachers:
                        <br />
                    </div>
                </div>
                <div class="row">
                    <div class="col">
                        <b-list-group>
                            <br />
                            <b-list-group-item
                                button
                                v-for="teacherN in searchResults2"
                                @click="selectTeacher(teacherN)"
                                v-bind:key="teacherN.value"
                            >{{teacherN.text}}</b-list-group-item>
                        </b-list-group>
                    </div>
                    <div class="col">
                        <b-list-group>
                            <br />
                            <b-list-group-item
                                variant="success"
                                button
                                v-for="teacherSel in teacherSelected"
                                @click="removeTeacher(teacherSel)"
                                v-bind:key="teacherSel.value"
                            >{{teacherSel.text}}</b-list-group-item>
                        </b-list-group>
                    </div>
                </div>
            </div>
            <br />
            <b-button variant="primary" @click="create()">Submit</b-button>
        </div>
        <br />
        <b-button @click="showNew = !showNew">Add Student to Class</b-button>
        <br />
        <div v-if="showNew">
            <br />
            <label for="newStud">Enter student email:</label>
            <b-input v-model.trim="studEmail" id="newStud"></b-input>
            <br />
            <b-form-select v-model='selectedClass'>
                <b-form-select-option :value="null">Please select an option</b-form-select-option>
                <b-form-select-option v-for='selClass in classes' :key='selClass' :value='selClass'>{{selClass}}</b-form-select-option>
            </b-form-select>
            <br />
            <br />
            <b-button variant="primary" @click="showNew=false;addStud()">Submit</b-button>
        </div>
        <br />
        <b-button @click="showAnn=!showAnn">Manage Announcements</b-button>
        <br />
        <div v-if="showAnn">
            <br />
            <b-button variant="primary" @click="showAnnForm=!showAnnForm">Add announcement</b-button>
            <div v-if="showAnnForm">
                <br />
                <b-form-input v-model="annText" placeholder="Enter announcement text"></b-form-input>
                <br />
                <b-form-checkbox
                    v-model="annShow"
                    value="true"
                    unchecked-value="false"
                >Show announcement</b-form-checkbox>
                <br />
                <b-button variant="success" @click="addAnn()">Submit</b-button>
            </div>
            <br />
            <br />
            <table class="table">
                <thead>
                    <tr>
                        <th>Announcement</th>
                        <th>Visibility</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="announcement in announcements" v-bind:key="announcement.text">
                        <th>{{announcement.text}}</th>
                        <th>
                            <b-form-checkbox
                                v-model="announcement.show"
                                @change="toggleShow(announcement)"
                            ></b-form-checkbox>
                        </th>
                        <th>
                            <b-button
                                variant="outline-danger"
                                size="sm"
                                @click="deleteAnn(announcement)"
                            >Delete</b-button>
                        </th>
                    </tr>
                </tbody>
            </table>
        </div>
        <br />
        <b-button @click="showUpload = !showUpload">Upload Images to Student Gallery</b-button>
        <br />
        <div v-if="showUpload">
            <br />
            <label for="email3">Enter student email:</label>
            <b-input v-model.trim="studentEmail" id="email3"></b-input>

            <b-form-group
                class="mt-3"
                description="Upload of multiple files possible."
                label="Select file(s)"
            >
                <b-form-file
                    v-model="files"
                    placeholder="Choose files or drop them here..."
                    drop-placeholder="Drop files here..."
                    multiple
                    :file-name-formatter="formatNames"
                ></b-form-file>
            </b-form-group>
            <b-button variant="outline-info" @click="uploadF">Upload</b-button>
        </div>
        <br />
        <b-button @click="openClasses = !openClasses">Show Classes</b-button>
        <br />
        <div v-if='openClasses'>
            <br>
            <b-list-group>
                <b-list-group-item
                    v-for="classroom in classes"
                    v-bind:key="classroom"
                    :to="/classroom/+classroom"
                >{{ classroom }}</b-list-group-item>
            </b-list-group>
        </div>
        <br />
        <b-button @click="showFeedbacks = !showFeedbacks">View Student Feedbacks</b-button>
        <br />
        <div v-if='showFeedbacks'>
            <br>
            <table class='table'>
                <thead>
                    <tr>
                        <th> Student </th>
                        <th> Class </th>
                        <th> Teacher </th>
                        <th> Rating </th>
                        <th> Comments </th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for='feedback in feedbacks' v-bind:key='feedback.comments'>
                        <th> {{ feedback.student }} </th>
                        <th> {{ feedback.class }}</th>
                        <th>{{ feedback.teacher }}</th>
                        <th> {{ feedback.rating}}</th>
                        <th>{{ feedback.comments}}</th>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
    <div v-else style="padding:30px">You are not authorized to view this page!</div>
</template>

<script>
import { mapState } from "vuex";
const fb = require("../firebaseConfig.js");
const papa = require("papaparse");

const grantRole = fb.functions.httpsCallable("addRole");
const classCreate = fb.functions.httpsCallable("initClass");
const createUser = fb.functions.httpsCallable("createUser");
const addStudent = fb.functions.httpsCallable('addStudent')

export default {
    computed: {
        ...mapState(["admin", "popup"])
    },
    methods: {
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
                case "war":
                    var variant = "warning";
                    var title = "Check Logs";
            }
            this.$bvToast.toast(msg, {
                title: title,
                variant: variant,
                solid: true
            });
        },
        addStud() {
            addStudent({class:this.selectedClass,email:this.studEmail}).then(res => {
                console.log(res.data)
                this.selectedClass=''
                this.studEmail=''
                this.makeToast('war','Process complete. Check logs for information.')
            })
        },
        formatNames(files) {
            if (files.length === 1) {
                return files[0].name;
            } else {
                return `${files.length} files selected`;
            }
        },
        parseFile() {
            if (!this.file) {
                this.makeToast("err", "Select a file");
                return;
            }
            papa.parse(this.file, {
                header: true,
                skipEmptyLines: true,
                complete: results => {
                    this.userData = results.data;
                }
            });
            this.parse = true;
        },
        submitUser() {
            let promises = [];
            this.userData.forEach(item => {
                const userQuery = fb.usersCollection.where(
                    "email",
                    "==",
                    item.email
                );
                userQuery.get().then(querySnapshot => {
                    if (querySnapshot.empty) {
                        promises.push(
                            createUser(item).then(result => {
                                console.log(result.data);
                            })
                        );
                    }
                    else {
                        this.makeToast('err',`User ${item.email} already exists`)
                    }
                });
            });
            Promise.all(promises).then(() => {
                this.makeToast('war','Process complete. Check logs for details.')
                this.userData = [];
                this.file = null;
                this.parse = false;
            });
        },
        addAnn() {
            fb.db
                .collection("announcements")
                .add({
                    text: this.annText,
                    show: this.annShow,
                    timestamp: fb.firebase.firestore.Timestamp.now()
                })
                .then(docRef => {
                    fb.db
                        .collection("announcements")
                        .doc(docRef.id)
                        .get()
                        .then(doc => {
                            this.announcements.push(doc.data());
                            this.annText = "";
                            this.annShow = false;
                        });
                });
        },
        toggleShow(a) {
            fb.db
                .collection("announcements")
                .where("text", "==", a.text)
                .get()
                .then(querySnapshot => {
                    querySnapshot.forEach(doc => {
                        fb.db
                            .collection("announcements")
                            .doc(doc.id)
                            .update({
                                show: a.show
                            });
                    });
                });
        },
        deleteAnn(a) {
            fb.db
                .collection("announcements")
                .where("text", "==", a.text)
                .get()
                .then(querySnapshot => {
                    querySnapshot.forEach(doc => {
                        fb.db
                            .collection("announcements")
                            .doc(doc.id)
                            .delete()
                            .then(() => {
                                const index = this.announcements.indexOf(a);
                                this.announcements.splice(index, 1);
                            });
                    });
                });
        },
        assignAdmin() {
            grantRole({ email: this.adminEmail, role: "admin" }).then(
                result => {
                    console.log(result.data);
                }
            );
        },
        assignTeacher() {
            grantRole({ email: this.teacherEmail, role: "teacher" }).then(
                result => {
                    console.log(result.data);
                }
            );
        },
        selectStudent(s) {
            this.studentSelected.push(s);
            const index = this.searchResults.indexOf(s);
            this.searchResults.splice(index, 1);
        },
        removeStudent(s) {
            this.searchResults.push(s);
            const index = this.studentSelected.indexOf(s);
            this.studentSelected.splice(index, 1);
        },
        selectTeacher(t) {
            this.teacherSelected.push(t);
            const index = this.searchResults2.indexOf(t);
            this.searchResults2.splice(index, 1);
        },
        removeTeacher(t) {
            this.searchResults2.push(t);
            const index = this.teacherSelected.indexOf(t);
            this.teacherSelected.splice(index, 1);
        },
        create() {
            const teachers = [];
            const students = [];
            if (this.name == '') {
                this.makeToast('err','Enter name for class')
                return
            }
            this.teacherSelected.forEach(item => {
                teachers.push(item.option);
            });
            this.studentSelected.forEach(item => {
                students.push(item.option);
            });
            classCreate({
                name: this.name,
                students: students,
                teachers: teachers
            }).then(result => {
                console.log(result.data);
                this.makeToast('war','Process complete. Check logs for result.')
                this.studentSelected = []
                this.teacherSelected = []
                this.search = ''
                this.searchFn()
                this.search2 = ''
                this.searchFn2()
                this.name = ''
            });
        },
        searchFn() {
            this.searchResults = [];
            this.studentOptions.forEach(item => {
                if (item.text.includes(this.search) && !(this.studentSelected.includes(item))) {
                    this.searchResults.push(item);
                }
            });
        },
        searchFn2() {
            this.searchResults2 = [];
            this.teacherOptions.forEach(item => {
                if (item.text.includes(this.search2) && !(this.teacherSelected.includes(item))) {
                    this.searchResults2.push(item);
                }
            });
        },
        uploadF() {
            const vue = this;
            if (!vue.files.length) {
                vue.makeToast("err", "Select file(s) first");
                return;
            }
            var inv;
            vue.files.forEach(file => {
                if (!file.type.includes("image")) {
                    vue.makeToast("err", "Select images only");
                    inv = true;
                }
                if (file.size > 1024 * 1024 * 5) {
                    vue.makeToast("err", "File size has to be less than 5MB");
                    inv = true;
                }
            });
            if (inv == true) {
                return;
            }
            vue.upload = true;
            for (let i = 0, p = Promise.resolve(); i < vue.files.length; i++) {
                p = p.then(
                    _ =>
                        new Promise(resolve => {
                            vue.index = i;
                            const item = vue.files[i];
                            const refPath = `photos/${vue.studentEmail}/${item.name}`;

                            const ref = fb.storageRef.child(refPath);

                            var uploadTask = ref.put(item);

                            uploadTask.on(
                                "state_changed",
                                function(snapshot) {
                                    if (vue.cancel) {
                                        uploadTask.cancel();
                                    }
                                    // Observe state change events such as progress, pause, and resume
                                    // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
                                    const progress =
                                        (snapshot.bytesTransferred /
                                            snapshot.totalBytes) *
                                        100;
                                    vue.progress = progress.toFixed(0);
                                    console.log(
                                        "Upload is " + progress + "% done"
                                    );
                                    switch (snapshot.state) {
                                        case fb.firebase.storage.TaskState
                                            .PAUSED: // or 'paused'
                                            console.log("Upload is paused");
                                            break;
                                        case fb.firebase.storage.TaskState
                                            .RUNNING: // or 'running'
                                            console.log("Upload is running");
                                            break;
                                    }
                                },
                                function(error) {
                                    // Handle unsuccessful uploads
                                    console.log("Upload unsuccessful: ", error);
                                    vue.progress = 0;
                                    if (i == vue.files.length - 1) {
                                        vue.complete();
                                    }
                                    resolve();
                                },
                                function() {
                                    // Handle successful uploads on complete
                                    // For instance, get the download URL: https://firebasestorage.googleapis.com/...
                                    uploadTask.snapshot.ref
                                        .getDownloadURL()
                                        .then(function(downloadURL) {
                                            console.log(
                                                "File available at",
                                                downloadURL
                                            );
                                            vue.success += 1;
                                            vue.progress = 0;
                                            if (i == vue.files.length - 1) {
                                                vue.complete();
                                            }
                                            resolve();
                                        });
                                }
                            );
                        })
                );
            }
        },
        complete() {
            this.upload = false;
            this.cancel = false;
            const vue = this;
            if (vue.success == vue.files.length) {
                vue.makeToast("suc", "File(s) uploaded successfully");
            } else if (vue.success > 0) {
                vue.makeToast(
                    "war",
                    vue.success +
                        "/" +
                        vue.files.length +
                        " files uploaded successfully"
                );
            } else {
                vue.makeToast("err", "Upload failed");
            }
            vue.success = 0;
            vue.files = [];
        },
        toggleMaint() {
            fb.db
                .collection("misc")
                .doc("maint")
                .update({
                    show: !this.popup
                })
                .then(() => {
                    this.$store.commit("setPopup", !this.popup);
                });
        }
    },
    created: function() {
        const vue = this;
        const queryClass = fb.db.collection('classes')
        queryClass.get().then(querySnapshot => {
            querySnapshot.forEach(doc => {
                this.classes.push(doc.data().name)
            })
        })
        const queryTeacher = fb.usersCollection.where("type", "==", "teacher");
        queryTeacher.get().then(querySnapshot => {
            querySnapshot.forEach((doc, index) => {
                const data = doc.data();
                const option = { option: data.email, text: data.name };
                vue.teacherOptions.push(option);
                vue.searchResults2.push(option)
            });
        });
        const queryStudent = fb.usersCollection.where("type", "==", "student");
        queryStudent.get().then(querySnapshot => {
            querySnapshot.forEach((doc, index) => {
                const data = doc.data();
                const option = { option: data.email, text: data.name };
                vue.studentOptions.push(option);
                vue.searchResults.push(option)
            });
        });
        fb.db
            .collection("announcements")
            .orderBy("timestamp", "desc")
            .get()
            .then(querySnapshot => {
                querySnapshot.forEach(doc => {
                    this.announcements.push(doc.data());
                });
            });
        fb.db.collection('feedbacks').orderBy('timestamp','desc').get().then(querySnapshot => {
            querySnapshot.forEach(doc => {
                this.feedbacks.push(doc.data())
            })
        })
    },
    data() {
        return {
            selectedClass:null,
            classes:[],
            studEmail:'',
            showNew:false,
            parse: false,
            showUser: false,
            file: null,
            userData: [],
            announcements: [],
            showAnnForm: false,
            annText: "",
            annShow: false,
            showAnn: false,
            index: 0,
            upload: false,
            progress: 0,
            success: 0,
            showUpload: false,
            studentEmail: "",
            files: [],
            search: "",
            search2: "",
            showAdmin: false,
            adminEmail: "",
            showTeacher: false,
            showClass: false,
            teacherEmail: "",
            name: "",
            studentOptions: [],
            studentSelected: [],
            searchResults: [],
            teacherOptions: [],
            teacherSelected: [],
            searchResults2: [],
            showFeedbacks: false,
            feedbacks:[],
            openClasses:false
        };
    }
};
</script>