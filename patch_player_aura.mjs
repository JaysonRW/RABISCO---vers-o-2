import fs from 'fs';
let code = fs.readFileSync('src/game/entities/Player.ts', 'utf8');

if (!code.includes('public healingAuraTimer: number')) {
  code = code.replace(
    'public animTime: number = 0;',
    'public animTime: number = 0;\n  public healingAuraTimer: number = 0;'
  );
  
  code = code.replace(
    'this.animTime += dt;',
    'this.animTime += dt;\n    if (this.healingAuraTimer > 0) this.healingAuraTimer -= dt;'
  );
  
  fs.writeFileSync('src/game/entities/Player.ts', code);
  console.log('Added healingAuraTimer to Player.');
} else {
  console.log('healingAuraTimer already exists.');
}
