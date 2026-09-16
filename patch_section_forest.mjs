import fs from 'fs';
let code = fs.readFileSync('src/game/world/Section.ts', 'utf8');

const anchor = `      { id: 'c_ghost_4', type: 'GHOST', x: 2400, y: 160 },
    ],
    npcConfigs: [],
  },`;

// Em floresta corrompida, y = 440 (chao) - 30 (height) = 410.
const replacement = `      { id: 'c_ghost_4', type: 'GHOST', x: 2400, y: 160 },
    ],
    destructibles: [
      { id: 'f_box_1', type: 'box', x: 160, y: 410 },
      { id: 'f_box_2', type: 'box', x: 210, y: 410 },
      { id: 'f_box_3', type: 'box', x: 800, y: 410 },
      { id: 'f_box_4', type: 'box', x: 1750, y: 410 },
    ],
    npcConfigs: [],
  },`;

if (code.includes(anchor)) {
    code = code.replace(anchor, replacement);
    fs.writeFileSync('src/game/world/Section.ts', code);
    console.log('Section.ts patched.');
} else {
    console.log('Section.ts anchor not found.');
}
