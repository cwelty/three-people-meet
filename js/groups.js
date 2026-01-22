// Groups Module for ThreePeopleMeet

const Groups = {
    currentGroup: null,
    groupMembers: [],
    unsubscribeListeners: [],

    // Generate unique 6-character code
    generateCode() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        for (let i = 0; i < 6; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    },

    // Create a new group
    async createGroup(name, icon = '🏠', color = '#E07A5F') {
        if (!Auth.currentUser) return { success: false, error: 'Not logged in' };

        const code = Groups.generateCode();
        const userId = Auth.currentUser.uid;

        try {
            // Check if code already exists
            const existing = await db.collection('groups').where('code', '==', code).get();
            if (!existing.empty) {
                // Regenerate code if collision (very rare)
                return Groups.createGroup(name, icon, color);
            }

            // Create group document
            const groupRef = await db.collection('groups').add({
                name: name,
                code: code,
                icon: icon,
                color: color,
                creatorIds: [userId],
                memberIds: [userId],
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            // Add group to user's groupIds
            await db.collection('users').doc(userId).update({
                groupIds: firebase.firestore.FieldValue.arrayUnion(groupRef.id)
            });

            // Update local user data
            if (!Auth.userData.groupIds) Auth.userData.groupIds = [];
            Auth.userData.groupIds.push(groupRef.id);

            return { success: true, groupId: groupRef.id, code: code };
        } catch (error) {
            console.error('Error creating group:', error);
            return { success: false, error: error.message };
        }
    },

    // Join existing group by code
    async joinGroup(code) {
        if (!Auth.currentUser) return { success: false, error: 'Not logged in' };

        const userId = Auth.currentUser.uid;
        const upperCode = code.toUpperCase();

        try {
            // Find group by code
            const snapshot = await db.collection('groups').where('code', '==', upperCode).get();

            if (snapshot.empty) {
                return { success: false, error: 'No group found with this code.' };
            }

            const groupDoc = snapshot.docs[0];
            const groupData = groupDoc.data();

            // Check if already a member
            if (groupData.memberIds.includes(userId)) {
                return { success: false, error: 'You are already a member of this group.' };
            }

            // Add user to group
            await db.collection('groups').doc(groupDoc.id).update({
                memberIds: firebase.firestore.FieldValue.arrayUnion(userId)
            });

            // Add group to user's groupIds
            await db.collection('users').doc(userId).update({
                groupIds: firebase.firestore.FieldValue.arrayUnion(groupDoc.id)
            });

            // Update local user data
            if (!Auth.userData.groupIds) Auth.userData.groupIds = [];
            Auth.userData.groupIds.push(groupDoc.id);

            return { success: true, groupId: groupDoc.id, groupName: groupData.name };
        } catch (error) {
            console.error('Error joining group:', error);
            return { success: false, error: error.message };
        }
    },

    // Update group appearance (icon and color) - creators only
    async updateGroupAppearance(groupId, icon, color) {
        if (!Auth.currentUser) return { success: false, error: 'Not logged in' };

        try {
            const group = await Groups.getGroup(groupId);
            if (!group || !Groups.isCreator(group)) {
                return { success: false, error: 'Only creators can update group appearance.' };
            }

            await db.collection('groups').doc(groupId).update({
                icon: icon,
                color: color
            });

            // Update local group data
            if (Groups.currentGroup) {
                Groups.currentGroup.icon = icon;
                Groups.currentGroup.color = color;
            }

            return { success: true };
        } catch (error) {
            console.error('Error updating group appearance:', error);
            return { success: false, error: error.message };
        }
    },

    // Leave a group
    async leaveGroup(groupId) {
        if (!Auth.currentUser) return { success: false, error: 'Not logged in' };

        const userId = Auth.currentUser.uid;

        try {
            const groupRef = db.collection('groups').doc(groupId);
            const groupDoc = await groupRef.get();

            if (!groupDoc.exists) {
                return { success: false, error: 'Group not found.' };
            }

            const groupData = groupDoc.data();

            // Remove user from group
            await groupRef.update({
                memberIds: firebase.firestore.FieldValue.arrayRemove(userId),
                creatorIds: firebase.firestore.FieldValue.arrayRemove(userId)
            });

            // Remove group from user's groupIds
            await db.collection('users').doc(userId).update({
                groupIds: firebase.firestore.FieldValue.arrayRemove(groupId)
            });

            // Update local user data
            if (Auth.userData.groupIds) {
                Auth.userData.groupIds = Auth.userData.groupIds.filter(id => id !== groupId);
            }

            return { success: true };
        } catch (error) {
            console.error('Error leaving group:', error);
            return { success: false, error: error.message };
        }
    },

    // Transfer leadership to another member
    async transferLeadership(groupId, newLeaderId) {
        if (!Auth.currentUser) return { success: false, error: 'Not logged in' };

        try {
            const group = await Groups.getGroup(groupId);
            if (!group || !Groups.isCreator(group)) {
                return { success: false, error: 'Only creators can transfer leadership.' };
            }

            // Add new leader to creatorIds
            await db.collection('groups').doc(groupId).update({
                creatorIds: firebase.firestore.FieldValue.arrayUnion(newLeaderId)
            });

            return { success: true };
        } catch (error) {
            console.error('Error transferring leadership:', error);
            return { success: false, error: error.message };
        }
    },

    // Delete a group (creators only)
    async deleteGroup(groupId) {
        if (!Auth.currentUser) return { success: false, error: 'Not logged in' };

        try {
            const group = await Groups.getGroup(groupId);
            if (!group || !Groups.isCreator(group)) {
                return { success: false, error: 'Only creators can delete a group.' };
            }

            const batch = db.batch();

            // Delete all pairings subcollection
            const pairingsSnapshot = await db.collection('groups').doc(groupId)
                .collection('pairings').get();
            pairingsSnapshot.forEach(doc => {
                batch.delete(doc.ref);
            });

            // Delete all pairingHistory subcollection
            const historySnapshot = await db.collection('groups').doc(groupId)
                .collection('pairingHistory').get();
            historySnapshot.forEach(doc => {
                batch.delete(doc.ref);
            });

            // Delete the group document
            batch.delete(db.collection('groups').doc(groupId));

            await batch.commit();

            // Remove from current user's groupIds
            await db.collection('users').doc(Auth.currentUser.uid).update({
                groupIds: firebase.firestore.FieldValue.arrayRemove(groupId)
            });

            // Update local user data
            if (Auth.userData.groupIds) {
                Auth.userData.groupIds = Auth.userData.groupIds.filter(id => id !== groupId);
            }

            // Note: Other members will have stale groupIds which get cleaned up
            // when they load their groups (getUserGroups filters out missing groups)

            return { success: true };
        } catch (error) {
            console.error('Error deleting group:', error);
            return { success: false, error: error.message };
        }
    },

    // Get user's groups
    async getUserGroups() {
        if (!Auth.currentUser || !Auth.userData) return [];

        const groupIds = Auth.userData.groupIds || [];
        if (groupIds.length === 0) return [];

        try {
            const groups = [];
            // Firestore 'in' query supports max 10 items, so batch if needed
            const batches = [];
            for (let i = 0; i < groupIds.length; i += 10) {
                batches.push(groupIds.slice(i, i + 10));
            }

            for (const batch of batches) {
                const snapshot = await db.collection('groups')
                    .where(firebase.firestore.FieldPath.documentId(), 'in', batch)
                    .get();

                snapshot.forEach(doc => {
                    groups.push({ id: doc.id, ...doc.data() });
                });
            }

            // Clean up stale groupIds (groups that no longer exist)
            const foundIds = new Set(groups.map(g => g.id));
            const staleIds = groupIds.filter(id => !foundIds.has(id));
            if (staleIds.length > 0) {
                console.log('Cleaning up stale groupIds:', staleIds);
                await db.collection('users').doc(Auth.currentUser.uid).update({
                    groupIds: groups.map(g => g.id)
                });
                Auth.userData.groupIds = groups.map(g => g.id);
            }

            return groups;
        } catch (error) {
            console.error('Error getting user groups:', error);
            return [];
        }
    },

    // Get single group by ID
    async getGroup(groupId) {
        try {
            const doc = await db.collection('groups').doc(groupId).get();
            if (doc.exists) {
                return { id: doc.id, ...doc.data() };
            }
            return null;
        } catch (error) {
            console.error('Error getting group:', error);
            return null;
        }
    },

    // Get group members with their data
    async getGroupMembers(groupId) {
        try {
            const group = await Groups.getGroup(groupId);
            if (!group) return [];

            const memberIds = group.memberIds || [];
            if (memberIds.length === 0) return [];

            const members = [];
            // Batch fetch users
            const batches = [];
            for (let i = 0; i < memberIds.length; i += 10) {
                batches.push(memberIds.slice(i, i + 10));
            }

            for (const batch of batches) {
                const snapshot = await db.collection('users')
                    .where(firebase.firestore.FieldPath.documentId(), 'in', batch)
                    .get();

                snapshot.forEach(doc => {
                    members.push({ id: doc.id, ...doc.data() });
                });
            }

            Groups.groupMembers = members;
            return members;
        } catch (error) {
            console.error('Error getting group members:', error);
            return [];
        }
    },

    // Check if current user is a creator of the group
    isCreator(group) {
        if (!Auth.currentUser || !group) return false;
        return group.creatorIds && group.creatorIds.includes(Auth.currentUser.uid);
    },

    // Subscribe to group changes (real-time)
    subscribeToGroup(groupId, callback) {
        const unsubscribe = db.collection('groups').doc(groupId)
            .onSnapshot((doc) => {
                if (doc.exists) {
                    Groups.currentGroup = { id: doc.id, ...doc.data() };
                    callback(Groups.currentGroup);
                }
            }, (error) => {
                console.error('Error in group subscription:', error);
            });

        Groups.unsubscribeListeners.push(unsubscribe);
        return unsubscribe;
    },

    // Subscribe to pairings changes (real-time)
    subscribeToPairings(groupId, callback) {
        const unsubscribe = db.collection('groups').doc(groupId)
            .collection('pairings')
            .orderBy('round', 'desc')
            .limit(20)
            .onSnapshot((snapshot) => {
                const pairings = [];
                snapshot.forEach(doc => {
                    pairings.push({ id: doc.id, ...doc.data() });
                });
                callback(pairings);
            }, (error) => {
                console.error('Error in pairings subscription:', error);
            });

        Groups.unsubscribeListeners.push(unsubscribe);
        return unsubscribe;
    },

    // Cleanup all listeners
    cleanup() {
        Groups.unsubscribeListeners.forEach(unsub => unsub());
        Groups.unsubscribeListeners = [];
        Groups.currentGroup = null;
        Groups.groupMembers = [];
    }
};
