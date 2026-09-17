import fs from 'fs';
let code = fs.readFileSync('src/game/rendering/ParallaxBackgroundSystem.ts', 'utf8');

const oldCryptRenderCode = `  // Renderiza Parallax da Cripta Esquecida
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

    const pillarImage = AssetLoader.getImage('/pilarcripta.png');
    if (pillarImage) {
      ctx.save();
      // Remove a propriedade de multiply para evitar que a imagem dos pilares aplique modo de blend ou transparência com o fundo
      ctx.globalCompositeOperation = 'source-over'; 
      const factor = 0.32;
      const imgW = pillarImage.width || this.loopWidth;
      const imgH = pillarImage.height || this.loopHeight;
      const scaleY = h / imgH;
      const scaledW = imgW * scaleY;
      
      const scaledOffset = ((cameraX * factor) % scaledW + scaledW) % scaledW;

      ctx.drawImage(pillarImage, -scaledOffset, 0, scaledW, h);
      ctx.drawImage(pillarImage, -scaledOffset + scaledW, 0, scaledW, h);
      if (-scaledOffset + scaledW < w) {
        ctx.drawImage(pillarImage, -scaledOffset + scaledW * 2, 0, scaledW, h);
      }
      ctx.restore();
    } else if (this.cryptPillarsBuffer) {
      const factor = 0.32;
      const offset = ((cameraX * factor) % this.loopWidth + this.loopWidth) % this.loopWidth;
      ctx.drawImage(this.cryptPillarsBuffer, -offset, 0);
      ctx.drawImage(this.cryptPillarsBuffer, -offset + this.loopWidth, 0);
      if (-offset + this.loopWidth < w) {
        ctx.drawImage(this.cryptPillarsBuffer, -offset + this.loopWidth * 2, 0);
      }
    }
  }`;


const newCryptRenderCode = `  // Renderiza Parallax da Cripta Esquecida
  private renderCryptBiome(ctx: CanvasRenderingContext2D, cameraX: number, cameraY: number) {
    const w = GAME_CONFIG.CANVAS_WIDTH;
    const h = GAME_CONFIG.CANVAS_HEIGHT;

    const bg1 = AssetLoader.getImage('/bmg_cripta1.png');
    const bg2 = AssetLoader.getImage('/bmg_cripta2.png');
    const bg3 = AssetLoader.getImage('/bmg_cripta3.png');

    if (bg1 || bg2 || bg3) {
      ctx.save();
      // Removido multiply para as novas camadas não terem transparência
      ctx.globalCompositeOperation = 'source-over'; 
      
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

      // Camada 1: Mais profunda (bmg_cripta1)
      drawLayer(bg1!, 0.08);
      
      // Camada 2: Frente à distante (bmg_cripta2)
      drawLayer(bg2!, 0.18);
      
      // Camada 3: Última, grandes árvores/pilares (bmg_cripta3)
      drawLayer(bg3!, 0.32);

      ctx.restore();
    } else {
      // Fallback para os buffers antigos
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
    }
  }`;

code = code.replace(oldCryptRenderCode, newCryptRenderCode);
fs.writeFileSync('src/game/rendering/ParallaxBackgroundSystem.ts', code);
