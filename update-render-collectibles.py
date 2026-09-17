import re

with open('src/game/rendering/PenRenderer.ts', 'r') as f:
    code = f.read()

regex = re.compile(r'public renderCollectibles\(ctx: CanvasRenderingContext2D, items: any\[\]\) \{[\s\S]*?ctx\.restore\(\);\s*\}')

newRender = """public renderCollectibles(ctx: CanvasRenderingContext2D, items: any[]) {
    ctx.save();
    for (const item of items) {
      const dbItem = require('../inventory/ItemDatabase').ItemDatabase[item.type];
      
      let visualType = 'flask';
      if (dbItem) {
          if (dbItem.category === 'consumable') visualType = 'heart';
          else if (dbItem.category === 'ammunition') visualType = 'shard';
          else if (dbItem.category === 'weapon') visualType = 'sword';
          else if (dbItem.category === 'sub_weapon') visualType = 'flask';
          else if (dbItem.category === 'buff') visualType = 'pouch';
          else if (dbItem.category === 'special') visualType = 'hourglass';
      } else {
          // Fallback legacy
          if (item.type === 'heart') visualType = 'heart';
          else if (item.type === 'purifying_salt') visualType = 'pouch';
      }

      if (visualType === 'heart') {
         ctx.fillStyle = '#EF4444';
         ctx.beginPath();
         ctx.arc(item.x + 4, item.y + 4, 4, 0, Math.PI*2);
         ctx.arc(item.x + 12, item.y + 4, 4, 0, Math.PI*2);
         ctx.lineTo(item.x + 8, item.y + 14);
         ctx.fill();
         ctx.strokeStyle = '#7F1D1D';
         ctx.stroke();
      } else if (visualType === 'pouch') {
         ctx.fillStyle = '#E5E7EB';
         ctx.fillRect(item.x + 2, item.y + 4, 12, 12);
         ctx.strokeStyle = '#000000';
         ctx.strokeRect(item.x + 2, item.y + 4, 12, 12);
         ctx.fillStyle = '#6B7280';
         ctx.fillRect(item.x + 6, item.y + 8, 4, 4);
      } else if (visualType === 'shard') {
         ctx.fillStyle = '#111827';
         ctx.beginPath();
         ctx.moveTo(item.x + 8, item.y);
         ctx.lineTo(item.x + 14, item.y + 8);
         ctx.lineTo(item.x + 8, item.y + 16);
         ctx.lineTo(item.x + 2, item.y + 8);
         ctx.closePath();
         ctx.fill();
         ctx.strokeStyle = '#6B7280';
         ctx.stroke();
      } else if (visualType === 'sword') {
         ctx.fillStyle = '#9CA3AF';
         ctx.fillRect(item.x + 6, item.y, 4, 16);
         ctx.fillStyle = '#4B5563';
         ctx.fillRect(item.x + 2, item.y + 4, 12, 3);
         ctx.strokeStyle = '#1F2937';
         ctx.strokeRect(item.x + 6, item.y, 4, 16);
      } else if (visualType === 'hourglass') {
         ctx.fillStyle = '#D97706';
         ctx.beginPath();
         ctx.moveTo(item.x + 2, item.y);
         ctx.lineTo(item.x + 14, item.y);
         ctx.lineTo(item.x + 8, item.y + 8);
         ctx.lineTo(item.x + 14, item.y + 16);
         ctx.lineTo(item.x + 2, item.y + 16);
         ctx.lineTo(item.x + 8, item.y + 8);
         ctx.closePath();
         ctx.fill();
         ctx.strokeStyle = '#78350F';
         ctx.stroke();
      } else {
         // Flask
         ctx.fillStyle = '#3B82F6';
         ctx.beginPath();
         ctx.moveTo(item.x + 8, item.y);
         ctx.lineTo(item.x + 14, item.y + 16);
         ctx.lineTo(item.x + 2, item.y + 16);
         ctx.closePath();
         ctx.fill();
         ctx.strokeStyle = '#000000';
         ctx.stroke();
      }
    }
    ctx.restore();
  }"""

code = regex.sub(newRender, code)
with open('src/game/rendering/PenRenderer.ts', 'w') as f:
    f.write(code)
