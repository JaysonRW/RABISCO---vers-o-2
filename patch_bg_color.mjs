import fs from 'fs';
let code = fs.readFileSync('src/game/rendering/ParallaxBackgroundSystem.ts', 'utf8');

code = code.replace(
  "ctx.fillStyle = '#050101'; // Very dark red/black",
  "ctx.fillStyle = '#FFFFFF'; // White"
);

fs.writeFileSync('src/game/rendering/ParallaxBackgroundSystem.ts', code);
