import re

with open('src/game/entities/Player.ts', 'r') as f:
    code = f.read()

replacement = """        const pPlat = plat as any;
        if (pPlat.isPushable && pPlat.ref) {
            if (this.vx > 0) {
               pPlat.ref.vx = 80; // push right
            } else if (this.vx < 0) {
               pPlat.ref.vx = -80; // push left
            }
        }
        
        if (this.vx > 0) {
          this.x = plat.x - this.width;
        } else if (this.vx < 0) {
          this.x = plat.x + plat.width;
        }
        this.vx = 0;"""

code = re.sub(r'if \(this\.vx > 0\) \{\s*this\.x = plat\.x - this\.width;\s*\} else if \(this\.vx < 0\) \{\s*this\.x = plat\.x \+ plat\.width;\s*\}\s*this\.vx = 0;', replacement, code)

with open('src/game/entities/Player.ts', 'w') as f:
    f.write(code)
