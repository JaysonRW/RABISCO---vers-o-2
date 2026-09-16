import fs from 'fs';
let code = fs.readFileSync('src/game/world/Section.ts', 'utf8');

const oldNpc = `      {
        id: 'lorde_carmim',
        name: 'Lorde Carmim',
        title: 'A Tinta Primordial',
        x: 440, // Center of 960 canvas (960/2 = 480, adjusted for width)
        y: 180, // High up, hovering ominously`;

// If he is 38 width, center is 480 - 19 = 461
// If he is 62 height and stands on 460 floor, y is 460 - 62 = 398
const newNpc = `      {
        id: 'lorde_carmim',
        name: 'Lorde Carmim',
        title: 'A Tinta Primordial',
        x: 461, // Center of 960 canvas (960/2 = 480, adjusted for width 38)
        y: 398, // Standing on the floor (460 - 62)`;

code = code.replace(oldNpc, newNpc);

fs.writeFileSync('src/game/world/Section.ts', code);
