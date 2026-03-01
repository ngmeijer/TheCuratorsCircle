# VECT-26 Implementation Plan - Create Collection Feature

## Overview

**Feature:** Allow users to create named collections (boards) linked to their user ID, viewable on their profile.

**Acceptance Criteria:**
- Given I am on my profile, When I click "Create New Collection" and enter a name, Then a new collection record is saved in the database, linked to my user ID.
- I can view my list of created collections on my profile.
- Given I am on the For You page, When I click the create button, I can choose between creating a Collection or a Post.

---

## User Flows

### Flow 1: From For You Page (createPost.tsx)

```
┌─────────────────────────┐
│   Create New...         │  ← NEW: Initial choice screen
├─────────────────────────┤
│  📁 Create Collection  │  → Simple name input → success
│  ✏️ Create Post        │  → Category selection → existing flow
└─────────────────────────┘
```

### Flow 2: From Profile Page

```
┌─────────────────────────┐
│  My Collections        │
│  [+ Create Collection] │  ← NEW: Button to create collection
├─────────────────────────┤
│  [Grid of collections] │
└─────────────────────────┘
```

---

## Architecture

### Data Model

```
Firestore: collections (collection)
├── {auto-generated-id} (document)
│   ├── id: string
│   ├── userId: string  
│   ├── name: string
│   ├── itemIds: string[] (for future - posts in collection)
│   └── createdAt: Timestamp
```

### API Design

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/collections` | Create a new collection |
| GET | `/collections` | Get all collections for current user |
| GET | `/collections/{id}` | Get a single collection by ID |

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

#### Step 1.4: Update UserDataController ✅
**File:** `Backend/TheCuratorsCircle/TheCuratorsCircle/Controllers/UserDataController.cs`

- Added FirestoreClient dependency
- Updated GET /user/collections to fetch from Firestore instead of returning hardcoded data

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

### Phase 3: Frontend - Refactor createPost.tsx 📋 PENDING

#### Step 3.1: Add Initial Choice Screen
**File:** `Frontend/TheCuratorsCircle/app/createPost.tsx`

Add new step type and render:

```typescript
type Step = 'choose' | 'createCollection' | 'category' | 'search' | 'select' | 'caption';
//                   ^ NEW: Initial choice screen
//                        ^ NEW: Collection creation form
```

**New initial screen:**
```
┌─────────────────────────────────┐
│  What would you like to create? │
├─────────────────────────────────┤
│  📁  Create Collection         │
│      Save media to a board      │
├─────────────────────────────────┤
│  ✏️  Create Post               │
│      Share media with others    │
└─────────────────────────────────┘
```

Tasks:
- [ ] Add 'choose' and 'createCollection' step types
- [ ] Add renderChoose() function with two options
- [ ] Add renderCreateCollection() function with name input
- [ ] Update navigation header title based on step

#### Step 3.2: Update Navigation Header
Dynamic header title based on step:
- `choose` → "Create New"
- `createCollection` → "New Collection"
- `category` → "Create Post"
- `search` → "Search"
- `select` → "Confirm"
- `caption` → "Caption"

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
| `databaseClient.ts` | Add createCollection, getMyCollections, auth | 📋 Pending |
| `createPost.tsx` | Add initial choice + collection creation flow | 📋 Pending |
| `profile.tsx` | Add create collection button + modal | 📋 Pending |

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
