import fs from 'fs';
let code = fs.readFileSync('src/game/rendering/ParallaxBackgroundSystem.ts', 'utf8');

const oldConstructor = `    if (typeof window !== 'undefined') {
      AssetLoader.loadImage('/fundo1Cripta.png').catch(() => {});
      AssetLoader.loadImage('/pilarcripta.png').catch(() => {});
      AssetLoader.loadImage('/bmg1floresta.png').catch(() => {});
    }`;

const newConstructor = `    if (typeof window !== 'undefined') {
      AssetLoader.loadImage('/fundo1Cripta.png').catch(() => {});
      AssetLoader.loadImage('/pilarcripta.png').catch(() => {});
      AssetLoader.loadImage('/bmg_floresta1.png').catch(() => {});
      AssetLoader.loadImage('/bgm_floresta2.png').catch(() => {});
      AssetLoader.loadImage('/bgm_floresta3.png').catch(() => {});
    }`;

code = code.replace(oldConstructor, newConstructor);

const oldForestRenderCode = `  private renderForestBiome(ctx: CanvasRenderingContext2D, cameraX: number, cameraY: number) {
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

const newForestRenderCode = `  private renderForestBiome(ctx: CanvasRenderingContext2D, cameraX: number, cameraY: number) {
    const w = GAME_CONFIG.CANVAS_WIDTH;
    const h = GAME_CONFIG.CANVAS_HEIGHT;

    const bg1 = AssetLoader.getImage('/bmg_floresta1.png');
    const bg2 = AssetLoader.getImage('/bgm_floresta2.png');
    const bg3 = AssetLoader.getImage('/bgm_floresta3.png');

    if (bg1 || bg2 || bg3) {
      ctx.save();
      ctx.globalCompositeOperation = 'multiply';
      
      const drawLayer = (img: HTMLImageElement, factor: number) => {
        if (!img) return;
        const imgW = img.width || this.loopWidth;
        const imgH = img.height || this.loopHeight;
        const scaleY = h / imgH;
        const scaledW = imgW * scaleY;
        const scaledOffset = ((cameraX * factor) % scaledW + scaledW) % scaledW;

        ctx.drawImage(img, -scaledOffset, 0, scaledW, h);
        ctx.drawImage(img, -scaledOffset + scaledW, 0, scaledW, h);
        if (-scaledOffset + scaledW < w) {
          ctx.drawImage(img, -scaledOffset + scaledW * 2, 0, scaledW, h);
        }
      };

      // Camada 1: Mais profunda (bmg_floresta1)
      drawLayer(bg1!, 0.08);
      
      // Camada 2: Frente à distante (bgm_floresta2)
      drawLayer(bg2!, 0.18);
      
      // Camada 3: Última, grandes árvores (bgm_floresta3)
      drawLayer(bg3!, 0.32);

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
