/**
 * O Cavaleiro Arruinado - SectionManager
 * Gerenciador de Seções e Gatilhos de Borda de Tela (Multi-Zone Level Management)
 * Controla transições suaves entre áreas do mapa com efeitos de pergaminho/tinta,
 * banners góticos de localização e persistência de estado do jogador.
 */

import { Direction, Rect } from '../types';
import { Player } from '../entities/Player';
import { soundManager } from '../audio/synth';
import { BiomeTheme, EdgeTrigger, SectionData, SECTIONS_DATA } from './Section';

export interface TransitionState {
  active: boolean;
  phase: 'FADE_OUT' | 'FADE_IN' | 'IDLE';
  alpha: number; // 0 a 1 (opacidade do escurecimento/vinheta de tinta)
  timer: number;
  sectionName: string;
  sectionSubtitle: string;
}

export class SectionManager {
  public currentSectionId: string = 'monastery_courtyard';
  public currentSection: SectionData;

  // Estado de Transição entre Borda de Tela
  public isTransitioning: boolean = false;
  public transitionAlpha: number = 0;
  private transitionPhase: 'FADE_OUT' | 'FADE_IN' | 'IDLE' = 'IDLE';
  private transitionTimer: number = 0;
  private pendingTarget: {
    sectionId: string;
    targetX: number;
    targetY: number;
    targetDirection: Direction;
  } | null = null;

  // Banner gótico da seção ativa na tela
  public bannerTitle: string = '';
  public bannerSubtitle: string = '';
  public bannerTimer: number = 0;
  public bannerAlpha: number = 0;

  // Gatilho ativo próximo (para desenhar prompt e partículas no portal)
  public nearbyTrigger: EdgeTrigger | null = null;

  // Callback ao comutar de seção para recarregar entidades no GameEngine
  private onSectionSwitchedCallback?: (section: SectionData, targetX: number, targetY: number, dir: Direction) => void;

  constructor(initialSectionId: string = 'monastery_courtyard') {
    this.currentSectionId = initialSectionId;
    this.currentSection = SECTIONS_DATA[initialSectionId] || SECTIONS_DATA.monastery_courtyard;
    this.showBanner(this.currentSection.name, this.currentSection.subtitle);
  }

  public setOnSectionSwitched(callback: (section: SectionData, targetX: number, targetY: number, dir: Direction) => void) {
    this.onSectionSwitchedCallback = callback;
  }

  public showBanner(title: string, subtitle: string) {
    this.bannerTitle = title;
    this.bannerSubtitle = subtitle;
    this.bannerTimer = 3.5;
    this.bannerAlpha = 1;
  }

  /**
   * Verifica se o jogador está colidindo com algum gatilho de borda de tela
   */
  public update(dt: number, player: Player): void {
    // 1. Atualiza Banner de Título da Seção
    if (this.bannerTimer > 0) {
      this.bannerTimer -= dt;
      if (this.bannerTimer < 1.0) {
        this.bannerAlpha = Math.max(0, this.bannerTimer);
      } else {
        this.bannerAlpha = 1;
      }
    } else {
      this.bannerAlpha = 0;
    }

    // 2. Processa ciclo de transição em andamento
    if (this.isTransitioning) {
      this.transitionTimer += dt;

      if (this.transitionPhase === 'FADE_OUT') {
        // Escurece tela em direção ao pico (0.35s)
        this.transitionAlpha = Math.min(1, this.transitionTimer / 0.35);
        if (this.transitionTimer >= 0.35) {
          // Pico da transição: comuta a seção
          if (this.pendingTarget) {
            this.executeSwitch(
              this.pendingTarget.sectionId,
              this.pendingTarget.targetX,
              this.pendingTarget.targetY,
              this.pendingTarget.targetDirection
            );
            this.pendingTarget = null;
          }
          this.transitionPhase = 'FADE_IN';
          this.transitionTimer = 0;
        }
      } else if (this.transitionPhase === 'FADE_IN') {
        // Clareia tela de volta (0.45s)
        this.transitionAlpha = Math.max(0, 1 - (this.transitionTimer / 0.45));
        if (this.transitionTimer >= 0.45) {
          this.isTransitioning = false;
          this.transitionPhase = 'IDLE';
          this.transitionAlpha = 0;
        }
      }
      return; // Durante a transição não checa novos gatilhos
    }

    // 3. Detecta proximidade e colisão com gatilhos de borda
    this.nearbyTrigger = null;
    const playerRect: Rect = {
      x: player.x,
      y: player.y,
      width: player.width,
      height: player.height,
    };

    for (const trigger of this.currentSection.edgeTriggers) {
      // Checa se o jogador está próximo da borda (para desenhar indicador e setas)
      const isNearby = this.isPlayerNearTrigger(player, trigger, 180);
      if (isNearby) {
        this.nearbyTrigger = trigger;
      }

      // Checa colisão física com a zona do gatilho de borda
      if (this.checkOverlap(playerRect, trigger.bounds)) {
        this.triggerTransition(trigger);
        break;
      }
    }
  }

  /**
   * Inicia a transição de tela para a seção de destino
   */
  public triggerTransition(trigger: EdgeTrigger): void {
    if (this.isTransitioning) return;

    soundManager.playSectionTransition();
    this.isTransitioning = true;
    this.transitionPhase = 'FADE_OUT';
    this.transitionTimer = 0;
    this.transitionAlpha = 0;

    this.pendingTarget = {
      sectionId: trigger.targetSectionId,
      targetX: trigger.targetPlayerX,
      targetY: trigger.targetPlayerY,
      targetDirection: trigger.targetDirection,
    };
  }

  /**
   * Inicia transição gradual com efeito de dissolução para uma seção específica
   */
  public startTransition(sectionId: string, spawnSide: 'LEFT' | 'RIGHT' = 'LEFT'): void {
    const nextData = SECTIONS_DATA[sectionId];
    if (!nextData || this.isTransitioning) return;

    const targetX = spawnSide === 'LEFT' ? 90 : nextData.width - 130;
    const targetY = 360;
    const dir = spawnSide === 'LEFT' ? Direction.RIGHT : Direction.LEFT;

    soundManager.playSectionTransition();
    this.isTransitioning = true;
    this.transitionPhase = 'FADE_OUT';
    this.transitionTimer = 0;
    this.transitionAlpha = 0;

    this.pendingTarget = {
      sectionId,
      targetX,
      targetY,
      targetDirection: dir,
    };
  }

  /**
   * Comutação instantânea direta (para menu de navegação ou reset)
   */
  public directSwitchSection(sectionId: string, targetX?: number, targetY?: number): boolean {
    const nextData = SECTIONS_DATA[sectionId];
    if (!nextData) return false;

    soundManager.playSectionTransition();
    const spawnX = targetX !== undefined ? targetX : 80;
    const spawnY = targetY !== undefined ? targetY : 360;

    this.executeSwitch(sectionId, spawnX, spawnY, Direction.RIGHT);
    return true;
  }

  private executeSwitch(sectionId: string, targetX: number, targetY: number, dir: Direction) {
    const nextData = SECTIONS_DATA[sectionId];
    if (!nextData) return;

    this.currentSectionId = sectionId;
    this.currentSection = nextData;
    this.showBanner(nextData.name, nextData.subtitle);

    if (this.onSectionSwitchedCallback) {
      this.onSectionSwitchedCallback(nextData, targetX, targetY, dir);
    }
  }

  private isPlayerNearTrigger(player: Player, trigger: EdgeTrigger, distanceThreshold: number): boolean {
    const pCenter = player.x + player.width / 2;
    if (trigger.side === 'LEFT') {
      return pCenter < distanceThreshold;
    } else if (trigger.side === 'RIGHT') {
      return pCenter > this.currentSection.width - distanceThreshold;
    }
    return false;
  }

  private checkOverlap(r1: Rect, r2: Rect): boolean {
    return (
      r1.x < r2.x + r2.width &&
      r1.x + r1.width > r2.x &&
      r1.y < r2.y + r2.height &&
      r1.y + r1.height > r2.y
    );
  }

  // Getters auxiliares da seção atual
  public get width(): number {
    return this.currentSection.width;
  }

  public get height(): number {
    return this.currentSection.height;
  }

  public get theme(): BiomeTheme {
    return this.currentSection.theme;
  }

  public get platforms() {
    return this.currentSection.platforms;
  }

  public get saltAltars() {
    return this.currentSection.saltAltars;
  }

  public get loreNotes() {
    return this.currentSection.loreNotes;
  }

  public get edgeTriggers() {
    return this.currentSection.edgeTriggers;
  }

  public get enemySpawns() {
    return this.currentSection.enemySpawns;
  }

  public get npcConfigs() {
    return this.currentSection.npcConfigs;
  }
}
