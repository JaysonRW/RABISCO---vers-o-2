import fs from 'fs';
let code = fs.readFileSync('src/game/GameEngine.ts', 'utf8');

code = code.replace("this.spawnDamageText(fb.damage, fb.x, fb.y, '#FF5500', 1.5);", "this.addFloatingText(fb.x, fb.y, fb.damage.toString(), '#FF5500', 1.5);");

fs.writeFileSync('src/game/GameEngine.ts', code);
