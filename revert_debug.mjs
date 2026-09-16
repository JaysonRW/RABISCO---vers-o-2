import fs from 'fs';
let code = fs.readFileSync('src/game/GameEngine.ts', 'utf8');

code = code.replace(`        console.log('HIT BOX!', dest);`, '');
fs.writeFileSync('src/game/GameEngine.ts', code);
