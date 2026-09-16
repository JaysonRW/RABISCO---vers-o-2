import fs from 'fs';
let code = fs.readFileSync('src/game/entities/Player.ts', 'utf8');

if (!code.includes('public aoeCastRequested')) {
  code = code.replace(
    'public healCastRequested: boolean = false;',
    'public healCastRequested: boolean = false;\n  public aoeCastRequested: boolean = false;'
  );
}

const inputBufferLogic = `    // Detecta press keys (edges)
    if (input.right && !this.prevInput.right) this.inputBuffer.push({ key: 'right', time });
    if (input.left && !this.prevInput.left) this.inputBuffer.push({ key: 'left', time });
    if (input.down && !this.prevInput.down) this.inputBuffer.push({ key: 'down', time });`;

const newInputBufferLogic = `    // Detecta press keys (edges)
    if (input.right && !this.prevInput.right) this.inputBuffer.push({ key: 'right', time });
    if (input.left && !this.prevInput.left) this.inputBuffer.push({ key: 'left', time });
    if (input.down && !this.prevInput.down) this.inputBuffer.push({ key: 'down', time });
    if (input.jump && !this.prevInput.jump) this.inputBuffer.push({ key: 'up', time });
    if (input.attack && !this.prevInput.attack) this.inputBuffer.push({ key: 'attack', time });`;

if (code.includes(inputBufferLogic)) {
  code = code.replace(inputBufferLogic, newInputBufferLogic);
}

const prevInputUpdate = `    this.prevInput = { left: input.left, right: input.right, down: input.down };`;
const newPrevInputUpdate = `    this.prevInput = { left: input.left, right: input.right, down: input.down, jump: input.jump, attack: input.attack };`;

if (code.includes(prevInputUpdate)) {
  code = code.replace(prevInputUpdate, newPrevInputUpdate);
}

const healCheckLogic = `    // Checa a sequência B, D, F (Heal)
    if (this.inputBuffer.length >= 3) {
      const len = this.inputBuffer.length;
      const h1 = this.inputBuffer[len - 3].key === backKey;
      const h2 = this.inputBuffer[len - 2].key === 'down';
      const h3 = this.inputBuffer[len - 1].key === fwdKey;
      
      if (h1 && h2 && h3) {
        // Disparou a sequência Heal!
        this.healCastRequested = true;
        this.inputBuffer = []; // Limpa
      }
    }`;

const newChecks = healCheckLogic + `
    
    // Checa a sequência Baixo, Cima, Ataque (AOE)
    if (this.inputBuffer.length >= 3) {
      const len = this.inputBuffer.length;
      const a1 = this.inputBuffer[len - 3].key === 'down';
      const a2 = this.inputBuffer[len - 2].key === 'up';
      const a3 = this.inputBuffer[len - 1].key === 'attack';
      
      if (a1 && a2 && a3) {
        // Disparou a sequência AOE!
        this.aoeCastRequested = true;
        this.inputBuffer = []; // Limpa
      }
    }`;

if (code.includes(healCheckLogic)) {
  code = code.replace(healCheckLogic, newChecks);
}

fs.writeFileSync('src/game/entities/Player.ts', code);
