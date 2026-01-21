// Firebase Configuration for Three People Meet

const firebaseConfig = {
    apiKey: "AIzaSyCX8RnL25mylpd7PJAPyE2fA4waEn6rd8E",
    authDomain: "threepeoplemeet.firebaseapp.com",
    projectId: "threepeoplemeet",
    storageBucket: "threepeoplemeet.firebasestorage.app",
    messagingSenderId: "431011516462",
    appId: "1:431011516462:web:2d9a264ec972a8c0c24fbf",
    measurementId: "G-QT4S120SQ8"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize services
const auth = firebase.auth();
const db = firebase.firestore();

// Enable offline persistence for Firestore
db.enablePersistence().catch((err) => {
    if (err.code === 'failed-precondition') {
        console.warn('Multiple tabs open, persistence enabled in only one tab.');
    } else if (err.code === 'unimplemented') {
        console.warn('Browser does not support persistence.');
    }
});

console.log('Firebase initialized');
