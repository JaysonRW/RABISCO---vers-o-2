import fs from 'fs';
let code = fs.readFileSync('src/game/world/Section.ts', 'utf8');

const anchor = `    destructibles: [
      { id: 'f_box_1', type: 'box', x: 160, y: 410 },
      { id: 'f_box_2', type: 'box', x: 210, y: 410 },
      { id: 'f_box_3', type: 'box', x: 800, y: 410 },
      { id: 'f_box_4', type: 'box', x: 1750, y: 410 },
    ],`;

const inj = `    destructibles: [
      { id: 'f_box_1', type: 'box', x: 160, y: 400 },
      { id: 'f_box_2', type: 'box', x: 210, y: 400 },
      { id: 'f_box_3', type: 'box', x: 800, y: 400 },
      { id: 'f_box_4', type: 'box', x: 1750, y: 400 },
    ],`;

if (code.includes(anchor)) {
    code = code.replace(anchor, inj);
    fs.writeFileSync('src/game/world/Section.ts', code);
    console.log('Section.ts box Y positions updated.');
}
