import fs from 'fs';

let code = fs.readFileSync('src/game/GameEngine.ts', 'utf8');

const oldBlock = `      if (dist < 85) {
        this.activeNpcNearby = npc;
        if (this.input.interact && this.callbacks.onOpenNpcDialog && !this.isCutscenePlaying) {
          soundManager.playNpcDialog();
          this.callbacks.onOpenNpcDialog(npc);
          this.input.interact = false; // consome tecla de interação
        }
      }`;

const newBlock = `      if (dist < 85) {
        this.activeNpcNearby = npc;
        if (this.input.interact && this.callbacks.onOpenNpcDialog && !this.isCutscenePlaying) {
          this.player.vx = 0; // stop player
          this.isCutscenePlaying = true; // Lock player movement
          soundManager.playNpcDialog();
          this.callbacks.onOpenNpcDialog(npc);
          this.input.interact = false; // consome tecla de interação
        }
      }`;

code = code.replace(oldBlock, newBlock);
fs.writeFileSync('src/game/GameEngine.ts', code);
