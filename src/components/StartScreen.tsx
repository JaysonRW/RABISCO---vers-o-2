import React from 'react';

interface StartScreenProps {
  onStartGame: () => void;
  onOptions: () => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({ onStartGame, onOptions }) => {
  return (
    <div 
      className="w-screen h-screen relative bg-cover bg-center bg-no-repeat overflow-hidden" 
      style={{ backgroundImage: "url('/telainicial.jpeg')" }}
    >
      <div className="absolute bottom-6 right-8 flex flex-col gap-1 items-start font-['Caveat'] text-[#051442] font-bold">
        {/* Rótulo estático */}
        <span className="text-xl opacity-80 mb-1 tracking-wide">PRESS START</span>
        
        {/* Botões iterativos */}
        <button 
          onClick={onStartGame}
          className="text-3xl hover:text-red-700 hover:-translate-y-1 transition-transform duration-200 text-left drop-shadow-sm"
        >
          • START GAME
        </button>
        
        <button 
          onClick={onOptions}
          className="text-3xl hover:text-red-700 hover:-translate-y-1 transition-transform duration-200 text-left drop-shadow-sm"
        >
          • OPTIONS
        </button>
      </div>
    </div>
  );
};

