import fs from 'fs';
let code = fs.readFileSync('src/game/GameEngine.ts', 'utf8');

if (!code.includes('dest.render(ctx, this.renderer)')) {
  code = code.replace(
    '// 3a. Renderiza NPCs (Monges e Eremitas)',
    `// 3a. Renderiza Destructibles
    for (const dest of this.destructibles) {
      dest.render(ctx, this.renderer);
    }

    // 3a. Renderiza NPCs (Monges e Eremitas)`
  );
  fs.writeFileSync('src/game/GameEngine.ts', code);
}
