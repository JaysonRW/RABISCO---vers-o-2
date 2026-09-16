import fs from 'fs';
let code = fs.readFileSync('src/game/GameEngine.ts', 'utf8');

const injection = `
  private spawnPlayerDamageInkParticles(x: number, y: number, dirX: number) {
    for (let i = 0; i < 15; i++) {
      this.particles.push({
        x: x + (Math.random() - 0.5) * 10,
        y: y + (Math.random() - 0.5) * 20,
        vx: dirX * (100 + Math.random() * 200) + (Math.random() - 0.5) * 50,
        vy: -150 - Math.random() * 200,
        color: GAME_CONFIG.PALETTE.PEN_PRIMARY,
        size: Math.random() * 3 + 1,
        life: 0,
        maxLife: 0.4 + Math.random() * 0.4,
        alpha: 1,
        shape: 'ink_slash',
        gravity: 800
      });
    }
  }

  private triggerScreenShake`;

if (!code.includes('spawnPlayerDamageInkParticles(x: number')) {
  code = code.replace('  private triggerScreenShake', injection);
  fs.writeFileSync('src/game/GameEngine.ts', code);
  console.log('Method spawnPlayerDamageInkParticles added.');
}
