/**
 * O Cavaleiro Arruinado - Game Engine Core
 * Loop Principal, Câmera, Física, Partículas e Resolução de Combate
 */

import { GAME_CONFIG } from './config';
import { Player } from './entities/Player';
import { Fireball } from './entities/Fireball';
import { Enemy } from './entities/Enemy';
import { GhostEnemy } from './entities/GhostEnemy';
import { ZombieEnemy } from './entities/ZombieEnemy';
import { GhoulEnemy } from './entities/GhoulEnemy';
import { SkullEnemy } from './entities/SkullEnemy';
import { NPC, DialogChoice } from './entities/NPC';
import { Destructible } from './entities/Destructible';
import { Level } from './world/Level';
import { PenRenderer } from './rendering/PenRenderer';
import { InventoryManager } from './inventory/InventoryManager';
import { AscensionStats, DamageInfo, DamageType, EnemyType, FloatingText, Particle, PlayerState, Rect, SoulOrb , Collectible } from './types';
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
    mp: number;
    maxMp: number;
    ascension: AscensionStats;
    inventory?: any[];
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
  public collectibles: Collectible[] = [];
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
  public isCutscenePlaying: boolean = false;
  public isAutoWalkingToBoss: boolean = false;

  // Sistemas de Efeitos Visuais
  public particles: Particle[] = [];
  public aoePuddles: {x: number, y: number, radius: number, maxRadius: number, life: number, maxLife: number}[] = [];
  public fireballs: Fireball[] = [];
  public floatingTexts: FloatingText[] = [];
  private nextTextId: number = 1;

  // Estado de Entrada (Input)
  public input = {
    left: false,
    right: false,
    down: false,
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
    const initialScenario = typeof window !== 'undefined' ? (localStorage.getItem('selected_initial_scenario') || 'sanctuary_interior') : 'sanctuary_interior';
    this.sectionManager = new SectionManager(initialScenario);
    this.level = new Level(this.sectionManager.currentSection);

    // Inicia Jogador
    this.player = new Player(80, 390);

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
      
      // Cutscene now triggered by proximity (autoTriggerDistance)
      
      // Manage BGM based on section
      if (section.id === 'sanctuary_interior') {
        // Assume the user will upload a file named bgm_sanctuary.mp3 to public/ 
        // For now, it will try to load this URL.
        soundManager.playBGM('/bgm_sanctuary.mp3', 0.4);
        this.isCutscenePlaying = false;
        this.isAutoWalkingToBoss = false;
      } else {
        soundManager.fadeOutBGM(1500);
      }
    });
  }

  public loadSectionDestructibles(section: SectionData) {
    this.destructibles = (section.destructibles || []).map(cfg => {
      return new Destructible(cfg.id, cfg.type, cfg.x, cfg.y);
    });
  }

  public loadSectionNPCs(section: SectionData) {
    this.npcs = section.npcConfigs.map(cfg => {
      const npc = new NPC(cfg.id, cfg.name, cfg.title, cfg.x, cfg.y, cfg.dialogs, cfg.role);
      if (cfg.autoTriggerDistance) {
        npc.autoTriggerDistance = cfg.autoTriggerDistance;
      }
      return npc;
    });
  }

  public loadSectionEnemies(section: SectionData) {
    this.enemies = section.enemySpawns.map(cfg => {
      if (cfg.type === 'ZOMBIE') {
        return new ZombieEnemy(cfg.id, cfg.x, cfg.y);
      } else if (cfg.type === 'GHOUL') {
        return new GhoulEnemy(cfg.id, cfg.x, cfg.y, cfg.patrolMinX, cfg.patrolMaxX);
      } else if (cfg.type === 'SKULL') {
        return new SkullEnemy(cfg.id, cfg.x, cfg.y);
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
    const initialScenario = typeof window !== 'undefined' ? (localStorage.getItem('selected_initial_scenario') || 'sanctuary_interior') : 'sanctuary_interior';
    this.sectionManager = new SectionManager(initialScenario);
    this.setupSectionTransitions();
    this.player = new Player(80, 390);
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
    if (isNaN(progressPercent)) console.log("NAN detected:", this.ascensionSoulsCurrentLevel, this.ascensionSoulsNeeded, GAME_CONFIG.ASCENSION.SOULS_BASE_REQ);
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
    const isZombie = enemy.type === EnemyType.ZOMBIE;
    this.enemyRespawnQueue.push({
      x: spawnX,
      y: spawnY,
      timer: isZombie ? 1.5 : 5.5,
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
    
    // Lock inputs if playing a cutscene
    let activeInput = this.input;
    if (this.isCutscenePlaying) {
      activeInput = { left: false, right: false, down: false, jump: false, dash: false, attack: false, interact: false, useSalt: false };
      if (this.isAutoWalkingToBoss) {
        activeInput.right = true; // Força andar para a direita
      }
    }

    this.player.update(
      dt,
      activeInput,
      this.level.platforms,
      this.inventory.hasSaltCoating,
      () => this.triggerUseSalt()
    );

    // Checa se o jogador soltou a magia (Fireball)
    if (this.player.spellCastRequested) {
      this.player.spellCastRequested = false;
      
      const baseMpCost = 25;
      const mpCost = Math.round(baseMpCost * (1 + (this.ascensionLevel * 0.2)));
      
      if (this.player.mp >= mpCost) {
        this.player.mp -= mpCost;
        
        // Spawn Fireball
        const baseDamage = 30;
        const damage = Math.round(baseDamage * (1 + (this.ascensionLevel * 0.5)));
        
        const fbX = this.player.facing === 1 ? this.player.x + this.player.width : this.player.x;
        const fbY = this.player.y + this.player.height / 2;
        
        this.fireballs.push(new Fireball(fbX, fbY, this.player.facing, damage));
        
        // Toca o som do disparo da magia de fogo
        if ((soundManager as any).playFireballSound) {
          (soundManager as any).playFireballSound();
        }
        
        // Trigger attack animation
        this.player.state = 'ATTACK' as any;
        this.player.attackTimer = 0.3; // force animation
      }
    }

    // Checa se o jogador soltou a magia (Cura)
    if (this.player.healCastRequested) {
      this.player.healCastRequested = false;
      
      const baseMpCost = 30;
      const mpCost = Math.round(baseMpCost * (1 + (this.ascensionLevel * 0.2)));
      
      if (this.player.mp >= mpCost && this.player.hp < this.player.maxHp) {
        this.player.mp -= mpCost;
        
        const baseHeal = 25;
        const healAmount = Math.round(baseHeal * (1 + (this.ascensionLevel * 0.5)));
        
        const previousHp = this.player.hp;
        this.player.hp = Math.min(this.player.maxHp, this.player.hp + healAmount);
        const actualHeal = this.player.hp - previousHp;
        this.player.healingAuraTimer = 0.8; // Dura 0.8s
        
        if (actualHeal > 0) {
            // Trigger floating text
            const pX = this.player.x + this.player.width / 2;
            const pY = this.player.y;
            this.addFloatingText(pX, pY, `+${actualHeal} VIDA`, '#10B981', 1.2);
            
            // Trigger green aura particles
            for(let p=0; p<20; p++) {
              this.particles.push({
                x: pX + (Math.random() - 0.5) * 40, 
                y: pY + this.player.height + (Math.random() - 0.5) * 20,
                vx: (Math.random() - 0.5) * 50,
                vy: -Math.random() * 100 - 50,
                color: Math.random() > 0.5 ? '#10B981' : '#34D399',
                size: Math.random() * 6 + 3,
                life: 0,
                maxLife: 0.5 + Math.random() * 0.5,
                alpha: 1,
                shape: 'spark'
              });
            }
        }
      }
    }


    // Checa se o jogador soltou a magia (Borrão Explosivo)
    if (this.player.aoeCastRequested) {
      this.player.aoeCastRequested = false;
      
      const baseMpCost = 40;
      const mpCost = Math.round(baseMpCost * (1 + (this.ascensionLevel * 0.2)));
      
      if (this.player.mp >= mpCost) {
        this.player.mp -= mpCost;
        
        const baseDamage = 45;
        const damage = Math.round(baseDamage * (1 + (this.ascensionLevel * 0.5)));
        
        // Causa dano em área
        const pX = this.player.x + this.player.width / 2;
        const pY = this.player.y + this.player.height;
        const explosionRadius = 180;
        
        // Cria a poça de tinta no chão
        this.aoePuddles.push({
          x: pX,
          y: pY,
          radius: 0,
          maxRadius: explosionRadius,
          life: 0,
          maxLife: 1.5 // Dura 1.5 segundos na tela
        });
        
        // Trigger attack animation
        this.player.state = 'ATTACK' as any;
        this.player.attackTimer = 0.4;
        
        if (typeof (window as any).soundManager !== 'undefined') {
            // Se possivel, toque um som
        }
        
        // Explosão de Nankin Particles
        for(let p=0; p<40; p++) {
          this.particles.push({
            x: pX + (Math.random() - 0.5) * 60, 
            y: pY - 10,
            vx: (Math.random() - 0.5) * 450,
            vy: -Math.random() * 300 - 100,
            color: Math.random() > 0.5 ? '#0A2570' : '#051442',
            size: Math.random() * 14 + 6,
            life: 0,
            maxLife: 0.6 + Math.random() * 0.6,
            alpha: 1,
            shape: 'ink_splatter',
            gravity: 900
          });
        }
        
        // Bate em inimigos próximos
        for (const enemy of this.enemies) {
            if (enemy.isAlive) {
                const eX = enemy.x + enemy.width / 2;
                const eY = enemy.y + enemy.height / 2;
                const dist = Math.sqrt(Math.pow(eX - pX, 2) + Math.pow(eY - pY, 2));
                
                if (dist <= explosionRadius) {
                    const knockDirX = eX > pX ? 1 : -1;
                    enemy.takeDamage({
                      amount: damage,
                      type: 'PHYSICAL' as any,
                      knockback: { x: knockDirX * 350, y: -200 },
                      sourcePosition: { x: pX, y: pY }
                    });
                    this.addFloatingText(eX, eY, damage.toString(), '#8B5CF6', 1.5);
                }
            }
        }
      }
    }

    // Atualiza Fireballs
    for (let i = this.fireballs.length - 1; i >= 0; i--) {
      const fb = this.fireballs[i];
      fb.update(dt);
      
      // Checa colisão com inimigos
      const fbBounds = fb.getBounds();
      let hit = false;
      
      for (const enemy of this.enemies) {
        if (enemy.isAlive) {
          const eBounds = enemy.getBounds();
          if (this.checkOverlap(fbBounds, eBounds)) {
            hit = true;
            // Causar dano de fogo
            enemy.takeDamage({
              amount: fb.damage,
              type: 'FIRE' as any,
              knockback: { x: fb.facing * 150, y: -100 },
              sourcePosition: { x: fb.x, y: fb.y }
            });
            this.addFloatingText(fb.x, fb.y, fb.damage.toString(), '#FF5500', 1.5);
            
            // Explosão de fogo
            for(let p=0; p<15; p++) {
              this.particles.push({
                x: fb.x, y: fb.y,
                vx: (Math.random() - 0.5) * 200,
                vy: (Math.random() - 0.5) * 200,
                color: Math.random() > 0.5 ? '#FF4400' : '#FFDD00',
                size: Math.random() * 8 + 4,
                life: 0,
                maxLife: 0.3 + Math.random() * 0.3,
                alpha: 1,
                shape: 'spark'
              });
            }
            break;
          }
        }
      }
      
      // Se saiu da tela ou bateu, remove
      if (hit || fb.x < this.cameraX - 100 || fb.x > this.cameraX + 1920 + 100) {
        this.fireballs.splice(i, 1);
      }
    }


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

      // Distância de interação manual (E)
      if (dist < 85) {
        this.activeNpcNearby = npc;
        if (this.input.interact && this.callbacks.onOpenNpcDialog && !this.isCutscenePlaying) {
          this.player.vx = 0; // stop player
          this.isCutscenePlaying = true; // Lock player movement
          soundManager.playNpcDialog();
          this.callbacks.onOpenNpcDialog(npc);
          this.input.interact = false; // consome tecla de interação
        }
      }
      
      // Auto-trigger distance (para bosses/cutscenes)
      if (npc.autoTriggerDistance && dist < npc.autoTriggerDistance && !npc.hasTriggeredAutoDialog) {
        this.isAutoWalkingToBoss = false;
        npc.hasTriggeredAutoDialog = true;
        this.input.left = false;
        this.input.right = false;
        this.input.jump = false;
        this.input.attack = false;
        this.player.vx = 0; // Para imediatamente o movimento
        this.isCutscenePlaying = true;
        
        // Aguarda 1 segundo antes de abrir o diálogo
        setTimeout(() => {
          if (this.callbacks.onOpenNpcDialog) {
            soundManager.playNpcDialog();
            this.callbacks.onOpenNpcDialog(npc);
          }
        }, 1000);
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
        let newEnemy: Enemy;
        if (spawnCfg?.type === 'ZOMBIE') {
          newEnemy = new ZombieEnemy(respawn.id, respawn.x, respawn.y);
        } else if (spawnCfg?.type === 'GHOUL') {
          newEnemy = new GhoulEnemy(respawn.id, respawn.x, respawn.y, spawnCfg.patrolMinX, spawnCfg.patrolMaxX);
        } else if (spawnCfg?.type === 'SKULL') {
          newEnemy = new SkullEnemy(respawn.id, respawn.x, respawn.y);
        } else {
          newEnemy = new GhostEnemy(respawn.id, respawn.x, respawn.y);
        }
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
      
      // Colisão da cabeça rolando com o chão
      if (p.shape === 'ZOMBIE_HEAD' && p.y > 430) {
        p.y = 430;
        p.vy *= -0.6; // Quique da cabeça
        p.vx *= 0.95; // Fricção
        if (Math.abs(p.vy) < 20) p.vy = 0;
      }
      p.alpha = Math.max(0, p.life / p.maxLife);
    }

    // Atualiza Destructibles
    for (const dest of this.destructibles) {
      if (typeof (dest as any).update === 'function') {
        (dest as any).update(dt);
      }
    }

    // Atualiza Poças de AoE
    for (let i = this.aoePuddles.length - 1; i >= 0; i--) {
      const p = this.aoePuddles[i];
      p.life += dt;
      // Expansão rápida
      if (p.radius < p.maxRadius) {
         p.radius += (p.maxRadius - p.radius) * 10 * dt + 50 * dt;
         if (p.radius > p.maxRadius) p.radius = p.maxRadius;
      }
      if (p.life >= p.maxLife) {
        this.aoePuddles.splice(i, 1);
      }
    }

    // Atualiza Collectibles
    for (const item of this.collectibles) {
      if (item.isCollected) continue;
      
      item.vy += 800 * dt; // gravidade
      item.x += item.vx * dt;
      item.y += item.vy * dt;
      item.life += dt;

      // Chão simples 
      if (item.y > 425) { 
          item.y = 425;
          item.vy = 0;
          item.vx = 0;
      }

      // Checa colisão entre o Nankin e o Item
      const iBounds = {x: item.x, y: item.y, width: item.width, height: item.height};
      if (this.checkOverlap(this.player.getBounds(), iBounds)) {
          item.isCollected = true;
          
          if (item.type === 'heart') {
              const heal = 25;
              this.player.hp = Math.min(this.player.maxHp, this.player.hp + heal);
              this.addFloatingText(this.player.x + this.player.width/2, this.player.y, "+25 HP", "#10B981");
              this.player.healingAuraTimer = 0.5;
          } else if (item.type === 'purifying_salt') {
              this.inventory.addItem({ id: item.type, name: 'Sal Purificador', description: 'Básico', type: 'COATING', icon: 'salt', count: 1 });
              this.inventory.addSalt(1);
              this.addFloatingText(this.player.x + this.player.width/2, this.player.y, "+1 Sal", "#3B82F6");
          } else if (item.type === 'holy_water') {
              this.inventory.addItem({ id: item.type, name: 'Água Benta', description: 'Básico', type: 'CONSUMABLE', icon: 'flask', count: 1 });
              this.addFloatingText(this.player.x + this.player.width/2, this.player.y, "+1 Água Benta", "#3B82F6");
          }
      }
    }
    this.collectibles = this.collectibles.filter(c => !c.isCollected && c.life < 15);

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
      mp: this.player.mp,
      maxMp: this.player.maxMp,
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

    let hitSomething = false;

    // Check Enemies
    for (const enemy of this.enemies) {
      if (!enemy.isAlive) continue;

      const eBounds = enemy.getBounds();
      if (this.checkOverlap(attackHitbox, eBounds)) {
        hitSomething = true;
        this.player.hasHitCurrentAttack = true; 

        const hitX = Math.max(attackHitbox.x, Math.min(attackHitbox.x + attackHitbox.width, enemy.x + enemy.width / 2));
        const hitY = Math.max(attackHitbox.y, Math.min(attackHitbox.y + attackHitbox.height, enemy.y + enemy.height / 2));
        const slashDirX = this.player.facing;
        const slashDirY = this.player.isSpinJumping ? -0.4 : -0.15;

        if (this.player.isSpinJumping) {
          this.player.vy = Math.min(this.player.vy, -260);
        }

        const activeDamageType = this.inventory.getActiveDamageType();
        const isSaltActive = activeDamageType === 'SALT';
        const damageMultiplier = this.getCurrentAscensionInfo().damageMult;
        const calculatedDamage = Math.round(GAME_CONFIG.PLAYER.ATTACK_DAMAGE * damageMultiplier);

        const damageInfo = {
          amount: calculatedDamage,
          type: activeDamageType,
          knockback: { x: this.player.facing * 180, y: -180 },
          sourcePosition: { x: this.player.x, y: this.player.y }
        };

        const dmgResult = enemy.takeDamage(damageInfo as any);

        if (dmgResult.isImmune) {
          if ((soundManager as any).playImmuneClank) (soundManager as any).playImmuneClank();
          this.addFloatingText(hitX, hitY - 20, "IMUNE", '#9CA3AF');
        } else if (dmgResult.isWeakness) {
          if ((soundManager as any).playGhostHurt) (soundManager as any).playGhostHurt();
          this.addFloatingText(hitX, hitY - 20, dmgResult.dealt.toString(), '#FBBF24', 1.5);
        } else {
          if ((soundManager as any).playHitImpact) (soundManager as any).playHitImpact();
          this.addFloatingText(hitX, hitY - 20, dmgResult.dealt.toString(), '#FFFFFF', 1.0);
        }

        if (dmgResult.defeated) {
          if ((soundManager as any).playGhostWail) (soundManager as any).playGhostWail();
          this.triggerScreenShake(0.12, 6);

          for (let p = 0; p < 20; p++) {
             this.particles.push({
               x: enemy.x + enemy.width / 2, 
               y: enemy.y + enemy.height / 2,
               vx: (Math.random() - 0.5) * 400,
               vy: (Math.random() - 0.5) * 400,
               color: isSaltActive ? '#FFFFFF' : GAME_CONFIG.PALETTE.PEN_PRIMARY, 
               size: Math.random() * 5 + 2,
               life: 0, 
               maxLife: 0.5 + Math.random() * 0.5, 
               alpha: 1, 
               shape: isSaltActive ? 'spark' : 'ink_slash'
             });
          }

          this.soulOrbs.push({
             id: this.nextSoulId++,
             x: enemy.x + enemy.width / 2,
             y: enemy.y + enemy.height / 2,
             vx: (Math.random() - 0.5) * 150,
             vy: -200 - Math.random() * 100,
             life: 15,
             maxLife: 15,
             value: 1,
             animTime: 0,
             collected: false
          });

          this.queueEnemyRespawn(enemy);
          
          if (enemy.type === EnemyType.ZOMBIE) {
            // Spawn rolling head particle
            this.particles.push({
              x: enemy.x + enemy.width / 2,
              y: enemy.y,
              vx: (Math.random() - 0.5) * 200,
              vy: -150 - Math.random() * 100,
              life: 4.0,
              maxLife: 4.0,
              color: '#4ade80',
              size: 8,
              alpha: 1,
              gravity: 1200,
              rotation: 0,
              vRot: Math.random() > 0.5 ? 10 : -10,
              shape: 'ZOMBIE_HEAD'
            });
          }
        }

        if (isSaltActive) {
           for(let p=0; p<8; p++) {
             this.particles.push({
               x: hitX + (Math.random()-0.5)*20, y: hitY + (Math.random()-0.5)*20,
               vx: slashDirX * (300 + Math.random()*200) + (Math.random()-0.5)*100,
               vy: slashDirY * 300 + (Math.random()-0.5)*100,
               color: '#FFFFFF', size: Math.random() * 3 + 2,
               life: 0, maxLife: 0.3 + Math.random()*0.2, alpha: 1, shape: 'spark'
             });
           }
        } else {
           for(let p=0; p<12; p++) {
             this.particles.push({
               x: hitX, y: hitY,
               vx: slashDirX * (200 + Math.random()*300) + (Math.random()-0.5)*150,
               vy: slashDirY * 300 + (Math.random()-0.5)*150,
               color: GAME_CONFIG.PALETTE.PEN_PRIMARY, size: Math.random() * 4 + 1,
               life: 0, maxLife: 0.3 + Math.random()*0.3, alpha: 1, shape: 'ink_slash'
             });
           }
        }
        this.triggerScreenShake(0.08, 4);
        break; 
      }
    }

    if (hitSomething) return; 

    // Check Destructibles
    for (const dest of this.destructibles) {
      if (dest.isDestroyed || (dest as any).isDestroying) continue;
      const dBounds = dest.getBounds();
      if (this.checkOverlap(attackHitbox, dBounds)) {
        this.player.hasHitCurrentAttack = true;

        const activeDamageType = this.inventory.getActiveDamageType();
        const damageInfo = {
          amount: GAME_CONFIG.PLAYER.ATTACK_DAMAGE,
          type: activeDamageType,
          knockback: { x: this.player.facing * 50, y: -50 },
          sourcePosition: { x: this.player.x, y: this.player.y }
        };

        dest.takeDamage(damageInfo as any, (type, x, y) => {
          this.collectibles.push({
            id: Math.random(),
            type, x, y, vx: (Math.random() - 0.5) * 120, vy: -150 - Math.random() * 100,
            width: 16, height: 16, isCollected: false, life: 0
          });
        }, (newParticles) => {
          this.particles.push(...newParticles);
        }, (x, y, text, color) => {
          this.addFloatingText(x, y, text, color);
        });

        if ((soundManager as any).playHitImpact) (soundManager as any).playHitImpact();
        this.triggerScreenShake(0.05, 3);
        
        break;
      }
    }
  }


  private spawnPlayerDamageInkParticles(x: number, y: number, dirX: number) {
    for (let i = 0; i < 15; i++) {
      this.particles.push({
        x: x + (Math.random() - 0.5) * 10,
        y: y + (Math.random() - 0.5) * 20,
        vx: dirX * (100 + Math.random() * 200) + (Math.random() - 0.5) * 50,
        vy: -150 - Math.random() * 200,
        color: GAME_CONFIG.PALETTE.PEN_PRIMARY,
        size: Math.random() * 3 + 1,
        life: 0,
        maxLife: 0.4 + Math.random() * 0.4,
        alpha: 1,
        shape: 'ink_slash',
        gravity: 800
      });
    }
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

    // 3b. Renderiza Collectibles
    if ((this.renderer as any).renderCollectibles) {
       (this.renderer as any).renderCollectibles(ctx, this.collectibles);
    }
    // 4. Renderiza Inimigos
    for (const enemy of this.enemies) {
      enemy.render(ctx, this.renderer);
    }

    // 4b. Renderiza Poças de Tinta (Abaixo do Jogador)
    this.renderer.renderAoePuddles(ctx, this.aoePuddles);
    
    // 5. Renderiza o Jogador (O Cavaleiro Arruinado)
    this.player.render(ctx, this.renderer, this.inventory.hasSaltCoating);

    // 5a1. Renderiza Aura Animada de Cura
    this.renderer.renderPlayerHealingAura(
      ctx,
      this.player.x,
      this.player.y,
      this.player.width,
      this.player.height,
      this.player.healingAuraTimer
    );

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
    
    // 6.5. Renderiza Fireballs
    this.renderer.renderFireballs(ctx, this.fireballs);

    // 7. Renderiza Textos Flutuantes de Dano
    this.renderer.renderFloatingTexts(ctx, this.floatingTexts);

    ctx.restore();

    // 8. HUD Completo (Vida, Estamina, Magia, Ascensão)
    this.renderer.renderPlayerHUD(ctx, this.player.hp, this.player.maxHp, this.player.stamina, this.player.maxStamina, this.player.mp, this.player.maxMp, this.getAscensionStats(), this.player.animTime);

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
