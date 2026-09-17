import fs from 'fs';
let code = fs.readFileSync('src/game/types.ts', 'utf8');

code = code.replace(`  shape?: 'square' | 'circle' | 'spark' | 'smoke';`, `  shape?: 'square' | 'circle' | 'spark' | 'smoke' | 'ZOMBIE_HEAD';`);

fs.writeFileSync('src/game/types.ts', code);
