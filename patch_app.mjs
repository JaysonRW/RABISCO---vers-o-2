import fs from 'fs';
let code = fs.readFileSync('src/App.tsx', 'utf8');

const newApp = `import React from 'react';
import { GameCanvas } from './components/GameCanvas';

export default function App() {
  return (
    <main className="min-h-screen bg-[#051442] flex flex-col items-center justify-center p-0 m-0 selection:bg-[#0A2570] selection:text-[#FFFFFF]">
      <div className="w-full max-w-7xl shadow-2xl overflow-hidden bg-[#FFFFFF]">
        <GameCanvas />
      </div>
    </main>
  );
}
`;

fs.writeFileSync('src/App.tsx', newApp);
