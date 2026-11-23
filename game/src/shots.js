// shots.js — one job: stage the four screenshot scenes. Each ?shot= name
// builds a deterministic state (a scripted mid-duel tableau for the battle
// scene) and renders it with animations frozen, so the maker's screenshots
// are real renders of the game's own code at its most complete.

import { newMatch } from './engine.js';
import { renderGame, showTitle, showEnd } from './render.js';
import { banner, floater } from './anim.js';

function inst(uid, species, damage = 0, meter = 0, orbs = 0) {
  return { uid, species, damage, meter, orbs, enteredTurn: 0 };
}

const uiFor = (over = {}) => ({
  selectedHand: null, mode: 'idle', evolveTargets: [], busy: false,
  message: '', hint: '', centerNote: 'First to 3 prizes wins the duel', ...over,
});

export function setupShot(name, seed, app, overlay) {
  if (name === 'title') {
    const state = newMatch(seed);
    renderGame(app, state, uiFor());
    showTitle(overlay, () => {});
    return;
  }

  if (name === 'battle') {
    const state = newMatch(seed);
    const you = state.sides.you, foe = state.sides.foe;
    // A round-7 tableau: your evolved Bloomhart, meter full, faces Vera's
    // Waveback; benches developed, one prize already in your pocket.
    you.active = inst(901, 'bloomhart', 26, 100, 2);
    you.bench = [inst(902, 'waveback', 18, 45, 1), inst(903, 'cindlet', 0, 10, 0)];
    you.hand = [
      { kind: 'monster', id: 'blazehorn' },
      { kind: 'energy', id: 'spark' },
      { kind: 'trainer', id: 'berry' },
      { kind: 'monster', id: 'pupcurrent' },
    ];
    you.prizesTaken = 1; you.prizes = you.prizes.slice(0, 2); you.candy = 50;
    foe.active = inst(951, 'waveback', 0, 70, 2);
    foe.bench = [inst(952, 'blazehorn', 12, 30, 1), inst(953, 'mosshop', 0, 0, 0)];
    foe.prizesTaken = 1; foe.prizes = foe.prizes.slice(0, 2); foe.candy = 25;
    state.turn = 7;
    state.lastAttack = null;
    const view = renderGame(app, state, uiFor({
      message: 'Solar Bloom is fully charged — Flora crushes Tide. Unleash it!',
      centerNote: 'Round 7 — your Charged Attack is ready!',
    }));
    const foeEl = view.stage.querySelector('.foe-active .monster-card');
    floater(view.stage, foeEl, '-134');
    banner(view.stage, 'Super effective! ×1.6', 'super');
    return;
  }

  if (name === 'victory' || name === 'defeat') {
    const state = newMatch(seed);
    const won = name === 'victory';
    state.phase = 'over';
    state.winner = won ? 'you' : 'foe';
    state.turn = won ? 9 : 11;
    state.sides.you.prizesTaken = won ? 3 : 1;
    state.sides.foe.prizesTaken = won ? 1 : 3;
    state.sides.you.candy = won ? 75 : 0;
    renderGame(app, state, uiFor());
    showEnd(overlay, state, () => {});
    if (won) {
      // Frozen confetti for the still: pieces hung mid-fall over the card.
      const colors = ['#ff7a29', '#2f9df6', '#43c465', '#ffd94d', '#ff5f8f', '#b388ff'];
      for (let i = 0; i < 34; i++) {
        const piece = document.createElement('i');
        piece.className = 'confetti-piece';
        piece.style.left = `${(i * 29) % 100}%`;
        piece.style.top = `${(i * 53) % 62}%`;
        piece.style.background = colors[i % colors.length];
        piece.style.transform = `rotate(${(i * 47) % 360}deg)`;
        piece.style.animation = 'none';
        overlay.appendChild(piece);
      }
    }
    return;
  }

  const state = newMatch(seed);
  renderGame(app, state, uiFor());
}
