import re

with open('src/game/rendering/PenRenderer.ts', 'r') as f:
    code = f.read()

# I will replace the entire 'bone_wall' block in drawDestructible
# Here is the pattern I need to match:
#     } else if (destType === 'bone_wall') { ... }
# Then the next block is:
#     // @ts-ignore
#     ctx.fillStyle = '#ffffff';

pattern = r"\} else if \(destType === 'bone_wall'\) \{.*?ctx\.restore\(\);\s*return;\s*\}"
replacement = """} else if (destType === 'bone_wall') {
      let progress = 0;
      if (isDestroying) {
        progress = Math.min(1, animTime / 0.4);
      }
      ctx.strokeStyle = primary;
      ctx.fillStyle = '#F5F5DC'; // Osso velho
      
      const drawSkull = (sx: number, sy: number, size: number, rot: number, alpha: number) => {
          ctx.save();
          ctx.globalAlpha = Math.max(0, alpha);
          ctx.translate(sx, sy);
          ctx.rotate(rot);
          
          ctx.fillStyle = '#F5F5DC';
          ctx.lineWidth = 1.2;
          
          // Forma da caveira (meio círculo + mandíbula)
          ctx.beginPath();
          ctx.arc(0, -size*0.25, size, Math.PI, 0); // Topo
          ctx.lineTo(size*0.7, size*0.8);        // Lado direito da mandíbula
          ctx.lineTo(-size*0.7, size*0.8);       // Lado esquerdo da mandíbula
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          
          // Olhos (vazados)
          ctx.fillStyle = primary;
          ctx.beginPath();
          ctx.arc(-size*0.4, -size*0.1, size*0.25, 0, Math.PI*2);
          ctx.arc(size*0.4, -size*0.1, size*0.25, 0, Math.PI*2);
          ctx.fill();
          
          // Nariz
          ctx.beginPath();
          ctx.moveTo(0, size*0.2);
          ctx.lineTo(-size*0.15, size*0.4);
          ctx.lineTo(size*0.15, size*0.4);
          ctx.closePath();
          ctx.fill();
          
          ctx.restore();
      };
      
      const centerX = x + width/2;
      const bottomY = y + height;
      const size = 9; // Tamanho das caveiras

      if (progress === 0) {
         // Pilha intacta de caveiras
         // Base (3 caveiras)
         drawSkull(centerX - 12, bottomY - size, size, -0.2, 1);
         drawSkull(centerX + 12, bottomY - size, size, 0.3, 1);
         drawSkull(centerX, bottomY - size + 2, size, -0.05, 1);
         
         // Meio (2 caveiras)
         drawSkull(centerX - 7, bottomY - size*2.2, size, -0.1, 1);
         drawSkull(centerX + 8, bottomY - size*2.4, size, 0.15, 1);
         
         // Topo (1 caveira)
         drawSkull(centerX, bottomY - size*3.6, size, -0.05, 1);
      } else {
         // Animação de quebra da parede de ossos/caveiras
         const alpha = 1 - progress;
         const dist = progress * 35; 
         const rotMax = Math.PI / 2;
         
         // Base explodindo
         drawSkull(centerX - 12 - dist, bottomY - size - dist*0.5, size, -0.2 - progress*rotMax, alpha);
         drawSkull(centerX + 12 + dist, bottomY - size - dist*0.2, size, 0.3 + progress*rotMax, alpha);
         drawSkull(centerX - dist*0.5, bottomY - size + 2 + dist, size, -0.05 - progress*rotMax, alpha);
         
         // Meio explodindo
         drawSkull(centerX - 7 - dist*1.2, bottomY - size*2.2 - dist, size, -0.1 - progress*rotMax*1.5, alpha);
         drawSkull(centerX + 8 + dist*0.8, bottomY - size*2.4 - dist*1.2, size, 0.15 + progress*rotMax*1.2, alpha);
         
         // Topo explodindo
         drawSkull(centerX + dist*0.5, bottomY - size*3.6 - dist*1.5, size, -0.05 + progress*rotMax*2, alpha);
      }
      ctx.restore();
      return;
    }"""

code = re.sub(pattern, replacement, code, flags=re.DOTALL)

with open('src/game/rendering/PenRenderer.ts', 'w') as f:
    f.write(code)
