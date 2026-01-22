// Authentication Module for ThreePeopleMeet

const Auth = {
    currentUser: null,
    userData: null,
    googleProvider: null,

    // Initialize auth listener
    init() {
        console.log('Auth.init() called');
        Auth.googleProvider = new firebase.auth.GoogleAuthProvider();

        auth.onAuthStateChanged(async (user) => {
            console.log('onAuthStateChanged fired, user:', user);
            Auth.currentUser = user;
            if (user) {
                await Auth.loadUserData(user.uid);
                console.log('User data loaded, calling App.onAuthStateChanged(true)');
                App.onAuthStateChanged(true);
            } else {
                Auth.userData = null;
                console.log('No user, calling App.onAuthStateChanged(false)');
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
                // Clean up any invalid interests
                await Auth.cleanupInvalidInterests();
            } else {
                Auth.userData = null;
            }
        } catch (error) {
            console.error('Error loading user data:', error);
            Auth.userData = null;
        }
    },

    // Remove interests that are no longer in the valid list
    async cleanupInvalidInterests() {
        if (!Auth.userData || !Auth.userData.interests || !App.interests) return;

        const validSet = new Set(App.interests);
        const currentInterests = Auth.userData.interests;
        const validInterests = currentInterests.filter(i => validSet.has(i));

        // Only update if some interests were removed
        if (validInterests.length < currentInterests.length) {
            const removed = currentInterests.filter(i => !validSet.has(i));
            console.log('Removing invalid interests:', removed);

            try {
                await db.collection('users').doc(Auth.currentUser.uid).update({
                    interests: validInterests
                });
                Auth.userData.interests = validInterests;
            } catch (error) {
                console.error('Error cleaning up interests:', error);
            }
        }
    },

    // Sign in with Google
    async signInWithGoogle() {
        try {
            const result = await auth.signInWithPopup(Auth.googleProvider);
            const user = result.user;

            // Check if user document exists
            const userDoc = await db.collection('users').doc(user.uid).get();

            if (!userDoc.exists) {
                // Create user document for new users
                await db.collection('users').doc(user.uid).set({
                    email: user.email,
                    displayName: user.displayName || user.email.split('@')[0],
                    interests: [],
                    groupIds: [],
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
            }

            await Auth.loadUserData(user.uid);
            return { success: true };
        } catch (error) {
            console.error('Google sign-in error:', error);
            if (error.code === 'auth/popup-closed-by-user') {
                return { success: false, error: 'Sign-in was cancelled.' };
            }
            return { success: false, error: error.message };
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

    // Save user avatar
    async saveAvatar(avatar) {
        if (!Auth.currentUser) return { success: false, error: 'Not logged in' };

        try {
            await db.collection('users').doc(Auth.currentUser.uid).update({
                avatar: avatar
            });
            Auth.userData.avatar = avatar;
            return { success: true };
        } catch (error) {
            console.error('Error saving avatar:', error);
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

    // Save both avatar and interests (for initial setup)
    async saveProfile(avatar, interests) {
        if (!Auth.currentUser) return { success: false, error: 'Not logged in' };

        try {
            await db.collection('users').doc(Auth.currentUser.uid).update({
                avatar: avatar,
                interests: interests
            });
            Auth.userData.avatar = avatar;
            Auth.userData.interests = interests;
            return { success: true };
        } catch (error) {
            console.error('Error saving profile:', error);
            return { success: false, error: error.message };
        }
    },

    // Save display name
    async saveDisplayName(displayName) {
        if (!Auth.currentUser) return { success: false, error: 'Not logged in' };

        try {
            await db.collection('users').doc(Auth.currentUser.uid).update({
                displayName: displayName
            });
            Auth.userData.displayName = displayName;
            return { success: true };
        } catch (error) {
            console.error('Error saving display name:', error);
            return { success: false, error: error.message };
        }
    },

    // Check if user has completed interests setup
    hasInterests() {
        return Auth.userData && Auth.userData.interests && Auth.userData.interests.length >= 10;
    }
};
