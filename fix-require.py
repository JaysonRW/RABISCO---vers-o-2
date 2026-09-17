with open('src/game/rendering/PenRenderer.ts', 'r') as f:
    code = f.read()

code = "import { ItemDatabase } from '../inventory/ItemDatabase';\n" + code
code = code.replace("require('../inventory/ItemDatabase').ItemDatabase[item.type]", "ItemDatabase[item.type]")

with open('src/game/rendering/PenRenderer.ts', 'w') as f:
    f.write(code)
