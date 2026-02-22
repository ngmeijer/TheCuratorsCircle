# Implementation Plan - The Curators Circle

## Project Overview

**The Curators Circle** is a social app for sharing and curating entertainment media (movies, TV shows, music, books, games). Users can create posts showcasing media items and organize them into collections.

---

## Current Codebase Analysis

### Tech Stack
- **Backend**: .NET 8 / C# with Firebase Authentication
- **Frontend**: React Native (Expo)
- **External APIs**: OMDB (movies), Firebase (auth)

### OMDB API Response Reference
Full response structure available from OMDB API:

```json
{
  "Title": "Avatar",
  "Year": "2009",
  "Rated": "PG-13",
  "Released": "18 Dec 2009",
  "Runtime": "162 min",
  "Genre": "Action, Adventure, Fantasy",
  "Director": "James Cameron",
  "Writer": "James Cameron",
  "Actors": "Sam Worthington, Zoe Saldaña, Sigourney Weaver",
  "Plot": "When his brother is killed in a robbery...",
  "Language": "English, Spanish",
  "Country": "United States, United Kingdom",
  "Awards": "Won 3 Oscars. 91 wins & 131 nominations total",
  "Poster": "https://m.media-amazon.com/...",
  "Ratings": [
    {"Source": "Internet Movie Database", "Value": "7.9/10"},
    {"Source": "Rotten Tomatoes", "Value": "81%"},
    {"Source": "Metacritic", "Value": "83/100"}
  ],
  "Metascore": "83",
  "imdbRating": "7.9",
  "imdbVotes": "1,486,308",
  "imdbID": "tt0499549",
  "Type": "movie",
  "DVD": "N/A",
  "BoxOffice": "$785,221,649",
  "Production": "N/A",
  "Website": "N/A"
}
```

**Currently used fields in Movie DTO:**
- title, genre, plot, posterUrl, releaseYear, releaseDate, runtimeInMinutes, language, rating

**Additional fields available for future use:**
- director, writer, actors, rated, awards, country, metascore, imdbVotes, boxOffice, production

### Backend Structure (`/Backend/TheCuratorsCircle`)
| Component | Status | Notes |
|-----------|--------|-------|
| Program.cs | Basic | Firebase auth, HTTP client setup |
| UserDataController | Partial | Returns seeded posts, hardcoded collections |
| MediaDatabaseController | Basic | OMDB API integration for movies |
| APIHTTPClient | Basic | Fetches from OMDB API |
| PostDataSeeder | Seeding | In-memory post storage |

### Frontend Structure (`/Frontend/TheCuratorsCircle`)
| Component | Status | Notes |
|-----------|--------|-------|
| forYouPage.tsx | Working | Displays posts in grid |
| profile.tsx | Working | Profile with posts/collections tabs |
| postDetails.tsx | Partial | Post detail view |
| collectionsPage.tsx | Partial | Collections list |
| databaseClient.ts | Basic | Hardcoded IP, no auth headers |
| Theme system | Working | Colors, typography, fonts |

---

## Implementation Roadmap

### Phase 1: Showcase Post Creation (VECT-16 Epic)
**Priority: HIGH** - Core feature for MVP

#### 1.1 Backend: Post Schema & API
- [ ] **VECT-17**: Create Post entity model
  - Fields: id, userId, imageUrl, caption, mediaType, mediaId, mediaMetadata, createdAt
  - Add database persistence (CosmosDB/Firebase Firestore)
- [ ] **VECT-18**: Implement pre-signed URL generation for S3/Cloud Storage
  - POST /media/upload-url - returns pre-signed upload URL
  - Configure cloud storage (AWS S3 or Firebase Storage)

#### 1.2 Frontend: Post Creation UI
- [ ] **VECT-19**: Implement post creation form
  - Media category selector (Book, Movie, TV Show, Music, Game)
  - Search field queries backend for selected category
  - Image picker for upload
  - Caption input
- [ ] **VECT-20**: Handle image upload flow
  - Upload to cloud storage via pre-signed URL
  - Submit post metadata to backend

---

### Phase 2: Media Database Integration (VECT-53 Epic)
**Priority: HIGH** - Foundation for media features

#### 2.1 Media Provider Infrastructure (VECT-54) - DONE
- [x] Environment variables for API credentials
- [x] Shared HTTP client with retry/error handling
- [ ] Unified media data interface (extend existing)

#### 2.2 Movies & TV Shows (VECT-55) - DONE
- [x] TMDB/OMDB integration
- [x] Endpoints for popular/search/details

#### 2.3 Music (VECT-56)
- [ ] Backend: Integrate Spotify API
  - GET /media/music/search
  - GET /media/music/artist/{id}
  - GET /media/music/album/{id}
- [ ] Frontend: Music search UI, cards, detail pages

#### 2.4 Books (VECT-57)
- [ ] Backend: Integrate Google Books API
  - GET /media/books/search
  - GET /media/books/{id}
- [ ] Frontend: Book search UI, cards, detail pages

#### 2.5 Games (VECT-58)
- [ ] Backend: Integrate IGDB API
  - GET /media/games/popular
  - GET /media/games/search
  - GET /media/games/{id}
- [ ] Frontend: Game browsing UI, cards, detail pages

#### 2.6 Unified Search (VECT-59) - Optional
- [ ] Backend: Aggregate search endpoint
- [ ] Frontend: Global search with filters

#### 2.7 Media Detail Pages (VECT-60) - IN PROGRESS
- [x] Tabbed interface (Details, Discussion, Collections, Rating)
- [x] Movie poster, title, release year, genres, duration, rating
- [x] Post name, creation date, summary/plot
- [ ] Add more movie details (director, actors, box office, awards)
- [ ] Implement Discussion tab functionality
- [ ] Implement Collections tab functionality
- [ ] Implement Rating tab functionality
- [ ] Polish styling and handle missing fields

---

### Phase 3: User Profiles & Social (VECT-36 Epic)

#### 3.1 View Own Profile (VECT-38) - DONE
- [x] Profile screen with username, stats
- [x] Posts and collections tabs

#### 3.2 View Other Profiles (VECT-39)
- [ ] Backend: GET /user/{userId} endpoint
- [ ] Frontend: Navigate to user profile from post author

#### 3.3 Collections on Profile (VECT-40)
- [ ] Backend: Include collections in profile response
- [ ] Frontend: Display collections on profile page

---

### Phase 4: Notifications (VECT-37 Epic)

#### 4.1 Backend: Notification System
- [ ] **VECT-49**: Create notifications collection
  - Fields: id, userId, type, actorId, targetId, read, createdAt
  - GET /notifications endpoint (paginated)
- [ ] **VECT-50**: Generate notifications on save
  - When user saves post → notify post owner
- [ ] **VECT-51**: Mark as read endpoint
  - PUT /notifications/{id}/read
- [ ] **VECT-52**: Unread count endpoint
  - GET /notifications/unread-count

#### 4.2 Frontend: Notifications UI
- [ ] Notifications screen
- [ ] Badge on tab bar with unread count
- [ ] Mark as read on view

---

### Phase 5: App Store Release (VECT-61)

#### 5.1 Google Play Build
- [ ] Configure Android build for release
- [ ] App signing and keystore
- [ ] Store listing assets
- [ ] Submit for review

---

## Technical Recommendations

### 1. Database Choice
Currently using in-memory seeding. For production, recommend:
- **Firebase Firestore** - aligns with existing Firebase Auth, real-time sync
- **Azure Cosmos DB** - if staying in Microsoft ecosystem

### 2. Storage
- **Firebase Storage** or **AWS S3** for post images
- Implement pre-signed URLs for secure uploads

### 3. API Structure
```
/auth/*          - Authentication (Firebase)
/user/*          - User data, posts, collections
/media/*         - External media search (TMDB, Spotify, etc.)
/notifications/* - Notification system
/upload/*        - Pre-signed URL generation
```

### 4. Frontend Improvements
- Extract API base URL to environment config
- Add authentication headers to API calls
- Implement proper error handling and loading states
- Add pull-to-refresh on lists

---

## Quick Wins (Immediate Actions)

1. **Add auth headers to frontend API client** - Security
2. **Move hardcoded IP to environment config** - Dev experience  
3. **Implement VECT-17: Post schema** - Unblock post creation
4. **Complete VECT-60: Media detail pages** - Nearly done
5. **Add VECT-39: Other user profiles** - High value social feature

---

*Generated: Feb 2026*
*Jira Project: VECT - Vector Development*
