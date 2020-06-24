// bg-variant='dark' makes all cards dark
<template>
    <div style="padding:30px" id="home">
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
        <h4>
            Welcome,
            <br />
            {{ userProfile.name }}.
        </h4>
        <br />

        <b-card  header="Classrooms">
            <b-list-group flush v-if="!noclass">
                <b-list-group-item
                    v-for="classroom in userProfile.classes"
                    v-bind:key="classroom"
                    :to="/classroom/+classroom"
                >{{ classroom }}</b-list-group-item>
            </b-list-group>
            <div style="margin-left:20px" v-else>You are not part of any classes.</div>
        </b-card>
        <br />
        <b-card  header="Notifications">
            <b-list-group flush v-if="notif">
                <b-list-group-item v-if="dueCount" to="/assignments">
                    You have {{ dueCount }}
                    <span v-if="dueCount==1">assignment</span>
                    <span v-else>assignments</span> due.
                </b-list-group-item>
                <b-list-group-item v-if="newRepCount" to="/reports">
                    You have {{ newRepCount }} unread
                    <span v-if="newRepCount==1">report</span>
                    <span v-else>reports</span>.
                </b-list-group-item>
                <b-list-group-item v-if="msgCount" to="/chat">
                    You have unread messages from {{ msgCount }}
                    <span v-if="msgCount==1">chat</span>
                    <span v-else>chats</span>.
                </b-list-group-item>
            </b-list-group>
            <div style="margin-left:20px" v-else>No new notifications.</div>
        </b-card>
        <br />
        <b-card header="Announcements">
            <b-list-group flush v-if="announcements.length">
                <b-list-group-item
                    v-for="announcement in announcements"
                    v-bind:key="announcement.text"
                >{{announcement.text}}</b-list-group-item>
            </b-list-group>
            <div style="margin-left:20px" v-else>No new announcements.</div>
        </b-card>
    </div>
</template>

<script>
// TODO Check if delete report works
import { mapState } from "vuex";
import Vuex from "vuex";
const fb = require("../firebaseConfig.js");

export default {
    data() {
        return {
            announcements: [],
            dueCount: 0,
            msgCount: 0,
            newRepCount: 0,
            noclass: false,
            process: true,
            promises: [],
            notif: false
        };
    },
    created: function() {
        Promise.resolve(this.promise).then(() => {
            this.getMsgCount();

            this.getAnn();
            if (!this.teacher) {
                this.getDueCount();
                this.getNewRepCount();
            }
            Promise.all(this.promises).then(() => {
                this.noclass = this.userProfile.classes.length ? false : true;
                this.process = false;
            });
        });
    },
    computed: {
        ...mapState(["userProfile", "promise", "teacher"])
    },
    methods: {
        getAnn() {
            this.promises.push(
                fb.db
                    .collection("announcements")
                    .orderBy("timestamp", "desc")
                    .get()
                    .then(querySnapshot => {
                        querySnapshot.forEach(doc => {
                            this.announcements.push(doc.data());
                        });
                    })
            );
        },
        getMsgCount() {
            this.promises.push(
                fb.db
                    .collection("chats")
                    .where("members", "array-contains", this.userProfile.email)
                    .where("recipientRead", "==", false)
                    .get()
                    .then(querySnapshot => {
                        querySnapshot.forEach(doc => {
                            if (
                                doc.data().lastSender != this.userProfile.email
                            ) {
                                this.notif = true;
                                this.msgCount += 1;
                            }
                        });
                    })
            );
        },
        getDueCount() {
            this.promises.push(
                fb.db
                    .collection("assignments")
                    .where(
                        "yetToSubmit",
                        "array-contains",
                        this.userProfile.email
                    )
                    .where("completed", "==", false)
                    .get()
                    .then(querySnapshot => {
                        querySnapshot.forEach(doc => {
                            this.notif = true;
                            this.dueCount++;
                        });
                    })
            );
        },
        getNewRepCount() {
            this.promises.push(
                fb.db
                    .collection("reportReceipts")
                    .where("student", "==", this.userProfile.email)
                    .where("read", "==", false)
                    .get()
                    .then(querySnapshot => {
                        querySnapshot.forEach(doc => {
                            this.notif = true;
                            this.newRepCount++;
                        });
                    })
            );
        }
    }
};
</script>