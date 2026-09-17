import fs from 'fs';
let code = fs.readFileSync('src/game/GameEngine.ts', 'utf8');

code = code.replace(`        if (isSaltActive) {
           this.inventory.useSalt();`, `        if (isSaltActive) {`);

fs.writeFileSync('src/game/GameEngine.ts', code);
console.log('Fixed useSalt error');
