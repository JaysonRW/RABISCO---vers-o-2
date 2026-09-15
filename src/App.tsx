/**
 * O Cavaleiro Arruinado - Main Application
 * RPG de Ação em Plataforma 2D / Dark Fantasy
 * Estilo Caneta Esferográfica Azul sobre Pergaminho Envelhecido
 */

import React, { useState } from 'react';
import { GameCanvas } from './components/GameCanvas';
import {
  Sword,
  Sparkles,
  ShieldAlert,
  Scroll,
  BookMarked,
  Layers,
  CheckCircle2,
  Flame,
  Droplets
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'game' | 'design' | 'inventory'>('game');

  return (
    <main className="min-h-screen bg-[#F3F4F6] text-[#0A2570] font-serif flex flex-col items-center py-4 px-2 sm:px-6 selection:bg-[#0A2570] selection:text-[#FFFFFF]">
      {/* Folha de Caderno / Manuscrito Antigo Container */}
      <div className="w-full max-w-5xl bg-[#FFFFFF] shadow-2xl rounded-xl border-4 border-[#0A2570] p-4 sm:p-8 relative overflow-hidden">
        {/* Pauta Vermelha de Margem de Caderno */}
        <div className="absolute left-6 sm:left-12 top-0 bottom-0 w-0.5 bg-[#C81E1E]/30 pointer-events-none" />

        {/* Cabeçalho do Jogo (Estilo Título de Grimório / Manuscrito) */}
        <header className="border-b-2 border-[#0A2570]/30 pb-4 mb-4 pl-4 sm:pl-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider bg-[#0A2570] text-[#FFFFFF] rounded">
                  PROJETO V1.0 • MILESTONE 1 (MVP)
                </span>
                <span className="text-xs text-[#0A2570]/70 font-mono">
                  Caneta Esferográfica sobre Papel
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black font-['Cinzel'] tracking-wide text-[#0A2570]">
                O CAVALEIRO ARRUINADO
              </h1>
              <p className="text-sm italic text-[#0A2570]/80 mt-1 max-w-2xl">
                «Um guerreiro amaldiçoado caça abominações sobrenaturais em ruínas esquecidas.
                Sem as armas certas de exorcismo, tuas lâminas mortais são inúteis.»
              </p>
            </div>

            {/* Abas de Navegação */}
            <div className="flex items-center gap-2">
              <button
                id="tab-game"
                onClick={() => setActiveTab('game')}
                className={`px-3 py-1.5 rounded font-['Cinzel'] text-xs font-bold transition-all cursor-pointer border ${
                  activeTab === 'game'
                    ? 'bg-[#0A2570] text-[#FFFFFF] border-[#0A2570] shadow-sm'
                    : 'bg-[#FFFFFF] text-[#0A2570] border-[#0A2570]/30 hover:bg-[#0A2570]/10'
                }`}
              >
                Cena Jogável
              </button>

              <button
                id="tab-design"
                onClick={() => setActiveTab('design')}
                className={`px-3 py-1.5 rounded font-['Cinzel'] text-xs font-bold transition-all cursor-pointer border ${
                  activeTab === 'design'
                    ? 'bg-[#0A2570] text-[#FFFFFF] border-[#0A2570] shadow-sm'
                    : 'bg-[#FFFFFF] text-[#0A2570] border-[#0A2570]/30 hover:bg-[#0A2570]/10'
                }`}
              >
                GDD & Arquitetura
              </button>
            </div>
          </div>
        </header>

        {/* Conteúdo Principal */}
        <div className="pl-2 sm:pl-6">
          {activeTab === 'game' && (
            <div className="flex flex-col items-center">
              {/* Jogo 2D em Canvas */}
              <GameCanvas />

              {/* Destaques do Milestone 1 Implementado */}
              <div className="w-full mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="p-3 bg-[#F9FAFB] border border-[#0A2570]/25 rounded">
                  <h3 className="font-bold font-['Cinzel'] text-[#0A2570] flex items-center gap-1.5 mb-1.5">
                    <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                    Física & Movimento
                  </h3>
                  <p className="text-[#0A2570]/80 leading-relaxed">
                    Máquina de estados completa com coyote time, buffer de pulo, rolamento com invulnerabilidade
                    e <strong>Pulo Duplo com Giro Acrobático 360° para frente</strong> com corte de espada no ar.
                  </p>
                </div>

                <div className="p-3 bg-[#F9FAFB] border border-[#0A2570]/25 rounded">
                  <h3 className="font-bold font-['Cinzel'] text-[#0A2570] flex items-center gap-1.5 mb-1.5">
                    <Sparkles className="w-4 h-4 text-[#F59E0B]" />
                    Sistema de Fraquezas Ativo
                  </h3>
                  <p className="text-[#0A2570]/80 leading-relaxed">
                    O Espectro é <strong>100% imune</strong> à espada física comum. Ao pressionar <strong>[Q]</strong>,
                    você ativa a <strong>"Arma com Sal"</strong>, causando 220% de dano e banindo o fantasma.
                  </p>
                </div>

                <div className="p-3 bg-[#F9FAFB] border border-[#0A2570]/25 rounded">
                  <h3 className="font-bold font-['Cinzel'] text-[#0A2570] flex items-center gap-1.5 mb-1.5">
                    <Layers className="w-4 h-4 text-[#0A2570]" />
                    Cavaleiro em Traços de Palito (Caneta Esferográfica)
                  </h3>
                  <p className="text-[#0A2570]/80 leading-relaxed">
                    Animação procedural restaurada: <strong>figura articulada em nanquim e caneta esferográfica</strong> com
                    elmo de visor rubi, capa ondulante ao vento, escudo redondo rebitado e espada medieval com arcos de corte e corrida dinâmica.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'design' && (
            <div className="py-2 space-y-6 text-sm">
              <section className="bg-[#F9FAFB] p-5 rounded-lg border border-[#0A2570]/30">
                <h2 className="text-xl font-bold font-['Cinzel'] text-[#0A2570] flex items-center gap-2 mb-3">
                  <BookMarked className="w-5 h-5 text-[#0A2570]" />
                  Documento de Design de Jogo (GDD) - Matriz de Fraquezas
                </h2>
                <p className="text-[#0A2570]/80 mb-4 leading-relaxed">
                  O combate de <em>O Cavaleiro Arruinado</em> se baseia na identificação das vulnerabilidades específicas
                  de cada classe de abominação sobrenatural:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 bg-[#FFFFFF] rounded border-2 border-[#10B981]/40">
                    <h4 className="font-bold text-[#059669] flex items-center gap-1.5 mb-1 text-base">
                      <Sparkles className="w-4 h-4" />
                      Espectros & Fantasmas
                    </h4>
                    <ul className="text-xs space-y-1 text-[#0A2570]/90 mt-2">
                      <li>• <strong>Imunidade:</strong> Lâminas e ataques físicos mortais.</li>
                      <li>• <strong>Fraqueza Crítica:</strong> Sal Purificador e Magia Divina.</li>
                      <li>• <strong>Comportamento:</strong> Flutuam no ar e perseguem a alma do cavaleiro.</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-[#FFFFFF] rounded border-2 border-[#C81E1E]/40">
                    <h4 className="font-bold text-[#C81E1E] flex items-center gap-1.5 mb-1 text-base">
                      <Droplets className="w-4 h-4" />
                      Vampiros
                    </h4>
                    <ul className="text-xs space-y-1 text-[#0A2570]/90 mt-2">
                      <li>• <strong>Fraqueza Corpo a Corpo:</strong> Estacas de Carvalho no coração.</li>
                      <li>• <strong>Fraqueza à Distância:</strong> Água Benta da Basílica.</li>
                      <li>• <strong>Comportamento:</strong> Esquivas rápidas e golpes com sangramento.</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-[#FFFFFF] rounded border-2 border-[#F59E0B]/40">
                    <h4 className="font-bold text-[#D97706] flex items-center gap-1.5 mb-1 text-base">
                      <Flame className="w-4 h-4" />
                      Zumbis & Demônios
                    </h4>
                    <ul className="text-xs space-y-1 text-[#0A2570]/90 mt-2">
                      <li>• <strong>Fraqueza Elemental:</strong> Fogo e Brasas infernais.</li>
                      <li>• <strong>Finalização:</strong> Decapitação com corte pesado de espada.</li>
                      <li>• <strong>Mecânica de Selamento:</strong> Requer Talismã ao atingir 0 HP.</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section className="bg-[#F9FAFB] p-5 rounded-lg border border-[#0A2570]/30">
                <h3 className="text-lg font-bold font-['Cinzel'] text-[#0A2570] flex items-center gap-2 mb-3">
                  <Scroll className="w-5 h-5 text-[#0A2570]" />
                  Direção de Arte & Especificação de Cores
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 bg-[#0A2570] text-[#FFFFFF] rounded flex flex-col justify-between">
                    <span className="font-bold">Caneta Azul Escuro</span>
                    <span className="font-mono text-[10px] opacity-80">#0A2570 (Traços Base)</span>
                  </div>
                  <div className="p-3 bg-[#FFFFFF] border border-[#0A2570] text-[#0A2570] rounded flex flex-col justify-between">
                    <span className="font-bold">Papel Pergaminho</span>
                    <span className="font-mono text-[10px] opacity-80">#FFFFFF (Fundo)</span>
                  </div>
                  <div className="p-3 bg-[#C81E1E] text-white rounded flex flex-col justify-between">
                    <span className="font-bold">Vermelho Sangue</span>
                    <span className="font-mono text-[10px] opacity-80">#C81E1E (Crítico / Perigo)</span>
                  </div>
                  <div className="p-3 bg-[#F59E0B] text-[#051442] rounded flex flex-col justify-between">
                    <span className="font-bold">Ouro Divino</span>
                    <span className="font-mono text-[10px] opacity-80">#F59E0B (Sal / Luz)</span>
                  </div>
                </div>
              </section>
            </div>
          )}
        </div>

        {/* Rodapé do Manuscrito */}
        <footer className="mt-8 pt-4 border-t border-[#0A2570]/20 flex flex-wrap items-center justify-between gap-2 text-xs text-[#0A2570]/60 pl-4 sm:pl-8">
          <span>O Cavaleiro Arruinado © MVP 2D Action RPG</span>
          <span className="font-mono">Engine: HTML5 Canvas 60 FPS • Pure TypeScript</span>
        </footer>
      </div>
    </main>
  );
}
