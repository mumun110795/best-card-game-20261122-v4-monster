// ai.js — one job: play one side of a match with readable, counterable
// heuristics. The rival trainer develops its bench, feeds its Active's
// charge meter, evolves when it can, heals a badly hurt lead, retreats out
// of a bad type match-up, and always attacks — Charged the moment the
// meter is full. The play-test harness also uses it to drive both sides.

import { MONSTERS, TRAINERS, effectiveness } from './cards.js';
import {
  defOf, hpLeft, monstersInPlay, evolutionPlays, canAttack,
  attachEnergy, playBasic, evolve, playTrainer, retreat, attack, passTurn, promote,
} from './engine.js';

function handIndexOf(side, pred) {
  return side.hand.findIndex(pred);
}

function strongestBench(side) {
  return side.bench.slice().sort((a, b) => hpLeft(b) - hpLeft(a))[0] || null;
}

// If this side must promote after a knockout, pick the healthiest bench.
export function aiPromote(state, sideKey) {
  const side = state.sides[sideKey];
  const best = strongestBench(side);
  if (best) promote(state, sideKey, best.uid);
}

// Play a full turn for `sideKey`, calling engine actions in a fixed order.
// Returns the list of action labels taken, for the UI's pacing and logs.
export function aiTakeTurn(state, sideKey) {
  const taken = [];
  if (state.phase !== 'play' || state.current !== sideKey) return taken;
  if (state.pendingPromo === sideKey) { aiPromote(state, sideKey); return ['promote']; }
  const side = state.sides[sideKey];
  const foeKey = sideKey === 'you' ? 'foe' : 'you';
  const foe = state.sides[foeKey];

  // 1. Bench every Basic in hand — a deep bench is insurance and options.
  for (;;) {
    const idx = handIndexOf(side, (c) => c.kind === 'monster' && MONSTERS[c.id].stage === 0);
    if (idx < 0 || side.bench.length >= 3) break;
    if (!playBasic(state, sideKey, idx).ok) break;
    taken.push('bench');
  }

  // 2. Evolve the most valuable target available.
  const plays = evolutionPlays(state, sideKey)
    .sort((a, b) => MONSTERS[b.into].cp - MONSTERS[a.into].cp);
  if (plays.length > 0 && evolve(state, sideKey, plays[0].handIndex, plays[0].targetUid).ok) {
    taken.push('evolve');
  }

  // 3. Feed a Spark Orb to the Active (or to a benched evolution-to-be).
  const orbIdx = handIndexOf(side, (c) => c.kind === 'energy');
  if (orbIdx >= 0 && side.active) {
    let target = side.active;
    const benchEvolver = side.bench.find((m) => defOf(m).evolvesTo && side.hand.some(
      (c) => c.kind === 'monster' && MONSTERS[c.id].evolvesFrom === m.species));
    if (benchEvolver && target.meter >= 65) target = benchEvolver;
    if (attachEnergy(state, sideKey, orbIdx, target.uid).ok) taken.push('attach');
  }

  // 4. One Trainer, by situation.
  const active = side.active;
  const berryIdx = handIndexOf(side, (c) => c.kind === 'trainer' && c.id === 'berry');
  const scoutIdx = handIndexOf(side, (c) => c.kind === 'trainer' && c.id === 'scout');
  const jarIdx = handIndexOf(side, (c) => c.kind === 'trainer' && c.id === 'candyjar');
  const bellIdx = handIndexOf(side, (c) => c.kind === 'trainer' && c.id === 'swapbell');
  let trainerDone = false;
  if (berryIdx >= 0 && active && active.damage >= 50) {
    trainerDone = playTrainer(state, sideKey, berryIdx, active.uid).ok;
    if (trainerDone) taken.push('berry');
  }
  if (!trainerDone && bellIdx >= 0 && foe.active && foe.bench.length > 0) {
    // Ring the foe's scary evolved Active away for its frailest bench pick.
    const foeActiveDef = defOf(foe.active);
    const frail = foe.bench.slice().sort((a, b) => hpLeft(a) - hpLeft(b))[0];
    if (foeActiveDef.stage === 1 && hpLeft(frail) < hpLeft(foe.active) - 30) {
      trainerDone = playTrainer(state, sideKey, bellIdx, frail.uid).ok;
      if (trainerDone) taken.push('swapbell');
    }
  }
  if (!trainerDone && jarIdx >= 0 && side.candy < 25
      && side.hand.some((c) => c.kind === 'monster' && MONSTERS[c.id].stage === 1)) {
    trainerDone = playTrainer(state, sideKey, jarIdx).ok;
    if (trainerDone) taken.push('candyjar');
  }
  if (!trainerDone && scoutIdx >= 0 && side.hand.length <= 3) {
    trainerDone = playTrainer(state, sideKey, scoutIdx).ok;
    if (trainerDone) taken.push('scout');
  }

  // 5. Retreat out of a resisted match-up into a bench monster that hits back.
  const now = state.sides[sideKey];
  if (now.active && foe.active && !now.retreated) {
    const mine = effectiveness(defOf(now.active).type, defOf(foe.active).type);
    const theirs = effectiveness(defOf(foe.active).type, defOf(now.active).type);
    if (theirs.label === 'super' && mine.label !== 'super') {
      const counter = now.bench.find((m) => effectiveness(defOf(m).type, defOf(foe.active).type).label === 'super');
      if (counter && retreat(state, sideKey, counter.uid).ok) taken.push('retreat');
    }
  }

  // 6. Attack: Charged at a full meter, otherwise Fast to build it.
  if (canAttack(state, sideKey, 'charged') && attack(state, sideKey, 'charged').ok) {
    taken.push('charged');
  } else if (canAttack(state, sideKey, 'fast') && attack(state, sideKey, 'fast').ok) {
    taken.push('fast');
  } else {
    passTurn(state, sideKey);
    taken.push('pass');
  }
  // If our attack knocked the foe out, their promotion is theirs to make;
  // if the foe's earlier attack left us pending, that is handled on entry.
  return taken;
}
