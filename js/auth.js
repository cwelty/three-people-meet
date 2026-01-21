// Authentication Module for Three People Meet

const Auth = {
    currentUser: null,
    userData: null,

    // Initialize auth listener
    init() {
        auth.onAuthStateChanged(async (user) => {
            Auth.currentUser = user;
            if (user) {
                await Auth.loadUserData(user.uid);
                App.onAuthStateChanged(true);
            } else {
                Auth.userData = null;
                App.onAuthStateChanged(false);
            }
        });
    },

    // Load user data from Firestore
    async loadUserData(userId) {
        try {
            const doc = await db.collection('users').doc(userId).get();
            if (doc.exists) {
                Auth.userData = { id: doc.id, ...doc.data() };
            } else {
                Auth.userData = null;
            }
        } catch (error) {
            console.error('Error loading user data:', error);
            Auth.userData = null;
        }
    },

    // Register new user
    async register(email, password, displayName) {
        try {
            const userCredential = await auth.createUserWithEmailAndPassword(email, password);
            const user = userCredential.user;

            // Create user document in Firestore
            await db.collection('users').doc(user.uid).set({
                email: email,
                displayName: displayName,
                interests: [],
                groupIds: [],
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            await Auth.loadUserData(user.uid);
            return { success: true };
        } catch (error) {
            console.error('Registration error:', error);
            return { success: false, error: Auth.getErrorMessage(error.code) };
        }
    },

    // Login user
    async login(email, password) {
        try {
            await auth.signInWithEmailAndPassword(email, password);
            return { success: true };
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, error: Auth.getErrorMessage(error.code) };
        }
    },

    // Logout user
    async logout() {
        try {
            await auth.signOut();
            return { success: true };
        } catch (error) {
            console.error('Logout error:', error);
            return { success: false, error: error.message };
        }
    },

    // Save user interests
    async saveInterests(interests) {
        if (!Auth.currentUser) return { success: false, error: 'Not logged in' };

        try {
            await db.collection('users').doc(Auth.currentUser.uid).update({
                interests: interests
            });
            Auth.userData.interests = interests;
            return { success: true };
        } catch (error) {
            console.error('Error saving interests:', error);
            return { success: false, error: error.message };
        }
    },

    // Check if user has completed interests setup
    hasInterests() {
        return Auth.userData && Auth.userData.interests && Auth.userData.interests.length === 10;
    },

    // Get user-friendly error messages
    getErrorMessage(errorCode) {
        const messages = {
            'auth/email-already-in-use': 'This email is already registered.',
            'auth/invalid-email': 'Please enter a valid email address.',
            'auth/operation-not-allowed': 'Email/password accounts are not enabled.',
            'auth/weak-password': 'Password should be at least 6 characters.',
            'auth/user-disabled': 'This account has been disabled.',
            'auth/user-not-found': 'No account found with this email.',
            'auth/wrong-password': 'Incorrect password.',
            'auth/invalid-credential': 'Invalid email or password.',
            'auth/too-many-requests': 'Too many attempts. Please try again later.'
        };
        return messages[errorCode] || 'An error occurred. Please try again.';
    }
};
