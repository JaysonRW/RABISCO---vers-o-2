import fs from 'fs';
let code = fs.readFileSync('src/game/GameEngine.ts', 'utf8');

code = code.replace(
  /      \/\/ Auto-trigger Cutscene[\s\S]*?      \}\n/,
  '      // Cutscene now triggered by proximity (autoTriggerDistance)\n'
);

fs.writeFileSync('src/game/GameEngine.ts', code);
