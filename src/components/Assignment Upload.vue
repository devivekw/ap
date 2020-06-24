<template>
    <div id="assignment-upload" style="padding:30px;">
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
        <h4 v-if="assignments.length">Assignments due:</h4>
        <h4 v-else>You have no assignments due!</h4>
        <b-overlay :show="upload" no-wrap>
            <template v-slot:overlay>
                <div class="text-center p-4 bg-primary text-light rounded">
                    <b-icon icon="cloud-upload" font-scale="4"></b-icon>
                    <div
                        class="mb-3"
                    >Uploading {{files[index].name}}.. ({{index+1}}/{{files.length}})</div>
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
        <div v-for="assignment in assignments" v-bind:key="assignment.name">
            <br />
            <b-card>
                <b-card-title>{{ assignment.name }}</b-card-title>
                <b-card-sub-title>{{ assignment.class }}</b-card-sub-title>
                <b-card-text class="mt-2">
                    <div>Due date: {{assignment.dueDate | timestamp}}</div>
                    <div>Description: {{assignment.description}}</div>
                </b-card-text>
                <b-form-file
                    v-model="files"
                    placeholder="Choose file(s) or drop them here..."
                    drop-placeholder="Drop files here..."
                    multiple
                    :file-name-formatter="formatNames"
                ></b-form-file>
                <b-button variant="success" class="mt-3" v-on:click="submit(assignment)">Submit</b-button>
            </b-card>
        </div>
    </div>
</template>

<script>
//grade is initialized as -1
import { mapState } from "vuex";
import Vuex from "vuex";
const fb = require("../firebaseConfig.js");
const submitChange = fb.functions.httpsCallable("onSubmit");

export default {
    data() {
        return {
            process: true,
            files: [],
            upload: false,
            assignments: [],
            progress: 0,
            cancel: false,
            index: 0,
            success: 0
        };
    },
    computed: {
        ...mapState(["currentUser", "userProfile"])
    },
    created: function() {
        this.getAssignments();
    },
    methods: {
        formatNames(files) {
            if (files.length === 1) {
                return files[0].name;
            } else {
                return `${files.length} files selected`;
            }
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
        getAssignments() {
            const vue = this;
            fb.usersCollection
                .doc(vue.currentUser.uid)
                .get()
                .then(function(res) {
                    fb.assignmentsCollection
                        .where(
                            "yetToSubmit",
                            "array-contains",
                            res.data().email
                        )
                        .where("completed", "==", false)
                        .orderBy("dueDate")
                        .get()
                        .then(function(querySnapshot) {
                            querySnapshot.forEach(function(doc) {
                                vue.assignments.push(doc.data());
                            });
                        })
                        .then(() => {
                            vue.process = false;
                        })
                        .catch(err => {
                            console.log("Assignment load failed: ", err);
                        });
                });
        },
        complete(a, late) {
            this.upload = false;
            this.cancel = false;
            const vue = this;
            if (vue.success == vue.files.length) {
                vue.makeToast("suc", "File(s) uploaded successfully");
                vue.pullAssignment(a, late, vue);
            } else {
                vue.makeToast("err", "Upload failed");
            }
            vue.success = 0;
        },
        submit(a) {
            const vue = this;
            if (!vue.files.length) {
                this.makeToast("err", "Choose file(s) first!");
                return;
            }
            let size = 0;
            vue.files.forEach(item => {
                size += item.size;
            });
            if (size > 25 * 1024 * 1024) {
                this.makeToast(
                    "err",
                    "Cummulative size of files must be less than 25MB"
                );
                return;
            }
            if (fb.firebase.firestore.Timestamp.now() > a.dueDate) {
                var late = true;
            } else {
                var late = false;
            }
            vue.upload = true;
            for (let i = 0, p = Promise.resolve(); i < vue.files.length; i++) {
                p = p.then(
                    _ =>
                        new Promise(resolve => {
                            const vue = this;
                            vue.index = i;
                            const item = vue.files[i];
                            const refPath =
                                a.class +
                                "/assignments/" +
                                a.name +
                                "/" +
                                this.currentUser.displayName + " - " + this.currentUser.email +
                                "/" +
                                item.name;
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
                                        vue.complete(a, late);
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
                                                vue.complete(a, late);
                                            }
                                            resolve();
                                        });
                                }
                            );
                        })
                );
            }
        },
        pullAssignment(a, late) {
            const index = this.assignments.indexOf(a);
            const user = this.userProfile.email;
            var updateId;
            this.assignments.splice(index, 1);
            const vue = this;
            fb.assignmentsCollection
                .where("name", "==", a.name)
                .get()
                .then(querySnapshot => {
                    querySnapshot.forEach(doc => {
                        updateId = doc.id;
                    });
                })
                .then(() => {
                    submitChange({
                        email: user,
                        id: updateId,
                        late: late
                    }).then(result => {
                        console.log(result.data);
                        vue.makeToast(
                            "suc",
                            "Assignment submitted successfully"
                        );
                        vue.files = [];
                    });
                })
                .catch(err => {
                    console.log("Error updating assignment: ", err);
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