import re

with open('src/game/GameEngine.ts', 'r') as f:
    code = f.read()

# Add properties if they don't exist
if 'public screenShakeTimer: number = 0;' not in code:
    code = code.replace(
        'public activeNpcNearby: NPC | null = null;',
        'public activeNpcNearby: NPC | null = null;\n  public screenShakeTimer: number = 0;\n  public damageFlashTimer: number = 0;'
    )

    # Add updates to update()
    update_block = """  private update(dt: number) {
    if (this.screenShakeTimer > 0) this.screenShakeTimer -= dt;
    if (this.damageFlashTimer > 0) this.damageFlashTimer -= dt;"""
    code = code.replace('  private update(dt: number) {', update_block)

    with open('src/game/GameEngine.ts', 'w') as f:
        f.write(code)
    print("Added timers to GameEngine")
else:
    print("Timers already present")
