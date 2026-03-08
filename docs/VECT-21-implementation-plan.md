# VECT-21 Implementation Plan: Following & Chronological Feed

## Acceptance Criteria
1. Home page shows posts from followed users only (chronological - newest first)
2. Follow/unfollow updates "following" and "followers" counts
3. Posts display: poster's username, image, caption, content name

---

## Architecture Decisions

### Post to Profile Linking
- **PersistentId** (document ID) is the recommended identifier for linking posts to profiles
- This is more secure than using OwnerUid (Firebase UID) because:
  - Opaque identifier (hard to guess/enumerate)
  - Separates internal Firebase Auth from public API
  - GUIDs are practically impossible to enumerate
- Posts will store `userId` as the profile's PersistentId (document ID)
- Backend will do efficient batch lookups to get current usernames

### User ID Reference
```
userProfiles collection
  document ID: "07eb98a2-26e7-41c5-b1b9-764937f93857"  ← PersistentId (use this on posts)
    └── OwnerUid: "McjNrghrEdSMn84j8qjJqAcW5rs1"       ← Firebase Auth UID (internal only)
    └── UsernamesHistory: ["@testerJerry"]
    └── DisplayName: "Test Jerry"
```

---

## Implementation Status

### Completed ✅
- Backend: Follow model, service, controller
- Backend: Posts use PersistentId
- Backend: Feed endpoint with chronological order
- Frontend: API functions for follow/unfollow
- Frontend: Feed page with empty state
- Frontend: Post component shows username

### Pending (This Ticket)
- Frontend: Follow button on profile pages
- Frontend: Following list UI (view who you follow)
- Frontend: Follower count display
- Testing: Manual follow testing (no search yet)

---

## Backend Implementation

### 1. Follow System (COMPLETED)
- **Model**: `Follow.cs` ✅
- **Service**: `FollowService.cs` ✅
- **Controller**: `FollowsController.cs` ✅

### 2. Post Updates (COMPLETED)
- **Update PostsController.cs** ✅
- **Feed endpoint** ✅

### 3. Follow Query Strategy
All queries use PersistentId to ensure username changes don't break relationships.

---

## Frontend Implementation

### 1. Follow Button (PENDING)
**Profile Page**: Add Follow/Unfollow button
- Show "Follow" button if not following
- Show "Following" button if already following (can tap to unfollow)
- Use PersistentId (profile.persistentId) when calling follow API

**Product Flow:**
1. User visits another user's profile
2. Sees "Follow" button
3. Taps to follow → button changes to "Following"
4. Their posts appear in feed

### 2. Following List UI (PENDING)
**Profile Page**: 
- "Following" count displayed (tappable)
- When tapped, shows list of users being followed

**Implementation:**
- Add "Following" tab/section on profile
- Display list of UserProfile cards
- Each card shows: avatar, username, display name

### 3. Follower Count Display
- Display "Followers" count on profile
- Display "Following" count on profile

---

## Testing & Manual Follow

Since search functionality is out of scope, testing will be manual:

### How to Follow a User (Manual Testing)
1. User A logs in, creates profile → gets PersistentId (e.g., "abc-123")
2. User B logs in, creates profile → gets PersistentId (e.g., "def-456")
3. For testing, use backend API directly or temporary UI button:
   ```
   POST /follows
   Body: { "targetUserId": "abc-123" }
   ```
4. User B's feed will now show User A's posts

### Firestore Data Structure
```
follows collection
  document ID: "abc-123_def-456"  (follower_following)
    └── followerId: "abc-123"      (PersistentId of follower)
    └── followingId: "def-456"    (PersistentId of following)
    └── createdAt: timestamp
```

---

## API Reference

### Endpoints (All using PersistentId)
```
POST   /follows              - Follow user (body: { targetUserId: PersistentId })
DELETE /follows/{targetUserId} - Unfollow user
GET    /follows/me/following - Get list of profiles I follow
GET    /follows/me/followers - Get list of my followers
GET    /follows/{userId}/is-following - Check if following
GET    /posts/feed          - Get posts from followed users
```

---

## Testing Considerations
- [x] Test follow/unfollow flow (manual via API)
- [x] Posts show current username (uses usernamesHistory[0])
- [x] Chronological order (newest first)
- [x] Empty feed state
- [ ] Follow button on profile UI
- [ ] Following list display
- [ ] Follower count updates
- [ ] Security - cannot access other user's follow data

---

## Notes
- Existing test data with `userId: "test-user-id"` will be filtered out (not in following list)
- Each user profile has unique PersistentId (GUID)
- Username changes don't affect follows (links are by PersistentId)
