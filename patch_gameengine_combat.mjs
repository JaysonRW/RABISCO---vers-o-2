import fs from 'fs';
let code = fs.readFileSync('src/game/GameEngine.ts', 'utf8');

const anchor = `    // Check Destructibles
    for (const dest of this.destructibles) {
      if (dest.isDestroyed) continue;
      const dBounds = dest.getBounds();`;

const inj = `    // Check Destructibles
    for (const dest of this.destructibles) {
      if (dest.isDestroyed || (dest as any).isDestroying) continue;
      const dBounds = dest.getBounds();`;

if (code.includes(anchor)) {
    code = code.replace(anchor, inj);
    fs.writeFileSync('src/game/GameEngine.ts', code);
    console.log('GameEngine destructibles collision check updated.');
}
