import fs from 'fs';
let code = fs.readFileSync('src/game/GameEngine.ts', 'utf8');

if (!code.includes('import { Fireball } from')) {
  code = code.replace(
    "import { Player } from './entities/Player';",
    "import { Player } from './entities/Player';\nimport { Fireball } from './entities/Fireball';"
  );
}

if (!code.includes('public fireballs: Fireball[] = [];')) {
  code = code.replace(
    'public particles: Particle[] = [];',
    'public particles: Particle[] = [];\n  public fireballs: Fireball[] = [];'
  );
}

const updatePlayerCall = `    this.player.update(
      dt,
      activeInput,
      this.level.platforms,
      this.inventory.hasSaltCoating,
      () => this.triggerUseSalt()
    );`;

const newUpdatePlayerCall = `    this.player.update(
      dt,
      activeInput,
      this.level.platforms,
      this.inventory.hasSaltCoating,
      () => this.triggerUseSalt()
    );

    // Checa se o jogador soltou a magia (Fireball)
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
    }

    // Atualiza Fireballs
    for (let i = this.fireballs.length - 1; i >= 0; i--) {
      const fb = this.fireballs[i];
      fb.update(dt);
      
      // Checa colisão com inimigos
      const fbBounds = fb.getBounds();
      let hit = false;
      
      for (const enemy of this.activeEnemies) {
        if (!enemy.isDefeated) {
          const eBounds = enemy.getBounds();
          if (this.checkOverlap(fbBounds, eBounds)) {
            hit = true;
            // Causar dano de fogo
            enemy.takeDamage({
              amount: fb.damage,
              type: 'FIRE' as any,
              knockback: { x: fb.facing * 150, y: -100 },
              sourcePosition: { x: fb.x, y: fb.y }
            });
            this.spawnDamageText(fb.damage, fb.x, fb.y, '#FF5500', 1.5);
            
            // Explosão de fogo
            for(let p=0; p<15; p++) {
              this.particles.push({
                x: fb.x, y: fb.y,
                vx: (Math.random() - 0.5) * 200,
                vy: (Math.random() - 0.5) * 200,
                color: Math.random() > 0.5 ? '#FF4400' : '#FFDD00',
                size: Math.random() * 8 + 4,
                life: 0,
                maxLife: 0.3 + Math.random() * 0.3,
                alpha: 1,
                shape: 'spark'
              });
            }
            break;
          }
        }
      }
      
      // Se saiu da tela ou bateu, remove
      if (hit || fb.x < this.cameraX - 100 || fb.x > this.cameraX + 1920 + 100) {
        this.fireballs.splice(i, 1);
      }
    }
`;

if (code.includes(updatePlayerCall)) {
  code = code.replace(updatePlayerCall, newUpdatePlayerCall);
  fs.writeFileSync('src/game/GameEngine.ts', code);
  console.log('GameEngine patched successfully for fireball.');
} else {
  console.log('Error: Could not patch GameEngine.');
}
