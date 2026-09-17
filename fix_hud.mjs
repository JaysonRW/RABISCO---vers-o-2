import fs from 'fs';
let code = fs.readFileSync('src/game/rendering/PenRenderer.ts', 'utf8');

const oldCode = `      ctx.font = 'bold 9px "Cinzel", serif';
      ctx.fillStyle = GAME_CONFIG.PALETTE.PEN_DARKEST;
      ctx.textAlign = 'left';
      ctx.fillText(label, barX, y - 7);

      ctx.textAlign = 'right';
      ctx.fillStyle = GAME_CONFIG.PALETTE.PEN_PRIMARY;
      ctx.fillText(valueText, barX + barW, y - 7);

      if (subText) {
        ctx.font = 'italic 8.5px serif';
        ctx.fillStyle = color3 === GAME_CONFIG.PALETTE.FX_HOLY_GOLD ? GAME_CONFIG.PALETTE.FX_BLOOD_RED : 'rgba(10, 37, 112, 0.7)';
        ctx.textAlign = 'center';
        ctx.fillText(subText, barX + barW / 2, y + height + 12);
      }`;

const newCode = `      ctx.font = 'bold 9px "Cinzel", serif';
      ctx.fillStyle = '#FFA500'; // Laranja para contraste
      ctx.textAlign = 'left';
      ctx.fillText(label, barX, y - 7);

      ctx.textAlign = 'right';
      ctx.fillStyle = '#FF8C00'; // Laranja para contraste
      ctx.fillText(valueText, barX + barW, y - 7);

      if (subText) {
        ctx.font = 'italic 8.5px serif';
        ctx.fillStyle = '#FF4500'; // Laranja para contraste
        ctx.textAlign = 'center';
        ctx.fillText(subText, barX + barW / 2, y + height + 12);
      }`;

code = code.replace(oldCode, newCode);
fs.writeFileSync('src/game/rendering/PenRenderer.ts', code);
