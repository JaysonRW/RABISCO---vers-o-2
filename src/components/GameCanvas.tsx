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
import { StatusScreen } from './StatusScreen';
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
    mp: 100,
    maxMp: 100,
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
  const [showStatusScreen, setShowStatusScreen] = useState(false);
  const [showInventoryModal, setShowInventoryModal] = useState(false);
  const [isClimaxTransitioning, setIsClimaxTransitioning] = useState(false);

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
      if (e.code === 'Tab') {
        e.preventDefault();
        setShowStatusScreen(prev => !prev);
        return;
      }
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
        case 'KeyS':
        case 'ArrowDown':
          input.down = true;
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
        case 'Enter':
          setShowInventoryModal(prev => !prev);
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
        case 'KeyS':
        case 'ArrowDown':
          input.down = false;
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

  const handleDialogChoice = (choice: any) => {
    if (!engineRef.current) return;
    const engine = engineRef.current;

    if (choice.actionId === 'HEAL') {
      if (engine.totalSoulsCollected >= (choice.soulCost || 0)) {
        engine.totalSoulsCollected -= choice.soulCost || 0;
        engine.player.hp = Math.min(engine.player.maxHp, engine.player.hp + 50);
        soundManager.playAscensionLevelUp();
        engine.addFloatingText(
          engine.player.x + engine.player.width / 2,
          engine.player.y - 20,
          '+50 VIDA RESTAURADA!',
          '#F59E0B',
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
          '#F59E0B',
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
          '#06B6D4',
          1.2
        );
      }
    } else if (choice.actionId === 'START_CLIMAX') {
      setActiveNpcDialog(null);
      setIsClimaxTransitioning(true);
      engine.triggerScreenShake(1.5, 30); // Very intense shake
      
      // Sequence: Fade out for 2 seconds, switch map, fade in
      setTimeout(() => {
        engine.switchSection('monastery_courtyard');
        engine.isCutscenePlaying = false;
        
        // Short delay to let the fade-in happen
        setTimeout(() => {
           setIsClimaxTransitioning(false);
        }, 1000);
      }, 2500); // Wait 2.5 seconds in black
      
      return;
    } else if (choice.actionId === 'CLOSE') {
      setActiveNpcDialog(null);
      if (engineRef.current) engineRef.current.isCutscenePlaying = false;
    }
  };

  return (
    <div className="w-screen h-screen bg-black flex flex-col items-center justify-center select-none overflow-hidden relative">
      {showStatusScreen && stats && (
        <StatusScreen 
          stats={{
            hp: stats.hp,
            maxHp: stats.maxHp,
            stamina: stats.stamina,
            maxStamina: stats.maxStamina,
            mp: stats.mp,
            maxMp: stats.maxMp,
            ascension: stats.ascension,
            saltCount: stats.saltCount || 0
          }} 
          onClose={() => setShowStatusScreen(false)} 
        />
      )}
      
      {/* Game Area Wrapper (keeps 16:9 aspect ratio) */}
      <div className="relative w-full h-full max-w-[1920px] aspect-video sm:aspect-auto sm:max-h-screen flex items-center justify-center bg-[#051442]">
        
        {/* Canvas itself */}
        <canvas
          ref={canvasRef}
          width={GAME_CONFIG.CANVAS_WIDTH}
          height={GAME_CONFIG.CANVAS_HEIGHT}
          className="w-full h-full object-contain block"
          onMouseDown={(e) => {
            if (e.button === 0 && engineRef.current) {
              engineRef.current.input.attack = true;
            }
          }}
          onMouseUp={(e) => {
            if (e.button === 0 && engineRef.current) {
              engineRef.current.input.attack = false;
            }
          }}
          onMouseLeave={() => {
            if (engineRef.current) {
              engineRef.current.input.attack = false;
            }
          }}
        />

        {/* HUD - Floating over the canvas */}
        <div className="absolute top-0 right-0 p-4 flex gap-3 pointer-events-none items-start">
          {/* Top Right: Souls and Sound */}
          <div className="flex items-center gap-2 bg-black/50 px-3 py-1.5 rounded border border-white/10 backdrop-blur-sm pointer-events-auto h-9">
            <span className="text-[#06B6D4]">✧</span>
            <span className="text-xl font-bold font-['Cinzel'] text-[#FFFFFF] drop-shadow-md leading-none">
              {stats.ascension.souls}
            </span>
          </div>
          {/* Quick Actions (Sound) */}
          <button
            onClick={handleToggleSound}
            className="p-1.5 bg-black/50 hover:bg-black/80 rounded border border-white/10 text-white pointer-events-auto transition-colors h-9 flex items-center justify-center"
          >
            {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5 text-[#C81E1E]" />}
          </button>
        </div>

        {/* Buffs Display */}
        <div className="absolute bottom-4 left-4 flex flex-col gap-2 pointer-events-none">
          {stats.saltDuration > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-[#F59E0B]/20 border border-[#F59E0B]/50 rounded animate-in fade-in">
              <span className="text-lg">🧂</span>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-[#F59E0B] drop-shadow-md">Sal Purificador Ativo</span>
                <div className="w-24 h-1 bg-black/50 rounded-full mt-1 overflow-hidden">
                  <div
                    className="h-full bg-[#F59E0B] transition-all"
                    style={{ width: `${(stats.saltDuration / GAME_CONFIG.PLAYER.SALT_COATING_DURATION) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Interactive Modals and Overlays */}
        {showInventoryModal && (
          <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center text-white z-40 animate-in fade-in duration-200">
            <div className="w-full max-w-lg flex flex-col items-center">
              <h2 className="text-3xl font-black font-['Cinzel'] text-white mb-6 tracking-widest border-b border-white/20 pb-2 w-full text-center">
                INVENTÁRIO
              </h2>
              
              <div className="flex flex-col gap-3 w-full max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                {stats.inventory && stats.inventory.length > 0 ? (
                  stats.inventory.map((item: any) => (
                    <div key={item.id} className="flex items-center justify-between bg-white/5 border border-white/10 rounded p-4 text-white hover:bg-white/10 transition-colors backdrop-blur-sm">
                      <div className="flex items-center gap-4">
                        <span className="text-3xl bg-black/50 rounded p-2 border border-white/5">
                          {item.icon === 'salt' ? '🧂' : item.icon === 'flask' ? '🧪' : item.icon === 'sword' ? '🗡️' : '✝️'}
                        </span>
                        <div className="flex flex-col">
                          <span className="text-lg font-bold font-serif leading-tight">{item.name}</span>
                          <span className="text-xs font-serif text-white/60 italic mt-0.5">{item.description}</span>
                        </div>
                      </div>
                      {item.count !== undefined && (
                        <div className="flex flex-col items-center justify-center min-w-[3rem]">
                          <span className="text-[10px] text-white/50 uppercase">Qtd</span>
                          <span className="text-2xl font-black font-['Special_Elite'] text-[#F59E0B]">{item.count}</span>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-center text-white/40 font-serif py-12 italic">Inventário vazio.</p>
                )}
              </div>

              <button
                onClick={() => setShowInventoryModal(false)}
                className="mt-8 px-8 py-2.5 bg-transparent hover:bg-white/10 text-white font-bold rounded font-serif border border-white/30 tracking-widest transition-all uppercase text-sm"
              >
                Fechar [Enter]
              </button>
            </div>
          </div>
        )}

        {/* Death Banner */}
        {showRespawnBanner && (
          <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center text-white z-30 animate-in fade-in duration-500">
            <h2 className="text-4xl sm:text-5xl font-black font-['Cinzel'] text-[#C81E1E] mb-4 tracking-[0.2em] drop-shadow-lg">
              SUA ALMA FOI CONSUMIDA
            </h2>
            <button
              onClick={handleReset}
              className="mt-8 px-8 py-3 bg-transparent hover:bg-[#C81E1E]/20 text-[#C81E1E] font-bold rounded font-serif border-2 border-[#C81E1E] tracking-widest transition-all hover:scale-105 cursor-pointer uppercase text-sm"
            >
              Levantar-se Novamente [R]
            </button>
          </div>
        )}

        {/* CLIMAX TRANSITION OVERLAY */}
        <div 
          className={`absolute inset-0 bg-black z-[100] pointer-events-none transition-opacity duration-[2000ms] ${isClimaxTransitioning ? 'opacity-100' : 'opacity-0'}`} 
        />
        
        {/* NPC Dialog */}
        {activeNpcDialog && (
          <NpcDialogModal
            npc={activeNpcDialog}
            playerSouls={stats.ascension.souls}
            onSelectChoice={handleDialogChoice}
            onClose={() => { setActiveNpcDialog(null); if (engineRef.current) engineRef.current.isCutscenePlaying = false; }}
          />
        )}

      </div>
    </div>
  );
};

