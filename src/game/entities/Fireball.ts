import { Rect, Direction } from '../types';

export class Fireball {
  public x: number;
  public y: number;
  public vx: number;
  public vy: number;
  public radius: number = 15;
  public damage: number;
  public isDestroyed: boolean = false;
  public facing: Direction;
  public animTime: number = 0;

  constructor(x: number, y: number, facing: Direction, damage: number) {
    this.x = x;
    this.y = y;
    this.facing = facing;
    this.vx = facing === Direction.RIGHT ? 350 : -350;
    this.vy = 0;
    this.damage = damage;
  }

  public update(dt: number) {
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.animTime += dt;
  }

  public getBounds(): Rect {
    return {
      x: this.x - this.radius,
      y: this.y - this.radius,
      width: this.radius * 2,
      height: this.radius * 2
    };
  }
}
