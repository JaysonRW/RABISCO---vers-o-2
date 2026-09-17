import fs from 'fs';
let code = fs.readFileSync('src/game/rendering/ParallaxBackgroundSystem.ts', 'utf8');

const oldForestRenderCode = `    if (bg1 || bg2 || bg3) {
      ctx.save();
      ctx.globalCompositeOperation = 'multiply';
      
      const drawLayer = (img: HTMLImageElement, factor: number) => {`;

const newForestRenderCode = `    if (bg1 || bg2 || bg3) {
      ctx.save();
      ctx.globalCompositeOperation = 'source-over';
      
      const drawLayer = (img: HTMLImageElement, factor: number) => {`;

code = code.replace(oldForestRenderCode, newForestRenderCode);
fs.writeFileSync('src/game/rendering/ParallaxBackgroundSystem.ts', code);
