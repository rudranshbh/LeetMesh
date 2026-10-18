# Implementation Plan: LeetLeader

## Overview
A web application to create, save, and manage LeetCode leaderboards with user authentication and persistent cloud storage.

## Data Structure
- `users`: Stores user authentication information (managed by Firebase Auth).
- `leaderboards`: Stores saved leaderboards created by authenticated users.
  - Fields: `id`, `name`, `ownerId`, `members` (Array of objects: `{username, stats}`), `createdAt`.

## Features
1. **User Authentication**: Google Auth for saving leaderboards.
2. **Leaderboard Management**:
   - Add/Remove users to/from leaderboard.
   - Fetch LeetCode stats for added users via a reliable third-party API (e.g., `leetcode-stats.tashif.codes`).
   - Manual Refresh functionality.
   - Sorting by various columns (Total Solved, Difficulty Solved, etc.).
3. **Responsive UI**: Clean, searchable, sortable tables.
4. **Persistent Storage**: Firestore for saving/loading user-specific leaderboards.

## Security
- Firestore rules will enforce ownership (`ownerId == request.auth.uid`).
- Server-side API key management via environment variables.
- Strict input validation for all leaderboard fields.

## Workflow
1. Initialize Firebase and Authentication in the React app.
2. Create the UI for leaderboard creation and management.
3. Integrate with an unofficial LeetCode API to fetch user stats.
4. Implement Firestore CRUD for saving/loading leaderboards.
5. Apply final security hardening and linting.
