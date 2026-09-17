import { DamageType, Direction, EnemyType, Rect } from '../types';
import { Enemy } from './Enemy';
import { PenRenderer } from '../rendering/PenRenderer';

export class ZombieEnemy extends Enemy {
  private patrolDirection: number = 1;

  constructor(id: string, x: number, y: number) {
    super(
      id,
      EnemyType.ZOMBIE,
      x,
      y,
      36,
      48,
      15, // Pouco HP
      10
    );

    this.weaknesses.add(DamageType.PHYSICAL);
    this.weaknesses.add(DamageType.FIRE);
  }

  public update(
    dt: number,
    playerX: number,
    playerY: number,
    playerWidth: number,
    playerHeight: number,
    platforms: Rect[]
  ): void {
    if (!this.isAlive) return;

    this.animTime += dt;

    if (this.hurtTimer > 0) {
      this.hurtTimer -= dt;
      if (this.hurtTimer <= 0) {
        this.isHurt = false;
      }
    }

    const playerCenterX = playerX + playerWidth / 2;
    const zombieCenterX = this.x + this.width / 2;
    const distToPlayer = Math.abs(playerCenterX - zombieCenterX);
    const verticalDist = Math.abs(playerY - this.y);

    // Gravidade terrestre
    this.vy += 1200 * dt;
    if (this.vy > 650) this.vy = 650;

    // Persegue o jogador se ele estiver perto
    if (distToPlayer < 400 && verticalDist < 120) {
      const dir = playerCenterX > zombieCenterX ? 1 : -1;
      this.facing = dir === 1 ? Direction.RIGHT : Direction.LEFT;
      this.vx = dir * 30;
    } else {
      // Patrulha padrão no solo
      this.x += this.patrolDirection * 15 * dt;
      this.facing = this.patrolDirection === 1 ? Direction.RIGHT : Direction.LEFT;
      
      // Muda de direção aleatoriamente ou em buracos (simulado)
      if (Math.random() < 0.01) {
        this.patrolDirection *= -1;
      }
    }

    this.x += this.vx * dt;
    this.y += this.vy * dt;

    this.vx *= 0.92;

    let onGround = false;
    for (const plat of platforms) {
      if (
        this.x + this.width > plat.x &&
        this.x < plat.x + plat.width &&
        this.y + this.height >= plat.y &&
        this.y + this.height <= plat.y + 24 &&
        this.vy >= 0
      ) {
        this.y = plat.y - this.height;
        this.vy = 0;
        onGround = true;
        break;
      }
    }
    
    // Vira se encontrar parede ou abismo se estiver patrulhando (simples)
    if (!onGround && this.vy > 0 && distToPlayer >= 400) {
        this.patrolDirection *= -1;
        this.x += this.patrolDirection * 5;
    }
  }

  public render(ctx: CanvasRenderingContext2D, renderer: PenRenderer): void {
    renderer.renderZombie(
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
