import fs from 'fs';
let code = fs.readFileSync('src/game/GameEngine.ts', 'utf8');

const oldNpcUpdate = `    for (const npc of this.npcs) {
      npc.update(dt);
      const npcCenterX = npc.x + npc.width / 2;
      const npcCenterY = npc.y + npc.height / 2;
      const dist = Math.sqrt(
        (pCenterX - npcCenterX) * (pCenterX - npcCenterX) +
        (pCenterY - npcCenterY) * (pCenterY - npcCenterY)
      );

      if (dist < 85) {
        this.activeNpcNearby = npc;
        if (this.input.interact && this.callbacks.onOpenNpcDialog) {
          soundManager.playNpcDialog();
          this.callbacks.onOpenNpcDialog(npc);
          this.input.interact = false; // consome tecla de interação
        }
      }
    }`;

const newNpcUpdate = `    for (const npc of this.npcs) {
      npc.update(dt);
      const npcCenterX = npc.x + npc.width / 2;
      const npcCenterY = npc.y + npc.height / 2;
      const dist = Math.sqrt(
        (pCenterX - npcCenterX) * (pCenterX - npcCenterX) +
        (pCenterY - npcCenterY) * (pCenterY - npcCenterY)
      );

      // Distância de interação manual (E)
      if (dist < 85) {
        this.activeNpcNearby = npc;
        if (this.input.interact && this.callbacks.onOpenNpcDialog && !this.isCutscenePlaying) {
          soundManager.playNpcDialog();
          this.callbacks.onOpenNpcDialog(npc);
          this.input.interact = false; // consome tecla de interação
        }
      }
      
      // Auto-trigger distance (para bosses/cutscenes)
      if (npc.autoTriggerDistance && dist < npc.autoTriggerDistance && !npc.hasTriggeredAutoDialog) {
        npc.hasTriggeredAutoDialog = true;
        this.input.left = false;
        this.input.right = false;
        this.input.jump = false;
        this.input.attack = false;
        this.isCutscenePlaying = true;
        if (this.callbacks.onOpenNpcDialog) {
          soundManager.playNpcDialog();
          this.callbacks.onOpenNpcDialog(npc);
        }
      }
    }`;

code = code.replace(oldNpcUpdate, newNpcUpdate);
fs.writeFileSync('src/game/GameEngine.ts', code);
