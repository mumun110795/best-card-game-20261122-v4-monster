// Critter Clash — hand-in program.
//
// What this does, in order:
//   1. works out where the entry goes: MAKEFUN_OUTPUT_DIR when set,
//      otherwise /output (the grader's mount — that folder itself must
//      never be removed, so only its contents are cleared);
//   2. copies this repository's game/ and screenshots/ folders across;
//   3. asks the vendored make.fun library to summarise the copied tree
//      into dossier.json, with the scorer's own limits passed through so
//      an oversized entry fails here instead of at the gate.
//
// Node's standard library only; it runs twice and writes the same bytes.

import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const repoDir = dirname(fileURLToPath(import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// Empty a folder without touching the folder itself: on the grader the
// output path is a mounted volume and deleting the mount point fails.
function clearFolder(dir: string): void {
  mkdirSync(dir, { recursive: true });
  for (const name of readdirSync(dir)) {
    rmSync(join(dir, name), { recursive: true, force: true });
  }
}

function copyFolder(from: string, to: string): void {
  if (!existsSync(from)) return;
  mkdirSync(to, { recursive: true });
  cpSync(from, to, { recursive: true });
}

clearFolder(outDir);
copyFolder(join(repoDir, 'game'), join(outDir, 'game'));
copyFolder(join(repoDir, 'screenshots'), join(outDir, 'screenshots'));

const dossier = buildDossier(outDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
});
writeFileSync(join(outDir, 'dossier.json'), dossier);
