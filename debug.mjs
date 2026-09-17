import fs from 'fs';
let code = fs.readFileSync('src/game/rendering/PenRenderer.ts', 'utf8');
code = code.replace(`  public renderPlayerHUD(ctx: CanvasRenderingContext2D, hp: number, maxHp: number, stamina: number, maxStamina: number, mp: number, maxMp: number, stats: AscensionStats, animTime: number) {
    ctx.save();`, `  public renderPlayerHUD(ctx: CanvasRenderingContext2D, hp: number, maxHp: number, stamina: number, maxStamina: number, mp: number, maxMp: number, stats: AscensionStats, animTime: number) {
    console.log("HUD STATS:", stats);
    ctx.save();`);
fs.writeFileSync('src/game/rendering/PenRenderer.ts', code);
