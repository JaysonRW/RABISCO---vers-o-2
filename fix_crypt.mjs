import fs from 'fs';
let code = fs.readFileSync('src/game/rendering/ParallaxBackgroundSystem.ts', 'utf8');

const oldConstructor = `    if (typeof window !== 'undefined') {
      AssetLoader.loadImage('/fundo1Cripta.png').catch(() => {});
      AssetLoader.loadImage('/pilarcripta.png').catch(() => {});
      AssetLoader.loadImage('/bmg_floresta1.png').catch(() => {});
      AssetLoader.loadImage('/bgm_floresta2.png').catch(() => {});
      AssetLoader.loadImage('/bgm_floresta3.png').catch(() => {});
    }`;

const newConstructor = `    if (typeof window !== 'undefined') {
      AssetLoader.loadImage('/fundo1Cripta.png').catch(() => {});
      AssetLoader.loadImage('/pilarcripta.png').catch(() => {});
      AssetLoader.loadImage('/bmg_floresta1.png').catch(() => {});
      AssetLoader.loadImage('/bgm_floresta2.png').catch(() => {});
      AssetLoader.loadImage('/bgm_floresta3.png').catch(() => {});
      AssetLoader.loadImage('/bmg_cripta1.png').catch(() => {});
      AssetLoader.loadImage('/bmg_cripta2.png').catch(() => {});
      AssetLoader.loadImage('/bmg_cripta3.png').catch(() => {});
    }`;

code = code.replace(oldConstructor, newConstructor);

const oldCryptRenderCodeStart = `  private renderCryptBiome(ctx: CanvasRenderingContext2D, cameraX: number, cameraY: number) {`;

// Let's replace the whole method. We need to find where it ends.
// Wait, I can just use a regex.
