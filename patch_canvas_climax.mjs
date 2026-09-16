import fs from 'fs';
let code = fs.readFileSync('src/components/GameCanvas.tsx', 'utf8');

// Add state
code = code.replace(
  'const [showInventoryModal, setShowInventoryModal] = useState(false);',
  'const [showInventoryModal, setShowInventoryModal] = useState(false);\n  const [isClimaxTransitioning, setIsClimaxTransitioning] = useState(false);'
);

// Add START_CLIMAX to handleDialogChoice
const climaxBlock = `    } else if (choice.actionId === 'START_CLIMAX') {
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
    }`;

code = code.replace(
  "    } else if (choice.actionId === 'CLOSE') {\n      setActiveNpcDialog(null);\n    }",
  "    } else if (choice.actionId === 'CLOSE') {\n      setActiveNpcDialog(null);\n" + climaxBlock + "\n    }"
);

// Add the Climax Fade Overlay
const overlayUI = `
      {/* Modal de Prólogo e Lore do Grimório (Overlay Opcional) */}`;

const climaxUI = `      {/* CLIMAX TRANSITION OVERLAY */}
      <div 
        className={\`fixed inset-0 bg-black z-[100] pointer-events-none transition-opacity duration-[2000ms] \${isClimaxTransitioning ? 'opacity-100' : 'opacity-0'}\`} 
      />

      {/* Modal de Prólogo e Lore do Grimório (Overlay Opcional) */}`;

code = code.replace(overlayUI, climaxUI);

fs.writeFileSync('src/components/GameCanvas.tsx', code);
