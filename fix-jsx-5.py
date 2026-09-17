import re

with open('src/components/GameCanvas.tsx', 'r') as f:
    gc_code = f.read()

# I see what happened. Look at line 365:
#                  }
#                  }
#                  // Trigger force update stats
# The first `}` closes the `else if (item.type === 'CONSUMABLE' && item.count > 0)` block.
# The second `}` closes the WHAT? The `if (item) {` block!
# But then `const aliveCount = eng.enemies.filter(e => e.isAlive).length;` is outside the `if (item) {` block!
# Wait, let's trace `if (item) {`:
# if (item) { -> opens at 337
#   if (item.type === 'WEAPON') { -> opens at 338
#   } else if (item.id === 'purifying_salt') { -> opens at 341
#   } else if (item.id === 'holy_water') { -> opens at 349
#   } else if (item.type === 'CONSUMABLE' && item.count > 0) { -> opens at 356
#   } -> closes at 365
# } -> closes at 366 (the extra `}`)
# THEN we do `const aliveCount = ...`
# THEN we do `setStats({...})`
# THEN `}` -> closes `if (engineRef.current)` block
# THEN `}` -> closes `(itemId) => {`
# THEN `}` -> closes `onUseItem={` 

# WAIT! If `if (item) {` is closed at 366, then:
#                 // Trigger force update stats
#                 const aliveCount = eng.enemies.filter(e => e.isAlive).length;
#                 setStats({ ... });
#               } <--- Wait, what does THIS close? (Line 389)
# Ah! It's closing NOTHING because it was already closed at 366.

# Let's fix this properly.

fix = """                     soundManager.playSoulAbsorb();
                 }
                 }
                 // Trigger force update stats"""

replace_fix = """                     soundManager.playSoulAbsorb();
                 }
                 // Trigger force update stats"""

gc_code = gc_code.replace(fix, replace_fix)

with open('src/components/GameCanvas.tsx', 'w') as f:
    f.write(gc_code)

