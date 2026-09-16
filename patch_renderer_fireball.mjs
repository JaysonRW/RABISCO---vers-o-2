import fs from 'fs';
let code = fs.readFileSync('src/game/rendering/PenRenderer.ts', 'utf8');

// Load fogo1..fogo4
const constructorRegex = /this\.loadLordeCarmimImg\(\);\n  \}/;
const loadFireballHtml = `this.loadLordeCarmimImg();
    this.fogoSprites = [];
    if (typeof window !== "undefined") {
      for(let i=1; i<=4; i++) {
        const img = new Image();
        img.src = \`/fogo\${i}.png\`;
        this.fogoSprites.push(img);
      }
    }
  }`;

if (code.match(constructorRegex)) {
  code = code.replace(constructorRegex, loadFireballHtml);
}

// Add renderFireballs method
const renderFloatingTextsRegex = /public renderFloatingTexts/;
const renderFireballsCode = `public renderFireballs(ctx: CanvasRenderingContext2D, fireballs: any[]) {
    ctx.save();
    for (const fb of fireballs) {
      if (this.fogoSprites && this.fogoSprites.length === 4) {
        const frameIndex = Math.floor(fb.animTime * 15) % 4;
        const img = this.fogoSprites[frameIndex];
        const size = fb.radius * 3.5;
        ctx.save();
        ctx.translate(fb.x, fb.y);
        if (fb.facing === -1) {
          ctx.scale(-1, 1);
        }
        ctx.drawImage(img, -size/2, -size/2, size, size);
        ctx.restore();
      } else {
        // Fallback circle
        ctx.fillStyle = '#FF5500';
        ctx.beginPath();
        ctx.arc(fb.x, fb.y, fb.radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  }

  public renderFloatingTexts`;

if (code.match(renderFloatingTextsRegex)) {
  code = code.replace(renderFloatingTextsRegex, renderFireballsCode);
}

// Draw MP bar in HUD
const renderHUDRegex = /public renderPlayerHUD[\s\S]*?ctx\.restore\(\);\n  \}/;
const hudCodeLines = code.match(renderHUDRegex)[0];
// Replace the startY logic to draw 3 bars instead of 2.

const hudCodeNew = hudCodeLines.replace(/  public renderPlayerHUD\(ctx: CanvasRenderingContext2D, hp: number, maxHp: number, stamina: number, maxStamina: number, stats: AscensionStats, animTime: number\) \{/, 
  `  public renderPlayerHUD(ctx: CanvasRenderingContext2D, hp: number, maxHp: number, stamina: number, maxStamina: number, mp: number, maxMp: number, stats: AscensionStats, animTime: number) {`)
  .replace(/\/\/ Barra de Ascensão/g, 
  `// Barra de Magia (MP)
    startY += 32;
    drawBar(
      startY, 
      10, 
      'MAGIA', 
      \`\${Math.round(mp)} / \${maxMp}\`, 
      null, 
      (mp / maxMp) * 100, 
      GAME_CONFIG.PALETTE.PEN_LIGHT, 
      '#9933FF', 
      '#7700FF', 
      false
    );

    // Barra de Ascensão`);

code = code.replace(renderHUDRegex, hudCodeNew);

fs.writeFileSync('src/game/rendering/PenRenderer.ts', code);
console.log('Renderer patched.');
