import fs from 'fs';
let code = fs.readFileSync('src/game/GameEngine.ts', 'utf8');

code = code.replace(
  'public cameraY: number = 0;',
  'public cameraY: number = 0;\n  public isCutscenePlaying: boolean = false;'
);

code = code.replace(
  '      this.enemyRespawnQueue = [];\n    });',
  `      this.enemyRespawnQueue = [];
      
      // Auto-trigger Cutscene
      if (section.id === 'sanctuary_interior') {
        this.isCutscenePlaying = true;
        const carmim = this.npcs.find(n => n.id === 'lorde_carmim');
        if (carmim) {
          // Pequeno delay para a tela clarear antes de abrir o diálogo
          setTimeout(() => {
            this.callbacks.onOpenNpcDialog(carmim);
          }, 600);
        }
      }
    });`
);

// Disable input when cutscene is playing
code = code.replace(
  'public updateInput() {',
  `public updateInput() {
    if (this.isCutscenePlaying) {
      this.input.left = false;
      this.input.right = false;
      this.input.jump = false;
      this.input.attack = false;
      this.input.dash = false;
      this.input.useSalt = false;
      this.input.interact = false;
      return;
    }`
);

fs.writeFileSync('src/game/GameEngine.ts', code);
