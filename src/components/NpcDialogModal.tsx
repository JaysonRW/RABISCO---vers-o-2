/**
 * O Cavaleiro Arruinado - NpcDialogModal
 * Modal de diálogo estilo RPG Clássico (ex: SOTN)
 */
import React, { useState, useEffect } from 'react';
import { NPC, DialogChoice } from '../game/entities/NPC';
import { soundManager } from '../game/audio/synth';
import { Sparkles, Heart, Award, ChevronDown } from 'lucide-react';

interface NpcDialogModalProps {
  npc: NPC;
  playerSouls: number;
  onSelectChoice: (choice: DialogChoice) => void;
  onClose: () => void;
}

export const NpcDialogModal: React.FC<NpcDialogModalProps> = ({
  npc,
  playerSouls,
  onSelectChoice,
  onClose,
}) => {
  const dialog = npc.getCurrentDialog();
  const [lineIndex, setLineIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  
  const currentLineRaw = dialog?.lines[lineIndex] || '';
  
  let speaker = npc.name;
  let fullText = currentLineRaw;
  
  if (currentLineRaw.includes(': "')) {
    const parts = currentLineRaw.split(': "');
    speaker = parts[0];
    fullText = parts[1].replace(/"$/, '');
  } else if (currentLineRaw.includes(': ')) {
    const parts = currentLineRaw.split(': ');
    speaker = parts[0];
    fullText = parts.slice(1).join(': ');
  }

  const isLordSpeaking = speaker === 'Lorde Carmim' || speaker === 'Senhor Carmim';
  let avatarSrc = '/npc_avatar.png';
  if (speaker === 'Nankin' || speaker === 'Cavaleiro') {
    avatarSrc = '/Heroi1.png';
  } else if (speaker === 'Lorde Carmim' || speaker === 'Senhor Carmim') {
    if (fullText.includes("Rascunho tolo")) {
      avatarSrc = '/lordgarisos.png';
    } else {
      avatarSrc = '/lordFala1.png';
    }
  }

  // Efeito de digitação (Typewriter)
  useEffect(() => {
    setDisplayedText('');
    let currentLength = 0;
    
    const interval = setInterval(() => {
      currentLength++;
      setDisplayedText(fullText.substring(0, currentLength));
      
      if (currentLength % 4 === 0) {
        soundManager.playNpcDialog();
      }
      
      if (currentLength >= fullText.length) {
        clearInterval(interval);
      }
    }, 25);
    
    return () => clearInterval(interval);
  }, [fullText]);

  const advanceDialog = () => {
    if (displayedText.length < fullText.length) {
      setDisplayedText(fullText);
    } else {
      if (dialog && lineIndex < dialog.lines.length - 1) {
        setLineIndex(prev => prev + 1);
      } else {
        if (!dialog?.choices || dialog.choices.length === 0) {
          onClose();
        }
      }
    }
  };

  // Avançar diálogo com tecla de Ataque (J ou Z)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'KeyJ' || e.code === 'KeyZ') {
        advanceDialog();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [displayedText, fullText, lineIndex, dialog, onClose]);

  const isTypingDone = displayedText.length >= fullText.length;
  const isLastLine = dialog ? lineIndex === dialog.lines.length - 1 : true;
  const hasChoices = dialog?.choices && dialog.choices.length > 0;

  return (
    <div className="absolute top-8 left-4 right-4 z-50 flex flex-col items-center animate-in fade-in duration-300">
      
      {/* Caixa principal translúcida estilo Retro RPG */}
      <div 
        onClick={advanceDialog}
        className={`relative w-full max-w-4xl mx-auto flex items-stretch border-2 border-stone-400 bg-black/80 backdrop-blur-sm shadow-[0_0_15px_rgba(0,0,0,0.8)] font-serif select-none overflow-hidden h-[160px] cursor-pointer ${isLordSpeaking ? "flex-row-reverse" : "flex-row"}`}>
        
        {/* Retrato do Personagem */}
        <div className={`w-[160px] min-w-[160px] h-full ${isLordSpeaking ? "border-l-2" : "border-r-2"} border-stone-400 bg-stone-900 flex items-center justify-center p-1 shrink-0 overflow-hidden relative`}>
          {/* Fallback caso a imagem não exista (ou não carregue) */}
          <img 
            key={avatarSrc}
            src={avatarSrc} 
            alt={speaker} 
            className="relative z-10 w-full h-full object-cover object-top"
          />
        </div>

        {/* Área de Texto (Direita) */}
        <div className="flex-1 flex flex-col p-4 relative">
          
          {/* Nome do Speaker */}
          <h3 className={`text-xl font-bold text-amber-500 font-['Cinzel'] tracking-wide border-b border-stone-600/50 pb-1 mb-2 ${isLordSpeaking ? "text-right" : "text-left"}`}>
            {speaker}
          </h3>
          
          {/* Texto Falado */}
          <p className="text-lg md:text-xl text-white leading-relaxed font-serif">
            {displayedText}
          </p>

          {/* Seta de Continuar piscando */}
          {isTypingDone && (!isLastLine || !hasChoices) && (
            <div className="absolute bottom-3 right-4 animate-bounce text-amber-500 flex items-center gap-2">
              <span className="text-xs uppercase tracking-widest text-stone-400">Clique / Atacar (J)</span>
              <ChevronDown className="w-6 h-6" />
            </div>
          )}
        </div>
      </div>

      {/* Escolhas do Jogador (aparecem abaixo da caixa quando na última linha) */}
      {isTypingDone && isLastLine && hasChoices && (
        <div className="w-full max-w-4xl mx-auto mt-2 flex flex-col items-end gap-2 pr-2">
          {dialog.choices.map((choice, idx) => {
            const canAfford = !choice.soulCost || playerSouls >= choice.soulCost;
            return (
              <button
                key={idx}
                disabled={!canAfford}
                onClick={() => onSelectChoice(choice)}
                className={`text-right px-4 py-2 border-2 text-base md:text-lg font-['Cinzel'] font-bold transition-all flex items-center gap-3 justify-end min-w-[250px] ${
                  canAfford
                    ? 'bg-black/80 text-white border-amber-500 hover:bg-amber-900/80 shadow-md cursor-pointer'
                    : 'bg-black/60 text-stone-500 border-stone-600 cursor-not-allowed'
                }`}
              >
                {choice.soulCost && (
                  <span className={`text-xs px-2 py-0.5 rounded ${canAfford ? 'text-amber-400' : 'text-stone-500'}`}>
                    {choice.soulCost} Almas
                  </span>
                )}
                {choice.text}
              </button>
            );
          })}
        </div>
      )}

    </div>
  );
};
