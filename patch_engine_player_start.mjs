import fs from 'fs';
let code = fs.readFileSync('src/game/GameEngine.ts', 'utf8');
code = code.replace(/this\.player = new Player\(100, 360\);/g, "this.player = new Player(380, 390);");
fs.writeFileSync('src/game/GameEngine.ts', code);
