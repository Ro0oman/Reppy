# Reppy 🚀 - Fitness RPG MMO

**Reppy** is not just a pull-up tracker; it's a fitness RPG ecosystem designed to gamify your training. Track your reps, earn coins, level up your attributes, and join community Boss Fights in a premium, glassmorphism-driven interface.

[https://reppy-weld.vercel.app/](https://reppy-weld.vercel.app/)

![Reppy Banner](https://img.shields.io/badge/Fitness-RPG-orange?style=for-the-badge&logo=vitest)
![Reppy Stars](https://img.shields.io/github/stars/Ro0oman/Reppy?style=for-the-badge)

## 🌟 Key Features

### ⚔️ RPG Progression System
Your character grows with every rep. Progress is tracked through four core attributes that scale your power:
- **LVL (Account Level)**: Your overall progress. Increases with total XP.
- **STR (Strength)**: Scales your base damage against Bosses. Raised by Pull-ups and Push-ups.
- **PWR (Power)**: Critical for high-tier unlocks. Raised by Muscle-ups and weighted sets.
- **END (Endurance)**: Determines your durability in community events. Raised by high-volume sessions.
- **AGI (Agility)**: Critical for loot chance. Reward for daily streaks and consistency.

### 🏹 Combat & Damage Mechanics
Reppy features a community-driven battle system where every user contributes to a global effort:
- **Calculation**: `Reps × STR LVL = Base Damage`.
- **Critical Hits**: A 10% base chance (enhanced by items) to deal `2x` damage. 
- **Global HP**: Bosses feature massive HP pools (e.g., 500K+) that synchronize across all active users in real-time.
- **Participation**: You must log at least 1 rep during the active event window to be eligible for rewards.

### 👹 Global Boss Events
Massive community events triggered seasonally. Face legends like **"El Conejo de Acero"**.
- **Real-time Sync**: Battle progress updates via polling for all hunters.
- **Death Phrases**: Bosses taunt the community with dynamic quotes that change based on their health state.
- **Neutralization**: Once HP hits 0, the boss enters a `DEFEATED` state, allowing reward claims.

### 🎁 Loot & Chest System
Victories grant access to a rarity-based reward system:
- **Chests**: Claimable once per boss defeat.
- **Rarity Tiers**: Common, Rare, Epic, and Legendary items.
- **Drop Logic**: Higher AGI stats and participation volume influence the quality of rewards (titles, coin modifiers, and borders).

### 🪙 Economy & Elite Bundles
Earn **Reppy Coins** to spend in the **Goggins Shop**:
- **Consumables**: Temporary stat boosters and XP multipliers.
- **Cosmetics**: Dynamic glassmorphism backgrounds and animated profile borders.
- **Elite Bundles**: Limited-time shop offers featuring Legendary rarity sets at discounted rates.

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
