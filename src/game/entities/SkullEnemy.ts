/**
 * O Cavaleiro Arruinado - SkullEnemy (Caveira Flutuante)
 * Inimigo estático, flutuante e destrutível.
 */
import { GAME_CONFIG } from '../config';
import { EnemyType, Rect } from '../types';
import { Enemy } from './Enemy';
import { PenRenderer } from '../rendering/PenRenderer';

export class SkullEnemy extends Enemy {
  private initialY: number;
  private floatTime: number = 0;

  constructor(id: string, x: number, y: number) {
    super(
      id,
      EnemyType.SKULL,
      x,
      y,
      GAME_CONFIG.SKULL.WIDTH,
      GAME_CONFIG.SKULL.HEIGHT,
      GAME_CONFIG.SKULL.MAX_HP,
      GAME_CONFIG.SKULL.DAMAGE
    );
    this.initialY = y;
    this.floatTime = Math.random() * Math.PI * 2;
  }

  public update(dt: number, _platforms: Rect[], _playerBounds: Rect) {
    if (!this.isAlive) return;

    if (this.isHurt) {
      this.hurtTimer -= dt;
      if (this.hurtTimer <= 0) {
        this.isHurt = false;
      }
    }

    this.animTime += dt;
    this.floatTime += dt * 3;
    
    // Flutuando suavemente
    this.y = this.initialY + Math.sin(this.floatTime) * 6;
  }

  public render(ctx: CanvasRenderingContext2D, renderer: PenRenderer) {
    if (!this.isAlive) return;
    renderer.renderSkull(
      ctx,
      this.x,
      this.y,
      this.width,
      this.height,
      this.facing,
      this.animTime,
      this.hp,
      this.maxHp,
      this.isHurt
    );
  }
}
