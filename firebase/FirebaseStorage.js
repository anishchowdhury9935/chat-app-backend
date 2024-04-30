
const { initializeApp } = require("firebase/app");
const {getStorage} = require('firebase/storage');
const firebaseConfig = {
    apiKey: "AIzaSyAnHNsyqfz2tQPUNNBxK87hGS6AYuxVJDc",
    authDomain: "chat-app-b2168.firebaseapp.com",
    projectId: "chat-app-b2168",
    storageBucket: "chat-app-b2168.appspot.com",
    messagingSenderId: "596628665071",
    appId: "1:596628665071:web:2b9f910f984858fe2ce11a"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const fireStorage = getStorage(app);

module.exports = fireStorage;