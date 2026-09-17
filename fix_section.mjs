import fs from 'fs';
let code = fs.readFileSync('src/game/world/Section.ts', 'utf8');

// Update type definition
code = code.replace(`type: 'GHOST' | 'GHOUL';`, `type: 'GHOST' | 'GHOUL' | 'ZOMBIE';`);

// Update crypt enemy spawns
const cryptSpawnsOld = `    enemySpawns: [
      { id: 'c_ghost_1', type: 'GHOST', x: 500, y: 200 },
      { id: 'c_ghoul_1', type: 'GHOUL', x: 580, y: 388, patrolMinX: 120, patrolMaxX: 680 },
      { id: 'c_ghost_2', type: 'GHOST', x: 1120, y: 220 },
      { id: 'c_ghoul_2', type: 'GHOUL', x: 1400, y: 388, patrolMinX: 960, patrolMaxX: 1650 },
      { id: 'c_ghost_3', type: 'GHOST', x: 1650, y: 180 },
      { id: 'c_ghoul_3', type: 'GHOUL', x: 2150, y: 388, patrolMinX: 1920, patrolMaxX: 2480 },
      { id: 'c_ghost_4', type: 'GHOST', x: 2400, y: 160 },
    ],`;

const cryptSpawnsNew = `    enemySpawns: [
      // Horda de zumbis
      { id: 'z1', type: 'ZOMBIE', x: 300, y: 388, patrolMinX: 200, patrolMaxX: 680 },
      { id: 'z2', type: 'ZOMBIE', x: 450, y: 388, patrolMinX: 200, patrolMaxX: 680 },
      { id: 'z3', type: 'ZOMBIE', x: 600, y: 388, patrolMinX: 200, patrolMaxX: 680 },
      { id: 'z4', type: 'ZOMBIE', x: 900, y: 388, patrolMinX: 860, patrolMaxX: 1650 },
      { id: 'z5', type: 'ZOMBIE', x: 1100, y: 388, patrolMinX: 860, patrolMaxX: 1650 },
      { id: 'z6', type: 'ZOMBIE', x: 1300, y: 388, patrolMinX: 860, patrolMaxX: 1650 },
      { id: 'z7', type: 'ZOMBIE', x: 1500, y: 388, patrolMinX: 860, patrolMaxX: 1650 },
      { id: 'z8', type: 'ZOMBIE', x: 1950, y: 388, patrolMinX: 1900, patrolMaxX: 2480 },
      { id: 'z9', type: 'ZOMBIE', x: 2150, y: 388, patrolMinX: 1900, patrolMaxX: 2480 },
      { id: 'z10', type: 'ZOMBIE', x: 2350, y: 388, patrolMinX: 1900, patrolMaxX: 2480 },
    ],`;

code = code.replace(cryptSpawnsOld, cryptSpawnsNew);

fs.writeFileSync('src/game/world/Section.ts', code);
