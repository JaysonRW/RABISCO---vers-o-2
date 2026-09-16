import fs from 'fs';
let code = fs.readFileSync('src/game/GameEngine.ts', 'utf8');

const updatePlayerOriginal = `    // 2. Atualiza Jogador
    this.player.update(
      dt,
      this.input,
      this.level.platforms,
      this.inventory.hasSaltCoating,
      () => this.triggerUseSalt()
    );`;

const updatePlayerNew = `    // 2. Atualiza Jogador
    
    // Lock inputs if playing a cutscene
    const activeInput = this.isCutscenePlaying ? {
      left: false, right: false, jump: false, dash: false, attack: false, interact: false, useSalt: false
    } : this.input;

    this.player.update(
      dt,
      activeInput,
      this.level.platforms,
      this.inventory.hasSaltCoating,
      () => this.triggerUseSalt()
    );`;

code = code.replace(updatePlayerOriginal, updatePlayerNew);

fs.writeFileSync('src/game/GameEngine.ts', code);
