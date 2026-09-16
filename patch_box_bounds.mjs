import fs from 'fs';
let code = fs.readFileSync('src/game/entities/Destructible.ts', 'utf8');

const anchor = `    // Set dimensions based on type
    if (type === 'box') {
      this.width = 30;
      this.height = 30;`;
const inj = `    // Set dimensions based on type
    if (type === 'box') {
      this.width = 40;
      this.height = 40;`;

if (code.includes(anchor)) {
    code = code.replace(anchor, inj);
    fs.writeFileSync('src/game/entities/Destructible.ts', code);
    console.log('Box size updated in Destructible.ts');
}
