import fs from 'fs';
let code = fs.readFileSync('src/game/GameEngine.ts', 'utf8');

const oldCode = `      for (const enemy of this.enemies) {
        if (!enemy.isAlive) {
          const eBounds = enemy.getBounds();
          if (this.checkOverlap(fbBounds, eBounds)) {`;

const newCode = `      for (const enemy of this.enemies) {
        if (enemy.isAlive) {
          const eBounds = enemy.getBounds();
          if (this.checkOverlap(fbBounds, eBounds)) {`;

code = code.replace(oldCode, newCode);
fs.writeFileSync('src/game/GameEngine.ts', code);
