// Reveal Module for Three People Meet

const Reveal = {
    isRevealing: false,
    unsubscribeReveal: null,
    seenRevealRound: null,

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

        // Mark this round as seen so we don't show it again
        Reveal.seenRevealRound = pairing.round;

        // Get group color
        const group = Groups.currentGroup || await Groups.getGroup(groupId);
        const groupColor = group?.color || '#E07A5F';

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

                // Fade out countdown
                countdownEl.classList.add('fade-out');

                // After fade completes, show reveal content
                setTimeout(() => {
                    countdownEl.classList.add('hidden');
                    countdownEl.classList.remove('fade-out');
                    revealContent.classList.remove('hidden');

                    // Populate reveal card (elements start hidden)
                    Reveal.populateRevealCard(pairingMembers, pairing, groupColor);

                    // Flip card after short delay
                    setTimeout(() => {
                        revealCard.classList.add('flipped');

                        // Start sequential reveal after card flip
                        setTimeout(() => {
                            Reveal.animateSequentialReveal(pairingMembers.length, pairing.sharedInterests?.length || 0);
                        }, 800);
                    }, 500);
                }, 800); // Wait for fade animation
            }
        }, 1000);
    },

    // Populate the reveal card with pairing data (elements start hidden)
    populateRevealCard(members, pairing, groupColor = '#E07A5F') {
        // Members - each starts hidden
        const membersContainer = document.getElementById('reveal-members');
        membersContainer.innerHTML = members.map(member => `
            <div class="reveal-member reveal-hidden">
                <div class="member-avatar" style="background-color: ${groupColor}40">${App.getMemberAvatar(member)}</div>
                <div class="member-name">${member.displayName}</div>
            </div>
        `).join('');

        // Shared interests - header and each tag starts hidden
        const interestsContainer = document.getElementById('reveal-interests');
        if (pairing.sharedInterests && pairing.sharedInterests.length > 0) {
            interestsContainer.innerHTML = `
                <h4 class="reveal-hidden">Shared Interests</h4>
                <div class="shared-interests-tags">
                    ${pairing.sharedInterests.map(i => `<span class="shared-tag reveal-hidden">${i}</span>`).join('')}
                </div>
            `;
        } else {
            interestsContainer.innerHTML = `
                <h4 class="reveal-hidden">Shared Interests</h4>
                <p class="reveal-hidden" style="color: var(--text-light); font-size: 0.9rem;">Discover new interests together!</p>
            `;
        }
    },

    // Animate sequential reveal of elements
    animateSequentialReveal(memberCount, interestCount) {
        let delay = 0;
        const memberDelay = 2000; // 2 seconds between each person
        const interestDelay = 2000; // 2 seconds between each interest

        // Reveal members one at a time (left to right)
        const members = document.querySelectorAll('#reveal-members .reveal-member');
        members.forEach((member, i) => {
            setTimeout(() => {
                member.classList.remove('reveal-hidden');
                member.classList.add('reveal-animate');
                Reveal.createSparkles(member);
            }, delay);
            delay += memberDelay;
        });

        // Reveal "Shared Interests" header
        const interestsHeader = document.querySelector('#reveal-interests h4');
        if (interestsHeader) {
            setTimeout(() => {
                interestsHeader.classList.remove('reveal-hidden');
                interestsHeader.classList.add('reveal-animate');
            }, delay);
            delay += interestDelay;
        }

        // Reveal each interest tag one at a time
        const interestTags = document.querySelectorAll('#reveal-interests .shared-tag');
        interestTags.forEach((tag, i) => {
            setTimeout(() => {
                tag.classList.remove('reveal-hidden');
                tag.classList.add('reveal-animate');
            }, delay);
            delay += interestDelay;
        });

        // If no interests, reveal the "discover" message
        const discoverMsg = document.querySelector('#reveal-interests p');
        if (discoverMsg && discoverMsg.classList.contains('reveal-hidden')) {
            setTimeout(() => {
                discoverMsg.classList.remove('reveal-hidden');
                discoverMsg.classList.add('reveal-animate');
            }, delay);
            delay += interestDelay;
        }

        // Show continue button
        setTimeout(() => {
            document.getElementById('reveal-done-btn').classList.remove('hidden');
        }, delay + 500);
    },

    // Create sparkle particles around an element
    createSparkles(element) {
        const sparkleChars = ['✨', '⭐'];
        const rect = element.getBoundingClientRect();
        const container = document.getElementById('reveal-container');

        for (let i = 0; i < 12; i++) {
            const sparkle = document.createElement('div');
            sparkle.className = 'floating-sparkle';
            sparkle.textContent = sparkleChars[Math.floor(Math.random() * sparkleChars.length)];

            // Random position around the element
            const angle = (i / 12) * Math.PI * 2;
            const distance = 30 + Math.random() * 40;
            const x = rect.left + rect.width / 2 + Math.cos(angle) * distance - container.getBoundingClientRect().left;
            const y = rect.top + rect.height / 2 + Math.sin(angle) * distance - container.getBoundingClientRect().top;

            sparkle.style.cssText = `
                position: absolute;
                left: ${x}px;
                top: ${y}px;
                font-size: ${0.8 + Math.random() * 0.8}rem;
                pointer-events: none;
                z-index: 100;
                animation: floatSparkle ${1 + Math.random() * 1}s ease-out forwards;
                animation-delay: ${Math.random() * 0.3}s;
            `;

            container.appendChild(sparkle);

            // Remove after animation
            setTimeout(() => sparkle.remove(), 2500);
        }
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
        Reveal.seenRevealRound = null;
    }
};
