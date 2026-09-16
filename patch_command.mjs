import fs from 'fs';

// 1. Patch Player.ts
let playerCode = fs.readFileSync('src/game/entities/Player.ts', 'utf8');

const oldAoeLogic = `    // Checa a sequência Baixo, Cima, Ataque (AOE)
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

const newAoeLogic = `    // Checa a sequência Baixo, Baixo, Cima, Ataque (AOE)
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

if (playerCode.includes(oldAoeLogic)) {
  playerCode = playerCode.replace(oldAoeLogic, newAoeLogic);
  fs.writeFileSync('src/game/entities/Player.ts', playerCode);
  console.log('Player.ts patched.');
} else {
  console.log('Could not find AOE logic in Player.ts');
}


// 2. Patch StatusScreen.tsx
let statusScreenCode = fs.readFileSync('src/components/StatusScreen.tsx', 'utf8');

const oldStatusText = `<span>Comando: <span className="text-white">Baixo, Cima, Ataque</span></span>`;
const newStatusText = `<span>Comando: <span className="text-white">Baixo, Baixo, Cima, Ataque</span></span>`;

if (statusScreenCode.includes(oldStatusText)) {
  statusScreenCode = statusScreenCode.replace(oldStatusText, newStatusText);
  // Pode haver mais de um (um na aba default e um oculto), vamos usar global/split-join ou replaceAll se aplicavel
  statusScreenCode = statusScreenCode.split(oldStatusText).join(newStatusText);
  fs.writeFileSync('src/components/StatusScreen.tsx', statusScreenCode);
  console.log('StatusScreen.tsx patched.');
} else {
  console.log('Could not find AOE text in StatusScreen.tsx');
}

