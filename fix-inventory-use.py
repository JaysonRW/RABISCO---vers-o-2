import re

with open('src/components/StatusScreen.tsx', 'r') as f:
    code = f.read()

# I will add an onUseItem prop to StatusScreen
prop_interface_find = r'interface StatusScreenProps \{'
prop_interface_replace = """interface StatusScreenProps {
  stats: any;
  onClose: () => void;
  onClearNewItems?: () => void;
  onUseItem?: (itemId: string) => void;
}
"""
code = re.sub(r'interface StatusScreenProps \{.*?\n\}', prop_interface_replace, code, flags=re.DOTALL)

# Also update the component signature
component_sig_find = r'export const StatusScreen: React\.FC<StatusScreenProps> = \(\{ stats, onClose, onClearNewItems \}\) => \{'
component_sig_replace = 'export const StatusScreen: React.FC<StatusScreenProps> = ({ stats, onClose, onClearNewItems, onUseItem }) => {'
code = code.replace(component_sig_find, component_sig_replace)

# Now, add a "Use/Equip" button in the inventory items mapping
item_div_find = r"""                            \{item\.count !== undefined && \(\s*<div className="flex flex-col items-center justify-center min-w-\[4rem\] border-l border-stone-800 pl-4 ml-4">\s*<span className="text-\[10px\] text-stone-600 uppercase tracking-widest">Qtd</span>\s*<span className="text-3xl font-black font-\['Special_Elite'\] text-amber-500">\{item\.count\}</span>\s*</div>\s*\)\}"""

item_div_replace = """                            <div className="flex items-center gap-4">
                              {item.count !== undefined && (
                                <div className="flex flex-col items-center justify-center min-w-[4rem] border-l border-stone-800 pl-4 ml-2">
                                  <span className="text-[10px] text-stone-600 uppercase tracking-widest">Qtd</span>
                                  <span className="text-3xl font-black font-['Special_Elite'] text-amber-500">{item.count}</span>
                                </div>
                              )}
                              
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (onUseItem) {
                                    onUseItem(item.id);
                                  }
                                }}
                                className="px-4 py-2 border-2 border-stone-700 bg-stone-900/50 hover:bg-stone-800 text-stone-300 hover:text-white rounded font-['Cinzel'] text-sm tracking-widest transition-colors whitespace-nowrap"
                              >
                                {item.type === 'WEAPON' ? 'EQUIPAR' : 'USAR'}
                              </button>
                            </div>"""

code = re.sub(item_div_find, item_div_replace, code)

with open('src/components/StatusScreen.tsx', 'w') as f:
    f.write(code)

with open('src/components/GameCanvas.tsx', 'r') as f:
    gc_code = f.read()

onUseItem_code = """          onUseItem={(itemId) => {
            if (engineRef.current) {
               const eng = engineRef.current;
               // Process item usage
               const item = eng.inventory.items.find((i: any) => i.id === itemId);
               if (item) {
                 if (item.type === 'WEAPON') {
                    // Just a visual equip logic (no complex mechanics yet, but it exists)
                    eng.addFloatingText(eng.player.x, eng.player.y - 20, `${item.name} Equipado`, '#FCD34D', 1);
                 } else if (item.id === 'purifying_salt') {
                    if (item.count > 0 && !eng.inventory.hasSaltCoating) {
                        if (eng.inventory.useSaltCoating(15)) {
                            eng.addFloatingText(eng.player.x, eng.player.y - 20, `Arma Abençoada!`, '#60A5FA', 1.2);
                        }
                    } else if (eng.inventory.hasSaltCoating) {
                        eng.addFloatingText(eng.player.x, eng.player.y - 20, `Arma já está abençoada!`, '#9CA3AF', 0.8);
                    }
                 } else if (item.id === 'holy_water') {
                    if (item.count > 0) {
                        item.count--;
                        eng.player.hp = Math.min(eng.player.maxHp, eng.player.hp + 20); // Heals 20 HP
                        eng.addFloatingText(eng.player.x, eng.player.y - 20, `+20 HP`, '#10B981', 1.2);
                    }
                 }
                 // Trigger force update stats
                 setStats({...eng.getStats()}); // Using spread to force re-render
               }
            }
          }}"""

gc_code = gc_code.replace("          onClearNewItems={() => {", onUseItem_code + "\n          onClearNewItems={() => {")

# To make setStats(...) work correctly, we need eng.getStats()
# Wait, let's just copy the block that builds stats
stats_block = """                 const aliveCount = eng.enemies.filter(e => e.isAlive).length;
                 setStats({
                  hp: eng.player.hp,
                  maxHp: eng.player.maxHp,
                  stamina: eng.player.stamina,
                  maxStamina: eng.player.maxStamina,
                  hasSaltWeapon: eng.inventory.hasSaltCoating,
                  saltDuration: eng.inventory.saltDurationLeft,
                  saltCount: eng.inventory.saltCharges,
                  playerState: eng.player.state,
                  enemiesAlive: aliveCount,
                  mp: eng.player.mp,
                  maxMp: eng.player.maxMp,
                  ascension: eng.getAscensionStats(),
                  inventory: [...eng.inventory.items],
                  killCounts: eng.killCounts,
                  learnedSpells: eng.learnedSpells,
                  comboCount: eng.comboCount,
                  currentSection: {
                    id: eng.sectionManager.currentSectionId,
                    name: eng.sectionManager.currentSection.name,
                    subtitle: eng.sectionManager.currentSection.subtitle,
                    theme: eng.sectionManager.theme
                  }
                 });"""

gc_code = gc_code.replace("                 setStats({...eng.getStats()}); // Using spread to force re-render", stats_block)

with open('src/components/GameCanvas.tsx', 'w') as f:
    f.write(gc_code)
