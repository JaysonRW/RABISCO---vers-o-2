import fs from 'fs';
let code = fs.readFileSync('src/game/rendering/ParallaxBackgroundSystem.ts', 'utf8');

// 1. Add property
code = code.replace(
  '  private monasteryCourtyardBuffer: HTMLCanvasElement | null = null;',
  '  private monasteryCourtyardBuffer: HTMLCanvasElement | null = null;\n  private crimsonSanctuaryBuffer: HTMLCanvasElement | null = null;'
);

// 2. Add load call in constructor
code = code.replace(
  '    this.initAtmosphericParticles();\n  }',
  '    this.initAtmosphericParticles();\n    this.loadSanctuaryImage();\n  }'
);

// 3. Add load method
const loadMethod = `
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
      const drawW = drawH * (img.width / img.height);
      
      for (let x = 0; x < w; x += drawW) {
        ctx.drawImage(img, x, h - drawH, drawW, drawH);
      }
      
      // Remove white background (make it transparent)
      const imageData = ctx.getImageData(0, 0, w, h);
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i+1];
        const b = data[i+2];
        // If it's bright enough, make it transparent (alpha 0)
        if (r > 200 && g > 200 && b > 200) {
          data[i+3] = 0;
        } else {
          // Darken the remaining colors to blend with the dark crimson style
          data[i] = r * 0.8;
          data[i+1] = g * 0.2;
          data[i+2] = b * 0.2;
        }
      }
      ctx.putImageData(imageData, 0, 0);
    };
  }
`;

code = code.replace(
  '  private initBuffers() {',
  loadMethod + '\n  private initBuffers() {'
);

// 4. Update the render logic for the sanctuary
const oldRender = `  // Renderiza Parallax do Santuário Carmim
  private renderCrimsonSanctuaryBiome(ctx: CanvasRenderingContext2D, cameraX: number, cameraY: number, dt: number) {
    const w = GAME_CONFIG.CANVAS_WIDTH;
    const h = GAME_CONFIG.CANVAS_HEIGHT;
    
    ctx.save();
    
    // Draw eerie crimson flames/scratches in the background
    const redDark = '#8B0000';
    const redLight = '#DC143C';
    const orange = '#FF4500';
    
    ctx.strokeStyle = redDark;
    ctx.lineWidth = 2.0;
    
    // Draw scratchy vertical lines moving like fire
    for(let i = 0; i < 40; i++) {
      const pX = ((i * 35) + this.animTimer * 10) % w;
      const heightPhase = Math.sin(this.animTimer * 2 + i) * 60;
      
      ctx.beginPath();
      ctx.strokeStyle = (i % 3 === 0) ? redDark : (i % 2 === 0 ? redLight : orange);
      ctx.globalAlpha = 0.3 + Math.random() * 0.2;
      ctx.moveTo(pX, h);
      ctx.lineTo(pX - 20 + Math.sin(this.animTimer*3 + i)*10, h - 200 - heightPhase);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(pX + 10, h);
      ctx.lineTo(pX + 15 + Math.cos(this.animTimer*4 + i)*15, h - 150 - heightPhase);
      ctx.stroke();
    }
    
    // Static Sanctuary architectural scratches
    ctx.globalAlpha = 0.5;
    ctx.strokeStyle = '#4A0404'; // Dark crimson
    ctx.lineWidth = 1;
    for (let i = 0; i < 15; i++) {
      const archX = (i * 120 - cameraX * 0.1) % (w + 120);
      
      ctx.beginPath();
      ctx.moveTo(archX, 0);
      ctx.lineTo(archX, h);
      ctx.stroke();
      
      // Arches
      ctx.beginPath();
      ctx.arc(archX, 150, 60, Math.PI, 0);
      ctx.stroke();
    }
    
    ctx.restore();
  }`;

const newRender = `  // Renderiza Parallax do Santuário Carmim
  private renderCrimsonSanctuaryBiome(ctx: CanvasRenderingContext2D, cameraX: number, cameraY: number, dt: number) {
    const w = GAME_CONFIG.CANVAS_WIDTH;
    const h = GAME_CONFIG.CANVAS_HEIGHT;
    
    ctx.save();
    
    // Draw eerie crimson background
    ctx.fillStyle = '#050101'; // Very dark red/black
    ctx.fillRect(0, 0, w, h);
    
    // Desenha a Imagem Personalizada em Parallax
    if (this.crimsonSanctuaryBuffer) {
      const parallaxFactor = 0.15;
      const offset = ((cameraX * parallaxFactor) % this.loopWidth + this.loopWidth) % this.loopWidth;
      
      // Draw with multiply blend mode or just directly
      ctx.globalCompositeOperation = 'source-over';
      ctx.drawImage(this.crimsonSanctuaryBuffer, -offset, 0);
      ctx.drawImage(this.crimsonSanctuaryBuffer, -offset + this.loopWidth, 0);
      if (-offset + this.loopWidth < w) {
        ctx.drawImage(this.crimsonSanctuaryBuffer, -offset + this.loopWidth * 2, 0);
      }
    }
    
    // Adiciona névoa rasteira
    this.renderLowGroundMist(ctx, cameraX);
    
    ctx.restore();
  }`;

code = code.replace(oldRender, newRender);

fs.writeFileSync('src/game/rendering/ParallaxBackgroundSystem.ts', code);
