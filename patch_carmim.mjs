import fs from 'fs';
let code = fs.readFileSync('src/game/world/Section.ts', 'utf8');

const oldNpc = `      {
        id: 'lorde_carmim',
        name: 'Lorde Carmim',
        title: 'A Tinta Primordial',
        x: 380, // Center top
        y: 60, // Above the floating platform`;

const newNpc = `      {
        id: 'lorde_carmim',
        name: 'Lorde Carmim',
        title: 'A Tinta Primordial',
        x: 440, // Center of 960 canvas (960/2 = 480, adjusted for width)
        y: 180, // High up, hovering ominously`;

code = code.replace(oldNpc, newNpc);

fs.writeFileSync('src/game/world/Section.ts', code);
