import fs from 'fs';
let code = fs.readFileSync('src/game/rendering/PenRenderer.ts', 'utf8');

const newMethod = `
  public renderAoePuddles(ctx: CanvasRenderingContext2D, puddles: {x: number, y: number, radius: number, maxRadius: number, life: number, maxLife: number}[]) {
    ctx.save();
    for (const puddle of puddles) {
      const progress = puddle.life / puddle.maxLife; // 0 to 1
      const currentRadius = puddle.radius;
      
      // Efeito de fade-out
      const alpha = progress < 0.2 ? (progress / 0.2) : (1 - (progress - 0.2) / 0.8) * 0.8;
      
      ctx.globalAlpha = Math.max(0, alpha);
      
      ctx.beginPath();
      // Desenha uma elipse achatada no chão para dar perspectiva 2.5D
      ctx.ellipse(puddle.x, puddle.y, currentRadius, currentRadius * 0.3, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#051442'; // Cor de nankin/tinta escura
      ctx.fill();
      
      // Borda da poça mais escura
      ctx.beginPath();
      ctx.ellipse(puddle.x, puddle.y, currentRadius, currentRadius * 0.3, 0, 0, Math.PI * 2);
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#000000';
      ctx.stroke();
      
      // Alguns detalhes internos tipo ranhuras
      ctx.beginPath();
      ctx.ellipse(puddle.x, puddle.y, currentRadius * 0.7, currentRadius * 0.2, 0, 0, Math.PI * 2);
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.stroke();
    }
    ctx.restore();
  }

  public renderPlayer(`;

code = code.replace('  public renderPlayer(', newMethod);
fs.writeFileSync('src/game/rendering/PenRenderer.ts', code);
console.log('Added renderAoePuddles to PenRenderer');
