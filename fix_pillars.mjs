import fs from 'fs';
let code = fs.readFileSync('src/game/rendering/ParallaxBackgroundSystem.ts', 'utf8');

const oldPillarsCode = `    if (this.cryptPillarsBuffer) {
      const factor = 0.32;
      const offset = ((cameraX * factor) % this.loopWidth + this.loopWidth) % this.loopWidth;
      ctx.drawImage(this.cryptPillarsBuffer, -offset, 0);
      ctx.drawImage(this.cryptPillarsBuffer, -offset + this.loopWidth, 0);
      if (-offset + this.loopWidth < w) {
        ctx.drawImage(this.cryptPillarsBuffer, -offset + this.loopWidth * 2, 0);
      }
    }`;

const newPillarsCode = `    const pillarImage = AssetLoader.getImage('/pilarcripta.png');
    if (pillarImage) {
      ctx.save();
      ctx.globalCompositeOperation = 'multiply';
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
    }`;

code = code.replace(oldPillarsCode, newPillarsCode);

const oldConstructor = `    if (typeof window !== 'undefined') {
      AssetLoader.loadImage('/fundo1Cripta.png').catch(() => {});
    }`;

const newConstructor = `    if (typeof window !== 'undefined') {
      AssetLoader.loadImage('/fundo1Cripta.png').catch(() => {});
      AssetLoader.loadImage('/pilarcripta.png').catch(() => {});
    }`;

code = code.replace(oldConstructor, newConstructor);

fs.writeFileSync('src/game/rendering/ParallaxBackgroundSystem.ts', code);
