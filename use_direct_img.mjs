import fs from 'fs';
let code = fs.readFileSync('src/game/rendering/ParallaxBackgroundSystem.ts', 'utf8');

const newLoadMethod = `
  private sanctuaryImg: HTMLImageElement | null = null;
  private loadSanctuaryImage() {
    if (typeof window === 'undefined') return;
    const img = new Image();
    img.src = '/fundo_santuario.png';
    img.onload = () => {
      this.sanctuaryImg = img;
    };
  }
`;

code = code.replace(/  private loadSanctuaryImage\(\) \{[\s\S]*?ctx\.drawImage\(img, x, h - drawH, drawW, drawH\);\s*\}\s*\}\;\s*\}/, newLoadMethod.trim());

const newRenderMethod = `  private renderCrimsonSanctuaryBiome(ctx: CanvasRenderingContext2D, cameraX: number, cameraY: number, dt: number) {
    const w = GAME_CONFIG.CANVAS_WIDTH;
    const h = GAME_CONFIG.CANVAS_HEIGHT;
    
    ctx.save();
    
    ctx.fillStyle = '#050101'; // Very dark red/black
    ctx.fillRect(0, 0, w, h);
    
    if (this.sanctuaryImg) {
      const parallaxFactor = 0.15;
      
      const drawH = h;
      const drawW = Math.max(10, drawH * (this.sanctuaryImg.width / this.sanctuaryImg.height));
      
      const loopWidth = drawW; // Instead of this.loopWidth, use the image's computed width
      const offset = ((cameraX * parallaxFactor) % loopWidth + loopWidth) % loopWidth;
      
      ctx.globalCompositeOperation = 'source-over';
      
      // Draw enough copies to cover the screen
      let currentX = -offset;
      while (currentX < w) {
        ctx.drawImage(this.sanctuaryImg, currentX, 0, drawW, drawH);
        currentX += loopWidth;
      }
    }
    
    this.renderLowGroundMist(ctx, cameraX);
    
    ctx.restore();
  }`;

code = code.replace(/  private renderCrimsonSanctuaryBiome\(ctx: CanvasRenderingContext2D[\s\S]*?ctx\.restore\(\);\s*\}/, newRenderMethod.trim());

fs.writeFileSync('src/game/rendering/ParallaxBackgroundSystem.ts', code);
