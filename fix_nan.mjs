import fs from 'fs';
let code = fs.readFileSync('src/game/rendering/ParallaxBackgroundSystem.ts', 'utf8');

code = code.replace(
  'const drawW = drawH * (img.width / img.height);',
  'const drawW = Math.max(10, drawH * (img.width / img.height));'
);

fs.writeFileSync('src/game/rendering/ParallaxBackgroundSystem.ts', code);
