# Reppy 🚀 - Fitness RPG MMO

**Reppy** is not just a pull-up tracker; it's a fitness RPG ecosystem designed to gamify your training. Track your reps, earn coins, level up your attributes, and join community Boss Fights in a premium, glassmorphism-driven interface.

[https://reppy-weld.vercel.app/](https://reppy-weld.vercel.app/)

![Reppy Banner](https://img.shields.io/badge/Fitness-RPG-orange?style=for-the-badge&logo=vitest)
![Reppy Stars](https://img.shields.io/github/stars/Ro0oman/Reppy?style=for-the-badge)

## 🌟 Key Features

### ⚔️ RPG Progression System
Your workouts translate into real character growth. Level up four core attributes based on your performance:
- **STR (Strength)**: Based on consistency and total volume.
- **PWR (Power)**: Earned through high-intensity and weighted sets.
- **END (Endurance)**: Tracks your ability to sustain volume over time.
- **AGI (Agility)**: Rewarded for daily consistency and streaks.

### 🪙 Economy & Goggins Shop
Earn **Reppy Coins** with every set you log. Spend them in the shop to customize your identity:
- **Legendary Titles**: "The Rabbit King", "Pull-up God", etc.
- **Profile Borders**: Glassmorphism borders that make you stand out in the leaderboard.

### 👹 Global Boss Events
Participate in massive community events. Face off against seasonal bosses like **"El Conejo de Acero"** (The Steel Rabbit). 
- **Global HP Bar**: Every rep you do deals damage to the boss.
- **Tiered Rewards**: Unlock chests and exclusive items as the community hits damage milestones.

### 📊 Advanced Visualization
- **GitHub-style Heatmaps**: Visualize your consistency over the year.
- **Dynamic Stats**: Track total volume, reps, and progression curves.
- **Social Interaction**: Public profiles to showcase your RPG attributes and equipped cosmetics.

## 🎨 Design Philosophy
Reppy uses a **Premium Glassmorphism** aesthetic with:
- Animated background glows and blobs.
- Vibrant HSL tailored colors (Furia/Amber themes).
- Smooth V-Transitions and micro-animations for a "lived-in" feel.

## 🛠️ Tech Stack
- **Frontend**: Vue 3, Vite, Tailwind CSS, Lucide Icons, Axios.
- **Backend**: Node.js, Express, JWT, PostgreSQL.
- **Database**: Supabase / Neon compatible.

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- PostgreSQL Instance
- Google Cloud Console Project (for OAuth)

### 1. Backend Setup
```bash
cd backend
npm install
# Create .env based on the following:
PORT=5000
DATABASE_URL=your_postgres_url
GOOGLE_CLIENT_ID=your_id
JWT_SECRET=your_secret
```
Run the migrations:
```bash
node apply_schema.js
```
Start the server:
```bash
npm run dev
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## 🤝 Contribution
Star the repo if you like what we're building! ⭐

---
&copy; 2026 Reppy Ecosystem. Stay hard.
