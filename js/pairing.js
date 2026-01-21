// Pairing Module for Three People Meet

const Pairing = {
    // Activity suggestions by category
    activityCategories: {
        outdoors: {
            interests: ['hiking', 'camping', 'nature', 'gardening', 'fishing', 'cycling', 'running', 'walking', 'beach', 'mountains'],
            activities: [
                'Go on a scenic trail walk',
                'Have a picnic in the park',
                'Visit a botanical garden',
                'Try a sunrise/sunset viewing spot',
                'Explore a local nature reserve',
                'Go for a bike ride together'
            ]
        },
        food: {
            interests: ['cooking', 'baking', 'restaurants', 'coffee', 'wine', 'food', 'brunch', 'sushi', 'pizza', 'vegetarian'],
            activities: [
                'Host a potluck dinner',
                'Take a cooking class together',
                'Do a food truck crawl',
                'Have a coffee tasting session',
                'Try a new restaurant each person picks',
                'Bake something together'
            ]
        },
        creative: {
            interests: ['art', 'music', 'photography', 'drawing', 'painting', 'crafts', 'design', 'writing', 'poetry', 'theater'],
            activities: [
                'Visit an art museum',
                'Go to an open mic night',
                'Do a photo walk around the city',
                'Try a paint-and-sip class',
                'Attend a live concert',
                'Visit a local gallery opening'
            ]
        },
        active: {
            interests: ['sports', 'fitness', 'yoga', 'gym', 'swimming', 'basketball', 'soccer', 'tennis', 'golf', 'martial arts'],
            activities: [
                'Try a group workout class',
                'Go bowling',
                'Play mini golf',
                'Try rock climbing',
                'Have a yoga session in the park',
                'Play recreational sports together'
            ]
        },
        social: {
            interests: ['games', 'movies', 'trivia', 'karaoke', 'dancing', 'parties', 'socializing', 'comedy', 'podcasts', 'tv shows'],
            activities: [
                'Visit a board game cafe',
                'Have a movie marathon',
                'Join a pub trivia night',
                'Go to karaoke',
                'Attend a comedy show',
                'Host a game night'
            ]
        },
        learning: {
            interests: ['reading', 'technology', 'languages', 'science', 'history', 'books', 'podcasts', 'documentaries', 'philosophy', 'psychology'],
            activities: [
                'Start a mini book club discussion',
                'Attend a workshop or class',
                'Visit a museum or science center',
                'Go to a public lecture or talk',
                'Have a language exchange session',
                'Watch and discuss a documentary'
            ]
        }
    },

    // Get shared interests between members
    getSharedInterests(members) {
        if (members.length < 2) return [];

        const allInterests = members.map(m => m.interests || []);
        const shared = allInterests[0].filter(interest =>
            allInterests.every(memberInterests => memberInterests.includes(interest))
        );

        return shared;
    },

    // Get suggested activity based on shared interests
    getSuggestedActivity(sharedInterests) {
        // Score each category based on matching interests
        const categoryScores = {};

        for (const [category, data] of Object.entries(Pairing.activityCategories)) {
            categoryScores[category] = sharedInterests.filter(interest =>
                data.interests.includes(interest.toLowerCase())
            ).length;
        }

        // Find categories with matches
        const matchingCategories = Object.entries(categoryScores)
            .filter(([_, score]) => score > 0)
            .sort((a, b) => b[1] - a[1]);

        // Pick activity from best matching category, or random if no matches
        let activities;
        if (matchingCategories.length > 0) {
            activities = Pairing.activityCategories[matchingCategories[0][0]].activities;
        } else {
            // Pick random category
            const categories = Object.keys(Pairing.activityCategories);
            const randomCategory = categories[Math.floor(Math.random() * categories.length)];
            activities = Pairing.activityCategories[randomCategory].activities;
        }

        return activities[Math.floor(Math.random() * activities.length)];
    },

    // Calculate pairing score (higher is better)
    calculatePairingScore(members, history) {
        let score = 0;

        // Add points for shared interests
        const shared = Pairing.getSharedInterests(members);
        score += shared.length * 10;

        // Check history for penalties
        const memberIds = members.map(m => m.id).sort();
        const memberKey = memberIds.join(',');

        for (const entry of history) {
            const entryKey = entry.memberSet.sort().join(',');

            // Heavy penalty if exact trio has met before
            if (entryKey === memberKey) {
                score -= 100;
            } else {
                // Check for pair overlaps
                const overlap = memberIds.filter(id => entry.memberSet.includes(id));
                if (overlap.length === 2) {
                    score -= 20; // Penalty for 2 members having met
                }
            }
        }

        return score;
    },

    // Generate all possible trios from members
    generateTrios(members) {
        const trios = [];
        const n = members.length;

        for (let i = 0; i < n - 2; i++) {
            for (let j = i + 1; j < n - 1; j++) {
                for (let k = j + 1; k < n; k++) {
                    trios.push([members[i], members[j], members[k]]);
                }
            }
        }

        return trios;
    },

    // Generate pairings using greedy algorithm
    async generatePairings(groupId) {
        if (!Auth.currentUser) return { success: false, error: 'Not logged in' };

        try {
            // Get group and verify creator status
            const group = await Groups.getGroup(groupId);
            if (!group || !Groups.isCreator(group)) {
                return { success: false, error: 'Only creators can generate pairings.' };
            }

            // Get all members with their data
            const members = await Groups.getGroupMembers(groupId);
            if (members.length < 3) {
                return { success: false, error: 'Need at least 3 members to create pairings.' };
            }

            // Get pairing history
            const historySnapshot = await db.collection('groups').doc(groupId)
                .collection('pairingHistory').get();
            const history = historySnapshot.docs.map(doc => doc.data());

            // Get current round number
            const pairingsSnapshot = await db.collection('groups').doc(groupId)
                .collection('pairings').orderBy('round', 'desc').limit(1).get();
            let currentRound = 1;
            if (!pairingsSnapshot.empty) {
                currentRound = pairingsSnapshot.docs[0].data().round + 1;
            }

            // Generate all possible trios
            const allTrios = Pairing.generateTrios(members);

            // Score each trio
            const scoredTrios = allTrios.map(trio => ({
                members: trio,
                score: Pairing.calculatePairingScore(trio, history)
            })).sort((a, b) => b.score - a.score);

            // Greedy selection of non-overlapping trios
            const selectedPairings = [];
            const usedMembers = new Set();

            for (const trioData of scoredTrios) {
                const memberIds = trioData.members.map(m => m.id);
                const hasOverlap = memberIds.some(id => usedMembers.has(id));

                if (!hasOverlap) {
                    selectedPairings.push(trioData);
                    memberIds.forEach(id => usedMembers.add(id));

                    // Stop if all members are used
                    if (usedMembers.size >= members.length) break;
                }
            }

            // Handle leftovers (if members % 3 != 0)
            const leftoverMembers = members.filter(m => !usedMembers.has(m.id));

            // Create a batch write for all pairings
            const batch = db.batch();

            // Save each pairing
            for (const pairing of selectedPairings) {
                const memberIds = pairing.members.map(m => m.id);
                const sharedInterests = Pairing.getSharedInterests(pairing.members);
                const suggestedActivity = Pairing.getSuggestedActivity(sharedInterests);

                const pairingRef = db.collection('groups').doc(groupId)
                    .collection('pairings').doc();

                batch.set(pairingRef, {
                    round: currentRound,
                    members: memberIds,
                    sharedInterests: sharedInterests,
                    suggestedActivity: suggestedActivity,
                    revealed: false,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });

                // Also save to history
                const historyRef = db.collection('groups').doc(groupId)
                    .collection('pairingHistory').doc();

                batch.set(historyRef, {
                    memberSet: memberIds.sort(),
                    round: currentRound,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
            }

            // Handle leftovers - add to existing pairings or create pair
            if (leftoverMembers.length === 1 && selectedPairings.length > 0) {
                // Add single leftover to the last pairing (making it a group of 4)
                const lastPairing = selectedPairings[selectedPairings.length - 1];
                const extendedMembers = [...lastPairing.members, leftoverMembers[0]];
                const memberIds = extendedMembers.map(m => m.id);
                const sharedInterests = Pairing.getSharedInterests(extendedMembers);
                const suggestedActivity = Pairing.getSuggestedActivity(sharedInterests);

                const pairingRef = db.collection('groups').doc(groupId)
                    .collection('pairings').doc();

                batch.set(pairingRef, {
                    round: currentRound,
                    members: memberIds,
                    sharedInterests: sharedInterests,
                    suggestedActivity: suggestedActivity,
                    revealed: false,
                    isExtended: true,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
            } else if (leftoverMembers.length === 2) {
                // Create a pair
                const memberIds = leftoverMembers.map(m => m.id);
                const sharedInterests = Pairing.getSharedInterests(leftoverMembers);
                const suggestedActivity = Pairing.getSuggestedActivity(sharedInterests);

                const pairingRef = db.collection('groups').doc(groupId)
                    .collection('pairings').doc();

                batch.set(pairingRef, {
                    round: currentRound,
                    members: memberIds,
                    sharedInterests: sharedInterests,
                    suggestedActivity: suggestedActivity,
                    revealed: false,
                    isPair: true,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });

                // Also save to history
                const historyRef = db.collection('groups').doc(groupId)
                    .collection('pairingHistory').doc();

                batch.set(historyRef, {
                    memberSet: memberIds.sort(),
                    round: currentRound,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
            }

            await batch.commit();

            return { success: true, round: currentRound, pairingsCount: selectedPairings.length };
        } catch (error) {
            console.error('Error generating pairings:', error);
            return { success: false, error: error.message };
        }
    },

    // Get current pairing for user
    async getCurrentPairing(groupId, userId) {
        try {
            // Get the latest round
            const snapshot = await db.collection('groups').doc(groupId)
                .collection('pairings')
                .orderBy('round', 'desc')
                .limit(1)
                .get();

            if (snapshot.empty) return null;

            const latestRound = snapshot.docs[0].data().round;

            // Find user's pairing in this round
            const userPairings = await db.collection('groups').doc(groupId)
                .collection('pairings')
                .where('round', '==', latestRound)
                .where('members', 'array-contains', userId)
                .get();

            if (userPairings.empty) return null;

            return { id: userPairings.docs[0].id, ...userPairings.docs[0].data() };
        } catch (error) {
            console.error('Error getting current pairing:', error);
            return null;
        }
    },

    // Get all pairings for a round
    async getRoundPairings(groupId, round) {
        try {
            const snapshot = await db.collection('groups').doc(groupId)
                .collection('pairings')
                .where('round', '==', round)
                .get();

            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error('Error getting round pairings:', error);
            return [];
        }
    },

    // Get latest round number
    async getLatestRound(groupId) {
        try {
            const snapshot = await db.collection('groups').doc(groupId)
                .collection('pairings')
                .orderBy('round', 'desc')
                .limit(1)
                .get();

            if (snapshot.empty) return 0;
            return snapshot.docs[0].data().round;
        } catch (error) {
            console.error('Error getting latest round:', error);
            return 0;
        }
    },

    // Get user's pairing history
    async getUserPairingHistory(groupId, userId) {
        try {
            const snapshot = await db.collection('groups').doc(groupId)
                .collection('pairings')
                .where('members', 'array-contains', userId)
                .orderBy('round', 'desc')
                .get();

            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error('Error getting pairing history:', error);
            return [];
        }
    }
};
