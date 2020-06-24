const firebase = require('firebase/app')
import "firebase/auth"
import "firebase/firestore"
import "firebase/storage"
import "firebase/functions"

const firebaseConfig = {
  apiKey: "AIzaSyAE0VuJGEeUpMwtynNcAcfItWwnHVFrpZE",
  authDomain: "aawaazportaldev.firebaseapp.com",
  databaseURL: "https://aawaazportaldev.firebaseio.com",
  projectId: "aawaazportaldev",
  storageBucket: "aawaazportaldev.appspot.com",
  messagingSenderId: "228819494710",
  appId: "1:228819494710:web:49c0f9b153620302e67597"
};
firebase.initializeApp(firebaseConfig);

// firebase utils
const db = firebase.firestore()
const auth = firebase.auth()
const currentUser = auth.currentUser
const functions = firebase.functions()
const storageRef = firebase.storage().ref()

// firebase collections
const usersCollection = db.collection('users')
const assignmentsCollection = db.collection('assignments')
const classesCollection = db.collection('classes')

export {
    firebase,
    db,
    auth,
    currentUser,
    usersCollection,
    assignmentsCollection,
    storageRef,
    classesCollection,
    functions
}