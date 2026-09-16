import fs from 'fs';
let code = fs.readFileSync('src/game/GameEngine.ts', 'utf8');

const updateAnchor = `    // Atualiza Poças de AoE`;
const updateInjection = `    // Atualiza Destructibles
    for (const dest of this.destructibles) {
      if (typeof (dest as any).update === 'function') {
        (dest as any).update(dt);
      }
    }

    // Atualiza Poças de AoE`;

code = code.replace(updateAnchor, updateInjection);
fs.writeFileSync('src/game/GameEngine.ts', code);
console.log('GameEngine patched for destructibles update.');
