import fs from 'fs';
let code = fs.readFileSync('src/game/rendering/PenRenderer.ts', 'utf8');

const anchor = `  public renderPlayer(`;
const inj = `  public renderCollectibles(ctx: CanvasRenderingContext2D, items: any[]) {
    ctx.save();
    for (const item of items) {
      if (item.type === 'heart') {
         // Coração desenhado
         ctx.fillStyle = '#EF4444';
         ctx.beginPath();
         ctx.arc(item.x + 4, item.y + 4, 4, 0, Math.PI*2);
         ctx.arc(item.x + 12, item.y + 4, 4, 0, Math.PI*2);
         ctx.lineTo(item.x + 8, item.y + 14);
         ctx.fill();
         ctx.strokeStyle = '#7F1D1D';
         ctx.stroke();
      } else if (item.type === 'purifying_salt') {
         // Saquinho de sal
         ctx.fillStyle = '#E5E7EB';
         ctx.fillRect(item.x + 2, item.y + 4, 12, 12);
         ctx.strokeStyle = '#000000';
         ctx.strokeRect(item.x + 2, item.y + 4, 12, 12);
         ctx.fillStyle = '#6B7280';
         ctx.fillRect(item.x + 6, item.y + 8, 4, 4);
      } else {
         // Frasco de água benta
         ctx.fillStyle = '#3B82F6';
         ctx.beginPath();
         ctx.moveTo(item.x + 8, item.y);
         ctx.lineTo(item.x + 14, item.y + 16);
         ctx.lineTo(item.x + 2, item.y + 16);
         ctx.closePath();
         ctx.fill();
         ctx.strokeStyle = '#000000';
         ctx.stroke();
      }
    }
    ctx.restore();
  }

  public renderPlayer(`;

if (code.includes(anchor)) {
    code = code.replace(anchor, inj);
    fs.writeFileSync('src/game/rendering/PenRenderer.ts', code);
    console.log('PenRenderer patched with renderCollectibles.');
}
