/**
 * O Cavaleiro Arruinado - Section / Multi-Zone Definitions
 * Definições completas de seções de cenário (Pátio do Monastério, Floresta Corrompida, Cripta Esquecida)
 * com temas visuais de caneta, plataformas, altares de sal, lore e gatilhos de borda.
 */

import { Direction, Rect } from '../types';
import { PlatformData, SaltAltar, LoreNote } from './Level';
import { NpcDialogNode } from '../entities/NPC';

export type BiomeTheme = 'MONASTERY' | 'FOREST' | 'CRYPT' | 'CRIMSON_SANCTUARY';

export interface EdgeTrigger {
  id: string;
  side: 'LEFT' | 'RIGHT';
  bounds: Rect;
  targetSectionId: string;
  targetPlayerX: number;
  targetPlayerY: number;
  targetDirection: Direction;
  label: string;
}

export interface EnemySpawnConfig {
  id: string;
  type: 'GHOST' | 'GHOUL' | 'ZOMBIE' | 'SKULL';
  x: number;
  y: number;
  patrolMinX?: number;
  patrolMaxX?: number;
}

export interface NpcSpawnConfig {
  id: string;
  name: string;
  title: string;
  x: number;
  y: number;
  dialogs: NpcDialogNode[];
  role: 'HERMIT' | 'SPIRIT';
  autoTriggerDistance?: number;
}

export interface DestructibleConfig {
  id: string;
  type: 'box' | 'vase' | 'rubble' | 'urn' | 'bone_wall';
  x: number;
  y: number;
}

export interface SectionData {
  id: string;
  name: string;
  subtitle: string;
  theme: BiomeTheme;
  width: number;
  height: number;
  platforms: PlatformData[];
  saltAltars: SaltAltar[];
  loreNotes: LoreNote[];
  edgeTriggers: EdgeTrigger[];
  enemySpawns: EnemySpawnConfig[];
  npcConfigs: NpcSpawnConfig[];
  destructibles?: DestructibleConfig[];
}

export const SECTIONS_DATA: Record<string, SectionData> = {

  sanctuary_interior: {
    id: 'sanctuary_interior',
    name: 'Santuário Carmim',
    subtitle: 'O Núcleo da Corrupção',
    theme: 'CRIMSON_SANCTUARY',
    width: 960,
    height: 540,
    platforms: [
      { x: 0, y: 460, width: 960, height: 80, type: 'GROUND' }
    ],
    saltAltars: [],
    loreNotes: [],
    edgeTriggers: [],
    enemySpawns: [],
    destructibles: [
      { id: 's_box_1', type: 'box', x: 180, y: 420 },
      { id: 's_box_2', type: 'box', x: 220, y: 420 },
      { id: 's_box_3', type: 'box', x: 780, y: 420 }
    ],
    npcConfigs: [
      {
        id: 'lorde_carmim',
        name: 'Lorde Carmim',
        title: 'A Tinta Primordial',
        x: 461, // Center of 960 canvas (960/2 = 480, adjusted for width 38)
        y: 398, // Standing on the floor (460 - 62)
        role: 'SPIRIT',
        autoTriggerDistance: 260,
        dialogs: [
          {
            id: 'confrontation',
            speaker: 'Lorde Carmim',
            lines: [
              'Lorde Carmim: "Então este é o famoso Nankin... O último traço de esperança deste mundo."',
              'Nankin: "Vou apagar você e sua corrupção, Carmim."',
              'Lorde Carmim: "Hahaha! Rascunho tolo. Sua tinta vai secar antes mesmo de encostar em mim. Contemple a verdadeira obra!"'
            ],
            choices: [
              {
                text: '« Sobreviva a Aventura »',
                actionId: 'START_CLIMAX'
              }
            ]
          }
        ]
      }
    ]
  },

  // ==========================================================================
  // SEÇÃO 1: PÁTIO DO MONASTÉRIO (Santuário de Entrada & Eremita do Sal)
  // ==========================================================================
  monastery_courtyard: {
    id: 'monastery_courtyard',
    name: 'Pátio do Monastério',
    subtitle: 'O Santuário das Cruzes',
    theme: 'MONASTERY',
    width: 2400,
    height: 540,
    platforms: [
      // Solo contínuo do pátio
      { x: 0, y: 440, width: 840, height: 100, type: 'GROUND' },
      // Fossa intermediária
      { x: 960, y: 440, width: 880, height: 100, type: 'GROUND' },
      { x: 1960, y: 440, width: 440, height: 100, type: 'GROUND' },

      // Plataformas suspensas do pátio
      { x: 280, y: 340, width: 150, height: 24, type: 'FLOATING' },
      { x: 480, y: 260, width: 170, height: 24, type: 'FLOATING' },
      { x: 740, y: 360, width: 140, height: 20, type: 'WOOD' },
      { x: 1140, y: 330, width: 160, height: 24, type: 'FLOATING' },
      { x: 1420, y: 250, width: 180, height: 24, type: 'FLOATING' },
      { x: 1700, y: 330, width: 150, height: 20, type: 'WOOD' },
      { x: 2040, y: 340, width: 160, height: 24, type: 'FLOATING' },

      // Paredes de limite
      { x: 0, y: 0, width: 24, height: 540, type: 'GROUND' }, // Parede esquerda absoluta
    ],
    saltAltars: [
      { x: 540, y: 222, width: 42, height: 38, hasRefill: true },
      { x: 1480, y: 212, width: 42, height: 38, hasRefill: true },
    ],
    loreNotes: [],
    edgeTriggers: [
      {
        id: 'trigger_to_forest',
        side: 'RIGHT',
        bounds: { x: 2320, y: 0, width: 80, height: 540 },
        targetSectionId: 'corrupted_forest',
        targetPlayerX: 80,
        targetPlayerY: 370,
        targetDirection: Direction.RIGHT,
        label: 'Avançar para Floresta Corrompida »',
      },
      {
        id: 'trigger_to_sanctuary',
        side: 'LEFT',
        bounds: { x: 0, y: 0, width: 80, height: 540 },
        targetSectionId: 'sanctuary_interior',
        targetPlayerX: 80, // Left edge of sanctuary
        targetPlayerY: 370,
        targetDirection: Direction.RIGHT,
        label: '« Adentrar o Santuário',
      },
    ],
    enemySpawns: [
      { id: 'm_ghost_1', type: 'GHOST', x: 560, y: 210 },
      { id: 'm_ghoul_1', type: 'GHOUL', x: 1220, y: 388, patrolMinX: 1000, patrolMaxX: 1550 },
      { id: 'm_ghost_2', type: 'GHOST', x: 1540, y: 200 },
      { id: 'm_skull_1', type: 'SKULL', x: 350, y: 200 },
      { id: 'm_skull_2', type: 'SKULL', x: 850, y: 250 },
      { id: 'm_skull_3', type: 'SKULL', x: 1800, y: 200 },
    ],
    destructibles: [
      { id: 'm_box_1', type: 'box', x: 150, y: 400 },
      { id: 'm_box_2', type: 'box', x: 190, y: 400 },
      { id: 'm_box_3', type: 'box', x: 1020, y: 400 },
      { id: 'm_box_4', type: 'box', x: 1060, y: 400 },
      { id: 'm_box_5', type: 'box', x: 2120, y: 400 },
    ],
    npcConfigs: [
      {
        id: 'hermit_monk',
        name: 'Frei Anselmo',
        title: 'O Eremita do Sal',
        x: 180,
        y: 378,
        role: 'HERMIT',
        dialogs: [
          {
            id: 'greeting',
            speaker: 'Frei Anselmo',
            lines: [
              '«Saudações, Cavaleiro Arruinado. Meus olhos cegaram há anos, mas sinto o odor de sal e a ressonância das cinzas em tua lâmina.»',
              '«A Floresta Corrompida a leste está tomada por raízes amaldiçoadas e espectros famintos.»',
              '«Traga-me almas libertadas das trevas e eu curarei tuas chagas ou abençoarei tuas bolsas de sal.»',
            ],
            choices: [
              {
                text: 'Curar feridas mortais (Restaura 50 de Vida)',
                soulCost: 2,
                actionId: 'HEAL',
              },
              {
                text: 'Receber 4 Frascos de Sal Consagrado',
                soulCost: 3,
                actionId: 'REFILL_SALT',
              },
              {
                text: 'Bênção de Vigor (Restaura Estamina Completa)',
                soulCost: 1,
                actionId: 'BLESS_STAMINA',
              },
              {
                text: '«Retornarei quando o caminho estiver limpo, Frei.»',
                actionId: 'CLOSE',
              },
            ],
          },
        ],
      },
    ],
  },

  // ==========================================================================
  // SEÇÃO 2: FLORESTA CORROMPIDA (O Bosque das Raízes Negras)
  // ==========================================================================
  corrupted_forest: {
    id: 'corrupted_forest',
    name: 'Floresta Corrompida',
    subtitle: 'O Bosque das Raízes Negras',
    theme: 'FOREST',
    width: 2600,
    height: 540,
    platforms: [
      // Solo do pântano da floresta com abismos de espinhos
      { x: 0, y: 440, width: 620, height: 100, type: 'GROUND' },
      { x: 740, y: 440, width: 840, height: 100, type: 'GROUND' },
      { x: 1720, y: 440, width: 880, height: 100, type: 'GROUND' },

      // Andaimes de madeira e galhos flutuantes entrelaçados
      { x: 220, y: 340, width: 160, height: 20, type: 'WOOD' },
      { x: 440, y: 250, width: 170, height: 20, type: 'WOOD' },
      { x: 610, y: 340, width: 140, height: 20, type: 'WOOD' }, // ponte sobre o primeiro abismo

      { x: 880, y: 310, width: 170, height: 24, type: 'FLOATING' },
      { x: 1140, y: 220, width: 210, height: 24, type: 'FLOATING' }, // copa da árvore mística
      { x: 1420, y: 310, width: 160, height: 20, type: 'WOOD' },
      { x: 1580, y: 350, width: 150, height: 20, type: 'WOOD' }, // ponte sobre o segundo abismo

      { x: 1840, y: 280, width: 180, height: 24, type: 'FLOATING' },
      { x: 2120, y: 220, width: 220, height: 24, type: 'FLOATING' },
      { x: 2380, y: 330, width: 160, height: 20, type: 'WOOD' },
    ],
    saltAltars: [
      { x: 1220, y: 182, width: 42, height: 38, hasRefill: true },
      { x: 2200, y: 182, width: 42, height: 38, hasRefill: true },
    ],
    loreNotes: [],
    edgeTriggers: [
      {
        id: 'forest_to_monastery',
        side: 'LEFT',
        bounds: { x: 0, y: 0, width: 70, height: 540 },
        targetSectionId: 'monastery_courtyard',
        targetPlayerX: 2240,
        targetPlayerY: 370,
        targetDirection: Direction.LEFT,
        label: '« Retornar ao Pátio do Monastério',
      },
      {
        id: 'forest_to_crypt',
        side: 'RIGHT',
        bounds: { x: 2520, y: 0, width: 80, height: 540 },
        targetSectionId: 'forgotten_crypt',
        targetPlayerX: 80,
        targetPlayerY: 370,
        targetDirection: Direction.RIGHT,
        label: 'Descer para a Cripta Esquecida »',
      },
    ],
    enemySpawns: [
      { id: 'f_ghoul_1', type: 'GHOUL', x: 420, y: 388, patrolMinX: 100, patrolMaxX: 580 },
      { id: 'f_ghost_1', type: 'GHOST', x: 680, y: 220 },
      { id: 'f_ghoul_2', type: 'GHOUL', x: 1050, y: 388, patrolMinX: 800, patrolMaxX: 1450 },
      { id: 'f_ghost_2', type: 'GHOST', x: 1200, y: 170 },
      { id: 'f_ghoul_3', type: 'GHOUL', x: 1980, y: 388, patrolMinX: 1760, patrolMaxX: 2360 },
      { id: 'f_ghost_3', type: 'GHOST', x: 2260, y: 170 },
      { id: 'f_skull_1', type: 'SKULL', x: 500, y: 150 },
      { id: 'f_skull_2', type: 'SKULL', x: 1400, y: 180 },
      { id: 'f_skull_3', type: 'SKULL', x: 2100, y: 200 },
    ],
    destructibles: [
      { id: 'f_box_1', type: 'box', x: 160, y: 400 },
      { id: 'f_box_2', type: 'box', x: 210, y: 400 },
      { id: 'f_box_3', type: 'box', x: 800, y: 400 },
      { id: 'f_box_4', type: 'box', x: 1750, y: 400 },
      { id: 'f_bone_1', type: 'bone_wall', x: 1400, y: 360 },
      { id: 'f_bone_2', type: 'bone_wall', x: 2100, y: 360 },
    ],
    npcConfigs: [],
  },

  // ==========================================================================
  // SEÇÃO 3: CRIPTA ESQUECIDA (As Catacumbas dos Mártires)
  // ==========================================================================
  forgotten_crypt: {
    id: 'forgotten_crypt',
    name: 'Cripta Esquecida',
    subtitle: 'As Catacumbas dos Mártires',
    theme: 'CRYPT',
    width: 2600,
    height: 540,
    platforms: [
      // Solo das catacumbas com abismos do fosso eterno
      { x: 0, y: 440, width: 720, height: 100, type: 'GROUND' },
      { x: 860, y: 440, width: 900, height: 100, type: 'GROUND' },
      { x: 1900, y: 440, width: 700, height: 100, type: 'GROUND' },

      // Pilares de pedra gótica e degraus de sepulcros
      { x: 240, y: 340, width: 160, height: 24, type: 'FLOATING' },
      { x: 480, y: 250, width: 190, height: 24, type: 'FLOATING' },
      { x: 740, y: 330, width: 140, height: 20, type: 'WOOD' },

      { x: 980, y: 310, width: 170, height: 24, type: 'FLOATING' },
      { x: 1240, y: 220, width: 220, height: 24, type: 'FLOATING' }, // Grande câmara funerária
      { x: 1540, y: 310, width: 170, height: 20, type: 'WOOD' },
      { x: 1740, y: 340, width: 140, height: 20, type: 'WOOD' },

      { x: 1980, y: 270, width: 200, height: 24, type: 'FLOATING' },
      { x: 2260, y: 210, width: 220, height: 24, type: 'FLOATING' },

      // Parede direita final que sela o portal
      { x: 2576, y: 0, width: 24, height: 540, type: 'GROUND' },
    ],
    saltAltars: [
      { x: 1330, y: 182, width: 42, height: 38, hasRefill: true },
      { x: 2340, y: 172, width: 42, height: 38, hasRefill: true },
    ],
    loreNotes: [],
    edgeTriggers: [
      {
        id: 'crypt_to_forest',
        side: 'LEFT',
        bounds: { x: 0, y: 0, width: 70, height: 540 },
        targetSectionId: 'corrupted_forest',
        targetPlayerX: 2440,
        targetPlayerY: 370,
        targetDirection: Direction.LEFT,
        label: '« Retornar à Floresta Corrompida',
      },
    ],
    enemySpawns: [
      // Horda de zumbis
      { id: 'z1', type: 'ZOMBIE', x: 300, y: 388, patrolMinX: 200, patrolMaxX: 680 },
      { id: 'z2', type: 'ZOMBIE', x: 450, y: 388, patrolMinX: 200, patrolMaxX: 680 },
      { id: 'z3', type: 'ZOMBIE', x: 600, y: 388, patrolMinX: 200, patrolMaxX: 680 },
      { id: 'z4', type: 'ZOMBIE', x: 900, y: 388, patrolMinX: 860, patrolMaxX: 1650 },
      { id: 'z5', type: 'ZOMBIE', x: 1100, y: 388, patrolMinX: 860, patrolMaxX: 1650 },
      { id: 'z6', type: 'ZOMBIE', x: 1300, y: 388, patrolMinX: 860, patrolMaxX: 1650 },
      { id: 'z7', type: 'ZOMBIE', x: 1500, y: 388, patrolMinX: 860, patrolMaxX: 1650 },
      { id: 'z8', type: 'ZOMBIE', x: 1950, y: 388, patrolMinX: 1900, patrolMaxX: 2480 },
      { id: 'z9', type: 'ZOMBIE', x: 2150, y: 388, patrolMinX: 1900, patrolMaxX: 2480 },
      { id: 'z10', type: 'ZOMBIE', x: 2350, y: 388, patrolMinX: 1900, patrolMaxX: 2480 },
      // Caveiras flutuantes
      { id: 'c_skull_1', type: 'SKULL', x: 400, y: 200 },
      { id: 'c_skull_2', type: 'SKULL', x: 800, y: 150 },
      { id: 'c_skull_3', type: 'SKULL', x: 1600, y: 180 },
      { id: 'c_skull_4', type: 'SKULL', x: 2000, y: 150 },
    ],
    destructibles: [
      { id: 'crypt_urn1', type: 'urn', x: 280, y: 298 },
      { id: 'crypt_urn2', type: 'urn', x: 500, y: 208 },
      { id: 'crypt_urn3', type: 'urn', x: 1020, y: 268 },
      { id: 'crypt_urn4', type: 'urn', x: 1250, y: 178 },
      { id: 'crypt_urn5', type: 'urn', x: 2050, y: 228 },
      { id: 'crypt_urn6', type: 'urn', x: 600, y: 398 }, // No chão
      { id: 'crypt_urn7', type: 'urn', x: 1600, y: 398 }, // No chão
      { id: 'crypt_bone_1', type: 'bone_wall', x: 700, y: 360 }, 
      { id: 'crypt_bone_2', type: 'bone_wall', x: 1720, y: 360 },
      { id: 'crypt_bone_3', type: 'bone_wall', x: 2100, y: 360 },
    ],
    npcConfigs: [],
  },
};
