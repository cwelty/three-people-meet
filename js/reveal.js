// Reveal Module for Three People Meet

const Reveal = {
    isRevealing: false,
    unsubscribeReveal: null,

    // Trigger dramatic reveal for all group members
    async triggerReveal(groupId) {
        if (!Auth.currentUser) return { success: false, error: 'Not logged in' };

        try {
            const group = await Groups.getGroup(groupId);
            if (!group || !Groups.isCreator(group)) {
                return { success: false, error: 'Only creators can trigger reveals.' };
            }

            // Get latest round
            const latestRound = await Pairing.getLatestRound(groupId);
            if (latestRound === 0) {
                return { success: false, error: 'No pairings to reveal.' };
            }

            // Set reveal flag on group
            await db.collection('groups').doc(groupId).update({
                revealInProgress: true,
                revealRound: latestRound,
                revealStartedAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            return { success: true, round: latestRound };
        } catch (error) {
            console.error('Error triggering reveal:', error);
            return { success: false, error: error.message };
        }
    },

    // Subscribe to reveal state changes
    subscribeToReveal(groupId, callback) {
        Reveal.unsubscribeReveal = db.collection('groups').doc(groupId)
            .onSnapshot((doc) => {
                if (doc.exists) {
                    const data = doc.data();
                    if (data.revealInProgress) {
                        callback({
                            inProgress: true,
                            round: data.revealRound
                        });
                    } else {
                        callback({ inProgress: false });
                    }
                }
            }, (error) => {
                console.error('Error in reveal subscription:', error);
            });

        return Reveal.unsubscribeReveal;
    },

    // End reveal mode
    async endReveal(groupId) {
        try {
            await db.collection('groups').doc(groupId).update({
                revealInProgress: false,
                revealRound: null,
                revealStartedAt: null
            });
        } catch (error) {
            console.error('Error ending reveal:', error);
        }
    },

    // Show reveal screen with countdown and card flip
    async showReveal(groupId, userId) {
        Reveal.isRevealing = true;

        // Get user's pairing for the reveal round
        const pairing = await Pairing.getCurrentPairing(groupId, userId);
        if (!pairing) {
            App.showToast('No pairing found for this round', 'error');
            Reveal.isRevealing = false;
            return;
        }

        // Get member data
        const members = await Groups.getGroupMembers(groupId);
        const pairingMembers = pairing.members.map(memberId =>
            members.find(m => m.id === memberId)
        ).filter(m => m);

        // Show reveal screen
        App.showScreen('reveal-screen');

        // Reset card state
        const revealCard = document.getElementById('reveal-card');
        revealCard.classList.remove('flipped');

        // Show countdown
        const countdownEl = document.getElementById('reveal-countdown');
        const countdownNumber = document.getElementById('countdown-number');
        const revealContent = document.getElementById('reveal-content');

        countdownEl.classList.remove('hidden');
        revealContent.classList.add('hidden');

        // Countdown animation
        let count = 3;
        countdownNumber.textContent = count;

        const countdownInterval = setInterval(() => {
            count--;
            if (count > 0) {
                countdownNumber.textContent = count;
            } else {
                clearInterval(countdownInterval);
                countdownEl.classList.add('hidden');
                revealContent.classList.remove('hidden');

                // Populate reveal card
                Reveal.populateRevealCard(pairingMembers, pairing);

                // Flip card after short delay
                setTimeout(() => {
                    revealCard.classList.add('flipped');

                    // Show done button after flip
                    setTimeout(() => {
                        document.getElementById('reveal-done-btn').classList.remove('hidden');
                    }, 1000);
                }, 500);
            }
        }, 1000);
    },

    // Populate the reveal card with pairing data
    populateRevealCard(members, pairing) {
        // Members
        const membersContainer = document.getElementById('reveal-members');
        membersContainer.innerHTML = members.map(member => `
            <div class="reveal-member">
                <div class="member-avatar">${Reveal.getInitials(member.displayName)}</div>
                <div class="member-name">${member.displayName}</div>
            </div>
        `).join('');

        // Shared interests
        const interestsContainer = document.getElementById('reveal-interests');
        if (pairing.sharedInterests && pairing.sharedInterests.length > 0) {
            interestsContainer.innerHTML = `
                <h4>Shared Interests</h4>
                <div class="shared-interests-tags">
                    ${pairing.sharedInterests.map(i => `<span class="shared-tag">${i}</span>`).join('')}
                </div>
            `;
        } else {
            interestsContainer.innerHTML = `
                <h4>Shared Interests</h4>
                <p style="color: var(--text-light); font-size: 0.9rem;">Discover new interests together!</p>
            `;
        }

        // Activity
        const activityContainer = document.getElementById('reveal-activity');
        activityContainer.innerHTML = `
            <h4>Suggested Activity</h4>
            <p>${pairing.suggestedActivity}</p>
        `;
    },

    // Get initials from name
    getInitials(name) {
        if (!name) return '?';
        const parts = name.trim().split(' ');
        if (parts.length >= 2) {
            return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    },

    // Handle reveal done
    handleRevealDone(groupId) {
        Reveal.isRevealing = false;
        document.getElementById('reveal-done-btn').classList.add('hidden');

        // Go back to group screen
        App.showGroupScreen(groupId);
    },

    // Cleanup
    cleanup() {
        if (Reveal.unsubscribeReveal) {
            Reveal.unsubscribeReveal();
            Reveal.unsubscribeReveal = null;
        }
        Reveal.isRevealing = false;
    }
};
