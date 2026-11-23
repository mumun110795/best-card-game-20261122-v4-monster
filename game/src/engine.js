// engine.js — one job: the rules of a monster-card duel. Pure state and
// functions, no DOM: the browser controller and the headless play-test
// harness both drive matches through here.
//
// A turn: draw, then any of (attach one Spark Orb, bench Basics, evolve for
// Star Candy, play one Trainer, retreat once), then a Fast Attack (builds
// charge) or a full-meter Charged Attack — or pass. A knockout takes a
// prize; three prizes, or leaving the foe with nobody to promote, wins.

import { makeRng, shuffle } from './rng.js';
import {
  MONSTERS, TRAINERS, effectiveness, playerDeck, rivalDeck,
  EVOLVE_COST, START_CANDY, KO_CANDY, CHARGE_PER_FAST, CHARGE_PER_ORB,
  CHARGE_MAX, PRIZES_TO_WIN, BENCH_MAX,
} from './cards.js';

export function defOf(inst) { return MONSTERS[inst.species]; }
export function hpLeft(inst) { return Math.max(0, defOf(inst).hp - inst.damage); }
export function isBasic(cardRef) {
  return cardRef.kind === 'monster' && MONSTERS[cardRef.id].stage === 0;
}

let uidSeq = 1;
function makeInst(species, turn) {
  return { uid: uidSeq++, species, damage: 0, meter: 0, orbs: 0, enteredTurn: turn };
}

function makeSide(deckCards, rng) {
  let deck = shuffle(deckCards, rng);
  let hand = deck.splice(0, 5);
  // Mulligan: an opening hand with no Basic is shuffled back and redrawn.
  let guard = 0;
  while (!hand.some(isBasic) && guard++ < 40) {
    deck = shuffle(deck.concat(hand), rng);
    hand = deck.splice(0, 5);
  }
  const prizes = deck.splice(0, PRIZES_TO_WIN);
  return {
    deck, hand, prizes, prizesTaken: 0, candy: START_CANDY,
    active: null, bench: [],
    energyUsed: false, trainerUsed: false, retreated: false,
  };
}

function fieldBasics(hand) { return hand.filter(isBasic); }

export function newMatch(seed) {
  uidSeq = 1;
  const rng = makeRng(seed);
  const state = {
    seed, rng, turn: 1, current: 'you', phase: 'play', winner: null,
    pendingPromo: null, lastAttack: null, turnsTaken: 0,
    sides: { you: makeSide(playerDeck(), rng), foe: makeSide(rivalDeck(), rng) },
  };
  // Each side leads with the strongest Basic from its opening hand.
  for (const key of ['you', 'foe']) {
    const side = state.sides[key];
    const basics = fieldBasics(side.hand);
    basics.sort((a, b) => MONSTERS[b.id].cp - MONSTERS[a.id].cp);
    const lead = basics[0];
    side.hand.splice(side.hand.indexOf(lead), 1);
    side.active = makeInst(lead.id, 0);
  }
  return state;
}

export function other(key) { return key === 'you' ? 'foe' : 'you'; }

function finishIfDecided(state) {
  for (const key of ['you', 'foe']) {
    if (state.sides[key].prizesTaken >= PRIZES_TO_WIN) {
      state.phase = 'over';
      state.winner = key;
      return true;
    }
  }
  return false;
}

function beginTurn(state, key) {
  const side = state.sides[key];
  state.current = key;
  state.turnsTaken += 1;
  side.energyUsed = false;
  side.trainerUsed = false;
  side.retreated = false;
  if (state.turnsTaken > 240) { // safety valve: settle on prizes, then HP
    const a = state.sides.you, b = state.sides.foe;
    state.phase = 'over';
    if (a.prizesTaken !== b.prizesTaken) state.winner = a.prizesTaken > b.prizesTaken ? 'you' : 'foe';
    else {
      const hp = (s) => [s.active, ...s.bench].filter(Boolean).reduce((n, m) => n + hpLeft(m), 0);
      state.winner = hp(a) === hp(b) ? 'draw' : hp(a) > hp(b) ? 'you' : 'foe';
    }
    return;
  }
  if (side.deck.length === 0) { // cannot draw: the deck is gone, the duel is lost
    state.phase = 'over';
    state.winner = other(key);
    return;
  }
  side.hand.push(side.deck.shift());
}

function endTurnNow(state) {
  if (state.phase !== 'play' || state.pendingPromo) return;
  state.turn += state.current === 'foe' ? 1 : 0;
  beginTurn(state, other(state.current));
}

// ---- queries the UI and the AI share -------------------------------------

export function monstersInPlay(side) {
  return [side.active, ...side.bench].filter(Boolean);
}

export function findMonster(state, sideKey, uid) {
  return monstersInPlay(state.sides[sideKey]).find((m) => m.uid === uid) || null;
}

export function evolutionPlays(state, sideKey) {
  const side = state.sides[sideKey];
  const plays = [];
  if (side.candy < EVOLVE_COST) return plays;
  side.hand.forEach((card, handIndex) => {
    if (card.kind !== 'monster') return;
    const def = MONSTERS[card.id];
    if (def.stage !== 1) return;
    for (const target of monstersInPlay(side)) {
      if (target.species === def.evolvesFrom && target.enteredTurn < state.turn) {
        plays.push({ handIndex, targetUid: target.uid, into: card.id });
      }
    }
  });
  return plays;
}

export function canAttack(state, sideKey, kind) {
  if (state.phase !== 'play' || state.pendingPromo || state.current !== sideKey) return false;
  const active = state.sides[sideKey].active;
  if (!active) return false;
  if (kind === 'charged') return active.meter >= CHARGE_MAX;
  return true;
}

// ---- actions (each returns { ok, reason?, events }) -----------------------

function fail(reason) { return { ok: false, reason, events: [] }; }
function done(events) { return { ok: true, events }; }

function takeHandCard(side, handIndex, kinds) {
  const card = side.hand[handIndex];
  if (!card || !kinds.includes(card.kind)) return null;
  side.hand.splice(handIndex, 1);
  return card;
}

export function attachEnergy(state, sideKey, handIndex, targetUid) {
  if (state.current !== sideKey || state.phase !== 'play' || state.pendingPromo) return fail('not your turn');
  const side = state.sides[sideKey];
  if (side.energyUsed) return fail('one orb per turn');
  const target = findMonster(state, sideKey, targetUid);
  if (!target) return fail('no such monster');
  const card = takeHandCard(side, handIndex, ['energy']);
  if (!card) return fail('not an energy card');
  side.energyUsed = true;
  target.orbs += 1;
  target.meter = Math.min(CHARGE_MAX, target.meter + CHARGE_PER_ORB);
  return done([{ type: 'attach', side: sideKey, uid: target.uid, meter: target.meter }]);
}

export function playBasic(state, sideKey, handIndex) {
  if (state.current !== sideKey || state.phase !== 'play' || state.pendingPromo) return fail('not your turn');
  const side = state.sides[sideKey];
  if (side.bench.length >= BENCH_MAX) return fail('bench is full');
  const card = side.hand[handIndex];
  if (!card || !isBasic(card)) return fail('not a basic monster');
  takeHandCard(side, handIndex, ['monster']);
  const inst = makeInst(card.id, state.turn);
  side.bench.push(inst);
  return done([{ type: 'bench', side: sideKey, uid: inst.uid, species: card.id }]);
}

export function evolve(state, sideKey, handIndex, targetUid) {
  if (state.current !== sideKey || state.phase !== 'play' || state.pendingPromo) return fail('not your turn');
  const side = state.sides[sideKey];
  const play = evolutionPlays(state, sideKey).find((p) => p.handIndex === handIndex && p.targetUid === targetUid);
  if (!play) return fail('that evolution is not available');
  const target = findMonster(state, sideKey, targetUid);
  takeHandCard(side, handIndex, ['monster']);
  side.candy -= EVOLVE_COST;
  target.species = play.into;
  target.damage = Math.max(0, target.damage - 40); // evolution restores 40 HP of damage
  return done([{ type: 'evolve', side: sideKey, uid: target.uid, into: play.into }]);
}

export function playTrainer(state, sideKey, handIndex, targetUid) {
  if (state.current !== sideKey || state.phase !== 'play' || state.pendingPromo) return fail('not your turn');
  const side = state.sides[sideKey];
  if (side.trainerUsed) return fail('one trainer per turn');
  const card = side.hand[handIndex];
  if (!card || card.kind !== 'trainer') return fail('not a trainer card');
  const def = TRAINERS[card.id];
  const foe = state.sides[other(sideKey)];
  if (card.id === 'berry') {
    const target = targetUid ? findMonster(state, sideKey, targetUid) : null;
    if (!target || target.damage === 0) return fail('berry needs a hurt monster of yours');
  }
  if (card.id === 'swapbell') {
    const target = targetUid ? findMonster(state, other(sideKey), targetUid) : null;
    if (!target || foe.active.uid === targetUid) return fail('swap bell needs a benched foe');
  }
  takeHandCard(side, handIndex, ['trainer']);
  side.trainerUsed = true;
  const events = [{ type: 'trainer', side: sideKey, card: card.id }];
  if (card.id === 'berry') {
    const target = findMonster(state, sideKey, targetUid);
    target.damage = Math.max(0, target.damage - def.heal);
    events.push({ type: 'heal', side: sideKey, uid: target.uid, amount: def.heal });
  } else if (card.id === 'swapbell') {
    const idx = foe.bench.findIndex((m) => m.uid === targetUid);
    const [promoted] = foe.bench.splice(idx, 1);
    foe.bench.push(foe.active);
    foe.active = promoted;
    events.push({ type: 'swap', side: other(sideKey), uid: promoted.uid });
  } else if (card.id === 'candyjar') {
    side.candy += 25;
    events.push({ type: 'candy', side: sideKey, candy: side.candy });
  } else if (card.id === 'scout') {
    for (let i = 0; i < 2 && side.deck.length > 0; i++) side.hand.push(side.deck.shift());
    events.push({ type: 'draw', side: sideKey, count: 2 });
  }
  return done(events);
}

export function retreat(state, sideKey, benchUid) {
  if (state.current !== sideKey || state.phase !== 'play' || state.pendingPromo) return fail('not your turn');
  const side = state.sides[sideKey];
  if (side.retreated) return fail('already retreated this turn');
  const idx = side.bench.findIndex((m) => m.uid === benchUid);
  if (idx < 0) return fail('no such benched monster');
  const [promoted] = side.bench.splice(idx, 1);
  side.bench.push(side.active);
  side.active = promoted;
  side.retreated = true;
  return done([{ type: 'retreat', side: sideKey, uid: promoted.uid }]);
}

export function promote(state, sideKey, benchUid) {
  if (state.phase !== 'play' || state.pendingPromo !== sideKey) return fail('no promotion waiting');
  const side = state.sides[sideKey];
  const idx = side.bench.findIndex((m) => m.uid === benchUid);
  if (idx < 0) return fail('no such benched monster');
  const [promoted] = side.bench.splice(idx, 1);
  side.active = promoted;
  state.pendingPromo = null;
  const events = [{ type: 'promote', side: sideKey, uid: promoted.uid }];
  endTurnNow(state);
  return done(events);
}

export function attack(state, sideKey, kind) {
  if (!canAttack(state, sideKey, kind)) return fail('that attack is not ready');
  const atkSide = state.sides[sideKey];
  const defKey = other(sideKey);
  const defSide = state.sides[defKey];
  const attacker = atkSide.active;
  const defender = defSide.active;
  const atkDef = defOf(attacker);
  const move = kind === 'charged' ? atkDef.charged : atkDef.fast;
  const eff = effectiveness(atkDef.type, defOf(defender).type);
  const amount = Math.max(1, Math.round(move.dmg * eff.mult));
  defender.damage += amount;
  if (kind === 'charged') attacker.meter = 0;
  else attacker.meter = Math.min(CHARGE_MAX, attacker.meter + CHARGE_PER_FAST);
  if (move.heal) attacker.damage = Math.max(0, attacker.damage - move.heal);
  state.lastAttack = {
    attackerUid: attacker.uid, defenderUid: defender.uid, moveName: move.name,
    amount, effLabel: eff.label, mult: eff.mult, charged: kind === 'charged',
    ko: hpLeft(defender) <= 0,
  };
  const events = [{ type: 'attack', side: sideKey, ...state.lastAttack }];
  if (hpLeft(defender) <= 0) {
    events.push({ type: 'ko', side: defKey, uid: defender.uid });
    defSide.active = null;
    atkSide.prizesTaken += 1;
    atkSide.candy += KO_CANDY;
    if (atkSide.prizes.length > 0) atkSide.hand.push(atkSide.prizes.shift());
    events.push({ type: 'prize', side: sideKey, taken: atkSide.prizesTaken });
    if (finishIfDecided(state)) { events.push({ type: 'win', side: state.winner }); return done(events); }
    if (defSide.bench.length === 0) {
      state.phase = 'over';
      state.winner = sideKey;
      events.push({ type: 'win', side: sideKey });
      return done(events);
    }
    state.pendingPromo = defKey;
    return done(events);
  }
  endTurnNow(state);
  return done(events);
}

export function passTurn(state, sideKey) {
  if (state.current !== sideKey || state.phase !== 'play' || state.pendingPromo) return fail('cannot pass now');
  endTurnNow(state);
  return done([{ type: 'pass', side: sideKey }]);
}
