import React, { useState } from 'react';

interface OptionsScreenProps {
  onBack: () => void;
}

export const OptionsScreen: React.FC<OptionsScreenProps> = ({ onBack }) => {
  const [musicVolume, setMusicVolume] = useState(80);
  const [sfxVolume, setSfxVolume] = useState(100);

  return (
    <div 
      className="w-screen h-screen relative bg-cover bg-center bg-no-repeat overflow-hidden flex items-center justify-center" 
      style={{ backgroundImage: "url('/telainicial.jpeg')" }}
    >
      {/* Overlay escuro e blur para destacar o menu e focar a leitura */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md"></div>

      {/* Modal estilo "Folha de Papel Antiga" com texto de caneta */}
      <div className="relative z-10 w-full max-w-4xl bg-[#f4ecd8] p-8 md:p-12 shadow-[0_0_50px_rgba(0,0,0,0.8)] border-[2px] border-[#051442]/30 rotate-[-0.5deg]">
        <h1 className="text-6xl font-['Caveat'] text-[#051442] font-bold text-center mb-8 border-b-2 border-[#051442]/20 pb-4">
          Opções
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 font-['Caveat'] text-[#051442] font-bold">
          {/* Coluna 1: Áudio */}
          <div className="flex flex-col gap-6">
            <h2 className="text-4xl opacity-80 mb-2">Áudio</h2>
            
            <div className="flex flex-col gap-2 text-2xl">
              <label className="flex justify-between items-center">
                <span>Música</span>
                <span>{musicVolume}%</span>
              </label>
              <input 
                type="range" 
                min="0" max="100" 
                value={musicVolume} 
                onChange={(e) => setMusicVolume(Number(e.target.value))} 
                className="w-full h-2 bg-[#051442]/20 rounded-lg appearance-none cursor-pointer accent-[#051442]" 
              />
            </div>

            <div className="flex flex-col gap-2 text-2xl mt-4">
              <label className="flex justify-between items-center">
                <span>Efeitos (SFX)</span>
                <span>{sfxVolume}%</span>
              </label>
              <input 
                type="range" 
                min="0" max="100" 
                value={sfxVolume} 
                onChange={(e) => setSfxVolume(Number(e.target.value))} 
                className="w-full h-2 bg-[#051442]/20 rounded-lg appearance-none cursor-pointer accent-[#051442]" 
              />
            </div>
          </div>

          {/* Coluna 2: Controles */}
          <div className="flex flex-col gap-3 text-2xl">
            <h2 className="text-4xl opacity-80 mb-2">Controles</h2>
            
            <div className="flex justify-between border-b border-[#051442]/10 pb-1">
              <span>Movimento</span>
              <span className="opacity-70">W A S D / Setas</span>
            </div>
            <div className="flex justify-between border-b border-[#051442]/10 pb-1">
              <span>Pular</span>
              <span className="opacity-70">K ou X</span>
            </div>
            <div className="flex justify-between border-b border-[#051442]/10 pb-1">
              <span>Atacar / Falar</span>
              <span className="opacity-70">J ou Z</span>
            </div>
            <div className="flex justify-between border-b border-[#051442]/10 pb-1">
              <span>Esquiva (Dash)</span>
              <span className="opacity-70">Shift</span>
            </div>
            <div className="flex justify-between border-b border-[#051442]/10 pb-1">
              <span>Interagir</span>
              <span className="opacity-70">E</span>
            </div>
            <div className="flex justify-between border-b border-[#051442]/10 pb-1">
              <span>Usar Sal (Cura)</span>
              <span className="opacity-70">F</span>
            </div>
          </div>
        </div>

        <div className="mt-12 flex justify-center border-t border-[#051442]/20 pt-8">
          <button 
            onClick={onBack}
            className="text-4xl font-['Caveat'] text-[#051442] font-bold hover:text-red-700 hover:-translate-y-1 transition-transform duration-200"
          >
            • VOLTAR AO MENU
          </button>
        </div>
      </div>
    </div>
  );
};
