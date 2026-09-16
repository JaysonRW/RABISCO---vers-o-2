import fs from 'fs';
let code = fs.readFileSync('src/game/rendering/ParallaxBackgroundSystem.ts', 'utf8');

code = code.replace(
  '    this.loadCourtyardImage();\n  }',
  '    this.loadCourtyardImage();\n    this.loadSanctuaryImage();\n  }'
);

fs.writeFileSync('src/game/rendering/ParallaxBackgroundSystem.ts', code);
