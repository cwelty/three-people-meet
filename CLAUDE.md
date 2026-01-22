# Three People Meet

A mobile-optimized web app where users join groups, submit interests, and get paired in groups of 3 for meetups based on shared interests.

## Tech Stack
- **Frontend**: Vanilla JS + CSS (no build step, static files)
- **Backend**: Firebase (Authentication + Firestore)
- **Hosting**: GitHub Pages at `cwelty.github.io/three-people-meet`

## Current State
The app is fully functional with all core features implemented.

### Authentication
- Google Sign-In only (email/password was removed due to issues)
- Firebase Auth handles session management

### User Profile
- Animal emoji avatar selection (required, 48 options)
- At least 10 interests required from predefined list (~80 options)
- Can edit avatar and interests from profile screen

### Groups
- Create groups with custom name, icon (landscape/location emojis), and color
- Join groups via 6-character code
- Group cards display icon, color accent, and member count
- Only creators can edit group appearance (icon/color)

### Pairing System
- Creators generate pairings for groups of 3
- Algorithm scores trios by shared interests
- Penalizes repeat pairings using history
- Handles edge cases (groups of 2 or 4 when members % 3 ≠ 0)
- Activity suggestions based on shared interest categories

### Dramatic Reveal
- Real-time synced countdown for all group members
- Card flip animation reveals trio, shared interests, and activity
- Uses Firestore real-time listeners

## File Structure
```
threepeoplemeet/
├── index.html              # All views/screens
├── css/
│   └── styles.css          # Mobile-first warm theme (coral/sage)
├── js/
│   ├── firebase-config.js  # Firebase credentials
│   ├── auth.js             # Google auth, user data
│   ├── app.js              # Main logic, routing, UI
│   ├── groups.js           # Group CRUD, membership
│   ├── pairing.js          # Pairing algorithm, activities
│   └── reveal.js           # Dramatic reveal animations
├── firestore.rules         # Security rules reference
└── CLAUDE.md               # This file
```

## Design
- **Theme**: Warm & friendly
- **Colors**: Soft coral (#E07A5F) primary, sage green (#81B29A) accent
- **Style**: Rounded corners, soft shadows, Nunito font
- **Mobile-first**: Large touch targets, fixed bottom navigation

## Firebase Setup
- Project: `threepeoplemeet`
- Auth: Google Sign-In enabled
- Firestore: Security rules allow authenticated users to read/write their data

## Data Models

### users/{userId}
```json
{
  "email": "user@example.com",
  "displayName": "John Doe",
  "avatar": "🦊",
  "interests": ["hiking", "cooking", ...],
  "groupIds": ["groupId1", ...],
  "createdAt": timestamp
}
```

### groups/{groupId}
```json
{
  "name": "Book Club",
  "code": "ABC123",
  "icon": "🏔️",
  "color": "#E07A5F",
  "creatorIds": ["userId1"],
  "memberIds": ["userId1", "userId2", ...],
  "createdAt": timestamp
}
```

### groups/{groupId}/pairings/{pairingId}
```json
{
  "round": 1,
  "members": ["userId1", "userId2", "userId3"],
  "sharedInterests": ["hiking", "music"],
  "suggestedActivity": "Go on a scenic hike",
  "revealed": false,
  "createdAt": timestamp
}
```

## Development
Run locally:
```bash
python3 -m http.server 8000
# Open http://localhost:8000
```

## Deployment
Push to main branch - GitHub Pages auto-deploys.

## Known Issues / Future Work
- None currently blocking

## Key Implementation Details
- Screens use `.screen` class with `.active` for visibility
- Modals use `.modal` with `.hidden`/`.active` classes
- Member avatars use group color with 40% opacity (`${color}40`)
- Group cards have 6px left border in group color
- Avatar/icon grids are 8 columns, color grids are 6 columns
