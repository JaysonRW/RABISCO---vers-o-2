import fs from 'fs';
let code = fs.readFileSync('src/game/rendering/ParallaxBackgroundSystem.ts', 'utf8');

if (!code.includes("AssetLoader")) {
  code = code.replace("import { BiomeTheme } from '../world/Section';", "import { BiomeTheme } from '../world/Section';\nimport { AssetLoader } from '../utils/AssetLoader';");
}

const cryptRenderCode = `
  // Renderiza Parallax da Cripta Esquecida
  private renderCryptBiome(ctx: CanvasRenderingContext2D, cameraX: number, cameraY: number) {
    const w = GAME_CONFIG.CANVAS_WIDTH;
    const h = GAME_CONFIG.CANVAS_HEIGHT;

    const bgImage = AssetLoader.getImage('/fundo1Cripta.png');
    if (bgImage) {
      ctx.save();
      ctx.globalCompositeOperation = 'multiply';
      
      const factor = 0.16;
      // Loop the image properly, assuming it might not be perfectly 1920
      const imgW = bgImage.width || this.loopWidth;
      const imgH = bgImage.height || this.loopHeight;
      const offset = ((cameraX * factor) % imgW + imgW) % imgW;
      
      // Scale to fit height if needed
      const scaleY = h / imgH;
      const scaledW = imgW * scaleY;
      
      const scaledOffset = ((cameraX * factor) % scaledW + scaledW) % scaledW;

      ctx.drawImage(bgImage, -scaledOffset, 0, scaledW, h);
      ctx.drawImage(bgImage, -scaledOffset + scaledW, 0, scaledW, h);
      if (-scaledOffset + scaledW < w) {
        ctx.drawImage(bgImage, -scaledOffset + scaledW * 2, 0, scaledW, h);
      }
      ctx.restore();
    } else if (this.cryptVaultsBuffer) {
      const factor = 0.16;
      const offset = ((cameraX * factor) % this.loopWidth + this.loopWidth) % this.loopWidth;
      ctx.drawImage(this.cryptVaultsBuffer, -offset, 0);
      ctx.drawImage(this.cryptVaultsBuffer, -offset + this.loopWidth, 0);
      if (-offset + this.loopWidth < w) {
        ctx.drawImage(this.cryptVaultsBuffer, -offset + this.loopWidth * 2, 0);
      }
    }

    if (this.cryptPillarsBuffer) {
      const factor = 0.32;
      const offset = ((cameraX * factor) % this.loopWidth + this.loopWidth) % this.loopWidth;
      ctx.drawImage(this.cryptPillarsBuffer, -offset, 0);
      ctx.drawImage(this.cryptPillarsBuffer, -offset + this.loopWidth, 0);
      if (-offset + this.loopWidth < w) {
        ctx.drawImage(this.cryptPillarsBuffer, -offset + this.loopWidth * 2, 0);
      }
    }
  }
`;

const oldCryptRenderCode = `  // Renderiza Parallax da Cripta Esquecida
  private renderCryptBiome(ctx: CanvasRenderingContext2D, cameraX: number, cameraY: number) {
    const w = GAME_CONFIG.CANVAS_WIDTH;
    if (this.cryptVaultsBuffer) {
      const factor = 0.16;
      const offset = ((cameraX * factor) % this.loopWidth + this.loopWidth) % this.loopWidth;
      ctx.drawImage(this.cryptVaultsBuffer, -offset, 0);
      ctx.drawImage(this.cryptVaultsBuffer, -offset + this.loopWidth, 0);
      if (-offset + this.loopWidth < w) {
        ctx.drawImage(this.cryptVaultsBuffer, -offset + this.loopWidth * 2, 0);
      }
    }

    if (this.cryptPillarsBuffer) {
      const factor = 0.32;
      const offset = ((cameraX * factor) % this.loopWidth + this.loopWidth) % this.loopWidth;
      ctx.drawImage(this.cryptPillarsBuffer, -offset, 0);
      ctx.drawImage(this.cryptPillarsBuffer, -offset + this.loopWidth, 0);
      if (-offset + this.loopWidth < w) {
        ctx.drawImage(this.cryptPillarsBuffer, -offset + this.loopWidth * 2, 0);
      }
    }
  }`;

code = code.replace(oldCryptRenderCode, cryptRenderCode);
fs.writeFileSync('src/game/rendering/ParallaxBackgroundSystem.ts', code);
