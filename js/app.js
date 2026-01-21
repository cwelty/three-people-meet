// Main App Module for Three People Meet

const App = {
    currentGroupId: null,

    // Predefined interests list
    interests: [
        // Outdoors & Nature
        'Hiking', 'Camping', 'Nature', 'Gardening', 'Fishing', 'Beach', 'Mountains', 'Cycling', 'Running', 'Walking',
        // Food & Drink
        'Cooking', 'Baking', 'Restaurants', 'Coffee', 'Wine', 'Food', 'Brunch', 'Sushi', 'Pizza', 'Vegetarian',
        // Creative
        'Art', 'Music', 'Photography', 'Drawing', 'Painting', 'Crafts', 'Design', 'Writing', 'Poetry', 'Theater',
        // Active
        'Sports', 'Fitness', 'Yoga', 'Gym', 'Swimming', 'Basketball', 'Soccer', 'Tennis', 'Golf', 'Dancing',
        // Social & Entertainment
        'Games', 'Movies', 'Trivia', 'Karaoke', 'Comedy', 'Concerts', 'Festivals', 'Parties', 'Travel', 'Volunteering',
        // Learning & Intellectual
        'Reading', 'Technology', 'Languages', 'Science', 'History', 'Books', 'Podcasts', 'Documentaries', 'Philosophy', 'Psychology',
        // Lifestyle
        'Meditation', 'Pets', 'Fashion', 'Sustainability', 'DIY', 'Cars', 'Anime', 'Gaming', 'Collectibles', 'Investing'
    ],

    selectedInterests: [],

    // Initialize the app
    init() {
        Auth.init();
        App.setupEventListeners();
    },

    // Handle auth state changes
    onAuthStateChanged(isLoggedIn) {
        if (isLoggedIn) {
            if (!Auth.hasInterests()) {
                App.showScreen('interests-screen');
                App.renderInterestsGrid();
            } else {
                App.showMainScreen();
            }
        } else {
            App.showScreen('auth-screen');
        }
    },

    // Setup all event listeners
    setupEventListeners() {
        // Auth forms
        document.getElementById('login-form').addEventListener('submit', App.handleLogin);
        document.getElementById('register-form').addEventListener('submit', App.handleRegister);
        document.getElementById('show-register').addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('login-form').classList.add('hidden');
            document.getElementById('register-form').classList.remove('hidden');
        });
        document.getElementById('show-login').addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('register-form').classList.add('hidden');
            document.getElementById('login-form').classList.remove('hidden');
        });

        // Interests
        document.getElementById('save-interests-btn').addEventListener('click', App.handleSaveInterests);

        // Main screen
        document.getElementById('profile-btn').addEventListener('click', () => App.showScreen('profile-screen'));
        document.getElementById('create-group-btn').addEventListener('click', () => App.showModal('create-group-modal'));
        document.getElementById('join-group-btn').addEventListener('click', () => App.showModal('join-group-modal'));

        // Group forms
        document.getElementById('create-group-form').addEventListener('submit', App.handleCreateGroup);
        document.getElementById('join-group-form').addEventListener('submit', App.handleJoinGroup);

        // Modal closes
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', () => App.hideModals());
        });
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) App.hideModals();
            });
        });

        // Group screen
        document.getElementById('back-to-groups').addEventListener('click', () => {
            Groups.cleanup();
            Reveal.cleanup();
            App.showMainScreen();
        });
        document.getElementById('leave-group-btn').addEventListener('click', App.handleLeaveGroup);
        document.getElementById('generate-pairings-btn').addEventListener('click', App.handleGeneratePairings);
        document.getElementById('view-all-pairings-btn').addEventListener('click', App.handleViewAllPairings);
        document.getElementById('trigger-reveal-btn').addEventListener('click', App.handleTriggerReveal);

        // Profile screen
        document.getElementById('back-from-profile').addEventListener('click', () => App.showMainScreen());
        document.getElementById('edit-interests-btn').addEventListener('click', () => {
            App.selectedInterests = [...Auth.userData.interests];
            App.renderInterestsGrid();
            App.showScreen('interests-screen');
        });
        document.getElementById('logout-btn').addEventListener('click', App.handleLogout);

        // Reveal done
        document.getElementById('reveal-done-btn').addEventListener('click', () => {
            Reveal.handleRevealDone(App.currentGroupId);
        });
    },

    // Screen management
    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        document.getElementById(screenId).classList.add('active');
    },

    // Modal management
    showModal(modalId) {
        document.getElementById(modalId).classList.add('active');
    },

    hideModals() {
        document.querySelectorAll('.modal').forEach(m => m.classList.remove('active'));
    },

    // Toast notifications
    showToast(message, type = 'info') {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.className = `toast ${type} active`;

        setTimeout(() => {
            toast.classList.remove('active');
        }, 3000);
    },

    // Auth handlers
    async handleLogin(e) {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        const result = await Auth.login(email, password);
        if (!result.success) {
            App.showAuthError(result.error);
        }
    },

    async handleRegister(e) {
        e.preventDefault();
        const name = document.getElementById('register-name').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;

        const result = await Auth.register(email, password, name);
        if (!result.success) {
            App.showAuthError(result.error);
        }
    },

    showAuthError(message) {
        const errorEl = document.getElementById('auth-error');
        errorEl.textContent = message;
        errorEl.classList.remove('hidden');
        setTimeout(() => errorEl.classList.add('hidden'), 5000);
    },

    async handleLogout() {
        await Auth.logout();
        Groups.cleanup();
        Reveal.cleanup();
    },

    // Interests
    renderInterestsGrid() {
        const grid = document.getElementById('interests-grid');
        grid.innerHTML = App.interests.map(interest => `
            <div class="interest-chip ${App.selectedInterests.includes(interest) ? 'selected' : ''}"
                 data-interest="${interest}">
                ${interest}
            </div>
        `).join('');

        // Add click handlers
        grid.querySelectorAll('.interest-chip').forEach(chip => {
            chip.addEventListener('click', () => App.toggleInterest(chip));
        });

        App.updateInterestsCount();
    },

    toggleInterest(chip) {
        const interest = chip.dataset.interest;

        if (App.selectedInterests.includes(interest)) {
            App.selectedInterests = App.selectedInterests.filter(i => i !== interest);
            chip.classList.remove('selected');
        } else if (App.selectedInterests.length < 10) {
            App.selectedInterests.push(interest);
            chip.classList.add('selected');
        }

        App.updateInterestsCount();
    },

    updateInterestsCount() {
        const count = App.selectedInterests.length;
        document.getElementById('interests-count').textContent = `${count} / 10 selected`;
        document.getElementById('save-interests-btn').disabled = count !== 10;
    },

    async handleSaveInterests() {
        if (App.selectedInterests.length !== 10) return;

        const result = await Auth.saveInterests(App.selectedInterests);
        if (result.success) {
            App.showToast('Interests saved!', 'success');
            App.showMainScreen();
        } else {
            App.showToast('Error saving interests', 'error');
        }
    },

    // Main screen
    async showMainScreen() {
        App.showScreen('main-screen');
        App.updateProfileDisplay();
        await App.loadGroups();
    },

    updateProfileDisplay() {
        if (Auth.userData) {
            document.getElementById('profile-name').textContent = Auth.userData.displayName || 'User';
            document.getElementById('profile-email').textContent = Auth.userData.email;

            const interestsTags = document.getElementById('profile-interests');
            if (Auth.userData.interests && Auth.userData.interests.length > 0) {
                interestsTags.innerHTML = Auth.userData.interests
                    .map(i => `<span class="interest-tag">${i}</span>`).join('');
            } else {
                interestsTags.innerHTML = '<p>No interests set</p>';
            }
        }
    },

    async loadGroups() {
        const groups = await Groups.getUserGroups();
        const list = document.getElementById('groups-list');
        const noGroups = document.getElementById('no-groups');

        if (groups.length === 0) {
            list.innerHTML = '';
            noGroups.classList.remove('hidden');
        } else {
            noGroups.classList.add('hidden');
            list.innerHTML = groups.map(group => `
                <div class="group-card" data-group-id="${group.id}">
                    <h3>${group.name}</h3>
                    <p class="member-count">${group.memberIds.length} member${group.memberIds.length !== 1 ? 's' : ''}</p>
                </div>
            `).join('');

            // Add click handlers
            list.querySelectorAll('.group-card').forEach(card => {
                card.addEventListener('click', () => App.showGroupScreen(card.dataset.groupId));
            });
        }
    },

    // Group handlers
    async handleCreateGroup(e) {
        e.preventDefault();
        const name = document.getElementById('group-name').value;

        const result = await Groups.createGroup(name);
        if (result.success) {
            App.hideModals();
            document.getElementById('group-name').value = '';
            App.showToast(`Group created! Code: ${result.code}`, 'success');
            App.loadGroups();
        } else {
            App.showToast(result.error, 'error');
        }
    },

    async handleJoinGroup(e) {
        e.preventDefault();
        const code = document.getElementById('group-code').value;

        const result = await Groups.joinGroup(code);
        if (result.success) {
            App.hideModals();
            document.getElementById('group-code').value = '';
            App.showToast(`Joined ${result.groupName}!`, 'success');
            App.loadGroups();
        } else {
            const joinError = document.getElementById('join-error');
            joinError.textContent = result.error;
            joinError.classList.remove('hidden');
            setTimeout(() => joinError.classList.add('hidden'), 5000);
        }
    },

    async handleLeaveGroup() {
        if (!confirm('Are you sure you want to leave this group?')) return;

        const result = await Groups.leaveGroup(App.currentGroupId);
        if (result.success) {
            Groups.cleanup();
            Reveal.cleanup();
            App.showToast('Left group', 'success');
            App.showMainScreen();
        } else {
            App.showToast(result.error, 'error');
        }
    },

    // Group screen
    async showGroupScreen(groupId) {
        App.currentGroupId = groupId;
        App.showScreen('group-screen');

        const group = await Groups.getGroup(groupId);
        if (!group) {
            App.showToast('Group not found', 'error');
            App.showMainScreen();
            return;
        }

        Groups.currentGroup = group;

        // Update header
        document.getElementById('group-title').textContent = group.name;
        document.getElementById('group-code-display').innerHTML = `Code: <span class="group-code">${group.code}</span>`;

        // Show/hide creator controls
        const creatorControls = document.getElementById('creator-controls');
        if (Groups.isCreator(group)) {
            creatorControls.classList.remove('hidden');
        } else {
            creatorControls.classList.add('hidden');
        }

        // Load members
        await App.loadGroupMembers(groupId);

        // Load current pairing
        await App.loadCurrentPairing(groupId);

        // Load pairing history
        await App.loadPairingHistory(groupId);

        // Subscribe to reveal state
        Reveal.subscribeToReveal(groupId, (state) => {
            if (state.inProgress && !Reveal.isRevealing) {
                Reveal.showReveal(groupId, Auth.currentUser.uid);
            }
        });

        // Subscribe to group changes for real-time updates
        Groups.subscribeToGroup(groupId, (updatedGroup) => {
            Groups.currentGroup = updatedGroup;
            document.getElementById('member-count').textContent = updatedGroup.memberIds.length;
        });
    },

    async loadGroupMembers(groupId) {
        const members = await Groups.getGroupMembers(groupId);
        const group = Groups.currentGroup;

        document.getElementById('member-count').textContent = members.length;

        const membersList = document.getElementById('members-list');
        membersList.innerHTML = members.map(member => {
            const isCreator = group.creatorIds && group.creatorIds.includes(member.id);
            return `
                <div class="member-item">
                    <div class="member-avatar">${App.getInitials(member.displayName)}</div>
                    <span class="member-name">${member.displayName}</span>
                    ${isCreator ? '<span class="member-badge">Creator</span>' : ''}
                </div>
            `;
        }).join('');
    },

    async loadCurrentPairing(groupId) {
        const pairing = await Pairing.getCurrentPairing(groupId, Auth.currentUser.uid);
        const container = document.getElementById('current-pairing');

        if (!pairing) {
            container.innerHTML = '<p class="no-pairing">No pairings yet. Wait for a creator to generate pairings!</p>';
            container.classList.add('no-pairing-card');
            return;
        }

        container.classList.remove('no-pairing-card');

        // Get member details
        const members = Groups.groupMembers;
        const pairingMembers = pairing.members.map(id => members.find(m => m.id === id)).filter(m => m);

        container.innerHTML = `
            <div class="pairing-members">
                ${pairingMembers.map(m => `
                    <div class="pairing-member">
                        <div class="member-avatar">${App.getInitials(m.displayName)}</div>
                        <div class="member-name">${m.displayName}</div>
                    </div>
                `).join('')}
            </div>
            ${pairing.sharedInterests.length > 0 ? `
                <div class="shared-interests">
                    <h4>Shared Interests</h4>
                    <div class="shared-interests-tags">
                        ${pairing.sharedInterests.map(i => `<span class="shared-tag">${i}</span>`).join('')}
                    </div>
                </div>
            ` : ''}
            <div class="suggested-activity">
                <h4>Suggested Activity</h4>
                <p>${pairing.suggestedActivity}</p>
            </div>
        `;
    },

    async loadPairingHistory(groupId) {
        const history = await Pairing.getUserPairingHistory(groupId, Auth.currentUser.uid);
        const container = document.getElementById('pairing-history');

        if (history.length === 0) {
            container.innerHTML = '<p class="no-history">No pairing history yet.</p>';
            return;
        }

        const members = Groups.groupMembers;

        container.innerHTML = history.map(pairing => {
            const pairingMembers = pairing.members.map(id => members.find(m => m.id === id)).filter(m => m);
            const memberNames = pairingMembers.map(m => m.displayName).join(', ');

            return `
                <div class="history-item">
                    <div class="round-label">Round ${pairing.round}</div>
                    <div class="history-members">${memberNames}</div>
                    <div class="history-activity">${pairing.suggestedActivity}</div>
                </div>
            `;
        }).join('');
    },

    // Pairing handlers
    async handleGeneratePairings() {
        const btn = document.getElementById('generate-pairings-btn');
        btn.disabled = true;
        btn.textContent = 'Generating...';

        const result = await Pairing.generatePairings(App.currentGroupId);

        btn.disabled = false;
        btn.textContent = 'Generate New Pairings';

        if (result.success) {
            App.showToast(`Round ${result.round} pairings created!`, 'success');
            await App.loadCurrentPairing(App.currentGroupId);
            await App.loadPairingHistory(App.currentGroupId);
        } else {
            App.showToast(result.error, 'error');
        }
    },

    async handleViewAllPairings() {
        const latestRound = await Pairing.getLatestRound(App.currentGroupId);
        if (latestRound === 0) {
            App.showToast('No pairings yet', 'error');
            return;
        }

        const pairings = await Pairing.getRoundPairings(App.currentGroupId, latestRound);
        const members = Groups.groupMembers;

        document.getElementById('current-round').textContent = latestRound;

        const list = document.getElementById('all-pairings-list');
        list.innerHTML = pairings.map(pairing => {
            const pairingMembers = pairing.members.map(id => members.find(m => m.id === id)).filter(m => m);

            return `
                <div class="pairing-item">
                    <div class="pairing-members">
                        ${pairingMembers.map(m => `
                            <div class="pairing-member">
                                <div class="member-avatar">${App.getInitials(m.displayName)}</div>
                                <div class="member-name">${m.displayName}</div>
                            </div>
                        `).join('')}
                    </div>
                    <div style="margin-top: 8px; font-size: 0.9rem; color: var(--text-medium);">
                        ${pairing.suggestedActivity}
                    </div>
                </div>
            `;
        }).join('');

        App.showModal('all-pairings-modal');
    },

    async handleTriggerReveal() {
        const result = await Reveal.triggerReveal(App.currentGroupId);
        if (result.success) {
            // The reveal subscription will handle showing the reveal screen
        } else {
            App.showToast(result.error, 'error');
        }
    },

    // Utility
    getInitials(name) {
        if (!name) return '?';
        const parts = name.trim().split(' ');
        if (parts.length >= 2) {
            return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    }
};

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
