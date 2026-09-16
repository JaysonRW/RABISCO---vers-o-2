import fs from 'fs';

let penCode = fs.readFileSync('src/game/rendering/PenRenderer.ts', 'utf8');

const toRemove = `      ctx.fillStyle = 'rgba(244, 236, 216, 0.95)';
      ctx.strokeStyle = GAME_CONFIG.PALETTE.PEN_PRIMARY;
      ctx.lineWidth = 1.5;

      ctx.beginPath();
      ctx.moveTo(barX - 18, y + height / 2);
      ctx.lineTo(barX - 8, y - 4);
      ctx.lineTo(barX + barW + 8, y - 4);
      ctx.lineTo(barX + barW + 18, y + height / 2);
      ctx.lineTo(barX + barW + 8, y + height + 18);
      ctx.lineTo(barX - 8, y + height + 18);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(barX - 18, y + height / 2);
      ctx.lineTo(barX - 26, y + height / 2 - 4);
      ctx.lineTo(barX - 22, y + height / 2 + 5);
      ctx.moveTo(barX + barW + 18, y + height / 2);
      ctx.lineTo(barX + barW + 26, y + height / 2 - 4);
      ctx.lineTo(barX + barW + 22, y + height / 2 + 5);
      ctx.strokeStyle = GAME_CONFIG.PALETTE.PEN_PRIMARY;
      ctx.stroke();`;

if (penCode.includes(toRemove)) {
  penCode = penCode.replace(toRemove, '');
  fs.writeFileSync('src/game/rendering/PenRenderer.ts', penCode);
  console.log('Removed parchment borders!');
} else {
  console.log('Could not find the exact parchment drawing code.');
}
