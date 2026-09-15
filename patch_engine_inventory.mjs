import fs from 'fs';
let code = fs.readFileSync('src/game/GameEngine.ts', 'utf8');

code = code.replace(
  'inventory: this.inventory.getItems(),',
  'inventory: this.inventory.items,'
);

fs.writeFileSync('src/game/GameEngine.ts', code);
