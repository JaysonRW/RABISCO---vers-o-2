import fs from 'fs';
let code = fs.readFileSync('src/game/rendering/ParallaxBackgroundSystem.ts', 'utf8');

// 1. Add properties
const propInjection = `  private sanctuaryImg: HTMLImageElement | null = null;
  private fireFrames: HTMLImageElement[] = [];
  private fireFramesLoaded = false;`;
code = code.replace('  private sanctuaryImg: HTMLImageElement | null = null;', propInjection);

// 2. Add loadFireFrames method
const loadMethod = `
  private loadFireFrames() {
    if (typeof window === 'undefined') return;
    const urls = ['/fogo1.png', '/fogo2.png', '/fogo3.png', '/fogo4.png'];
    let loaded = 0;
    urls.forEach((url, i) => {
      const img = new Image();
      img.src = url;
      img.onload = () => {
        this.fireFrames[i] = img;
        loaded++;
        if (loaded === urls.length) this.fireFramesLoaded = true;
      };
    });
  }
`;
code = code.replace(
  '  private loadSanctuaryImage() {',
  loadMethod + '\n  private loadSanctuaryImage() {'
);

// 3. Add to constructor
code = code.replace(
  '    this.loadSanctuaryImage();\n  }',
  '    this.loadSanctuaryImage();\n    this.loadFireFrames();\n  }'
);

// 4. Update render method
const oldRender = `    ctx.fillStyle = '#050101'; // Very dark red/black
    ctx.fillRect(0, 0, w, h);
    
    if (this.sanctuaryImg) {`;

const newRender = `    ctx.fillStyle = '#050101'; // Very dark red/black
    ctx.fillRect(0, 0, w, h);
    
    // Draw animated fire behind sanctuary
    if (this.fireFramesLoaded && this.fireFrames.length === 4) {
      const fps = 8; // Adjust animation speed
      const frameIndex = Math.floor(this.animTimer * fps) % 4;
      const fireImg = this.fireFrames[frameIndex];
      
      if (fireImg) {
        const fireParallaxFactor = 0.05; // moves slightly slower to feel distant
        const drawH = h;
        const drawW = Math.max(10, drawH * (fireImg.width / fireImg.height));
        const loopWidth = drawW;
        const offset = ((cameraX * fireParallaxFactor) % loopWidth + loopWidth) % loopWidth;
        
        ctx.globalCompositeOperation = 'source-over';
        let currentX = -offset;
        while (currentX < w) {
          ctx.drawImage(fireImg, currentX, 0, drawW, drawH);
          currentX += loopWidth;
        }
      }
    }
    
    if (this.sanctuaryImg) {`;

code = code.replace(oldRender, newRender);

fs.writeFileSync('src/game/rendering/ParallaxBackgroundSystem.ts', code);
