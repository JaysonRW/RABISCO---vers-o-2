import fs from 'fs';
let code = fs.readFileSync('src/game/entities/Player.ts', 'utf8');

const classDecl = `export class Player {`;
const newClassDecl = `export class Player {
  private prevInput: any = {};
  public fireballsFired: boolean = false; // flag para GameEngine saber qdo criar a entidade
  public spellCastRequested: boolean = false;
`;

const updateSig = `  public update(
    dt: number,
    input: {
      left: boolean;
      right: boolean;
      down?: boolean;
      jump: boolean;
      dash: boolean;
      attack: boolean;
      useSalt: boolean;
    },
    platforms: Rect[],
    hasSaltWeapon: boolean,
    onUseSaltRequest: () => void
  ) {`;

const newUpdateStart = `  public update(
    dt: number,
    input: {
      left: boolean;
      right: boolean;
      down?: boolean;
      jump: boolean;
      dash: boolean;
      attack: boolean;
      useSalt: boolean;
    },
    platforms: Rect[],
    hasSaltWeapon: boolean,
    onUseSaltRequest: () => void
  ) {
    // Regenera MP aos poucos
    this.mp = Math.min(this.maxMp, this.mp + (dt * 2)); // +2 MP por segundo

    // Processa Buffer de Imput para Mágica (Frente, Baixo, Frente, Baixo)
    const time = Date.now();
    const isFacingRight = this.facing === Direction.RIGHT;
    
    // Detecta press keys (edges)
    if (input.right && !this.prevInput.right) this.inputBuffer.push({ key: 'right', time });
    if (input.left && !this.prevInput.left) this.inputBuffer.push({ key: 'left', time });
    if (input.down && !this.prevInput.down) this.inputBuffer.push({ key: 'down', time });
    
    // Mantém o buffer pequeno (apenas últimos 10 inputs em menos de 1 segundo)
    this.inputBuffer = this.inputBuffer.filter(i => time - i.time < 1000).slice(-10);
    
    this.prevInput = { left: input.left, right: input.right, down: input.down };

    // Checa a sequência F, D, F, D
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

code = code.replace(classDecl, newClassDecl);
code = code.replace(updateSig, newUpdateStart);

fs.writeFileSync('src/game/entities/Player.ts', code);
