import fs from 'fs';
let code = fs.readFileSync('src/game/rendering/PenRenderer.ts', 'utf8');

const regexHUD = /public renderPlayerHUD\\(ctx: CanvasRenderingContext2D, hp: number, maxHp: number, stamina: number, maxStamina: number, stats: AscensionStats, animTime: number\\) \\{/;

code = code.replace(
  'public renderPlayerHUD(ctx: CanvasRenderingContext2D, hp: number, maxHp: number, stamina: number, maxStamina: number, stats: AscensionStats, animTime: number) {',
  'public renderPlayerHUD(ctx: CanvasRenderingContext2D, hp: number, maxHp: number, stamina: number, maxStamina: number, mp: number, maxMp: number, stats: AscensionStats, animTime: number) {'
);

fs.writeFileSync('src/game/rendering/PenRenderer.ts', code);
