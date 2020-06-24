<template>
    <div id="reports" style="padding:30px">
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
        <h4>Reports</h4>

        <div v-if="assignmentReports.length">
            <div id="assignment-reports" v-if="assignmentReports.length">
                <b-sidebar id="assignment-reports-guide-sidebar" title="Guide" right shadow>
                    <div class="p-3">
                        <p>These reports contain the grades for the assignments submitted by student.</p>
                    </div>
                </b-sidebar>
                <b-tooltip
                    target="assignment-reports-guide-tooltip"
                    triggers="hover"
                >Click to toggle guide for report type</b-tooltip>
                <h5>
                    Assignment Reports&nbsp;
                    <b-button
                        size="sm"
                        class="mb-1 ml-1"
                        id="assignment-reports-guide-tooltip"
                        v-b-toggle.assignment-reports-guide-sidebar
                    >
                        <b-icon-info-circle></b-icon-info-circle>
                    </b-button>
                </h5>
                <table class="table" id="assignment-reports-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Class</th>
                            <th>Grade</th>
                            <th>Comments</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="report in assignmentReports" v-bind:key="report.name">
                            <th>{{ report.name }}</th>
                            <th>{{ report.class }}</th>
                            <th>{{ report.grade }}</th>
                            <th>{{ report.comments }} </th>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
        <div v-else>There are no reports to show.</div>
    </div>
</template>

<script>
// TODO 1 report templates
import { mapState } from "vuex";
const fb = require("../firebaseConfig.js");

export default {
    data() {
        return {
            process: true,
            assignmentReports: []
        };
    },
    computed: {
        ...mapState(["currentUser"])
    },
    created: function() {
        this.getReports();
    },
    methods: {
        getReports() {
            //this works here
            const vue = this;
            fb.db
                .collection("reports")
                .where("student", "==", this.currentUser.email)
                .orderBy("timestamp", "desc")
                .get()
                .then(querySnapshot => {
                    querySnapshot.forEach(doc => {
                        const data = doc.data();
                        if (data.type == "assignment") {
                            fb.db
                                .collection("reportReceipts")
                                .doc(doc.id)
                                .delete()

                            vue.assignmentReports.push(data);
                        }
                    });
                })
                .then(() => {
                    vue.process = false;
                });
        }
    }
};
</script>