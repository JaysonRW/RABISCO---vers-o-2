import fs from 'fs';
let code = fs.readFileSync('src/game/GameEngine.ts', 'utf8');
code = code.replace(`this.renderer.renderPlayerHUD(ctx,`, `ctx.fillStyle='red'; ctx.font='20px Arial'; ctx.fillText('P:' + Math.round(this.player.x) + ',' + Math.round(this.player.y) + ' C:' + Math.round(this.cameraX) + ',' + Math.round(this.cameraY) + ' S:' + this.sectionManager.currentSectionId, 20, 100);\nthis.renderer.renderPlayerHUD(ctx,`);
fs.writeFileSync('src/game/GameEngine.ts', code);
