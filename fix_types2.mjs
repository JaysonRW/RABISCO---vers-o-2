import fs from 'fs';
let code = fs.readFileSync('src/game/types.ts', 'utf8');

// Fix duplicates
code = code.replace(`  gravity?: number;
  rotation?: number;
  vRot?: number;
  drag?: number;             // Resistência do ar / desaceleração da gota de tinta`, `  gravity?: number;
  drag?: number;             // Resistência do ar / desaceleração da gota de tinta`);

// Add ZOMBIE_HEAD to ParticleShape
code = code.replace(`  | 'ink_blot';`, `  | 'ink_blot'\n  | 'ZOMBIE_HEAD';`);

fs.writeFileSync('src/game/types.ts', code);
