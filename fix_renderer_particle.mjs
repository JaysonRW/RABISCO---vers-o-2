import fs from 'fs';
let code = fs.readFileSync('src/game/rendering/PenRenderer.ts', 'utf8');

const oldRender = `      if (p.shape === 'spark') {
        ctx.beginPath();
        ctx.moveTo(p.x - p.size, p.y);
        ctx.lineTo(p.x + p.size, p.y);
        ctx.moveTo(p.x, p.y - p.size);
        ctx.lineTo(p.x, p.y + p.size);
        ctx.stroke();
      } else if (p.shape === 'ink_splatter') {`;

const newRender = `      if (p.shape === 'ZOMBIE_HEAD') {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation || 0);
        
        ctx.fillStyle = '#4ade80';
        ctx.strokeStyle = GAME_CONFIG.PALETTE.PEN_DARKEST;
        ctx.lineWidth = 1.5;
        
        ctx.beginPath();
        ctx.arc(0, 0, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        // Olhos da cabeça rolando
        ctx.fillStyle = '#10b981';
        ctx.beginPath();
        ctx.arc(2, -2, 2, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
      } else if (p.shape === 'spark') {
        ctx.beginPath();
        ctx.moveTo(p.x - p.size, p.y);
        ctx.lineTo(p.x + p.size, p.y);
        ctx.moveTo(p.x, p.y - p.size);
        ctx.lineTo(p.x, p.y + p.size);
        ctx.stroke();
      } else if (p.shape === 'ink_splatter') {`;

code = code.replace(oldRender, newRender);

fs.writeFileSync('src/game/rendering/PenRenderer.ts', code);
