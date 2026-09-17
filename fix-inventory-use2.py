import re

with open('src/components/StatusScreen.tsx', 'r') as f:
    code = f.read()

# I also need to render the "Use/Equip" button for things that DON'T have count (like weapons)
item_div_find = r"""                            <div className="flex items-center gap-4">\s*\{item\.count !== undefined && \(\s*<div className="flex flex-col items-center justify-center min-w-\[4rem\] border-l border-stone-800 pl-4 ml-2">\s*<span className="text-\[10px\] text-stone-600 uppercase tracking-widest">Qtd</span>\s*<span className="text-3xl font-black font-\['Special_Elite'\] text-amber-500">\{item\.count\}</span>\s*</div>\s*\)\}\s*<button"""

item_div_replace = """                            <div className="flex items-center gap-4">
                              {item.count !== undefined && (
                                <div className="flex flex-col items-center justify-center min-w-[4rem] border-l border-stone-800 pl-4 ml-2">
                                  <span className="text-[10px] text-stone-600 uppercase tracking-widest">Qtd</span>
                                  <span className="text-3xl font-black font-['Special_Elite'] text-amber-500">{item.count}</span>
                                </div>
                              )}
                              
                              {/* Always render the button for Weapons, Consumables, and Coatings. Passives like relics won't have the button */}
                              {!item.isPassive && (
                                <button"""

# Also close the condition
button_close_find = r"""                                \{item\.type === 'WEAPON' \? 'EQUIPAR' : 'USAR'\}\s*</button>\s*</div>"""

button_close_replace = """                                {item.type === 'WEAPON' ? 'EQUIPAR' : 'USAR'}
                                </button>
                              )}
                            </div>"""

code = re.sub(item_div_find, item_div_replace, code)
code = re.sub(button_close_find, button_close_replace, code)

with open('src/components/StatusScreen.tsx', 'w') as f:
    f.write(code)

