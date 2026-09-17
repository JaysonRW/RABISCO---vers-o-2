import fs from 'fs';
let code = fs.readFileSync('src/game/rendering/PenRenderer.ts', 'utf8');

const zombieRenderCode = `
  public renderZombie(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    facing: Direction,
    animTime: number,
    hp: number,
    maxHp: number,
    isHurt: boolean
  ) {
    ctx.save();
    const centerX = x + w / 2;
    const bottomY = y + h;
    ctx.translate(centerX, bottomY);
    ctx.scale(facing, 1);

    const penDark = GAME_CONFIG.PALETTE.PEN_DARKEST;
    const zombieGreen = '#4ade80'; // Green character

    if (isHurt) {
      ctx.globalAlpha = 0.5 + Math.sin(animTime * 20) * 0.3;
      ctx.fillStyle = GAME_CONFIG.PALETTE.FX_BLOOD_RED;
      ctx.beginPath();
      ctx.arc(0, -h / 2, w, 0, Math.PI * 2);
      ctx.fill();
    }

    const walkCycle = Math.sin(animTime * 8);
    const bodyW = w * 0.6;
    const bodyH = h * 0.5;

    // Body
    ctx.fillStyle = zombieGreen;
    ctx.strokeStyle = penDark;
    ctx.lineWidth = 1.5;
    
    ctx.beginPath();
    ctx.ellipse(0, -bodyH, bodyW / 2, bodyH / 2, walkCycle * 0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Head
    const headSway = Math.sin(animTime * 3) * 0.2;
    ctx.beginPath();
    ctx.arc(walkCycle * 2, -h + 6, w * 0.35, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Eyes
    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.arc(walkCycle * 2 + 4, -h + 4, 3, 0, Math.PI * 2);
    ctx.fill();

    // Arms
    ctx.beginPath();
    ctx.moveTo(0, -bodyH * 1.5);
    ctx.lineTo(15 + walkCycle * 5, -bodyH * 1.2);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(0, -bodyH * 1.5);
    ctx.lineTo(20 + walkCycle * -2, -bodyH * 1.4);
    ctx.stroke();

    // Legs
    ctx.beginPath();
    ctx.moveTo(-5, -bodyH * 0.5);
    ctx.lineTo(-5 - walkCycle * 10, 0);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(5, -bodyH * 0.5);
    ctx.lineTo(5 + walkCycle * 10, 0);
    ctx.stroke();

    ctx.restore();

    // Health Bar
    if (hp < maxHp) {
      const barW = w;
      const barH = 4;
      const barX = x;
      const barY = y - 10;
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fillRect(barX, barY, barW, barH);
      ctx.fillStyle = GAME_CONFIG.PALETTE.FX_BLOOD_RED;
      ctx.fillRect(barX, barY, barW * (hp / maxHp), barH);
    }
  }
`;

// Insert the code before public drawDestructible
code = code.replace('  public drawDestructible(ctx: CanvasRenderingContext2D, destructible: Destructible) {', zombieRenderCode + '\n  public drawDestructible(ctx: CanvasRenderingContext2D, destructible: Destructible) {');

fs.writeFileSync('src/game/rendering/PenRenderer.ts', code);
