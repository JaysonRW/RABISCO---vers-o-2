  public renderInGameAscensionBar(ctx: CanvasRenderingContext2D, stats: AscensionStats, animTime: number) {
    ctx.save();
    const w = GAME_CONFIG.CANVAS_WIDTH;
    const barW = 320;
    const barH = 14;
    const barX = (w - barW) / 2;
    const barY = 16;

    // 1. Placa/fundo de pergaminho para a barra
    ctx.fillStyle = 'rgba(244, 236, 216, 0.95)';
    ctx.strokeStyle = GAME_CONFIG.PALETTE.PEN_PRIMARY;
    ctx.lineWidth = 1.5;

    // Moldura chanfrada com pontas decoradas
    ctx.beginPath();
    ctx.moveTo(barX - 18, barY + barH / 2);
    ctx.lineTo(barX - 8, barY - 4);
    ctx.lineTo(barX + barW + 8, barY - 4);
    ctx.lineTo(barX + barW + 18, barY + barH / 2);
    ctx.lineTo(barX + barW + 8, barY + barH + 18);
    ctx.lineTo(barX - 8, barY + barH + 18);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // 2. Detalhes ornamentais laterais (asas/floreios de caneta)
    ctx.beginPath();
    ctx.moveTo(barX - 18, barY + barH / 2);
    ctx.lineTo(barX - 26, barY + barH / 2 - 4);
    ctx.lineTo(barX - 22, barY + barH / 2 + 5);
    ctx.moveTo(barX + barW + 18, barY + barH / 2);
    ctx.lineTo(barX + barW + 26, barY + barH / 2 - 4);
    ctx.lineTo(barX + barW + 22, barY + barH / 2 + 5);
    ctx.strokeStyle = GAME_CONFIG.PALETTE.PEN_PRIMARY;
    ctx.stroke();

    // 3. Fundo do canal da barra de progresso
    ctx.fillStyle = GAME_CONFIG.PALETTE.PAPER_ACCENT;
    ctx.fillRect(barX, barY, barW, barH);
    ctx.strokeStyle = GAME_CONFIG.PALETTE.PEN_PRIMARY;
    ctx.lineWidth = 1;
    ctx.strokeRect(barX, barY, barW, barH);

    // 4. Preenchimento da barra de Ascensão (Progresso de Almas)
    const fillW = Math.max(0, Math.min(barW, (stats.progressPercent / 100) * barW));
    if (fillW > 0) {
      // Preenchimento com gradiente de energia de alma (ciano para ouro celestial)
      const grad = ctx.createLinearGradient(barX, barY, barX + fillW, barY);
      grad.addColorStop(0, GAME_CONFIG.PALETTE.PEN_LIGHT);
      grad.addColorStop(0.5, GAME_CONFIG.PALETTE.FX_SOUL_CYAN);
      grad.addColorStop(1, stats.level >= 3 ? GAME_CONFIG.PALETTE.FX_HOLY_GOLD : GAME_CONFIG.PALETTE.FX_SOUL_AURA);

      ctx.fillStyle = grad;
      ctx.fillRect(barX + 1, barY + 1, fillW - 2, barH - 2);

      // Hachuras inclinadas de caneta dentro do preenchimento
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 1;
      for (let hx = barX + (animTime * 15 % 10); hx < barX + fillW; hx += 10) {
        ctx.beginPath();
        ctx.moveTo(hx, barY + 1);
        ctx.lineTo(hx - 4, barY + barH - 1);
        ctx.stroke();
      }

      // Ponta luminosa na frente da barra
      ctx.fillStyle = GAME_CONFIG.PALETTE.FX_HOLY_WHITE;
      ctx.beginPath();
      ctx.arc(barX + fillW, barY + barH / 2, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    // 5. Divisórias de checkpoints de progresso
    ctx.strokeStyle = 'rgba(10, 37, 112, 0.5)';
    ctx.lineWidth = 1;
    const steps = 4;
    for (let s = 1; s < steps; s++) {
      const sx = barX + (barW * s) / steps;
      ctx.beginPath();
      ctx.moveTo(sx, barY);
      ctx.lineTo(sx, barY + barH);
      ctx.stroke();
    }

    // 6. Texto Superior da Barra: Nível de Ascensão e Almas
    ctx.font = 'bold 9px "Cinzel", serif';
    ctx.fillStyle = GAME_CONFIG.PALETTE.PEN_DARKEST;
    ctx.textAlign = 'left';
    ctx.fillText(
      `ASCENSÃO: GRAU ${stats.level} • ${stats.title.toUpperCase()}`,
      barX,
      barY - 7
    );

    // Contagem de Almas no lado direito
    ctx.textAlign = 'right';
    ctx.fillStyle = GAME_CONFIG.PALETTE.PEN_PRIMARY;
    ctx.fillText(
      `${stats.soulsCurrentLevel}/${stats.soulsNeededForNext} ALMAS (${stats.progressPercent}%)`,
      barX + barW,
      barY - 7
    );

    // 7. Subtexto / Bônus Ativo abaixo da barra
    ctx.font = 'italic 8.5px serif';
    ctx.fillStyle = stats.level > 0 ? GAME_CONFIG.PALETTE.FX_BLOOD_RED : 'rgba(10, 37, 112, 0.7)';
    ctx.textAlign = 'center';
    ctx.fillText(
      `Bônus: ${stats.bonusText} (${Math.round(stats.damageMultiplier * 100)}% Poder)`,
      barX + barW / 2,
      barY + barH + 12
    );

    // 8. Pequeno orbe/ícone de alma à esquerda da barra
    const soulPulse = Math.sin(animTime * 5) * 1.5;
    ctx.fillStyle = GAME_CONFIG.PALETTE.FX_SOUL_CYAN;
    ctx.beginPath();
    ctx.arc(barX - 10, barY + barH / 2, 4 + soulPulse, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = GAME_CONFIG.PALETTE.PEN_PRIMARY;
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.restore();
  }

  // Pós-processamento de vinheta e textura granulada de papel
  public renderPostProcessing(ctx: CanvasRenderingContext2D) {
    const w = GAME_CONFIG.CANVAS_WIDTH;
    const h = GAME_CONFIG.CANVAS_HEIGHT;

    ctx.save();

    // 1. Textura de ruído de papel (pattern repeat)
    if (this.noiseCanvas) {
      const pattern = ctx.createPattern(this.noiseCanvas, 'repeat');
      if (pattern) {
        ctx.fillStyle = pattern;
        ctx.fillRect(0, 0, w, h);
      }
    }
