import fs from 'fs';
let code = fs.readFileSync('src/game/rendering/PenRenderer.ts', 'utf8');

const npcRenderStart = `  public renderNPC(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    iconType: 'HERMIT' | 'SPIRIT',
    animTime: number,
    isPlayerNearby: boolean,
    npcName: string
  ) {
    ctx.save();
    const centerX = x + w / 2;
    const bottomY = y + h;
    ctx.translate(centerX, bottomY);`;

const newNpcRenderStart = `  public renderNPC(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    iconType: 'HERMIT' | 'SPIRIT',
    animTime: number,
    isPlayerNearby: boolean,
    npcName: string
  ) {
    ctx.save();
    
    // Custom drawing for Lorde Carmim
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
    }

    const centerX = x + w / 2;
    const bottomY = y + h;
    ctx.translate(centerX, bottomY);`;

code = code.replace(npcRenderStart, newNpcRenderStart);
fs.writeFileSync('src/game/rendering/PenRenderer.ts', code);
