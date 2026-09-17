import fs from 'fs';
const code = fs.readFileSync('src/game/rendering/ParallaxBackgroundSystem.ts', 'utf8');
const lines = code.split('\n');
let depth = 0;
for(let i = 1283; i <= 1345; i++) {
  if (lines[i] && lines[i].includes('ctx.save()')) { depth++; console.log('save at', i+1, 'depth', depth); }
  if (lines[i] && lines[i].includes('ctx.restore()')) { depth--; console.log('restore at', i+1, 'depth', depth); }
}
console.log('Final depth:', depth);
