import fs from 'fs';
let code = fs.readFileSync('src/game/GameEngine.ts', 'utf8');

// 1. Add array
const arrayInjection = `  public particles: Particle[] = [];
  public aoePuddles: {x: number, y: number, radius: number, maxRadius: number, life: number, maxLife: number}[] = [];`;
code = code.replace('  public particles: Particle[] = [];', arrayInjection);

// 2. Add puddle creation to AoE logic
const aoeLogicAnchor = `        const explosionRadius = 180;`;
const aoeLogicInjection = `        const explosionRadius = 180;
        
        // Cria a poça de tinta no chão
        this.aoePuddles.push({
          x: pX,
          y: pY,
          radius: 0,
          maxRadius: explosionRadius,
          life: 0,
          maxLife: 1.5 // Dura 1.5 segundos na tela
        });`;
code = code.replace(aoeLogicAnchor, aoeLogicInjection);

// 3. Update puddles in update loop
const updateAnchor = `    // 6. Atualiza Textos Flutuantes`;
const updateInjection = `    // Atualiza Poças de AoE
    for (let i = this.aoePuddles.length - 1; i >= 0; i--) {
      const p = this.aoePuddles[i];
      p.life += dt;
      // Expansão rápida
      if (p.radius < p.maxRadius) {
         p.radius += (p.maxRadius - p.radius) * 10 * dt + 50 * dt;
         if (p.radius > p.maxRadius) p.radius = p.maxRadius;
      }
      if (p.life >= p.maxLife) {
        this.aoePuddles.splice(i, 1);
      }
    }

    // 6. Atualiza Textos Flutuantes`;
code = code.replace(updateAnchor, updateInjection);

// 4. Render puddles
const renderAnchor = `    // 5. Renderiza o Jogador (O Cavaleiro Arruinado)`;
const renderInjection = `    // 4b. Renderiza Poças de Tinta (Abaixo do Jogador)
    this.renderer.renderAoePuddles(ctx, this.aoePuddles);
    
    // 5. Renderiza o Jogador (O Cavaleiro Arruinado)`;
code = code.replace(renderAnchor, renderInjection);

fs.writeFileSync('src/game/GameEngine.ts', code);
console.log('GameEngine patched with puddles.');
