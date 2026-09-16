import fs from 'fs';
let code = fs.readFileSync('src/game/world/Section.ts', 'utf8');

code = code.replace(
  "targetPlayerX: 400, // Center of sanctuary",
  "targetPlayerX: 380, // Center of sanctuary"
);
code = code.replace(
  "targetPlayerY: 370,",
  "targetPlayerY: 390,"
);
fs.writeFileSync('src/game/world/Section.ts', code);
