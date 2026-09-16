import fs from 'fs';
let code = fs.readFileSync('src/game/GameEngine.ts', 'utf8');

code = code.replace(
  'const actualHeal = this.player.hp - previousHp;',
  'const actualHeal = this.player.hp - previousHp;\n        this.player.healingAuraTimer = 0.8; // Dura 0.8s'
);

fs.writeFileSync('src/game/GameEngine.ts', code);
