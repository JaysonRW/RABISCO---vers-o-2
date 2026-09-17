import fs from 'fs';
let code = fs.readFileSync('src/game/GameEngine.ts', 'utf8');

// Remove red text
code = code.replace(`    ctx.fillStyle='red'; ctx.font='20px Arial'; ctx.fillText('P:' + Math.round(this.player.x) + ',' + Math.round(this.player.y) + ' C:' + Math.round(this.cameraX) + ',' + Math.round(this.cameraY) + ' S:' + this.sectionManager.currentSectionId, 20, 100);\nthis.renderer.renderPlayerHUD`, `this.renderer.renderPlayerHUD`);

fs.writeFileSync('src/game/GameEngine.ts', code);
