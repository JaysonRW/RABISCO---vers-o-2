/**
 * O Cavaleiro Arruinado - Game Canvas Component
 * Container do Canvas com Controles de Teclado, Touch e Interface HUD
 */

import React, { useEffect, useRef, useState } from 'react';
import { GameEngine } from '../game/GameEngine';
import { GAME_CONFIG } from '../game/config';
import { AscensionStats, PlayerState } from '../game/types';
import { soundManager } from '../game/audio/synth';
import { NPC, DialogChoice } from '../game/entities/NPC';
import { GameIntro } from './GameIntro';
import { NpcDialogModal } from './NpcDialogModal';
import {
  Shield,
  Sparkles,
  RotateCcw,
  Volume2,
  VolumeX,
  BookOpen,
  Sword,
  Flame,
  Info,
  ChevronRight,
  Crosshair,
  Skull,
  Zap,
  Award,
  MessageSquare,
  MapPin,
  Compass,
  Scroll
} from 'lucide-react';

export const GameCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<GameEngine | null>(null);

  // Estados de Telas e Modais Narrativos
  const [showPrologueModal, setShowPrologueModal] = useState<boolean>(false);
  const [activeNpcDialog, setActiveNpcDialog] = useState<NPC | null>(null);

  // HUD Stats sincronizados com o motor a 60 FPS
  const [stats, setStats] = useState({
    hp: GAME_CONFIG.PLAYER.MAX_HP,
    maxHp: GAME_CONFIG.PLAYER.MAX_HP,
    stamina: GAME_CONFIG.PLAYER.MAX_STAMINA,
    maxStamina: GAME_CONFIG.PLAYER.MAX_STAMINA,
    hasSaltWeapon: false,
    saltDuration: 0,
    saltCount: 5,
    inventory: [] as any[],
    playerState: PlayerState.IDLE,
    enemiesAlive: 2,
    ascension: {
      souls: 0,
      soulsCurrentLevel: 0,
      soulsNeededForNext: GAME_CONFIG.ASCENSION.SOULS_BASE_REQ,
      level: 0,
      progressPercent: 0,
      title: GAME_CONFIG.ASCENSION.LEVEL_INFO[0].title,
      bonusText: GAME_CONFIG.ASCENSION.LEVEL_INFO[0].bonusText,
      damageMultiplier: 1.0,
    } as AscensionStats,
    currentSection: {
      id: 'monastery_courtyard',
      name: 'Pátio do Mosteiro',
      subtitle: 'O Primeiro Claustro em Ruínas'
    },
  });

  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showGddGuide, setShowGddGuide] = useState(false);
  const [showRespawnBanner, setShowRespawnBanner] = useState(false);

  // Inicialização do Game Engine
  useEffect(() => {
    if (!canvasRef.current) return;

    const engine = new GameEngine(canvasRef.current, {
      onStatsUpdate: (newStats) => {
        setStats(newStats);
        if (newStats.hp <= 0) {
          setShowRespawnBanner(true);
        }
      },
      onOpenNpcDialog: (npc) => {
        setActiveNpcDialog(npc);
      },
    });
    engineRef.current = engine;
    engine.start();

    // Eventos de Teclado
    const handleKeyDown = (e: KeyboardEvent) => {
      // Evita rolagem da página com Espaço e Setas
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        e.preventDefault();
      }

      const input = engine.input;
      switch (e.code) {
        case 'KeyA':
        case 'ArrowLeft':
          input.left = true;
          break;
        case 'KeyD':
        case 'ArrowRight':
          input.right = true;
          break;
        case 'KeyW':
        case 'ArrowUp':
        case 'Space':
          input.jump = true;
          break;
        case 'KeyJ':
        case 'KeyZ':
          input.attack = true;
          break;
        case 'KeyK':
        case 'ShiftLeft':
        case 'ShiftRight':
          input.dash = true;
          break;
        case 'KeyQ':
        case 'Digit1':
          input.useSalt = true;
          break;
        case 'KeyE':
          input.interact = true;
          break;
        case 'KeyR':
          handleReset();
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const input = engine.input;
      switch (e.code) {
        case 'KeyA':
        case 'ArrowLeft':
          input.left = false;
          break;
        case 'KeyD':
        case 'ArrowRight':
          input.right = false;
          break;
        case 'KeyW':
        case 'ArrowUp':
        case 'Space':
          input.jump = false;
          break;
        case 'KeyJ':
        case 'KeyZ':
          input.attack = false;
          break;
        case 'KeyK':
        case 'ShiftLeft':
        case 'ShiftRight':
          input.dash = false;
          break;
        case 'KeyQ':
        case 'Digit1':
          input.useSalt = false;
          break;
        case 'KeyE':
          input.interact = false;
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      engine.stop();
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    soundManager.enabled = next;
  };

  const handleUseSalt = () => {
    if (engineRef.current) {
      engineRef.current.triggerUseSalt();
    }
  };

  const handleReset = () => {
    if (engineRef.current) {
      engineRef.current.resetGame();
      setShowRespawnBanner(false);
    }
  };

  const handleDialogChoice = (choice: DialogChoice) => {
    if (!engineRef.current) return;
    const engine = engineRef.current;

    // Ações das Escolhas do NPC
    if (choice.actionId === 'HEAL') {
      if (engine.totalSoulsCollected >= (choice.soulCost || 0)) {
        engine.totalSoulsCollected -= choice.soulCost || 0;
        engine.player.hp = Math.min(engine.player.maxHp, engine.player.hp + 50);
        soundManager.playAscensionLevelUp();
        engine.addFloatingText(
          engine.player.x + engine.player.width / 2,
          engine.player.y - 20,
          '+50 VIDA RESTAURADA!',
          GAME_CONFIG.PALETTE.FX_HOLY_GOLD,
          1.2
        );
      }
    } else if (choice.actionId === 'REFILL_SALT') {
      if (engine.totalSoulsCollected >= (choice.soulCost || 0)) {
        engine.totalSoulsCollected -= choice.soulCost || 0;
        engine.inventory.addSalt(4);
        soundManager.playSaltSparkle();
        engine.addFloatingText(
          engine.player.x + engine.player.width / 2,
          engine.player.y - 20,
          '+4 SAL PURIFICADOR!',
          GAME_CONFIG.PALETTE.FX_HOLY_GOLD,
          1.2
        );
      }
    } else if (choice.actionId === 'BLESS_STAMINA') {
      if (engine.totalSoulsCollected >= (choice.soulCost || 0)) {
        engine.totalSoulsCollected -= choice.soulCost || 0;
        engine.player.stamina = engine.player.maxStamina;
        soundManager.playSaltSparkle();
        engine.addFloatingText(
          engine.player.x + engine.player.width / 2,
          engine.player.y - 20,
          'VIGOR SAGRADO MÁXIMO!',
          GAME_CONFIG.PALETTE.FX_SOUL_CYAN,
          1.2
        );
      }
    }

    setActiveNpcDialog(null);
  };

  // Controles Virtuais para Telas Touch / Clique
  const setInputState = (key: keyof GameEngine['input'], value: boolean) => {
    if (engineRef.current) {
      engineRef.current.input[key] = value;
    }
  };

  return (
    <div className="w-full flex flex-col items-center select-none relative">
      {/* Top Controls Bar & Quick Actions */}
      <div className="w-full max-w-5xl flex flex-wrap items-center justify-between gap-3 px-4 py-2 text-xs font-serif text-[#0A2570] border-b border-[#0A2570]/20 bg-[#FFFFFF]/90">
        <div className="flex items-center gap-3">
          <span className="font-bold text-sm tracking-wide flex items-center gap-1.5 font-['Cinzel']">
            <Sword className="w-4 h-4 text-[#0A2570]" />
            O CAVALEIRO ARRUINADO
          </span>
          <span className="hidden sm:inline-block px-2 py-0.5 rounded bg-[#0A2570]/10 text-[10px] uppercase tracking-wider font-semibold">
            Milestone 1 (MVP)
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Som */}
          <button
            id="btn-toggle-sound"
            onClick={handleToggleSound}
            className="p-1.5 rounded hover:bg-[#0A2570]/10 transition-colors flex items-center gap-1 cursor-pointer"
            title={soundEnabled ? 'Silenciar Áudio' : 'Ativar Áudio'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-[#C81E1E]" />}
            <span className="hidden md:inline">{soundEnabled ? 'Som Ativo' : 'Mudo'}</span>
          </button>

          {/* Guia GDD / Fraquezas */}
          <button
            id="btn-open-gdd"
            onClick={() => setShowGddGuide(!showGddGuide)}
            className={`px-2.5 py-1.5 rounded flex items-center gap-1.5 transition-colors cursor-pointer border ${
              showGddGuide
                ? 'bg-[#0A2570] text-[#FFFFFF] border-[#0A2570]'
                : 'bg-transparent text-[#0A2570] border-[#0A2570]/30 hover:bg-[#0A2570]/10'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Grimório de Fraquezas</span>
          </button>

          {/* Prólogo & Lore da História */}
          <button
            id="btn-open-prologue"
            onClick={() => setShowPrologueModal(true)}
            className="px-2.5 py-1.5 rounded border border-[#0A2570]/30 hover:bg-[#0A2570]/10 transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Ver Prólogo e História da Queda do Santuário"
          >
            <Scroll className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Prólogo & Lore</span>
          </button>

          {/* Reiniciar */}
          <button
            id="btn-reset-scene"
            onClick={handleReset}
            className="px-2.5 py-1.5 rounded border border-[#0A2570]/30 hover:bg-[#0A2570]/10 transition-colors flex items-center gap-1 cursor-pointer"
            title="Reiniciar Posição e Inimigos (R)"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reiniciar [R]</span>
          </button>
        </div>
      </div>

      {/* Painel do Grimório de Fraquezas (Collapsible GDD Info) */}
      {showGddGuide && (
        <div className="w-full max-w-5xl px-4 py-3 bg-[#F3F4F6] border-b-2 border-[#0A2570]/30 text-xs font-serif text-[#051442] animate-in fade-in duration-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="p-2.5 bg-[#FFFFFF] rounded border border-[#0A2570]/20">
              <h4 className="font-bold flex items-center gap-1.5 text-[#0A2570] font-['Cinzel'] mb-1">
                <Skull className="w-3.5 h-3.5 text-[#10B981]" />
                Espectros & Fantasmas
              </h4>
              <p className="text-[11px] text-[#0A2570]/80 leading-relaxed">
                <strong className="text-[#C81E1E]">IMUNES</strong> a cortes físicos normais.
                Golpeie com <strong className="text-[#F59E0B]">Sal Purificador [Q]</strong> para causar 220% de dano e colher suas almas.
              </p>
            </div>

            <div className="p-2.5 bg-[#FFFFFF] rounded border border-[#0A2570]/20">
              <h4 className="font-bold flex items-center gap-1.5 text-[#0A2570] font-['Cinzel'] mb-1">
                <Sparkles className="w-3.5 h-3.5 text-[#0284C7]" />
                Ascensão da Alma
              </h4>
              <p className="text-[11px] text-[#0A2570]/80 leading-relaxed">
                Almas liberadas são atraídas magneticamente pelo Cavaleiro. Cada nível de <strong className="text-[#0284C7]">Ascensão</strong> aumenta o dano permanentemente e cura vida.
              </p>
            </div>

            <div className="p-2.5 bg-[#FFFFFF] rounded border border-[#0A2570]/20">
              <h4 className="font-bold flex items-center gap-1.5 text-[#0A2570] font-['Cinzel'] mb-1">
                <Crosshair className="w-3.5 h-3.5 text-[#C81E1E]" />
                Vampiros (GDD)
              </h4>
              <p className="text-[11px] text-[#0A2570]/80 leading-relaxed">
                Vulneráveis a <strong className="text-[#0A2570]">Estacas de Madeira</strong> no corpo a corpo e <strong className="text-[#255AC4]">Água Benta</strong> à distância.
              </p>
            </div>

            <div className="p-2.5 bg-[#FFFFFF] rounded border border-[#0A2570]/20">
              <h4 className="font-bold flex items-center gap-1.5 text-[#0A2570] font-['Cinzel'] mb-1">
                <Flame className="w-3.5 h-3.5 text-[#F59E0B]" />
                Zumbis & Demônios
              </h4>
              <p className="text-[11px] text-[#0A2570]/80 leading-relaxed">
                Vulneráveis a <strong className="text-[#F59E0B]">Fogo Purificador</strong> e decapitação com ataques pesados de espada.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Canvas Frame: Caderno de Caneta Esferográfica com Espirais e Margem */}
      <div className="relative w-full max-w-5xl my-2 p-2 sm:p-4 bg-[#F5F5F5] shadow-2xl rounded-lg border-2 border-[#0A2570]/30">
        {/* Espiral do Caderno na Lateral Esquerda (Notebook Binder Visual) */}
        <div className="absolute -left-2 sm:-left-3 top-8 bottom-8 flex flex-col justify-between pointer-events-none z-20">
          {Array.from({ length: 14 }).map((_, i) => (
            <div
              key={i}
              className="w-4 sm:w-6 h-3 bg-[#0A2570] rounded-full border border-[#051442] shadow-sm transform -rotate-12"
            />
          ))}
        </div>

        {/* HUD Superior sobreposto ao jogo (Inspirado em anotações à caneta) */}
        <div className="w-full flex flex-col gap-2 px-3 py-2 bg-[#FFFFFF]/95 border-2 border-[#0A2570] rounded-t-md font-serif">
          {/* Barra de Progresso de 'Ascensão' no topo da tela */}
          <div className="w-full flex flex-wrap items-center justify-between gap-2.5 px-3 py-2 bg-[#F5F5F5]/60 border border-[#0A2570]/30 rounded shadow-xs">
            {/* Grau & Título da Ascensão */}
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#0A2570] flex items-center justify-center text-[#38BDF8] border border-[#051442] shadow-sm">
                <Sparkles className="w-4 h-4 text-[#38BDF8] animate-pulse" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#0A2570] font-['Cinzel'] tracking-wider">
                    ASCENSÃO: GRAU {stats.ascension.level}
                  </span>
                  <span className="text-[10.5px] px-1.5 py-0.5 bg-[#0A2570]/10 text-[#0A2570] rounded font-semibold">
                    {stats.ascension.title}
                  </span>
                </div>
                <span className="text-[10px] text-[#0A2570]/80">
                  {stats.ascension.bonusText} • <strong className="text-[#C81E1E]">+{Math.round((stats.ascension.damageMultiplier - 1) * 100)}% Dano de Golpe</strong>
                </span>
              </div>
            </div>

            {/* Barra de Progresso de Almas para o Próximo Nível */}
            <div className="flex-1 min-w-[220px] max-w-md mx-2 flex flex-col gap-0.5">
              <div className="flex items-center justify-between text-[11px] font-bold text-[#0A2570]">
                <span className="flex items-center gap-1.5 text-[#0284C7]">
                  <span className="inline-block w-2 h-2 rounded-full bg-[#06B6D4] animate-pulse" />
                  Almas Coletadas: {stats.ascension.souls}
                </span>
                <span className="text-[10.5px]">
                  {stats.ascension.soulsCurrentLevel} / {stats.ascension.soulsNeededForNext} Almas ({stats.ascension.progressPercent}%)
                </span>
              </div>
              <div className="w-full h-3.5 bg-[#E5E7EB] border border-[#0A2570] rounded-xs overflow-hidden p-0.5 relative shadow-inner">
                <div
                  className="h-full bg-gradient-to-r from-[#0284C7] via-[#06B6D4] to-[#F59E0B] transition-all duration-300 relative"
                  style={{ width: `${Math.max(0, stats.ascension.progressPercent)}%` }}
                >
                  <div className="absolute right-0 top-0 bottom-0 w-1 bg-[#FFFBEB] shadow-sm" />
                </div>
              </div>
            </div>

            {/* Contador de Almas & Indicador de Poder */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 px-2.5 py-1 bg-[#0284C7]/15 border border-[#0284C7]/40 rounded text-xs font-bold text-[#0369A1]">
                <Zap className="w-3.5 h-3.5 text-[#0284C7]" />
                <span>{stats.ascension.souls} Almas Totais</span>
              </div>
            </div>
          </div>

          {/* Seção Atual & Mapa do Grimório com Gatilhos de Borda de Tela */}
          <div className="w-full flex flex-wrap items-center justify-between gap-2 px-3 py-1.5 bg-[#F0F0F0]/50 border border-[#0A2570]/25 rounded text-xs">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-[#0A2570]" />
              <span className="font-bold text-[#0A2570] font-['Cinzel'] tracking-wide">
                SEÇÃO ATIVA:
              </span>
              <span className="px-2 py-0.5 rounded bg-[#0A2570] text-[#FFFFFF] text-[11px] font-semibold tracking-wide">
                {stats.currentSection?.name || 'Pátio do Mosteiro'}
              </span>
              <span className="hidden sm:inline text-[11px] italic text-[#0A2570]/70">
                — {stats.currentSection?.subtitle}
              </span>
            </div>

            {/* Marcadores / Gatilhos de Transição de Seção */}
            <div className="flex items-center gap-1.5 text-[11px]">
              <span className="text-[10px] text-[#0A2570]/60 mr-1 hidden md:inline">Transitar Seções:</span>
              {[
                { id: 'monastery_courtyard', label: '1. Pátio' },
                { id: 'corrupted_forest', label: '2. Floresta Corrompida' },
                { id: 'forgotten_crypt', label: '3. Cripta Esquecida' },
              ].map((sec) => {
                const isActive = stats.currentSection?.id === sec.id;
                return (
                  <button
                    key={sec.id}
                    onClick={() => engineRef.current?.switchSection(sec.id)}
                    className={`px-2 py-0.5 rounded text-[11px] font-serif transition-colors cursor-pointer border ${
                      isActive
                        ? 'bg-[#0A2570] text-[#FFFFFF] border-[#0A2570] font-bold shadow-xs'
                        : 'bg-[#FFFFFF]/80 text-[#0A2570] border-[#0A2570]/30 hover:bg-[#0A2570]/15'
                    }`}
                    title={`Transitar para ${sec.label}`}
                  >
                    {sec.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Linha de Vida, Estamina e Status de Combate */}
          <div className="w-full flex flex-wrap items-center justify-between gap-3 pt-0.5">
            {/* Barras de HP e Estamina */}
            <div className="flex items-center gap-4">
              {/* HP */}
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center justify-between text-[11px] font-bold text-[#C81E1E]">
                  <span>VIDA</span>
                  <span>{Math.round(stats.hp)} / {stats.maxHp}</span>
                </div>
                <div className="w-32 sm:w-44 h-3.5 bg-[#F0F0F0] border border-[#0A2570] rounded-xs overflow-hidden p-0.5">
                  <div
                    className="h-full bg-[#C81E1E] transition-all duration-150"
                    style={{ width: `${Math.max(0, (stats.hp / stats.maxHp) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Estamina */}
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center justify-between text-[11px] font-bold text-[#0A2570]">
                  <span>ESTAMINA</span>
                  <span>{Math.round(stats.stamina)}%</span>
                </div>
                <div className="w-24 sm:w-32 h-3.5 bg-[#F0F0F0] border border-[#0A2570] rounded-xs overflow-hidden p-0.5">
                  <div
                    className="h-full bg-[#143D99] transition-all duration-100"
                    style={{ width: `${Math.max(0, (stats.stamina / stats.maxStamina) * 100)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Status da Espada & Sal Purificador */}
            <div className="flex items-center gap-2">
              {stats.hasSaltWeapon ? (
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#F59E0B]/20 border border-[#F59E0B] rounded text-xs font-bold text-[#B45309] animate-pulse">
                  <Sparkles className="w-4 h-4 text-[#F59E0B]" />
                  <span>ARMA COM SAL: {stats.saltDuration.toFixed(1)}s</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 px-2 py-1 bg-[#0A2570]/10 border border-[#0A2570]/30 rounded text-xs text-[#0A2570]">
                  <Sword className="w-3.5 h-3.5" />
                  <span>Espada Comum (Física)</span>
                </div>
              )}

              {/* Botão de Usar Sal Purificador */}
              <button
                id="btn-use-salt"
                onClick={handleUseSalt}
                disabled={stats.saltCount <= 0 || stats.hasSaltWeapon}
                className={`px-3 py-1 rounded border-2 flex items-center gap-1.5 text-xs font-bold transition-all cursor-pointer ${
                  stats.hasSaltWeapon
                    ? 'bg-[#F59E0B] text-[#FFFBEB] border-[#D97706]'
                    : stats.saltCount > 0
                    ? 'bg-[#0A2570] hover:bg-[#143D99] text-[#FFFFFF] border-[#051442] shadow-sm'
                    : 'bg-gray-300 text-gray-500 border-gray-400 cursor-not-allowed'
                }`}
                title="Revestir espada com Sal Purificador [Q]"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Sal ({stats.saltCount}) [Q]</span>
              </button>
            </div>
          </div>
        </div>

        
          {/* Menu de Inventário Rápido */}
          <div className="absolute left-4 top-24 flex flex-col gap-2 z-20 pointer-events-none">
            {stats.inventory && stats.inventory.map((item: any) => (
              <div key={item.id} className="flex items-center gap-2 bg-[#051442]/90 border border-[#255AC4] rounded px-3 py-1.5 text-white shadow-md animate-in slide-in-from-left duration-300">
                <span className="text-lg">{item.icon === 'salt' ? '🧂' : '🧪'}</span>
                <div className="flex flex-col">
                  <span className="text-xs font-bold font-serif">{item.name}</span>
                  <span className="text-[10px] text-[#255AC4]">Qtd: {item.count}</span>
                </div>
              </div>
            ))}
          </div>

        {/* Canvas de Renderização 2D */}
        <div className="relative w-full aspect-video bg-[#FFFFFF] overflow-hidden border-2 border-t-0 border-[#0A2570]">
          <canvas
            ref={canvasRef}
            width={GAME_CONFIG.CANVAS_WIDTH}
            height={GAME_CONFIG.CANVAS_HEIGHT}
            className="w-full h-full block"
          />

          {/* Banner de Morte / Renascimento */}
          {showRespawnBanner && (
            <div className="absolute inset-0 bg-[#051442]/85 flex flex-col items-center justify-center text-[#FFFFFF] z-30 animate-in fade-in duration-300">
              <h2 className="text-3xl sm:text-4xl font-black font-['Cinzel'] text-[#C81E1E] mb-2 tracking-widest">
                SUA ALMA FOI CONSUMIDA
              </h2>
              <p className="text-sm sm:text-base font-serif italic text-[#FFFFFF]/80 mb-6 text-center max-w-md px-4">
                «A maldição não perdoa o cavaleiro imprudente. Levante-se e use as ferramentas de exorcismo corretas.»
              </p>
              <button
                id="btn-respawn"
                onClick={handleReset}
                className="px-6 py-2.5 bg-[#C81E1E] hover:bg-[#DC2626] text-[#FFFFFF] font-bold rounded font-serif border-2 border-[#FFFFFF] tracking-wider transition-transform hover:scale-105 cursor-pointer shadow-lg"
              >
                LEVANTAR-SE NOVAMENTE [R]
              </button>
            </div>
          )}
        </div>

        {/* Guia de Teclas & Botões de Ação Virtual (Mobile / Touch Friendly) */}
        <div className="w-full mt-2 p-2 bg-[#FFFFFF]/95 border-2 border-[#0A2570] rounded-b-md flex flex-wrap items-center justify-between gap-2 text-xs font-serif text-[#0A2570]">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <span className="font-bold flex items-center gap-1">
              <Info className="w-3.5 h-3.5" />
              Comandos:
            </span>
            <span><kbd className="px-1.5 py-0.5 bg-[#F0F0F0] border border-[#0A2570] rounded text-[10px] font-mono">A / D</kbd> Andar</span>
            <span><kbd className="px-1.5 py-0.5 bg-[#F0F0F0] border border-[#0A2570] rounded text-[10px] font-mono">Espaço</kbd> Pular (2x: Giro 360°)</span>
            <span><kbd className="px-1.5 py-0.5 bg-[#F0F0F0] border border-[#0A2570] rounded text-[10px] font-mono">J</kbd> Espada</span>
            <span><kbd className="px-1.5 py-0.5 bg-[#F0F0F0] border border-[#0A2570] rounded text-[10px] font-mono">Shift</kbd> Rolamento</span>
            <span><kbd className="px-1.5 py-0.5 bg-[#F0F0F0] border border-[#0A2570] rounded text-[10px] font-mono">Q</kbd> Imbuir Sal</span>
            <span><kbd className="px-1.5 py-0.5 bg-[#F0F0F0] border border-[#0A2570] rounded text-[10px] font-mono">E</kbd> Altar / Falar com NPC</span>
            <span className="text-[#0284C7] font-semibold"><kbd className="px-1.5 py-0.5 bg-[#F0F0F0] border border-[#0284C7] rounded text-[10px] font-mono">Bordas da Tela</kbd> Transitar Seções</span>
          </div>

          {/* Botões virtuais rápidos na tela */}
          <div className="flex items-center gap-1.5 sm:hidden">
            <button
              onMouseDown={() => setInputState('left', true)}
              onMouseUp={() => setInputState('left', false)}
              onTouchStart={() => setInputState('left', true)}
              onTouchEnd={() => setInputState('left', false)}
              className="p-2 bg-[#0A2570] text-[#FFFFFF] rounded active:scale-95"
            >
              ◀
            </button>
            <button
              onMouseDown={() => setInputState('right', true)}
              onMouseUp={() => setInputState('right', false)}
              onTouchStart={() => setInputState('right', true)}
              onTouchEnd={() => setInputState('right', false)}
              className="p-2 bg-[#0A2570] text-[#FFFFFF] rounded active:scale-95"
            >
              ▶
            </button>
            <button
              onMouseDown={() => setInputState('jump', true)}
              onMouseUp={() => setInputState('jump', false)}
              onTouchStart={() => setInputState('jump', true)}
              onTouchEnd={() => setInputState('jump', false)}
              className="px-3 py-2 bg-[#0A2570] text-[#FFFFFF] rounded font-bold active:scale-95"
            >
              Pulo
            </button>
            <button
              onMouseDown={() => setInputState('attack', true)}
              onMouseUp={() => setInputState('attack', false)}
              onTouchStart={() => setInputState('attack', true)}
              onTouchEnd={() => setInputState('attack', false)}
              className="px-3 py-2 bg-[#C81E1E] text-[#FFFFFF] rounded font-bold active:scale-95"
            >
              Atacar
            </button>
            <button
              onClick={handleUseSalt}
              className="px-2.5 py-2 bg-[#F59E0B] text-[#051442] rounded font-bold active:scale-95"
            >
              Sal
            </button>
          </div>
        </div>
      </div>

      {/* Modal de Diálogo com NPC (Frei Anselmo) */}
      {activeNpcDialog && (
        <NpcDialogModal
          npc={activeNpcDialog}
          playerSouls={stats.ascension.souls}
          onSelectChoice={handleDialogChoice}
          onClose={() => setActiveNpcDialog(null)}
        />
      )}

      {/* Modal de Prólogo e Lore do Grimório (Overlay Opcional) */}
      {showPrologueModal && (
        <div className="fixed inset-0 z-50 bg-[#051442]/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-3xl">
            <button
              onClick={() => setShowPrologueModal(false)}
              className="absolute top-3 right-3 z-30 px-3 py-1 bg-[#C81E1E] hover:bg-[#B91C1C] text-[#FFFFFF] rounded font-bold text-xs border border-[#FFFFFF] cursor-pointer shadow-md transition-colors"
            >
              Fechar [✕]
            </button>
            <GameIntro onStartGame={() => setShowPrologueModal(false)} />
          </div>
        </div>
      )}
    </div>
  );
};
