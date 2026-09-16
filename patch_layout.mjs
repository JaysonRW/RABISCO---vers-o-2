import fs from 'fs';

let sectionCode = fs.readFileSync('src/game/world/Section.ts', 'utf8');

sectionCode = sectionCode.replace(
  "targetPlayerX: 150, // Left edge of sanctuary",
  "targetPlayerX: 80, // Left edge of sanctuary"
);

sectionCode = sectionCode.replace(
  "autoTriggerDistance: 200,",
  "autoTriggerDistance: 310,"
);

fs.writeFileSync('src/game/world/Section.ts', sectionCode);
