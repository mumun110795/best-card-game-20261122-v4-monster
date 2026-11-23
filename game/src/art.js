// art.js — one job: draw the monsters. Every creature is an original
// procedural SVG built from shapes — no image files, nothing borrowed.
// Each scene sits in a 200x150 frame tinted by the monster's type.

const SCENE = {
  EMBER: { sky: '#ffd9a3', horizon: '#ff9e57', ground: '#c65a1e', sun: '#fff3c4' },
  TIDE: { sky: '#bfe6ff', horizon: '#6fc3ff', ground: '#1d6fb8', sun: '#ffffff' },
  FLORA: { sky: '#dcf7d4', horizon: '#93dd8a', ground: '#2e8b47', sun: '#fffbe0' },
};

function scene(type, extra) {
  const s = SCENE[type];
  return `<svg viewBox="0 0 200 150" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" role="img">
  <defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="${s.sky}"/><stop offset="1" stop-color="${s.horizon}"/>
  </linearGradient></defs>
  <rect width="200" height="150" fill="url(#sky)"/>
  <circle cx="168" cy="26" r="15" fill="${s.sun}" opacity="0.9"/>
  <ellipse cx="100" cy="158" rx="130" ry="42" fill="${s.ground}"/>
  ${extra}
</svg>`;
}

const eye = (x, y, r = 3.2) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#20222b"/><circle cx="${x + 1}" cy="${y - 1}" r="${r * 0.35}" fill="#fff"/>`;

const DRAW = {
  cindlet: () => scene('EMBER', `
    <path d="M30 118 Q60 96 96 108 L150 122 Q172 126 168 112 Q165 101 148 104 L104 92 Q62 84 34 104 Z" fill="#ff8b3d"/>
    <path d="M34 106 Q18 96 26 82 Q40 88 40 100 Z" fill="#ffb066"/>
    <path d="M24 84 Q16 66 30 58 Q34 72 30 84 Q44 68 46 80 Q48 96 34 104 Q24 96 24 84Z" fill="#ffcf3f"/>
    <path d="M24 84 Q20 70 30 62 Q33 74 29 84 Q38 72 40 80 Q41 92 33 98 Q26 94 24 84Z" fill="#ff7a29"/>
    <circle cx="146" cy="104" r="17" fill="#ff8b3d"/>
    <path d="M138 90 Q146 78 152 90 Q146 94 138 90Z" fill="#e05e12"/>
    ${eye(152, 100)}<circle cx="158" cy="110" r="3" fill="#e05e12" opacity="0.6"/>
    <path d="M96 122 L92 132 M120 124 L118 134" stroke="#c65a1e" stroke-width="5" stroke-linecap="round"/>
    <circle cx="80" cy="104" r="4" fill="#ffc46b"/><circle cx="104" cy="98" r="3" fill="#ffc46b"/>`),
  blazehorn: () => scene('EMBER', `
    <ellipse cx="98" cy="104" rx="52" ry="26" fill="#e05e12"/>
    <path d="M52 92 Q30 84 34 62 Q52 66 58 84Z" fill="#f4f1e6"/>
    <path d="M66 84 Q56 62 72 52 Q80 68 74 84Z" fill="#f4f1e6"/>
    <circle cx="52" cy="96" r="20" fill="#ff7a29"/>
    <ellipse cx="40" cy="102" rx="10" ry="7" fill="#ffb066"/>
    <circle cx="36" cy="100" r="2" fill="#8a3c0d"/><circle cx="45" cy="100" r="2" fill="#8a3c0d"/>
    ${eye(56, 90)}
    <path d="M70 128 L66 140 M124 128 L122 140 M88 130 L86 140" stroke="#a83f08" stroke-width="7" stroke-linecap="round"/>
    <path d="M146 96 Q168 88 164 72" stroke="#e05e12" stroke-width="8" fill="none" stroke-linecap="round"/>
    <path d="M96 66 Q92 50 104 44 Q100 58 108 66 Q118 52 120 64 Q121 78 104 80 Q94 76 96 66Z" fill="#8d99ae"/>
    <path d="M126 70 Q124 58 134 54 Q132 64 138 70 Q146 60 147 68 Q147 78 134 80 Q127 78 126 70Z" fill="#8d99ae" opacity="0.8"/>
    <circle cx="92" cy="100" r="5" fill="#ffb066"/><circle cx="116" cy="94" r="4" fill="#ffb066"/>`),
  embit: () => scene('EMBER', `
    <ellipse cx="60" cy="128" rx="34" ry="9" fill="#7a3c10"/>
    <circle cx="48" cy="122" r="8" fill="#3a3f4a"/><circle cx="70" cy="124" r="6" fill="#23262e"/><circle cx="58" cy="118" r="5" fill="#ff7a29"/>
    <path d="M66 112 Q110 96 148 108 L176 118 Q184 122 176 128 L120 128 Q84 128 66 120Z" fill="#4f9e4d"/>
    <path d="M148 108 L182 112 Q190 114 184 122 L150 122Z" fill="#67b564"/>
    <path d="M156 114 L160 120 L166 114 L170 120 L176 115" stroke="#fff" stroke-width="2.4" fill="none"/>
    ${eye(140, 106, 3.6)}
    <path d="M92 104 L98 92 L106 102 M112 100 L118 88 L126 98" fill="#2e7d32"/>
    <path d="M64 116 Q44 108 50 94 Q62 100 66 110Z" fill="#67b564"/>
    <path d="M52 96 Q46 82 58 76 Q60 88 58 96 Q66 84 69 92 Q70 102 60 104 Q53 102 52 96Z" fill="#ff7a29"/>`),
  pyrodile: () => scene('EMBER', `
    <path d="M20 118 Q70 92 128 104 L186 118 Q196 122 188 130 L60 132 Q28 130 20 118Z" fill="#3d8b40"/>
    <path d="M120 102 L188 108 Q198 110 192 120 L128 122Z" fill="#57ab5a"/>
    <path d="M132 112 L138 120 L144 112 L150 120 L156 112 L162 120 L170 113" stroke="#fff" stroke-width="3" fill="none"/>
    <path d="M126 122 L134 128 L142 121 L150 128 L158 121" stroke="#fff" stroke-width="2.4" fill="none" opacity="0.8"/>
    ${eye(112, 96, 4.4)}
    <path d="M84 98 L92 82 L102 96 M106 94 L114 78 L124 92" fill="#256b29"/>
    <path d="M96 74 Q92 52 108 44 Q104 60 114 70 Q126 54 129 68 Q131 86 110 88 Q97 85 96 74Z" fill="#8d99ae"/>
    <path d="M30 112 Q14 118 22 130 Q36 128 40 118Z" fill="#57ab5a"/>
    <circle cx="70" cy="110" r="5" fill="#7cc47f"/><circle cx="94" cy="106" r="4" fill="#7cc47f"/>`),
  ashimp: () => scene('EMBER', `
    <ellipse cx="100" cy="102" rx="38" ry="34" fill="#3a3f4a"/>
    <path d="M78 74 Q72 52 90 46 Q88 60 96 68 Q100 48 112 44 Q112 60 118 68 Q128 56 130 70 Q131 84 116 88 L84 88 Q74 84 78 74Z" fill="#ff7a29"/>
    <path d="M88 66 Q86 54 94 50 Q94 60 98 64 Q102 52 108 50 Q108 62 112 66 Q106 72 96 70 Q89 70 88 66Z" fill="#ffcf3f"/>
    ${eye(88, 100, 5)}${eye(112, 100, 5)}
    <path d="M92 116 Q100 122 108 116" stroke="#ffd9b0" stroke-width="3" fill="none" stroke-linecap="round"/>
    <path d="M64 108 Q48 104 50 90 M136 108 Q152 104 150 90" stroke="#3a3f4a" stroke-width="8" fill="none" stroke-linecap="round"/>
    <path d="M84 134 L82 142 M116 134 L118 142" stroke="#2b2e36" stroke-width="7" stroke-linecap="round"/>
    <circle cx="80" cy="112" r="4" fill="#ff9e57" opacity="0.7"/><circle cx="122" cy="114" r="3" fill="#ff9e57" opacity="0.7"/>`),
  coalkin: () => scene('EMBER', `
    <path d="M62 138 L66 84 Q68 66 100 64 Q132 66 134 84 L138 138Z" fill="#4a4038"/>
    <path d="M84 84 L96 100 L86 116 M112 78 L104 96 L118 112" stroke="#ff7a29" stroke-width="3.4" fill="none"/>
    <circle cx="86" cy="94" r="4" fill="#ffcf3f"/><circle cx="112" cy="106" r="3.4" fill="#ffcf3f"/>
    ${eye(90, 76, 3.6)}${eye(110, 76, 3.6)}
    <path d="M64 96 Q46 100 50 116 L62 118 M136 96 Q154 100 150 116 L138 118" stroke="#4a4038" stroke-width="10" fill="none" stroke-linecap="round"/>
    <path d="M92 58 Q96 44 106 46 Q102 54 108 58Z" fill="#8d99ae"/>
    <ellipse cx="100" cy="140" rx="44" ry="5" fill="#33291f"/>`),
  droplet: () => scene('TIDE', `
    <path d="M52 116 Q56 88 100 86 Q144 88 148 116 Q148 128 100 128 Q52 128 52 116Z" fill="#2f9df6"/>
    <path d="M64 104 Q100 92 136 104" stroke="#bfe4ff" stroke-width="5" fill="none" opacity="0.8"/>
    <path d="M100 62 Q114 78 114 88 Q114 98 100 98 Q86 98 86 88 Q86 78 100 62Z" fill="#6fc3ff"/>
    <circle cx="160" cy="106" r="14" fill="#57b8f7"/>
    ${eye(164, 102)}
    <path d="M168 112 Q176 114 174 120" stroke="#0f5fa8" stroke-width="3" fill="none"/>
    <path d="M56 122 Q40 124 42 132 M144 122 Q160 124 158 132" stroke="#0f5fa8" stroke-width="6" fill="none" stroke-linecap="round"/>
    <circle cx="82" cy="112" r="3.4" fill="#bfe4ff"/><circle cx="112" cy="114" r="2.8" fill="#bfe4ff"/>`),
  waveback: () => scene('TIDE', `
    <path d="M36 118 Q42 76 102 72 Q162 76 166 118 Q166 132 101 132 Q36 132 36 118Z" fill="#1d7fc4"/>
    <path d="M58 96 Q80 78 104 92 Q124 76 146 94" stroke="#bfe4ff" stroke-width="6" fill="none" opacity="0.85"/>
    <path d="M66 112 Q88 98 106 108 Q126 96 144 110" stroke="#6fc3ff" stroke-width="5" fill="none" opacity="0.7"/>
    <path d="M84 70 Q88 48 108 44 Q102 58 112 66 Q104 74 92 74 Q84 74 84 70Z" fill="#eaf7ff"/>
    <path d="M110 68 Q116 52 132 52 Q124 62 130 70 Q120 76 112 74Z" fill="#eaf7ff" opacity="0.8"/>
    <circle cx="172" cy="102" r="16" fill="#57b8f7"/>
    ${eye(177, 98, 3.8)}
    <path d="M44 124 Q26 128 30 136 M158 124 Q176 128 172 136" stroke="#0f5fa8" stroke-width="7" fill="none" stroke-linecap="round"/>`),
  pupcurrent: () => scene('TIDE', `
    <ellipse cx="98" cy="108" rx="42" ry="24" fill="#57b8f7"/>
    <circle cx="138" cy="96" r="19" fill="#57b8f7"/>
    <ellipse cx="152" cy="100" rx="9" ry="6" fill="#bfe4ff"/>
    <circle cx="152" cy="97" r="2" fill="#0f5fa8"/>
    ${eye(140, 90, 3.8)}
    <path d="M118 82 Q112 62 128 56 Q136 72 130 84Z" fill="#2f9df6"/>
    <path d="M84 84 Q74 64 88 56 Q96 72 92 86Z" fill="#2f9df6"/>
    <path d="M58 102 Q36 96 40 80 Q58 84 62 96Z" fill="#2f9df6"/>
    <path d="M76 128 L72 138 M116 128 L114 138" stroke="#0f5fa8" stroke-width="6" stroke-linecap="round"/>
    <path d="M30 138 Q50 130 70 138 Q90 146 110 138 Q130 130 150 138 Q170 146 186 138" stroke="#eaf7ff" stroke-width="4" fill="none" opacity="0.9"/>`),
  bubblisk: () => scene('TIDE', `
    <path d="M36 126 Q60 104 92 116 Q120 126 138 108" stroke="#2f9df6" stroke-width="17" fill="none" stroke-linecap="round"/>
    <path d="M138 108 Q158 88 146 66" stroke="#2f9df6" stroke-width="15" fill="none" stroke-linecap="round"/>
    <circle cx="146" cy="60" r="14" fill="#57b8f7"/>
    <path d="M156 54 L170 48 L158 64Z" fill="#57b8f7"/>
    ${eye(142, 56, 3.4)}
    <path d="M150 66 Q156 70 152 74" stroke="#0f5fa8" stroke-width="2.4" fill="none"/>
    <circle cx="70" cy="66" r="11" fill="#eaf7ff" opacity="0.55"/><circle cx="70" cy="62" r="3.4" fill="#fff" opacity="0.9"/>
    <circle cx="104" cy="48" r="8" fill="#eaf7ff" opacity="0.5"/><circle cx="102" cy="45" r="2.4" fill="#fff" opacity="0.9"/>
    <circle cx="44" cy="88" r="6.6" fill="#eaf7ff" opacity="0.5"/>
    <path d="M52 116 Q58 110 66 114 M96 122 Q102 116 110 120" stroke="#bfe4ff" stroke-width="3" fill="none"/>`),
  sproutle: () => scene('FLORA', `
    <ellipse cx="100" cy="110" rx="40" ry="23" fill="#c98d54"/>
    <circle cx="140" cy="94" r="17" fill="#d69c5f"/>
    <ellipse cx="152" cy="98" rx="8" ry="5.6" fill="#eec493"/>
    <circle cx="153" cy="96" r="1.8" fill="#6b4423"/>
    ${eye(138, 88, 3.6)}
    <path d="M128 80 Q122 62 108 60 M146 78 Q148 58 160 52" stroke="#8a5a2b" stroke-width="4.4" fill="none" stroke-linecap="round"/>
    <path d="M108 60 Q96 48 104 40 Q114 46 108 60Z" fill="#43c465"/>
    <path d="M160 52 Q172 44 176 54 Q166 62 160 52Z" fill="#43c465"/>
    <path d="M76 128 L73 139 M122 128 L121 139 M94 130 L93 139" stroke="#8a5a2b" stroke-width="6" stroke-linecap="round"/>
    <circle cx="88" cy="106" r="4" fill="#eec493"/><circle cx="108" cy="114" r="3.2" fill="#eec493"/>
    <path d="M62 104 Q48 100 52 88 Q64 92 66 100Z" fill="#d69c5f"/>`),
  bloomhart: () => scene('FLORA', `
    <ellipse cx="98" cy="106" rx="44" ry="25" fill="#d69c5f"/>
    <circle cx="146" cy="88" r="18" fill="#e0aa68"/>
    <ellipse cx="159" cy="93" rx="8.6" ry="6" fill="#f2d3a0"/>
    <circle cx="160" cy="91" r="1.9" fill="#6b4423"/>
    ${eye(143, 82, 3.8)}
    <path d="M132 74 Q124 44 102 36 M152 70 Q158 38 178 32" stroke="#8a5a2b" stroke-width="5" fill="none" stroke-linecap="round"/>
    <circle cx="102" cy="34" r="8" fill="#ff8fb5"/><circle cx="92" cy="42" r="6" fill="#ffb3cd"/><circle cx="112" cy="42" r="6" fill="#ffb3cd"/>
    <circle cx="178" cy="30" r="7.4" fill="#ff8fb5"/><circle cx="168" cy="38" r="5.4" fill="#ffb3cd"/><circle cx="186" cy="38" r="5.4" fill="#fff0a3"/>
    <circle cx="102" cy="35" r="2.6" fill="#fff0a3"/><circle cx="178" cy="31" r="2.3" fill="#fff0a3"/>
    <path d="M72 126 L68 140 M124 126 L122 140 M92 128 L91 140" stroke="#8a5a2b" stroke-width="6.4" stroke-linecap="round"/>
    <path d="M56 100 Q42 96 46 82 Q58 86 61 95Z" fill="#e0aa68"/>
    <circle cx="86" cy="102" r="4.4" fill="#f2d3a0"/><circle cx="110" cy="110" r="3.6" fill="#f2d3a0"/>`),
  mosshop: () => scene('FLORA', `
    <ellipse cx="100" cy="116" rx="46" ry="24" fill="#43c465"/>
    <circle cx="72" cy="94" r="10" fill="#43c465"/><circle cx="128" cy="94" r="10" fill="#43c465"/>
    <circle cx="72" cy="94" r="6" fill="#fff"/>${eye(72, 94, 3.4)}
    <circle cx="128" cy="94" r="6" fill="#fff"/>${eye(128, 94, 3.4)}
    <path d="M84 118 Q100 126 116 118" stroke="#1d7a3d" stroke-width="3.4" fill="none" stroke-linecap="round"/>
    <path d="M62 104 Q70 76 100 74 Q130 76 138 104 Q116 94 100 100 Q84 94 62 104Z" fill="#5da85f"/>
    <circle cx="84" cy="86" r="5" fill="#7cc47f"/><circle cx="104" cy="80" r="6" fill="#7cc47f"/><circle cx="120" cy="88" r="4" fill="#7cc47f"/>
    <path d="M100 74 Q100 60 110 56 Q112 66 104 72 M88 76 Q82 64 74 62 Q78 72 84 76" fill="#43c465"/>
    <path d="M52 126 Q38 128 40 136 M148 126 Q162 128 160 136" stroke="#1d7a3d" stroke-width="6" fill="none" stroke-linecap="round"/>`),
  fernix: () => scene('FLORA', `
    <ellipse cx="104" cy="110" rx="38" ry="21" fill="#e07b39"/>
    <circle cx="140" cy="94" r="16" fill="#e8894a"/>
    <path d="M130 82 L124 60 L140 74 M148 80 L152 58 L160 76" fill="#e8894a"/>
    <path d="M131 79 L128 67 L137 75 M149 77 L152 65 L157 75" fill="#f7c873"/>
    <ellipse cx="152" cy="98" rx="8" ry="5.4" fill="#fbe3c2"/>
    <circle cx="153" cy="96" r="1.8" fill="#5b3413"/>
    ${eye(139, 89, 3.5)}
    <path d="M68 104 Q36 108 30 84 Q52 76 66 90 Q84 70 92 84 Q78 92 68 104Z" fill="#43c465"/>
    <path d="M52 88 Q44 80 50 74 M64 92 Q58 82 64 76" stroke="#1d7a3d" stroke-width="2.6" fill="none"/>
    <path d="M82 126 L79 137 M122 126 L121 137" stroke="#a34d14" stroke-width="6" stroke-linecap="round"/>
    <path d="M126 108 Q140 112 138 120 L124 118Z" fill="#fbe3c2"/>`),
};

export function artFor(speciesId) {
  const draw = DRAW[speciesId];
  return draw ? draw() : scene('FLORA', '');
}

// Small inline icons used across the UI.
export const candySvg = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="6.4" fill="#ff5f8f"/><path d="M6 9 L1.6 6.4 L3.4 12 L1.6 17.6 L6 15 M18 9 L22.4 6.4 L20.6 12 L22.4 17.6 L18 15" fill="#ff8fb0"/><path d="M8.6 9.4 A4.4 4.4 0 0 1 14.8 8.4" stroke="#fff" stroke-width="1.8" fill="none" stroke-linecap="round"/></svg>`;

export const orbSvg = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="8.6" fill="#ffe066"/><circle cx="12" cy="12" r="8.6" fill="none" stroke="#e8a812" stroke-width="1.6"/><path d="M12 5 L13.8 10.2 L19.4 10.4 L15 13.8 L16.6 19 L12 16 L7.4 19 L9 13.8 L4.6 10.4 L10.2 10.2Z" fill="#fff3b0"/></svg>`;

export const prizeBackSvg = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="2.6" width="18" height="18.8" rx="2.6" fill="#31449e"/><rect x="5" y="4.6" width="14" height="14.8" rx="1.8" fill="#4258c9"/><path d="M12 7.4 L13.5 10.6 L17 11.1 L14.4 13.5 L15.2 17 L12 15.2 L8.8 17 L9.6 13.5 L7 11.1 L10.5 10.6Z" fill="#ffd94d"/></svg>`;
