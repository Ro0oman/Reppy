# Curvas de economía y combate — análisis (2026-07)

Este documento es la "hoja de cálculo de curvas" que pide la auditoría P1 antes de tocar números.
Todo se calcula con las **fórmulas reales del código** (`calculateDamage`, `scaleEnemyHp`, tablas de ruleta),
mediante `backend/scripts/analyze_economy_curves.js` (sin BD, sin efectos). Reproducir con:

```bash
node backend/scripts/analyze_economy_curves.js
```

**Modelo** (declarado en el script): jugador de nivel global `L` con cada stat de combate = `L`, sin gear,
sin pociones, sin perks. Es un baseline "los stats siguen al nivel" para exponer la **forma estructural**
de cada curva, no un jugador concreto. El daño es 1 rep de dominadas determinista (sin crit); el crit
esperado se reporta aparte.

---

## 1. Daño del jugador vs HP enemigo (la curva de dificultad rota)

| lvl | dmg/rep (sin crit) | dmg/rep (crit esperado) | HP enemigo | reps-para-matar |
|----:|----:|----:|----:|----:|
| 1   | 30     | 31      | 1260 | 40.66 |
| 5   | 143    | 175     | 1500 | 8.56 |
| 10  | 300    | 480     | 1800 | 3.75 |
| 20  | 710    | 1 988   | 2400 | 1.21 |
| 30  | 1 365  | 5 733   | 3000 | 0.52 |
| 50  | 4 409  | 25 572  | 4200 | 0.16 |
| 75  | 16 403 | 127 943 | 5700 | 0.04 |
| 100 | 50 695 | 496 811 | 7200 | 0.01 |

**Las reps-para-matar caen de ~41 (nivel 1) a ~0.01 (nivel 100).** El daño del jugador es superlineal
(`levelMult = 1 + L/2`, `fthScale`, `divineBonus = fth·25` plano por rep, y el crit multiplicando encima),
mientras el HP enemigo escala ~lineal (`1 + 0.05·L`). Los enemigos se derriten más cuanto más avanzas —
justo lo contrario de una curva de dificultad. **El HP debería escalar con el daño esperado del jugador**,
no lineal por nivel.

## 2. Bola de nieve de FE (Fe/`fth`)

`divineBonus = fth_lvl · 25` se suma **plano por rep** antes de que los multiplicadores se apilen, y a la vez
el daño a boss genera XP de FE (`stats.js`, FE = daño/50) → más FE → más daño: feedback positivo puro.

| lvl | dmg/rep (sin crit) | divineBonus plano | % del daño que es FE plana |
|----:|----:|----:|----:|
| 1   | 30    | 25   | 83.3% |
| 5   | 143   | 125  | 87.4% |
| 10  | 300   | 250  | 83.3% |
| 30  | 1 365 | 750  | 54.9% |
| 50  | 4 409 | 1250 | 28.4% |
| 100 | 50 695| 2500 | 4.9% |

En niveles bajos-medios el grueso del daño es el bono plano de FE. Domar la bola de nieve = hacer el bono
% pequeño y que FE suba por otra vía (raids/quests), como propone la auditoría.

## 3. Ingreso diario de monedas: entrenar vs pasivo

- **Ruleta 4h**: EV de monedas/giro = `40·0.425 + 75·0.18 + 120·0.10 + 200·0.06 + 350·0.03 + 600·0.01 = 71`.
  Con cooldown de 4h → 6 giros/día = **426 monedas/día** (solo monedas; sin contar gemas/consumibles/cofres).
- **Racha**: `racha · 50`, **sin tope**.
- **Entrenar** (dominadas): `reps · 1`.

| día | racha (50·n) | ruleta | entreno 50r | entreno 200r | % entreno @50r | @200r |
|----:|----:|----:|----:|----:|----:|----:|
| 1   | 50    | 426 | 50 | 200 | 9.5% | 29.6% |
| 7   | 350   | 426 | 50 | 200 | 6.1% | 20.5% |
| 14  | 700   | 426 | 50 | 200 | 4.3% | 15.1% |
| 30  | 1 500 | 426 | 50 | 200 | 2.5% | 9.4% |
| 60  | 3 000 | 426 | 50 | 200 | 1.4% | 5.5% |
| 100 | 5 000 | 426 | 50 | 200 | 0.9% | 3.6% |

**Con una racha larga, entrenar es un % de un solo dígito del ingreso diario.** Abrir la app (racha + ruleta)
domina. La app premia aparecer, no entrenar — confirma la tesis de la auditoría.

## 4. Recompensa de racha: actual vs propuestas

| día | actual (50·n) | Propuesta A (50 + 5·min(n,30)) | Hitos (7/30/100) |
|----:|----:|----:|----:|
| 1   | 50    | 55  | 50 |
| 7   | 350   | 85  | 150 |
| 14  | 700   | 120 | 150 |
| 30  | 1 500 | 200 | 400 |
| 60  | 3 000 | 200 | 400 |
| 100 | 5 000 | 200 | 1000 |

La actual es no acotada (día 100 = 5000/día por **una** rep). Ambas propuestas la acotan. La elección del
número exacto es de Roman (ver ⏸️ en el fichero de tasks).

---

## Implicaciones para las tasks P1 (todas pendientes de decisión de Roman)

1. **Cap a la racha** — necesario; da igual la fórmula, cualquiera acota los 5000/día. §4.
2. **Bajar EV de la ruleta 4h** — 426/día pasivos por clicar. Reducir pesos de premios altos o subир cooldown. §3.
3. **Domar FE** — el bono plano `fth·25/rep` es el 80%+ del daño temprano y se autoalimenta. §2.
4. **Curva de dificultad** — HP enemigo debe escalar con el daño esperado, no lineal. §1.
5. **Pociones DEX de crit / prestigio ROI** — no modeladas aquí en detalle; el crit esperado de §1 ya muestra
   cuánto multiplica el crit (a nivel 100, ×~10 sobre el daño sin crit).

Este análisis es la base; los números concretos los decide Roman sobre estas curvas.
