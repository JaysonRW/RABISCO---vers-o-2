import re

with open('src/game/entities/Destructible.ts', 'r') as f:
    code = f.read()

# I'll just remove the specific bad part at the end.
code = code.replace("  }\n    }\n  }\n\n  public render", "  }\n\n  public render")

with open('src/game/entities/Destructible.ts', 'w') as f:
    f.write(code)
