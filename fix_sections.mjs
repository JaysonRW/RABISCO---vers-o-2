import fs from 'fs';
let code = fs.readFileSync('src/game/world/Section.ts', 'utf8');

// Remover de forgotten_crypt
const cryptAnchor = `      { id: 'c_ghost_4', type: 'GHOST', x: 2400, y: 160 },
    ],
    destructibles: [
      { id: 'f_box_1', type: 'box', x: 160, y: 410 },
      { id: 'f_box_2', type: 'box', x: 210, y: 410 },
      { id: 'f_box_3', type: 'box', x: 800, y: 410 },
      { id: 'f_box_4', type: 'box', x: 1750, y: 410 },
    ],
    npcConfigs: [],
  },`;
const cryptClean = `      { id: 'c_ghost_4', type: 'GHOST', x: 2400, y: 160 },
    ],
    npcConfigs: [],
  },`;

code = code.replace(cryptAnchor, cryptClean);

// Adicionar em corrupted_forest
const forestAnchor = `      { id: 'f_ghost_3', type: 'GHOST', x: 2260, y: 170 },
    ],
    npcConfigs: [],
  },`;
const forestInj = `      { id: 'f_ghost_3', type: 'GHOST', x: 2260, y: 170 },
    ],
    destructibles: [
      { id: 'f_box_1', type: 'box', x: 160, y: 410 },
      { id: 'f_box_2', type: 'box', x: 210, y: 410 },
      { id: 'f_box_3', type: 'box', x: 800, y: 410 },
      { id: 'f_box_4', type: 'box', x: 1750, y: 410 },
    ],
    npcConfigs: [],
  },`;
code = code.replace(forestAnchor, forestInj);

fs.writeFileSync('src/game/world/Section.ts', code);
console.log('Sections patched.');
