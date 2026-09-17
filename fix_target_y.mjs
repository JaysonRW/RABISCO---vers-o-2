import fs from 'fs';
let code = fs.readFileSync('src/game/world/Section.ts', 'utf8');

code = code.replace(
`        targetSectionId: 'corrupted_forest',
        targetPlayerX: 80,
        targetPlayerY: 390,`,
`        targetSectionId: 'corrupted_forest',
        targetPlayerX: 80,
        targetPlayerY: 370,`
);

fs.writeFileSync('src/game/world/Section.ts', code);
console.log('Fixed targetPlayerY for corrupted_forest');
