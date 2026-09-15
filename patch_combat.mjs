import fs from 'fs';
let code = fs.readFileSync('src/game/GameEngine.ts', 'utf8');

// Insert destructible logic inside handleCombatHits
const destructibleHitLogic = `
    // Check Destructibles
    for (const dest of this.destructibles) {
      if (dest.isDestroyed) continue;
      const dBounds = dest.getBounds();
      if (this.checkOverlap(attackHitbox, dBounds)) {
        this.player.hasHitCurrentAttack = true; // garante apenas 1 golpe
        
        const activeDamageType = this.inventory.getActiveDamageType();
        const damageInfo = {
          amount: GAME_CONFIG.PLAYER.ATTACK_DAMAGE,
          type: activeDamageType,
          knockback: { x: this.player.facing * 50, y: -50 },
          sourcePosition: { x: this.player.x, y: this.player.y }
        };
        
        dest.takeDamage(damageInfo, this.inventory, (newParticles) => {
          this.particles.push(...newParticles);
        });
        
        soundManager.playSwordHit(); // Assuming this exists
        this.triggerScreenShake(0.05, 3);
        
        // Break after hitting one thing (or keep checking? Usually one hit per frame check)
        break;
      }
    }
`;

if (!code.includes('Check Destructibles')) {
  code = code.replace(
    '// Bônus de Ascensão multiplica o poder do corte',
    destructibleHitLogic + '\n        // Bônus de Ascensão multiplica o poder do corte'
  );
  fs.writeFileSync('src/game/GameEngine.ts', code);
}
