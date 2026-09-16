import fs from 'fs';
let code = fs.readFileSync('src/game/GameEngine.ts', 'utf8');

const spellCheck = `    // Checa se o jogador soltou a magia (Cura)
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

const newSpellCheck = spellCheck + `

    // Checa se o jogador soltou a magia (Borrão Explosivo)
    if (this.player.aoeCastRequested) {
      this.player.aoeCastRequested = false;
      
      const baseMpCost = 40;
      const mpCost = Math.round(baseMpCost * (1 + (this.ascensionLevel * 0.2)));
      
      if (this.player.mp >= mpCost) {
        this.player.mp -= mpCost;
        
        const baseDamage = 45;
        const damage = Math.round(baseDamage * (1 + (this.ascensionLevel * 0.5)));
        
        // Causa dano em área
        const pX = this.player.x + this.player.width / 2;
        const pY = this.player.y + this.player.height;
        const explosionRadius = 180;
        
        // Trigger attack animation
        this.player.state = 'ATTACK' as any;
        this.player.attackTimer = 0.4;
        
        soundManager.playSwordHit(); // Pode reutilizar som ou adicionar um novo
        
        // Explosão de Nankin Particles
        for(let p=0; p<30; p++) {
          this.particles.push({
            x: pX + (Math.random() - 0.5) * 60, 
            y: pY - 10,
            vx: (Math.random() - 0.5) * 350,
            vy: -Math.random() * 250 - 50,
            color: Math.random() > 0.5 ? '#0A2570' : '#051442',
            size: Math.random() * 12 + 5,
            life: 0,
            maxLife: 0.5 + Math.random() * 0.5,
            alpha: 1,
            shape: 'ink_splatter',
            gravity: 800
          });
        }
        
        // Bate em inimigos próximos
        for (const enemy of this.enemies) {
            if (!enemy.isDefeated) {
                const eX = enemy.x + enemy.width / 2;
                const eY = enemy.y + enemy.height / 2;
                const dist = Math.sqrt(Math.pow(eX - pX, 2) + Math.pow(eY - pY, 2));
                
                if (dist <= explosionRadius) {
                    const knockDirX = eX > pX ? 1 : -1;
                    enemy.takeDamage({
                      amount: damage,
                      type: 'PHYSICAL' as any,
                      knockback: { x: knockDirX * 350, y: -200 },
                      sourcePosition: { x: pX, y: pY }
                    });
                    this.addFloatingText(eX, eY, damage.toString(), '#8B5CF6', 1.5);
                }
            }
        }
      }
    }`;

code = code.replace(spellCheck, newSpellCheck);
fs.writeFileSync('src/game/GameEngine.ts', code);
