import re

with open('src/components/GameCanvas.tsx', 'r') as f:
    gc_code = f.read()

# I want to make sure it plays sound and updates inventory states properly for other items too
onUseItem_find = r'if \(item\.id === \'holy_water\'\) \{.*?\n\s*\}'
onUseItem_replace = """if (item.id === 'holy_water') {
                    if (item.count > 0) {
                        item.count--;
                        eng.player.hp = Math.min(eng.player.maxHp, eng.player.hp + 20); // Heals 20 HP
                        eng.addFloatingText(eng.player.x, eng.player.y - 20, `+20 HP`, '#10B981', 1.2);
                        if ((soundManager as any).playHeal) (soundManager as any).playHeal();
                    }
                 } else if (item.type === 'CONSUMABLE' && item.count > 0) {
                     item.count--;
                     // Heals the player fully just as a fallback
                     eng.player.hp = eng.player.maxHp;
                     eng.addFloatingText(eng.player.x, eng.player.y - 20, `Restaurado`, '#10B981', 1.2);
                     if ((soundManager as any).playHeal) (soundManager as any).playHeal();
                 }"""

gc_code = re.sub(onUseItem_find, onUseItem_replace, gc_code, flags=re.DOTALL)

with open('src/components/GameCanvas.tsx', 'w') as f:
    f.write(gc_code)
