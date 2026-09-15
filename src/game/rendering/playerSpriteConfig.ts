/**
 * O Cavaleiro Arruinado - Player Sprite Definitions
 * Mapeamento da Spritesheet 128x128px com Linha (frameY), Quantidade de Quadros (maxFrames) e Taxa de Reprodução (fps)
 */

import { PlayerState } from '../types';

export interface SpriteAnimationConfig {
  frameY: number;        // Índice da linha na spritesheet (0, 1, 2)
  maxFrames: number;     // Quantidade de quadros disponíveis nesta animação
  fps: number;           // Taxa de quadros por segundo
  loop: boolean;         // Se a animação repete continuamente
  startFrameX?: number;  // Offset inicial de frameX na linha (opcional)
}

/**
 * Resolução nativa de cada célula na Spritesheet do Cavaleiro
 */
export const PLAYER_SPRITE_CELL_SIZE = 128;

/**
 * URL da Spritesheet do Cavaleiro (com alpha transparente)
 */
export const PLAYER_SPRITE_URL = '/player_sprites.png';

/**
 * Grid de Mapeamento dos Estados do Jogador para a Spritesheet 6x3:
 * - Linha 0 (frameY: 0): Movimentação (IDLE e RUN) - Quadros 01 a 06
 * - Linha 1 (frameY: 1): Ofensiva (ATTACK de espada e combos) - Quadros 07 a 12
 * - Linha 2 (frameY: 2): Defesa e Esquiva (BLOCK, DASH, HIT, DEATH) - Quadros 13 a 17
 */
export const PLAYER_SPRITE_CONFIG: Record<PlayerState, SpriteAnimationConfig> = {
  [PlayerState.IDLE]: {
    frameY: 0,
    maxFrames: 3,        // Poses 01 a 03 (Postura de guarda com respiração sutil)
    fps: 4,
    loop: true,
    startFrameX: 0,
  },
  [PlayerState.RUN]: {
    frameY: 0,
    maxFrames: 4,        // Poses 03 a 06 (Corrida com espada e escudo em avanço)
    fps: 10,
    loop: true,
    startFrameX: 2,
  },
  [PlayerState.JUMP]: {
    frameY: 0,
    maxFrames: 1,        // Pose 04 (Salto com espada estendida e capa flutuante)
    fps: 1,
    loop: false,
    startFrameX: 3,
  },
  [PlayerState.SPIN_JUMP]: {
    frameY: 1,
    maxFrames: 4,        // Poses 08 a 11 com arco circular de corte
    fps: 14,
    loop: true,
    startFrameX: 1,
  },
  [PlayerState.FALL]: {
    frameY: 0,
    maxFrames: 1,        // Pose 05 (Queda com pernas flexionadas)
    fps: 1,
    loop: false,
    startFrameX: 4,
  },
  [PlayerState.ATTACK]: {
    frameY: 1,
    maxFrames: 6,        // Poses 07 a 12 (Sequência completa de corte de espada e recuperação)
    fps: 14,
    loop: false,
    startFrameX: 0,
  },
  [PlayerState.DASH]: {
    frameY: 2,
    maxFrames: 3,        // Poses 15 a 17 (Esquiva baixa, escudo à frente, linhas de velocidade)
    fps: 12,
    loop: false,
    startFrameX: 2,
  },
  [PlayerState.USE_ITEM]: {
    frameY: 2,
    maxFrames: 2,        // Poses 13 a 14 (Defesa/Preparo sagrado com escudo erguido)
    fps: 6,
    loop: false,
    startFrameX: 0,
  },
  [PlayerState.HIT]: {
    frameY: 2,
    maxFrames: 1,        // Pose 14 (Recuo com impacto no escudo)
    fps: 1,
    loop: false,
    startFrameX: 1,
  },
  [PlayerState.DEATH]: {
    frameY: 2,
    maxFrames: 1,        // Pose 14 ou repouso no chão
    fps: 1,
    loop: false,
    startFrameX: 1,
  },
};
