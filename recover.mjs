import fs from 'fs';
const map = JSON.parse(fs.readFileSync('sourcemap.json', 'utf8'));
const content = map.sourcesContent[0];
fs.writeFileSync('src/game/rendering/PenRenderer.ts', content);
console.log('Recovered file length:', content.length);
