import fs from 'fs';
let code = fs.readFileSync('src/game/rendering/ParallaxBackgroundSystem.ts', 'utf8');

code = code.replace(
  /data\[i\] = r \* 0\.8;\s*data\[i\+1\] = g \* 0\.2;\s*data\[i\+2\] = b \* 0\.2;/g,
  '// Keep original colors for the dark sketch'
);

fs.writeFileSync('src/game/rendering/ParallaxBackgroundSystem.ts', code);
