import fs from 'fs';
let code = fs.readFileSync('src/game/rendering/ParallaxBackgroundSystem.ts', 'utf8');

const themeCheck = `    if (theme === 'MONASTERY') {
      this.renderMonasteryBiome(ctx, cameraX, cameraY);
    } else if (theme === 'FOREST') {
      this.renderForestBiome(ctx, cameraX, cameraY);
    } else if (theme === 'CRYPT') {
      this.renderCryptBiome(ctx, cameraX, cameraY);
    }`;

const newThemeCheck = `    if (theme === 'MONASTERY') {
      this.renderMonasteryBiome(ctx, cameraX, cameraY);
    } else if (theme === 'FOREST') {
      this.renderForestBiome(ctx, cameraX, cameraY);
    } else if (theme === 'CRYPT') {
      this.renderCryptBiome(ctx, cameraX, cameraY);
    } else if (theme === 'CRIMSON_SANCTUARY') {
      this.renderCrimsonSanctuaryBiome(ctx, cameraX, cameraY, dt);
    }`;

code = code.replace(themeCheck, newThemeCheck);

const crimsonRenderFn = `
  // Renderiza Parallax do Santuário Carmim
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
  }
`;

code = code + crimsonRenderFn;

fs.writeFileSync('src/game/rendering/ParallaxBackgroundSystem.ts', code);
