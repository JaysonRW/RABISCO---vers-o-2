import re

with open('src/components/GameCanvas.tsx', 'r') as f:
    gc_code = f.read()

# I see the problem. `}}` is not a valid prop end for `onUseItem`. It is a string or JSX bracket.
# Let's fix line 391-395.
fix = """                  }
                 });
               }
            }
          }}
          onClearNewItems={() => {"""

replace_fix = """                  }
                 });
               }
            }
          }
          onClearNewItems={() => {"""

gc_code = gc_code.replace(fix, replace_fix)

with open('src/components/GameCanvas.tsx', 'w') as f:
    f.write(gc_code)

