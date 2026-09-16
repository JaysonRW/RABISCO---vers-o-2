import fs from 'fs';
let code = fs.readFileSync('src/game/rendering/ParallaxBackgroundSystem.ts', 'utf8');

const newLoadMethod = `
  private loadSanctuaryImage() {
    if (typeof window === 'undefined') return;
    const img = new Image();
    img.src = '/fundo_santuario.png';
    img.onload = () => {
      if (!this.crimsonSanctuaryBuffer) {
         this.crimsonSanctuaryBuffer = this.createOffscreenCanvas(this.loopWidth, this.loopHeight);
      }
      const ctx = this.crimsonSanctuaryBuffer.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;
      
      const w = this.crimsonSanctuaryBuffer.width;
      const h = this.crimsonSanctuaryBuffer.height;
      
      ctx.clearRect(0, 0, w, h);
      
      const drawH = 540; // Full height for background
      const drawW = Math.max(10, drawH * (img.width / img.height));
      
      for (let x = 0; x < w; x += drawW) {
        ctx.drawImage(img, x, h - drawH, drawW, drawH);
      }
    };
  }
`;

// Replace the old loadSanctuaryImage
code = code.replace(/  private loadSanctuaryImage\(\) \{[\s\S]*?ctx\.putImageData\(imageData, 0, 0\);\s*\}\;\s*\}/, newLoadMethod.trim());

fs.writeFileSync('src/game/rendering/ParallaxBackgroundSystem.ts', code);
