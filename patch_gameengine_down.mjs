import fs from 'fs';
let code = fs.readFileSync('src/game/GameEngine.ts', 'utf8');

if (!code.includes('down: false')) {
  code = code.replace('public input = {\n    left: false,\n    right: false,', 'public input = {\n    left: false,\n    right: false,\n    down: false,');
  code = code.replace('activeInput = { left: false, right: false, jump: false, dash: false, attack: false, interact: false, useSalt: false };', 'activeInput = { left: false, right: false, down: false, jump: false, dash: false, attack: false, interact: false, useSalt: false };');
  fs.writeFileSync('src/game/GameEngine.ts', code);
}
