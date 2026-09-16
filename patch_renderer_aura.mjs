import fs from 'fs';
let code = fs.readFileSync('src/game/rendering/PenRenderer.ts', 'utf8');

const regex = /public renderPlayerAscensionAura\(/;

const newMethod = `  public renderPlayerHealingAura(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    timer: number
  ) {
    if (timer <= 0) return;

    ctx.save();
    const cx = x + w / 2;
    const cy = y + h / 2;
    
    const progress = 1 - (timer / 0.8); 
    const alpha = timer > 0.4 ? 0.8 : (timer / 0.4) * 0.8;
    
    ctx.globalAlpha = alpha;
    ctx.translate(cx, cy);

    // Círculo expansivo 1
    ctx.beginPath();
    ctx.arc(0, 0, 30 + progress * 50, 0, Math.PI * 2);
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#10B981'; // Verde brilhante
    ctx.stroke();
    
    // Círculo interno giratório (arcos)
    ctx.rotate(progress * Math.PI * 4);
    ctx.beginPath();
    ctx.arc(0, 0, 20 + progress * 20, 0.2, Math.PI - 0.2);
    ctx.arc(0, 0, 20 + progress * 20, Math.PI + 0.2, Math.PI * 2 - 0.2);
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#34D399';
    ctx.stroke();

    // Simbolo / Cruz de cura
    ctx.beginPath();
    const crossSize = 10 + progress * 10;
    ctx.moveTo(-crossSize, 0);
    ctx.lineTo(crossSize, 0);
    ctx.moveTo(0, -crossSize);
    ctx.lineTo(0, crossSize);
    ctx.lineWidth = 5;
    ctx.strokeStyle = '#10B981';
    ctx.stroke();

    ctx.restore();
  }

  public renderPlayerAscensionAura(`;

code = code.replace(regex, newMethod);
fs.writeFileSync('src/game/rendering/PenRenderer.ts', code);
console.log('PenRenderer patched for healing aura.');
