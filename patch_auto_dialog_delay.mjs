import fs from 'fs';

// 1. Aumentar a distância para ele parar mais longe
let sectionCode = fs.readFileSync('src/game/world/Section.ts', 'utf8');
sectionCode = sectionCode.replace(
  'autoTriggerDistance: 280,',
  'autoTriggerDistance: 380,'
);
fs.writeFileSync('src/game/world/Section.ts', sectionCode);

// 2. Adicionar o delay de 5 segundos no GameEngine.ts
let engineCode = fs.readFileSync('src/game/GameEngine.ts', 'utf8');

const oldTrigger = `      if (npc.autoTriggerDistance && dist < npc.autoTriggerDistance && !npc.hasTriggeredAutoDialog) {
        this.isAutoWalkingToBoss = false;
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
      }`;

const newTrigger = `      if (npc.autoTriggerDistance && dist < npc.autoTriggerDistance && !npc.hasTriggeredAutoDialog) {
        this.isAutoWalkingToBoss = false;
        npc.hasTriggeredAutoDialog = true;
        this.input.left = false;
        this.input.right = false;
        this.input.jump = false;
        this.input.attack = false;
        this.player.vx = 0; // Para imediatamente o movimento
        this.isCutscenePlaying = true;
        
        // Aguarda 5 segundos antes de abrir o diálogo
        setTimeout(() => {
          if (this.callbacks.onOpenNpcDialog) {
            soundManager.playNpcDialog();
            this.callbacks.onOpenNpcDialog(npc);
          }
        }, 5000);
      }`;

engineCode = engineCode.replace(oldTrigger, newTrigger);
fs.writeFileSync('src/game/GameEngine.ts', engineCode);
