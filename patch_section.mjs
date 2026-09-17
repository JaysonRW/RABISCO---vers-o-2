import fs from 'fs';
let code = fs.readFileSync('src/game/world/Section.ts', 'utf8');

const oldCode = `      { id: 'z10', type: 'ZOMBIE', x: 2350, y: 388, patrolMinX: 1900, patrolMaxX: 2480 },
    ],
    npcConfigs: [],`;

const newCode = `      { id: 'z10', type: 'ZOMBIE', x: 2350, y: 388, patrolMinX: 1900, patrolMaxX: 2480 },
    ],
    destructibles: [
      { id: 'crypt_urn1', type: 'urn', x: 280, y: 298 },
      { id: 'crypt_urn2', type: 'urn', x: 500, y: 208 },
      { id: 'crypt_urn3', type: 'urn', x: 1020, y: 268 },
      { id: 'crypt_urn4', type: 'urn', x: 1250, y: 178 },
      { id: 'crypt_urn5', type: 'urn', x: 2050, y: 228 },
      { id: 'crypt_urn6', type: 'urn', x: 600, y: 398 }, // No chão
      { id: 'crypt_urn7', type: 'urn', x: 1600, y: 398 }, // No chão
    ],
    npcConfigs: [],`;

code = code.replace(oldCode, newCode);
fs.writeFileSync('src/game/world/Section.ts', code);
