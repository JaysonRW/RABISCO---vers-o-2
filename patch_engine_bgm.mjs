import fs from 'fs';
let code = fs.readFileSync('src/game/GameEngine.ts', 'utf8');

const oldSetup = `      // Cutscene now triggered by proximity (autoTriggerDistance)
    });`;

const newSetup = `      // Cutscene now triggered by proximity (autoTriggerDistance)
      
      // Manage BGM based on section
      if (section.id === 'sanctuary_interior') {
        // Assume the user will upload a file named bgm_sanctuary.mp3 to public/ 
        // For now, it will try to load this URL.
        soundManager.playBGM('/bgm_sanctuary.mp3', 0.4);
      } else {
        soundManager.fadeOutBGM(1500);
      }
    });`;

code = code.replace(oldSetup, newSetup);

fs.writeFileSync('src/game/GameEngine.ts', code);
