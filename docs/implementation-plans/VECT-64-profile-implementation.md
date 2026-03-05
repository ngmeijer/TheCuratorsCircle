VECT-64 Profile: Firestore-backed Implementation Plan

Scope
- Replace fake user profiles with real profiles stored in Firestore.
- Use a persistent GUID as the canonical user identifier; expose a changeable alias history (username) for display and routing.
- No avatars for now; focus on displayName and bio with a stable identifier.
- All profiles are public by default; ownership-only edits apply to changes to the profile and alias.

Key concepts
- Persistent ID (GUID): /userProfiles/{persistentId} – immutable document ID; internal identity
- Alias history: usernamesHistory: string[] (newest first); current alias = usernamesHistory[0]
- Alias index: /usernames/{alias} → { persistentId, ownerUid, isActive, updatedAt }
- Collections: userProfiles (profiles), usernames (alias mapping)

1) Data model
- /userProfiles/{persistentId} (document fields)
  - ownerUid: string
  - usernamesHistory: string[] (newest first; current alias at index 0)
  - displayName: string
  - bio: string
  - isPublic: boolean (default true)
  - createdAt: timestamp
  - updatedAt: timestamp
- /usernames/{alias} (document fields)
  - persistentId: string
  - ownerUid: string
  - isActive: boolean
  - updatedAt: timestamp

- Rules/constraints (high level):
  - Writes to /userProfiles/{persistentId} allowed if request.auth.uid == ownerUid
  - Writes to /usernames/{alias} are invoked via a guarded transactional path (Cloud Function or validated client flow)
  - Reads are public for now (no isPublic gating)

2) ID strategy and UI surface
- Persistent ID: GUID stored as document ID under /userProfiles/{persistentId}
- Alias history: usernamesHistory[0] is the active alias
- UI URLs: /profile/@alias resolves to the GUID via /usernames and then loads /userProfiles/{persistentId}
- GUID is never displayed in UI

3) Username change workflow (hard uniqueness via /usernames index)
- Preconditions: newAlias must start with @ and meet formatting constraints; newAlias must be unused (no isActive true)
- Transactional flow (atomic):
  1. Check availability: read /usernames/{newAlias}
  2. Fetch target profile: read /userProfiles/{persistentId}
  3. Update /userProfiles/{persistentId}:
     - usernamesHistory = [newAlias, ...existingHistory]
     - updatedAt = serverTimestamp()
  4. Write /usernames/{newAlias} = { persistentId, ownerUid, isActive: true, updatedAt }
  5. Optional: mark old alias as inactive in /usernames/{oldAlias} (isActive: false) or keep as historical record
- Result: current alias becomes newAlias; history reflects the change; alias routing remains intact via the /usernames index

4) Migration plan (simplified)
- No automated migration script in this build. For testing, you can manually create /userProfiles and /usernames entries as needed, or rely on signup onboarding to populate new profiles. This keeps the testing surface small for a single account scenario.

5) Frontend integration (React/TypeScript example)
- Profile load by alias:
  - Resolve alias with GET /usernames/{alias} to obtain { persistentId }
  - GET /userProfiles/{persistentId} to render profile: current alias, displayName, bio
- Edit workflow (owner):
  - Form fields: initialAlias (read-only in UI), displayName, bio, isPublic (default true)
  - On submit: trigger transactional username change as described; update UI to reflect usernamesHistory[0]
- Routing: links and routes use /profile/@alias; internal fetch uses alias->persistentId mapping

6) Security and rules (high level)
- Firestore rules (initial): public reads; writes restricted to ownerUid for /userProfiles/{persistentId}
- alias changes guarded by a transactional path (Cloud Function or trusted client flow) that updates /usernames and /userProfiles atomically
- Optional future: implement isPublic gating or auth-required reads later

7) Testing strategy
- Unit tests
  - Username format/length validation
  - History updates on alias change
- Integration tests
  - Load by alias -> loads profile fields
  - Owner updates displayName, bio, and performs alias change; updatedAt and history updated
- Manual QA
  - Rename from @darthvader to @anakinskywalker; check history array, UI, and alias mapping

8) Observability and error handling
- Surface user-friendly errors for username conflicts, permission errors, and validation failures
- Ensure updatedAt reflects writes for audit

9) Acceptance criteria mapping
- AC1: /userProfiles/{persistentId} exists with ownerUid, usernamesHistory, displayName, bio, createdAt, updatedAt, isPublic
- AC2: Alias changes are possible when available; usernamesHistory[0] shows current alias; routing uses alias
- AC3: /usernames/{alias} resolves to the correct /userProfiles/{persistentId}; reads are public
- AC4: Only owner can edit profile and perform alias change; updatedAt updates on writes
- AC5: Migration path supports existing data and signup flow
- AC6: UI handles missing data gracefully

10) Roadmap and milestones
- Milestone 1: Data model and rules finalized; migration plan in place
- Milestone 2: Implement alias indexing, transaction flow, and basic read/write UI wiring
- Milestone 3: Migration tooling and sample data
- Milestone 4: End-to-end tests and manual QA
- Milestone 5: Deploy and monitor

Notes
- This plan assumes a Firestore emulator/testing environment is available for transactional testing before production.
- We can adjust the alias change UX to include a preview of history before commit if desired.
