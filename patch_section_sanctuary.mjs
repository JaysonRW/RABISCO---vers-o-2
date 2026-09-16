import fs from 'fs';
let code = fs.readFileSync('src/game/world/Section.ts', 'utf8');

// 1. Add BiomeTheme
code = code.replace(
  "export type BiomeTheme = 'MONASTERY' | 'FOREST' | 'CRYPT';",
  "export type BiomeTheme = 'MONASTERY' | 'FOREST' | 'CRYPT' | 'CRIMSON_SANCTUARY';"
);

// 2. Add sanctuary_interior to SECTIONS_DATA
const sanctuaryData = `
  sanctuary_interior: {
    id: 'sanctuary_interior',
    name: 'Santuário Carmim',
    subtitle: 'O Núcleo da Corrupção',
    theme: 'CRIMSON_SANCTUARY',
    width: 800,
    height: 540,
    platforms: [
      { x: 0, y: 460, width: 800, height: 80, type: 'GROUND' },
      { x: 280, y: 180, width: 240, height: 24, type: 'FLOATING' } // Altar for Lorde Carmim
    ],
    saltAltars: [],
    loreNotes: [],
    edgeTriggers: [],
    enemySpawns: [],
    destructibles: [],
    npcConfigs: [
      {
        id: 'lorde_carmim',
        name: 'Lorde Carmim',
        title: 'A Tinta Primordial',
        x: 380, // Center top
        y: 60, // Above the floating platform
        role: 'SPIRIT',
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
                text: '« Preparar para o embate »',
                actionId: 'START_CLIMAX'
              }
            ]
          }
        ]
      }
    ]
  },
`;

code = code.replace(
  'export const SECTIONS_DATA: Record<string, SectionData> = {',
  'export const SECTIONS_DATA: Record<string, SectionData> = {\n' + sanctuaryData
);

fs.writeFileSync('src/game/world/Section.ts', code);
