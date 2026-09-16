import fs from 'fs';
let code = fs.readFileSync('src/game/entities/Player.ts', 'utf8');

if (!code.includes('public healCastRequested')) {
  code = code.replace(
    'public spellCastRequested: boolean = false;',
    'public spellCastRequested: boolean = false;\n  public healCastRequested: boolean = false;'
  );
}

const checkFireballLogic = `    // Checa a sequência F, D, F, D
    const fwdKey = isFacingRight ? 'right' : 'left';
    if (this.inputBuffer.length >= 4) {
      const len = this.inputBuffer.length;
      const m1 = this.inputBuffer[len - 4].key === fwdKey;
      const m2 = this.inputBuffer[len - 3].key === 'down';
      const m3 = this.inputBuffer[len - 2].key === fwdKey;
      const m4 = this.inputBuffer[len - 1].key === 'down';
      
      if (m1 && m2 && m3 && m4) {
        // Disparou a sequência!
        this.spellCastRequested = true;
        this.inputBuffer = []; // Limpa para não repetir
      }
    }`;

const newCheckLogic = `    // Checa a sequência F, D, F, D (Fireball)
    const fwdKey = isFacingRight ? 'right' : 'left';
    const backKey = isFacingRight ? 'left' : 'right';
    
    if (this.inputBuffer.length >= 4) {
      const len = this.inputBuffer.length;
      const m1 = this.inputBuffer[len - 4].key === fwdKey;
      const m2 = this.inputBuffer[len - 3].key === 'down';
      const m3 = this.inputBuffer[len - 2].key === fwdKey;
      const m4 = this.inputBuffer[len - 1].key === 'down';
      
      if (m1 && m2 && m3 && m4) {
        // Disparou a sequência Fireball!
        this.spellCastRequested = true;
        this.inputBuffer = []; // Limpa para não repetir
      }
    }
    
    // Checa a sequência B, D, F (Heal)
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

code = code.replace(checkFireballLogic, newCheckLogic);
fs.writeFileSync('src/game/entities/Player.ts', code);
console.log('Player patched with heal logic.');
