import fs from 'fs';
let code = fs.readFileSync('src/components/GameCanvas.tsx', 'utf8');

const keyDA = `        case 'KeyD':
        case 'ArrowRight':
          input.right = true;
          break;`;
const keyDA_new = `        case 'KeyD':
        case 'ArrowRight':
          input.right = true;
          break;
        case 'KeyS':
        case 'ArrowDown':
          input.down = true;
          break;`;

const keyDUp = `        case 'KeyD':
        case 'ArrowRight':
          input.right = false;
          break;`;
const keyDUp_new = `        case 'KeyD':
        case 'ArrowRight':
          input.right = false;
          break;
        case 'KeyS':
        case 'ArrowDown':
          input.down = false;
          break;`;

if (code.includes(keyDA) && code.includes(keyDUp)) {
  code = code.replace(keyDA, keyDA_new);
  code = code.replace(keyDUp, keyDUp_new);
  fs.writeFileSync('src/components/GameCanvas.tsx', code);
  console.log('Added KeyS / ArrowDown to GameCanvas');
} else {
  console.log('Could not match GameCanvas key sections.');
}
