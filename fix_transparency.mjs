import fs from 'fs';
let code = fs.readFileSync('src/game/rendering/ParallaxBackgroundSystem.ts', 'utf8');

const oldPillarsCode = `    const pillarImage = AssetLoader.getImage('/pilarcripta.png');
    if (pillarImage) {
      ctx.save();
      ctx.globalCompositeOperation = 'multiply';
      const factor = 0.32;
      const imgW = pillarImage.width || this.loopWidth;`;

const newPillarsCode = `    const pillarImage = AssetLoader.getImage('/pilarcripta.png');
    if (pillarImage) {
      ctx.save();
      // Remove a propriedade de multiply para evitar que a imagem dos pilares aplique modo de blend ou transparência com o fundo
      ctx.globalCompositeOperation = 'source-over'; 
      const factor = 0.32;
      const imgW = pillarImage.width || this.loopWidth;`;

code = code.replace(oldPillarsCode, newPillarsCode);

fs.writeFileSync('src/game/rendering/ParallaxBackgroundSystem.ts', code);
