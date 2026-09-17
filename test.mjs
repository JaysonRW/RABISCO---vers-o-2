import fs from 'fs';
let code = fs.readFileSync('src/game/GameEngine.ts', 'utf8');
code = code.replace(`    this.player.update(dt, this.level.platforms);`, `    this.player.update(dt, this.level.platforms);\n    if (this.sectionManager.currentSectionId === 'corrupted_forest' && Math.random() < 0.05) console.log('Player at', this.player.x, this.player.y, 'Camera at', this.cameraX, this.cameraY, 'Width:', this.level.width);`);
fs.writeFileSync('src/game/GameEngine.ts', code);
