import fs from 'fs';
let code = fs.readFileSync('src/game/world/Section.ts', 'utf8');

const courtyardTriggers = `    edgeTriggers: [
      {
        id: 'trigger_to_forest',
        side: 'RIGHT',
        bounds: { x: 2320, y: 0, width: 80, height: 540 },
        targetSectionId: 'corrupted_forest',
        targetPlayerX: 80,
        targetPlayerY: 370,
        targetDirection: Direction.RIGHT,
        label: 'Avançar para Floresta Corrompida »',
      },
    ],`;

const newCourtyardTriggers = `    edgeTriggers: [
      {
        id: 'trigger_to_forest',
        side: 'RIGHT',
        bounds: { x: 2320, y: 0, width: 80, height: 540 },
        targetSectionId: 'corrupted_forest',
        targetPlayerX: 80,
        targetPlayerY: 370,
        targetDirection: Direction.RIGHT,
        label: 'Avançar para Floresta Corrompida »',
      },
      {
        id: 'trigger_to_sanctuary',
        side: 'LEFT',
        bounds: { x: 0, y: 0, width: 80, height: 540 },
        targetSectionId: 'sanctuary_interior',
        targetPlayerX: 400, // Center of sanctuary
        targetPlayerY: 370,
        targetDirection: Direction.RIGHT,
        label: '« Adentrar o Santuário',
      },
    ],`;

code = code.replace(courtyardTriggers, newCourtyardTriggers);
fs.writeFileSync('src/game/world/Section.ts', code);
