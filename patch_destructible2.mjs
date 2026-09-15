import fs from 'fs';
let code = fs.readFileSync('src/game/entities/Destructible.ts', 'utf8');

code = code.replace(
  'public takeDamage(info: DamageInfo, inventory: InventoryManager, addParticles: (particles: any[]) => void): DamageResult {',
  'public takeDamage(info: DamageInfo, inventory: InventoryManager, addParticles: (particles: any[]) => void, addFloatingText?: (x: number, y: number, text: string, color: string) => void): DamageResult {'
);

const originalDropCode = `      // Drop an item (e.g. a minor consumable or material)
      const drops = ['sal_purificador', 'pocao_vida_pequena'];
      const randomDrop = drops[Math.floor(Math.random() * drops.length)];
      // InventoryManager uses a specific format, let's just use addItem if it exists.
      inventory.addItem({
        id: randomDrop + '_' + Date.now(),
        name: randomDrop === 'sal_purificador' ? 'Punhado de Sal' : 'Pó de Cura',
        description: 'Recurso caído dos escombros.',
        type: 'CONSUMABLE',
        icon: randomDrop === 'sal_purificador' ? '🧂' : '🧪',
        count: 1
      });`;

const newDropCode = `      // Drop an item
      const drops = ['purifying_salt', 'holy_water'];
      const randomDrop = drops[Math.floor(Math.random() * drops.length)];
      
      const isSalt = randomDrop === 'purifying_salt';
      const itemName = isSalt ? 'Sal Purificador' : 'Água Benta';
      
      inventory.addItem({
        id: randomDrop, // Use the EXACT id so they stack correctly in inventory
        name: itemName,
        description: 'Recurso caído dos escombros.',
        type: isSalt ? 'COATING' : 'CONSUMABLE',
        icon: isSalt ? 'salt' : 'flask',
        count: 1
      });
      
      if (isSalt) {
        inventory.addSalt(1); // Force sync the salt count variable
      }

      if (addFloatingText) {
        addFloatingText(this.x + this.width / 2, this.y - 20, \`+1 \${itemName}\`, GAME_CONFIG.PALETTE.PEN_PRIMARY);
      }
`;

code = code.replace(originalDropCode, newDropCode);
fs.writeFileSync('src/game/entities/Destructible.ts', code);
