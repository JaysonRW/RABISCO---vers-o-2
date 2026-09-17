import fs from 'fs';
let code = fs.readFileSync('src/game/rendering/PenRenderer.ts', 'utf8');

code = code.replace(`export class PenRenderer {
  private noiseCanvas: HTMLCanvasElement | null = null;
  private backgroundSystem: ParallaxBackgroundSystem = new ParallaxBackgroundSystem();
  private fogoSprites: HTMLImageElement[] = [];`, `export class PenRenderer {
  private noiseCanvas: HTMLCanvasElement | null = null;
  private backgroundSystem: ParallaxBackgroundSystem = new ParallaxBackgroundSystem();
  private fogoSprites: HTMLImageElement[] = [];
  private caixaSprites: HTMLImageElement[] = [];`);

fs.writeFileSync('src/game/rendering/PenRenderer.ts', code);
