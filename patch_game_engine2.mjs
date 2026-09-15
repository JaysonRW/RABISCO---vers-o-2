import fs from 'fs';
let code = fs.readFileSync('src/game/GameEngine.ts', 'utf8');

code = code.replace(
  'dest.takeDamage(damageInfo, this.inventory, (newParticles) => {',
  `dest.takeDamage(damageInfo, this.inventory, (newParticles) => {
          this.particles.push(...newParticles);
        }, (x, y, text, color) => {
          this.addFloatingText(x, y, text, color);
        });
        
        // Remove old callback block`
);
code = code.replace(
  `        // Remove old callback block
          this.particles.push(...newParticles);
        });`,
  ""
);

fs.writeFileSync('src/game/GameEngine.ts', code);
