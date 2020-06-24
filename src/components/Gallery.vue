<template>
    <div id="gallery">
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
        <h4 style="text-align:center;">Student Gallery</h4>
        <b-modal size="lg" ref="modal-center" centered hide-footer :title="select.name">
            <div class="d-flex justify-content-center align-items-center">
                <img
                    class="imgt"
                    :src="select.link"
                    style="max-width:600px;max-height:600px"
                    :alt="select.name"
                />
            </div>
        </b-modal>

        <div id="photoView" v-if="photos.length">
            <div class="row row-cols-4">
                <div
                    class="col d-flex align-items-center mt-4 mb-4"
                    v-for="photo in photos"
                    v-bind:key="photo"
                >
                    <b-img
                        thumbnail
                        fluid
                        :src="photo.link"
                        :alt="photo.name"
                        @click="showModal(photo)"
                    ></b-img>
                </div>
            </div>
        </div>
        <div v-else style="text-align:center">No uploads.</div>
    </div>
</template>

<script>
import { mapState } from "vuex";
const fb = require("../firebaseConfig.js");

export default {
    data() {
        return {
            select: { name: "", link: "" },
            slide: 0,
            process: true,
            photos: [],
            carouselPhotos: []
        };
    },
    computed: {
        ...mapState(["userProfile", "promise"])
    },
    created: function() {
        Promise.resolve(this.promise).then(() => {
            this.getPhotos();
        });
    },
    methods: {
        showModal(photo) {
            this.select = photo;
            this.$refs["modal-center"].show();
        },
        getPhotos() {
            const vue = this;
            const refPath = "photos/" + vue.userProfile.email + "/";
            const ref = fb.storageRef.child(refPath);
            ref.listAll().then(res => {
                var promises = [];
                res.items.forEach(itemRef => {
                    const prom = new Promise(resolve => {
                        fb.storageRef
                            .child(itemRef.fullPath)
                            .getDownloadURL()
                            .then(url => {
                                fb.storageRef
                                    .child(itemRef.fullPath)
                                    .getMetadata()
                                    .then(metadata => {
                                        const photo = {
                                            name: itemRef.name,
                                            link: url,
                                            timeCreated: metadata.timeCreated
                                        };

                                        vue.photos.push(photo);
                                        resolve();
                                    });
                            });
                    });
                    promises.push(prom);
                });
                Promise.all(promises).then(() => {
                    vue.photos.sort(function(a, b) {
                        return -(
                            Date.parse(a.timeCreated) -
                            Date.parse(b.timeCreated)
                        );
                    });
                    if (vue.photos.length > 4) {
                        vue.carouselPhotos = vue.photos.slice(0, 5);
                    }
                    vue.process = false;
                });
            });
        }
    }
};
</script>