import fs from 'fs';
let code = fs.readFileSync('src/game/GameEngine.ts', 'utf8');

const hudCall = `    // 8. HUD Completo (Vida, Estamina, Ascensão)
    this.renderer.renderPlayerHUD(ctx, this.player.hp, this.player.maxHp, this.player.stamina, this.player.maxStamina, this.getAscensionStats(), this.player.animTime);`;

const newHudCall = `    // 8. HUD Completo (Vida, Estamina, Magia, Ascensão)
    this.renderer.renderPlayerHUD(ctx, this.player.hp, this.player.maxHp, this.player.stamina, this.player.maxStamina, this.player.mp, this.player.maxMp, this.getAscensionStats(), this.player.animTime);`;

if (code.includes(hudCall)) {
  code = code.replace(hudCall, newHudCall);
}

const renderParticlesCall = `    // 6. Renderiza Partículas no Espaço de Mundo
    this.renderer.renderParticles(ctx, this.particles);`;

const newRenderParticlesCall = `    // 6. Renderiza Partículas no Espaço de Mundo
    this.renderer.renderParticles(ctx, this.particles);
    
    // 6.5. Renderiza Fireballs
    this.renderer.renderFireballs(ctx, this.fireballs);`;

if (code.includes(renderParticlesCall)) {
  code = code.replace(renderParticlesCall, newRenderParticlesCall);
}

fs.writeFileSync('src/game/GameEngine.ts', code);
console.log('GameEngine render patched.');
