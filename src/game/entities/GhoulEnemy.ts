/**
 * O Cavaleiro Arruinado - GhoulEnemy (Carniçal / Zumbi Amaldiçoado)
 * Inimigo terrestre que complementa a matriz de fraqueza:
 * VULNERÁVEL a dano físico da lâmina comum e fogo!
 * Não voa; patrulha no solo e salta vorazmente quando o jogador se aproxima.
 */

import { GAME_CONFIG } from '../config';
import { DamageType, Direction, EnemyType, Rect } from '../types';
import { Enemy } from './Enemy';
import { PenRenderer } from '../rendering/PenRenderer';

export class GhoulEnemy extends Enemy {
  private initialX: number;
  private patrolMinX: number;
  private patrolMaxX: number;
  private patrolDirection: number = 1;
  private isLeaping: boolean = false;
  private leapCooldown: number = 2.0;

  constructor(id: string, x: number, y: number, patrolMinX: number = x - 120, patrolMaxX: number = x + 120) {
    super(
      id,
      EnemyType.GHOUL,
      x,
      y,
      40,
      52,
      75,
      18
    );

    this.initialX = x;
    this.patrolMinX = patrolMinX;
    this.patrolMaxX = patrolMaxX;

    // Matriz de Fraquezas & Imunidades:
    // O Carniçal é de carne putrefata:
    // - VULNERÁVEL a corte físico mortal (PHYSICAL)
    // - VULNERÁVEL a Fogo / Queimação sagrada
    // - Não tem imunidade ao Sal, mas o Sal não é sua fraqueza primária
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

    if (this.leapCooldown > 0) {
      this.leapCooldown -= dt;
    }

    const playerCenterX = playerX + playerWidth / 2;
    const ghoulCenterX = this.x + this.width / 2;
    const distToPlayer = Math.abs(playerCenterX - ghoulCenterX);
    const verticalDist = Math.abs(playerY - this.y);

    // Gravidade terrestre
    this.vy += 1200 * dt;
    if (this.vy > 650) this.vy = 650;

    // IA do Carniçal:
    // Se o jogador estiver no mesmo nível e perto (< 260px), persegue e tenta bote (salto com garra)
    if (distToPlayer < 260 && verticalDist < 120) {
      const dir = playerCenterX > ghoulCenterX ? 1 : -1;
      this.facing = dir === 1 ? Direction.RIGHT : Direction.LEFT;

      if (distToPlayer > 50) {
        this.vx = dir * 110;
      } else {
        this.vx *= 0.85;
      }

      // Ataque de investida com salto
      if (distToPlayer < 160 && this.leapCooldown <= 0 && !this.isLeaping) {
        this.vy = -380;
        this.vx = dir * 220;
        this.isLeaping = true;
        this.leapCooldown = 2.8;
      }
    } else {
      // Patrulha padrão no solo
      this.x += this.patrolDirection * 55 * dt;
      this.facing = this.patrolDirection === 1 ? Direction.RIGHT : Direction.LEFT;

      if (this.x > this.patrolMaxX) {
        this.patrolDirection = -1;
        this.x = this.patrolMaxX;
      } else if (this.x < this.patrolMinX) {
        this.patrolDirection = 1;
        this.x = this.patrolMinX;
      }
    }

    // Aplica velocidade
    this.x += this.vx * dt;
    this.y += this.vy * dt;

    // Desaceleração horizontal no chão
    this.vx *= 0.92;

    // Colisão com o solo/plataformas
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
        this.isLeaping = false;
        break;
      }
    }
  }

  public render(ctx: CanvasRenderingContext2D, renderer: PenRenderer): void {
    renderer.renderGhoul(
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
