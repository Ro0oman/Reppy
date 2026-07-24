/**
 * Economy & combat curves analysis (the "hoja de cálculo" from the 2026-07 audit).
 *
 * Purpose: compute — from the REAL in-code formulas — the curves the audit flags,
 * so number-tuning (streak cap, roulette EV, FE snowball, difficulty curve, …) is
 * done on data instead of blind. This script imports the actual game functions
 * (calculateDamage, scaleEnemyHp) so the numbers match production exactly.
 *
 * Run: `node backend/scripts/analyze_economy_curves.js`
 * It touches NO database and has no side effects — pure calculation.
 *
 * MODEL ASSUMPTIONS (stated explicitly; tweak here to explore scenarios):
 *  - A player at global level L is modelled with every combat stat level = L
 *    (str/dex/end/vig/int/fth/cha), no gear, no potions, no skill perks. This is
 *    a deliberately simple "stats track level" baseline to expose the STRUCTURAL
 *    shape of each curve, not a claim about a specific real player.
 *  - Damage shown is deterministic single-rep pull-up damage (no crit roll), so
 *    it is reproducible; the crit expectation is reported separately.
 */
import { calculateDamage } from '../utils/damage.js';
import { scaleEnemyHp } from '../utils/campaignEngine.js';

function modelUser(L) {
  const lvl = { current_level: L };
  for (const s of ['str', 'dex', 'end', 'vig', 'int', 'fth', 'cha']) {
    lvl[`${s}_lvl`] = L;
    lvl[`base_${s}_lvl`] = L;
  }
  return lvl;
}

// Deterministic single-rep pull-up damage (no crit, no gear, no buffs).
function damagePerRep(L) {
  const u = modelUser(L);
  const r = calculateDamage(u, 1, 'pullups', null, true, true, null, 0);
  return r.totalDamage;
}

// Expected crit-weighted per-rep damage: crit chance = min(80, dex*2.5 + vig*0.5),
// crit mult = 2 + dex*0.1. Expected weight per rep = (1-p) + p*mult.
function expectedCritMultiplier(L) {
  const p = Math.min(80, L * 2.5 + L * 0.5) / 100;
  const mult = 2.0 + L * 0.1;
  return (1 - p) + p * mult;
}

console.log('=== 1) PLAYER DAMAGE vs ENEMY HP by level ===');
console.log('(model: every stat level = global level; 1 pull-up rep; campaign enemy base_hp=1200 tier1)');
console.log('lvl | dmg/rep(noCrit) | dmg/rep(expCrit) | enemyHP | reps-to-kill(expCrit) | dmg growth×  | HP growth×');
let prevDmg = null, prevHp = null;
for (const L of [1, 5, 10, 20, 30, 50, 75, 100]) {
  const d = damagePerRep(L);
  const dCrit = d * expectedCritMultiplier(L);
  const hp = scaleEnemyHp({ base_hp: 1200, tier: 1, scaling: {} }, null, L, 0);
  const rtk = (hp / dCrit);
  const dg = prevDmg ? (dCrit / prevDmg) : 1;
  const hg = prevHp ? (hp / prevHp) : 1;
  console.log(
    `${String(L).padStart(3)} | ${d.toFixed(0).padStart(15)} | ${dCrit.toFixed(0).padStart(16)} | ${hp.toFixed(0).padStart(7)} | ${rtk.toFixed(2).padStart(21)} | ${dg.toFixed(2).padStart(11)}x | ${hg.toFixed(2).padStart(9)}x`
  );
  prevDmg = dCrit; prevHp = hp;
}
console.log('→ reps-to-kill FALLS as level rises: player damage is superlinear (levelMult=1+L/2, fthScale, flat divineBonus=fth*25), enemy HP is ~linear (1+0.05·L). Enemies melt faster the further you get.\n');

console.log('=== 2) FLAT DIVINE BONUS (FE snowball) share of per-rep damage ===');
console.log('(divineBonus = fth_lvl * 25, added flat per rep BEFORE multipliers stack)');
console.log('lvl | dmg/rep(noCrit) | flat divineBonus | divine share %');
for (const L of [1, 5, 10, 20, 30, 50, 100]) {
  const d = damagePerRep(L);
  const divine = L * 25;
  console.log(`${String(L).padStart(3)} | ${d.toFixed(0).padStart(15)} | ${String(divine).padStart(16)} | ${(100 * divine / d).toFixed(1).padStart(13)}%`);
}
console.log('→ FE (fth) contributes a flat +25/level per rep that also feeds XP→more FE (positive feedback). See damage.js divineBonus + stats.js FE-from-damage.\n');

console.log('=== 3) DAILY COIN INCOME: training vs passive ===');
const ROULETTE_4H_COINS_EV = (40*0.425 + 75*0.18 + 120*0.10 + 200*0.06 + 350*0.03 + 600*0.01); // coins-only EV/spin
const spinsPerDay = 24 / 4; // 4h cooldown
const roulettePerDay = ROULETTE_4H_COINS_EV * spinsPerDay;
console.log(`roulette 4h coins-EV/spin = ${ROULETTE_4H_COINS_EV.toFixed(1)}  → ${spinsPerDay} spins/day = ${roulettePerDay.toFixed(0)} coins/day (coins only; excl gems/consumables/chests)`);
console.log('streak reward = streak * 50 (UNCAPPED). training(pullups) = reps * 1.');
console.log('day | streakReward | roulette | training(50r) | training(200r) | training share @50r | @200r');
for (const day of [1, 7, 14, 30, 60, 100]) {
  const streakReward = day * 50;
  for (const tr of [null]) void tr;
  const t50 = 50, t200 = 200;
  const total50 = streakReward + roulettePerDay + t50;
  const total200 = streakReward + roulettePerDay + t200;
  console.log(
    `${String(day).padStart(3)} | ${String(streakReward).padStart(12)} | ${roulettePerDay.toFixed(0).padStart(8)} | ${String(t50).padStart(13)} | ${String(t200).padStart(14)} | ${(100*t50/total50).toFixed(1).padStart(18)}% | ${(100*t200/total200).toFixed(1)}%`
  );
}
console.log('→ On a long streak, actually TRAINING is a single-digit % of daily coin income; opening the app (streak + roulette) dominates. The app rewards showing up, not training.\n');

console.log('=== 4) STREAK REWARD: current vs audit proposals ===');
console.log('day | current(50*n) | proposalA(50+5*min(n,30)) | milestones(7/30/100)');
const milestone = (n) => (n >= 100 ? 1000 : n >= 30 ? 400 : n >= 7 ? 150 : 50);
for (const day of [1, 7, 14, 30, 60, 100]) {
  const cur = day * 50;
  const a = 50 + 5 * Math.min(day, 30);
  console.log(`${String(day).padStart(3)} | ${String(cur).padStart(13)} | ${String(a).padStart(25)} | ${String(milestone(day)).padStart(20)}`);
}
console.log('→ Current is unbounded (day100 = 5000/day for a single rep). Both proposals bound it. (Decision pending — see ⏸️ in tasks.)');
