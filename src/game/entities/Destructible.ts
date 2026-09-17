import { Rect, DamageInfo, DamageResult, ParticleShape } from '../types';
import { PenRenderer } from '../rendering/PenRenderer';
import { InventoryManager } from '../inventory/InventoryManager';
import { GAME_CONFIG } from '../config';

export class Destructible {
  public id: string;
  public type: 'box' | 'vase' | 'rubble' | 'urn';
  public x: number;
  public y: number;
  public width: number;
  public height: number;
  public hp: number;
  public isDestroyed: boolean = false;
  public isDestroying: boolean = false;
  public animTime: number = 0;
  
  constructor(id: string, type: 'box' | 'vase' | 'rubble' | 'urn', x: number, y: number) {
    this.id = id;
    this.type = type;
    this.x = x;
    this.y = y;
    
    // Set dimensions based on type
    if (type === 'box') {
      this.width = 40;
      this.height = 40;
      this.hp = 1;
    } else if (type === 'urn') {
      this.width = 30;
      this.height = 42;
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

  public takeDamage(info: DamageInfo, spawnCollectible: (type: string, x: number, y: number) => void, addParticles: (particles: any[]) => void, addFloatingText?: (x: number, y: number, text: string, color: string) => void): DamageResult {
    if (this.isDestroyed || this.isDestroying) {
      return { dealt: 0, isImmune: false, isWeakness: false, defeated: false };
    }

    this.hp -= info.amount;
    
    if (this.hp <= 0 && !this.isDestroying) {
      this.isDestroying = true;
      this.animTime = 0;
      
      // Tabela de Probabilidade de Drop (Loot Table)
      const roll = Math.random();
      let dropType = null;
      if (roll < 0.3) {
          dropType = 'heart'; // 30% chance coração
      } else if (roll < 0.6) {
          dropType = 'purifying_salt'; // 30% chance sal
      } else if (roll < 0.8) {
          dropType = 'holy_water'; // 20% chance água benta
      }

      // Se rolou um item, joga ele no mundo!
      if (dropType) {
          spawnCollectible(dropType, this.x + this.width / 2, this.y + this.height / 2);
      }

      // Explosion particles
      const newParticles = [];
      
      if (this.type === 'urn') {
        // Urn releases dust and ink/ash
        for (let i = 0; i < 12; i++) {
          const vx = (Math.random() - 0.5) * 150;
          const vy = -Math.random() * 150 - 30;
          newParticles.push({
            x: this.x + this.width / 2,
            y: this.y + this.height / 2,
            vx: vx,
            vy: vy,
            color: Math.random() > 0.5 ? '#888888' : GAME_CONFIG.PALETTE.PEN_PRIMARY,
            size: Math.random() * 8 + 4,
            life: 0,
            maxLife: 0.8 + Math.random() * 0.4,
            alpha: 0.8,
            gravity: 200,
            shape: 'ink_splatter' as ParticleShape,
            rotation: Math.random() * Math.PI * 2,
            vRot: (Math.random() - 0.5) * 2
          });
        }
      } else {
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
      }
      addParticles(newParticles);
      
      return { dealt: info.amount, isImmune: false, isWeakness: false, defeated: true };
    }
    
    return { dealt: info.amount, isImmune: false, isWeakness: false, defeated: false };
  }


  public update(dt: number) {
    if (this.isDestroying) {
      this.animTime += dt;
      if (this.animTime > 0.4) {
        this.isDestroyed = true;
        this.isDestroying = false;
      }
    }
  }

  public render(ctx: CanvasRenderingContext2D, renderer: PenRenderer): void {
    if (this.isDestroyed) return;
    renderer.drawDestructible(ctx, this);
  }
}
