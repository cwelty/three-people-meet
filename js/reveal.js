// Reveal Module for ThreePeopleMeet

const Reveal = {
    isRevealing: false,
    unsubscribeReveal: null,
    seenRevealRound: null,
    allPairings: [],
    currentTrioIndex: 0,
    groupColor: '#E07A5F',
    groupMembers: [],
    currentGroupId: null,

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
        Reveal.currentGroupId = groupId;
        Reveal.currentTrioIndex = 0;

        // Get latest round
        const latestRound = await Pairing.getLatestRound(groupId);
        if (latestRound === 0) {
            App.showToast('No pairings found for this round', 'error');
            Reveal.isRevealing = false;
            return;
        }

        // Get ALL pairings for this round
        Reveal.allPairings = await Pairing.getRoundPairings(groupId, latestRound);
        if (Reveal.allPairings.length === 0) {
            App.showToast('No pairings found for this round', 'error');
            Reveal.isRevealing = false;
            return;
        }

        // Mark this round as seen
        Reveal.seenRevealRound = latestRound;

        // Get group color and members
        const group = Groups.currentGroup || await Groups.getGroup(groupId);
        Reveal.groupColor = group?.color || '#E07A5F';
        Reveal.groupMembers = await Groups.getGroupMembers(groupId);

        // Show reveal screen
        App.showScreen('reveal-screen');

        // Start with first trio
        Reveal.showTrioReveal(0);
    },

    // Show reveal for a specific trio
    showTrioReveal(trioIndex) {
        const pairing = Reveal.allPairings[trioIndex];
        const totalTrios = Reveal.allPairings.length;

        const pairingMembers = pairing.members.map(memberId =>
            Reveal.groupMembers.find(m => m.id === memberId)
        ).filter(m => m);

        // Update title
        document.getElementById('reveal-title').textContent = `Trio ${trioIndex + 1}!`;

        // Update progress indicator
        const progressEl = document.getElementById('reveal-progress');
        progressEl.textContent = `${trioIndex + 1} of ${totalTrios}`;
        progressEl.classList.add('hidden'); // Will show after card flip

        // Reset card state
        const revealCard = document.getElementById('reveal-card');
        revealCard.classList.remove('flipped');

        // Hide buttons
        document.getElementById('reveal-next-btn').classList.add('hidden');
        document.getElementById('reveal-done-btn').classList.add('hidden');

        // Show countdown for first trio, skip for subsequent
        const countdownEl = document.getElementById('reveal-countdown');
        const countdownNumber = document.getElementById('countdown-number');
        const revealContent = document.getElementById('reveal-content');

        if (trioIndex === 0) {
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
                    countdownEl.classList.add('fade-out');

                    setTimeout(() => {
                        countdownEl.classList.add('hidden');
                        countdownEl.classList.remove('fade-out');
                        revealContent.classList.remove('hidden');
                        Reveal.flipAndRevealTrio(pairingMembers, pairing, trioIndex);
                    }, 800);
                }
            }, 1000);
        } else {
            // For subsequent trios, just flip directly
            revealContent.classList.remove('hidden');
            Reveal.flipAndRevealTrio(pairingMembers, pairing, trioIndex);
        }
    },

    // Flip card and reveal trio members
    flipAndRevealTrio(pairingMembers, pairing, trioIndex) {
        const revealCard = document.getElementById('reveal-card');
        const totalTrios = Reveal.allPairings.length;

        // Populate reveal card
        Reveal.populateRevealCard(pairingMembers, pairing, Reveal.groupColor);

        // Flip card
        setTimeout(() => {
            revealCard.classList.add('flipped');

            // Show progress indicator
            document.getElementById('reveal-progress').classList.remove('hidden');

            // Start sequential reveal
            setTimeout(() => {
                Reveal.animateSequentialReveal(pairingMembers.length, pairing.sharedInterests?.length || 0, trioIndex, totalTrios);
            }, 800);
        }, 500);
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
    animateSequentialReveal(memberCount, interestCount, trioIndex, totalTrios) {
        let delay = 0;
        const memberDelay = 2000; // 2 seconds between each person
        const interestsDelay = 3000; // 3 seconds for all interests together

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

        // Reveal "Shared Interests" header and all tags together after 3 seconds
        const interestsHeader = document.querySelector('#reveal-interests h4');
        const interestTags = document.querySelectorAll('#reveal-interests .shared-tag');
        const discoverMsg = document.querySelector('#reveal-interests p');

        setTimeout(() => {
            if (interestsHeader) {
                interestsHeader.classList.remove('reveal-hidden');
                interestsHeader.classList.add('reveal-animate');
            }
            // Reveal all interest tags at once
            interestTags.forEach(tag => {
                tag.classList.remove('reveal-hidden');
                tag.classList.add('reveal-animate');
            });
            // If no interests, reveal the "discover" message
            if (discoverMsg && discoverMsg.classList.contains('reveal-hidden')) {
                discoverMsg.classList.remove('reveal-hidden');
                discoverMsg.classList.add('reveal-animate');
            }
        }, delay);

        // Show appropriate button based on whether more trios remain
        setTimeout(() => {
            const isLastTrio = trioIndex >= totalTrios - 1;
            if (isLastTrio) {
                document.getElementById('reveal-done-btn').classList.remove('hidden');
            } else {
                document.getElementById('reveal-next-btn').classList.remove('hidden');
            }
        }, delay + interestsDelay);
    },

    // Show next trio
    showNextTrio() {
        Reveal.currentTrioIndex++;
        if (Reveal.currentTrioIndex < Reveal.allPairings.length) {
            Reveal.showTrioReveal(Reveal.currentTrioIndex);
        }
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

            // Random position around the element (offset up and left to center on avatar)
            const angle = (i / 12) * Math.PI * 2;
            const distance = 30 + Math.random() * 40;
            const centerX = rect.left + rect.width / 2 - 15; // Shift left
            const centerY = rect.top + rect.height / 2 - 25; // Shift up
            const x = centerX + Math.cos(angle) * distance - container.getBoundingClientRect().left;
            const y = centerY + Math.sin(angle) * distance - container.getBoundingClientRect().top;

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
        Reveal.allPairings = [];
        Reveal.currentTrioIndex = 0;
        Reveal.groupMembers = [];
        Reveal.currentGroupId = null;
    }
};
