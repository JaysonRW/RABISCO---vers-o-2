/**
 * O Cavaleiro Arruinado - Configurações Gerais da Engine
 * Constantes de Física, Cores e Dimensões
 */

export const GAME_CONFIG = {
  // Resolução virtual interna da cena (proporção 16:9)
  CANVAS_WIDTH: 960,
  CANVAS_HEIGHT: 540,

  // Física do Jogador
  PLAYER: {
    WIDTH: 36,
    HEIGHT: 64,
    MOVE_SPEED: 260,
    JUMP_FORCE: -540,
    SPIN_JUMP_FORCE: -510,
    SPIN_JUMP_DURATION: 0.38,
    SPIN_JUMP_FORWARD_BOOST: 90,
    GRAVITY: 1280,
    MAX_FALL_SPEED: 700,
    DASH_SPEED: 520,
    DASH_DURATION: 0.22,
    DASH_COOLDOWN: 0.7,
    ATTACK_DURATION: 0.28,
    ATTACK_RANGE: 58,
    ATTACK_DAMAGE: 20,
    MAX_HP: 100,
    MAX_STAMINA: 100,
    INVULNERABLE_TIME: 0.6,
    SALT_COATING_DURATION: 12.0, // segundos de duração do buff "Arma com Sal"
  },

  // Inimigo Fantasma (Ghost / Espectro)
  GHOST: {
    WIDTH: 44,
    HEIGHT: 68,
    PATROL_SPEED: 65,
    CHASE_SPEED: 120,
    MAX_HP: 60,
    DAMAGE: 15,
    ATTACK_COOLDOWN: 1.5,
    DETECTION_RADIUS: 240,
  },
  SKULL: {
    WIDTH: 32,
    HEIGHT: 32,
    MAX_HP: 1,
    DAMAGE: 0,
  },

  // Sistema de Almas e Ascensão
  ASCENSION: {
    SOULS_BASE_REQ: 4,           // Almas para atingir o Nível 1
    SOULS_SCALE_MULTIPLIER: 1.6, // Escala de almas necessárias por nível
    MAX_LEVEL: 5,
    LEVEL_INFO: [
      { level: 0, title: 'Cavaleiro Arruinado', bonusText: 'Alma atormentada pelas ruínas', damageMult: 1.0 },
      { level: 1, title: 'Despertar das Cinzas', bonusText: '+15% de Dano & Aura Espectral', damageMult: 1.15 },
      { level: 2, title: 'Lâmina Purificada', bonusText: '+30% de Dano & Rápida Recuperação', damageMult: 1.30 },
      { level: 3, title: 'Cruzado dos Abismos', bonusText: '+50% de Dano & Ímã de Almas Ampliado', damageMult: 1.50 },
      { level: 4, title: 'Exorcista Sagrado', bonusText: '+75% de Dano & Transcendência', damageMult: 1.75 },
      { level: 5, title: 'Ascensão Divina Suprema', bonusText: '+100% de Dano & Imortalidade Espiritual', damageMult: 2.0 },
    ],
  },

  // Paleta de Arte: Caneta Esferográfica Azul sobre Pergaminho Envelhecido
  PALETTE: {
    // Papel e Pergaminho
    PAPER_BG: '#FFFFFF',           // Fundo branco puro (sem efeito amarelado)
    PAPER_ACCENT: '#F0F0F0',       // Sombra do papel / dobras levemente cinza
    NOTEBOOK_LINE: 'rgba(30, 70, 160, 0.12)', // Pauta de caderno sutil
    MARGIN_LINE: 'rgba(210, 60, 60, 0.25)',  // Linha vermelha lateral de margem

    // Caneta Esferográfica Azul (tons monocromáticos profundos)
    PEN_PRIMARY: '#0A2570',        // Azul escuro caneta esferográfica principal
    PEN_SECONDARY: '#143D99',      // Azul médio hachura
    PEN_LIGHT: '#255AC4',          // Azul claro reflexo/traço rápido
    PEN_DARKEST: '#051442',        // Azul quase negro (contorno reforçado)
    PEN_HATCHING: 'rgba(10, 37, 112, 0.45)', // Hachura semitransparente

    // Exceções de Cor (Destaques Mecânicos / FX do GDD)
    FX_BLOOD_RED: '#C81E1E',       // Vermelho Sangue: Dano crítico / perigo
    FX_ACID_GREEN: '#10B981',      // Verde Ácido: Veneno, aura de espectros
    FX_HOLY_GOLD: '#F59E0B',       // Amarelo Ouro / Luz Sagrada: Sal, crucifixo
    FX_HOLY_WHITE: '#FFFBEB',      // Branco brilhante divino
    FX_CURSE_PURPLE: '#8B5CF6',    // Roxo/Magenta: Magia negra, portais
    FX_SOUL_CYAN: '#06B6D4',       // Ciano etéreo para Almas Coletáveis
    FX_SOUL_AURA: '#38BDF8',       // Halo de resplendor da alma
    FX_SOUL_CORE: '#E0F2FE',       // Núcleo branco-azulado de alma
  },
};
