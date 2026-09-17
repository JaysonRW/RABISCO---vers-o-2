import fs from 'fs';

// 1. Add GHOUL to types.ts
let typesCode = fs.readFileSync('src/game/types.ts', 'utf8');
typesCode = typesCode.replace(`export enum EnemyType {
  GHOST = 'GHOST',             // Espectro / Fantasma
  VAMPIRE = 'VAMPIRE',         // Vampiro
  ZOMBIE = 'ZOMBIE',           // Zumbi
  SKELETON = 'SKELETON',       // Esqueleto
}`, `export enum EnemyType {
  GHOST = 'GHOST',             // Espectro / Fantasma
  VAMPIRE = 'VAMPIRE',         // Vampiro
  ZOMBIE = 'ZOMBIE',           // Zumbi
  GHOUL = 'GHOUL',             // Carniçal
  SKELETON = 'SKELETON',       // Esqueleto
}`);
fs.writeFileSync('src/game/types.ts', typesCode);

// 2. Change GhoulEnemy.ts to use EnemyType.GHOUL
let ghoulCode = fs.readFileSync('src/game/entities/GhoulEnemy.ts', 'utf8');
ghoulCode = ghoulCode.replace(`      EnemyType.ZOMBIE,`, `      EnemyType.GHOUL,`);
fs.writeFileSync('src/game/entities/GhoulEnemy.ts', ghoulCode);

console.log("Fixed Ghoul type.");
