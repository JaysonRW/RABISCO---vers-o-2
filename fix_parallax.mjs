import fs from 'fs';
let code = fs.readFileSync('src/game/rendering/ParallaxBackgroundSystem.ts', 'utf8');

// The file ends with:
//   }
// }
//   // Renderiza Parallax...

// We'll just replace "}\n}\n  // Renderiza Parallax" with "  // Renderiza Parallax" and append "}\n" at the very end.

code = code.replace(/}\n}\n  \/\/ Renderiza Parallax/, "  // Renderiza Parallax");
code = code + "\n}\n";

fs.writeFileSync('src/game/rendering/ParallaxBackgroundSystem.ts', code);
