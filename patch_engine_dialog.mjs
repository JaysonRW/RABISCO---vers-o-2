import fs from 'fs';
let code = fs.readFileSync('src/game/GameEngine.ts', 'utf8');

// 1. Remove the immediate auto-trigger on entering sanctuary
const oldAutoTrigger = `      // Auto-trigger Cutscene
      if (section.id === 'sanctuary_interior') {
        this.isCutscenePlaying = true;
        const carmim = this.npcs.find(n => n.id === 'lorde_carmim');
        if (carmim) {
          // Pequeno delay para a tela clarear antes de abrir o diálogo
          setTimeout(() => {
            this.callbacks.onOpenNpcDialog(carmim);
          }, 600);
        }
      }`;

code = code.replace(oldAutoTrigger, `      // Cutscene will trigger on approach`);

// 2. Add an property for triggered status to the class (we can just add it dynamically to the NPC object since it's JS under the hood, or add to class fields in TS)
// Better yet, just add it to NPC.ts
