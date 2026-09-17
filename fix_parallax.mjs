import fs from 'fs';
let code = fs.readFileSync('src/game/rendering/ParallaxBackgroundSystem.ts', 'utf8');

code = code.replace(`    this.renderAtmosphericVFX(ctx, cameraX, dt, theme);`, `    this.renderAtmosphericVFX(ctx, cameraX, dt);`);

fs.writeFileSync('src/game/rendering/ParallaxBackgroundSystem.ts', code);
