import fs from 'fs';
let code = fs.readFileSync('src/components/StatusScreen.tsx', 'utf8');

const oldText = `Comando: <span className="text-white">Baixo, Baixo, Cima, Ataque</span>`;
const newText = `Comando: <span className="text-white">Baixo, Baixo, Cima</span>`;

code = code.split(oldText).join(newText);
fs.writeFileSync('src/components/StatusScreen.tsx', code);
console.log('Status Screen patched');
