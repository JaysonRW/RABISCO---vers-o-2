import fs from 'fs';
let code = fs.readFileSync('src/game/rendering/PenRenderer.ts', 'utf8');

if (!code.includes("import { Destructible }")) {
  code = code.replace(`import { PlayerState, Direction, AscensionStats } from '../types';`, `import { PlayerState, Direction, AscensionStats } from '../types';\nimport { Destructible } from '../entities/Destructible';`);
  fs.writeFileSync('src/game/rendering/PenRenderer.ts', code);
}
