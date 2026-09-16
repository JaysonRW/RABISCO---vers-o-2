import fs from 'fs';

let penCode = fs.readFileSync('src/game/rendering/PenRenderer.ts', 'utf8');

const barMethodLines = fs.readFileSync('bar_method.ts', 'utf8').split('\n');
const originalMethod = barMethodLines.slice(0, 126).join('\n'); // until line 125 which is the closing brace

const newMethod = `  public renderPlayerHUD(ctx: CanvasRenderingContext2D, hp: number, maxHp: number, stamina: number, maxStamina: number, stats: AscensionStats, animTime: number) {
    ctx.save();
    const barW = 280;
    let startY = 24;
    const barX = 30;

    const drawBar = (y: number, height: number, label: string, valueText: string, subText: string | null, percent: number, color1: string, color2: string, color3: string, showCheckpoints: boolean) => {
      ctx.fillStyle = 'rgba(244, 236, 216, 0.95)';
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
      ctx.stroke();

      ctx.fillStyle = GAME_CONFIG.PALETTE.PAPER_ACCENT;
      ctx.fillRect(barX, y, barW, height);
      ctx.strokeStyle = GAME_CONFIG.PALETTE.PEN_PRIMARY;
      ctx.lineWidth = 1;
      ctx.strokeRect(barX, y, barW, height);

      const fillW = Math.max(0, Math.min(barW, (percent / 100) * barW));
      if (fillW > 0) {
        const grad = ctx.createLinearGradient(barX, y, barX + fillW, y);
        grad.addColorStop(0, color1);
        grad.addColorStop(0.5, color2);
        grad.addColorStop(1, color3);
        ctx.fillStyle = grad;
        ctx.fillRect(barX + 1, y + 1, fillW - 2, height - 2);

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 1;
        for (let hx = barX + (animTime * 15 % 10); hx < barX + fillW; hx += 10) {
          ctx.beginPath();
          ctx.moveTo(hx, y + 1);
          ctx.lineTo(hx - 4, y + height - 1);
          ctx.stroke();
        }

        ctx.fillStyle = GAME_CONFIG.PALETTE.FX_HOLY_WHITE;
        ctx.beginPath();
        ctx.arc(barX + fillW, y + height / 2, 4, 0, Math.PI * 2);
        ctx.fill();
      }

      if (showCheckpoints) {
        ctx.strokeStyle = 'rgba(10, 37, 112, 0.5)';
        ctx.lineWidth = 1;
        const steps = 4;
        for (let s = 1; s < steps; s++) {
          const sx = barX + (barW * s) / steps;
          ctx.beginPath();
          ctx.moveTo(sx, y);
          ctx.lineTo(sx, y + height);
          ctx.stroke();
        }
      }

      ctx.font = 'bold 9px "Cinzel", serif';
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
      }
      
      if (showCheckpoints) { // Ícone orbe de alma na esquerda da XP
        const soulPulse = Math.sin(animTime * 5) * 1.5;
        ctx.fillStyle = color2;
        ctx.beginPath();
        ctx.arc(barX - 10, y + height / 2, 4 + soulPulse, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = GAME_CONFIG.PALETTE.PEN_PRIMARY;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    };

    // Barra de Vida
    drawBar(
      startY, 
      12, 
      'VIDA', 
      \`\${Math.round(hp)} / \${maxHp}\`, 
      null, 
      (hp / maxHp) * 100, 
      GAME_CONFIG.PALETTE.PEN_LIGHT, 
      GAME_CONFIG.PALETTE.FX_BLOOD_RED, 
      '#FF4444', 
      false
    );

    // Barra de Estamina
    startY += 32;
    drawBar(
      startY, 
      10, 
      'ESTAMINA', 
      \`\${Math.round((stamina / maxStamina) * 100)}%\`, 
      null, 
      (stamina / maxStamina) * 100, 
      GAME_CONFIG.PALETTE.PEN_LIGHT, 
      GAME_CONFIG.PALETTE.FX_SOUL_CYAN, 
      '#38BDF8', 
      false
    );

    // Barra de Ascensão
    startY += 32;
    drawBar(
      startY, 
      14, 
      \`ASCENSÃO: GRAU \${stats.level} • \${stats.title.toUpperCase()}\`, 
      \`\${stats.soulsCurrentLevel}/\${stats.soulsNeededForNext} ALMAS (\${stats.progressPercent}%)\`, 
      \`Bônus: \${stats.bonusText} (\${Math.round(stats.damageMultiplier * 100)}% Poder)\`, 
      stats.progressPercent, 
      GAME_CONFIG.PALETTE.PEN_LIGHT, 
      GAME_CONFIG.PALETTE.FX_SOUL_CYAN, 
      stats.level >= 3 ? GAME_CONFIG.PALETTE.FX_HOLY_GOLD : GAME_CONFIG.PALETTE.FX_SOUL_AURA, 
      true
    );

    ctx.restore();
  }`;

if (penCode.includes(originalMethod)) {
  penCode = penCode.replace(originalMethod, newMethod);
  fs.writeFileSync('src/game/rendering/PenRenderer.ts', penCode);
  console.log('Successfully replaced method safely.');
} else {
  console.log('Error: Original method string not found exactly.');
}
