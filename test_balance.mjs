import fs from 'fs';
const code = fs.readFileSync('src/game/rendering/PenRenderer.ts', 'utf8');
const lines = code.split('\n');
let depth = 0;
for(let i = 657; i <= 1195; i++) {
  if (lines[i].includes('ctx.save()')) { depth++; console.log('save at', i+1, 'depth', depth); }
  if (lines[i].includes('ctx.restore()')) { depth--; console.log('restore at', i+1, 'depth', depth); }
}
console.log('Final depth:', depth);
