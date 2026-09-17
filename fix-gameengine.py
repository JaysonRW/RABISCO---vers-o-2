import re

with open('src/game/GameEngine.ts', 'r') as f:
    code = f.read()

# 1. Update the player update call to include boxes
# First, find the player update block
# We want to dynamically build the list of platforms
platforms_builder = """
    // Gather dynamic platforms (boxes)
    const dynamicPlatforms = this.destructibles
        .filter(d => d.type === 'box' && !d.isDestroyed)
        .map(d => {
            const b = d.getBounds();
            (b as any).isPushable = true;
            (b as any).ref = d;
            return b;
        });
    const allPlatforms = [...this.level.platforms, ...dynamicPlatforms];

    this.player.update(
"""
code = code.replace("    this.player.update(\n", platforms_builder)
code = code.replace("      this.level.platforms,\n", "      allPlatforms,\n")

# 2. Update the destructibles update call
code = re.sub(r'\(dest as any\)\.update\(dt\);', '(dest as any).update(dt, this.level.platforms);', code)

with open('src/game/GameEngine.ts', 'w') as f:
    f.write(code)
