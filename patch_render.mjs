import fs from 'fs';
let code = fs.readFileSync('src/game/GameEngine.ts', 'utf8');

if (!code.includes('for (const dest of this.destructibles) {')) {
  code = code.replace(
    'for (const npc of this.npcs) {',
    `for (const dest of this.destructibles) {
        dest.render(this.ctx, this.renderer);
      }
      for (const npc of this.npcs) {`
  );
  fs.writeFileSync('src/game/GameEngine.ts', code);
}
