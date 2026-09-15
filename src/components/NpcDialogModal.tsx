/**
 * O Cavaleiro Arruinado - NpcDialogModal
 * Modal de diálogo e trocas do NPC no estilo manuscrito medieval
 */

import React from 'react';
import { NPC, DialogChoice } from '../game/entities/NPC';
import { soundManager } from '../game/audio/synth';
import { MessageSquare, Sparkles, X, Heart, ShieldAlert, Award } from 'lucide-react';

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

  return (
    <div className="absolute bottom-4 left-4 right-4 z-50 flex flex-col items-center animate-in slide-in-from-bottom-8 duration-200">
      <div className="relative w-full bg-[#FFFFFF] border-4 border-[#0A2570] shadow-xl p-4 md:p-5 font-serif select-none max-h-[220px] overflow-y-auto">
        {/* Linha de margem do caderno */}
        <div className="absolute top-0 bottom-0 left-6 w-0.5 bg-[#C81E1E]/30 pointer-events-none" />

        {/* Botão de Fechar */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 rounded text-[#0A2570] hover:bg-[#0A2570]/15 transition-colors cursor-pointer"
          title="Fechar Diálogo (ESC)"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Cabeçalho do NPC */}
        <div className="flex items-center gap-3 border-b-2 border-[#0A2570]/20 pb-3 pl-4">
          <div className="w-11 h-11 rounded-full bg-[#F0F0F0] border-2 border-[#0A2570] flex items-center justify-center text-[#0A2570] shadow-sm">
            <MessageSquare className="w-5 h-5 text-[#0A2570]" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-[#0A2570] font-['Cinzel'] tracking-wide">
              {npc.name}
            </h3>
            <span className="text-xs text-[#051442]/70 font-semibold">{npc.title}</span>
          </div>
        </div>

        {/* Linhas de fala do NPC */}
        <div className="my-5 pl-4 space-y-3">
          {dialog?.lines.map((line, idx) => (
            <p
              key={idx}
              className="text-base md:text-lg text-[#051442] italic leading-relaxed font-serif"
            >
              {line}
            </p>
          ))}
        </div>

        {/* Opções de Interação e Troca de Almas */}
        <div className="pt-3 border-t border-[#0A2570]/20 pl-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-[#0A2570]/80 mb-2">
            <span className="font-semibold font-['Cinzel']">Escolhas do Peregrino:</span>
            <span className="flex items-center gap-1 font-bold text-[#0284C7]">
              <Sparkles className="w-3.5 h-3.5" />
              Almas Disponíveis: {playerSouls}
            </span>
          </div>

          <div className="flex flex-col gap-2">
            {dialog?.choices?.map((choice, idx) => {
              const canAfford = !choice.soulCost || playerSouls >= choice.soulCost;

              return (
                <button
                  key={idx}
                  disabled={!canAfford}
                  onClick={() => onSelectChoice(choice)}
                  className={`w-full text-left px-3.5 py-2.5 rounded border text-sm font-medium transition-all flex items-center justify-between ${
                    canAfford
                      ? 'bg-[#F3F4F6] hover:bg-[#E5E7EB] text-[#0A2570] border-[#0A2570]/40 shadow-xs cursor-pointer'
                      : 'bg-stone-200 text-stone-400 border-stone-300 cursor-not-allowed'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {choice.actionId === 'HEAL' && <Heart className="w-4 h-4 text-[#C81E1E]" />}
                    {choice.actionId === 'REFILL_SALT' && (
                      <Sparkles className="w-4 h-4 text-[#F59E0B]" />
                    )}
                    {choice.actionId === 'BLESS_STAMINA' && (
                      <Award className="w-4 h-4 text-[#0284C7]" />
                    )}
                    {choice.text}
                  </span>

                  {choice.soulCost && (
                    <span
                      className={`text-xs px-2 py-0.5 rounded font-bold ${
                        canAfford
                          ? 'bg-[#0A2570]/10 text-[#0A2570]'
                          : 'bg-stone-300 text-stone-500'
                      }`}
                    >
                      {choice.soulCost} Almas
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
