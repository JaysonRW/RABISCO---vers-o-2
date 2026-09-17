import fs from 'fs';
const code = fs.readFileSync('src/game/rendering/ParallaxBackgroundSystem.ts', 'utf8');
console.log(code.includes('img.complete'));
