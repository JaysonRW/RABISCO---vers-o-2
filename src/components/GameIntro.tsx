/**
 * O Cavaleiro Arruinado - Game Introduction & Prologue
 * Prólogo ilustrado no estilo caneta azul sobre pergaminho envelhecido
 * Apresenta a lore sombria antes do jogador iniciar a jornada.
 */

import React, { useState } from 'react';
import { soundManager } from '../game/audio/synth';
import { BookOpen, ChevronRight, Play, Shield, Sparkles, Sword } from 'lucide-react';

interface GameIntroProps {
  onStartGame: () => void;
}

const PROLOGUE_PAGES = [
  {
    chapter: 'FOLHA I',
    title: 'A Queda do Santuário de Cinzas',
    lines: [
      '«Durante séculos, a Ordem guardou as catacumbas sob votos sagrados de silêncio e sacrifício.»',
      '«Porém, a praga incorpórea emergiu dos abismos mais profundos. O aço comum dos homens não tinha poder para ferir espectros que não sangram.»',
      '«Um a um, os paladinos sucumbiram ao toque gélido da escuridão... transformados em cinzas ou carniçais famintos.»'
    ],
    doodle: 'sword_broken',
    footer: 'Registro do Cronista Cego, ano 1342.'
  },
  {
    chapter: 'FOLHA II',
    title: 'O Fardo do Sal e das Almas',
    lines: [
      '«Apenas o Sal Consagrado — extraído dos mares pristinos da fé — possui a densidade pura para rasgar o véu do etéreo.»',
      '«Ao banir as aberrações com a lâmina ungida em sal, suas almas errantes se libertam dos grilhões da maldição.»',
      '«Estas almas procuram um receptáculo forte... um cavaleiro disposto a trilhar os Graus de Ascensão.»'
    ],
    doodle: 'salt_cup',
    footer: 'Escrito no Evangelho dos Exorcistas.'
  },
  {
    chapter: 'FOLHA III',
    title: 'O Despertar do Cavaleiro Arruinado',
    lines: [
      '«Tu és o último juramentado. Teu corpo foi dilacerado, mas tua vontade permanece firme como ferro forjado.»',
      '«Encontra o Eremita do Sal nas ruínas do pátio exterior. Purifica os claustros e desce até o portal da cripta.»',
      '«Que a tua lâmina trace a redenção destas terras amaldiçoadas.»'
    ],
    doodle: 'knight_crest',
    footer: '«Levanta-te, Cavaleiro. A névoa se aproxima.»'
  }
];

export const GameIntro: React.FC<GameIntroProps> = ({ onStartGame }) => {
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [mode, setMode] = useState<'COVER' | 'BOOK'>('COVER');

  const handleOpenBook = () => {
    soundManager.playPageTurn();
    setMode('BOOK');
  };

  const handleNextPage = () => {
    soundManager.playPageTurn();
    if (currentPage < PROLOGUE_PAGES.length - 1) {
      setCurrentPage((prev) => prev + 1);
    } else {
      soundManager.playPageTurn();
      onStartGame();
    }
  };

  const handlePrevPage = () => {
    soundManager.playPageTurn();
    if (currentPage > 0) {
      setCurrentPage((prev) => prev - 1);
    } else {
      setMode('COVER');
    }
  };

  const handleSkip = () => {
    soundManager.playPageTurn();
    onStartGame();
  };

  const page = PROLOGUE_PAGES[currentPage];

  return (
    <div className="w-full min-h-[580px] flex items-center justify-center p-4">
      {/* Moldura do Livro / Grimório Antigo */}
      <div className="relative w-full max-w-3xl bg-[#FFFFFF] border-4 border-[#0A2570] rounded-lg shadow-2xl p-6 md:p-8 font-serif select-none overflow-hidden">
        {/* Linha vermelha de margem e textura de pauta */}
        <div className="absolute top-0 bottom-0 left-8 md:left-12 w-0.5 bg-[#C81E1E]/25 pointer-events-none" />
        <div
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage:
              'linear-gradient(to bottom, transparent 23px, rgba(10, 37, 112, 0.15) 24px)',
            backgroundSize: '100% 24px',
          }}
        />

        {mode === 'COVER' ? (
          /* Capa do Livro de Memórias */
          <div className="relative z-10 flex flex-col items-center justify-center text-center py-8 space-y-6">
            <div className="w-16 h-16 rounded-full border-2 border-[#0A2570] flex items-center justify-center bg-[#F0F0F0]/60 shadow-inner">
              <Sword className="w-8 h-8 text-[#0A2570]" />
            </div>

            <div className="space-y-2">
              <span className="text-xs uppercase tracking-[0.3em] text-[#0A2570]/70 font-['Cinzel'] font-bold">
                Grimório de Dark Fantasy 2D
              </span>
              <h1 className="text-3xl md:text-5xl font-black text-[#0A2570] font-['Cinzel'] tracking-wider">
                O CAVALEIRO ARRUINADO
              </h1>
              <p className="text-sm md:text-base italic text-[#051442]/80 max-w-lg mx-auto">
                «Manuscrito de exorcismo e crônica das lâminas de sal sobre o pergaminho do abismo.»
              </p>
            </div>

            {/* Ilustração central rascunhada à caneta */}
            <div className="w-full max-w-md p-4 bg-[#F5F5F5]/40 border border-[#0A2570]/30 rounded-md">
              <div className="flex justify-around items-center text-xs text-[#0A2570]">
                <div className="flex flex-col items-center gap-1">
                  <Shield className="w-5 h-5 text-[#0A2570]" />
                  <span className="font-bold">Aço & Físico</span>
                  <span className="text-[10px] text-stone-600">Corta Carniçais</span>
                </div>
                <div className="h-8 w-px bg-[#0A2570]/20" />
                <div className="flex flex-col items-center gap-1">
                  <Sparkles className="w-5 h-5 text-[#F59E0B]" />
                  <span className="font-bold text-[#B45309]">Sal Purificador</span>
                  <span className="text-[10px] text-stone-600">Bane Espectros</span>
                </div>
                <div className="h-8 w-px bg-[#0A2570]/20" />
                <div className="flex flex-col items-center gap-1">
                  <BookOpen className="w-5 h-5 text-[#0284C7]" />
                  <span className="font-bold text-[#0284C7]">Ascensão</span>
                  <span className="text-[10px] text-stone-600">Colheita de Almas</span>
                </div>
              </div>
            </div>

            {/* Ações da Capa */}
            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <button
                id="btn-intro-read"
                onClick={handleOpenBook}
                className="px-6 py-3 bg-[#0A2570] hover:bg-[#143D99] text-[#FFFBEB] font-['Cinzel'] font-bold rounded border-2 border-[#051442] flex items-center gap-2 shadow-md transition-all cursor-pointer group"
              >
                <BookOpen className="w-5 h-5 text-[#F59E0B] group-hover:rotate-6 transition-transform" />
                <span>Abrir Prólogo e Crônica</span>
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                id="btn-intro-direct-start"
                onClick={handleSkip}
                className="px-5 py-3 bg-[#F0F0F0] hover:bg-[#E5E7EB] text-[#0A2570] font-['Cinzel'] font-bold rounded border-2 border-[#0A2570]/40 flex items-center gap-2 transition-all cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Ir Direto ao Combate</span>
              </button>
            </div>
          </div>
        ) : (
          /* Páginas do Livro com virar de folha */
          <div className="relative z-10 flex flex-col justify-between min-h-[460px] pl-6 md:pl-10">
            {/* Cabeçalho da Página */}
            <div className="flex items-center justify-between border-b border-[#0A2570]/20 pb-2">
              <span className="text-xs font-bold tracking-widest text-[#C81E1E] font-['Cinzel']">
                {page.chapter}
              </span>
              <button
                onClick={handleSkip}
                className="text-xs text-[#0A2570]/70 hover:text-[#0A2570] underline cursor-pointer"
              >
                Pular Introdução »
              </button>
            </div>

            {/* Conteúdo Narrativo */}
            <div className="my-6 space-y-4">
              <h2 className="text-2xl md:text-3xl font-bold text-[#0A2570] font-['Cinzel']">
                {page.title}
              </h2>

              <div className="space-y-3.5 text-base md:text-lg text-[#051442] leading-relaxed font-serif">
                {page.lines.map((line, idx) => (
                  <p key={idx} className="indent-4">
                    {line}
                  </p>
                ))}
              </div>

              {/* Vinheta rascunhada à mão no final do parágrafo */}
              <div className="pt-2">
                <p className="text-xs italic text-[#0A2570]/75 font-serif border-l-2 border-[#0A2570]/40 pl-3">
                  {page.footer}
                </p>
              </div>
            </div>

            {/* Rodapé com Navegação entre Páginas */}
            <div className="flex items-center justify-between border-t border-[#0A2570]/20 pt-4">
              <button
                onClick={handlePrevPage}
                className="px-4 py-2 text-xs font-bold text-[#0A2570] hover:bg-[#0A2570]/10 rounded border border-[#0A2570]/30 transition-colors cursor-pointer"
              >
                « Anterior
              </button>

              <div className="flex items-center gap-1 text-xs font-semibold text-[#0A2570]/60">
                {PROLOGUE_PAGES.map((_, i) => (
                  <span
                    key={i}
                    className={`inline-block w-2.5 h-2.5 rounded-full border border-[#0A2570] ${
                      i === currentPage ? 'bg-[#0A2570]' : 'bg-transparent'
                    }`}
                  />
                ))}
              </div>

              <button
                id="btn-next-page"
                onClick={handleNextPage}
                className="px-5 py-2 text-xs font-bold bg-[#0A2570] hover:bg-[#143D99] text-[#FFFBEB] rounded border border-[#051442] flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
              >
                <span>
                  {currentPage === PROLOGUE_PAGES.length - 1 ? 'Iniciar Jornada' : 'Próxima Folha'}
                </span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
