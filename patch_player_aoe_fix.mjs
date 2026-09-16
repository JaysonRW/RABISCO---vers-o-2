import fs from 'fs';
let code = fs.readFileSync('src/game/entities/Player.ts', 'utf8');

const oldLogic = `    // Checa a sequência Baixo, Baixo, Cima, Ataque (AOE)
    if (this.inputBuffer.length >= 4) {
      const len = this.inputBuffer.length;
      const a1 = this.inputBuffer[len - 4].key === 'down';
      const a2 = this.inputBuffer[len - 3].key === 'down';
      const a3 = this.inputBuffer[len - 2].key === 'up';
      const a4 = this.inputBuffer[len - 1].key === 'attack';
      
      if (a1 && a2 && a3 && a4) {
        // Disparou a sequência AOE!
        this.aoeCastRequested = true;
        this.inputBuffer = []; // Limpa
      }
    }`;

const newLogic = `    // Checa a sequência Baixo, Baixo, Cima (AOE)
    if (this.inputBuffer.length >= 3) {
      const len = this.inputBuffer.length;
      const a1 = this.inputBuffer[len - 3].key === 'down';
      const a2 = this.inputBuffer[len - 2].key === 'down';
      const a3 = this.inputBuffer[len - 1].key === 'up';
      
      if (a1 && a2 && a3) {
        // Disparou a sequência AOE!
        this.aoeCastRequested = true;
        this.inputBuffer = []; // Limpa
      }
    }`;

code = code.replace(oldLogic, newLogic);
fs.writeFileSync('src/game/entities/Player.ts', code);
console.log('Player patched');
