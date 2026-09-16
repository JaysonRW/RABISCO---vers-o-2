import fs from 'fs';
let code = fs.readFileSync('src/game/rendering/PenRenderer.ts', 'utf8');

const newLoadMethod = `
  private lordeCarmimImg: HTMLImageElement | null = null;
  private loadLordeCarmimImg() {
    if (typeof window === 'undefined') return;
    const img = new Image();
    img.src = '/lord1.png';
    img.onload = () => {
      this.lordeCarmimImg = img;
    };
  }
`;

code = code.replace(
  '  private loadPlatformImages() {',
  newLoadMethod + '\n  private loadPlatformImages() {'
);

code = code.replace(
  '    this.loadPlatformImages();\n  }',
  '    this.loadPlatformImages();\n    this.loadLordeCarmimImg();\n  }'
);

const oldRenderNpcCarmim = `    // Custom drawing for Lorde Carmim
    if (npcName === 'Lorde Carmim') {
      const centerX = x + w / 2;
      const bottomY = y + h;
      ctx.translate(centerX, bottomY);
      
      const redDark = '#8B0000';
      const redLight = '#DC143C';
      
      const breathe = Math.sin(animTime * 3) * 4;
      
      ctx.fillStyle = 'rgba(238, 230, 210, 0.95)';
      ctx.strokeStyle = redDark;
      ctx.lineWidth = 4;
      ctx.lineJoin = 'round';
      
      // Giant grotesque shape
      ctx.beginPath();
      ctx.moveTo(-40, 0);
      ctx.lineTo(-50, -80 + breathe);
      ctx.quadraticCurveTo(0, -140 + breathe * 2, 50, -80 + breathe);
      ctx.lineTo(40, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      
      // Face / Eyes
      ctx.fillStyle = redLight;
      ctx.beginPath();
      ctx.arc(-15, -90 + breathe * 1.5, 6, 0, Math.PI * 2);
      ctx.arc(15, -90 + breathe * 1.5, 6, 0, Math.PI * 2);
      ctx.fill();
      
      // Multiple erratic red strokes for aura
      ctx.strokeStyle = redLight;
      ctx.lineWidth = 2;
      for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        const ox = (Math.random() - 0.5) * 10;
        const oy = (Math.random() - 0.5) * 10;
        ctx.moveTo(-60 + ox, -100 + oy + breathe);
        ctx.lineTo(-40 + ox, -120 + oy + breathe);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(60 + ox, -100 + oy + breathe);
        ctx.lineTo(40 + ox, -120 + oy + breathe);
        ctx.stroke();
      }

      ctx.restore();
      return;
    }`;

const newRenderNpcCarmim = `    // Custom drawing for Lorde Carmim
    if (npcName === 'Lorde Carmim') {
      const centerX = x + w / 2;
      const bottomY = y + h;
      ctx.translate(centerX, bottomY);
      
      const breathe = Math.sin(animTime * 2) * 5; // Slight hover effect
      
      if (this.lordeCarmimImg) {
        // The image is quite large, let's scale it so its height is roughly 350
        const drawH = 350;
        const drawW = drawH * (this.lordeCarmimImg.width / this.lordeCarmimImg.height);
        
        ctx.drawImage(
          this.lordeCarmimImg, 
          -drawW / 2, 
          -drawH + breathe, 
          drawW, 
          drawH
        );
      }
      
      ctx.restore();
      return;
    }`;

code = code.replace(oldRenderNpcCarmim, newRenderNpcCarmim);

fs.writeFileSync('src/game/rendering/PenRenderer.ts', code);
