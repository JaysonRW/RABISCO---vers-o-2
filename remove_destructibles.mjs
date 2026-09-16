import fs from 'fs';
let code = fs.readFileSync('src/game/world/Section.ts', 'utf8');

code = code.replace(
  /destructibles: \[\s*\{\s*id:\s*'d1'[^\]]*\],/m,
  'destructibles: [],'
);

fs.writeFileSync('src/game/world/Section.ts', code);
