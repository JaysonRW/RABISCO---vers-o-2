import fs from 'fs';
let code = fs.readFileSync('src/game/GameEngine.ts', 'utf8');

code = code.replace(/!enemy\.isDefeated/g, '!enemy.isAlive');

code = code.replace(`    maxMp: number;
    ascension: AscensionStats;`, `    maxMp: number;
    ascension: AscensionStats;
    inventory?: any[];`);

code = code.replace(`          this.soulOrbs.push({
             id: this.nextSoulId++,
             x: enemy.x + enemy.width / 2,
             y: enemy.y + enemy.height / 2,
             vx: (Math.random() - 0.5) * 150,
             vy: -200 - Math.random() * 100,
             life: 15,
             animTime: 0,
             collected: false
          });`, `          this.soulOrbs.push({
             id: this.nextSoulId++,
             x: enemy.x + enemy.width / 2,
             y: enemy.y + enemy.height / 2,
             vx: (Math.random() - 0.5) * 150,
             vy: -200 - Math.random() * 100,
             life: 15,
             maxLife: 15,
             value: 1,
             animTime: 0,
             collected: false
          });`);

fs.writeFileSync('src/game/GameEngine.ts', code);
