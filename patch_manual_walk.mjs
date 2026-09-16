import fs from 'fs';

// 1. In GameEngine, remove forced cutscene on entrance and shorten delay.
let engineCode = fs.readFileSync('src/game/GameEngine.ts', 'utf8');

engineCode = engineCode.replace(
  "this.isCutscenePlaying = true;\n        this.isAutoWalkingToBoss = true;",
  "this.isCutscenePlaying = false;\n        this.isAutoWalkingToBoss = false;"
);

engineCode = engineCode.replace(
  "// Aguarda 5 segundos antes de abrir o diálogo\n        setTimeout(() => {\n          if (this.callbacks.onOpenNpcDialog) {\n            soundManager.playNpcDialog();\n            this.callbacks.onOpenNpcDialog(npc);\n          }\n        }, 5000);",
  "// Aguarda 1 segundo antes de abrir o diálogo\n        setTimeout(() => {\n          if (this.callbacks.onOpenNpcDialog) {\n            soundManager.playNpcDialog();\n            this.callbacks.onOpenNpcDialog(npc);\n          }\n        }, 1000);"
);

fs.writeFileSync('src/game/GameEngine.ts', engineCode);

// 2. In Section, update trigger distance
let sectionCode = fs.readFileSync('src/game/world/Section.ts', 'utf8');
sectionCode = sectionCode.replace(
  "autoTriggerDistance: 300,",
  "autoTriggerDistance: 200,"
);
fs.writeFileSync('src/game/world/Section.ts', sectionCode);

