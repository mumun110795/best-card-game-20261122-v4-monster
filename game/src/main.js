// main.js — one job: conduct the duel. It owns the match state and the
// UI selection, routes clicks to engine actions, plays the animations
// around each attack, narrates what happened in the coach line, runs
// Coach Vera's turns, and opens the title and end screens. In ?shot=
// mode it hands the stage to shots.js instead and wires no input.

import { MONSTERS, TRAINERS } from './cards.js';
import {
  newMatch, defOf, evolutionPlays, attachEnergy, playBasic, evolve,
  playTrainer, retreat, attack, passTurn, promote,
} from './engine.js';
import { aiTakeTurn, aiPromote } from './ai.js';
import { renderGame, showTitle, showEnd } from './render.js';
import { lunge, shake, floater, banner, flash, confetti, wait } from './anim.js';
import { setupShot } from './shots.js';

const app = document.getElementById('app');
const overlay = document.getElementById('overlay');
const params = new URLSearchParams(location.search);

let state = null;
let view = null;
const ui = {
  selectedHand: null, mode: 'idle', evolveTargets: [], busy: false,
  message: '', hint: '', centerNote: '',
};

function render() {
  if (state.pendingPromo === 'you' && state.phase === 'play') {
    ui.mode = 'promote';
    ui.hint = 'Click one of your benched critters to send it into the arena.';
  }
  view = renderGame(app, state, ui);
}

function say(text) { ui.message = text; }
function hint(text) { ui.hint = text; }

function clearSelection() {
  ui.selectedHand = null;
  ui.mode = 'idle';
  ui.evolveTargets = [];
  hint('');
}

// ---- narration ------------------------------------------------------------

function describeAttack(sideKey) {
  const la = state.lastAttack;
  if (!la) return '';
  const atkSide = state.sides[sideKey];
  const attacker = [atkSide.active, ...atkSide.bench].find((m) => m && m.uid === la.attackerUid);
  const name = attacker ? defOf(attacker).name : 'A critter';
  let text = `${name} used ${la.moveName} — ${la.amount} damage!`;
  if (la.effLabel === 'super') text += ` Super effective! ×${la.mult}`;
  if (la.effLabel === 'weak') text += ` Not very effective… ×${la.mult}`;
  if (la.ko) text += ' KNOCKOUT!';
  return text;
}

// ---- animation around an attack that has already been applied -------------

async function animateAttack(attackerSide) {
  const la = state.lastAttack;
  if (!la || !view) return;
  const stage = view.stage;
  const atkEl = stage.querySelector(`.${attackerSide === 'you' ? 'you' : 'foe'}-active .monster-card`);
  const defSel = `.${attackerSide === 'you' ? 'foe' : 'you'}-active .monster-card, .${attackerSide === 'you' ? 'foe' : 'you'}-active .ko-ghost`;
  const defEl = stage.querySelector(defSel);
  if (la.charged) await banner(stage, 'CHARGED ATTACK!', 'charged');
  if (atkEl) await lunge(atkEl, attackerSide === 'you');
  if (defEl) {
    floater(stage, defEl, `-${la.amount}`, la.charged ? '' : '');
    await shake(defEl, la.charged);
  }
  if (la.effLabel === 'super') await banner(stage, `Super effective! ×${la.mult}`, 'super');
  if (la.effLabel === 'weak') await banner(stage, `Not very effective… ×${la.mult}`, 'weak');
  if (la.ko) await banner(stage, 'KNOCKOUT!', 'ko');
}

// ---- the rival's turn ------------------------------------------------------

async function runFoeTurn() {
  if (state.phase !== 'play') return;
  if (state.pendingPromo === 'foe') { aiPromote(state, 'foe'); render(); }
  if (state.current !== 'foe' || state.phase !== 'play') { afterFoe(); return; }
  ui.busy = true;
  say('Coach Vera is sizing up the arena…');
  render();
  await wait(650);
  const prevAttack = state.lastAttack;
  aiTakeTurn(state, 'foe');
  const foeAttacked = state.lastAttack && state.lastAttack !== prevAttack;
  render();
  if (foeAttacked) {
    say(describeAttack('foe'));
    render();
    await animateAttack('foe');
  } else if (state.phase === 'play' && !state.pendingPromo) {
    say('Vera develops her board and passes the turn to you.');
  }
  ui.busy = false;
  afterFoe();
}

function afterFoe() {
  render();
  if (state.phase === 'over') return showEndScreen();
  if (state.pendingPromo === 'you') {
    say('Your critter was knocked out! Choose who fights next.');
    render();
  }
}

function showEndScreen() {
  render();
  if (state.winner === 'you') confetti(document.body, 60);
  showEnd(overlay, state, () => startMatch((Math.random() * 1e9) | 0));
}

// ---- player actions ---------------------------------------------------------

async function doPlayerAttack(kind) {
  if (ui.busy || state.current !== 'you') return;
  ui.busy = true;
  clearSelection();
  const res = attack(state, 'you', kind);
  if (!res.ok) { ui.busy = false; hint(res.reason); render(); return; }
  say(describeAttack('you'));
  render();
  await animateAttack('you');
  ui.busy = false;
  if (state.phase === 'over') return showEndScreen();
  if (state.pendingPromo === 'foe') { aiPromote(state, 'foe'); render(); await wait(300); }
  if (state.current === 'foe') runFoeTurn();
  else render();
}

function doSimpleAction(res, successText) {
  if (!res.ok) { hint(res.reason); render(); return false; }
  clearSelection();
  if (successText) say(successText);
  render();
  return true;
}

function onHandCard(index) {
  if (ui.busy || state.current !== 'you' || state.pendingPromo) return;
  const side = state.sides.you;
  const card = side.hand[index];
  if (!card) return;
  if (ui.selectedHand === index) { clearSelection(); render(); return; }
  clearSelection();
  if (card.kind === 'monster') {
    const def = MONSTERS[card.id];
    if (def.stage === 0) {
      doSimpleAction(playBasic(state, 'you', index), `${def.name} joins your bench.`);
      return;
    }
    const plays = evolutionPlays(state, 'you').filter((p) => p.handIndex === index);
    if (plays.length === 0) {
      hint(side.candy < 25 ? 'Evolution needs 25 Star Candy.'
        : `No ${MONSTERS[def.evolvesFrom].name} in play long enough to evolve yet.`);
      ui.selectedHand = index;
      render();
      return;
    }
    ui.selectedHand = index;
    ui.mode = 'evolve';
    ui.evolveTargets = plays.map((p) => p.targetUid);
    hint(` evolving: click the highlighted ${MONSTERS[def.evolvesFrom].name} (25 candy).`);
    render();
    return;
  }
  if (card.kind === 'energy') {
    if (side.energyUsed) { hint('You already attached an orb this turn.'); ui.selectedHand = index; render(); return; }
    ui.selectedHand = index;
    ui.mode = 'attach';
    hint('Spark Orb: click one of your critters to give it +35 charge.');
    render();
    return;
  }
  // trainer cards
  const def = TRAINERS[card.id];
  if (side.trainerUsed) { hint('One Trainer card per turn.'); ui.selectedHand = index; render(); return; }
  if (card.id === 'berry') {
    ui.selectedHand = index;
    ui.mode = 'berry';
    hint('Berry Heal: click one of your hurt critters to heal 50 HP.');
    render();
  } else if (card.id === 'swapbell') {
    if (state.sides.foe.bench.length === 0) { hint('Vera has no benched critter to swap in.'); ui.selectedHand = index; render(); return; }
    ui.selectedHand = index;
    ui.mode = 'swapbell';
    hint('Swap Bell: click one of Vera\u2019s benched critters to drag it into the arena.');
    render();
  } else {
    doSimpleAction(playTrainer(state, 'you', index), `${def.name} played.`);
  }
}

async function onMonsterClick(sideKey, uid, el) {
  if (ui.busy) return;
  if (state.pendingPromo === 'you' && sideKey === 'you') {
    const res = promote(state, 'you', uid);
    if (res.ok) {
      clearSelection();
      say('A fresh critter steps into the arena!');
      render();
      if (el) await flash(el);
      if (state.current === 'foe') runFoeTurn();
    } else { hint(res.reason); render(); }
    return;
  }
  if (state.current !== 'you' || state.pendingPromo) return;
  const index = ui.selectedHand;
  if (index === null) return;
  if (ui.mode === 'attach' && sideKey === 'you') {
    const res = attachEnergy(state, 'you', index, uid);
    if (doSimpleAction(res, 'Spark Orb attached — charge rising!') && view) {
      const target = view.stage.querySelector(`.monster-card[data-uid="${uid}"]`);
      if (target) floater(view.stage, target, '+35 CHARGE', 'charge');
    }
  } else if (ui.mode === 'berry' && sideKey === 'you') {
    const res = playTrainer(state, 'you', index, uid);
    if (doSimpleAction(res, 'Berry Heal — back in the fight!') && view) {
      const target = view.stage.querySelector(`.monster-card[data-uid="${uid}"]`);
      if (target) floater(view.stage, target, '+50 HP', 'heal');
    }
  } else if (ui.mode === 'evolve' && sideKey === 'you') {
    const res = evolve(state, 'you', index, uid);
    if (res.ok) {
      clearSelection();
      say('EVOLUTION! A stronger critter takes the field!');
      render();
      const target = view.stage.querySelector(`.monster-card[data-uid="${uid}"]`);
      if (target) await flash(target);
    } else { hint(res.reason); render(); }
  } else if (ui.mode === 'swapbell' && sideKey === 'foe') {
    doSimpleAction(playTrainer(state, 'you', index, uid), 'The Swap Bell rings — Vera\u2019s plans are ruined!');
  } else if (ui.mode === 'retreat' && sideKey === 'you') {
    doSimpleAction(retreat(state, 'you', uid), 'A quick retreat — fresh legs in the arena!');
  }
}

function wireInput() {
  app.addEventListener('click', (ev) => {
    const btn = ev.target.closest('[data-action]');
    if (btn && !btn.disabled) {
      const action = btn.dataset.action;
      if (action === 'fast') doPlayerAttack('fast');
      else if (action === 'charged') doPlayerAttack('charged');
      else if (action === 'end') {
        if (ui.busy || state.current !== 'you') return;
        clearSelection();
        passTurn(state, 'you');
        say('You pass the turn.');
        render();
        runFoeTurn();
      } else if (action === 'retreat') {
        if (state.sides.you.bench.length === 0) { hint('Your bench is empty — nobody to swap in.'); render(); return; }
        ui.mode = ui.mode === 'retreat' ? 'idle' : 'retreat';
        hint(ui.mode === 'retreat' ? 'Retreat: click a benched critter to swap it with your Active.' : '');
        render();
      }
      return;
    }
    const handEl = ev.target.closest('.hand-card');
    if (handEl) { onHandCard(Number(handEl.dataset.handIndex)); return; }
    const monEl = ev.target.closest('.monster-card');
    if (monEl) onMonsterClick(monEl.dataset.side, Number(monEl.dataset.uid), monEl);
  });
}

// ---- boot -------------------------------------------------------------------

function startMatch(seed) {
  overlay.classList.remove('shown');
  overlay.innerHTML = '';
  state = newMatch(seed);
  clearSelection();
  say('The arena roars! Bench your critters, charge your Active, and strike.');
  ui.centerNote = 'First to 3 prizes wins the duel';
  render();
}

if (params.get('shot')) {
  document.body.classList.add('still');
  setupShot(params.get('shot'), Number(params.get('seed') || 7), app, overlay);
} else {
  wireInput();
  state = newMatch(20261123);
  say('');
  render();
  showTitle(overlay, () => startMatch((Math.random() * 1e9) | 0));
}
