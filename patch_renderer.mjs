import fs from 'fs';
let code = fs.readFileSync('src/game/rendering/PenRenderer.ts', 'utf8');

const oldDrawBox = `         drawPiece(x + width/2, y + height/2, width/2, height/2, dist, dist, progress*rotMax, alpha);
      }
      
      ctx.restore();
      return;
    }`;

const newDrawBox = `         drawPiece(x + width/2, y + height/2, width/2, height/2, dist, dist, progress*rotMax, alpha);
      }
      
      ctx.restore();
      return;
    } else if (destType === 'urn') {
      let progress = 0;
      if (isDestroying) {
        progress = Math.min(1, animTime / 0.4);
      }
      ctx.strokeStyle = primary;
      ctx.fillStyle = '#E8E8E8'; // Textura de cerâmica antiga
      
      if (progress === 0) {
         // Urna Intacta
         ctx.beginPath();
         // Base
         ctx.moveTo(x + width * 0.2, y + height);
         // Lado direito curvado
         ctx.quadraticCurveTo(x + width + 5, y + height * 0.6, x + width * 0.8, y + height * 0.2);
         // Boca
         ctx.lineTo(x + width * 0.9, y);
         ctx.lineTo(x + width * 0.1, y);
         ctx.lineTo(x + width * 0.2, y + height * 0.2);
         // Lado esquerdo curvado
         ctx.quadraticCurveTo(x - 5, y + height * 0.6, x + width * 0.2, y + height);
         ctx.fill();
         ctx.lineWidth = 1.5;
         ctx.stroke();
         
         // Detalhes da urna (linhas decorativas)
         ctx.beginPath();
         ctx.moveTo(x + width * 0.15, y + height * 0.2);
         ctx.lineTo(x + width * 0.85, y + height * 0.2);
         ctx.moveTo(x + 2, y + height * 0.5);
         ctx.lineTo(x + width - 2, y + height * 0.5);
         ctx.moveTo(x + 5, y + height * 0.8);
         ctx.lineTo(x + width - 5, y + height * 0.8);
         ctx.stroke();

         // Sombreamento hachurado
         ctx.strokeStyle = hatch;
         ctx.lineWidth = 0.8;
         ctx.beginPath();
         for(let j = 0; j < height; j += 4) {
           ctx.moveTo(x + width * 0.6, y + j);
           ctx.lineTo(x + width - (j % 8), y + j + 4);
         }
         ctx.stroke();
      } else {
         // Animação de quebra da urna (cacos voando)
         const alpha = 1 - progress;
         ctx.globalAlpha = Math.max(0, alpha);
         ctx.lineWidth = 1.5;
         
         const shards = 5;
         for (let i = 0; i < shards; i++) {
           ctx.save();
           const sx = x + width/2;
           const sy = y + height/2;
           const angle = (Math.PI * 2 / shards) * i;
           const dist = progress * 30;
           
           ctx.translate(sx + Math.cos(angle) * dist, sy + Math.sin(angle) * dist + progress * 20); // Caem um pouco
           ctx.rotate(progress * Math.PI * (i % 2 === 0 ? 1 : -1));
           
           ctx.beginPath();
           ctx.moveTo(0, -10);
           ctx.lineTo(8, 5);
           ctx.lineTo(-8, 8);
           ctx.closePath();
           ctx.fill();
           ctx.stroke();
           ctx.restore();
         }
         ctx.globalAlpha = 1.0;
      }
      return;
    }`;

code = code.replace(oldDrawBox, newDrawBox);
fs.writeFileSync('src/game/rendering/PenRenderer.ts', code);
