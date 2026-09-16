import fs from 'fs';
let code = fs.readFileSync('src/game/GameEngine.ts', 'utf8');

const injection = `
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
        
        if (typeof (window as any).soundManager !== 'undefined') {
            // Se possivel, toque um som
        }
        
        // Explosão de Nankin Particles
        for(let p=0; p<40; p++) {
          this.particles.push({
            x: pX + (Math.random() - 0.5) * 60, 
            y: pY - 10,
            vx: (Math.random() - 0.5) * 450,
            vy: -Math.random() * 300 - 100,
            color: Math.random() > 0.5 ? '#0A2570' : '#051442',
            size: Math.random() * 14 + 6,
            life: 0,
            maxLife: 0.6 + Math.random() * 0.6,
            alpha: 1,
            shape: 'ink_splatter',
            gravity: 900
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
    }

    // Atualiza Fireballs`;

if (!code.includes('aoeCastRequested')) {
  code = code.replace('    // Atualiza Fireballs', injection);
  fs.writeFileSync('src/game/GameEngine.ts', code);
  console.log('Successfully injected AoE in GameEngine');
} else {
  console.log('AoE already in GameEngine');
}
