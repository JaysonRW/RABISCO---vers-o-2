import React, { useState } from 'react';
import { GameCanvas } from './components/GameCanvas';
import { StartScreen } from './components/StartScreen';
import { OptionsScreen } from './components/OptionsScreen';

export default function App() {
  const [gameState, setGameState] = useState<'START' | 'PLAYING' | 'OPTIONS'>('START');

  return (
    <main className="w-screen h-screen bg-black overflow-hidden flex flex-col items-center justify-center m-0 p-0 selection:bg-[#0A2570] selection:text-[#FFFFFF]">
      {gameState === 'START' && (
        <StartScreen 
          onStartGame={() => setGameState('PLAYING')} 
          onOptions={() => setGameState('OPTIONS')} 
        />
      )}
      {gameState === 'OPTIONS' && (
        <OptionsScreen onBack={() => setGameState('START')} />
      )}
      {gameState === 'PLAYING' && (
        <GameCanvas />
      )}
    </main>
  );
}
