// Pairing Module for Three People Meet

const Pairing = {
    // Get shared interests between members
    getSharedInterests(members) {
        if (members.length < 2) return [];

        const allInterests = members.map(m => m.interests || []);
        const shared = allInterests[0].filter(interest =>
            allInterests.every(memberInterests => memberInterests.includes(interest))
        );

        return shared;
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

            // Get priority members from last round (those who weren't paired)
            const priorityMemberIds = group.priorityMemberIds || [];

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

            // Separate priority members from regular members
            const priorityMembers = members.filter(m => priorityMemberIds.includes(m.id));
            const regularMembers = members.filter(m => !priorityMemberIds.includes(m.id));

            // Generate all possible trios
            const allTrios = Pairing.generateTrios(members);

            // Score each trio - give bonus to trios containing priority members
            const scoredTrios = allTrios.map(trio => {
                let score = Pairing.calculatePairingScore(trio, history);

                // Bonus for including priority members (they should be paired first)
                const priorityCount = trio.filter(m => priorityMemberIds.includes(m.id)).length;
                score += priorityCount * 50;

                return {
                    members: trio,
                    score: score
                };
            }).sort((a, b) => b.score - a.score);

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

            // Handle leftovers (if members % 3 != 0) - store for next round prioritization
            const leftoverMembers = members.filter(m => !usedMembers.has(m.id));
            const newPriorityMemberIds = leftoverMembers.map(m => m.id);

            // Create a batch write for all pairings
            const batch = db.batch();

            // Update group with new priority members for next round
            const groupRef = db.collection('groups').doc(groupId);
            batch.update(groupRef, {
                priorityMemberIds: newPriorityMemberIds
            });

            // Save each pairing
            for (const pairing of selectedPairings) {
                const memberIds = pairing.members.map(m => m.id);
                const sharedInterests = Pairing.getSharedInterests(pairing.members);

                const pairingRef = db.collection('groups').doc(groupId)
                    .collection('pairings').doc();

                batch.set(pairingRef, {
                    round: currentRound,
                    members: memberIds,
                    sharedInterests: sharedInterests,
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

            await batch.commit();

            // Build result message
            let resultMessage = '';
            if (leftoverMembers.length > 0) {
                const leftoverNames = leftoverMembers.map(m => m.displayName).join(', ');
                resultMessage = `${leftoverNames} will be prioritized next round.`;
            }

            return {
                success: true,
                round: currentRound,
                pairingsCount: selectedPairings.length,
                leftoverCount: leftoverMembers.length,
                message: resultMessage
            };
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
