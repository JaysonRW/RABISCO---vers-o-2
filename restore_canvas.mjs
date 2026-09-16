import fs from 'fs';
let code = fs.readFileSync('src/components/GameCanvas.tsx', 'utf8');

// The current code starts `return (` at line 181 instead of the cleanup function.
// Let's replace the single `return (` at 181 with the missing code, up to the real `return (`.

const missingFunctions = `return () => {
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
    }
  };

  return (`;

code = code.replace('return (', missingFunctions);
fs.writeFileSync('src/components/GameCanvas.tsx', code);
