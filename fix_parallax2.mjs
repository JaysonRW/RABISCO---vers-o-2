import fs from 'fs';
let code = fs.readFileSync('src/game/rendering/ParallaxBackgroundSystem.ts', 'utf8');

// Find the position of "// Renderiza Parallax do Santuário Carmim"
const index = code.indexOf('  // Renderiza Parallax do Santuário Carmim');

// The class ends just before this. We need to remove the "}\n}" before it, and add it to the end of the file.
let preCode = code.substring(0, index);
let postCode = code.substring(index);

// Remove trailing braces from preCode
preCode = preCode.trimEnd();
while (preCode.endsWith('}')) {
  preCode = preCode.substring(0, preCode.length - 1).trimEnd();
}

// Add ONE brace back for the method `renderCryptBiome` which was closed
preCode = preCode + '\n  }\n';

code = preCode + '\n' + postCode;
if (!code.trimEnd().endsWith('}')) {
  code = code + '\n}\n';
}

fs.writeFileSync('src/game/rendering/ParallaxBackgroundSystem.ts', code);
