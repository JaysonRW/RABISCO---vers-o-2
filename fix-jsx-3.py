import re

with open('src/components/GameCanvas.tsx', 'r') as f:
    gc_code = f.read()

# I see it!
# `}          onClearNewItems={() => {`
# The `onUseItem` function body is missing a `}` to close the `(itemId) => {`.

fix = """               }
            }
          }
          onClearNewItems={() => {"""

replace_fix = """               }
            }
          }}
          onClearNewItems={() => {"""

gc_code = gc_code.replace(fix, replace_fix)

with open('src/components/GameCanvas.tsx', 'w') as f:
    f.write(gc_code)

