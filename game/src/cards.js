// cards.js — one job: the catalogue. Every monster, trainer and orb in the
// game is defined here and nowhere else. The world is original: three types
// in a triangle (Ember ▲ beats Flora ◆ beats Tide ● beats Ember ▲), fourteen
// monster species in four evolution lines plus standalones, four trainers.

export const TYPES = {
  EMBER: { key: 'EMBER', name: 'Ember', glyph: '▲', color: '#ff7a29', deep: '#b23c0e', soft: '#ffd9b0' },
  TIDE: { key: 'TIDE', name: 'Tide', glyph: '●', color: '#2f9df6', deep: '#0f5fa8', soft: '#bfe4ff' },
  FLORA: { key: 'FLORA', name: 'Flora', glyph: '◆', color: '#43c465', deep: '#1d7a3d', soft: '#c9f2d2' },
};

// What each type is strong against: Ember scorches Flora, Flora drinks the
// Tide, the Tide douses Ember.
const BEATS = { EMBER: 'FLORA', FLORA: 'TIDE', TIDE: 'EMBER' };

export const SUPER_MULT = 1.6;
export const WEAK_MULT = 0.625;

// The GO-style multiplier of an attack from type `attackType` hitting a
// monster of type `defendType`, with the label the arena announces.
export function effectiveness(attackType, defendType) {
  if (BEATS[attackType] === defendType) return { mult: SUPER_MULT, label: 'super' };
  if (BEATS[defendType] === attackType) return { mult: WEAK_MULT, label: 'weak' };
  return { mult: 1, label: 'even' };
}

// Monster card definitions. cp is the big Combat Power number shown over the
// HP bar; fast builds the charge meter, charged spends a full meter.
// evolvesFrom / evolvesTo link the evolution lines by species id.
export const MONSTERS = {
  cindlet: {
    id: 'cindlet', name: 'Cindlet', type: 'EMBER', stage: 0, evolvesTo: 'blazehorn',
    cp: 318, hp: 72, fast: { name: 'Ember Nip', dmg: 10 }, charged: { name: 'Flame Burst', dmg: 50 },
    blurb: 'A salamander pup whose tail flame flares when it is excited.',
  },
  blazehorn: {
    id: 'blazehorn', name: 'Blazehorn', type: 'EMBER', stage: 1, evolvesFrom: 'cindlet',
    cp: 986, hp: 124, fast: { name: 'Horn Jab', dmg: 15 }, charged: { name: 'Inferno Charge', dmg: 92 },
    blurb: 'Its horns are chimneys. When they smoke, run.',
  },
  embit: {
    id: 'embit', name: 'Embit', type: 'EMBER', stage: 0, evolvesTo: 'pyrodile',
    cp: 292, hp: 66, fast: { name: 'Coal Snap', dmg: 10 }, charged: { name: 'Magma Bite', dmg: 46 },
    blurb: 'A baby croc that naps inside warm coals.',
  },
  pyrodile: {
    id: 'pyrodile', name: 'Pyrodile', type: 'EMBER', stage: 1, evolvesFrom: 'embit',
    cp: 918, hp: 128, fast: { name: 'Tail Sweep', dmg: 14 }, charged: { name: 'Eruption Chomp', dmg: 88 },
    blurb: 'The river steams where this old gator surfaces.',
  },
  ashimp: {
    id: 'ashimp', name: 'Ashimp', type: 'EMBER', stage: 0,
    cp: 574, hp: 86, fast: { name: 'Cinder Slap', dmg: 13 }, charged: { name: 'Ash Cloud Burst', dmg: 64 },
    blurb: 'A soot sprite that giggles inside chimneys.',
  },
  coalkin: {
    id: 'coalkin', name: 'Coalkin', type: 'EMBER', stage: 0,
    cp: 503, hp: 90, fast: { name: 'Pebble Toss', dmg: 12 }, charged: { name: 'Forge Slam', dmg: 58 },
    blurb: 'Born in a blacksmith\u2019s furnace, loyal as a hammer.',
  },
  droplet: {
    id: 'droplet', name: 'Droplet', type: 'TIDE', stage: 0, evolvesTo: 'waveback',
    cp: 307, hp: 76, fast: { name: 'Bubble Tap', dmg: 10 }, charged: { name: 'Aqua Jet', dmg: 50 },
    blurb: 'A turtle so small it swims in a teacup.',
  },
  waveback: {
    id: 'waveback', name: 'Waveback', type: 'TIDE', stage: 1, evolvesFrom: 'droplet',
    cp: 964, hp: 136, fast: { name: 'Shell Slam', dmg: 15 }, charged: { name: 'Tidal Crash', dmg: 86 },
    blurb: 'A whole tide pools on its shell at high moon.',
  },
  pupcurrent: {
    id: 'pupcurrent', name: 'Pupcurrent', type: 'TIDE', stage: 0,
    cp: 541, hp: 92, fast: { name: 'Splash Dash', dmg: 12 }, charged: { name: 'Riptide Rush', dmg: 58 },
    blurb: 'A river pup that races the current and wins.',
  },
  bubblisk: {
    id: 'bubblisk', name: 'Bubblisk', type: 'TIDE', stage: 0,
    cp: 603, hp: 102, fast: { name: 'Foam Lash', dmg: 12 }, charged: { name: 'Bubble Prison', dmg: 62 },
    blurb: 'A serpent that traps minnows in perfect spheres.',
  },
  sproutle: {
    id: 'sproutle', name: 'Sproutle', type: 'FLORA', stage: 0, evolvesTo: 'bloomhart',
    cp: 301, hp: 82, fast: { name: 'Vine Slap', dmg: 10 }, charged: { name: 'Petal Storm', dmg: 46 },
    blurb: 'A fawn whose antlers sprout every spring morning.',
  },
  bloomhart: {
    id: 'bloomhart', name: 'Bloomhart', type: 'FLORA', stage: 1, evolvesFrom: 'sproutle',
    cp: 947, hp: 142, fast: { name: 'Thorn Lash', dmg: 15 }, charged: { name: 'Solar Bloom', dmg: 84, heal: 20 },
    blurb: 'Where it kneels to rest, a meadow wakes up.',
  },
  mosshop: {
    id: 'mosshop', name: 'Mosshop', type: 'FLORA', stage: 0,
    cp: 556, hp: 96, fast: { name: 'Moss Bump', dmg: 12 }, charged: { name: 'Spore Puff', dmg: 56 },
    blurb: 'A frog upholstered in living moss. Very soft.',
  },
  fernix: {
    id: 'fernix', name: 'Fernix', type: 'FLORA', stage: 0,
    cp: 588, hp: 94, fast: { name: 'Fern Flick', dmg: 13 }, charged: { name: 'Canopy Ambush', dmg: 66 },
    blurb: 'A fox that is never where the leaves just moved.',
  },
};

export const TRAINERS = {
  berry: {
    id: 'berry', kind: 'trainer', name: 'Berry Heal', glyph: '✚', heal: 50,
    text: 'Heal 50 HP on one of your monsters.',
  },
  swapbell: {
    id: 'swapbell', kind: 'trainer', name: 'Swap Bell', glyph: '⇄',
    text: 'Ring it: switch the foe\u2019s Active with one of their Benched monsters.',
  },
  candyjar: {
    id: 'candyjar', kind: 'trainer', name: 'Candy Jar', glyph: '★',
    text: 'Gain 25 Star Candy for evolutions.',
  },
  scout: {
    id: 'scout', kind: 'trainer', name: 'Scout Charm', glyph: '✦',
    text: 'Draw 2 cards.',
  },
};

export const ENERGY_CARD = {
  id: 'spark', kind: 'energy', name: 'Spark Orb', glyph: '✷',
  text: 'Attach to a monster: +35 charge toward its Charged Attack.',
};

export const EVOLVE_COST = 25; // Star Candy
export const START_CANDY = 25;
export const KO_CANDY = 25;
export const CHARGE_PER_FAST = 45;
export const CHARGE_PER_ORB = 35;
export const CHARGE_MAX = 100;
export const PRIZES_TO_WIN = 3;
export const BENCH_MAX = 3;

// The two 30-card decks. Both trainers draw from the same world; the rival's
// deck leans Tide/Flora, the player's leans Ember/Tide, so type reads matter.
function deckOf(monsterCounts, trainerCounts, orbs) {
  const cards = [];
  for (const [id, n] of monsterCounts) for (let i = 0; i < n; i++) cards.push({ kind: 'monster', id });
  for (const [id, n] of trainerCounts) for (let i = 0; i < n; i++) cards.push({ kind: 'trainer', id });
  for (let i = 0; i < orbs; i++) cards.push({ kind: 'energy', id: 'spark' });
  return cards;
}

export function playerDeck() {
  return deckOf(
    [['cindlet', 2], ['blazehorn', 1], ['embit', 1], ['pyrodile', 1], ['ashimp', 1], ['coalkin', 1],
     ['droplet', 2], ['waveback', 1], ['pupcurrent', 1], ['bubblisk', 1],
     ['sproutle', 2], ['bloomhart', 1], ['mosshop', 1], ['fernix', 1]],
    [['berry', 2], ['swapbell', 1], ['candyjar', 1], ['scout', 2]],
    7,
  );
}

export function rivalDeck() {
  return deckOf(
    [['droplet', 2], ['waveback', 1], ['pupcurrent', 1], ['bubblisk', 1],
     ['sproutle', 2], ['bloomhart', 1], ['mosshop', 1], ['fernix', 1],
     ['cindlet', 2], ['blazehorn', 1], ['embit', 1], ['pyrodile', 1], ['ashimp', 1], ['coalkin', 1]],
    [['berry', 2], ['swapbell', 1], ['candyjar', 1], ['scout', 2]],
    7,
  );
}
