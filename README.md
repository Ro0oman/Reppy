# Reppy 🚀

Modern pull-up tracking SaaS. Track your reps, visualize progress with GitHub-style heatmaps, and compete with friends.

## Features
- **Premium Aesthetics**: Animated background glows, advanced glassmorphism, and smooth micro-animations.
- **Google Auth**: Secure login with your Google account (ID verified).
- **Reps Tracking**: Log your daily pull-ups with quick-add buttons (+1, +5, +10).
- **Activity Heatmap**: Periodic visualization of training progress via a contribution graph.
- **Social & Friends**: Search for enthusiasts and build your "Inner Circle".
- **Rankings**: Compete in Global or Friends-only leaderboards.

## Tech Stack
- **Frontend**: Vue 3, Vite, Tailwind CSS, Lucide Icons
- **Backend**: Node.js, Express, JWT
- **Database**: PostgreSQL (Supabase / Neon compatible)
- **Deployment**: Vercel

## Setup

### Prerequisites
- Node.js (v18+)
- PostgreSQL Database
- Google Cloud Project (for OAuth)

### Backend
1. `cd backend`
2. `npm install`
3. Create `.env` from the provided schema:
   - **DATABASE_URL**: Link your PostgreSQL instance (e.g., Supabase, Neon).
   - **GOOGLE_CLIENT_ID**: Must match the frontend Client ID.
   - **JWT_SECRET**: Any secure random string.
   ```env
   PORT=5000
   DATABASE_URL=your_postgres_url
   GOOGLE_CLIENT_ID=your_id
   GOOGLE_CLIENT_SECRET=your_secret
   JWT_SECRET=your_jwt_secret
   FRONTEND_URL=http://localhost:5173
   ```
4. `npm run dev`

### Frontend
1. `cd frontend`
2. `npm install`
3. Create a Google Cloud Project and generate an **OAuth 2.0 Client ID**.
   - **IMPORTANT**: Add `http://localhost:5173` to **Authorized JavaScript origins**.
   - Add `http://localhost:5173` to **Authorized redirect URIs**.
4. Copy the Client ID and replace the placeholder value in `frontend/src/main.js`.
5. `npm run dev`

## Deployment
This project is configured for **Vercel**. Simply connect your GitHub repository and Vercel will handle the rest via the root `vercel.json`.
