import fs from 'fs';
let code = fs.readFileSync('src/game/GameEngine.ts', 'utf8');

// The array is called 'enemies', not 'activeEnemies'
code = code.replace(/this\.activeEnemies/g, 'this.enemies');

fs.writeFileSync('src/game/GameEngine.ts', code);
