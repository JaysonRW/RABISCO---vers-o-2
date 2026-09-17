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
    killCounts: {} as Record<string, number>,
    comboCount: 0,
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
  const [isClimaxTransitioning, setIsClimaxTransitioning] = useState(false);
  const [newGrimoireEntry, setNewGrimoireEntry] = useState<{type: string, name: string} | null>(null);
  const [newSpellEntry, setNewSpellEntry] = useState<string | null>(null);
  const previousKillCounts = React.useRef<Record<string, number>>({});
  const previousLearnedSpells = React.useRef<Record<string, boolean>>({});

  // Inicialização do Game Engine
  useEffect(() => {
    if (!canvasRef.current) return;

    const engine = new GameEngine(canvasRef.current, {
      onStatsUpdate: (newStats) => {
        setStats(newStats);
        
        // Verifica novos registros no grimório
        if (newStats.killCounts) {
          for (const key in newStats.killCounts) {
            if (newStats.killCounts[key] === 1 && !previousKillCounts.current[key]) {
               let name = key;
               if (key === 'GHOST') name = 'Espectro';
               else if (key === 'GHOUL') name = 'Carniçal';
               else if (key === 'ZOMBIE') name = 'Zumbi Amaldiçoado';
               else if (key === 'SKULL') name = 'Caveira Flutuante';
               
               setNewGrimoireEntry({ type: key, name });
               setTimeout(() => setNewGrimoireEntry(null), 5000);
            }
            previousKillCounts.current[key] = newStats.killCounts[key];
          }
        }

        // Verifica novas magias aprendidas
        if (newStats.learnedSpells) {
          for (const key in newStats.learnedSpells) {
            if (newStats.learnedSpells[key] && !previousLearnedSpells.current[key]) {
               let name = key;
               if (key === 'fireball') name = 'Bola de Fogo';
               else if (key === 'heal') name = 'Aura de Cura';
               else if (key === 'aoe') name = 'Borrão Explosivo';
               
               setNewSpellEntry(name);
               setTimeout(() => setNewSpellEntry(null), 5000);
            }
            previousLearnedSpells.current[key] = newStats.learnedSpells[key];
          }
        }

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
          stats={stats} 
          onClose={() => setShowStatusScreen(false)} 
          onUseItem={(itemId) => {
            if (engineRef.current) {
               const eng = engineRef.current;
               // Process item usage
               const item = eng.inventory.items.find((i: any) => i.id === itemId);
               if (item) {
                 if (item.type === 'WEAPON') {
                    // Just a visual equip logic (no complex mechanics yet, but it exists)
                    eng.addFloatingText(eng.player.x, eng.player.y - 20, `${item.name} Equipado`, '#FCD34D', 1);
                 } else if (item.id === 'purifying_salt') {
                    if (item.count > 0 && !eng.inventory.hasSaltCoating) {
                        if (eng.inventory.useSaltCoating(15)) {
                            eng.addFloatingText(eng.player.x, eng.player.y - 20, `Arma Abençoada!`, '#60A5FA', 1.2);
                            soundManager.playSaltApply();
                        }
                    } else if (eng.inventory.hasSaltCoating) {
                        eng.addFloatingText(eng.player.x, eng.player.y - 20, `Arma já está abençoada!`, '#9CA3AF', 0.8);
                    }
                 } else if (item.id === 'holy_water') {
                    if (item.count > 0) {
                        item.count--;
                        eng.player.hp = Math.min(eng.player.maxHp, eng.player.hp + 20); // Heals 20 HP
                        eng.addFloatingText(eng.player.x, eng.player.y - 20, `+20 HP`, '#10B981', 1.2);
                        soundManager.playSoulAbsorb();
                    }
                 } else if (item.type === 'CONSUMABLE' && item.count > 0) {
                     item.count--;
                     // Heals the player fully just as a fallback
                     eng.player.hp = eng.player.maxHp;
                     eng.addFloatingText(eng.player.x, eng.player.y - 20, `Restaurado`, '#10B981', 1.2);
                     soundManager.playSoulAbsorb();
                 }
                 // Trigger force update stats
                 const aliveCount = eng.enemies.filter(e => e.isAlive).length;
                 setStats({
                  hp: eng.player.hp,
                  maxHp: eng.player.maxHp,
                  stamina: eng.player.stamina,
                  maxStamina: eng.player.maxStamina,
                  hasSaltWeapon: eng.inventory.hasSaltCoating,
                  saltDuration: eng.inventory.saltDurationLeft,
                  saltCount: eng.inventory.saltCharges,
                  playerState: eng.player.state,
                  enemiesAlive: aliveCount,
                  mp: eng.player.mp,
                  maxMp: eng.player.maxMp,
                  ascension: eng.getAscensionStats(),
                  inventory: [...eng.inventory.items],
                  killCounts: eng.killCounts,
                  learnedSpells: eng.learnedSpells,
                  comboCount: eng.comboCount,
                  currentSection: {
                    id: eng.sectionManager.currentSectionId,
                    name: eng.sectionManager.currentSection.name,
                    subtitle: eng.sectionManager.currentSection.subtitle,
                    theme: eng.sectionManager.theme
                  }
                 });
               }
            }
          }}
          onClearNewItems={() => {
            if (engineRef.current) {
              engineRef.current.inventory.clearNewItems();
              // Force update stats to reflect removed new tags
              const aliveCount = engineRef.current.enemies.filter(e => e.isAlive).length;
              setStats({
                hp: engineRef.current.player.hp,
                maxHp: engineRef.current.player.maxHp,
                stamina: engineRef.current.player.stamina,
                maxStamina: engineRef.current.player.maxStamina,
                hasSaltWeapon: engineRef.current.inventory.hasSaltCoating,
                saltDuration: engineRef.current.inventory.saltDurationLeft,
                saltCount: engineRef.current.inventory.saltCharges,
                playerState: engineRef.current.player.state,
                enemiesAlive: aliveCount,
                mp: engineRef.current.player.mp,
                maxMp: engineRef.current.player.maxMp,
                ascension: engineRef.current.getAscensionStats(),
                inventory: [...engineRef.current.inventory.items],
                killCounts: engineRef.current.killCounts,
                learnedSpells: engineRef.current.learnedSpells,
                comboCount: engineRef.current.comboCount,
                currentSection: {
                  id: engineRef.current.sectionManager.currentSectionId,
                  name: engineRef.current.sectionManager.currentSection.name,
                  subtitle: engineRef.current.sectionManager.currentSection.subtitle,
                }
              });
            }
          }}
        />
      )}
      
      {/* Notificação do Grimório */}
      {newGrimoireEntry && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 pointer-events-none flex flex-col items-center">
          <div className="animate-unroll bg-[#E3D5C8] border-y-2 border-stone-800 shadow-[0_5px_10px_rgba(0,0,0,0.6)] px-4 py-2 flex flex-col items-center text-center overflow-hidden min-w-[200px]">
             {/* Cabos de madeira do pergaminho simulados por bordas/sombras, mas mantendo simples */}
             <div className="text-stone-800 font-['Cinzel'] font-bold text-xs mb-0.5 tracking-widest border-b border-stone-800/30 pb-0.5">
               NOVO REGISTRO NO GRIMÓRIO
             </div>
             <div className="text-stone-900 text-lg font-serif mt-0.5 font-bold">
               {newGrimoireEntry.name}
             </div>
             <div className="text-stone-600 font-['Caveat'] text-sm mt-0.5 italic">
               Pressione TAB para consultar
             </div>
          </div>
        </div>
      )}

      {/* Notificação de Nova Magia */}
      {newSpellEntry && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 pointer-events-none flex flex-col items-center">
          <div className="animate-unroll bg-blue-900/90 border-y-2 border-blue-400 shadow-[0_5px_15px_rgba(59,130,246,0.5)] px-4 py-2 flex flex-col items-center text-center overflow-hidden min-w-[200px]">
             <div className="text-blue-200 font-['Cinzel'] font-bold text-xs mb-0.5 tracking-widest border-b border-blue-400/50 pb-0.5">
               NOVA MAGIA DESCOBERTA
             </div>
             <div className="text-white text-lg font-serif mt-0.5 font-bold drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]">
               {newSpellEntry}
             </div>
             <div className="text-blue-300 font-['Caveat'] text-sm mt-0.5 italic">
               Pressione TAB para consultar
             </div>
          </div>
        </div>
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

        {/* Combo HUD (Top Left) */}
        {stats.comboCount > 1 && (
          <div className="absolute top-4 left-4 flex flex-col gap-1 pointer-events-none animate-in slide-in-from-left-4 fade-in duration-300">
            <span className="text-xl font-bold font-['Cinzel'] text-[#F59E0B] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] tracking-widest italic">
              COMBO
            </span>
            <span className={`text-5xl font-black font-serif drop-shadow-[0_4px_8px_rgba(0,0,0,0.9)] ${stats.comboCount > 10 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
              x{stats.comboCount}
            </span>
          </div>
        )}

        {/* HUD - Floating over the canvas */}
        <div className="absolute top-0 right-0 p-4 flex flex-col gap-3 pointer-events-none items-end">
          <div className="flex gap-3">
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

