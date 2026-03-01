# VECT-26 Implementation Plan - Create Collection Feature

## Overview

**Feature:** Allow users to create named collections (boards) linked to their user ID, viewable on their profile.

**Acceptance Criteria:**
- Given I am on my profile, When I click "Create New Collection" and enter a name, Then a new collection record is saved in the database, linked to my user ID.
- I can view my list of created collections on my profile.
- Given I am creating a post, I must select which collection to add it to (required).
- Given I am on the For You page, When I click the create button, I can choose between creating a Collection or a Post.

---

## User Flows

### Flow 1: From For You Page (createPost.tsx)

```
┌─────────────────────────┐
│   Create New...         │  ← Initial choice screen
├─────────────────────────┤
│  📁 Create Collection  │  → Simple name input → success
│  ✏️ Create Post        │  → Category → Search → Select → Add to Collection → Caption
└─────────────────────────┘
```

**Note:** When creating a post, user MUST select a collection (required dropdown).

### Flow 2: From Profile Page

```
┌─────────────────────────┐
│  My Collections        │
│  [+ Create Collection] │  ← Button to create collection
├─────────────────────────┤
│  [Grid of collections] │
└─────────────────────────┘
```

---

## Architecture

### Data Model

```
Firestore: collections (collection)
├── {collection-id} (document)
│   ├── id: string
│   ├── userId: string  
│   ├── name: string
│   ├── itemIds: string[] (array of post IDs)
│   └── createdAt: Timestamp

Firestore: posts (collection)
├── {post-id} (document)
│   ├── id: string
│   ├── userId: string
│   ├── title: string
│   ├── caption: string
│   ├── mediaType: string
│   ├── mediaId: string
│   ├── collectionId: string  ← NEW: link to collection
│   └── createdAt: Timestamp
```

### API Design

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/collections` | Create a new collection |
| GET | `/collections` | Get all collections for current user |
| GET | `/collections/{id}` | Get a single collection by ID |
| POST | `/posts` | Create a new post (requires collectionId) |

---

## Implementation Status

### Phase 1: Backend - Data Model & API ✅ COMPLETE

#### Step 1.1: Update CollectionEntity ✅
**File:** `Backend/TheCuratorsCircle/TheCuratorsCircle/Models/Content/CollectionEntity.cs`

- Added Firestore attributes
- Added `id` property
- Added `userId` property  
- Added `createdAt` property (Timestamp)
- Added `itemIds` property (for future use)

#### Step 1.2: Create CreateCollectionRequest DTO ✅
**File:** `Backend/TheCuratorsCircle/TheCuratorsCircle/Models/Content/CreateCollectionRequest.cs` (NEW)

```csharp
public class CreateCollectionRequest
{
    [Required]
    [StringLength(100, MinimumLength = 1)]
    public string Name { get; set; }
}
```

#### Step 1.3: Create CollectionsController ✅
**File:** `Backend/TheCuratorsCircle/TheCuratorsCircle/Controllers/CollectionsController.cs` (NEW)

Endpoints:
- **POST /collections**: Create new collection
  - Extracts userId from Firebase auth claims (falls back to "test-user-id")
  - Generates UUID for collection id
  - Saves to Firestore "collections" collection
  - Returns created collection

- **GET /collections**: Get collections for current user
  - Queries Firestore "collections" where userId == current user
  - Returns list of collections ordered by createdAt descending

- **GET /collections/{id}**: Get single collection
  - Returns collection if owned by current user

#### Step 1.4: Add collectionId to Post ✅
**File:** `Backend/TheCuratorsCircle/TheCuratorsCircle/Models/Content/Post.cs`

- Add `CollectionId` property to link post to collection

#### Step 1.5: Add collectionId to CreatePostRequest ✅
**File:** `Backend/TheCuratorsCircle/TheCuratorsCircle/Models/Content/CreatePostRequest.cs`

- Add `CollectionId` property (required)

---

### Phase 2: Frontend - API Client ✅ COMPLETE

#### Step 2.1: Add Auth & Collection Functions ✅
**File:** `Frontend/TheCuratorsCircle/api/databaseClient.ts`

Completed:
- [x] Add `authToken` variable
- [x] Add `setAuthToken()` function
- [x] Add `getHeaders()` helper with auth
- [x] Add `createCollection(payload)` function
- [x] Add `getCollections()` function (updated endpoint)
- [x] Add `getCollection(collectionId)` function
- [x] Update all fetch calls to use `getHeaders()`

---

### Phase 3: Frontend - Refactor createPost.tsx ✅ COMPLETE#### Step 3

.1: Add Initial Choice Screen ✅
**File:** `Frontend/TheCuratorsCircle/app/createPost.tsx`

Completed:
- [x] Add 'choose' and 'createCollection' step types
- [x] Add `collectionName` state for collection creation
- [x] Import `createCollection` from databaseClient
- [x] Add `renderChoose()` function with two options (Create Collection / Create Post)
- [x] Add `renderCreateCollection()` function with name input
- [x] Add `handleChooseCollection()` and `handleChoosePost()` handlers
- [x] Add `handleCreateCollection()` with API call
- [x] Update navigation header title dynamically via `getHeaderTitle()`

#### Step 3.2: Add Collection Selection Step (NEW) ✅ COMPLETE
**File:** `Frontend/TheCuratorsCircle/app/createPost.tsx`

When creating a post, after selecting media, user must select a collection before adding caption.

New flow:
```
choose → category → search → select → pickCollection → caption → submit
```

Completed:
- [x] Add 'pickCollection' step type
- [x] Fetch user's collections when reaching this step
- [x] Render list with user's collections
- [x] Make collection selection required
- [x] Add selected state styling
- [x] Pass collectionId in post payload
- [x] Update backend Post model to include collectionId
- [x] Update backend CreatePostRequest to require collectionId

---

### Phase 4: Frontend - Profile Updates 📋 PENDING

#### Step 4.1: Create Collection Modal Component
**File:** `Frontend/TheCuratorsCircle/components/CreateCollectionModal.tsx` (NEW)

Reusable modal for creating collections from profile page.

Components:
- Modal overlay
- Text input for collection name
- Create button
- Cancel button
- Loading state during creation
- Error handling with Alert

Tasks:
- [ ] Create modal component
- [ ] Use existing `StyledButton` component
- [ ] Follow existing styling from other forms

#### Step 4.2: Update Profile Page
**File:** `Frontend/TheCuratorsCircle/app/profile.tsx`

Tasks:
- [ ] Add "Create Collection" button in collections section
- [ ] Open modal on press
- [ ] Refresh collections after creation

---

## File Changes Summary

### New Files

| File | Status |
|------|--------|
| `Models/Content/CreateCollectionRequest.cs` | ✅ Complete |
| `Controllers/CollectionsController.cs` | ✅ Complete |
| `components/CreateCollectionModal.tsx` | 📋 Pending |

### Modified Files

| File | Changes | Status |
|------|---------|--------|
| `CollectionEntity.cs` | Add id, userId, createdAt, itemIds | ✅ Complete |
| `CollectionsController.cs` | Add POST, GET, GET/{id} endpoints | ✅ Complete |
| `CreateCollectionRequest.cs` | New DTO | ✅ Complete |
| `Post.cs` | Add CollectionId property | ✅ Complete |
| `CreatePostRequest.cs` | Add CollectionId (required) | ✅ Complete |
| `PostsController.cs` | Save CollectionId when creating post | ✅ Complete |
| `databaseClient.ts` | Add createCollection, getCollections, getCollection, auth, collectionId in payload | ✅ Complete |
| `createPost.tsx` | Add initial choice + collection creation + collection picker flow | ✅ Complete |
| `CreateCollectionModal.tsx` | New component for creating collections | ✅ Complete |
| `CollectionButton.tsx` | Pinterest-style layout, aspect ratio, grey placeholder | ✅ Complete |
| `profile.tsx` | Create button, modal, full-height content area | ✅ Complete |

---

### Additional UI Updates

- ✅ CreateCollectionModal component (reusable modal for creating collections)
- ✅ "+ Create Collection" button to profile collections tab
- ✅ Modal with onSuccess callback to refresh collections
- ✅ Style create button as grey square with "+" icon in grid
- ✅ Pinterest-style masonry grid layout for collections
- ✅ Collection posters use original aspect ratio (2/3)
- ✅ Create button matches collection aspect ratio
- ✅ Create button always first in grid
- ✅ Fixed grid row styling for consistent width distribution
- ✅ Full screen height for collections content area

### Deleted Files

| File | Reason |
|------|--------|
| `Controllers/UserDataController.cs` | Duplicate endpoints, consolidated into PostsController |

---

## Testing Checklist

- [ ] Can create collection with valid name
- [ ] Collection saved to Firestore with correct userId
- [ ] Collection appears in profile's collections tab
- [ ] Create Collection from initial choice screen works
- [ ] Create Post goes to category selection after initial choice
- [ ] Empty name shows validation error
- [ ] Loading indicator during creation
- [ ] Error handling for API failures

---

## Dependencies & Blockers

1. **Auth Integration**: The current backend falls back to "test-user-id" when auth is not present. For production, Firebase auth must be properly connected.

2. **Frontend Auth**: No auth token storage. Need to either:
   - Store JWT in AsyncStorage after login
   - Or pass token manually for testing
