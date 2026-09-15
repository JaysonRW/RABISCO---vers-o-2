import fs from 'fs';
let code = fs.readFileSync('src/game/rendering/PenRenderer.ts', 'utf8');

code = code.replace(
  "    ctx.strokeStyle = primary;\n    ctx.lineWidth = 1.2;\n    ctx.lineJoin = 'round';\n\n    // Multiple strokes to simulate ballpoint pen sketch",
  `    ctx.fillStyle = '#ffffff'; // Solid white background so it stands out against the parchment
    if (type === 'box') {
      ctx.fillRect(x, y, width, height);
    } else if (type === 'vase') {
      ctx.fillRect(x, y, width, height);
    } else if (type === 'rubble') {
      ctx.fillRect(x, y, width, height);
    }

    ctx.strokeStyle = primary;
    ctx.lineWidth = 1.8; // Made slightly thicker to be more visible
    ctx.lineJoin = 'round';

    // Text label to ensure user sees it
    ctx.font = '10px Caveat';
    ctx.fillStyle = primary;
    ctx.textAlign = 'center';
    ctx.fillText(type.toUpperCase(), x + width / 2, y - 5);

    // Multiple strokes to simulate ballpoint pen sketch`
);

fs.writeFileSync('src/game/rendering/PenRenderer.ts', code);
