// render.js — one job: turn match state into the arena on screen. The
// stadium stage, both Actives large in the middle with CP over HP over the
// charge meter, benches down the sides, prize stacks as the score, the
// player's hand fanned along the bottom, and the title / victory / defeat
// overlays. It never changes state; main.js wires the clicks.

import { MONSTERS, TRAINERS, TYPES, CHARGE_MAX } from './cards.js';
import { defOf, hpLeft } from './engine.js';
import { artFor, candySvg, orbSvg, prizeBackSvg } from './art.js';

export function h(tag, cls, html) {
  const el = document.createElement(tag);
  if (cls) el.className = cls;
  if (html !== undefined) el.innerHTML = html;
  return el;
}

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

function typeChip(typeKey) {
  const t = TYPES[typeKey];
  return `<span class="type-chip" style="--tc:${t.color};--td:${t.deep}">${t.glyph} ${t.name}</span>`;
}

function hpBar(inst) {
  const def = defOf(inst);
  const left = hpLeft(inst);
  const pct = Math.max(0, (left / def.hp) * 100);
  const cls = pct <= 25 ? 'hp-low' : pct <= 55 ? 'hp-mid' : 'hp-full';
  return `<div class="hp-row"><span class="hp-label">HP</span>
    <div class="hp-bar ${cls}"><i style="width:${pct}%"></i></div>
    <span class="hp-num">${left}/${def.hp}</span></div>`;
}

function chargeBar(inst) {
  const pct = Math.min(100, (inst.meter / CHARGE_MAX) * 100);
  const ready = inst.meter >= CHARGE_MAX;
  return `<div class="charge-row"><span class="charge-label">⚡</span>
    <div class="charge-bar ${ready ? 'charge-ready' : ''}"><i style="width:${pct}%"></i></div>
    <span class="charge-num">${ready ? 'CHARGED!' : `${inst.meter}%`}</span></div>`;
}

function attackRows(inst, big) {
  const def = defOf(inst);
  const t = TYPES[def.type];
  return `<div class="attacks">
    <div class="attack-row"><span class="atk-kind" style="--tc:${t.color}">FAST</span>
      <span class="atk-name">${esc(def.fast.name)}</span><b>${def.fast.dmg}</b></div>
    <div class="attack-row ${inst.meter >= CHARGE_MAX ? 'atk-live' : ''}"><span class="atk-kind charged" style="--tc:${t.color}">CHARGED</span>
      <span class="atk-name">${esc(def.charged.name)}${def.charged.heal ? ` (+${def.charged.heal} HP)` : ''}</span><b>${def.charged.dmg}</b></div>
  </div>`;
}

function orbRow(inst) {
  if (!inst.orbs) return '';
  return `<div class="orb-row">${orbSvg.repeat(inst.orbs)}<span>${inst.orbs} orb${inst.orbs > 1 ? 's' : ''}</span></div>`;
}

// A monster in play. size: 'lg' for the Actives on stage, 'sm' for benches.
export function monsterCardEl(inst, size, sideKey) {
  const def = defOf(inst);
  const t = TYPES[def.type];
  const el = h('article', `card monster-card size-${size} type-${def.type.toLowerCase()}`);
  el.dataset.uid = inst.uid;
  el.dataset.side = sideKey;
  el.style.setProperty('--tc', t.color);
  el.style.setProperty('--td', t.deep);
  el.style.setProperty('--ts', t.soft);
  const stageTag = def.stage === 1 ? '<span class="stage-tag">EVOLVED</span>' : '';
  el.innerHTML = `
    <header class="card-head">
      <span class="card-name">${esc(def.name)}</span>${stageTag}
      <span class="cp-badge">CP <b>${def.cp}</b></span>
    </header>
    <div class="card-art">${artFor(def.id)}</div>
    ${hpBar(inst)}
    ${chargeBar(inst)}
    ${size === 'lg' ? attackRows(inst, true) : ''}
    <footer class="card-foot">${typeChip(def.type)}${orbRow(inst)}</footer>`;
  return el;
}

// A card in the player's hand: monster, trainer or Spark Orb.
export function handCardEl(card, index) {
  const el = h('article', 'card hand-card');
  el.dataset.handIndex = index;
  if (card.kind === 'monster') {
    const def = MONSTERS[card.id];
    const t = TYPES[def.type];
    el.classList.add(`type-${def.type.toLowerCase()}`);
    el.style.setProperty('--tc', t.color);
    el.style.setProperty('--td', t.deep);
    el.style.setProperty('--ts', t.soft);
    el.innerHTML = `
      <header class="card-head"><span class="card-name">${esc(def.name)}</span>
        <span class="cp-badge">CP <b>${def.cp}</b></span></header>
      <div class="card-art">${artFor(def.id)}</div>
      <div class="hand-stats"><span>HP <b>${def.hp}</b></span>${typeChip(def.type)}</div>
      <div class="hand-attacks"><span>⚡ ${esc(def.fast.name)} <b>${def.fast.dmg}</b></span>
      <span>★ ${esc(def.charged.name)} <b>${def.charged.dmg}</b></span></div>
      ${def.stage === 1 ? `<div class="hand-note">Evolves ${esc(MONSTERS[def.evolvesFrom].name)} · 25 candy</div>`
        : def.evolvesTo ? `<div class="hand-note">Can evolve into ${esc(MONSTERS[def.evolvesTo].name)}</div>` : ''}`;
  } else if (card.kind === 'trainer') {
    const def = TRAINERS[card.id];
    el.classList.add('trainer-card');
    el.innerHTML = `
      <header class="card-head"><span class="card-name">${esc(def.name)}</span>
        <span class="trainer-tag">TRAINER</span></header>
      <div class="trainer-art"><span class="trainer-glyph">${def.glyph}</span></div>
      <p class="trainer-text">${esc(def.text)}</p>`;
  } else {
    el.classList.add('energy-card');
    el.innerHTML = `
      <header class="card-head"><span class="card-name">Spark Orb</span>
        <span class="trainer-tag">ENERGY</span></header>
      <div class="trainer-art orb-art">${orbSvg}</div>
      <p class="trainer-text">Attach to a monster: <b>+35 charge</b> toward its Charged Attack. One per turn.</p>`;
  }
  return el;
}

function prizeStackEl(side, label) {
  const wrap = h('div', 'prize-stack');
  const cards = side.prizes.map(() => `<span class="prize-mini">${prizeBackSvg}</span>`).join('');
  wrap.innerHTML = `<div class="prize-cards">${cards || '<span class="prize-none">all taken!</span>'}</div>
    <span class="prize-label">${label}: ${side.prizesTaken}/3 taken</span>`;
  return wrap;
}

function benchEl(state, sideKey) {
  const side = state.sides[sideKey];
  const wrap = h('div', `bench bench-${sideKey}`);
  wrap.appendChild(h('div', 'bench-label', sideKey === 'you' ? 'YOUR BENCH' : 'VERA\u2019S BENCH'));
  const slots = h('div', 'bench-slots');
  for (const inst of side.bench) slots.appendChild(monsterCardEl(inst, 'sm', sideKey));
  for (let i = side.bench.length; i < 3; i++) slots.appendChild(h('div', 'bench-empty', 'empty'));
  wrap.appendChild(slots);
  return wrap;
}

function plateEl(state, sideKey) {
  const side = state.sides[sideKey];
  const stars = [0, 1, 2].map((i) => `<span class="prize-star ${i < side.prizesTaken ? 'won' : ''}">★</span>`).join('');
  const el = h('div', `plate plate-${sideKey}`);
  el.innerHTML = `
    <span class="plate-name">${sideKey === 'you' ? 'YOU' : 'COACH VERA'}</span>
    <span class="plate-prizes">${stars}<em>prizes</em></span>
    <span class="plate-candy">${candySvg}<b>${side.candy}</b></span>
    <span class="plate-counts">hand ${side.hand.length} · deck ${side.deck.length}</span>`;
  return el;
}

// ---- whole-screen renders -------------------------------------------------

export function renderGame(root, state, ui) {
  root.innerHTML = '';
  const top = h('header', 'topbar');
  top.appendChild(plateEl(state, 'foe'));
  const turnPill = h('div', `turn-pill ${state.current === 'you' ? 'yours' : 'theirs'}`,
    state.phase === 'over' ? 'DUEL OVER'
      : state.pendingPromo ? 'KNOCKOUT! choose a replacement'
      : state.current === 'you' ? 'YOUR TURN' : 'VERA\u2019S TURN');
  top.appendChild(turnPill);
  top.appendChild(plateEl(state, 'you'));
  root.appendChild(top);

  const stage = h('main', 'stage');
  stage.id = 'stage';
  stage.appendChild(h('div', 'crowd'));
  stage.appendChild(h('div', 'flood flood-l'));
  stage.appendChild(h('div', 'flood flood-r'));

  const foeRow = h('section', 'lane lane-foe');
  foeRow.appendChild(benchEl(state, 'foe'));
  const foeActive = h('div', 'active-slot foe-active');
  if (state.sides.foe.active) foeActive.appendChild(monsterCardEl(state.sides.foe.active, 'lg', 'foe'));
  else foeActive.appendChild(h('div', 'ko-ghost', 'KNOCKED<br>OUT!'));
  foeRow.appendChild(foeActive);
  foeRow.appendChild(prizeStackEl(state.sides.foe, 'Vera\u2019s prizes'));
  stage.appendChild(foeRow);

  const mid = h('div', 'mid-strip');
  mid.innerHTML = `<span class="vs-medal">VS</span>
    <span class="mid-note">${esc(ui.centerNote || 'First to 3 prizes wins the duel')}</span>`;
  stage.appendChild(mid);

  const youRow = h('section', 'lane lane-you');
  youRow.appendChild(prizeStackEl(state.sides.you, 'Your prizes'));
  const youActive = h('div', 'active-slot you-active');
  if (state.sides.you.active) youActive.appendChild(monsterCardEl(state.sides.you.active, 'lg', 'you'));
  else youActive.appendChild(h('div', 'ko-ghost', 'KNOCKED<br>OUT!'));
  youRow.appendChild(youActive);
  youRow.appendChild(benchEl(state, 'you'));
  stage.appendChild(youRow);
  root.appendChild(stage);

  const dock = h('footer', 'dock');
  const handWrap = h('div', 'hand-wrap');
  handWrap.appendChild(h('div', 'hand-label', 'YOUR HAND — click a card, then a target'));
  const hand = h('div', 'hand');
  state.sides.you.hand.forEach((card, i) => {
    const el = handCardEl(card, i);
    if (ui.selectedHand === i) el.classList.add('selected');
    hand.appendChild(el);
  });
  handWrap.appendChild(hand);
  dock.appendChild(handWrap);

  const actions = h('div', 'actions');
  const active = state.sides.you.active;
  const activeDef = active ? defOf(active) : null;
  const myTurn = state.current === 'you' && state.phase === 'play' && !state.pendingPromo;
  actions.innerHTML = `
    <div class="coach-line">${esc(ui.message || '')}</div>
    <button class="btn btn-fast" data-action="fast" ${myTurn && active ? '' : 'disabled'}>
      ⚡ FAST — ${activeDef ? `${esc(activeDef.fast.name)} · ${activeDef.fast.dmg}` : '—'}</button>
    <button class="btn btn-charged ${active && active.meter >= CHARGE_MAX ? 'ready' : ''}" data-action="charged"
      ${myTurn && active && active.meter >= CHARGE_MAX ? '' : 'disabled'}>
      ★ CHARGED — ${activeDef ? `${esc(activeDef.charged.name)} · ${activeDef.charged.dmg}` : '—'}${active ? ` (${active.meter}%)` : ''}</button>
    <div class="btn-row">
      <button class="btn btn-small" data-action="retreat" ${myTurn && active && state.sides.you.bench.length && !state.sides.you.retreated ? '' : 'disabled'}>⇄ Retreat</button>
      <button class="btn btn-small btn-end" data-action="end" ${myTurn ? '' : 'disabled'}>End turn ▸</button>
    </div>
    <div class="hint-line">${esc(ui.hint || '')}</div>`;
  dock.appendChild(actions);
  root.appendChild(dock);

  markTargets(root, state, ui);
  return { stage, dock };
}

// Highlight the elements the current selection can act on.
function markTargets(root, state, ui) {
  const mark = (sel) => root.querySelectorAll(sel).forEach((el) => el.classList.add('targetable'));
  if (ui.mode === 'attach' || ui.mode === 'berry') mark('.lane-you .monster-card, .bench-you .monster-card');
  if (ui.mode === 'evolve') (ui.evolveTargets || []).forEach((uid) => mark(`.monster-card[data-uid="${uid}"]`));
  if (ui.mode === 'swapbell') mark('.bench-foe .monster-card');
  if (ui.mode === 'retreat') mark('.bench-you .monster-card');
  if (ui.mode === 'promote') mark('.bench-you .monster-card');
}

export function showTitle(overlay, onStart) {
  overlay.classList.add('shown');
  overlay.innerHTML = `
    <div class="title-card">
      <div class="title-kicker">MONSTER CARD ARENA</div>
      <h1 class="title-logo">CRITTER<span>CLASH</span></h1>
      <p class="title-sub">Fast attacks build the charge. Charged attacks end arguments.<br>
      Knock out Vera\u2019s critters, take <b>3 prizes</b>, and evolve your way to the cup.</p>
      <div class="title-types">
        <span class="type-chip big" style="--tc:#ff7a29;--td:#b23c0e">▲ EMBER beats ◆ FLORA</span>
        <span class="type-chip big" style="--tc:#43c465;--td:#1d7a3d">◆ FLORA beats ● TIDE</span>
        <span class="type-chip big" style="--tc:#2f9df6;--td:#0f5fa8">● TIDE beats ▲ EMBER</span>
      </div>
      <div class="title-heros">
        <div class="hero-art">${artFor('blazehorn')}</div>
        <div class="hero-art hero-mid">${artFor('waveback')}</div>
        <div class="hero-art">${artFor('bloomhart')}</div>
      </div>
      <button class="btn btn-start" data-action="start">▶ ENTER THE ARENA</button>
      <p class="title-foot">Super effective hits deal ×1.6 · resisted hits deal ×0.625 · evolutions cost 25 Star Candy</p>
    </div>`;
  overlay.querySelector('[data-action="start"]').addEventListener('click', onStart);
}

export function showEnd(overlay, state, onRestart) {
  const won = state.winner === 'you';
  const you = state.sides.you, foe = state.sides.foe;
  overlay.classList.add('shown');
  overlay.innerHTML = `
    <div class="end-card ${won ? 'end-win' : 'end-loss'}">
      <div class="end-kicker">${won ? '🏆 DUEL WON' : 'DUEL LOST'}</div>
      <h2 class="end-title">${won ? 'CHAMPION OF THE ARENA!' : 'VERA TAKES THE CUP'}</h2>
      <p class="end-sub">${won
        ? 'Three prizes claimed — your critters rule the stadium tonight.'
        : 'Your last critter falls. Vera\u2019s team lifts the cup… this time.'}</p>
      <div class="end-stats">
        <div><b>${you.prizesTaken}</b><span>your prizes</span></div>
        <div><b>${foe.prizesTaken}</b><span>Vera\u2019s prizes</span></div>
        <div><b>${state.turn}</b><span>rounds</span></div>
        <div><b>${you.candy}</b><span>candy left</span></div>
      </div>
      <div class="end-hero">${artFor(won ? 'blazehorn' : 'waveback')}</div>
      <button class="btn btn-start" data-action="restart">↻ REMATCH</button>
    </div>`;
  overlay.querySelector('[data-action="restart"]').addEventListener('click', onRestart);
}
