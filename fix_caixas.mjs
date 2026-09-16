import fs from 'fs';
let code = fs.readFileSync('src/game/rendering/PenRenderer.ts', 'utf8');

const anchor = `    this.fogoSprites = [];`;
const inj = `    this.fogoSprites = [];
    (this as any).caixaSprites = [];`;
if (code.includes(anchor)) {
    code = code.replace(anchor, inj);
    fs.writeFileSync('src/game/rendering/PenRenderer.ts', code);
    console.log('Fixed PenRenderer.ts');
} else {
    console.log('Could not find anchor in PenRenderer.ts');
}
