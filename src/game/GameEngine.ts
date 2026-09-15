/**
 * O Cavaleiro Arruinado - Game Engine Core
 * Loop Principal, Câmera, Física, Partículas e Resolução de Combate
 */

import { GAME_CONFIG } from './config';
import { Player } from './entities/Player';
import { Enemy } from './entities/Enemy';
import { GhostEnemy } from './entities/GhostEnemy';
import { GhoulEnemy } from './entities/GhoulEnemy';
import { NPC, DialogChoice } from './entities/NPC';
import { Destructible } from './entities/Destructible';
import { Level } from './world/Level';
import { PenRenderer } from './rendering/PenRenderer';
import { InventoryManager } from './inventory/InventoryManager';
import { AscensionStats, DamageInfo, DamageType, EnemyType, FloatingText, Particle, PlayerState, Rect, SoulOrb } from './types';
import { soundManager } from './audio/synth';
import { SectionManager } from './world/SectionManager';
import { SectionData, SECTIONS_DATA } from './world/Section';

export interface GameEngineCallbacks {
  onStatsUpdate: (stats: {
    hp: number;
    maxHp: number;
    stamina: number;
    maxStamina: number;
    hasSaltWeapon: boolean;
    saltDuration: number;
    saltCount: number;
    playerState: PlayerState;
    enemiesAlive: number;
    ascension: AscensionStats;
    currentSection?: {
      id: string;
      name: string;
      subtitle: string;
    };
  }) => void;
  onOpenNpcDialog?: (npc: NPC) => void;
}

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private renderer: PenRenderer;

  public player: Player;
  public enemies: Enemy[] = [];
  public npcs: NPC[] = [];
  public destructibles: Destructible[] = [];
  public activeNpcNearby: NPC | null = null;
  public level: Level;
  public inventory: InventoryManager;
  public sectionManager: SectionManager;

  // Sistema de Almas & Ascensão Espiritual
  public soulOrbs: SoulOrb[] = [];
  private nextSoulId: number = 1;
  public totalSoulsCollected: number = 0;
  public ascensionLevel: number = 0;
  public ascensionSoulsCurrentLevel: number = 0;
  public ascensionSoulsNeeded: number = GAME_CONFIG.ASCENSION.SOULS_BASE_REQ;
  public ascensionFlashTimer: number = 0;
  private enemyRespawnQueue: { x: number; y: number; timer: number; id: string }[] = [];

  // Câmera
  public cameraX: number = 0;
  public cameraY: number = 0;

  // Sistemas de Efeitos Visuais
  public particles: Particle[] = [];
  public floatingTexts: FloatingText[] = [];
  private nextTextId: number = 1;

  // Estado de Entrada (Input)
  public input = {
    left: false,
    right: false,
    jump: false,
    dash: false,
    attack: false,
    useSalt: false,
    interact: false,
  };

  private isRunning: boolean = false;
  private lastTime: number = 0;
  private animFrameId: number | null = null;
  private callbacks: GameEngineCallbacks;

  // Screen shake para impactos
  private screenShakeTime: number = 0;
  private screenShakeIntensity: number = 0;

  constructor(canvas: HTMLCanvasElement, callbacks: GameEngineCallbacks) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Não foi possível obter o contexto 2D do canvas.');
    }
    this.ctx = context;
    this.callbacks = callbacks;

    this.renderer = new PenRenderer();
    this.inventory = new InventoryManager();

    // Inicializa Gerenciador de Seções do Mapa (Pátio do Mosteiro como ponto inicial)
    this.sectionManager = new SectionManager('monastery_courtyard');
    this.level = new Level(this.sectionManager.currentSection);

    // Inicia Jogador
    this.player = new Player(100, 360);

    // Configura Callback de Transição entre Seções
    this.setupSectionTransitions();

    // Spawna NPCs e Inimigos da Seção Ativa
    this.spawnNPCs();
    this.spawnEnemies();
  }

  /**
   * Configura o ouvinte de troca de seção com reposicionamento suave de câmera
   */
  public setupSectionTransitions() {
    this.sectionManager.setOnSectionSwitched((section, targetX, targetY, dir) => {
      // 1. Carrega dados geométricos e decorativos da nova seção no Level
      this.level.loadSection(section);

      // 2. Reposiciona o Cavaleiro no novo ponto de chegada
      this.player.x = targetX;
      this.player.y = targetY;
      this.player.facing = dir;
      this.player.vx = 0;
      this.player.vy = 0;

      // 3. Reposiciona a câmera imediatamente para centralizar o jogador e respeitar os limites
      this.cameraX = Math.max(0, Math.min(this.level.width - GAME_CONFIG.CANVAS_WIDTH, this.player.x - GAME_CONFIG.CANVAS_WIDTH / 2));

      // 4. Carrega população de Inimigos e NPCs correspondentes à nova seção
      this.loadSectionEnemies(section);
      this.loadSectionNPCs(section);
      this.loadSectionDestructibles(section);
      this.enemyRespawnQueue = [];
    });
  }

  public loadSectionDestructibles(section: SectionData) {
    this.destructibles = (section.destructibles || []).map(cfg => {
      return new Destructible(cfg.id, cfg.type, cfg.x, cfg.y);
    });
  }

  public loadSectionNPCs(section: SectionData) {
    this.npcs = section.npcConfigs.map(cfg => {
      return new NPC(cfg.id, cfg.name, cfg.title, cfg.x, cfg.y, cfg.dialogs, cfg.role);
    });
  }

  public loadSectionEnemies(section: SectionData) {
    this.enemies = section.enemySpawns.map(cfg => {
      if (cfg.type === 'GHOUL') {
        return new GhoulEnemy(cfg.id, cfg.x, cfg.y, cfg.patrolMinX, cfg.patrolMaxX);
      } else {
        return new GhostEnemy(cfg.id, cfg.x, cfg.y);
      }
    });
  }

  public spawnNPCs() {
    this.loadSectionNPCs(this.sectionManager.currentSection);
    this.loadSectionDestructibles(this.sectionManager.currentSection);
  }

  public spawnEnemies() {
    this.loadSectionEnemies(this.sectionManager.currentSection);
  }

  public start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastTime = performance.now();
    this.loop(this.lastTime);
  }

  public stop() {
    this.isRunning = false;
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }

  public resetGame() {
    this.sectionManager = new SectionManager('monastery_courtyard');
    this.setupSectionTransitions();
    this.player = new Player(100, 360);
    this.inventory = new InventoryManager();
    this.level = new Level(this.sectionManager.currentSection);
    this.particles = [];
    this.floatingTexts = [];
    this.soulOrbs = [];
    this.totalSoulsCollected = 0;
    this.ascensionLevel = 0;
    this.ascensionSoulsCurrentLevel = 0;
    this.ascensionSoulsNeeded = GAME_CONFIG.ASCENSION.SOULS_BASE_REQ;
    this.ascensionFlashTimer = 0;
    this.enemyRespawnQueue = [];
    this.cameraX = 0;
    this.spawnNPCs();
    this.spawnEnemies();
  }

  /**
   * Permite transição manual ou via interface/viagem rápida entre seções
   */
  public switchSection(sectionId: string, spawnSide: 'LEFT' | 'RIGHT' = 'LEFT') {
    this.sectionManager.startTransition(sectionId, spawnSide);
  }

  public getCurrentAscensionInfo() {
    const infos = GAME_CONFIG.ASCENSION.LEVEL_INFO;
    const current = infos.find((i) => i.level === this.ascensionLevel) || infos[infos.length - 1];
    return current;
  }

  public getAscensionStats(): AscensionStats {
    const info = this.getCurrentAscensionInfo();
    const progressPercent = Math.min(
      100,
      Math.round((this.ascensionSoulsCurrentLevel / this.ascensionSoulsNeeded) * 100)
    );
    return {
      souls: this.totalSoulsCollected,
      soulsCurrentLevel: this.ascensionSoulsCurrentLevel,
      soulsNeededForNext: this.ascensionSoulsNeeded,
      level: this.ascensionLevel,
      progressPercent,
      title: info.title,
      bonusText: info.bonusText,
      damageMultiplier: info.damageMult,
    };
  }

  /**
   * Spawna Almas Espectrais ao derrotar um inimigo
   */
  public spawnSoulsFromEnemy(enemy: Enemy) {
    const orbCount = 3; // 3 almas por espectro
    const centerX = enemy.x + enemy.width / 2;
    const centerY = enemy.y + enemy.height / 2;

    for (let i = 0; i < orbCount; i++) {
      const angle = (i * Math.PI * 2) / orbCount + (Math.random() - 0.5) * 0.6;
      const speed = 80 + Math.random() * 70;
      this.soulOrbs.push({
        id: this.nextSoulId++,
        x: centerX,
        y: centerY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 65, // leve impulso para cima
        value: 1,
        life: 25.0,
        maxLife: 25.0,
        animTime: Math.random() * 5,
        collected: false,
      });
    }

    // Partículas ciano de desmaterialização espectral
    for (let i = 0; i < 16; i++) {
      this.addParticle({
        x: centerX,
        y: centerY,
        vx: (Math.random() - 0.5) * 160,
        vy: -Math.random() * 120 - 20,
        color: i % 2 === 0 ? GAME_CONFIG.PALETTE.FX_SOUL_CYAN : GAME_CONFIG.PALETTE.FX_SOUL_AURA,
        size: 2.5 + Math.random() * 2,
        life: 0.6 + Math.random() * 0.4,
        maxLife: 1.0,
        alpha: 1,
        shape: 'spark',
      });
    }
  }

  /**
   * Absorção de Alma pelo Cavaleiro
   */
  private collectSoul(orb: SoulOrb) {
    this.totalSoulsCollected += orb.value;
    this.ascensionSoulsCurrentLevel += orb.value;

    soundManager.playSoulAbsorb();

    // Partículas de absorção
    const pX = this.player.x + this.player.width / 2;
    const pY = this.player.y + this.player.height / 2;

    for (let i = 0; i < 8; i++) {
      this.addParticle({
        x: pX,
        y: pY,
        vx: (Math.random() - 0.5) * 110,
        vy: (Math.random() - 0.5) * 110,
        color: i % 2 === 0 ? GAME_CONFIG.PALETTE.FX_SOUL_CYAN : GAME_CONFIG.PALETTE.FX_SOUL_CORE,
        size: 2 + Math.random() * 2,
        life: 0.4,
        maxLife: 0.4,
        alpha: 1,
        shape: 'spark',
      });
    }

    this.addFloatingText(
      pX,
      pY - 20,
      `+${orb.value} ALMA`,
      GAME_CONFIG.PALETTE.FX_SOUL_CYAN,
      1.15
    );

    // Verifica se completou a barra de Ascensão!
    if (this.ascensionSoulsCurrentLevel >= this.ascensionSoulsNeeded) {
      this.triggerAscensionLevelUp();
    }
  }

  /**
   * Elevação de Nível de Ascensão
   */
  private triggerAscensionLevelUp() {
    if (this.ascensionLevel >= GAME_CONFIG.ASCENSION.MAX_LEVEL) {
      this.ascensionSoulsCurrentLevel = this.ascensionSoulsNeeded;
      return;
    }

    const overflow = this.ascensionSoulsCurrentLevel - this.ascensionSoulsNeeded;
    this.ascensionLevel += 1;
    this.ascensionSoulsCurrentLevel = Math.max(0, overflow);
    this.ascensionSoulsNeeded = Math.round(
      GAME_CONFIG.ASCENSION.SOULS_BASE_REQ *
        Math.pow(GAME_CONFIG.ASCENSION.SOULS_SCALE_MULTIPLIER, this.ascensionLevel)
    );

    this.ascensionFlashTimer = 1.0;
    soundManager.playAscensionLevelUp();
    this.triggerScreenShake(0.35, 9);

    // Cura o jogador e restaura estamina com a bênção da Ascensão
    this.player.hp = Math.min(this.player.maxHp, this.player.hp + 40);
    this.player.stamina = this.player.maxStamina;

    const levelInfo = this.getCurrentAscensionInfo();
    const pX = this.player.x + this.player.width / 2;
    const pY = this.player.y;

    this.addFloatingText(
      pX,
      pY - 45,
      `★ ASCENSÃO ALCANÇADA: GRAU ${this.ascensionLevel} ★`,
      GAME_CONFIG.PALETTE.FX_HOLY_GOLD,
      1.5
    );

    this.addFloatingText(
      pX,
      pY - 25,
      levelInfo.title.toUpperCase(),
      GAME_CONFIG.PALETTE.FX_HOLY_WHITE,
      1.2
    );

    // Explosão celestial grandiosa de partículas em toda a arena
    for (let i = 0; i < 40; i++) {
      this.addParticle({
        x: pX + (Math.random() - 0.5) * 50,
        y: pY + (Math.random() - 0.5) * 60,
        vx: (Math.random() - 0.5) * 280,
        vy: -Math.random() * 220 - 40,
        color:
          i % 3 === 0
            ? GAME_CONFIG.PALETTE.FX_HOLY_GOLD
            : i % 3 === 1
            ? GAME_CONFIG.PALETTE.FX_SOUL_CYAN
            : GAME_CONFIG.PALETTE.FX_HOLY_WHITE,
        size: 3 + Math.random() * 3,
        life: 0.9 + Math.random() * 0.5,
        maxLife: 1.4,
        alpha: 1,
        gravity: 80,
        shape: i % 2 === 0 ? 'cross' : 'spark',
      });
    }
  }

  /**
   * Enfileira renascimento de inimigos para manter o ciclo de combate e colheita
   */
  private queueEnemyRespawn(enemy: Enemy) {
    const spawnConfig = this.sectionManager.currentSection.enemySpawns.find(s => s.id === enemy.id);
    const spawnX = spawnConfig ? spawnConfig.x : Math.max(120, Math.min(this.level.width - 120, enemy.x));
    const spawnY = spawnConfig ? spawnConfig.y : 220;
    this.enemyRespawnQueue.push({
      x: spawnX,
      y: spawnY,
      timer: 5.5,
      id: enemy.id,
    });
  }

  public triggerUseSalt(): boolean {
    const success = this.inventory.useSaltCoating(GAME_CONFIG.PLAYER.SALT_COATING_DURATION);
    if (success) {
      soundManager.playSaltApply();

      // Gera partículas sagradas ao redor do cavaleiro
      for (let i = 0; i < 20; i++) {
        this.addParticle({
          x: this.player.x + this.player.width / 2 + (Math.random() - 0.5) * 30,
          y: this.player.y + this.player.height / 2 + (Math.random() - 0.5) * 40,
          vx: (Math.random() - 0.5) * 90,
          vy: -Math.random() * 80 - 20,
          color: i % 2 === 0 ? GAME_CONFIG.PALETTE.FX_HOLY_GOLD : GAME_CONFIG.PALETTE.FX_HOLY_WHITE,
          size: 3 + Math.random() * 2,
          life: 0.6 + Math.random() * 0.4,
          maxLife: 1.0,
          alpha: 1,
          shape: 'cross',
        });
      }

      this.addFloatingText(
        this.player.x + this.player.width / 2,
        this.player.y - 12,
        'LÂMINA IMBUÍDA COM SAL!',
        GAME_CONFIG.PALETTE.FX_HOLY_GOLD,
        1.2
      );
    }
    return success;
  }

  private loop = (time: number) => {
    if (!this.isRunning) return;

    const dt = Math.min((time - this.lastTime) / 1000, 0.05); // trava dt máximo para evitar saltos
    this.lastTime = time;

    this.update(dt);
    this.render(dt);

    this.animFrameId = requestAnimationFrame(this.loop);
  };

  private update(dt: number) {
    // 0. Atualiza Gerenciador de Seções e Transições do Mapa
    this.sectionManager.update(dt, this.player);
    if (this.sectionManager.isTransitioning) {
      // Amortece movimento durante a dissolução de tela
      this.player.vx *= 0.4;
    }

    // 1. Atualiza Inventário & Duração do Sal
    this.inventory.update(dt);

    // 2. Atualiza Jogador
    this.player.update(
      dt,
      this.input,
      this.level.platforms,
      this.inventory.hasSaltCoating,
      () => this.triggerUseSalt()
    );

    // 2a. Atualiza NPCs e detecta proximidade para interação [E]
    const pCenterX = this.player.x + this.player.width / 2;
    const pCenterY = this.player.y + this.player.height / 2;
    this.activeNpcNearby = null;

    for (const npc of this.npcs) {
      npc.update(dt);
      const npcCenterX = npc.x + npc.width / 2;
      const npcCenterY = npc.y + npc.height / 2;
      const dist = Math.sqrt(
        (pCenterX - npcCenterX) * (pCenterX - npcCenterX) +
        (pCenterY - npcCenterY) * (pCenterY - npcCenterY)
      );

      if (dist < 85) {
        this.activeNpcNearby = npc;
        if (this.input.interact && this.callbacks.onOpenNpcDialog) {
          soundManager.playNpcDialog();
          this.callbacks.onOpenNpcDialog(npc);
          this.input.interact = false; // consome tecla de interação
        }
      }
    }

    // Interação com Altar de Sal
    if (this.input.interact) {
      for (const altar of this.level.saltAltars) {
        if (altar.hasRefill) {
          const dist = Math.abs((this.player.x + this.player.width / 2) - (altar.x + altar.width / 2));
          if (dist < 50 && Math.abs(this.player.y - altar.y) < 70) {
            this.inventory.addSalt(4);
            altar.hasRefill = false;
            soundManager.playSaltSparkle();
            this.addFloatingText(
              altar.x + altar.width / 2,
              altar.y - 16,
              '+4 SAL SAGRADO OBTIDO!',
              GAME_CONFIG.PALETTE.FX_HOLY_GOLD,
              1.1
            );
          }
        }
      }
    }

    // 3. Atualiza Inimigos e IA
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];
      if (enemy.isAlive) {
        enemy.update(
          dt,
          this.player.x,
          this.player.y,
          this.player.width,
          this.player.height,
          this.level.platforms
        );

        // Colisão de dano do Inimigo no Jogador
        const pBounds = this.player.getBounds();
        const eBounds = enemy.getBounds();
        if (this.checkOverlap(pBounds, eBounds)) {
          if (!this.player.isInvulnerable) {
            this.player.takeDamage(enemy.damage, enemy.x + enemy.width / 2);
            this.triggerScreenShake(0.18, 5);
            this.addFloatingText(
              this.player.x + this.player.width / 2,
              this.player.y - 10,
              `-${enemy.damage}`,
              GAME_CONFIG.PALETTE.FX_BLOOD_RED,
              1.1
            );
            // Sistema de partículas de tinta esferográfica azul simulando sangue/dano
            this.spawnPlayerDamageInkParticles(
              this.player.x + this.player.width / 2,
              this.player.y + 20,
              enemy.x > this.player.x ? -1 : 1
            );
          }
        }
      } else {
        // Remove inimigo morto do array
        this.enemies.splice(i, 1);
      }
    }

    // 4. Resolução de Ataque da Espada contra Inimigos (Pedra, Papel e Tesoura)
    this.handleCombatHits();

    // 4a. Atualiza Orbes de Almas Flutuantes
    const playerCenterX = this.player.x + this.player.width / 2;
    const playerCenterY = this.player.y + this.player.height / 2;
    const magnetRadius = 180 + this.ascensionLevel * 40;

    for (let i = this.soulOrbs.length - 1; i >= 0; i--) {
      const orb = this.soulOrbs[i];
      if (orb.collected) {
        this.soulOrbs.splice(i, 1);
        continue;
      }

      orb.animTime += dt;
      orb.life -= dt;
      if (orb.life <= 0) {
        this.soulOrbs.splice(i, 1);
        continue;
      }

      // Desaceleração da dispersão inicial
      orb.vx *= 0.94;
      orb.vy *= 0.94;

      const dx = playerCenterX - orb.x;
      const dy = playerCenterY - orb.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Atração magnética espiritual quando próximo ao cavaleiro
      if (dist < magnetRadius) {
        const pullSpeed = Math.min(500, 200 + (1 - dist / magnetRadius) * 320);
        orb.vx += (dx / dist) * pullSpeed * dt * 3.5;
        orb.vy += (dy / dist) * pullSpeed * dt * 3.5;
      } else {
        // Flutuação mística
        orb.vy += Math.sin(orb.animTime * 3) * 10 * dt;
      }

      orb.x += orb.vx * dt;
      orb.y += orb.vy * dt;

      // Absorve ao entrar em contato
      if (dist < 32) {
        orb.collected = true;
        this.collectSoul(orb);
        this.soulOrbs.splice(i, 1);
      }
    }

    // 4b. Atualiza Fila de Renascimento de Inimigos (Ciclo de Caça Contínua)
    for (let i = this.enemyRespawnQueue.length - 1; i >= 0; i--) {
      const respawn = this.enemyRespawnQueue[i];
      respawn.timer -= dt;
      if (respawn.timer <= 0) {
        const spawnCfg = this.sectionManager.currentSection.enemySpawns.find(s => s.id === respawn.id);
        const newEnemy = spawnCfg?.type === 'GHOUL'
          ? new GhoulEnemy(respawn.id, respawn.x, respawn.y, spawnCfg.patrolMinX, spawnCfg.patrolMaxX)
          : new GhostEnemy(respawn.id, respawn.x, respawn.y);
        this.enemies.push(newEnemy);
        this.enemyRespawnQueue.splice(i, 1);

        // Névoa espiritual no surgimento
        for (let p = 0; p < 12; p++) {
          this.addParticle({
            x: respawn.x + 20,
            y: respawn.y + 30,
            vx: (Math.random() - 0.5) * 80,
            vy: -Math.random() * 90,
            color: GAME_CONFIG.PALETTE.PEN_LIGHT,
            size: 2.5,
            life: 0.6,
            maxLife: 0.6,
            alpha: 0.8,
            shape: 'dot',
          });
        }
      }
    }

    // 4c. Atualiza Timer de Flash de Ascensão
    if (this.ascensionFlashTimer > 0) {
      this.ascensionFlashTimer = Math.max(0, this.ascensionFlashTimer - dt);
    }

    // 5. Atualiza Partículas (Física de Tinta, Gravidade, Arrasto e Rotação)
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= dt;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      if (p.drag) {
        const dragFactor = Math.max(0, 1 - p.drag * dt);
        p.vx *= dragFactor;
        p.vy *= dragFactor;
      }
      if (p.gravity) {
        p.vy += p.gravity * dt;
      }
      if (p.vRot) {
        p.rotation = (p.rotation || 0) + p.vRot * dt;
      }
      p.alpha = Math.max(0, p.life / p.maxLife);
    }

    // 6. Atualiza Textos Flutuantes
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.life -= dt;
      if (ft.life <= 0) {
        this.floatingTexts.splice(i, 1);
        continue;
      }
      ft.y += ft.vy * dt;
      ft.alpha = Math.max(0, ft.life / ft.maxLife);
    }

    // 7. Atualiza Screen Shake
    if (this.screenShakeTime > 0) {
      this.screenShakeTime -= dt;
    }

    // 8. Câmera Suave seguindo o Jogador
    const targetCameraX = this.player.x + this.player.width / 2 - GAME_CONFIG.CANVAS_WIDTH / 2;
    this.cameraX += (targetCameraX - this.cameraX) * 0.1;
    this.cameraX = Math.max(0, Math.min(this.level.width - GAME_CONFIG.CANVAS_WIDTH, this.cameraX));

    // 9. Comunica dados com a UI do React
    const aliveCount = this.enemies.filter(e => e.isAlive).length;
    this.callbacks.onStatsUpdate({
      hp: this.player.hp,
      maxHp: this.player.maxHp,
      stamina: this.player.stamina,
      maxStamina: this.player.maxStamina,
      hasSaltWeapon: this.inventory.hasSaltCoating,
      saltDuration: this.inventory.saltDurationLeft,
      saltCount: this.inventory.saltCharges,
      playerState: this.player.state,
      enemiesAlive: aliveCount,
      ascension: this.getAscensionStats(),
      inventory: this.inventory.items,
      currentSection: {
        id: this.sectionManager.currentSectionId,
        name: this.sectionManager.currentSection.name,
        subtitle: this.sectionManager.currentSection.subtitle,
      },
    });
  }

  // Verifica colisão da espada do jogador com os inimigos
  private handleCombatHits() {
    const attackHitbox = this.player.getAttackHitbox();
    if (!attackHitbox || this.player.hasHitCurrentAttack) return;

    for (const enemy of this.enemies) {
      if (!enemy.isAlive) continue;

      const eBounds = enemy.getBounds();
      if (this.checkOverlap(attackHitbox, eBounds)) {
        this.player.hasHitCurrentAttack = true; // garante apenas 1 golpe por animação

        // Ponto central de contato do corte no plano 2D
        const hitX = Math.max(attackHitbox.x, Math.min(attackHitbox.x + attackHitbox.width, enemy.x + enemy.width / 2));
        const hitY = Math.max(attackHitbox.y, Math.min(attackHitbox.y + attackHitbox.height, enemy.y + enemy.height / 2));
        const slashDirX = this.player.facing;
        const slashDirY = this.player.isSpinJumping ? -0.4 : -0.15;

        // Se acertou golpe durante o Pulo com Giro 360°, concede impulso acrobático para cima
        if (this.player.isSpinJumping) {
          this.player.vy = Math.min(this.player.vy, -260);
        }

        // Determina o tipo de dano ativo na espada do jogador
        const activeDamageType = this.inventory.getActiveDamageType();
        const isSaltActive = activeDamageType === DamageType.SALT;

        
    // Check Destructibles
    for (const dest of this.destructibles) {
      if (dest.isDestroyed) continue;
      const dBounds = dest.getBounds();
      if (this.checkOverlap(attackHitbox, dBounds)) {
        this.player.hasHitCurrentAttack = true; // garante apenas 1 golpe
        
        const activeDamageType = this.inventory.getActiveDamageType();
        const damageInfo = {
          amount: GAME_CONFIG.PLAYER.ATTACK_DAMAGE,
          type: activeDamageType,
          knockback: { x: this.player.facing * 50, y: -50 },
          sourcePosition: { x: this.player.x, y: this.player.y }
        };
        
        dest.takeDamage(damageInfo, this.inventory, (newParticles) => {
          this.particles.push(...newParticles);
        }, (x, y, text, color) => {
          this.addFloatingText(x, y, text, color);
        });
        

        
        soundManager.playSwordHit(); // Assuming this exists
        this.triggerScreenShake(0.05, 3);
        
        // Break after hitting one thing (or keep checking? Usually one hit per frame check)
        break;
      }
    }

        // Bônus de Ascensão multiplica o poder do corte
        const damageMultiplier = this.getCurrentAscensionInfo().damageMult;
        const calculatedDamage = Math.round(GAME_CONFIG.PLAYER.ATTACK_DAMAGE * damageMultiplier);

        const damageInfo: DamageInfo = {
          amount: calculatedDamage,
          type: activeDamageType,
          knockback: {
            x: this.player.facing * 180,
            y: -120,
          },
          sourcePosition: { x: this.player.x, y: this.player.y },
        };

        const result = enemy.takeDamage(damageInfo);

        // Feedback Visual & Sonoro dependendo de Fraqueza vs Imunidade vs Dano Comum
        if (result.isImmune) {
          // Inimigo Imune ao aço comum!
          soundManager.playImmuneClank();
          this.triggerScreenShake(0.08, 2);

          this.addFloatingText(
            enemy.x + enemy.width / 2,
            enemy.y - 12,
            'IMUNE AO AÇO!',
            GAME_CONFIG.PALETTE.PEN_PRIMARY,
            1.2
          );

          // Faíscas azuis fracas e pequenos arranhões de lâmina repelida
          for (let i = 0; i < 7; i++) {
            this.addParticle({
              x: hitX,
              y: hitY,
              vx: (Math.random() - 0.5) * 110 - slashDirX * 35,
              vy: (Math.random() - 0.5) * 110 - 25,
              color: GAME_CONFIG.PALETTE.PEN_LIGHT,
              size: 2,
              life: 0.3,
              maxLife: 0.3,
              alpha: 0.85,
              shape: 'spark',
            });
          }
        } else if (result.isWeakness) {
          // FRAQUEZA CRÍTICA! (Ex: Sal Purificador contra Espectro ou Lâmina contra Carniçal)
          soundManager.playGhostHurt();
          this.triggerScreenShake(0.22, 7);

          const weaknessLabel = isSaltActive ? 'EXORCIZADO!' : 'GOLPE CRÍTICO!';
          this.addFloatingText(
            enemy.x + enemy.width / 2,
            enemy.y - 18,
            `${weaknessLabel} -${result.dealt}`,
            isSaltActive ? GAME_CONFIG.PALETTE.FX_HOLY_GOLD : GAME_CONFIG.PALETTE.PEN_PRIMARY,
            1.4
          );

          // Efeito sagrado de sal caso a arma esteja imbuída
          if (isSaltActive) {
            for (let i = 0; i < 18; i++) {
              this.addParticle({
                x: hitX,
                y: hitY,
                vx: (Math.random() - 0.5) * 220,
                vy: -Math.random() * 160 - 30,
                color: i % 2 === 0 ? GAME_CONFIG.PALETTE.FX_HOLY_GOLD : GAME_CONFIG.PALETTE.FX_HOLY_WHITE,
                size: 3 + Math.random() * 3,
                life: 0.6 + Math.random() * 0.4,
                maxLife: 1.0,
                alpha: 1,
                gravity: 120,
                shape: i % 3 === 0 ? 'cross' : 'spark',
              });
            }
          }

          // Sistema de partículas de tinta esferográfica azul representando o impacto cortante
          this.spawnAttackInkImpact(hitX, hitY, slashDirX, slashDirY, true, this.player.isSpinJumping);

          if (result.defeated) {
            const defeatedLabel = enemy.type === EnemyType.GHOST
              ? 'ESPECTRO BANIDO!'
              : enemy.type === EnemyType.ZOMBIE
              ? 'CARNIÇAL DESTRUÍDO!'
              : 'INIMIGO DERROTADO!';

            this.addFloatingText(
              enemy.x + enemy.width / 2,
              enemy.y - 32,
              defeatedLabel,
              isSaltActive ? GAME_CONFIG.PALETTE.FX_HOLY_WHITE : GAME_CONFIG.PALETTE.PEN_PRIMARY,
              1.5
            );

            // Explosão dramática de tinta esferográfica azul ao destruir o monstro
            this.spawnEnemyDefeatedInkBurst(enemy, slashDirX, slashDirY);

            // Spawna Almas ao Derrotar o Inimigo!
            this.spawnSoulsFromEnemy(enemy);

            // Enfileira retorno para caça contínua
            this.queueEnemyRespawn(enemy);
          }
        } else if (result.dealt > 0) {
          // GOLPE NORMAL BEM-SUCEDIDO (Dano de aço ou físico comum)
          soundManager.playHitImpact();
          this.triggerScreenShake(0.14, 4);

          this.addFloatingText(
            enemy.x + enemy.width / 2,
            enemy.y - 14,
            `-${result.dealt}`,
            GAME_CONFIG.PALETTE.PEN_PRIMARY,
            1.2
          );

          // Sistema de partículas de tinta esferográfica azul representando o impacto do ataque
          this.spawnAttackInkImpact(hitX, hitY, slashDirX, slashDirY, false, this.player.isSpinJumping);

          if (result.defeated) {
            const defeatedLabel = enemy.type === EnemyType.GHOST
              ? 'ESPECTRO BANIDO!'
              : enemy.type === EnemyType.ZOMBIE
              ? 'CARNIÇAL DESTRUÍDO!'
              : 'INIMIGO DERROTADO!';

            this.addFloatingText(
              enemy.x + enemy.width / 2,
              enemy.y - 32,
              defeatedLabel,
              GAME_CONFIG.PALETTE.PEN_PRIMARY,
              1.5
            );

            // Explosão dramática de tinta esferográfica azul ao aniquilar o inimigo
            this.spawnEnemyDefeatedInkBurst(enemy, slashDirX, slashDirY);

            // Spawna Almas ao Derrotar o Inimigo!
            this.spawnSoulsFromEnemy(enemy);

            // Enfileira retorno para caça contínua
            this.queueEnemyRespawn(enemy);
          }
        }
      }
    }
  }

  /**
   * Sistema de Partículas em Estilo Caneta Esferográfica Azul
   * Simula o impacto cortante da lâmina na textura de pergaminho:
   * respingos de tinta líquida, gotas cinéticas alongadas e riscos vigorosos de caneta.
   */
  public spawnAttackInkImpact(
    x: number,
    y: number,
    dirX: number,
    dirY: number,
    isWeakness: boolean = false,
    isSpinJump: boolean = false
  ) {
    const penDark = GAME_CONFIG.PALETTE.PEN_PRIMARY;       // #0A2570
    const penMid = GAME_CONFIG.PALETTE.PEN_SECONDARY;      // #143D99
    const penLight = GAME_CONFIG.PALETTE.PEN_LIGHT;        // #255AC4
    const penDeep = GAME_CONFIG.PALETTE.PEN_DARKEST;       // #051442

    const inkPalette = [penDeep, penDark, penMid, penLight];

    // Quantidade calibrada para impacto responsivo e denso
    const dropletCount = isSpinJump ? 22 : (isWeakness ? 16 : 11);
    const splatterCount = isSpinJump ? 8 : (isWeakness ? 6 : 4);
    const scratchCount = isSpinJump ? 4 : (isWeakness ? 3 : 2);

    const baseAngle = Math.atan2(dirY, dirX);

    // 1. Gotas cinéticas alongadas de tinta esferográfica azul (spray de corte)
    for (let i = 0; i < dropletCount; i++) {
      let angle: number;
      if (isSpinJump) {
        // No mortal 360°, a tinta espirra em leque radial completo
        angle = (i / dropletCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
      } else {
        // No corte frontal, spray cônico na direção do golpe
        angle = baseAngle + (Math.random() - 0.5) * 1.35;
      }

      const speed = 140 + Math.random() * (isWeakness ? 280 : 210);
      const color = inkPalette[Math.floor(Math.random() * inkPalette.length)];
      const size = 1.8 + Math.random() * (isWeakness ? 2.4 : 1.8);

      this.addParticle({
        x: x + (Math.random() - 0.5) * 8,
        y: y + (Math.random() - 0.5) * 8,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 25,
        color,
        size,
        life: 0.35 + Math.random() * 0.3,
        maxLife: 0.65,
        alpha: 1,
        gravity: 360 + Math.random() * 120,
        drag: 0.75, // desaceleração natural da tinta fluida
        shape: 'ink_droplet',
      });
    }

    // 2. Manchas orgânicas de tinta (ink splatter) com micro-gotículas satélites
    for (let i = 0; i < splatterCount; i++) {
      const angle = isSpinJump
        ? Math.random() * Math.PI * 2
        : baseAngle + (Math.random() - 0.5) * 1.6;

      const speed = 60 + Math.random() * 140;
      const color = inkPalette[Math.floor(Math.random() * 2)]; // tons mais profundos para as manchas
      const size = 2.8 + Math.random() * (isWeakness ? 3.2 : 2.2);

      // Gera 2 a 4 micro-satélites ao redor do impacto
      const satCount = 2 + Math.floor(Math.random() * 3);
      const satellites: { dx: number; dy: number; r: number }[] = [];
      for (let s = 0; s < satCount; s++) {
        const satAng = Math.random() * Math.PI * 2;
        const satDist = size * (1.2 + Math.random() * 1.5);
        satellites.push({
          dx: Math.cos(satAng) * satDist,
          dy: Math.sin(satAng) * satDist,
          r: 0.6 + Math.random() * 0.9,
        });
      }

      this.addParticle({
        x: x + (Math.random() - 0.5) * 12,
        y: y + (Math.random() - 0.5) * 12,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 15,
        color,
        size,
        life: 0.45 + Math.random() * 0.35,
        maxLife: 0.8,
        alpha: 1,
        gravity: 340,
        drag: 0.9,
        shape: 'ink_splatter',
        satellites,
      });
    }

    // 3. Riscos de caneta no papel (pen scratches) simulando o corte físico gravado no pergaminho
    for (let i = 0; i < scratchCount; i++) {
      const scratchAngle = isSpinJump
        ? (i / scratchCount) * Math.PI * 2 + Math.PI / 4
        : baseAngle + (i - 1) * 0.3 + (Math.random() - 0.5) * 0.2;

      const scratchLen = (isWeakness ? 20 : 15) + Math.random() * 12;
      const color = i === 0 ? penDeep : penDark;

      // Linhas de corte hachuradas de caneta
      const scratchLines = [
        {
          dx1: -Math.cos(scratchAngle) * scratchLen,
          dy1: -Math.sin(scratchAngle) * scratchLen,
          dx2: Math.cos(scratchAngle) * scratchLen,
          dy2: Math.sin(scratchAngle) * scratchLen,
          width: 2.2 + Math.random() * 0.8,
        },
        {
          dx1: -Math.cos(scratchAngle + 0.15) * (scratchLen * 0.75),
          dy1: -Math.sin(scratchAngle + 0.15) * (scratchLen * 0.75),
          dx2: Math.cos(scratchAngle + 0.15) * (scratchLen * 0.75),
          dy2: Math.sin(scratchAngle + 0.15) * (scratchLen * 0.75),
          width: 1.2,
        },
      ];

      this.addParticle({
        x: x + (Math.random() - 0.5) * 6,
        y: y + (Math.random() - 0.5) * 6,
        vx: (Math.random() - 0.5) * 20,
        vy: -10 - Math.random() * 15,
        color,
        size: scratchLen,
        life: 0.25 + Math.random() * 0.15,
        maxLife: 0.4,
        alpha: 1,
        shape: 'pen_scratch',
        scratchLines,
      });
    }
  }

  /**
   * Explosão de tinta esferográfica azul ao aniquilar um inimigo
   * O inimigo se desfaz em uma borrifada artística de tinta azul sobre o papel
   */
  public spawnEnemyDefeatedInkBurst(enemy: Enemy, slashDirX: number, slashDirY: number) {
    const penDark = GAME_CONFIG.PALETTE.PEN_PRIMARY;
    const penMid = GAME_CONFIG.PALETTE.PEN_SECONDARY;
    const penLight = GAME_CONFIG.PALETTE.PEN_LIGHT;
    const penDeep = GAME_CONFIG.PALETTE.PEN_DARKEST;

    const inkPalette = [penDeep, penDark, penMid, penLight];
    const centerX = enemy.x + enemy.width / 2;
    const centerY = enemy.y + enemy.height / 2;

    // 1. Grande chuveiro de gotas de tinta esferográfica azul
    for (let i = 0; i < 28; i++) {
      const angle = (i / 28) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
      const speed = 120 + Math.random() * 260;
      const color = inkPalette[Math.floor(Math.random() * inkPalette.length)];

      this.addParticle({
        x: centerX + (Math.random() - 0.5) * (enemy.width * 0.6),
        y: centerY + (Math.random() - 0.5) * (enemy.height * 0.6),
        vx: Math.cos(angle) * speed + slashDirX * 60,
        vy: Math.sin(angle) * speed - 60,
        color,
        size: 2.2 + Math.random() * 2.8,
        life: 0.5 + Math.random() * 0.45,
        maxLife: 0.95,
        alpha: 1,
        gravity: 380,
        drag: 0.8,
        shape: 'ink_droplet',
      });
    }

    // 2. Grandes manchas de tinta (splatters) com múltiplos satélites
    for (let i = 0; i < 10; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 50 + Math.random() * 150;
      const color = inkPalette[Math.floor(Math.random() * 2)];
      const size = 3.5 + Math.random() * 3.5;

      const satellites: { dx: number; dy: number; r: number }[] = [];
      const satCount = 3 + Math.floor(Math.random() * 3);
      for (let s = 0; s < satCount; s++) {
        const satAng = Math.random() * Math.PI * 2;
        const satDist = size * (1.3 + Math.random() * 1.6);
        satellites.push({
          dx: Math.cos(satAng) * satDist,
          dy: Math.sin(satAng) * satDist,
          r: 0.8 + Math.random() * 1.0,
        });
      }

      this.addParticle({
        x: centerX + (Math.random() - 0.5) * 16,
        y: centerY + (Math.random() - 0.5) * 16,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 40,
        color,
        size,
        life: 0.6 + Math.random() * 0.4,
        maxLife: 1.0,
        alpha: 1,
        gravity: 360,
        drag: 0.85,
        shape: 'ink_splatter',
        satellites,
      });
    }

    // 3. Riscos decisivos de caneta cortando o espaço onde estava o monstro
    for (let i = 0; i < 4; i++) {
      const scratchAngle = (i * Math.PI) / 4 + (Math.random() - 0.5) * 0.3;
      const scratchLen = 25 + Math.random() * 20;

      const scratchLines = [
        {
          dx1: -Math.cos(scratchAngle) * scratchLen,
          dy1: -Math.sin(scratchAngle) * scratchLen,
          dx2: Math.cos(scratchAngle) * scratchLen,
          dy2: Math.sin(scratchAngle) * scratchLen,
          width: 3.0,
        },
        {
          dx1: -Math.cos(scratchAngle + 0.2) * (scratchLen * 0.7),
          dy1: -Math.sin(scratchAngle + 0.2) * (scratchLen * 0.7),
          dx2: Math.cos(scratchAngle + 0.2) * (scratchLen * 0.7),
          dy2: Math.sin(scratchAngle + 0.2) * (scratchLen * 0.7),
          width: 1.5,
        },
      ];

      this.addParticle({
        x: centerX,
        y: centerY,
        vx: (Math.random() - 0.5) * 15,
        vy: -15,
        color: penDeep,
        size: scratchLen,
        life: 0.35 + Math.random() * 0.2,
        maxLife: 0.55,
        alpha: 1,
        shape: 'pen_scratch',
        scratchLines,
      });
    }
  }

  /**
   * Respingos de tinta simulando dano e sangue do jogador ao ser atingido por um inimigo
   */
  public spawnPlayerDamageInkParticles(x: number, y: number, knockbackDir: number) {
    const penDark = GAME_CONFIG.PALETTE.PEN_PRIMARY;
    const penDeep = GAME_CONFIG.PALETTE.PEN_DARKEST;
    const bloodRed = GAME_CONFIG.PALETTE.FX_BLOOD_RED;

    // Gotas escorrendo em spray na direção do impacto
    for (let i = 0; i < 14; i++) {
      const angle = (knockbackDir > 0 ? 0 : Math.PI) + (Math.random() - 0.5) * 1.5;
      const speed = 100 + Math.random() * 180;
      // Predominância de tinta esferográfica azul com toques de tinta carmim
      const color = i % 3 === 0 ? bloodRed : (i % 2 === 0 ? penDeep : penDark);

      this.addParticle({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 30,
        color,
        size: 2.0 + Math.random() * 2.0,
        life: 0.4 + Math.random() * 0.3,
        maxLife: 0.7,
        alpha: 1,
        gravity: 420,
        drag: 0.8,
        shape: 'ink_droplet',
      });
    }

    // Manchas orgânicas de tinta com respingos satélites
    for (let i = 0; i < 5; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 40 + Math.random() * 100;
      const color = i % 2 === 0 ? penDark : bloodRed;

      const satellites: { dx: number; dy: number; r: number }[] = [];
      const satCount = 2 + Math.floor(Math.random() * 2);
      for (let s = 0; s < satCount; s++) {
        const satAng = Math.random() * Math.PI * 2;
        const satDist = 4 + Math.random() * 6;
        satellites.push({
          dx: Math.cos(satAng) * satDist,
          dy: Math.sin(satAng) * satDist,
          r: 0.7 + Math.random() * 0.8,
        });
      }

      this.addParticle({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 20,
        color,
        size: 3.0 + Math.random() * 2.0,
        life: 0.5 + Math.random() * 0.3,
        maxLife: 0.8,
        alpha: 1,
        gravity: 360,
        drag: 0.85,
        shape: 'ink_splatter',
        satellites,
      });
    }

    // Risco de garra/corte no papel
    this.addParticle({
      x,
      y,
      vx: knockbackDir * 10,
      vy: -5,
      color: penDeep,
      size: 18,
      life: 0.28,
      maxLife: 0.28,
      alpha: 1,
      shape: 'pen_scratch',
      scratchLines: [
        {
          dx1: -12,
          dy1: -10,
          dx2: 12,
          dy2: 10,
          width: 2.2,
        },
        {
          dx1: -8,
          dy1: -14,
          dx2: 14,
          dy2: 6,
          width: 1.6,
        },
      ],
    });
  }

  private triggerScreenShake(duration: number, intensity: number) {
    this.screenShakeTime = duration;
    this.screenShakeIntensity = intensity;
  }

  private addParticle(particle: Particle) {
    this.particles.push(particle);
  }

  private addFloatingText(x: number, y: number, text: string, color: string, scale: number = 1.0) {
    this.floatingTexts.push({
      id: this.nextTextId++,
      x,
      y,
      text,
      color,
      alpha: 1,
      vy: -45,
      scale,
      life: 0.9,
      maxLife: 0.9,
    });
  }

  private checkOverlap(r1: Rect, r2: Rect): boolean {
    return (
      r1.x < r2.x + r2.width &&
      r1.x + r1.width > r2.x &&
      r1.y < r2.y + r2.height &&
      r1.y + r1.height > r2.y
    );
  }

  private render(dt: number = 0.016) {
    const ctx = this.ctx;
    const w = GAME_CONFIG.CANVAS_WIDTH;
    const h = GAME_CONFIG.CANVAS_HEIGHT;

    ctx.clearRect(0, 0, w, h);

    // 1. Fundo de Pergaminho e Camadas de Parallax com Tema do Bioma Ativo
    this.renderer.renderBackground(ctx, this.cameraX, this.cameraY, this.sectionManager.theme, dt);

    // 2. Translação do Mundo pelo Offset da Câmera (+ Screen Shake)
    ctx.save();
    let shakeX = 0;
    let shakeY = 0;
    if (this.screenShakeTime > 0) {
      shakeX = (Math.random() - 0.5) * this.screenShakeIntensity * 2;
      shakeY = (Math.random() - 0.5) * this.screenShakeIntensity * 2;
    }
    ctx.translate(-Math.round(this.cameraX) + shakeX, -Math.round(this.cameraY) + shakeY);

    // 3. Renderiza Nível (Plataformas, Altares, Textos de Grimório e Portais de Transição)
    this.level.render(ctx, this.renderer);

    // Failsafe for Hot Module Replacement (HMR) if array is empty
    if (this.destructibles.length === 0 && this.sectionManager.currentSection.destructibles && this.sectionManager.currentSection.destructibles.length > 0) {
      this.loadSectionDestructibles(this.sectionManager.currentSection);
    }
    
    // 3a. Renderiza Destructibles
    for (const dest of this.destructibles) {
      dest.render(ctx, this.renderer);
    }

    // 3a. Renderiza NPCs (Monges e Eremitas)
    for (const npc of this.npcs) {
      const isPlayerNearby = this.activeNpcNearby?.id === npc.id;
      npc.render(ctx, this.renderer, isPlayerNearby);
    }

    // 4. Renderiza Inimigos
    for (const enemy of this.enemies) {
      enemy.render(ctx, this.renderer);
    }

    // 5. Renderiza o Jogador (O Cavaleiro Arruinado)
    this.player.render(ctx, this.renderer, this.inventory.hasSaltCoating);

    // 5a. Renderiza Aura e Centelhas de Ascensão do Cavaleiro
    this.renderer.renderPlayerAscensionAura(
      ctx,
      this.player.x,
      this.player.y,
      this.player.width,
      this.player.height,
      this.ascensionLevel,
      this.player.animTime
    );

    // 5b. Renderiza Orbes de Almas Espectrais Flutuantes
    this.renderer.renderSoulOrbs(ctx, this.soulOrbs);

    // 6. Renderiza Partículas no Espaço de Mundo
    this.renderer.renderParticles(ctx, this.particles);

    // 7. Renderiza Textos Flutuantes de Dano
    this.renderer.renderFloatingTexts(ctx, this.floatingTexts);

    ctx.restore();

    // 8. Barra de Progresso de Ascensão no Topo da Tela (Coordenadas de Tela)
    this.renderer.renderInGameAscensionBar(ctx, this.getAscensionStats(), this.player.animTime);

    // 8a. Banner Ilustrado da Seção (Ao entrar em nova área)
    this.renderer.renderSectionTitleBanner(
      ctx,
      this.sectionManager.bannerTitle,
      this.sectionManager.bannerSubtitle,
      this.sectionManager.bannerAlpha
    );

    // 9. Flash Celestial de Ascensão (Quando alcança novo nível)
    if (this.ascensionFlashTimer > 0) {
      ctx.save();
      ctx.fillStyle = `rgba(245, 158, 11, ${this.ascensionFlashTimer * 0.35})`;
      ctx.fillRect(0, 0, w, h);
      ctx.restore();
    }

    // 9b. Dissolução de Tinta / Transição de Tela entre Seções
    this.renderer.renderScreenTransition(ctx, this.sectionManager.transitionAlpha);

    // 10. Pós-processamento: Ruído de papel, vinheta de pergaminho antigo e moldura de caderno
    this.renderer.renderPostProcessing(ctx);
  }
}
