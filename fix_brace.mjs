import fs from 'fs';
let code = fs.readFileSync('src/game/GameEngine.ts', 'utf8');

code = code.replace(
  '      // Cutscene now triggered by proximity (autoTriggerDistance)\n      }\n    });\n  }',
  '      // Cutscene now triggered by proximity (autoTriggerDistance)\n    });\n  }'
);

fs.writeFileSync('src/game/GameEngine.ts', code);
