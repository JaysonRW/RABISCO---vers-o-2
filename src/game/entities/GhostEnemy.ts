/**
 * O Cavaleiro Arruinado - GhostEnemy (Espectro)
 * Inimigo que personifica o sistema de fraquezas:
 * IMUNE a dano físico comum e VULNERÁVEL ao estado "Arma com Sal"
 */

import { GAME_CONFIG } from '../config';
import { DamageType, Direction, EnemyType, Rect } from '../types';
import { Enemy } from './Enemy';
import { PenRenderer } from '../rendering/PenRenderer';

export class GhostEnemy extends Enemy {
  private initialX: number;
  private patrolDistance: number = 140;
  private attackCooldownTimer: number = 0;
  private isChasing: boolean = false;

  constructor(id: string, x: number, y: number) {
    super(
      id,
      EnemyType.GHOST,
      x,
      y,
      GAME_CONFIG.GHOST.WIDTH,
      GAME_CONFIG.GHOST.HEIGHT,
      GAME_CONFIG.GHOST.MAX_HP,
      GAME_CONFIG.GHOST.DAMAGE
    );

    this.initialX = x;

    // Configuração estrita de Fraquezas & Imunidades do GDD:
    // Espectros/Fantasmas: Imunes a ataques físicos normais. Vulneráveis a Sal e Magia Divina.
    this.immunities.add(DamageType.PHYSICAL);
    this.weaknesses.add(DamageType.SALT);
    this.weaknesses.add(DamageType.HOLY);
  }

  public update(
    dt: number,
    playerX: number,
    playerY: number,
    playerWidth: number,
    playerHeight: number,
    _platforms: Rect[]
  ): void {
    if (!this.isAlive) return;

    this.animTime += dt;

    if (this.hurtTimer > 0) {
      this.hurtTimer -= dt;
      if (this.hurtTimer <= 0) {
        this.isHurt = false;
      }
    }

    if (this.attackCooldownTimer > 0) {
      this.attackCooldownTimer -= dt;
    }

    // Aplica fricção suave de desaceleração pós-knockback
    this.vx *= 0.88;
    this.vy *= 0.88;

    // IA do Fantasma: Flutua e persegue o jogador quando perto
    const playerCenterX = playerX + playerWidth / 2;
    const playerCenterY = playerY + playerHeight / 2;
    const ghostCenterX = this.x + this.width / 2;
    const ghostCenterY = this.y + this.height / 2;

    const dx = playerCenterX - ghostCenterX;
    const dy = playerCenterY - ghostCenterY;
    const distToPlayer = Math.sqrt(dx * dx + dy * dy);

    this.isChasing = distToPlayer < GAME_CONFIG.GHOST.DETECTION_RADIUS;

    if (this.isChasing) {
      // Persegue o jogador suavemente pelo ar (fantasma atravessa obstáculos no ar)
      const targetVx = (dx / distToPlayer) * GAME_CONFIG.GHOST.CHASE_SPEED;
      const targetVy = (dy / distToPlayer) * (GAME_CONFIG.GHOST.CHASE_SPEED * 0.7);

      this.vx += (targetVx - this.vx) * 0.08;
      this.vy += (targetVy - this.vy) * 0.08;
      this.facing = dx > 0 ? Direction.RIGHT : Direction.LEFT;
    } else {
      // Patrulha flutuante ao redor da posição inicial
      const patrolOffset = Math.sin(this.animTime * 1.5) * this.patrolDistance;
      const targetX = this.initialX + patrolOffset;
      const toTarget = targetX - this.x;

      this.vx = Math.sign(toTarget) * GAME_CONFIG.GHOST.PATROL_SPEED;
      this.vy = Math.sin(this.animTime * 2.5) * 15; // flutuação senoidal suave
      this.facing = this.vx > 0 ? Direction.RIGHT : Direction.LEFT;
    }

    // Atualiza posição
    this.x += this.vx * dt;
    this.y += this.vy * dt;
  }

  public render(ctx: CanvasRenderingContext2D, renderer: PenRenderer): void {
    if (!this.isAlive) return;
    renderer.renderGhost(
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
