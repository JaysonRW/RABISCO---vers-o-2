import fs from 'fs';
let code = fs.readFileSync('src/game/world/Section.ts', 'utf8');

const oldSanctuary = `  sanctuary_interior: {
    id: 'sanctuary_interior',
    name: 'Santuário Carmim',
    subtitle: 'O Núcleo da Corrupção',
    theme: 'CRIMSON_SANCTUARY',
    width: 800,
    height: 540,
    platforms: [
      { x: 0, y: 460, width: 800, height: 80, type: 'GROUND' },
      { x: 280, y: 180, width: 240, height: 24, type: 'FLOATING' } // Altar for Lorde Carmim
    ],`;

const newSanctuary = `  sanctuary_interior: {
    id: 'sanctuary_interior',
    name: 'Santuário Carmim',
    subtitle: 'O Núcleo da Corrupção',
    theme: 'CRIMSON_SANCTUARY',
    width: 960,
    height: 540,
    platforms: [
      { x: 0, y: 460, width: 960, height: 80, type: 'GROUND' }
    ],`;

code = code.replace(oldSanctuary, newSanctuary);
fs.writeFileSync('src/game/world/Section.ts', code);
