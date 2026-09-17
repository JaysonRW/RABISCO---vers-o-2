import fs from 'fs';
let code = fs.readFileSync('src/game/types.ts', 'utf8');

code = code.replace(`  gravity?: number;`, `  gravity?: number;\n  rotation?: number;\n  vRot?: number;`);

fs.writeFileSync('src/game/types.ts', code);
