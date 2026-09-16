import fs from 'fs';
let code = fs.readFileSync('src/game/GameEngine.ts', 'utf8');

const anchor = `      if (dest.isDestroyed || (dest as any).isDestroying) continue;
      const dBounds = dest.getBounds();
      if (this.checkOverlap(attackHitbox, dBounds)) {`;

const inj = `      if (dest.isDestroyed || (dest as any).isDestroying) continue;
      const dBounds = dest.getBounds();
      if (this.checkOverlap(attackHitbox, dBounds)) {
        console.log('HIT BOX!', dest);`;

if (code.includes(anchor)) {
    code = code.replace(anchor, inj);
    fs.writeFileSync('src/game/GameEngine.ts', code);
    console.log('Added debug log');
}
