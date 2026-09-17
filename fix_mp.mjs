import fs from 'fs';
let code = fs.readFileSync('src/game/GameEngine.ts', 'utf8');

code = code.replace(`    enemiesAlive: number;
    ascension: AscensionStats;`, `    enemiesAlive: number;
    mp: number;
    maxMp: number;
    ascension: AscensionStats;`);

code = code.replace(`      enemiesAlive: aliveCount,
      ascension: this.getAscensionStats(),`, `      enemiesAlive: aliveCount,
      mp: this.player.mp,
      maxMp: this.player.maxMp,
      ascension: this.getAscensionStats(),`);

fs.writeFileSync('src/game/GameEngine.ts', code);
console.log('Fixed GameEngine');
