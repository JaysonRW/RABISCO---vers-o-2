/**
 * O Cavaleiro Arruinado - Game Types & Interfaces
 * Arquitetura e Modelos de Dados do RPG de Ação 2D
 */

export enum PlayerState {
  IDLE = 'IDLE',
  RUN = 'RUN',
  JUMP = 'JUMP',
  SPIN_JUMP = 'SPIN_JUMP',
  FALL = 'FALL',
  DASH = 'DASH',
  ATTACK = 'ATTACK',
  USE_ITEM = 'USE_ITEM',
  HIT = 'HIT',
  DEATH = 'DEATH',
}

export enum Direction {
  LEFT = -1,
  RIGHT = 1,
}

export enum DamageType {
  PHYSICAL = 'PHYSICAL',       // Ataque de espada comum
  SALT = 'SALT',               // Sal Purificador (Fraqueza de Fantasmas/Espectros)
  HOLY = 'HOLY',               // Magia Divina / Crucifixo
  FIRE = 'FIRE',               // Fogo (Fraqueza de Zumbis/Demônios)
  WOOD_STAKE = 'WOOD_STAKE',   // Estaca de Madeira (Fraqueza de Vampiros)
  HOLY_WATER = 'HOLY_WATER',   // Água Benta
}

export enum EnemyType {
  GHOST = 'GHOST',             // Espectro / Fantasma
  VAMPIRE = 'VAMPIRE',         // Vampiro
  ZOMBIE = 'ZOMBIE',           // Zumbi
  SKELETON = 'SKELETON',       // Esqueleto
}

export interface DamageInfo {
  amount: number;
  type: DamageType;
  isCritical?: boolean;
  knockback: { x: number; y: number };
  sourcePosition: { x: number; y: number };
}

export interface DamageResult {
  dealt: number;
  isImmune: boolean;
  isWeakness: boolean;
  defeated: boolean;
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Item {
  id: string;
  name: string;
  description: string;
  type: 'WEAPON' | 'COATING' | 'RELIC' | 'CONSUMABLE';
  damageType?: DamageType;
  icon: string;
  count?: number;
  maxCount?: number;
  isPassive?: boolean;
}

export type ParticleShape =
  | 'dot'
  | 'spark'
  | 'cross'
  | 'ink_splatter'
  | 'ink_droplet'
  | 'ink_slash'
  | 'pen_scratch'
  | 'ink_blot';

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  life: number;
  maxLife: number;
  alpha: number;
  gravity?: number;
  drag?: number;             // Resistência do ar / desaceleração da gota de tinta
  shape?: ParticleShape;
  rotation?: number;         // Rotação em radianos
  vRot?: number;             // Velocidade de rotação
  satellites?: { dx: number; dy: number; r: number }[]; // Micro-gotículas de respingo orgânico
  scratchLines?: { dx1: number; dy1: number; dx2: number; dy2: number; width: number }[]; // Riscos de corte com caneta
}

export interface FloatingText {
  id: number;
  x: number;
  y: number;
  text: string;
  color: string;
  alpha: number;
  vy: number;
  scale: number;
  life: number;
  maxLife: number;
}

export interface SoulOrb {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  value: number;
  life: number;
  maxLife: number;
  animTime: number;
  collected: boolean;
  targetX?: number;
  targetY?: number;
}

export interface AscensionStats {
  souls: number;
  soulsCurrentLevel: number;
  soulsNeededForNext: number;
  level: number;
  progressPercent: number;
  title: string;
  bonusText: string;
  damageMultiplier: number;
}

export interface Collectible {
  id: number;
  type: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  isCollected: boolean;
  life: number;
}
