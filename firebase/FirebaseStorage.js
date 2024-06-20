
const { initializeApp } = require("firebase/app");
const {getStorage} = require('firebase/storage');
require("dotenv").config();
const firebaseConfig = {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: "chat-app-b2168.firebaseapp.com",
    projectId: "chat-app-b2168",
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: "596628665071",
    appId: process.env.REACT_APP_FIREBASE_API_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const fireStorage = getStorage(app);

module.exports = fireStorage;