<template>
    <div id="profile" style="padding:30px">
        <b-overlay :show="upload" no-wrap>
            <template v-slot:overlay>
                <div class="text-center p-4 bg-primary text-light rounded">
                    <b-icon icon="cloud-upload" font-scale="4"></b-icon>
                    <div class="mb-3">Uploading</div>
                    <b-progress
                        min="0"
                        max="100"
                        :value="progress"
                        variant="success"
                        height="3px"
                        class="mx-n4 rounded-0"
                    ></b-progress>
                </div>
            </template>
        </b-overlay>
        <b-form-group label="Upload image" description="Low file-size images preferred">
            <b-form-file
                v-model="file"
                placeholder="Choose a file or drop it here..."
                drop-placeholder="Drop file here..."
            ></b-form-file>
        </b-form-group>
        <b-button variant="success" @click="uploadFile()">Submit</b-button>
    </div>
</template>

<script>
const fb = require("../firebaseConfig.js");
import { mapState } from "vuex";
import { currentUser } from "../firebaseConfig";

export default {
    data() {
        return {
            file: null,
            progress: 0,
            upload: false,
            downloadUrl:''
        };
    },
    computed: {
        ...mapState(["currentUser"])
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
            }
            this.$bvToast.toast(msg, {
                title: title,
                variant: variant,
                solid: true
            });
        },
        uploadFile() {
            if (!this.file) {
                this.makeToast("err", "Select a file");
                return;
            }
            var re = /(?:\.([^.]+))?$/;
            var ext = re.exec(this.file.name);
            const refPath = "profilePics/" + this.currentUser.uid + ext;
            const ref = fb.storageRef.child(refPath);
            const vue = this;
            vue.upload = true;
            var uploadTask = ref.put(vue.file);

            uploadTask.on(
                "state_changed",
                function(snapshot) {
                    // Observe state change events such as progress, pause, and resume
                    // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
                    var progress =
                        (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    vue.progress = progress.toFixed(0);
                    console.log("Upload is " + progress + "% done");
                    switch (snapshot.state) {
                        case fb.firebase.storage.TaskState.PAUSED: // or 'paused'
                            console.log("Upload is paused");
                            break;
                        case fb.firebase.storage.TaskState.RUNNING: // or 'running'
                            console.log("Upload is running");
                            break;
                    }
                },
                function(error) {
                    // Handle unsuccessful uploads
                },
                function() {
                    // Handle successful uploads on complete
                    // For instance, get the download URL: https://firebasestorage.googleapis.com/...
                    uploadTask.snapshot.ref
                        .getDownloadURL()
                        .then(function(downloadURL) {
                            const url = downloadURL
                            fb.db
                                .collection("users")
                                .doc(vue.currentUser.uid)
                                .update({
                                    profilePicUrl: downloadURL
                                })
                                .then(() => {
                                    fb.db.collection('chats').where('members', 'array-contains', vue.currentUser.email)
                                    .get().then(querySnapshot => {
                                        querySnapshot.forEach(doc => {
                                            const userData = doc.data().userData;
                                            userData[vue.currentUser.email].profilePicUrl = url
                                            fb.db.collection('chats').doc(doc.id).update({
                                                userData:userData
                                            })
                                        })
                                    })
                                    fb.db.collection('classes').where('users','array-contains',vue.currentUser.email)
                                    .get().then(querySnapshot => {
                                        querySnapshot.forEach(doc => {
                                            const userData = doc.data().userData;
                                            userData[vue.currentUser.email].profilePicUrl = url
                                            fb.db.collection('classes').doc(doc.id).update({
                                                userData:userData
                                            })
                                            
                                        })
                                    })
                                    vue.file = null;
                                    vue.upload = false;
                                });
                        });
                }
            );
        }
    }
};
</script>