import fs from 'fs';
let code = fs.readFileSync('src/game/GameEngine.ts', 'utf8');

const anchor = `    // 5a. Renderiza Aura e Centelhas de Ascensão do Cavaleiro
    this.renderer.renderPlayerAscensionAura(`;

const injection = `    // 5a1. Renderiza Aura Animada de Cura
    this.renderer.renderPlayerHealingAura(
      ctx,
      this.player.x,
      this.player.y,
      this.player.width,
      this.player.height,
      this.player.healingAuraTimer
    );

    // 5a. Renderiza Aura e Centelhas de Ascensão do Cavaleiro
    this.renderer.renderPlayerAscensionAura(`;

code = code.replace(anchor, injection);
fs.writeFileSync('src/game/GameEngine.ts', code);
console.log('GameEngine render patched for healing aura.');
