import fs from 'fs';
let code = fs.readFileSync('src/game/rendering/ParallaxBackgroundSystem.ts', 'utf8');

const oldConstructor = `    if (typeof window !== 'undefined') {
      AssetLoader.loadImage('/fundo1Cripta.png').catch(() => {});
      AssetLoader.loadImage('/pilarcripta.png').catch(() => {});
    }`;

const newConstructor = `    if (typeof window !== 'undefined') {
      AssetLoader.loadImage('/fundo1Cripta.png').catch(() => {});
      AssetLoader.loadImage('/pilarcripta.png').catch(() => {});
      AssetLoader.loadImage('/bmg1floresta.png').catch(() => {});
    }`;

code = code.replace(oldConstructor, newConstructor);

const oldForestRenderCode = `  private renderForestBiome(ctx: CanvasRenderingContext2D, cameraX: number, cameraY: number) {
    const w = GAME_CONFIG.CANVAS_WIDTH;
    if (this.forestDistantBuffer) {
      const factor = 0.14;
      const offset = ((cameraX * factor) % this.loopWidth + this.loopWidth) % this.loopWidth;
      ctx.drawImage(this.forestDistantBuffer, -offset, 0);
      ctx.drawImage(this.forestDistantBuffer, -offset + this.loopWidth, 0);
      if (-offset + this.loopWidth < w) {
        ctx.drawImage(this.forestDistantBuffer, -offset + this.loopWidth * 2, 0);
      }
    }

    if (this.forestMidBuffer) {
      const factor = 0.28;
      const offset = ((cameraX * factor) % this.loopWidth + this.loopWidth) % this.loopWidth;
      ctx.drawImage(this.forestMidBuffer, -offset, 0);
      ctx.drawImage(this.forestMidBuffer, -offset + this.loopWidth, 0);
      if (-offset + this.loopWidth < w) {
        ctx.drawImage(this.forestMidBuffer, -offset + this.loopWidth * 2, 0);
      }
    }
  }`;

const newForestRenderCode = `  private renderForestBiome(ctx: CanvasRenderingContext2D, cameraX: number, cameraY: number) {
    const w = GAME_CONFIG.CANVAS_WIDTH;
    const h = GAME_CONFIG.CANVAS_HEIGHT;

    const bgImage = AssetLoader.getImage('/bmg1floresta.png');
    if (bgImage) {
      ctx.save();
      ctx.globalCompositeOperation = 'multiply';
      
      const factor = 0.14;
      const imgW = bgImage.width || this.loopWidth;
      const imgH = bgImage.height || this.loopHeight;
      const scaleY = h / imgH;
      const scaledW = imgW * scaleY;
      
      const scaledOffset = ((cameraX * factor) % scaledW + scaledW) % scaledW;

      ctx.drawImage(bgImage, -scaledOffset, 0, scaledW, h);
      ctx.drawImage(bgImage, -scaledOffset + scaledW, 0, scaledW, h);
      if (-scaledOffset + scaledW < w) {
        ctx.drawImage(bgImage, -scaledOffset + scaledW * 2, 0, scaledW, h);
      }
      ctx.restore();
    } else {
      if (this.forestDistantBuffer) {
        const factor = 0.14;
        const offset = ((cameraX * factor) % this.loopWidth + this.loopWidth) % this.loopWidth;
        ctx.drawImage(this.forestDistantBuffer, -offset, 0);
        ctx.drawImage(this.forestDistantBuffer, -offset + this.loopWidth, 0);
        if (-offset + this.loopWidth < w) {
          ctx.drawImage(this.forestDistantBuffer, -offset + this.loopWidth * 2, 0);
        }
      }

      if (this.forestMidBuffer) {
        const factor = 0.28;
        const offset = ((cameraX * factor) % this.loopWidth + this.loopWidth) % this.loopWidth;
        ctx.drawImage(this.forestMidBuffer, -offset, 0);
        ctx.drawImage(this.forestMidBuffer, -offset + this.loopWidth, 0);
        if (-offset + this.loopWidth < w) {
          ctx.drawImage(this.forestMidBuffer, -offset + this.loopWidth * 2, 0);
        }
      }
    }
  }`;

code = code.replace(oldForestRenderCode, newForestRenderCode);
fs.writeFileSync('src/game/rendering/ParallaxBackgroundSystem.ts', code);
