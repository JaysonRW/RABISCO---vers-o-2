import fs from 'fs';
let code = fs.readFileSync('src/game/rendering/PenRenderer.ts', 'utf8');

code = code.replace(`import { AscensionStats, DamageType, Direction, FloatingText, Particle, PlayerState, SoulOrb } from '../types';`, `import { AscensionStats, DamageType, Direction, FloatingText, Particle, PlayerState, SoulOrb } from '../types';
import { Destructible } from '../entities/Destructible';`);

fs.writeFileSync('src/game/rendering/PenRenderer.ts', code);
