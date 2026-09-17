import re

with open('src/game/rendering/PenRenderer.ts', 'r') as f:
    code = f.read()

minimap_code = """
  // ==========================================
  // MINI-MAP
  // ==========================================
  public renderMinimap(ctx: CanvasRenderingContext2D, sectionData: any, playerX: number, playerY: number) {
    ctx.save();
    
    const minimapWidth = 180;
    const minimapHeight = 100;
    const padding = 15;
    
    // Position at top-right
    const mapX = GAME_CONFIG.CANVAS_WIDTH - minimapWidth - 20;
    const mapY = 20;
    
    const primary = GAME_CONFIG.PALETTE.PEN_PRIMARY;
    const sec = GAME_CONFIG.PALETTE.PEN_SECONDARY;
    
    // Background (Parchment look)
    ctx.fillStyle = 'rgba(235, 225, 210, 0.8)';
    ctx.fillRect(mapX, mapY, minimapWidth, minimapHeight);
    
    // Hand-drawn border
    ctx.strokeStyle = primary;
    ctx.lineWidth = 1.5;
    
    // Double sketchy border
    ctx.beginPath();
    ctx.rect(mapX - 2, mapY - 2, minimapWidth + 4, minimapHeight + 4);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.rect(mapX + 2, mapY + 2, minimapWidth - 4, minimapHeight - 4);
    ctx.stroke();
    
    // Level scaling
    const levelW = sectionData.width || 2000;
    const levelH = sectionData.height || GAME_CONFIG.CANVAS_HEIGHT;
    
    const usableW = minimapWidth - padding * 2;
    const usableH = minimapHeight - padding * 2;
    
    const scaleX = usableW / levelW;
    const scaleY = usableH / levelH;
    
    const offsetX = mapX + padding;
    const offsetY = mapY + padding;
    
    // Draw Platforms
    ctx.fillStyle = 'rgba(28, 38, 59, 0.4)'; // Faded ink for terrain
    if (sectionData.platforms) {
      for (const plat of sectionData.platforms) {
        const px = offsetX + plat.x * scaleX;
        const py = offsetY + plat.y * scaleY;
        const pw = plat.width * scaleX;
        const ph = plat.height * scaleY;
        
        ctx.fillRect(px, py, pw, ph);
      }
    }
    
    // Draw Player
    const playerPx = offsetX + playerX * scaleX;
    const playerPy = offsetY + playerY * scaleY;
    
    ctx.fillStyle = GAME_CONFIG.PALETTE.FX_BLOOD_RED || '#B91C1C';
    ctx.beginPath();
    ctx.arc(playerPx, playerPy - 2, 4, 0, Math.PI * 2);
    ctx.fill();
    
    // Subtle cross for player
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(playerPx - 2, playerPy - 2);
    ctx.lineTo(playerPx + 2, playerPy - 2);
    ctx.moveTo(playerPx, playerPy - 4);
    ctx.lineTo(playerPx, playerPy);
    ctx.stroke();
    
    // Title
    ctx.fillStyle = primary;
    ctx.font = '12px Cinzel';
    ctx.textAlign = 'center';
    ctx.fillText("MAPA", mapX + minimapWidth / 2, mapY + minimapHeight - 4);
    
    ctx.restore();
  }
"""

code = code.replace("  public renderPlayerHUD(", minimap_code + "\n  public renderPlayerHUD(")

with open('src/game/rendering/PenRenderer.ts', 'w') as f:
    f.write(code)

with open('src/game/GameEngine.ts', 'r') as f:
    engine_code = f.read()

# Hook into GameEngine
hook = """    // 8. HUD Completo (Vida, Estamina, Magia, Ascensão)
    this.renderer.renderPlayerHUD(ctx, this.player.hp, this.player.maxHp, this.player.stamina, this.player.maxStamina, this.player.mp, this.player.maxMp, this.getAscensionStats(), this.player.animTime);

    // 8.5 Mini-map
    this.renderer.renderMinimap(ctx, this.sectionManager.currentSection, this.player.x, this.player.y);"""

engine_code = engine_code.replace("""    // 8. HUD Completo (Vida, Estamina, Magia, Ascensão)
    this.renderer.renderPlayerHUD(ctx, this.player.hp, this.player.maxHp, this.player.stamina, this.player.maxStamina, this.player.mp, this.player.maxMp, this.getAscensionStats(), this.player.animTime);""", hook)

with open('src/game/GameEngine.ts', 'w') as f:
    f.write(engine_code)
