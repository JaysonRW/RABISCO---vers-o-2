/**
 * O Cavaleiro Arruinado - Player Controller
 * Máquina de Estados para: IDLE, RUN, JUMP, FALL, DASH, ATTACK, USE_ITEM, HIT, DEATH
 */

import { GAME_CONFIG } from '../config';
import { DamageInfo, DamageType, Direction, PlayerState, Rect } from '../types';
import { PenRenderer } from '../rendering/PenRenderer';
import { soundManager } from '../audio/synth';

export class Player {
  public x: number;
  public y: number;
  public vx: number = 0;
  public vy: number = 0;
  public width: number = GAME_CONFIG.PLAYER.WIDTH;
  public height: number = GAME_CONFIG.PLAYER.HEIGHT;

  public state: PlayerState = PlayerState.IDLE;
  public facing: Direction = Direction.RIGHT;
  public isGrounded: boolean = false;
  public isInvulnerable: boolean = false;
  public invulnerableTimer: number = 0;

  public hp: number = GAME_CONFIG.PLAYER.MAX_HP;
  public maxHp: number = GAME_CONFIG.PLAYER.MAX_HP;
  public stamina: number = GAME_CONFIG.PLAYER.MAX_STAMINA;
  public maxStamina: number = GAME_CONFIG.PLAYER.MAX_STAMINA;

  // Timers de Ação
  public stateTimer: number = 0;
  public attackTimer: number = 0;
  public dashTimer: number = 0;
  public dashCooldownTimer: number = 0;
  public coyoteTimer: number = 0;
  public jumpBufferTimer: number = 0;
  public animTime: number = 0;

  // Pulo Duplo com Giro 360° para Frente (Spin Jump)
  public canDoubleJump: boolean = true;
  public isSpinJumping: boolean = false;
  public spinJumpTimer: number = 0;
  public spinAngle: number = 0;
  private prevJumpInput: boolean = false;

  // Flag se já acertou golpe neste ciclo de ataque (evita multi-hit no mesmo frame)
  public hasHitCurrentAttack: boolean = false;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  public update(
    dt: number,
    input: {
      left: boolean;
      right: boolean;
      jump: boolean;
      dash: boolean;
      attack: boolean;
      useSalt: boolean;
    },
    platforms: Rect[],
    hasSaltWeapon: boolean,
    onUseSaltRequest: () => void
  ) {
    if (this.state === PlayerState.DEATH) {
      this.vy += GAME_CONFIG.PLAYER.GRAVITY * dt;
      this.y += this.vy * dt;
      return;
    }

    this.animTime += dt;
    this.stateTimer += dt;

    // Recuperação de estamina
    if (this.state !== PlayerState.DASH && this.state !== PlayerState.ATTACK) {
      this.stamina = Math.min(this.maxStamina, this.stamina + 25 * dt);
    }

    // Timers
    if (this.invulnerableTimer > 0) {
      this.invulnerableTimer -= dt;
      if (this.invulnerableTimer <= 0) {
        this.isInvulnerable = false;
      }
    }
    if (this.dashCooldownTimer > 0) {
      this.dashCooldownTimer -= dt;
    }
    if (this.coyoteTimer > 0) {
      this.coyoteTimer -= dt;
    }
    if (this.jumpBufferTimer > 0) {
      this.jumpBufferTimer -= dt;
    }

    // Entrada de pulo com buffer e detecção de borda (pressionamento novo)
    const justPressedJump = input.jump && !this.prevJumpInput;
    this.prevJumpInput = input.jump;

    if (justPressedJump) {
      this.jumpBufferTimer = 0.15;
    }

    // Requisição de uso de Sal
    if (input.useSalt) {
      onUseSaltRequest();
    }

    // 1. Estados que bloqueiam movimentação normal (DASH, ATTACK, HIT)
    if (this.state === PlayerState.DASH) {
      this.handleDashState(dt, platforms);
      return;
    }

    if (this.state === PlayerState.HIT) {
      this.handleHitState(dt, platforms);
      return;
    }

    if (this.state === PlayerState.ATTACK) {
      this.handleAttackState(dt, platforms, hasSaltWeapon);
      return;
    }

    // 2. Transições para Ações Especiais
    // Tentativa de Dash / Rolamento
    if (input.dash && this.dashCooldownTimer <= 0 && this.stamina >= 25) {
      this.startDash();
      return;
    }

    // Tentativa de Ataque de Espada
    if (input.attack && this.attackTimer <= 0 && this.stamina >= 15) {
      this.startAttack(hasSaltWeapon);
      return;
    }

    // 3. Movimentação Horizontal
    let moveDir = 0;
    if (input.left) moveDir -= 1;
    if (input.right) moveDir += 1;

    if (moveDir !== 0) {
      if (!this.isSpinJumping) {
        this.facing = moveDir > 0 ? Direction.RIGHT : Direction.LEFT;
        this.vx = moveDir * GAME_CONFIG.PLAYER.MOVE_SPEED;
      } else {
        // Durante o giro de 360°, permite controle aéreo com impulso frontal
        this.vx = moveDir * (GAME_CONFIG.PLAYER.MOVE_SPEED + GAME_CONFIG.PLAYER.SPIN_JUMP_FORWARD_BOOST * 0.4);
      }
      if (this.isGrounded) {
        this.state = PlayerState.RUN;
      }
    } else {
      if (!this.isSpinJumping) {
        this.vx = 0;
      }
      if (this.isGrounded) {
        this.state = PlayerState.IDLE;
      }
    }

    // 4. Física Vertical, Pulo Normal e Pulo com Giro 360° (Spin Jump)
    if (this.isGrounded) {
      this.coyoteTimer = 0.12; // tolerância para pular logo após sair da beirada
      this.canDoubleJump = true;
      this.isSpinJumping = false;
      this.spinAngle = 0;
      this.spinJumpTimer = 0;
    }

    // Pulo Normal (do chão ou janela de coyote)
    if ((justPressedJump || this.jumpBufferTimer > 0) && this.coyoteTimer > 0) {
      this.vy = GAME_CONFIG.PLAYER.JUMP_FORCE;
      this.isGrounded = false;
      this.coyoteTimer = 0;
      this.jumpBufferTimer = 0;
      this.state = PlayerState.JUMP;
      this.canDoubleJump = true;
      soundManager.playJump();
    } else if (justPressedJump && !this.isGrounded && this.canDoubleJump) {
      // Segundo acionamento do pulo no ar: Pulo com Giro 360° para Frente
      this.startSpinJump(moveDir);
    }

    // Aplica gravidade
    this.vy = Math.min(
      GAME_CONFIG.PLAYER.MAX_FALL_SPEED,
      this.vy + GAME_CONFIG.PLAYER.GRAVITY * dt
    );

    // Atualização da rotação contínua de 360° durante o pulo
    if (this.isSpinJumping) {
      this.spinJumpTimer += dt;
      const duration = GAME_CONFIG.PLAYER.SPIN_JUMP_DURATION;
      const progress = Math.min(1, this.spinJumpTimer / duration);
      // Rotação completa de 0 a 360 graus para a frente (2 * PI radianos)
      this.spinAngle = progress * Math.PI * 2;
      this.state = PlayerState.SPIN_JUMP;

      if (progress >= 1) {
        this.isSpinJumping = false;
        this.spinAngle = 0;
        this.state = this.vy < 0 ? PlayerState.JUMP : PlayerState.FALL;
      }
    } else if (!this.isGrounded) {
      this.state = this.vy < 0 ? PlayerState.JUMP : PlayerState.FALL;
    }

    // 5. Integração e Colisão de Física
    this.moveAndCollide(dt, platforms);
  }

  private startSpinJump(moveDir: number) {
    this.canDoubleJump = false;
    this.isSpinJumping = true;
    this.spinJumpTimer = 0;
    this.spinAngle = 0;
    this.jumpBufferTimer = 0;
    this.hasHitCurrentAttack = false; // permite golpear inimigos com a lâmina girando
    this.state = PlayerState.SPIN_JUMP;
    this.vy = GAME_CONFIG.PLAYER.SPIN_JUMP_FORCE;

    // Impulso acrobático para a frente no giro de 360°
    if (moveDir !== 0) {
      this.facing = moveDir > 0 ? Direction.RIGHT : Direction.LEFT;
      this.vx = this.facing * (GAME_CONFIG.PLAYER.MOVE_SPEED + GAME_CONFIG.PLAYER.SPIN_JUMP_FORWARD_BOOST);
    } else {
      // Impulso frontal mesmo se estiver parado no ar
      this.vx = this.facing * (GAME_CONFIG.PLAYER.MOVE_SPEED * 0.75);
    }

    soundManager.playSpinJump();
  }

  private startDash() {
    this.state = PlayerState.DASH;
    this.dashTimer = GAME_CONFIG.PLAYER.DASH_DURATION;
    this.dashCooldownTimer = GAME_CONFIG.PLAYER.DASH_COOLDOWN;
    this.stamina = Math.max(0, this.stamina - 25);
    this.isInvulnerable = true;
    this.invulnerableTimer = GAME_CONFIG.PLAYER.DASH_DURATION;
    this.isSpinJumping = false;
    this.spinAngle = 0;
    this.vx = this.facing * GAME_CONFIG.PLAYER.DASH_SPEED;
    this.vy = 0;
    soundManager.playDash();
  }

  private handleDashState(dt: number, platforms: Rect[]) {
    this.dashTimer -= dt;
    this.moveAndCollide(dt, platforms);

    if (this.dashTimer <= 0) {
      this.isInvulnerable = false;
      this.state = this.isGrounded ? PlayerState.IDLE : PlayerState.FALL;
    }
  }

  private startAttack(hasSaltWeapon: boolean) {
    this.state = PlayerState.ATTACK;
    this.attackTimer = GAME_CONFIG.PLAYER.ATTACK_DURATION;
    this.hasHitCurrentAttack = false;
    this.stamina = Math.max(0, this.stamina - 15);
    this.vx *= 0.35; // reduz velocidade ao golpear
    soundManager.playSwordSlash(hasSaltWeapon);
  }

  private handleAttackState(dt: number, platforms: Rect[], _hasSaltWeapon: boolean) {
    this.attackTimer -= dt;
    this.vy = Math.min(
      GAME_CONFIG.PLAYER.MAX_FALL_SPEED,
      this.vy + GAME_CONFIG.PLAYER.GRAVITY * dt
    );
    this.moveAndCollide(dt, platforms);

    if (this.attackTimer <= 0) {
      this.state = this.isGrounded ? PlayerState.IDLE : PlayerState.FALL;
    }
  }

  private handleHitState(dt: number, platforms: Rect[]) {
    this.vy = Math.min(
      GAME_CONFIG.PLAYER.MAX_FALL_SPEED,
      this.vy + GAME_CONFIG.PLAYER.GRAVITY * dt
    );
    this.vx *= 0.85;
    this.moveAndCollide(dt, platforms);

    if (this.invulnerableTimer <= 0.3) {
      this.state = this.isGrounded ? PlayerState.IDLE : PlayerState.FALL;
    }
  }

  // Resolução de colisão AABB sólida com plataformas
  private moveAndCollide(dt: number, platforms: Rect[]) {
    // 1. Eixo X
    this.x += this.vx * dt;
    let playerRect = this.getBounds();

    for (const plat of platforms) {
      if (this.checkCollision(playerRect, plat)) {
        if (this.vx > 0) {
          this.x = plat.x - this.width;
        } else if (this.vx < 0) {
          this.x = plat.x + plat.width;
        }
        this.vx = 0;
        break;
      }
    }

    // 2. Eixo Y
    this.y += this.vy * dt;
    playerRect = this.getBounds();
    this.isGrounded = false;

    for (const plat of platforms) {
      if (this.checkCollision(playerRect, plat)) {
        if (this.vy > 0) {
          // Aterrissou no topo da plataforma
          this.y = plat.y - this.height;
          this.vy = 0;
          this.isGrounded = true;
          this.canDoubleJump = true;
          this.isSpinJumping = false;
          this.spinAngle = 0;
          this.spinJumpTimer = 0;
        } else if (this.vy < 0) {
          // Bateu a cabeça no teto
          this.y = plat.y + plat.height;
          this.vy = 0;
        }
        break;
      }
    }
  }

  private checkCollision(r1: Rect, r2: Rect): boolean {
    return (
      r1.x < r2.x + r2.width &&
      r1.x + r1.width > r2.x &&
      r1.y < r2.y + r2.height &&
      r1.y + r1.height > r2.y
    );
  }

  // Caixa de ataque (hitbox da espada e do giro de 360°)
  public getAttackHitbox(): Rect | null {
    if (this.state === PlayerState.ATTACK) {
      const range = GAME_CONFIG.PLAYER.ATTACK_RANGE;
      return {
        x: this.facing === Direction.RIGHT ? this.x + this.width : this.x - range,
        y: this.y + 12,
        width: range,
        height: this.height - 20,
      };
    }

    if (this.isSpinJumping || this.state === PlayerState.SPIN_JUMP) {
      // Área circular/ampla de corte do giro acrobático 360° em volta do cavaleiro
      const margin = 18;
      return {
        x: this.x - margin,
        y: this.y - margin,
        width: this.width + margin * 2,
        height: this.height + margin * 2,
      };
    }

    return null;
  }

  public takeDamage(damage: number, sourceX: number) {
    if (this.isInvulnerable || this.state === PlayerState.DEATH) return;

    this.hp = Math.max(0, this.hp - damage);
    this.isInvulnerable = true;
    this.invulnerableTimer = GAME_CONFIG.PLAYER.INVULNERABLE_TIME;
    this.state = PlayerState.HIT;
    this.attackTimer = 0;
    this.dashTimer = 0;
    this.isSpinJumping = false;
    this.spinAngle = 0;

    // Knockback para longe da fonte
    const knockbackDir = this.x > sourceX ? 1 : -1;
    this.vx = knockbackDir * 240;
    this.vy = -260;

    soundManager.playHitImpact();

    if (this.hp <= 0) {
      this.state = PlayerState.DEATH;
      this.vx = 0;
      this.vy = -180;
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

  public render(ctx: CanvasRenderingContext2D, renderer: PenRenderer, hasSaltWeapon: boolean) {
    renderer.renderPlayer(
      ctx,
      this.x,
      this.y,
      this.width,
      this.height,
      this.state,
      this.facing,
      this.animTime,
      hasSaltWeapon,
      this.isInvulnerable,
      this.spinAngle,
      this.isSpinJumping
    );
  }
}
