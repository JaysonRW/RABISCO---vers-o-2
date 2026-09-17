import re

with open('src/components/GameCanvas.tsx', 'r') as f:
    gc_code = f.read()

gc_code = gc_code.replace("if ((soundManager as any).playHeal) (soundManager as any).playHeal();", "soundManager.playSoulAbsorb();")
gc_code = gc_code.replace("if ((soundManager as any).playHeal) (soundManager as any).playHeal();", "soundManager.playSoulAbsorb();")

with open('src/components/GameCanvas.tsx', 'w') as f:
    f.write(gc_code)
