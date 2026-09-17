import fs from 'fs';
let code = fs.readFileSync('src/game/GameEngine.ts', 'utf8');

const oldCode = `        this.fireballs.push(new Fireball(fbX, fbY, this.player.facing, damage));
        
        // Trigger attack animation`;

const newCode = `        this.fireballs.push(new Fireball(fbX, fbY, this.player.facing, damage));
        
        // Toca o som do disparo da magia de fogo
        if ((soundManager as any).playFireballSound) {
          (soundManager as any).playFireballSound();
        }
        
        // Trigger attack animation`;

code = code.replace(oldCode, newCode);
fs.writeFileSync('src/game/GameEngine.ts', code);
