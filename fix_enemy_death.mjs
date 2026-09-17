import fs from 'fs';
let code = fs.readFileSync('src/game/GameEngine.ts', 'utf8');

const anchor1 = `        if (dmgResult.isImmune) {
          if ((soundManager as any).playImmuneClank) (soundManager as any).playImmuneClank();
          this.addFloatingText(hitX, hitY - 20, "IMUNE", '#9CA3AF');
        } else if (dmgResult.isWeakness) {
          if ((soundManager as any).playGhostHurt) (soundManager as any).playGhostHurt();
          this.addFloatingText(hitX, hitY - 20, dmgResult.dealt.toString(), '#FBBF24', 1.5);
        } else {
          if ((soundManager as any).playHitImpact) (soundManager as any).playHitImpact();
          this.addFloatingText(hitX, hitY - 20, dmgResult.dealt.toString(), '#FFFFFF', 1.0);
        }`;

const replace1 = `        if (dmgResult.isImmune) {
          if ((soundManager as any).playImmuneClank) (soundManager as any).playImmuneClank();
          this.addFloatingText(hitX, hitY - 20, "IMUNE", '#9CA3AF');
        } else if (dmgResult.isWeakness) {
          if ((soundManager as any).playGhostHurt) (soundManager as any).playGhostHurt();
          this.addFloatingText(hitX, hitY - 20, dmgResult.dealt.toString(), '#FBBF24', 1.5);
        } else {
          if ((soundManager as any).playHitImpact) (soundManager as any).playHitImpact();
          this.addFloatingText(hitX, hitY - 20, dmgResult.dealt.toString(), '#FFFFFF', 1.0);
        }

        if (dmgResult.defeated) {
          if ((soundManager as any).playGhostWail) (soundManager as any).playGhostWail();
          this.triggerScreenShake(0.12, 6);

          for (let p = 0; p < 20; p++) {
             this.particles.push({
               x: enemy.x + enemy.width / 2, 
               y: enemy.y + enemy.height / 2,
               vx: (Math.random() - 0.5) * 400,
               vy: (Math.random() - 0.5) * 400,
               color: isSaltActive ? '#FFFFFF' : GAME_CONFIG.PALETTE.PEN_PRIMARY, 
               size: Math.random() * 5 + 2,
               life: 0, 
               maxLife: 0.5 + Math.random() * 0.5, 
               alpha: 1, 
               shape: isSaltActive ? 'spark' : 'ink_slash'
             });
          }

          this.soulOrbs.push({
             id: this.nextSoulId++,
             x: enemy.x + enemy.width / 2,
             y: enemy.y + enemy.height / 2,
             vx: (Math.random() - 0.5) * 150,
             vy: -200 - Math.random() * 100,
             life: 15,
             animTime: 0,
             collected: false
          });

          this.queueEnemyRespawn(enemy);
        }`;

if (code.includes(anchor1)) {
   code = code.replace(anchor1, replace1);
   fs.writeFileSync('src/game/GameEngine.ts', code);
   console.log('Death particles and soul drops restored.');
} else {
   console.log('Anchor not found!');
}
