// Main App Module for ThreePeopleMeet

const App = {
    currentGroupId: null,

    // Animal emoji avatars - comprehensive list
    avatars: [
        // Mammals
        '🐶', '🐕', '🦮', '🐕‍🦺', '🐩', '🐺', '🦊', '🦝',
        '🐱', '🐈', '🐈‍⬛', '🦁', '🐯', '🐅', '🐆', '🐴',
        '🐎', '🦄', '🦓', '🦌', '🦬', '🐮', '🐂', '🐃',
        '🐄', '🐷', '🐖', '🐗', '🐽', '🐏', '🐑', '🐐',
        '🐪', '🐫', '🦙', '🦒', '🐘', '🦣', '🦏', '🦛',
        '🐭', '🐁', '🐀', '🐹', '🐰', '🐇', '🐿️', '🦫',
        '🦔', '🦇', '🐻', '🐻‍❄️', '🐨', '🐼', '🦥', '🦦',
        '🦨', '🦘', '🦡', '🐾',
        // Birds
        '🐔', '🐓', '🐣', '🐤', '🐥', '🐦', '🐧', '🕊️',
        '🦅', '🦆', '🦢', '🦉', '🦤', '🪶', '🦩', '🦚',
        '🦜', '🦃', '🐦‍⬛',
        // Marine & Reptiles
        '🐸', '🐊', '🐢', '🦎', '🐍', '🐲', '🐉', '🦕',
        '🦖', '🐳', '🐋', '🐬', '🦭', '🐟', '🐠', '🐡',
        '🦈', '🐙', '🦑', '🦐', '🦞', '🦀', '🦪',
        // Insects & Others
        '🐌', '🦋', '🐛', '🐜', '🐝', '🪲', '🐞', '🦗',
        '🪳', '🕷️', '🦂', '🦟', '🪰', '🪱', '🦠'
    ],

    selectedAvatar: null,
    avatarPage: 0,
    avatarsPerPage: 24,

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

    // Group colors (rainbow order)
    groupColors: [
        '#FF6B6B', // Red
        '#F15BB5', // Pink
        '#EAC4D5', // Pastel rose
        '#E07A5F', // Coral
        '#C4A484', // Light brown
        '#FEE440', // Yellow
        '#F2CC8F', // Warm yellow
        '#81B29A', // Sage green
        '#D6EADF', // Pastel sage
        '#00F5D4', // Teal
        '#4ECDC4', // Turquoise
        '#45B7D1', // Sky blue
        '#00BBF9', // Blue
        '#A2D2FF', // Pastel blue
        '#9B5DE5', // Purple
        '#3D405B'  // Dark blue-gray
    ],

    selectedGroupIcon: null,
    selectedGroupColor: null,

    // Predefined interests list (alphabetical)
    interests: [
        'Anime', 'Art', 'Badminton', 'Baking', 'Baseball', 'Basketball', 'Beaches', 'Beer', 'Bingsu', 'Boba', 'Books',
        'Bowling', 'Brunch', 'Burgers', 'Burritos', 'Cafés', 'Camping', 'Cars', 'Cats', 'Ceramics', 'Chess', 'Coffee',
        'Collectibles', 'Comedy', 'Concerts', 'Cookies', 'Cooking', 'Crafts', 'Cycling', 'Dating', 'Dancing', 'Design', 'Desserts',
        'Disc Golf', 'DIY', 'DJing', 'Documentaries', 'Dogs', 'Dominion', 'Drawing', 'Exploring', 'Fashion', 'Fasting', 'Finances',
        'Fishing', 'Fitness', 'Food', 'Football', 'Free Events', 'Games', 'Gaming', 'Gardens', 'Golf', 'Gym', 'Healthy Eating', 'Hiking',
        'History', 'Ice Cream', 'Investing', 'Journaling', 'Karaoke', 'KBBQ', 'Languages', 'Martial Arts', 'Makeup', 'Matcha',
        'Meditation', 'Mountains', 'Movies', 'Museums', 'Music', 'Nature', 'Painting', 'Pets', 'Philosophy', 'Pho',
        'Photography', 'Pickleball', 'Ping-Pong', 'Pizza', 'Playing Instruments', 'Podcasts', 'Poetry', 'Pokemon Cards',
        'Poker', 'Psychology', 'Puzzles', 'Ramen', 'Reading', 'Restaurants', 'Road Trips', 'Rock Climbing', 'Running', 'Science',
        'Shopping', 'Skincare', 'Smash Bros', 'Soccer', 'Songwriting', 'Sports', 'Studying', 
        'Sushi', 'Sustainability', 'Swimming', 'Tacos', 'Tea', 'Technology', 'Tennis', 'Theater', 'Theme Parks', 'Theology', 'Thrifting',
        'Traveling', 'Trivia', 'TV Shows', 'Vegetarian', 'Volleyball', 'Volunteering', 'Walking', 'Wine', 'Women\'s Sports', 'Writing', 'Yoga',
    ],

    selectedInterests: [],

    // Music state
    musicEnabled: false,
    musicStarted: false,

    // Initialize the app
    init() {
        console.log('App.init() called');
        Auth.init();
        App.setupEventListeners();
        App.initNatureScene();
        App.initMusic();
        console.log('App.init() complete');
    },

    // Initialize background music
    initMusic() {
        const audio = document.getElementById('bg-music');
        const toggle = document.getElementById('music-toggle');
        const icon = toggle.querySelector('.music-icon');

        // Set initial volume
        audio.volume = 0.3;

        // Check saved preference
        const savedPref = localStorage.getItem('musicEnabled');
        App.musicEnabled = savedPref === 'true';

        // Update icon based on saved preference
        if (App.musicEnabled) {
            icon.classList.remove('music-off');
            icon.classList.add('music-on');
        }

        // Toggle button click
        toggle.addEventListener('click', () => {
            App.musicEnabled = !App.musicEnabled;
            localStorage.setItem('musicEnabled', App.musicEnabled);

            icon.classList.toggle('music-off', !App.musicEnabled);
            icon.classList.toggle('music-on', App.musicEnabled);

            if (App.musicEnabled) {
                audio.play().catch(e => console.log('Audio play failed:', e));
            } else {
                audio.pause();
            }
        });

        // Try to start music on first user interaction if enabled
        const startMusicOnInteraction = () => {
            if (App.musicEnabled && !App.musicStarted) {
                audio.play().then(() => {
                    App.musicStarted = true;
                }).catch(e => console.log('Audio autoplay blocked:', e));
            }
            // Remove listeners after first interaction
            document.removeEventListener('click', startMusicOnInteraction);
            document.removeEventListener('touchstart', startMusicOnInteraction);
        };

        document.addEventListener('click', startMusicOnInteraction);
        document.addEventListener('touchstart', startMusicOnInteraction);
    },

    // Initialize anime nature background
    initNatureScene() {
        const container = document.getElementById('petals-container');
        if (!container) return;

        // Create falling petals continuously
        const createPetal = () => {
            const petal = document.createElement('div');
            petal.className = 'sakura-petal';

            // Random starting position - start more from the left since wind blows right
            const startX = Math.random() * 80 - 20; // -20% to 60%
            const startY = Math.random() * 30 - 10; // Start slightly above or below top
            const size = 6 + Math.random() * 10; // 6-16px
            const duration = 10 + Math.random() * 15; // 10-25s (slower for more float)
            const drift = 150 + Math.random() * 250; // 150-400px horizontal drift (more sideways)
            const rotation = 360 + Math.random() * 1080; // more rotation
            const delay = Math.random() * 0.5;

            petal.style.cssText = `
                left: ${startX}%;
                top: ${startY}%;
                width: ${size}px;
                height: ${size}px;
                animation-duration: ${duration}s;
                animation-delay: ${delay}s;
                --drift: ${drift}px;
                --rotation: ${rotation}deg;
            `;

            container.appendChild(petal);

            // Remove petal after animation
            setTimeout(() => {
                petal.remove();
            }, (duration + delay) * 1000);
        };

        // Create initial batch of petals
        for (let i = 0; i < 20; i++) {
            setTimeout(createPetal, i * 150);
        }

        // Continuously create new petals
        setInterval(createPetal, 600);
    },

    // Handle auth state changes
    onAuthStateChanged(isLoggedIn) {
        console.log('App.onAuthStateChanged called with:', isLoggedIn);
        if (isLoggedIn) {
            if (!Auth.hasInterests()) {
                console.log('Showing interests screen');
                App.showInterestsScreen(false); // Setup mode - show avatar + interests
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
        document.getElementById('trigger-reveal-btn').addEventListener('click', App.handleTriggerReveal);
        document.getElementById('copy-code-btn').addEventListener('click', App.handleCopyCode);

        // Profile screen
        document.getElementById('back-from-profile').addEventListener('click', () => App.showMainScreen());
        document.getElementById('edit-interests-btn').addEventListener('click', () => {
            App.selectedAvatar = Auth.userData.avatar || null;
            App.selectedInterests = [...(Auth.userData.interests || [])];
            App.renderInterestsGrid();
            App.showInterestsScreen(true); // Edit mode - interests only
        });
        document.getElementById('logout-btn').addEventListener('click', App.handleLogout);
        document.getElementById('save-name-btn').addEventListener('click', App.handleSaveDisplayName);

        // Reveal done
        document.getElementById('reveal-done-btn').addEventListener('click', () => {
            Reveal.handleRevealDone(App.currentGroupId);
        });

        // Reveal next trio
        document.getElementById('reveal-next-btn').addEventListener('click', () => {
            Reveal.showNextTrio();
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

    // Show interests screen with optional edit-only mode
    showInterestsScreen(editInterestsOnly = false) {
        const avatarSection = document.getElementById('avatar-setup-section');
        const headerTitle = document.querySelector('#interests-screen .screen-header h2');
        const headerSubtitle = document.querySelector('#interests-screen .screen-header p');

        if (editInterestsOnly) {
            // Edit interests only mode
            avatarSection.classList.add('hidden');
            headerTitle.textContent = 'Edit Interests';
            headerSubtitle.textContent = 'Update your interests';
        } else {
            // Full setup mode
            avatarSection.classList.remove('hidden');
            headerTitle.textContent = 'Set Up Your Profile';
            headerSubtitle.textContent = 'Choose your avatar and interests';
            App.renderAvatarGrid('avatar-grid');
        }

        App.renderInterestsGrid();
        App.showScreen('interests-screen');
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

    async handleSaveDisplayName() {
        const input = document.getElementById('display-name-input');
        const name = input.value.trim();

        if (!name) {
            App.showToast('Please enter a name', 'error');
            return;
        }

        const result = await Auth.saveDisplayName(name);
        if (result.success) {
            document.getElementById('profile-name').textContent = name;
            App.showToast('Name saved!', 'success');
        } else {
            App.showToast(result.error, 'error');
        }
    },

    // Avatar selection with pagination
    renderAvatarGrid(gridId, jumpToSelected = true) {
        const container = document.getElementById(gridId);
        const currentAvatar = Auth.userData?.avatar || App.selectedAvatar;
        const totalPages = Math.ceil(App.avatars.length / App.avatarsPerPage);

        // Jump to page containing current avatar on first render
        if (jumpToSelected && currentAvatar) {
            const avatarIndex = App.avatars.indexOf(currentAvatar);
            if (avatarIndex !== -1) {
                App.avatarPage = Math.floor(avatarIndex / App.avatarsPerPage);
            }
        }

        // Ensure page is valid
        if (App.avatarPage >= totalPages) App.avatarPage = 0;
        if (App.avatarPage < 0) App.avatarPage = totalPages - 1;

        // Get avatars for current page
        const startIndex = App.avatarPage * App.avatarsPerPage;
        const pageAvatars = App.avatars.slice(startIndex, startIndex + App.avatarsPerPage);

        container.innerHTML = `
            <div class="avatar-pagination">
                <button class="avatar-nav-btn avatar-prev" ${App.avatarPage === 0 ? 'disabled' : ''}>‹</button>
                <div class="avatar-grid-inner">
                    ${pageAvatars.map(avatar => `
                        <div class="avatar-option ${currentAvatar === avatar ? 'selected' : ''}" data-avatar="${avatar}">
                            ${avatar}
                        </div>
                    `).join('')}
                </div>
                <button class="avatar-nav-btn avatar-next" ${App.avatarPage === totalPages - 1 ? 'disabled' : ''}>›</button>
            </div>
            <div class="avatar-page-indicator">${App.avatarPage + 1} / ${totalPages}</div>
        `;

        // Add click handlers for avatars
        container.querySelectorAll('.avatar-option').forEach(option => {
            option.addEventListener('click', () => App.selectAvatar(option, gridId));
        });

        // Add click handlers for navigation
        container.querySelector('.avatar-prev').addEventListener('click', () => {
            App.avatarPage--;
            App.renderAvatarGrid(gridId, false);
        });
        container.querySelector('.avatar-next').addEventListener('click', () => {
            App.avatarPage++;
            App.renderAvatarGrid(gridId, false);
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
        const MAX_INTERESTS = 50;

        if (App.selectedInterests.includes(interest)) {
            App.selectedInterests = App.selectedInterests.filter(i => i !== interest);
            chip.classList.remove('selected');
        } else {
            if (App.selectedInterests.length >= MAX_INTERESTS) {
                App.showToast(`Maximum ${MAX_INTERESTS} interests allowed`, 'error');
                return;
            }
            App.selectedInterests.push(interest);
            chip.classList.add('selected');
        }

        App.updateInterestsCount();
    },

    updateInterestsCount() {
        const count = App.selectedInterests.length;
        document.getElementById('interests-count').textContent = `${count} / 50 selected`;
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
            document.getElementById('display-name-input').value = Auth.userData.displayName || '';

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

        // Sort groups alphabetically by name
        groups.sort((a, b) => a.name.localeCompare(b.name));

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
            App.showToast('Group created!', 'success');
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

    async handleCopyCode() {
        const code = document.getElementById('group-code-display').textContent;
        try {
            await navigator.clipboard.writeText(code);
            App.showToast('Code copied!', 'success');
        } catch (err) {
            App.showToast('Failed to copy', 'error');
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
        document.getElementById('group-code-display').textContent = group.code;

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
        const container = document.getElementById('current-pairings');
        const roundLabel = document.getElementById('current-round-label');
        const revealBtn = document.getElementById('trigger-reveal-btn');

        // Get latest round
        const latestRound = await Pairing.getLatestRound(groupId);

        if (latestRound === 0) {
            container.innerHTML = '<p class="no-pairing">No pairings yet. Wait for a creator to generate pairings!</p>';
            roundLabel.textContent = '';
            revealBtn.classList.add('hidden');
            return;
        }

        // Get all pairings for the current round
        const allPairings = await Pairing.getRoundPairings(groupId, latestRound);
        const members = Groups.groupMembers;
        const group = Groups.currentGroup;
        const groupColor = group?.color || '#E07A5F';
        const currentUserId = Auth.currentUser.uid;

        // Check if user is in any pairing this round
        const userPairing = allPairings.find(p => p.members.includes(currentUserId));

        // Check if user is prioritized for next round
        const isPrioritized = group?.priorityMemberIds?.includes(currentUserId);

        // Show reveal button only if user has a pairing
        if (userPairing) {
            revealBtn.classList.remove('hidden');
        } else {
            revealBtn.classList.add('hidden');
        }

        roundLabel.textContent = `- Round ${latestRound}`;

        // Build HTML for all pairings
        let html = '';

        // Show priority message if user wasn't paired
        if (!userPairing && isPrioritized) {
            html += '<p class="priority-message">You\'ll be paired first next round!</p>';
        }

        allPairings.forEach((pairing, index) => {
            const pairingMembers = pairing.members.map(id => members.find(m => m.id === id)).filter(m => m);
            const isUsersTrio = pairing.members.includes(currentUserId);
            const trioLabel = isUsersTrio ? `Trio ${index + 1} (You)` : `Trio ${index + 1}`;
            const interestCount = pairing.sharedInterests?.length || 0;

            html += `
                <div class="pairing-card ${isUsersTrio ? 'users-trio' : ''}" style="background: linear-gradient(135deg, ${groupColor}99 0%, ${groupColor} 100%)">
                    <div class="trio-label ${isUsersTrio ? 'your-trio-label' : ''}">${trioLabel}</div>
                    <div class="pairing-members">
                        ${pairingMembers.map(m => `
                            <div class="pairing-member">
                                <div class="member-avatar" style="background-color: ${groupColor}80">${App.getMemberAvatar(m)}</div>
                                <div class="member-name">${m.displayName}</div>
                            </div>
                        `).join('')}
                    </div>
                    ${interestCount > 0 ? `
                        <div class="shared-interests-dropdown">
                            <button class="interests-toggle" onclick="this.parentElement.classList.toggle('expanded')">
                                <span>${interestCount} shared interest${interestCount !== 1 ? 's' : ''}</span>
                                <span class="toggle-arrow">›</span>
                            </button>
                            <div class="shared-interests-content">
                                <div class="shared-interests-tags">
                                    ${pairing.sharedInterests.map(i => `<span class="shared-tag">${i}</span>`).join('')}
                                </div>
                            </div>
                        </div>
                    ` : ''}
                </div>
            `;
        });

        container.innerHTML = html;
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
            const sharedInterests = pairing.sharedInterests || [];
            const interestCount = sharedInterests.length;

            return `
                <div class="history-item">
                    <div class="round-label">Round ${pairing.round}</div>
                    <div class="history-members">${memberNames}</div>
                    ${interestCount > 0 ? `
                        <div class="shared-interests-dropdown">
                            <button class="interests-toggle small" onclick="this.parentElement.classList.toggle('expanded')">
                                <span>${interestCount} shared interests</span>
                                <span class="toggle-arrow">›</span>
                            </button>
                            <div class="shared-interests-content">
                                ${sharedInterests.map(i => `<span class="shared-tag small">${i}</span>`).join('')}
                            </div>
                        </div>
                    ` : ''}
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
            let toastMsg = `Round ${result.round} pairings created!`;
            if (result.message) {
                toastMsg += ` ${result.message}`;
            }
            App.showToast(toastMsg, 'success');
            await App.loadCurrentPairing(App.currentGroupId);
            await App.loadPairingHistory(App.currentGroupId);
        } else {
            App.showToast(result.error, 'error');
        }
    },

    async handleTriggerReveal() {
        if (!Auth.currentUser) {
            App.showToast('Not logged in', 'error');
            return;
        }
        // Directly show the reveal animation
        Reveal.showReveal(App.currentGroupId, Auth.currentUser.uid);
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
