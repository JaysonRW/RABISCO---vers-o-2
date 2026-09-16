import fs from 'fs';
let code = fs.readFileSync('src/game/GameEngine.ts', 'utf8');

// Import Collectible type
code = code.replace(`import { Direction, Rect, Particle, FloatingText, SoulOrb } from './types';`, `import { Direction, Rect, Particle, FloatingText, SoulOrb, Collectible } from './types';`);
if (!code.includes('Collectible } from')) {
   code = code.replace(`} from './types';`, `, Collectible } from './types';`);
}

// Add array
const arrayAnchor = `  public destructibles: Destructible[] = [];`;
const arrayInj = `  public destructibles: Destructible[] = [];
  public collectibles: Collectible[] = [];`;
if (code.includes(arrayAnchor)) code = code.replace(arrayAnchor, arrayInj);

// Fix takeDamage call
const tdAnchor = `        dest.takeDamage(damageInfo, this.inventory, (newParticles) => {
          this.particles.push(...newParticles);
        }, (x, y, text, color) => {
          this.addFloatingText(x, y, text, color);
        });`;
const tdInj = `        dest.takeDamage(damageInfo, (type, x, y) => {
          this.collectibles.push({
            id: Math.random(),
            type, x, y, vx: (Math.random() - 0.5) * 120, vy: -150 - Math.random() * 100,
            width: 16, height: 16, isCollected: false, life: 0
          });
        }, (newParticles) => {
          this.particles.push(...newParticles);
        }, (x, y, text, color) => {
          this.addFloatingText(x, y, text, color);
        });`;
if (code.includes(tdAnchor)) code = code.replace(tdAnchor, tdInj);

// Update collectibles
const upAnchor = `    // Atualiza Textos Flutuantes`;
const upInj = `    // Atualiza Collectibles
    for (const item of this.collectibles) {
      if (item.isCollected) continue;
      
      item.vy += 800 * dt; // gravidade
      item.x += item.vx * dt;
      item.y += item.vy * dt;
      item.life += dt;

      // Chão simples 
      if (item.y > 425) { 
          item.y = 425;
          item.vy = 0;
          item.vx = 0;
      }

      // Checa colisão entre o Nankin e o Item
      const iBounds = {x: item.x, y: item.y, width: item.width, height: item.height};
      if (this.checkOverlap(this.player.getBounds(), iBounds)) {
          item.isCollected = true;
          
          if (item.type === 'heart') {
              const heal = 25;
              this.player.hp = Math.min(this.player.maxHp, this.player.hp + heal);
              this.addFloatingText(this.player.x + this.player.width/2, this.player.y, "+25 HP", "#10B981");
              this.player.healingAuraTimer = 0.5;
          } else if (item.type === 'purifying_salt') {
              this.inventory.addItem({ id: item.type, name: 'Sal Purificador', description: 'Básico', type: 'COATING', icon: 'salt', count: 1 });
              this.inventory.addSalt(1);
              this.addFloatingText(this.player.x + this.player.width/2, this.player.y, "+1 Sal", "#3B82F6");
          } else if (item.type === 'holy_water') {
              this.inventory.addItem({ id: item.type, name: 'Água Benta', description: 'Básico', type: 'CONSUMABLE', icon: 'flask', count: 1 });
              this.addFloatingText(this.player.x + this.player.width/2, this.player.y, "+1 Água Benta", "#3B82F6");
          }
      }
    }
    this.collectibles = this.collectibles.filter(c => !c.isCollected && c.life < 15);

    // Atualiza Textos Flutuantes`;
if (code.includes(upAnchor)) code = code.replace(upAnchor, upInj);

// Render collectibles
const renderAnchor = `    // 4. Renderiza Inimigos`;
const renderInj = `    // 3b. Renderiza Collectibles
    if ((this.renderer as any).renderCollectibles) {
       (this.renderer as any).renderCollectibles(ctx, this.collectibles);
    }
    // 4. Renderiza Inimigos`;
if (code.includes(renderAnchor)) code = code.replace(renderAnchor, renderInj);

fs.writeFileSync('src/game/GameEngine.ts', code);
console.log('GameEngine patched for collectibles.');
