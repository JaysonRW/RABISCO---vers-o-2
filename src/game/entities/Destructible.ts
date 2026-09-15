import { Rect, DamageInfo, DamageResult, ParticleShape } from '../types';
import { PenRenderer } from '../rendering/PenRenderer';
import { InventoryManager } from '../inventory/InventoryManager';
import { GAME_CONFIG } from '../config';

export class Destructible {
  public id: string;
  public type: 'box' | 'vase' | 'rubble';
  public x: number;
  public y: number;
  public width: number;
  public height: number;
  public hp: number;
  public isDestroyed: boolean = false;
  
  constructor(id: string, type: 'box' | 'vase' | 'rubble', x: number, y: number) {
    this.id = id;
    this.type = type;
    this.x = x;
    this.y = y;
    
    // Set dimensions based on type
    if (type === 'box') {
      this.width = 30;
      this.height = 30;
      this.hp = 1;
    } else if (type === 'vase') {
      this.width = 20;
      this.height = 28;
      this.hp = 1;
    } else {
      this.width = 40;
      this.height = 24;
      this.hp = 1;
    }
  }

  public getBounds(): Rect {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
    };
  }

  public takeDamage(info: DamageInfo, inventory: InventoryManager, addParticles: (particles: any[]) => void, addFloatingText?: (x: number, y: number, text: string, color: string) => void): DamageResult {
    if (this.isDestroyed) {
      return { dealt: 0, isImmune: false, isWeakness: false, defeated: false };
    }

    this.hp -= info.amount;
    
    if (this.hp <= 0) {
      this.isDestroyed = true;
      
      // Drop an item
      const drops = ['purifying_salt', 'holy_water'];
      const randomDrop = drops[Math.floor(Math.random() * drops.length)];
      
      const isSalt = randomDrop === 'purifying_salt';
      const itemName = isSalt ? 'Sal Purificador' : 'Água Benta';
      
      inventory.addItem({
        id: randomDrop, // Use the EXACT id so they stack correctly in inventory
        name: itemName,
        description: 'Recurso caído dos escombros.',
        type: isSalt ? 'COATING' : 'CONSUMABLE',
        icon: isSalt ? 'salt' : 'flask',
        count: 1
      });
      
      if (isSalt) {
        inventory.addSalt(1); // Force sync the salt count variable
      }

      if (addFloatingText) {
        addFloatingText(this.x + this.width / 2, this.y - 20, `+1 ${itemName}`, GAME_CONFIG.PALETTE.PEN_PRIMARY);
      }


      // Explosion particles
      const newParticles = [];
      for (let i = 0; i < 8; i++) {
        const vx = (Math.random() - 0.5) * 200;
        const vy = -Math.random() * 200 - 50;
        newParticles.push({
          x: this.x + this.width / 2,
          y: this.y + this.height / 2,
          vx: vx,
          vy: vy,
          color: GAME_CONFIG.PALETTE.PEN_PRIMARY,
          size: Math.random() * 4 + 2,
          life: 0,
          maxLife: 1.0 + Math.random() * 0.5,
          alpha: 1.0,
          gravity: 800,
          shape: 'pen_scratch' as ParticleShape,
          rotation: Math.random() * Math.PI * 2,
          vRot: (Math.random() - 0.5) * 10
        });
      }
      addParticles(newParticles);
      
      return { dealt: info.amount, isImmune: false, isWeakness: false, defeated: true };
    }
    
    return { dealt: info.amount, isImmune: false, isWeakness: false, defeated: false };
  }

  public render(ctx: CanvasRenderingContext2D, renderer: PenRenderer): void {
    if (this.isDestroyed) return;
    renderer.drawDestructible(ctx, this);
  }
}
