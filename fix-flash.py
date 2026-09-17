import re

with open('src/game/GameEngine.ts', 'r') as f:
    code = f.read()

# 1. Trigger damageFlashTimer on damage taken
code = code.replace("this.triggerScreenShake(0.18, 5);", "this.triggerScreenShake(0.18, 5);\n            this.damageFlashTimer = 0.2;")

# 2. Render red flash
render_flash = """    // 9. Flash Celestial de Ascensão (Quando alcança novo nível)
    if (this.ascensionFlashTimer > 0) {
      ctx.save();
      ctx.fillStyle = `rgba(245, 158, 11, ${this.ascensionFlashTimer * 0.35})`;
      ctx.fillRect(0, 0, w, h);
      ctx.restore();
    }

    // 9.1 Flash Vermelho de Dano (Quando o jogador recebe dano)
    if (this.damageFlashTimer > 0) {
      ctx.save();
      ctx.fillStyle = `rgba(185, 28, 28, ${this.damageFlashTimer * 2.0})`; // Vermelho sangue (FX_BLOOD_RED)
      ctx.fillRect(0, 0, w, h);
      ctx.restore();
    }"""

code = code.replace("""    // 9. Flash Celestial de Ascensão (Quando alcança novo nível)
    if (this.ascensionFlashTimer > 0) {
      ctx.save();
      ctx.fillStyle = `rgba(245, 158, 11, ${this.ascensionFlashTimer * 0.35})`;
      ctx.fillRect(0, 0, w, h);
      ctx.restore();
    }""", render_flash)

with open('src/game/GameEngine.ts', 'w') as f:
    f.write(code)
