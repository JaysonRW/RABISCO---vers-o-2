import fs from 'fs';
let code = fs.readFileSync('src/game/rendering/PenRenderer.ts', 'utf8');

// Also remove the console.log I added
code = code.replace(`  public renderPlayerHUD(ctx: CanvasRenderingContext2D, hp: number, maxHp: number, stamina: number, maxStamina: number, mp: number, maxMp: number, stats: AscensionStats, animTime: number) {
    console.log("HUD STATS:", stats);
    ctx.save();`, `  public renderPlayerHUD(ctx: CanvasRenderingContext2D, hp: number, maxHp: number, stamina: number, maxStamina: number, mp: number, maxMp: number, stats: AscensionStats, animTime: number) {
    ctx.save();`);

code = code.replace(`    drawBar(
      startY, 
      14, 
      \`ASCENSÃO: GRAU \${stats.level} • \${stats.title.toUpperCase()}\`, 
      \`\${stats.soulsCurrentLevel}/\${stats.soulsNeededForNext} ALMAS (\${stats.progressPercent}%)\`, 
      \`Bônus: \${stats.bonusText} (\${Math.round(stats.damageMultiplier * 100)}% Poder)\`, `, `    drawBar(
      startY, 
      14, 
      \`GRAU \${stats.level} • \${stats.title.toUpperCase()}\`, 
      \`\${stats.soulsCurrentLevel}/\${stats.soulsNeededForNext} ALMAS\`, 
      \`Bônus: \${stats.bonusText} (\${Math.round(stats.damageMultiplier * 100)}% Poder)\`, `);

// While we're at it, let's slightly increase the barW to give it more breathing room, just in case.
// 280 to 320
code = code.replace(`    const barW = 280;`, `    const barW = 320;`);

fs.writeFileSync('src/game/rendering/PenRenderer.ts', code);
