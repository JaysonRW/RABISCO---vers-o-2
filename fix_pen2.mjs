import fs from 'fs';
let code = fs.readFileSync('src/game/rendering/PenRenderer.ts', 'utf8');

code = code.replace(`export class PenRenderer {
  private noiseCanvas: HTMLCanvasElement | null = null;
  private backgroundSystem: ParallaxBackgroundSystem = new ParallaxBackgroundSystem();`, `export class PenRenderer {
  private noiseCanvas: HTMLCanvasElement | null = null;
  private backgroundSystem: ParallaxBackgroundSystem = new ParallaxBackgroundSystem();
  private fogoSprites: HTMLImageElement[] = [];`);

code = code.replace(`import { PlayerState, Direction, AscensionStats } from '../types';`, `import { PlayerState, Direction, AscensionStats } from '../types';
import { Destructible } from '../entities/Destructible';`);

fs.writeFileSync('src/game/rendering/PenRenderer.ts', code);
