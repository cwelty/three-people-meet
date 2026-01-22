// Main App Module for Three People Meet

const App = {
    currentGroupId: null,

    // Animal emoji avatars
    avatars: [
        '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼',
        '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔',
        '🐧', '🐦', '🐤', '🦆', '🦅', '🦉', '🦇', '🐺',
        '🐗', '🐴', '🦄', '🐝', '🐛', '🦋', '🐌', '🐞',
        '🐙', '🦑', '🦐', '🦀', '🐡', '🐠', '🐟', '🐬',
        '🐳', '🦈', '🐊', '🐢', '🦎', '🐍', '🦖', '🦕'
    ],

    selectedAvatar: null,

    // Group icons (landscape/location themed)
    groupIcons: [
        '🏠', '🏡', '🏘️', '🏰', '🏯', '⛪', '🕌', '🛕',
        '⛩️', '🏛️', '🏗️', '🏢', '🏬', '🏭', '🏪', '🏫',
        '⛰️', '🏔️', '🗻', '🌋', '🏕️', '🏖️', '🏜️', '🏝️',
        '🌲', '🌳', '🌴', '🌵', '🌾', '🌿', '🍀', '🌺',
        '🌸', '🌼', '🌻', '🌹', '🪻', '💐', '🪴', '🎋',
        '🌅', '🌄', '🌇', '🌆', '🌃', '🌉', '🎡', '🎢',
        '⛺', '🛖', '🏚️', '🗼', '🗽', '⛲', '🌊', '🏞️'
    ],

    // Group colors
    groupColors: [
        '#E07A5F', // Coral (primary)
        '#81B29A', // Sage green
        '#F2CC8F', // Warm yellow
        '#3D405B', // Dark blue-gray
        '#9B5DE5', // Purple
        '#F15BB5', // Pink
        '#00BBF9', // Blue
        '#00F5D4', // Teal
        '#FEE440', // Yellow
        '#FF6B6B', // Red
        '#4ECDC4', // Turquoise
        '#45B7D1'  // Sky blue
    ],

    selectedGroupIcon: null,
    selectedGroupColor: null,

    // Predefined interests list
    interests: [
        // Outdoors & Nature
        'Hiking', 'Camping', 'Nature', 'Gardening', 'Fishing', 'Beach', 'Mountains', 'Cycling', 'Running', 'Walking', 'Road Trips',
        // Food & Drink
        'Cooking', 'Baking', 'Restaurants', 'Coffee', 'Matcha', 'Tea', 'Wine', 'Beer', 'Food', 'Brunch', 'Sushi', 'Tacos', 'Pizza', 'Vegetarian', 'Healthy Eating',
        // Creative
        'Art', 'Music', 'Photography', 'Drawing', 'Painting', 'Crafts', 'Design', 'Writing', 'Poetry', 'Theater', 'DJing', 'Songwriting',
        // Active
        'Sports', 'Fitness', 'Yoga', 'Gym', 'Swimming', 'Basketball', 'Soccer', 'Tennis', 'Golf', 'Dancing', 'Volleyball', 'Disc Golf', 'Rock Climbing',
        // Social & Entertainment
        'Games', 'Movies', 'Trivia', 'Karaoke', 'Comedy', 'Concerts', 'Festivals', 'Parties', 'Travel', 'Volunteering',
        // Learning & Intellectual
        'Reading', 'Technology', 'Languages', 'Science', 'History', 'Books', 'Podcasts', 'Documentaries', 'Philosophy', 'Psychology',
        // Lifestyle
        'Meditation', 'Pets', 'Cats', 'Dogs', 'Fashion', 'Sustainability', 'DIY', 'Cars', 'Anime', 'Gaming', 'Collectibles', 'Investing', 'Dominion', 'Pokemon Cards'
    ],

    selectedInterests: [],

    // Initialize the app
    init() {
        console.log('App.init() called');
        Auth.init();
        App.setupEventListeners();
        console.log('App.init() complete');
    },

    // Handle auth state changes
    onAuthStateChanged(isLoggedIn) {
        console.log('App.onAuthStateChanged called with:', isLoggedIn);
        if (isLoggedIn) {
            if (!Auth.hasInterests()) {
                console.log('Showing interests screen');
                App.showScreen('interests-screen');
                App.renderAvatarGrid('avatar-grid');
                App.renderInterestsGrid();
            } else {
                console.log('Showing main screen');
                App.showMainScreen();
            }
        } else {
            console.log('Showing auth screen');
            App.showScreen('auth-screen');
        }
    },

    // Setup all event listeners
    setupEventListeners() {
        // Google Sign-In
        document.getElementById('google-sign-in-btn').addEventListener('click', App.handleGoogleSignIn);

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
            App.selectedAvatar = Auth.userData.avatar || null;
            App.selectedInterests = [...(Auth.userData.interests || [])];
            App.renderAvatarGrid('avatar-grid');
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
        console.log('showScreen called with:', screenId);
        const screens = document.querySelectorAll('.screen');
        console.log('Found screens:', screens.length);
        screens.forEach(s => {
            console.log('Removing active from:', s.id);
            s.classList.remove('active');
        });
        const targetScreen = document.getElementById(screenId);
        console.log('Target screen element:', targetScreen);
        if (targetScreen) {
            targetScreen.classList.add('active');
            console.log('Added active class to:', screenId);
        } else {
            console.error('Screen not found:', screenId);
        }
    },

    // Modal management
    showModal(modalId) {
        const modal = document.getElementById(modalId);
        modal.classList.remove('hidden');
        modal.classList.add('active');

        // Initialize group icon/color grids for create modal
        if (modalId === 'create-group-modal') {
            App.selectedGroupIcon = App.groupIcons[0];
            App.selectedGroupColor = App.groupColors[0];
            App.renderGroupIconGrid('group-icon-grid');
            App.renderGroupColorGrid('group-color-grid');
        }
    },

    hideModals() {
        document.querySelectorAll('.modal').forEach(m => {
            m.classList.remove('active');
            m.classList.add('hidden');
        });
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
    async handleGoogleSignIn() {
        const btn = document.getElementById('google-sign-in-btn');
        btn.disabled = true;
        btn.textContent = 'Signing in...';

        const result = await Auth.signInWithGoogle();

        btn.disabled = false;
        btn.innerHTML = `
            <svg class="google-icon" viewBox="0 0 24 24" width="20" height="20">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
        `;

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

    // Avatar selection
    renderAvatarGrid(gridId) {
        const grid = document.getElementById(gridId);
        const currentAvatar = Auth.userData?.avatar || App.selectedAvatar;

        grid.innerHTML = App.avatars.map(avatar => `
            <div class="avatar-option ${currentAvatar === avatar ? 'selected' : ''}" data-avatar="${avatar}">
                ${avatar}
            </div>
        `).join('');

        // Add click handlers
        grid.querySelectorAll('.avatar-option').forEach(option => {
            option.addEventListener('click', () => App.selectAvatar(option, gridId));
        });
    },

    selectAvatar(option, gridId) {
        const avatar = option.dataset.avatar;
        App.selectedAvatar = avatar;

        // Update UI
        const grid = document.getElementById(gridId);
        grid.querySelectorAll('.avatar-option').forEach(opt => opt.classList.remove('selected'));
        option.classList.add('selected');

        // If on profile screen, save immediately
        if (gridId === 'profile-avatar-grid') {
            App.saveAvatar(avatar);
        }

        // Update validation
        App.updateSaveButtonState();
    },

    async saveAvatar(avatar) {
        const result = await Auth.saveAvatar(avatar);
        if (result.success) {
            document.getElementById('profile-avatar').textContent = avatar;
            App.showToast('Avatar updated!', 'success');
        }
    },

    updateSaveButtonState() {
        const count = App.selectedInterests.length;
        const hasAvatar = App.selectedAvatar !== null;
        document.getElementById('save-interests-btn').disabled = count < 10 || !hasAvatar;
    },

    // Group icon and color selection
    renderGroupIconGrid(gridId, currentIcon = null) {
        const grid = document.getElementById(gridId);
        const selected = currentIcon || App.selectedGroupIcon;

        grid.innerHTML = App.groupIcons.map(icon => `
            <div class="group-icon-option ${selected === icon ? 'selected' : ''}" data-icon="${icon}">
                ${icon}
            </div>
        `).join('');

        grid.querySelectorAll('.group-icon-option').forEach(option => {
            option.addEventListener('click', () => App.selectGroupIcon(option, gridId));
        });
    },

    selectGroupIcon(option, gridId) {
        const icon = option.dataset.icon;
        App.selectedGroupIcon = icon;

        const grid = document.getElementById(gridId);
        grid.querySelectorAll('.group-icon-option').forEach(opt => opt.classList.remove('selected'));
        option.classList.add('selected');

        // If editing existing group, save immediately
        if (gridId === 'edit-group-icon-grid' && App.currentGroupId) {
            App.saveGroupAppearance();
        }
    },

    renderGroupColorGrid(gridId, currentColor = null) {
        const grid = document.getElementById(gridId);
        const selected = currentColor || App.selectedGroupColor;

        grid.innerHTML = App.groupColors.map(color => `
            <div class="group-color-option ${selected === color ? 'selected' : ''}"
                 data-color="${color}"
                 style="background-color: ${color}">
            </div>
        `).join('');

        grid.querySelectorAll('.group-color-option').forEach(option => {
            option.addEventListener('click', () => App.selectGroupColor(option, gridId));
        });
    },

    selectGroupColor(option, gridId) {
        const color = option.dataset.color;
        App.selectedGroupColor = color;

        const grid = document.getElementById(gridId);
        grid.querySelectorAll('.group-color-option').forEach(opt => opt.classList.remove('selected'));
        option.classList.add('selected');

        // If editing existing group, save immediately
        if (gridId === 'edit-group-color-grid' && App.currentGroupId) {
            App.saveGroupAppearance();
        }
    },

    async saveGroupAppearance() {
        if (!App.currentGroupId) return;

        const result = await Groups.updateGroupAppearance(
            App.currentGroupId,
            App.selectedGroupIcon,
            App.selectedGroupColor
        );

        if (result.success) {
            App.showToast('Group appearance updated!', 'success');
        }
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
        } else {
            App.selectedInterests.push(interest);
            chip.classList.add('selected');
        }

        App.updateInterestsCount();
    },

    updateInterestsCount() {
        const count = App.selectedInterests.length;
        document.getElementById('interests-count').textContent = `${count} selected`;
        App.updateSaveButtonState();
    },

    async handleSaveInterests() {
        if (App.selectedInterests.length < 10 || !App.selectedAvatar) return;

        const result = await Auth.saveProfile(App.selectedAvatar, App.selectedInterests);
        if (result.success) {
            App.showToast('Profile saved!', 'success');
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
            const avatar = Auth.userData.avatar || '👤';
            document.getElementById('profile-name').textContent = Auth.userData.displayName || 'User';
            document.getElementById('profile-email').textContent = Auth.userData.email;
            document.getElementById('profile-avatar').textContent = avatar;

            // Update header profile button with avatar
            const profileBtn = document.querySelector('#profile-btn .icon-profile');
            if (profileBtn) {
                profileBtn.textContent = avatar;
            }

            // Render avatar grid for profile
            App.renderAvatarGrid('profile-avatar-grid');

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
            list.innerHTML = groups.map(group => {
                const icon = group.icon || '🏠';
                const color = group.color || '#E07A5F';
                return `
                    <div class="group-card" data-group-id="${group.id}" style="border-left: 6px solid ${color}">
                        <div class="group-card-header">
                            <span class="group-icon" style="background-color: ${color}30">${icon}</span>
                            <div class="group-card-info">
                                <h3>${group.name}</h3>
                                <p class="member-count">${group.memberIds.length} member${group.memberIds.length !== 1 ? 's' : ''}</p>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');

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
        const icon = App.selectedGroupIcon || App.groupIcons[0];
        const color = App.selectedGroupColor || App.groupColors[0];

        const result = await Groups.createGroup(name, icon, color);
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
            // Initialize group appearance editors
            App.selectedGroupIcon = group.icon || App.groupIcons[0];
            App.selectedGroupColor = group.color || App.groupColors[0];
            App.renderGroupIconGrid('edit-group-icon-grid', App.selectedGroupIcon);
            App.renderGroupColorGrid('edit-group-color-grid', App.selectedGroupColor);
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
        const groupColor = group.color || '#E07A5F';

        document.getElementById('member-count').textContent = members.length;

        const membersList = document.getElementById('members-list');
        membersList.innerHTML = members.map(member => {
            const isCreator = group.creatorIds && group.creatorIds.includes(member.id);
            return `
                <div class="member-item">
                    <div class="member-avatar" style="background-color: ${groupColor}40">${App.getMemberAvatar(member)}</div>
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
                        <div class="member-avatar">${App.getMemberAvatar(m)}</div>
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
        const groupColor = Groups.currentGroup?.color || '#E07A5F';

        document.getElementById('current-round').textContent = latestRound;

        const list = document.getElementById('all-pairings-list');
        list.innerHTML = pairings.map(pairing => {
            const pairingMembers = pairing.members.map(id => members.find(m => m.id === id)).filter(m => m);

            return `
                <div class="pairing-item">
                    <div class="pairing-members">
                        ${pairingMembers.map(m => `
                            <div class="pairing-member">
                                <div class="member-avatar" style="background-color: ${groupColor}40">${App.getMemberAvatar(m)}</div>
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
    },

    getMemberAvatar(member) {
        return member.avatar || App.getInitials(member.displayName);
    }
};

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
