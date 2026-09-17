import re

with open('src/components/GameCanvas.tsx', 'r') as f:
    gc_code = f.read()

gc_code = gc_code.replace("""                        if (eng.inventory.useSaltCoating(15)) {
                            eng.addFloatingText(eng.player.x, eng.player.y - 20, `Arma Abençoada!`, '#60A5FA', 1.2);
                        }""", """                        if (eng.inventory.useSaltCoating(15)) {
                            eng.addFloatingText(eng.player.x, eng.player.y - 20, `Arma Abençoada!`, '#60A5FA', 1.2);
                            soundManager.playSaltApply();
                        }""")

with open('src/components/GameCanvas.tsx', 'w') as f:
    f.write(gc_code)
