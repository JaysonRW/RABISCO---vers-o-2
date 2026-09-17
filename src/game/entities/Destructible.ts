import { Rect, DamageInfo, DamageResult, ParticleShape } from '../types';
import { PenRenderer } from '../rendering/PenRenderer';
import { InventoryManager } from '../inventory/InventoryManager';
import { GAME_CONFIG } from '../config';
import { rollLoot } from '../utils/LootSystem';

export class Destructible {
  public id: string;
  public type: 'box' | 'vase' | 'rubble' | 'urn' | 'bone_wall';
  public x: number;
  public y: number;
  public width: number;
  public height: number;
  public hp: number;
  public isDestroyed: boolean = false;
  public isDestroying: boolean = false;
  public animTime: number = 0;
  public vx: number = 0;
  public vy: number = 0;
  public isGrounded: boolean = true;
  public mass: number = 1;
  
  constructor(id: string, type: 'box' | 'vase' | 'rubble' | 'urn' | 'bone_wall', x: number, y: number) {
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
    } else if (type === 'bone_wall') {
      this.width = 46;
      this.height = 36;
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
      
      // Usa o novo sistema de loot (baseado no ItemDatabase)
      let dropType = rollLoot();

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
      } else if (this.type === 'bone_wall') {
        if (!dropType) {
           dropType = 'gota_essencia'; // always drop at least a drop if bad roll
           spawnCollectible(dropType, this.x + this.width / 2, this.y + this.height / 2);
        }
        
        // Shoot 1 skull
        newParticles.push({
          x: this.x + this.width / 2,
          y: this.y + 5,
          vx: (Math.random() - 0.5) * 150,
          vy: -200 - Math.random() * 100,
          color: '#E0E0E0',
          size: 14,
          life: 0,
          maxLife: 1.5,
          alpha: 1.0,
          gravity: 800,
          shape: 'skull' as ParticleShape,
          rotation: Math.random() * Math.PI * 2,
          vRot: (Math.random() - 0.5) * 8
        });

        // Shoot multiple bones
        for (let i = 0; i < 8; i++) {
          const vx = (Math.random() - 0.5) * 300;
          const vy = -Math.random() * 250 - 100;
          newParticles.push({
            x: this.x + this.width / 2,
            y: this.y + Math.random() * this.height,
            vx: vx,
            vy: vy,
            color: '#F5F5DC',
            size: Math.random() * 4 + 8,
            life: 0,
            maxLife: 1.0 + Math.random() * 0.5,
            alpha: 1.0,
            gravity: 800,
            shape: 'bone' as ParticleShape,
            rotation: Math.random() * Math.PI * 2,
            vRot: (Math.random() - 0.5) * 15
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


  public update(dt: number, platforms?: Rect[]) {
    if (this.isDestroying) {
      this.animTime += dt;
      if (this.animTime > 0.4) {
        this.isDestroyed = true;
        this.isDestroying = false;
      }
      return;
    }

    if (this.type === 'box') {
      // Apply gravity
      this.vy += 800 * dt;
      this.vy = Math.min(this.vy, 400); // max fall speed
      
      // X Movement
      this.x += this.vx * dt;
      
      if (platforms) {
          for (const plat of platforms) {
             // Basic collision check
             if (this.x < plat.x + plat.width &&
                 this.x + this.width > plat.x &&
                 this.y < plat.y + plat.height &&
                 this.y + this.height > plat.y) {
                 
                 if (this.vx > 0) {
                     this.x = plat.x - this.width;
                 } else if (this.vx < 0) {
                     this.x = plat.x + plat.width;
                 }
                 this.vx = 0;
             }
          }
      }

      // Y Movement
      this.y += this.vy * dt;
      this.isGrounded = false;
      
      if (platforms) {
          for (const plat of platforms) {
             if (this.x < plat.x + plat.width &&
                 this.x + this.width > plat.x &&
                 this.y < plat.y + plat.height &&
                 this.y + this.height > plat.y) {
                 
                 if (this.vy > 0) {
                     this.y = plat.y - this.height;
                     this.vy = 0;
                     this.isGrounded = true;
                 } else if (this.vy < 0) {
                     this.y = plat.y + plat.height;
                     this.vy = 0;
                 }
             }
          }
      }

      // Friction
      if (this.isGrounded) {
         if (this.vx > 0) {
             this.vx -= 400 * dt;
             if (this.vx < 0) this.vx = 0;
         } else if (this.vx < 0) {
             this.vx += 400 * dt;
             if (this.vx > 0) this.vx = 0;
         }
      }
    }
  }

  public render(ctx: CanvasRenderingContext2D, renderer: PenRenderer): void {
    if (this.isDestroyed) return;
    renderer.drawDestructible(ctx, this);
  }
}
