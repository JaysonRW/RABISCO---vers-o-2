import fs from 'fs';
let code = fs.readFileSync('src/game/GameEngine.ts', 'utf8');

const spellCode = `    // Checa se o jogador soltou a magia (Fireball)
    if (this.player.spellCastRequested) {
      this.player.spellCastRequested = false;
      
      const baseMpCost = 25;
      const mpCost = Math.round(baseMpCost * (1 + (this.ascensionLevel * 0.2)));
      
      if (this.player.mp >= mpCost) {
        this.player.mp -= mpCost;
        
        // Spawn Fireball
        const baseDamage = 30;
        const damage = Math.round(baseDamage * (1 + (this.ascensionLevel * 0.5)));
        
        const fbX = this.player.facing === 1 ? this.player.x + this.player.width : this.player.x;
        const fbY = this.player.y + this.player.height / 2;
        
        this.fireballs.push(new Fireball(fbX, fbY, this.player.facing, damage));
        
        // Trigger attack animation
        this.player.state = 'ATTACK' as any;
        this.player.attackTimer = 0.3; // force animation
      }
    }`;

const newSpellCode = spellCode + `

    // Checa se o jogador soltou a magia (Cura)
    if (this.player.healCastRequested) {
      this.player.healCastRequested = false;
      
      const baseMpCost = 30;
      const mpCost = Math.round(baseMpCost * (1 + (this.ascensionLevel * 0.2)));
      
      if (this.player.mp >= mpCost && this.player.hp < this.player.maxHp) {
        this.player.mp -= mpCost;
        
        const baseHeal = 25;
        const healAmount = Math.round(baseHeal * (1 + (this.ascensionLevel * 0.5)));
        
        const previousHp = this.player.hp;
        this.player.hp = Math.min(this.player.maxHp, this.player.hp + healAmount);
        const actualHeal = this.player.hp - previousHp;
        
        if (actualHeal > 0) {
            // Trigger floating text
            const pX = this.player.x + this.player.width / 2;
            const pY = this.player.y;
            this.addFloatingText(pX, pY, \`+\${actualHeal} VIDA\`, '#10B981', 1.2);
            
            // Trigger green aura particles
            for(let p=0; p<20; p++) {
              this.particles.push({
                x: pX + (Math.random() - 0.5) * 40, 
                y: pY + this.player.height + (Math.random() - 0.5) * 20,
                vx: (Math.random() - 0.5) * 50,
                vy: -Math.random() * 100 - 50,
                color: Math.random() > 0.5 ? '#10B981' : '#34D399',
                size: Math.random() * 6 + 3,
                life: 0,
                maxLife: 0.5 + Math.random() * 0.5,
                alpha: 1,
                shape: 'spark'
              });
            }
        }
      }
    }`;

code = code.replace(spellCode, newSpellCode);

fs.writeFileSync('src/game/GameEngine.ts', code);
console.log('GameEngine patched for heal spell.');
