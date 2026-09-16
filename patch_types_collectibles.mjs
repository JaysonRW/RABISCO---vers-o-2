import fs from 'fs';
let code = fs.readFileSync('src/game/types.ts', 'utf8');

const injection = `export interface Collectible {
  id: number;
  type: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  isCollected: boolean;
  life: number;
}`;

if (!code.includes('interface Collectible')) {
  code += '\n' + injection + '\n';
  fs.writeFileSync('src/game/types.ts', code);
  console.log('types.ts patched with Collectible');
}
