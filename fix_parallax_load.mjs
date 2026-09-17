import fs from 'fs';
let code = fs.readFileSync('src/game/rendering/ParallaxBackgroundSystem.ts', 'utf8');

code = code.replace(`  constructor() {
    this.initBuffers();
    this.initAtmosphericParticles();
    this.loadCloudsImage();
    this.loadMountainsImage();
    this.loadMountainsBackImage();
    this.loadCourtyardImage();
    this.loadSanctuaryImage();
    this.loadFireFrames();
  }`, `  constructor() {
    this.initBuffers();
    this.initAtmosphericParticles();
    this.loadCloudsImage();
    this.loadMountainsImage();
    this.loadMountainsBackImage();
    this.loadCourtyardImage();
    this.loadSanctuaryImage();
    this.loadFireFrames();
    if (typeof window !== 'undefined') {
      AssetLoader.loadImage('/fundo1Cripta.png').catch(() => {});
    }
  }`);

fs.writeFileSync('src/game/rendering/ParallaxBackgroundSystem.ts', code);
