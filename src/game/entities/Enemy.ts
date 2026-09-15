/**
 * O Cavaleiro Arruinado - Base Enemy Class
 * Arquitetura de Inimigos com Sistema de Fraquezas e Resistências
 */

import { DamageInfo, DamageResult, DamageType, Direction, EnemyType, Rect } from '../types';
import { PenRenderer } from '../rendering/PenRenderer';

export abstract class Enemy {
  public id: string;
  public type: EnemyType;
  public x: number;
  public y: number;
  public vx: number = 0;
  public vy: number = 0;
  public width: number;
  public height: number;
  public hp: number;
  public maxHp: number;
  public damage: number;
  public facing: Direction = Direction.LEFT;
  public isAlive: boolean = true;
  public isHurt: boolean = false;
  public hurtTimer: number = 0;
  public animTime: number = 0;

  // Matriz de Fraquezas e Imunidades (Pedra, Papel e Tesoura avançado do GDD)
  public weaknesses: Set<DamageType> = new Set();
  public immunities: Set<DamageType> = new Set();

  constructor(
    id: string,
    type: EnemyType,
    x: number,
    y: number,
    width: number,
    height: number,
    hp: number,
    damage: number
  ) {
    this.id = id;
    this.type = type;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.hp = hp;
    this.maxHp = hp;
    this.damage = damage;
  }

  // Processa dano aplicando o sistema de fraquezas e imunidades do GDD
  public takeDamage(info: DamageInfo): DamageResult {
    if (!this.isAlive) {
      return { dealt: 0, isImmune: false, isWeakness: false, defeated: false };
    }

    // 1. Verificação de Imunidade Absoluta
    if (this.immunities.has(info.type)) {
      return {
        dealt: 0,
        isImmune: true,
        isWeakness: false,
        defeated: false,
      };
    }

    // 2. Verificação de Fraqueza Crítica
    let finalDamage = info.amount;
    const isWeakness = this.weaknesses.has(info.type);

    if (isWeakness) {
      finalDamage = Math.round(info.amount * 2.2); // Dano massivo por fraqueza elementar
    }

    this.hp = Math.max(0, this.hp - finalDamage);
    this.isHurt = true;
    this.hurtTimer = 0.25;

    // Knockback
    this.vx = info.knockback.x;
    this.vy = info.knockback.y;

    const defeated = this.hp <= 0;
    if (defeated) {
      this.isAlive = false;
    }

    return {
      dealt: finalDamage,
      isImmune: false,
      isWeakness,
      defeated,
    };
  }

  public getBounds(): Rect {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
    };
  }

  public abstract update(
    dt: number,
    playerX: number,
    playerY: number,
    playerWidth: number,
    playerHeight: number,
    platforms: Rect[]
  ): void;

  public abstract render(ctx: CanvasRenderingContext2D, renderer: PenRenderer): void;
}
