import fs from 'fs';
let code = fs.readFileSync('src/App.tsx', 'utf8');

const newApp = `import React from 'react';
import { GameCanvas } from './components/GameCanvas';

export default function App() {
  return (
    <main className="w-screen h-screen bg-black overflow-hidden flex flex-col items-center justify-center m-0 p-0 selection:bg-[#0A2570] selection:text-[#FFFFFF]">
      <GameCanvas />
    </main>
  );
}
`;

fs.writeFileSync('src/App.tsx', newApp);
