import fs from 'fs';
let code = fs.readFileSync('src/game/world/Section.ts', 'utf8');

code = code.replace(
  "  role: 'HERMIT' | 'SPIRIT';\n}",
  "  role: 'HERMIT' | 'SPIRIT';\n  autoTriggerDistance?: number;\n}"
);

code = code.replace(
  "        role: 'SPIRIT',",
  "        role: 'SPIRIT',\n        autoTriggerDistance: 280,"
);

fs.writeFileSync('src/game/world/Section.ts', code);
