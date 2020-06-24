<template>
    <div id="resources" style="padding:30px">
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
        <div v-if="noAuth && !teacher">You are not authorised to view this page.</div>
        <div v-else>
            <div v-if="!formOpen">
                <b-button size="sm" variant="outline-primary" :to="{name:'Classroom'}" class="bbtn">
                    <b-icon-arrow90deg-left></b-icon-arrow90deg-left>Back to Classroom
                </b-button>
                <h4>
                    <br />
                    Resources for {{ $route.params.class }}
                </h4>
                <!--For teachers-->
                <b-button
                    size="sm"
                    variant="outline-info"
                    class="float-right"
                    @click="formOpen=true"
                    v-if="teacher"
                >Upload files</b-button>
                <div v-if="resFolders.length">
                    <ul>
                        <li v-for="resFolder in resFolders" v-bind:key="resFolder.name">
                            <a
                                @click="getFiles(resFolder)"
                                style="color:#0275d8;cursor:pointer"
                            >{{resFolder.name}}</a>
                        </li>
                    </ul>
                    <div v-if="showFiles">
                        <b-card>
                            <ul>
                                <li v-for="file in filesU" v-bind:key="file.name">
                                    <a v-bind:href="file.link" target="_blank">{{ file.name }}</a>
                                </li>
                            </ul>
                        </b-card>
                    </div>
                </div>
                <div v-else>No resources uploaded</div>
            </div>
            <div v-else>
                <b-button
                    size="sm"
                    variant="outline-primary"
                    @click="formOpen=false;getResources()"
                >
                    <b-icon-arrow90deg-left></b-icon-arrow90deg-left>Back to Resources
                </b-button>
                <b-form-group
                    class="mt-3"
                    description="General, Misc, etc. can be used for non-specific files"
                    label="Enter folder name:"
                >
                <b-form-input v-model='folder'></b-form-input>
                </b-form-group>
                <b-form-group
                    class="mt-3"
                    description="Upload of multiple files possible."
                    label="Select file(s)"
                >
                    <b-form-file
                        v-model="files"
                        placeholder="Choose a file or drop it here..."
                        drop-placeholder="Drop file here..."
                        multiple
                        :file-name-formatter="formatNames"
                    ></b-form-file>
                </b-form-group>
                <b-button variant="outline-info" @click="uploadF">Upload</b-button>
            </div>
        </div>
    </div>
</template>

<script>
// TODO 6 make upload modal
const fb = require("../firebaseConfig.js");
import { mapState } from "vuex";

export default {
    data() {
        return {
            folder: '',
            showFiles:false,
            filesU:[],
            noAuth: true,
            promises: [],
            files: [],
            process: true,
            formOpen: false,
            resFolders:[],
            upload: false,
            progress: 0,
            cancel: false,
            index: 0,
            success: 0,
            sortResources: []
        };
    },
    computed: {
        ...mapState(["teacher", "admin", "rolePromise"])
    },
    created: function() {
        Promise.resolve(this.rolePromise).then(() => {
            this.getClassDeets();
            Promise.all(this.promises).then(() => {
                if (this.noAuth) {
                    this.process = false;
                    return;
                }
                this.getResources();
            });
        });
    },
    methods: {
        getClassDeets() {
            const vue = this;
            if (vue.teacher) {
                vue.promises.push(
                    fb.classesCollection
                        .where("name", "==", vue.$route.params.class)
                        .get()
                        .then(querySnapshot => {
                            querySnapshot.forEach(doc => {
                                vue.noAuth = false
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
        formatNames(files) {
            if (files.length === 1) {
                return files[0].name;
            } else {
                return `${files.length} files selected`;
            }
        },
        getResources() {
            const vue = this;
            vue.process = true;
            vue.resFolders = [];
            const refPath = this.$route.params.class + "/resources/";
            const ref = fb.storageRef.child(refPath);
            var promises = [];
            const p = ref.listAll().then(res => {
                res.prefixes.forEach(item => {
                    const resFolder = {
                        name: item.name,
                        location: item.location
                    };
                    vue.resFolders.push(resFolder);
                });
            });
            vue.promises.push(p);
            Promise.all(promises).then(() => {
                this.process = false;
            });
        },
        getFiles(a) {
            const vue = this;
            this.process = true;
            this.filesU = [];
            var promises = []
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

                                        vue.filesU.push(file);
                                        resolve();
                                    });
                            });
                    });
                    promises.push(p);
                    Promise.all(promises).then(() => {
                        vue.filesU.sort(function(a, b) {
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
                    var title = "Error";
            }
            this.$bvToast.toast(msg, {
                title: title,
                variant: variant,
                solid: true
            });
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
            vue.folder = ''
        },
        uploadF() {
            const vue = this;
            var promises = [];
            if (!vue.files.length) {
                vue.makeToast("err", "Select file(s) first");
                return;
            }
            if (!vue.folder) {
                vue.makeToast('err',"Enter folder name")
                return
            }
            var inv;
            vue.files.forEach(file => {
                if (file.size > 5 * 1024 * 1024) {
                    vue.makeToast("err", "File size must be less than 5MB");
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
                            const refPath =
                                vue.$route.params.class +
                                "/resources/" + vue.folder + "/"+
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
        }
    }
};
</script>