import fs from 'fs';
const code = fs.readFileSync('src/game/rendering/PenRenderer.ts', 'utf8');
const lines = code.split('\n');
let saves = 0;
let restores = 0;
for(let i = 657; i <= 1195; i++) {
  if (lines[i].includes('ctx.save()')) saves++;
  if (lines[i].includes('ctx.restore()')) restores++;
}
console.log('saves:', saves, 'restores:', restores);
