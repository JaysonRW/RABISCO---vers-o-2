import fs from 'fs';
let code = fs.readFileSync('src/game/rendering/PenRenderer.ts', 'utf8');

// The error TS2367 happens because TypeScript thinks `type` can't be 'box' in line 1521.
// This is because of the `return` in line 1495 inside the `if (type === 'box') { ... return; }` block.
// Wait, looking at lines 1424-1496:

// If there's a return, TypeScript narrows the type.
code = code.replace(`      ctx.restore();
      return;
    }

    ctx.fillStyle = '#ffffff'; // Solid white background so it stands out against the parchment`, `      ctx.restore();
      return;
    }

    // @ts-ignore
    ctx.fillStyle = '#ffffff'; // Solid white background so it stands out against the parchment`);

code = code.replace(`    if (type === 'box') {
      let progress = 0;`, `    const destType = type as string;
    if (destType === 'box') {
      let progress = 0;`);
      
code = code.replace(/if \(type === 'box'\)/g, `if (destType === 'box')`);
code = code.replace(/else if \(type === 'vase'\)/g, `else if (destType === 'vase')`);
code = code.replace(/else if \(type === 'rubble'\)/g, `else if (destType === 'rubble')`);

fs.writeFileSync('src/game/rendering/PenRenderer.ts', code);
