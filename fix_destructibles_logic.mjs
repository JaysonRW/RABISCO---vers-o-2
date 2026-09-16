import fs from 'fs';
let code = fs.readFileSync('src/game/GameEngine.ts', 'utf8');

// I will just replace the whole handleCombatHits function to be 100% sure the blocks are correct.
const funcStart = '  private handleCombatHits() {';
const funcEnd = '  private triggerScreenShake(intensity: number, duration: number) {'; // next function

const beforeStr = code.substring(0, code.indexOf(funcStart));
const afterStr = code.substring(code.indexOf(funcEnd));

const newFunc = `  private handleCombatHits() {
    const attackHitbox = this.player.getAttackHitbox();
    if (!attackHitbox || this.player.hasHitCurrentAttack) return;

    let hitSomething = false;

    // Check Enemies
    for (const enemy of this.enemies) {
      if (!enemy.isAlive) continue;

      const eBounds = enemy.getBounds();
      if (this.checkOverlap(attackHitbox, eBounds)) {
        hitSomething = true;
        this.player.hasHitCurrentAttack = true; // garante apenas 1 golpe por animação

        // Ponto central de contato do corte no plano 2D
        const hitX = Math.max(attackHitbox.x, Math.min(attackHitbox.x + attackHitbox.width, enemy.x + enemy.width / 2));
        const hitY = Math.max(attackHitbox.y, Math.min(attackHitbox.y + attackHitbox.height, enemy.y + enemy.height / 2));
        const slashDirX = this.player.facing;
        const slashDirY = this.player.isSpinJumping ? -0.4 : -0.15;

        // Se acertou golpe durante o Pulo com Giro 360°, concede impulso acrobático para cima
        if (this.player.isSpinJumping) {
          this.player.vy = Math.min(this.player.vy, -260);
        }

        // Determina o tipo de dano ativo na espada do jogador
        const activeDamageType = this.inventory.getActiveDamageType();
        const isSaltActive = activeDamageType === 'SALT';

        // Bônus de Ascensão multiplica o poder do corte
        const damageMultiplier = this.getCurrentAscensionInfo().damageMult;
        const calculatedDamage = Math.round(GAME_CONFIG.PLAYER.ATTACK_DAMAGE * damageMultiplier);

        const damageInfo = {
          amount: calculatedDamage,
          type: activeDamageType,
          knockback: { x: this.player.facing * 180, y: -180 },
          sourcePosition: { x: this.player.x, y: this.player.y }
        };

        const dmgResult = enemy.takeDamage(damageInfo);

        // Som
        if (dmgResult.isImmune) {
          soundManager.playImmuneClank();
        } else if (dmgResult.isWeakness) {
          if (enemy.type === 'GHOST' || enemy.type === 'GHOUL') {
            soundManager.playGhostHurt();
          }
        } else {
          soundManager.playHitImpact();
        }

        // Efeito Especial da Lâmina: Partículas de Sal ou Tinta Normal
        if (isSaltActive) {
           this.inventory.useSalt();
           for(let p=0; p<8; p++) {
             this.particles.push({
               x: hitX + (Math.random()-0.5)*20, y: hitY + (Math.random()-0.5)*20,
               vx: slashDirX * (300 + Math.random()*200) + (Math.random()-0.5)*100,
               vy: slashDirY * 300 + (Math.random()-0.5)*100,
               color: '#FFFFFF', size: Math.random() * 3 + 2,
               life: 0, maxLife: 0.3 + Math.random()*0.2, alpha: 1, shape: 'spark'
             });
           }
        } else {
           for(let p=0; p<12; p++) {
             this.particles.push({
               x: hitX, y: hitY,
               vx: slashDirX * (200 + Math.random()*300) + (Math.random()-0.5)*150,
               vy: slashDirY * 300 + (Math.random()-0.5)*150,
               color: GAME_CONFIG.PALETTE.PEN_PRIMARY, size: Math.random() * 4 + 1,
               life: 0, maxLife: 0.3 + Math.random()*0.3, alpha: 1, shape: 'ink_slash'
             });
           }
        }

        this.triggerScreenShake(0.08, 4);

        if (dmgResult.dealt > 0) {
          this.addFloatingText(hitX, hitY - 20, dmgResult.dealt.toString(), dmgResult.isWeakness ? '#FBBF24' : '#FFFFFF', dmgResult.isWeakness ? 1.5 : 1.0);
        } else if (dmgResult.isImmune) {
          this.addFloatingText(hitX, hitY - 20, "IMUNE", '#9CA3AF');
        }

        break; // Atingiu um inimigo, para
      }
    }

    if (hitSomething) return; // Se já bateu no inimigo, não bate na caixa no mesmo instante se quisermos (ou tira o return pra bater nos dois)

    // Check Destructibles
    for (const dest of this.destructibles) {
      if (dest.isDestroyed || (dest as any).isDestroying) continue;
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

        dest.takeDamage(damageInfo, (type, x, y) => {
          this.collectibles.push({
            id: Math.random(),
            type, x, y, vx: (Math.random() - 0.5) * 120, vy: -150 - Math.random() * 100,
            width: 16, height: 16, isCollected: false, life: 0
          });
        }, (newParticles) => {
          this.particles.push(...newParticles);
        }, (x, y, text, color) => {
          this.addFloatingText(x, y, text, color);
        });

        soundManager.playHitImpact();
        this.triggerScreenShake(0.05, 3);
        
        break;
      }
    }
  }

`;

code = beforeStr + newFunc + afterStr;
fs.writeFileSync('src/game/GameEngine.ts', code);
console.log('Fixed combat collisions block.');
