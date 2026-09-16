import fs from 'fs';
let code = fs.readFileSync('src/game/rendering/PenRenderer.ts', 'utf8');

// 1. Remover carregamento das imagens da caixa
const loadAnchor = `      for(let i=1; i<=4; i++) {
        const img = new Image();
        img.src = \`/caixa\${i}.png\`;
        this.caixaSprites.push(img);
      }`;
if (code.includes(loadAnchor)) {
    code = code.replace(loadAnchor, '');
}

// 2. Substituir drawDestructible
const drawAnchorStart = `  public drawDestructible(ctx: CanvasRenderingContext2D, destructible: Destructible) {`;
const drawAnchorEnd = `    if (type === 'vase') {`;

const oldDraw = code.substring(code.indexOf(drawAnchorStart), code.indexOf(drawAnchorEnd) + `    if (type === 'vase') {`.length);

const newDraw = `  public drawDestructible(ctx: CanvasRenderingContext2D, destructible: Destructible) {
    ctx.save();
    const { x, y, width, height, type } = destructible;
    const isDestroying = (destructible as any).isDestroying;
    const animTime = (destructible as any).animTime || 0;
    const primary = GAME_CONFIG.PALETTE.PEN_PRIMARY;
    const hatch = GAME_CONFIG.PALETTE.PEN_HATCHING;

    if (type === 'box') {
      let progress = 0;
      if (isDestroying) {
        progress = Math.min(1, animTime / 0.4);
      }

      ctx.strokeStyle = primary;
      ctx.fillStyle = '#E3D5C8'; // Textura de madeira clara/pergaminho encardido
      
      const drawPiece = (px, py, pw, ph, offX, offY, rot, alpha) => {
          ctx.save();
          ctx.globalAlpha = Math.max(0, alpha);
          ctx.translate(px + pw/2 + offX, py + ph/2 + offY);
          ctx.rotate(rot);
          
          ctx.fillRect(-pw/2, -ph/2, pw, ph);
          ctx.lineWidth = 1.5;
          ctx.strokeRect(-pw/2, -ph/2, pw, ph);
          
          // X da caixa
          ctx.beginPath();
          ctx.moveTo(-pw/2, -ph/2);
          ctx.lineTo(pw/2, ph/2);
          ctx.moveTo(pw/2, -ph/2);
          ctx.lineTo(-pw/2, ph/2);
          ctx.stroke();
          
          ctx.restore();
      };

      if (progress === 0) {
         // Caixa Intacta
         ctx.fillRect(x, y, width, height);
         
         // Detalhes da madeira (X e ripas horizontais)
         ctx.lineWidth = 1.5;
         ctx.beginPath();
         ctx.moveTo(x, y);
         ctx.lineTo(x + width, y + height);
         ctx.moveTo(x + width, y);
         ctx.lineTo(x, y + height);
         
         ctx.moveTo(x, y + height*0.33);
         ctx.lineTo(x + width, y + height*0.33);
         ctx.moveTo(x, y + height*0.66);
         ctx.lineTo(x + width, y + height*0.66);
         ctx.stroke();
         
         // Borda externa grossa
         ctx.lineWidth = 3;
         ctx.strokeRect(x, y, width, height);
         
         // Pregar os cantos (pregos)
         ctx.fillStyle = primary;
         ctx.fillRect(x + 2, y + 2, 2, 2);
         ctx.fillRect(x + width - 4, y + 2, 2, 2);
         ctx.fillRect(x + 2, y + height - 4, 2, 2);
         ctx.fillRect(x + width - 4, y + height - 4, 2, 2);
      } else {
         // Animação de Quebra (Dividida em 4 pedaços ejetados)
         const alpha = 1 - progress;
         const dist = progress * 25; // Distância que os pedaços voam
         const rotMax = Math.PI / 3;
         
         drawPiece(x, y, width/2, height/2, -dist, -dist - progress*10, -progress*rotMax, alpha);
         drawPiece(x + width/2, y, width/2, height/2, dist, -dist - progress*10, progress*rotMax, alpha);
         drawPiece(x, y + height/2, width/2, height/2, -dist, dist, -progress*rotMax, alpha);
         drawPiece(x + width/2, y + height/2, width/2, height/2, dist, dist, progress*rotMax, alpha);
      }
      
      ctx.restore();
      return;
    }

    ctx.fillStyle = '#ffffff'; // Solid white background so it stands out against the parchment
    if (type === 'vase') {`;

code = code.replace(oldDraw, newDraw);
fs.writeFileSync('src/game/rendering/PenRenderer.ts', code);
console.log('PenRenderer patched with procedural box rendering.');
