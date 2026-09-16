import fs from 'fs';
let code = fs.readFileSync('src/game/rendering/ParallaxBackgroundSystem.ts', 'utf8');

// Modify render() to pass the theme to renderAtmosphericVFX
code = code.replace(
  "    // 4. Partículas e Bruma Atmosférica Móvel (VFX MÓVEL - Prancha 04)\n    this.renderAtmosphericVFX(ctx, cameraX, dt);\n  }",
  "    // 4. Partículas e Bruma Atmosférica Móvel (VFX MÓVEL - Prancha 04)\n    this.renderAtmosphericVFX(ctx, cameraX, dt, theme);\n  }"
);

// Modify renderAtmosphericVFX to accept theme and use red colors if in sanctuary
const oldVfx = `  // Partículas e Bruma Atmosférica Móvel (Prancha 04)
  private renderAtmosphericVFX(ctx: CanvasRenderingContext2D, cameraX: number, dt: number) {
    ctx.save();
    const w = GAME_CONFIG.CANVAS_WIDTH;
    const h = GAME_CONFIG.CANVAS_HEIGHT;

    for (const p of this.atmosphericParticles) {
      // Movimento do vento e leve flutuação vertical
      p.x += p.vx * dt;
      p.y += p.vy * dt + Math.sin(this.animTimer * 2 + p.pulsePhase) * 0.4;

      // Wrap horizontal e vertical
      if (p.x > w + 20) p.x = -20;
      if (p.x < -20) p.x = w + 20;
      if (p.y > h + 10) p.y = -10;
      if (p.y < -10) p.y = h + 10;

      const alphaPulse = p.alpha * (0.8 + Math.sin(this.animTimer * 3 + p.pulsePhase) * 0.2);

      if (p.type === 'ink_speck') {
        // Ponto de tinta / poeira de carvão suspensa
        ctx.fillStyle = \`rgba(10, 37, 112, \${alphaPulse * 0.7})\`;
        ctx.fillRect(p.x, p.y, p.size, p.size);
      } else {
        // Mote de luz / bruma flutuante
        ctx.fillStyle = \`rgba(255, 251, 235, \${alphaPulse * 0.9})\`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = \`rgba(37, 90, 196, \${alphaPulse * 0.3})\`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
    }

    ctx.restore();
  }`;

const newVfx = `  // Partículas e Bruma Atmosférica Móvel (Prancha 04)
  private renderAtmosphericVFX(ctx: CanvasRenderingContext2D, cameraX: number, dt: number, theme: BiomeTheme) {
    ctx.save();
    const w = GAME_CONFIG.CANVAS_WIDTH;
    const h = GAME_CONFIG.CANVAS_HEIGHT;

    const isCrimson = theme === 'CRIMSON_SANCTUARY';

    for (const p of this.atmosphericParticles) {
      // Movimento do vento e leve flutuação vertical
      p.x += p.vx * dt;
      p.y += p.vy * dt + Math.sin(this.animTimer * 2 + p.pulsePhase) * 0.4;

      // Wrap horizontal e vertical
      if (p.x > w + 20) p.x = -20;
      if (p.x < -20) p.x = w + 20;
      if (p.y > h + 10) p.y = -10;
      if (p.y < -10) p.y = h + 10;

      const alphaPulse = p.alpha * (0.8 + Math.sin(this.animTimer * 3 + p.pulsePhase) * 0.2);

      if (p.type === 'ink_speck') {
        // Ponto de tinta / poeira de carvão suspensa
        ctx.fillStyle = isCrimson 
          ? \`rgba(180, 20, 20, \${alphaPulse * 0.9})\` // Reddish embers
          : \`rgba(10, 37, 112, \${alphaPulse * 0.7})\`;
        ctx.fillRect(p.x, p.y, p.size, p.size);
      } else {
        // Mote de luz / bruma flutuante
        ctx.fillStyle = isCrimson 
          ? \`rgba(255, 80, 50, \${alphaPulse * 0.9})\` // Bright fiery mote
          : \`rgba(255, 251, 235, \${alphaPulse * 0.9})\`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = isCrimson 
          ? \`rgba(220, 0, 0, \${alphaPulse * 0.6})\` 
          : \`rgba(37, 90, 196, \${alphaPulse * 0.3})\`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
    }

    ctx.restore();
  }`;

code = code.replace(oldVfx, newVfx);

fs.writeFileSync('src/game/rendering/ParallaxBackgroundSystem.ts', code);
