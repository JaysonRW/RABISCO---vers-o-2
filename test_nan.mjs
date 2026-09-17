import fs from 'fs';
let code = fs.readFileSync('src/game/GameEngine.ts', 'utf8');
code = code.replace(`    const progressPercent = Math.min(
      100,
      Math.round((this.ascensionSoulsCurrentLevel / this.ascensionSoulsNeeded) * 100)
    );`, `    const progressPercent = Math.min(
      100,
      Math.round((this.ascensionSoulsCurrentLevel / this.ascensionSoulsNeeded) * 100)
    );
    if (isNaN(progressPercent)) console.log("NAN detected:", this.ascensionSoulsCurrentLevel, this.ascensionSoulsNeeded, GAME_CONFIG.ASCENSION.SOULS_BASE_REQ);`);
fs.writeFileSync('src/game/GameEngine.ts', code);
