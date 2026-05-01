# Reppy - Calisthenics RPG Platform

Reppy is a calisthenics tracker with RPG progression, social feed, global boss fights, PvP duels, and web notifications.

Live app: [https://reppy-weld.vercel.app/](https://reppy-weld.vercel.app/)

## Features

- RPG stats and leveling: STR, DEX, END, VIG, INT, FTH, CHA.
- Social feed with likes, comments, and comment-thread subscriptions.
- Real-time notifications (in-app + push).
- Community boss fights with shared HP and rewards.
- PvP duels with configurable rules.
- Heatmap, ranking system, inventory, and cosmetics shop.

## Tech Stack

- Frontend: Vue 3, Vite, Tailwind, Pinia, Axios.
- Backend: Node.js, Express, PostgreSQL.
- Realtime/Push: Pusher + Web Push.

## Local Setup

### Backend

```bash
cd backend
npm install
```

Create `backend/.env`:

```env
PORT=5001
DATABASE_URL=your_postgres_url
GOOGLE_CLIENT_ID=your_google_client_id
JWT_SECRET=your_jwt_secret
VAPID_PUBLIC_KEY=your_vapid_public_key
VAPID_PRIVATE_KEY=your_vapid_private_key
```

Start backend:

```bash
npm run dev
```

### Frontend

```bash
cd frontend
npm install
```

Create `frontend/.env.local`:

```env
VITE_API_URL=http://localhost:5001
VITE_PUSHER_KEY=your_pusher_key
VITE_PUSHER_CLUSTER=eu
```

Start frontend:

```bash
npm run dev
```

## Notes

- Build in some Windows setups may fail with `spawn EPERM` from Vite/Rolldown.
- Backend currently has no automated test suite (`npm test` is placeholder).

