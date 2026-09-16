import fs from 'fs';
let code = fs.readFileSync('src/game/entities/Destructible.ts', 'utf8');

const anchorSignature = `public takeDamage(info: DamageInfo, inventory: InventoryManager, addParticles: (particles: any[]) => void, addFloatingText?: (x: number, y: number, text: string, color: string) => void): DamageResult {`;
const replaceSignature = `public takeDamage(info: DamageInfo, spawnCollectible: (type: string, x: number, y: number) => void, addParticles: (particles: any[]) => void, addFloatingText?: (x: number, y: number, text: string, color: string) => void): DamageResult {`;

code = code.replace(anchorSignature, replaceSignature);

const anchorLogicStart = `      // Drop an item`;
const anchorLogicEnd = `      // Explosion particles`;

const logicToReplace = code.substring(code.indexOf(anchorLogicStart), code.indexOf(anchorLogicEnd));

const newLogic = `      // Tabela de Probabilidade de Drop (Loot Table)
      const roll = Math.random();
      let dropType = null;
      if (roll < 0.3) {
          dropType = 'heart'; // 30% chance coração
      } else if (roll < 0.6) {
          dropType = 'purifying_salt'; // 30% chance sal
      } else if (roll < 0.8) {
          dropType = 'holy_water'; // 20% chance água benta
      }

      // Se rolou um item, joga ele no mundo!
      if (dropType) {
          spawnCollectible(dropType, this.x + this.width / 2, this.y + this.height / 2);
      }

`;

code = code.replace(logicToReplace, newLogic);
fs.writeFileSync('src/game/entities/Destructible.ts', code);
console.log('Destructible updated for drops');
