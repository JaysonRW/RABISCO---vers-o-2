import fs from 'fs';
let code = fs.readFileSync('src/game/world/Section.ts', 'utf8');

code = code.replace(
  "{ id: 'd1', type: 'box', x: 200, y: 380 },",
  "{ id: 'd1', type: 'box', x: 200, y: 410 },"
).replace(
  "{ id: 'd2', type: 'vase', x: 240, y: 392 },",
  "{ id: 'd2', type: 'vase', x: 250, y: 412 },"
).replace(
  "{ id: 'd3', type: 'rubble', x: 300, y: 396 },",
  "{ id: 'd3', type: 'rubble', x: 300, y: 416 },"
);

fs.writeFileSync('src/game/world/Section.ts', code);
