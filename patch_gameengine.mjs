import fs from 'fs';

let code = fs.readFileSync('src/game/GameEngine.ts', 'utf8');

const oldCall = `    // 8. Barra de Progresso de Ascensão no Topo da Tela (Coordenadas de Tela)
    this.renderer.renderInGameAscensionBar(ctx, this.getAscensionStats(), this.player.animTime);`;

const newCall = `    // 8. HUD Completo (Vida, Estamina, Ascensão)
    this.renderer.renderPlayerHUD(ctx, this.player.hp, this.player.maxHp, this.player.stamina, this.player.maxStamina, this.getAscensionStats(), this.player.animTime);`;

code = code.replace(oldCall, newCall);
fs.writeFileSync('src/game/GameEngine.ts', code);
