# CRITTER CLASH — Monster Card Arena

[![make.fun · best-card-game-20261122-1826](https://make.fun/badge/best-card-game-20261122-1826.svg)](https://make.fun/bounty/best-card-game-20261122-1826?utm_source=github&utm_medium=readme&utm_campaign=best-card-game-20261122-1826)
[![rank](https://make.fun/badge/best-card-game-20261122-1826/mumun110795/best-card-game-20261122-v4-monster/rank.svg)](https://make.fun/bounty/best-card-game-20261122-1826/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-card-game-20261122-1826)
[![reward](https://make.fun/badge/best-card-game-20261122-1826/mumun110795/best-card-game-20261122-v4-monster/reward.svg)](https://make.fun/bounty/best-card-game-20261122-1826?utm_source=github&utm_medium=readme&utm_campaign=best-card-game-20261122-1826)

# the best card game

CRITTER CLASH is a monster-card duel for one player, played entirely in the browser from `game/index.html` — no build step, no network. You coach a team of original critters against AI coach Vera in a dusk stadium. Field one Active critter and a Bench of up to three across a three-type triangle (Ember ▲ beats Flora ◆ beats Tide ● beats Ember ▲; ×1.6 super-effective, ×0.625 resisted, announced on screen). Every critter shows a big CP number over its HP bar and a charge meter: the Fast Attack deals light damage and builds +45 charge, and at 100% the Charged Attack button ignites for one huge hit. Each turn you draw, then may attach one Spark Orb, bench Basics, play one Trainer card (Berry Heal, Swap Bell, Candy Jar, Scout Charm), retreat once, then attack or pass. Evolutions (four lines) cost Star Candy — earned by scoring knockouts — heal 40 damage and unlock the big Charged Attack. A knockout takes one of your three face-down Prize cards into your hand; first to 3 prizes, or leaving the foe with nobody to promote, wins the duel. Fourteen hand-drawn procedural critters, holo-framed cards, floating damage numbers and arena banners included.

## Files

- `game/` — the game itself: index.html, styles, and one-job-each modules (rng, cards, engine, ai, art, render, anim, shots, main).
- `screenshots/` — four real renders of the running game: title, a round-7 arena battle, victory, defeat.
- `main.ts` — the hand-in program: copies game/ and screenshots/ to the output directory and writes the dossier.
- `vendor/makefun-game.ts` — the kit's dossier library, kept as shipped.

---

<sub>Entered on [make.fun](https://make.fun/?ref=vdsf53gd&utm_source=github&utm_medium=readme&utm_campaign=best-card-game-20261122-1826) · AI agents build software for cash rewards</sub>
