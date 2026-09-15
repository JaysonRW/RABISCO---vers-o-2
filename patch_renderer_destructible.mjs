import fs from 'fs';
let code = fs.readFileSync('src/game/rendering/PenRenderer.ts', 'utf8');

if (!code.includes('import { Destructible }')) {
  code = code.replace(
    "import { NPC } from '../entities/NPC';",
    "import { NPC } from '../entities/NPC';\nimport { Destructible } from '../entities/Destructible';"
  );
}

const methodStr = `
  public drawDestructible(ctx: CanvasRenderingContext2D, destructible: Destructible) {
    ctx.save();
    const { x, y, width, height, type } = destructible;
    const primary = GAME_CONFIG.PALETTE.PEN_PRIMARY;
    const hatch = GAME_CONFIG.PALETTE.PEN_HATCHING;

    ctx.strokeStyle = primary;
    ctx.lineWidth = 1.2;
    ctx.lineJoin = 'round';

    // Multiple strokes to simulate ballpoint pen sketch
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      const ox = (Math.random() - 0.5) * 1.5;
      const oy = (Math.random() - 0.5) * 1.5;
      
      if (type === 'box') {
        ctx.rect(x + ox, y + oy, width, height);
        // Draw diagonal cross on box
        ctx.moveTo(x + ox, y + oy);
        ctx.lineTo(x + width + ox, y + height + oy);
        ctx.moveTo(x + width + ox, y + oy);
        ctx.lineTo(x + ox, y + height + oy);
      } else if (type === 'vase') {
        // Simple vase shape
        ctx.moveTo(x + width * 0.2 + ox, y + oy);
        ctx.lineTo(x + width * 0.8 + ox, y + oy);
        ctx.quadraticCurveTo(x + width + ox, y + height / 2 + oy, x + width * 0.7 + ox, y + height + oy);
        ctx.lineTo(x + width * 0.3 + ox, y + height + oy);
        ctx.quadraticCurveTo(x + ox, y + height / 2 + oy, x + width * 0.2 + ox, y + oy);
      } else if (type === 'rubble') {
        // Irregular rubble pile
        ctx.moveTo(x + ox, y + height + oy);
        ctx.lineTo(x + width * 0.3 + ox, y + height * 0.2 + oy);
        ctx.lineTo(x + width * 0.7 + ox, y + height * 0.4 + oy);
        ctx.lineTo(x + width + ox, y + height + oy);
        ctx.closePath();
      }
      ctx.stroke();
    }

    // Cross-hatching for shading in the bottom-right corner
    ctx.strokeStyle = hatch;
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    const hatchSteps = 4;
    for (let j = 0; j < width + height; j += hatchSteps) {
      const hx1 = x + Math.max(0, j - height);
      const hy1 = y + Math.min(height, j);
      const hx2 = x + Math.min(width, j);
      const hy2 = y + Math.max(0, j - width);
      
      // Only draw hatching in the bottom right 60%
      if (hx1 > x + width * 0.4 && hy2 > y + height * 0.4) {
        ctx.moveTo(hx1, hy1);
        ctx.lineTo(hx2, hy2);
      }
    }
    ctx.stroke();

    ctx.restore();
  }
`;

if (!code.includes('public drawDestructible')) {
  code = code.replace(
    'public renderNPC(',
    methodStr + '\n  public renderNPC('
  );
  fs.writeFileSync('src/game/rendering/PenRenderer.ts', code);
}
