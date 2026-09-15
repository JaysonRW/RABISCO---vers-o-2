const fs = require('fs');
let code = fs.readFileSync('src/game/inventory/InventoryManager.ts', 'utf8');

if (!code.includes('public addItem(')) {
  code = code.replace(
    'public getActiveDamageType(): DamageType {',
    `public addItem(item: Item) {
    const existing = this.items.find(i => i.id === item.id);
    if (existing && existing.count !== undefined) {
      existing.count = Math.min(existing.maxCount || 99, existing.count + (item.count || 1));
    } else {
      this.items.push(item);
    }
  }

  public getActiveDamageType(): DamageType {`
  );
  fs.writeFileSync('src/game/inventory/InventoryManager.ts', code);
}
