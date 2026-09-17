import re

with open('src/game/world/Section.ts', 'r') as f:
    code = f.read()

# I will replace all bone_wall that are at y: 360 with y: 404
code = re.sub(r"(type: 'bone_wall',\s*x:\s*\d+,\s*y:\s*)360", r"\g<1>404", code)

with open('src/game/world/Section.ts', 'w') as f:
    f.write(code)
