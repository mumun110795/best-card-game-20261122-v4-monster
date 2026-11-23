// anim.js — one job: the juice. Lunges, shakes, floating damage numbers,
// arena banners, evolution flashes and victory confetti, all with the Web
// Animations API so nothing here touches game state. When the page is in
// screenshot mode (body.still) every effect resolves instantly.

export function wait(ms) {
  if (document.body.classList.contains('still')) return Promise.resolve();
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function still() { return document.body.classList.contains('still'); }

export async function lunge(el, towardFoe) {
  if (!el || still()) return;
  const dir = towardFoe ? -1 : 1;
  await el.animate([
    { transform: 'translate(0,0) scale(1)' },
    { transform: `translate(${10 * dir}px, ${14 * dir}px) scale(1.04)`, offset: 0.35 },
    { transform: `translate(${-26 * dir}px, ${-30 * dir}px) scale(1.07)`, offset: 0.55 },
    { transform: 'translate(0,0) scale(1)' },
  ], { duration: 420, easing: 'ease-in-out' }).finished.catch(() => {});
}

export async function shake(el, big = false) {
  if (!el || still()) return;
  const a = big ? 12 : 6;
  await el.animate([
    { transform: 'translate(0,0)' },
    { transform: `translate(${-a}px, ${a * 0.4}px)` },
    { transform: `translate(${a}px, ${-a * 0.3}px)` },
    { transform: `translate(${-a * 0.7}px, 0)` },
    { transform: `translate(${a * 0.5}px, ${a * 0.2}px)` },
    { transform: 'translate(0,0)' },
  ], { duration: big ? 460 : 300, easing: 'ease-out' }).finished.catch(() => {});
}

export async function flash(el) {
  if (!el || still()) return;
  await el.animate([
    { filter: 'brightness(1)' },
    { filter: 'brightness(2.6) saturate(0.4)', offset: 0.4 },
    { filter: 'brightness(1.6)', offset: 0.7 },
    { filter: 'brightness(1)' },
  ], { duration: 650, easing: 'ease-out' }).finished.catch(() => {});
}

// A floating label over an element inside the stage (damage numbers,
// "+35 CHARGE", "HEAL +50"). Returns a promise for when it has faded.
export function floater(stageEl, anchorEl, text, cls = '') {
  if (!stageEl || !anchorEl) return Promise.resolve();
  const chip = document.createElement('div');
  chip.className = `floater ${cls}`;
  chip.textContent = text;
  const s = stageEl.getBoundingClientRect();
  const r = anchorEl.getBoundingClientRect();
  chip.style.left = `${r.left - s.left + r.width / 2}px`;
  chip.style.top = `${r.top - s.top + r.height * 0.3}px`;
  stageEl.appendChild(chip);
  if (still()) return Promise.resolve();
  const anim = chip.animate([
    { transform: 'translate(-50%, 0) scale(0.7)', opacity: 0 },
    { transform: 'translate(-50%, -18px) scale(1.15)', opacity: 1, offset: 0.25 },
    { transform: 'translate(-50%, -52px) scale(1)', opacity: 1, offset: 0.7 },
    { transform: 'translate(-50%, -72px) scale(0.96)', opacity: 0 },
  ], { duration: 1150, easing: 'ease-out' });
  return anim.finished.catch(() => {}).then(() => chip.remove());
}

// The big centre-stage announcement: "Super effective! ×1.6", "KNOCKOUT!",
// "CHARGED ATTACK!". In still mode it stays on stage for the screenshot.
export function banner(stageEl, text, cls = '') {
  if (!stageEl) return Promise.resolve();
  const el = document.createElement('div');
  el.className = `arena-banner ${cls}`;
  el.textContent = text;
  stageEl.appendChild(el);
  if (still()) return Promise.resolve();
  const anim = el.animate([
    { transform: 'translate(-50%,-50%) scale(0.5) rotate(-4deg)', opacity: 0 },
    { transform: 'translate(-50%,-50%) scale(1.12) rotate(-2deg)', opacity: 1, offset: 0.22 },
    { transform: 'translate(-50%,-50%) scale(1) rotate(-2deg)', opacity: 1, offset: 0.78 },
    { transform: 'translate(-50%,-50%) scale(1.04) rotate(-2deg)', opacity: 0 },
  ], { duration: 1250, easing: 'ease-out' });
  return anim.finished.catch(() => {}).then(() => el.remove());
}

export function confetti(container, count = 46) {
  if (!container || still()) return;
  const colors = ['#ff7a29', '#2f9df6', '#43c465', '#ffd94d', '#ff5f8f', '#b388ff'];
  for (let i = 0; i < count; i++) {
    const piece = document.createElement('i');
    piece.className = 'confetti-piece';
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.background = colors[i % colors.length];
    piece.style.animationDelay = `${Math.random() * 0.7}s`;
    piece.style.animationDuration = `${2.2 + Math.random() * 1.6}s`;
    container.appendChild(piece);
    setTimeout(() => piece.remove(), 4600);
  }
}
