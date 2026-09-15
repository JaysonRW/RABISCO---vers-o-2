/**
 * O Cavaleiro Arruinado - ParallaxBackgroundSystem
 * Motor de Renderização de Cenários de Fundo e Parallax
 * 
 * Baseado diretamente nas pranchas de arte conceituais em caneta esferográfica azul sobre pergaminho:
 * - BACKGROUND 02: MONTANHAS DISTANTES (CAMADA 01)
 * - BACKGROUND 03: SILHUETA DE CASTELOS E RUÍNAS (CAMADA 02/03)
 * - BACKGROUND 04: NUVENS E NÉVOA (MÓVEL / VFX)
 * - CAMADAS COMPLEMENTARES PARA FLORESTA E CRIPTA
 * 
 * Utiliza buffers off-screen pré-renderizados para garantir milhares de hachuras à mão
 * com loop horizontal seamless e 60 FPS impecáveis.
 */

import { GAME_CONFIG } from '../config';
import { BiomeTheme } from '../world/Section';

interface AtmosphericParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  pulsePhase: number;
  type: 'ink_speck' | 'mist_mote' | 'spore';
}

export class ParallaxBackgroundSystem {
  // Buffers pré-renderizados para alta performance (60 FPS)
  private monasteryMountainsBackBuffer: HTMLCanvasElement | null = null;
  private monasteryMountainsBuffer: HTMLCanvasElement | null = null;
  private monasteryCourtyardBuffer: HTMLCanvasElement | null = null;
  private monasteryCastlesBuffer: HTMLCanvasElement | null = null;
  private monasteryCloudsBuffer: HTMLCanvasElement | null = null;

  private forestDistantBuffer: HTMLCanvasElement | null = null;
  private forestMidBuffer: HTMLCanvasElement | null = null;

  private cryptVaultsBuffer: HTMLCanvasElement | null = null;
  private cryptPillarsBuffer: HTMLCanvasElement | null = null;

  // Dimensão do loop horizontal dos buffers
  public readonly loopWidth = 1920;
  public readonly loopHeight = 540;

  // Partículas atmosféricas contínuas (névoa e bruma suspensas)
  private atmosphericParticles: AtmosphericParticle[] = [];
  private animTimer = 0;

  constructor() {
    this.initBuffers();
    this.initAtmosphericParticles();
    this.loadCloudsImage();
    this.loadMountainsImage();
    this.loadMountainsBackImage();
    this.loadCourtyardImage();
  }

  private loadCourtyardImage() {
    if (typeof window === 'undefined') return;
    const img = new Image();
    img.src = '/cidadearruinada1.jpeg';
    img.onload = () => {
      if (!this.monasteryCourtyardBuffer) return;
      const ctx = this.monasteryCourtyardBuffer.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;
      
      const w = this.monasteryCourtyardBuffer.width;
      const h = this.monasteryCourtyardBuffer.height;
      
      ctx.clearRect(0, 0, w, h);
      
      const drawH = 380;
      const drawW = drawH * (img.width / img.height);
      
      for (let x = 0; x < w; x += drawW) {
        ctx.drawImage(img, x, h - drawH, drawW, drawH);
      }
      
      // Aplica "alfa 0" no fundo branco
      const imageData = ctx.getImageData(0, 0, w, h);
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i+1];
        const b = data[i+2];
        // Se for claro o suficiente, torna transparente (alfa 0)
        if (r > 200 && g > 200 && b > 200) {
          data[i+3] = 0; // Alpha 0
        } else {
          // Escurece os traços levemente e remove qualquer branco residual
          // Isso ajuda a mesclar sem precisar do blend mode multiply
        }
      }
      ctx.putImageData(imageData, 0, 0);
    };
  }

  private loadMountainsBackImage() {
    if (typeof window === 'undefined') return;
    const img = new Image();
    img.src = '/montanhasFundo1.jpeg';
    img.onload = () => {
      if (!this.monasteryMountainsBackBuffer) return;
      const ctx = this.monasteryMountainsBackBuffer.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;
      
      const w = this.monasteryMountainsBackBuffer.width;
      const h = this.monasteryMountainsBackBuffer.height;
      
      ctx.clearRect(0, 0, w, h);
      
      const drawH = 380;
      const drawW = drawH * (img.width / img.height);
      
      for (let x = 0; x < w; x += drawW) {
        ctx.drawImage(img, x, h - drawH, drawW, drawH);
      }
    };
  }

  private loadMountainsImage() {
    if (typeof window === 'undefined') return;
    const img = new Image();
    img.src = '/montanhas_1.jpeg';
    img.onload = () => {
      if (!this.monasteryMountainsBuffer) return;
      const ctx = this.monasteryMountainsBuffer.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;
      
      const w = this.monasteryMountainsBuffer.width;
      const h = this.monasteryMountainsBuffer.height;
      
      // Limpa as montanhas procedurais antigas
      ctx.clearRect(0, 0, w, h);
      
      // Ajusta a altura da montanha para não cobrir a tela (ex: 380px de altura)
      const drawH = 380;
      const drawW = drawH * (img.width / img.height);
      
      // Desenha a imagem repetida lado a lado (tiling) para preencher a largura sem esticar
      for (let x = 0; x < w; x += drawW) {
        ctx.drawImage(img, x, h - drawH, drawW, drawH);
      }
    };
  }

  private loadCloudsImage() {
    if (typeof window === 'undefined') return;
    const img = new Image();
    // Use the file provided by the user
    img.src = '/nuvens_1.jpeg';
    img.onload = () => {
      if (!this.monasteryCloudsBuffer) return;
      const ctx = this.monasteryCloudsBuffer.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;
      
      const w = this.monasteryCloudsBuffer.width;
      const h = this.monasteryCloudsBuffer.height;
      
      // Clear the procedural clouds
      ctx.clearRect(0, 0, w, h);
      
      // Ajusta a altura da nuvem para o topo do céu (ex: 280px de altura)
      const drawH = 280;
      const drawW = drawH * (img.width / img.height);
      
      // Desenha a imagem repetida lado a lado (tiling) horizontalmente no topo
      for (let x = 0; x < w; x += drawW) {
        ctx.drawImage(img, x, 0, drawW, drawH);
      }
    };
  }

  private initAtmosphericParticles() {
    const count = 48;
    this.atmosphericParticles = [];
    for (let i = 0; i < count; i++) {
      this.atmosphericParticles.push({
        x: Math.random() * GAME_CONFIG.CANVAS_WIDTH,
        y: Math.random() * GAME_CONFIG.CANVAS_HEIGHT,
        vx: 8 + Math.random() * 18,
        vy: (Math.random() - 0.5) * 6,
        size: 1 + Math.random() * 2.2,
        alpha: 0.2 + Math.random() * 0.45,
        pulsePhase: Math.random() * Math.PI * 2,
        type: i % 3 === 0 ? 'ink_speck' : 'mist_mote',
      });
    }
  }

  private initBuffers() {
    if (typeof document === 'undefined') return;

    // 1. Gera Buffers do Mosteiro / Cenário Inicial (Montanhas, Castelo, Nuvens)
    this.monasteryMountainsBackBuffer = this.createOffscreenCanvas(this.loopWidth, this.loopHeight);
    
    this.monasteryMountainsBuffer = this.createOffscreenCanvas(this.loopWidth, this.loopHeight);
    this.renderMonasteryMountainsToBuffer(this.monasteryMountainsBuffer);

    this.monasteryCourtyardBuffer = this.createOffscreenCanvas(this.loopWidth, this.loopHeight);

    this.monasteryCastlesBuffer = this.createOffscreenCanvas(this.loopWidth, this.loopHeight);
    this.renderMonasteryCastlesToBuffer(this.monasteryCastlesBuffer);

    this.monasteryCloudsBuffer = this.createOffscreenCanvas(this.loopWidth, this.loopHeight);
    this.renderMonasteryCloudsToBuffer(this.monasteryCloudsBuffer);

    // 2. Gera Buffers da Floresta Corrompida
    this.forestDistantBuffer = this.createOffscreenCanvas(this.loopWidth, this.loopHeight);
    this.renderForestDistantToBuffer(this.forestDistantBuffer);

    this.forestMidBuffer = this.createOffscreenCanvas(this.loopWidth, this.loopHeight);
    this.renderForestMidToBuffer(this.forestMidBuffer);

    // 3. Gera Buffers da Cripta Esquecida
    this.cryptVaultsBuffer = this.createOffscreenCanvas(this.loopWidth, this.loopHeight);
    this.renderCryptVaultsToBuffer(this.cryptVaultsBuffer);

    this.cryptPillarsBuffer = this.createOffscreenCanvas(this.loopWidth, this.loopHeight);
    this.renderCryptPillarsToBuffer(this.cryptPillarsBuffer);
  }

  private createOffscreenCanvas(w: number, h: number): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    return canvas;
  }

  // =========================================================================
  // BACKGROUND 02: MONTANHAS DISTANTES (CAMADA 01)
  // Baseado na prancha de arte: picos agudos, ridge-lines, hachuras de sombra,
  // vales e névoa/bruma volumétrica na base com emenda perfeita.
  // =========================================================================
  private renderMonasteryMountainsToBuffer(canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const penDark = GAME_CONFIG.PALETTE.PEN_PRIMARY;       // #0A2570
    const penMid = GAME_CONFIG.PALETTE.PEN_SECONDARY;       // #143D99
    const penLight = GAME_CONFIG.PALETTE.PEN_LIGHT;         // #255AC4
    const penHatching = GAME_CONFIG.PALETTE.PEN_HATCHING;

    // --- CAMADA FAR: Picos enevoados distantes com traços leves ---
    ctx.save();
    ctx.strokeStyle = 'rgba(37, 90, 196, 0.35)';
    ctx.fillStyle = 'rgba(235, 226, 204, 0.55)';
    ctx.lineWidth = 1.0;

    ctx.beginPath();
    ctx.moveTo(0, 360);
    // Cordilheira distante ao fundo
    const farPeaks = [
      { x: 0, y: 280 }, { x: 140, y: 220 }, { x: 260, y: 270 },
      { x: 420, y: 190 }, { x: 580, y: 260 }, { x: 740, y: 210 },
      { x: 920, y: 275 }, { x: 1080, y: 180 }, { x: 1240, y: 250 },
      { x: 1420, y: 200 }, { x: 1600, y: 265 }, { x: 1780, y: 215 },
      { x: 1920, y: 280 }
    ];
    for (const p of farPeaks) {
      ctx.lineTo(p.x, p.y);
    }
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Hachura sutil nos picos distantes
    ctx.strokeStyle = 'rgba(37, 90, 196, 0.2)';
    ctx.lineWidth = 0.7;
    ctx.beginPath();
    for (let x = 0; x < w; x += 18) {
      ctx.moveTo(x, 260);
      ctx.lineTo(x - 25, 340);
    }
    ctx.stroke();
    ctx.restore();

    // --- CAMADA MID: Montanhas Principais com Arete e Hachuras Densas ---
    // Estrutura de picos inspirada exatamente na prancha de arte:
    // Pico 1 (esq): topo ~190 | Pico 2 (central maciço com aresta dupla): topo ~130 | Pico 3 (dir): topo ~180
    const mainRidge = [
      { x: 0, y: 340 },
      { x: 100, y: 270 },
      { x: 220, y: 290 },
      { x: 340, y: 210 }, // Pico da esquerda
      { x: 430, y: 260 },
      { x: 550, y: 240 },
      { x: 720, y: 145 }, // CUME PRINCIPAL CENTRAL (Pico da Rocha)
      { x: 860, y: 225 },
      { x: 1020, y: 195 },
      { x: 1180, y: 270 },
      { x: 1340, y: 165 }, // Segundo cume alto
      { x: 1480, y: 245 },
      { x: 1650, y: 200 },
      { x: 1800, y: 285 },
      { x: 1920, y: 340 }  // Conecta perfeitamente com x=0 para emenda em loop!
    ];

    ctx.save();
    // Preenchimento base para cobrir o horizonte
    ctx.fillStyle = 'rgba(238, 230, 210, 0.9)';
    ctx.strokeStyle = penDark;
    ctx.lineWidth = 1.8;

    ctx.beginPath();
    ctx.moveTo(mainRidge[0].x, mainRidge[0].y);
    for (let i = 1; i < mainRidge.length; i++) {
      ctx.lineTo(mainRidge[i].x, mainRidge[i].y);
    }
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Linhas de Aresta e Encosta (Ridge lines dividindo luz e sombra como na referência)
    ctx.lineWidth = 1.4;
    ctx.strokeStyle = penDark;
    ctx.beginPath();
    // Aresta do pico central descendo em zigue-zague natural
    ctx.moveTo(720, 145);
    ctx.lineTo(690, 210);
    ctx.lineTo(725, 275);
    ctx.lineTo(710, 350);

    // Aresta do pico esquerdo
    ctx.moveTo(340, 210);
    ctx.lineTo(365, 270);
    ctx.lineTo(390, 340);

    // Aresta do pico direito
    ctx.moveTo(1340, 165);
    ctx.lineTo(1315, 235);
    ctx.lineTo(1350, 310);

    // Encostas e escarpas intermediárias
    ctx.moveTo(1020, 195);
    ctx.lineTo(1005, 260);
    ctx.lineTo(1030, 330);
    ctx.stroke();

    // HACHURAS DE CANETA ESFEROGRÁFICA NAS FACES DE SOMBRA (Cross-hatching idêntico à arte do usuário)
    ctx.strokeStyle = penHatching;
    ctx.lineWidth = 0.9;
    ctx.beginPath();

    // Sombra do Pico Central (Face esquerda sombreada)
    for (let hy = 160; hy < 350; hy += 7) {
      const progress = (hy - 160) / 190;
      const leftBound = 720 - (progress * 190);
      const rightBound = 720 + (progress * 15);
      ctx.moveTo(leftBound, hy);
      ctx.lineTo(rightBound, hy - 14);
    }

    // Segunda camada cruzada de hachura nas encostas mais escuras
    for (let hy = 210; hy < 350; hy += 9) {
      const progress = (hy - 210) / 140;
      const leftBound = 680 - (progress * 110);
      const rightBound = 715;
      ctx.moveTo(leftBound, hy - 10);
      ctx.lineTo(rightBound, hy + 12);
    }

    // Sombra do Pico Esquerdo
    for (let hy = 220; hy < 340; hy += 8) {
      const progress = (hy - 220) / 120;
      ctx.moveTo(340 - (progress * 120), hy);
      ctx.lineTo(365 + (progress * 15), hy - 12);
    }

    // Sombra do Pico Direito
    for (let hy = 180; hy < 340; hy += 8) {
      const progress = (hy - 180) / 160;
      ctx.moveTo(1340 - (progress * 150), hy);
      ctx.lineTo(1325 + (progress * 10), hy - 14);
    }
    ctx.stroke();

    // Vegetação rasteira distante rascunhada (linhas pequenas de caneta nos vales)
    ctx.strokeStyle = penMid;
    ctx.lineWidth = 1.0;
    ctx.beginPath();
    const scrubPositions = [
      { x: 580, y: 290 }, { x: 620, y: 310 }, { x: 780, y: 320 },
      { x: 920, y: 310 }, { x: 1140, y: 300 }, { x: 1260, y: 320 },
      { x: 1540, y: 290 }, { x: 1720, y: 320 }, { x: 260, y: 330 }
    ];
    for (const s of scrubPositions) {
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(s.x + 8, s.y - 6);
      ctx.moveTo(s.x + 4, s.y);
      ctx.lineTo(s.x + 4, s.y - 8);
      ctx.moveTo(s.x + 8, s.y);
      ctx.lineTo(s.x + 14, s.y - 5);
    }
    ctx.stroke();

    // --- NÉVOA E BRUMA DE VALE (Cúmulos arredondados na base das montanhas como na referência) ---
    ctx.fillStyle = 'rgba(244, 236, 216, 0.88)';
    ctx.strokeStyle = 'rgba(10, 37, 112, 0.4)';
    ctx.lineWidth = 1.2;

    this.drawBillowingMistBank(ctx, 0, 330, w + 40, 70);

    ctx.restore();
  }

  // =========================================================================
  // BACKGROUND 03: SILHUETA DE CASTELOS E RUÍNAS (CAMADA 02/03)
  // Baseado na prancha de arte:
  // - Torres e bastiões desmoronados com ameias
  // - Andaimes de madeira medievais projetando-se das ruínas
  // - Muradas e arcos de pedra (aqueduto/ponte com blocos talhados)
  // - Rochedos escarpados com fendas e sombras densas
  // - Árvores secas e retorcidas brotando das rochas
  // - Névoa e bruma na base
  // =========================================================================
  private renderMonasteryCastlesToBuffer(canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const penDark = GAME_CONFIG.PALETTE.PEN_DARKEST;       // #051442
    const penMid = GAME_CONFIG.PALETTE.PEN_PRIMARY;         // #0A2570
    const penSecondary = GAME_CONFIG.PALETTE.PEN_SECONDARY; // #143D99
    const penHatching = GAME_CONFIG.PALETTE.PEN_HATCHING;

    ctx.save();

    // -----------------------------------------------------------------------
    // SEÇÃO 1: FORTALEZA GÓTICA E BASTIÕES DESMORONADOS (Lado Esquerdo, x: 80 - 640)
    // -----------------------------------------------------------------------
    const fortressBaseX = 120;
    const groundY = 380;

    // Rochedo escarpado sob o castelo (Fendas verticais e hachuras)
    ctx.fillStyle = 'rgba(236, 227, 206, 0.95)';
    ctx.strokeStyle = penDark;
    ctx.lineWidth = 2.0;

    ctx.beginPath();
    ctx.moveTo(fortressBaseX - 60, groundY + 140);
    ctx.lineTo(fortressBaseX - 30, groundY + 40);
    ctx.lineTo(fortressBaseX + 15, groundY - 40);
    ctx.lineTo(fortressBaseX + 80, groundY - 70);
    ctx.lineTo(fortressBaseX + 180, groundY - 95);
    ctx.lineTo(fortressBaseX + 280, groundY - 70);
    ctx.lineTo(fortressBaseX + 380, groundY - 20);
    ctx.lineTo(fortressBaseX + 480, groundY + 50);
    ctx.lineTo(fortressBaseX + 560, groundY + 140);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Fendas geológicas e hachuras profundas no rochedo
    ctx.beginPath();
    ctx.strokeStyle = penDark;
    ctx.lineWidth = 1.4;
    ctx.moveTo(fortressBaseX + 15, groundY - 40);
    ctx.lineTo(fortressBaseX + 25, groundY + 50);
    ctx.moveTo(fortressBaseX + 120, groundY - 50);
    ctx.lineTo(fortressBaseX + 105, groundY + 70);
    ctx.moveTo(fortressBaseX + 240, groundY - 55);
    ctx.lineTo(fortressBaseX + 260, groundY + 80);
    ctx.stroke();

    // Hachura cruzada escura nas encostas do rochedo
    ctx.strokeStyle = penHatching;
    ctx.lineWidth = 1.0;
    ctx.beginPath();
    for (let rx = fortressBaseX - 10; rx < fortressBaseX + 360; rx += 14) {
      ctx.moveTo(rx, groundY - 30);
      ctx.lineTo(rx - 25, groundY + 80);
    }
    for (let rx = fortressBaseX + 40; rx < fortressBaseX + 280; rx += 16) {
      ctx.moveTo(rx - 20, groundY + 10);
      ctx.lineTo(rx + 20, groundY + 70);
    }
    ctx.stroke();

    // --- EDIFICAÇÃO DO CASTELO: Torres, Ameias e Ruínas ---
    ctx.fillStyle = 'rgba(238, 230, 212, 0.95)';
    ctx.strokeStyle = penDark;
    ctx.lineWidth = 2.0;

    // Torre Principal / Donjon da Esquerda
    const t1X = fortressBaseX + 40;
    const t1Top = groundY - 210;
    ctx.beginPath();
    ctx.moveTo(t1X, groundY - 40);
    ctx.lineTo(t1X, t1Top);
    // Ameias detalhadas (crenellations)
    ctx.lineTo(t1X + 12, t1Top);
    ctx.lineTo(t1X + 12, t1Top + 14);
    ctx.lineTo(t1X + 24, t1Top + 14);
    ctx.lineTo(t1X + 24, t1Top);
    ctx.lineTo(t1X + 36, t1Top);
    ctx.lineTo(t1X + 36, t1Top + 14);
    ctx.lineTo(t1X + 48, t1Top + 14);
    ctx.lineTo(t1X + 48, t1Top);
    ctx.lineTo(t1X + 60, t1Top);
    ctx.lineTo(t1X + 60, groundY - 50);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Torre de Observação Central Ruída (Mais alta, com topo quebrado)
    const t2X = fortressBaseX + 130;
    const t2Top = groundY - 265;
    ctx.beginPath();
    ctx.moveTo(t2X, groundY - 70);
    ctx.lineTo(t2X, t2Top + 30);
    ctx.lineTo(t2X + 10, t2Top + 10);
    ctx.lineTo(t2X + 20, t2Top); // Pináculo quebrado
    ctx.lineTo(t2X + 35, t2Top + 18);
    ctx.lineTo(t2X + 50, t2Top + 8);
    ctx.lineTo(t2X + 65, t2Top + 35);
    ctx.lineTo(t2X + 75, groundY - 80);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Seteiras e janelas ogivais de caneta nas torres
    ctx.fillStyle = penDark;
    // Janela ogival na torre alta
    ctx.beginPath();
    ctx.moveTo(t2X + 30, t2Top + 60);
    ctx.lineTo(t2X + 44, t2Top + 60);
    ctx.lineTo(t2X + 44, t2Top + 85);
    ctx.lineTo(t2X + 30, t2Top + 85);
    ctx.closePath();
    ctx.fill();

    // Seteiras estreitas
    ctx.fillRect(t1X + 26, t1Top + 45, 6, 22);
    ctx.fillRect(t1X + 26, t1Top + 90, 6, 22);
    ctx.fillRect(t2X + 32, t2Top + 110, 8, 26);

    // ANDAIMES DE MADEIRA (Timber scaffolding conforme prancha de arte)
    ctx.strokeStyle = penDark;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    // Vigas horizontais e cruzetas de madeira projetadas para fora da torre
    ctx.moveTo(t1X - 18, t1Top + 70);
    ctx.lineTo(t1X + 25, t1Top + 70);
    ctx.moveTo(t1X - 14, t1Top + 50);
    ctx.lineTo(t1X - 14, t1Top + 130);
    ctx.moveTo(t1X - 14, t1Top + 70);
    ctx.lineTo(t1X, t1Top + 110);
    ctx.moveTo(t1X - 14, t1Top + 110);
    ctx.lineTo(t1X, t1Top + 70);

    // Andaimes na torre alta
    ctx.moveTo(t2X + 75, t2Top + 70);
    ctx.lineTo(t2X + 115, t2Top + 70);
    ctx.moveTo(t2X + 105, t2Top + 50);
    ctx.lineTo(t2X + 105, t2Top + 140);
    ctx.moveTo(t2X + 75, t2Top + 100);
    ctx.lineTo(t2X + 105, t2Top + 60);
    ctx.stroke();

    // Hachura de alvenaria e blocos de pedra nas torres
    ctx.strokeStyle = penHatching;
    ctx.lineWidth = 0.9;
    ctx.beginPath();
    for (let by = t1Top + 20; by < groundY - 50; by += 12) {
      ctx.moveTo(t1X + 4, by);
      ctx.lineTo(t1X + 56, by + 5);
    }
    for (let by = t2Top + 40; by < groundY - 70; by += 12) {
      ctx.moveTo(t2X + 6, by);
      ctx.lineTo(t2X + 70, by + 6);
    }
    ctx.stroke();

    // -----------------------------------------------------------------------
    // SEÇÃO 2: MURADAS E ARCOS DE PEDRA / AQUEDUTO (Centro-Direita, x: 520 - 980)
    // -----------------------------------------------------------------------
    const bridgeStartX = fortressBaseX + 360;
    const bridgeY = groundY - 10;

    // Grande Arco de Pedra Medieval (como destacado na prancha)
    ctx.fillStyle = 'rgba(238, 230, 212, 0.95)';
    ctx.strokeStyle = penDark;
    ctx.lineWidth = 2.0;

    // Arco de sustentação
    ctx.beginPath();
    ctx.moveTo(bridgeStartX, bridgeY);
    ctx.lineTo(bridgeStartX + 200, bridgeY + 30);
    ctx.lineTo(bridgeStartX + 200, bridgeY + 80);
    // Abertura do arco em semi-círculo perfeito com intradorso
    ctx.arc(bridgeStartX + 95, bridgeY + 80, 50, 0, Math.PI, true);
    ctx.lineTo(bridgeStartX, bridgeY + 70);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Blocos individuais talhados no arco (Voussoirs & Pedra-chave)
    ctx.strokeStyle = penDark;
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    for (let angle = 0; angle <= Math.PI; angle += Math.PI / 8) {
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      ctx.moveTo(bridgeStartX + 95 + cos * 50, bridgeY + 80 - sin * 50);
      ctx.lineTo(bridgeStartX + 95 + cos * 66, bridgeY + 80 - sin * 66);
    }
    ctx.stroke();

    // Murada quebrada estendendo-se com janelas ogivais vazadas
    ctx.beginPath();
    ctx.moveTo(bridgeStartX + 200, bridgeY + 30);
    ctx.lineTo(bridgeStartX + 320, bridgeY + 10);
    ctx.lineTo(bridgeStartX + 350, bridgeY + 40);
    ctx.lineTo(bridgeStartX + 380, bridgeY + 15);
    ctx.lineTo(bridgeStartX + 420, bridgeY + 80);
    ctx.lineTo(bridgeStartX + 200, bridgeY + 80);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Janelas ogivais vazadas na murada
    ctx.fillStyle = 'rgba(244, 236, 216, 0.9)';
    ctx.beginPath();
    ctx.arc(bridgeStartX + 260, bridgeY + 35, 14, Math.PI, 0, false);
    ctx.lineTo(bridgeStartX + 274, bridgeY + 65);
    ctx.lineTo(bridgeStartX + 246, bridgeY + 65);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // -----------------------------------------------------------------------
    // SEÇÃO 3: ROCHEDO DA DIREITA COM ÁRVORES SECAS RETORCIDAS (x: 1040 - 1500)
    // -----------------------------------------------------------------------
    const cliff2X = bridgeStartX + 440;
    ctx.fillStyle = 'rgba(236, 227, 206, 0.95)';
    ctx.strokeStyle = penDark;
    ctx.lineWidth = 2.0;

    ctx.beginPath();
    ctx.moveTo(cliff2X - 20, groundY + 90);
    ctx.lineTo(cliff2X + 40, groundY + 10);
    ctx.lineTo(cliff2X + 110, groundY - 30);
    ctx.lineTo(cliff2X + 220, groundY - 60);
    ctx.lineTo(cliff2X + 340, groundY + 30);
    ctx.lineTo(cliff2X + 440, groundY + 140);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Árvore Seca e Retorcida na Rocha (exatamente como na anotação da prancha)
    ctx.strokeStyle = penDark;
    ctx.lineWidth = 2.0;
    const treeX = cliff2X + 180;
    const treeY = groundY - 58;

    ctx.beginPath();
    ctx.moveTo(treeX, treeY);
    ctx.quadraticCurveTo(treeX + 10, treeY - 35, treeX + 25, treeY - 65);
    ctx.quadraticCurveTo(treeX + 30, treeY - 85, treeX + 45, treeY - 110);

    // Galhos secos e pontiagudos ramificados
    ctx.moveTo(treeX + 18, treeY - 45);
    ctx.lineTo(treeX - 15, treeY - 70);
    ctx.lineTo(treeX - 25, treeY - 95);
    ctx.moveTo(treeX - 5, treeY - 60);
    ctx.lineTo(treeX - 8, treeY - 85);

    ctx.moveTo(treeX + 32, treeY - 75);
    ctx.lineTo(treeX + 65, treeY - 90);
    ctx.lineTo(treeX + 85, treeY - 85);
    ctx.moveTo(treeX + 42, treeY - 95);
    ctx.lineTo(treeX + 38, treeY - 125);
    ctx.stroke();

    // Pequena segunda árvore morta inclinada
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(cliff2X + 90, groundY - 28);
    ctx.lineTo(cliff2X + 80, groundY - 60);
    ctx.lineTo(cliff2X + 65, groundY - 80);
    ctx.moveTo(cliff2X + 80, groundY - 50);
    ctx.lineTo(cliff2X + 95, groundY - 70);
    ctx.stroke();

    // -----------------------------------------------------------------------
    // SEÇÃO 4: SEGUNDO CASTELO RUÍDO PARA COMPLETAR O LOOP SEAMLESS (x: 1540 - 1920)
    // -----------------------------------------------------------------------
    const loopCastleX = 1660;
    ctx.fillStyle = 'rgba(238, 230, 212, 0.95)';
    ctx.strokeStyle = penDark;
    ctx.lineWidth = 1.8;

    ctx.beginPath();
    ctx.moveTo(loopCastleX, groundY + 60);
    ctx.lineTo(loopCastleX + 30, groundY - 120);
    ctx.lineTo(loopCastleX + 45, groundY - 120);
    ctx.lineTo(loopCastleX + 45, groundY - 105);
    ctx.lineTo(loopCastleX + 60, groundY - 105);
    ctx.lineTo(loopCastleX + 60, groundY - 120);
    ctx.lineTo(loopCastleX + 75, groundY - 120);
    ctx.lineTo(loopCastleX + 110, groundY - 70);
    ctx.lineTo(loopCastleX + 180, groundY - 50);
    ctx.lineTo(w, groundY + 140);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Hachuras nos bastiões finais
    ctx.strokeStyle = penHatching;
    ctx.lineWidth = 0.9;
    ctx.beginPath();
    for (let hy = groundY - 110; hy < groundY + 50; hy += 11) {
      ctx.moveTo(loopCastleX + 32, hy);
      ctx.lineTo(loopCastleX + 72, hy + 6);
    }
    ctx.stroke();

    // Névoa e Bruma volumosa na base dos castelos e arcos
    ctx.fillStyle = 'rgba(244, 236, 216, 0.92)';
    ctx.strokeStyle = 'rgba(10, 37, 112, 0.45)';
    ctx.lineWidth = 1.2;
    this.drawBillowingMistBank(ctx, 0, groundY + 40, w + 40, 80);

    ctx.restore();
  }

  // =========================================================================
  // BACKGROUND 04: NUVENS E NÉVOA (MÓVEL)
  // Baseado na prancha de arte:
  // - Nuvens sutis e estratificadas no céu alto
  // - Grande nuvem de tempestade/acúmulo central com volume e hachura pesada
  // - Névoa rasteira (VFX móvel)
  // =========================================================================
  private renderMonasteryCloudsToBuffer(canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    const penMid = GAME_CONFIG.PALETTE.PEN_PRIMARY;
    const penHatching = 'rgba(10, 37, 112, 0.38)';

    ctx.save();

    // 1. NUVENS MENORES E FOFAS (Dispersas pelo céu)
    const smallClouds = [
      { x: 120, y: 50, scale: 0.45, seed: 0 }, 
      { x: 380, y: 80, scale: 0.55, seed: 1 },
      { x: 780, y: 40, scale: 0.4, seed: 2 }, 
      { x: 1120, y: 60, scale: 0.5, seed: 3 },
      { x: 1580, y: 90, scale: 0.55, seed: 4 }, 
      { x: 90, y: 110, scale: 0.35, seed: 5 },
      { x: 1840, y: 75, scale: 0.65, seed: 6 }
    ];

    for (const c of smallClouds) {
      this.drawPenCloud(ctx, c.x, c.y, c.scale, penMid, penHatching, c.seed);
    }

    // 2. NUVENS GRANDES / ACÚMULO PRINCIPAL (Imponentes e bem desenhadas)
    const cumulusCenters = [
      { x: 740, y: 140, scale: 1.15, seed: 0 },
      { x: 1640, y: 155, scale: 0.85, seed: 1 },
      { x: 250, y: 165, scale: 0.75, seed: 2 }
    ];

    for (const c of cumulusCenters) {
      this.drawPenCloud(ctx, c.x, c.y, c.scale, penMid, penHatching, c.seed);
    }

    ctx.restore();
  }

  // Desenha uma nuvem redonda, fofa e bem definida à caneta
  private drawPenCloud(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    scale: number,
    penColor: string,
    hatchColor: string,
    seed: number
  ) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(scale, scale);

    ctx.fillStyle = 'rgba(246, 240, 224, 0.95)';
    ctx.strokeStyle = penColor;
    ctx.lineWidth = 1.8;

    // Define o traçado da nuvem fofa com curvas perfeitas
    const path = new Path2D();
    if (seed % 2 === 0) {
      // Nuvem volumosa tradicional (muito redonda)
      path.moveTo(-80, 10);
      path.bezierCurveTo(-120, -10, -100, -60, -50, -40);
      path.bezierCurveTo(-40, -90, 20, -90, 30, -45);
      path.bezierCurveTo(70, -100, 120, -50, 80, -15);
      path.bezierCurveTo(140, 0, 110, 60, 70, 45);
      path.bezierCurveTo(50, 85, -10, 85, -20, 50);
      path.bezierCurveTo(-60, 85, -110, 55, -80, 10);
      path.closePath();
    } else {
      // Nuvem alongada mas com cúpulas proeminentes e redondas
      path.moveTo(-110, 20);
      path.bezierCurveTo(-150, -10, -90, -60, -60, -35);
      path.bezierCurveTo(-40, -90, 40, -80, 50, -30);
      path.bezierCurveTo(90, -60, 140, -10, 100, 20);
      path.bezierCurveTo(130, 60, 70, 70, 50, 45);
      path.bezierCurveTo(20, 80, -40, 80, -50, 45);
      path.bezierCurveTo(-90, 70, -130, 50, -110, 20);
      path.closePath();
    }

    // Fundo preenchido
    ctx.fill(path);

    // Contorno principal desenhado multiplas vezes com offsets para dar efeito de caneta nanquim
    ctx.stroke(path);
    ctx.save();
    ctx.translate(1, 1);
    ctx.strokeStyle = 'rgba(10, 37, 112, 0.4)';
    ctx.lineWidth = 0.8;
    ctx.stroke(path);
    ctx.translate(-2, 0);
    ctx.stroke(path);
    ctx.restore();

    // Clip para as sombras (hachuras não saem da nuvem)
    ctx.save();
    ctx.clip(path);
    
    ctx.strokeStyle = hatchColor;
    ctx.lineWidth = 1.0;
    
    // Hachura de sombra principal (diagonal) nas bordas inferiores
    ctx.beginPath();
    for (let hx = -160; hx <= 160; hx += 7) {
      ctx.moveTo(hx, 10);
      ctx.lineTo(hx - 50, 90);
    }
    ctx.stroke();

    // Hachura cruzada nas partes mais fundas da sombra
    ctx.beginPath();
    for (let hx = -160; hx <= 160; hx += 9) {
      ctx.moveTo(hx, 35);
      ctx.lineTo(hx + 50, 90);
    }
    ctx.stroke();
    
    ctx.restore(); // Fim do clip

    // Volutas / linhas de contorno interno de caneta para enfatizar o volume e a redondeza
    ctx.strokeStyle = penColor;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    if (seed % 2 === 0) {
      ctx.arc(-20, -15, 25, Math.PI * 0.7, Math.PI * 1.5);
      ctx.arc(35, -5, 20, Math.PI * 0.8, Math.PI * 1.6);
      ctx.arc(-30, 20, 18, Math.PI * 1.1, Math.PI * 1.9);
      ctx.arc(40, 25, 22, Math.PI * 0.9, Math.PI * 1.8);
    } else {
      ctx.arc(-30, -10, 30, Math.PI * 0.8, Math.PI * 1.4);
      ctx.arc(40, 0, 25, Math.PI * 0.7, Math.PI * 1.7);
      ctx.arc(10, 25, 22, Math.PI * 1.0, Math.PI * 1.9);
      ctx.arc(-40, 30, 16, Math.PI * 1.2, Math.PI * 1.9);
    }
    ctx.stroke();

    ctx.restore();
  }

  // Desenha bancos de névoa ondulada e fofa (bruma de vale)
  private drawBillowingMistBank(
    ctx: CanvasRenderingContext2D,
    startX: number,
    baseY: number,
    length: number,
    height: number
  ) {
    ctx.beginPath();
    ctx.moveTo(startX, baseY + height);

    const step = 45;
    for (let x = startX; x <= startX + length; x += step) {
      const puffR = 26 + ((x * 7) % 18);
      const puffH = baseY + Math.sin(x * 0.015) * 8;
      ctx.quadraticCurveTo(x + step * 0.5, puffH - puffR * 0.6, x + step, puffH);
    }
    ctx.lineTo(startX + length, baseY + height + 60);
    ctx.lineTo(startX, baseY + height + 60);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Linhas de filamento de bruma interna
    ctx.strokeStyle = 'rgba(20, 61, 153, 0.25)';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    for (let x = startX + 15; x < startX + length - 20; x += 55) {
      const my = baseY + 18 + ((x * 13) % 15);
      ctx.moveTo(x, my);
      ctx.quadraticCurveTo(x + 25, my - 6, x + 45, my);
    }
    ctx.stroke();
  }

  // =========================================================================
  // CAMADAS DA FLORESTA CORROMPIDA
  // =========================================================================
  private renderForestDistantToBuffer(canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const penLight = GAME_CONFIG.PALETTE.PEN_LIGHT;
    ctx.save();
    ctx.strokeStyle = 'rgba(37, 90, 196, 0.4)';
    ctx.fillStyle = 'rgba(230, 222, 198, 0.6)';
    ctx.lineWidth = 1.2;

    ctx.beginPath();
    ctx.moveTo(0, 380);
    for (let x = 0; x <= w; x += 40) {
      const treeH = 50 + ((x * 17) % 45);
      ctx.lineTo(x + 10, 320 - treeH);
      ctx.lineTo(x + 20, 320 - treeH + 15);
      ctx.lineTo(x + 30, 320 - treeH - 8);
      ctx.lineTo(x + 40, 340);
    }
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  private renderForestMidToBuffer(canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const penDark = GAME_CONFIG.PALETTE.PEN_DARKEST;
    ctx.save();
    ctx.strokeStyle = penDark;
    ctx.lineWidth = 2.0;

    // Árvores retorcidas colossais
    const treePoints = [240, 680, 1140, 1620];
    for (const tx of treePoints) {
      ctx.beginPath();
      ctx.moveTo(tx - 25, 480);
      ctx.quadraticCurveTo(tx - 40, 340, tx - 70, 210);
      ctx.lineTo(tx - 45, 210);
      ctx.quadraticCurveTo(tx - 15, 330, tx + 20, 480);
      ctx.stroke();

      // Galhos espinhosos
      ctx.beginPath();
      ctx.moveTo(tx - 45, 270);
      ctx.lineTo(tx + 50, 230);
      ctx.lineTo(tx + 90, 245);
      ctx.moveTo(tx - 60, 240);
      ctx.lineTo(tx - 130, 190);
      ctx.lineTo(tx - 155, 215);
      ctx.stroke();
    }
    ctx.restore();
  }

  // =========================================================================
  // CAMADAS DA CRIPTA ESQUECIDA
  // =========================================================================
  private renderCryptVaultsToBuffer(canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    ctx.save();
    ctx.strokeStyle = 'rgba(37, 90, 196, 0.4)';
    ctx.lineWidth = 1.4;

    // Abóbadas góticas profundas em perspectiva
    for (let x = 0; x < w; x += 180) {
      ctx.beginPath();
      ctx.arc(x + 90, 240, 85, Math.PI, 0, false);
      ctx.stroke();
      // Nervuras das abóbadas
      ctx.beginPath();
      ctx.moveTo(x + 90, 155);
      ctx.lineTo(x + 90, 240);
      ctx.stroke();
    }
    ctx.restore();
  }

  private renderCryptPillarsToBuffer(canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const penDark = GAME_CONFIG.PALETTE.PEN_DARKEST;
    ctx.save();
    ctx.fillStyle = 'rgba(238, 230, 212, 0.95)';
    ctx.strokeStyle = penDark;
    ctx.lineWidth = 2.2;

    for (let px = 140; px < w; px += 360) {
      // Pilar de sustentação com capitel românico
      ctx.fillRect(px, 120, 54, 380);
      ctx.strokeRect(px, 120, 54, 380);

      // Capitel e base
      ctx.strokeRect(px - 10, 120, 74, 18);
      ctx.strokeRect(px - 12, 470, 78, 24);

      // Correntes e argolas de ferro penduradas
      ctx.strokeStyle = penDark;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      for (let cy = 180; cy < 280; cy += 14) {
        ctx.strokeRect(px + 22, cy, 10, 12);
      }
    }
    ctx.restore();
  }

  // =========================================================================
  // LOOP PRINCIPAL DE RENDERIZAÇÃO DE FUNDO EM TEMPO REAL
  // Chamado a cada frame pelo PenRenderer
  // =========================================================================
  public render(
    ctx: CanvasRenderingContext2D,
    cameraX: number,
    cameraY: number,
    theme: BiomeTheme = 'MONASTERY',
    dt: number = 0.016
  ): void {
    const w = GAME_CONFIG.CANVAS_WIDTH;
    const h = GAME_CONFIG.CANVAS_HEIGHT;
    this.animTimer += dt;

    // 1. Papel base pergaminho
    ctx.fillStyle = GAME_CONFIG.PALETTE.PAPER_BG;
    ctx.fillRect(0, 0, w, h);

    // 2. Pautas azuis sutis de caderno pautado
    ctx.save();
    ctx.strokeStyle = GAME_CONFIG.PALETTE.NOTEBOOK_LINE;
    ctx.lineWidth = 1;
    const lineSpacing = 28;
    const offsetY = (-(cameraY * 0.2)) % lineSpacing;
    for (let y = offsetY; y < h; y += lineSpacing) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Margem vermelha clássica de folha de caderno escolar/grimório
    const marginX = 72 - (cameraX * 0.05);
    if (marginX > 0 && marginX < w) {
      ctx.strokeStyle = GAME_CONFIG.PALETTE.MARGIN_LINE;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(marginX, 0);
      ctx.lineTo(marginX, h);
      ctx.stroke();
    }
    ctx.restore();

    // 3. Renderiza Camadas de Parallax Específicas do Bioma
    if (theme === 'MONASTERY') {
      this.renderMonasteryBiome(ctx, cameraX, cameraY);
    } else if (theme === 'FOREST') {
      this.renderForestBiome(ctx, cameraX, cameraY);
    } else if (theme === 'CRYPT') {
      this.renderCryptBiome(ctx, cameraX, cameraY);
    }

    // 4. Partículas e Bruma Atmosférica Móvel (VFX MÓVEL - Prancha 04)
    this.renderAtmosphericVFX(ctx, cameraX, dt);
  }

  // Renderiza Parallax do Mosteiro / Montanhas / Castelos / Nuvens
  private renderMonasteryBiome(ctx: CanvasRenderingContext2D, cameraX: number, cameraY: number) {
    const w = GAME_CONFIG.CANVAS_WIDTH;
    
    ctx.save();
    // Multiplica o fundo branco dos JPEGs com a cor do papel, deixando o papel visível e os traços escuros
    ctx.globalCompositeOperation = 'multiply';

    // CAMADA 1: Nuvens e Acúmulos de Chuva (Background 04)
    // Parallax suave + deriva contínua lenta do vento
    if (this.monasteryCloudsBuffer) {
      const cloudFactor = 0.06;
      const windDrift = this.animTimer * 12; // Vento suave soprando as nuvens
      const cloudOffset = ((cameraX * cloudFactor + windDrift) % this.loopWidth + this.loopWidth) % this.loopWidth;
      ctx.drawImage(this.monasteryCloudsBuffer, -cloudOffset, 0);
      ctx.drawImage(this.monasteryCloudsBuffer, -cloudOffset + this.loopWidth, 0);
      if (-cloudOffset + this.loopWidth < w) {
        ctx.drawImage(this.monasteryCloudsBuffer, -cloudOffset + this.loopWidth * 2, 0);
      }
    }

    // CAMADA 1.5: Montanhas Fundo 1 (Atrás das montanhas principais)
    // Parallax mais lento (0.08x)
    if (this.monasteryMountainsBackBuffer) {
      const mountainBackFactor = 0.08;
      const mountainBackOffset = ((cameraX * mountainBackFactor) % this.loopWidth + this.loopWidth) % this.loopWidth;
      ctx.drawImage(this.monasteryMountainsBackBuffer, -mountainBackOffset, 0);
      ctx.drawImage(this.monasteryMountainsBackBuffer, -mountainBackOffset + this.loopWidth, 0);
      if (-mountainBackOffset + this.loopWidth < w) {
        ctx.drawImage(this.monasteryMountainsBackBuffer, -mountainBackOffset + this.loopWidth * 2, 0);
      }
    }

    // CAMADA 2: Montanhas Distantes com Hachuras e Vales (Background 02)
    // Parallax clássico distante (0.12x)
    if (this.monasteryMountainsBuffer) {
      const mountainFactor = 0.12;
      const mountainOffset = ((cameraX * mountainFactor) % this.loopWidth + this.loopWidth) % this.loopWidth;
      ctx.drawImage(this.monasteryMountainsBuffer, -mountainOffset, 0);
      ctx.drawImage(this.monasteryMountainsBuffer, -mountainOffset + this.loopWidth, 0);
      if (-mountainOffset + this.loopWidth < w) {
        ctx.drawImage(this.monasteryMountainsBuffer, -mountainOffset + this.loopWidth * 2, 0);
      }
    }
    
    ctx.restore();

    // CAMADA 2.5: Pátio / Cidade Arruinada (Desenha DEPOIS do multiply e montanhas)
    // Parallax intermediário (0.20x)
    if (this.monasteryCourtyardBuffer) {
      const courtyardFactor = 0.20;
      const courtyardOffset = ((cameraX * courtyardFactor) % this.loopWidth + this.loopWidth) % this.loopWidth;
      ctx.drawImage(this.monasteryCourtyardBuffer, -courtyardOffset, 0);
      ctx.drawImage(this.monasteryCourtyardBuffer, -courtyardOffset + this.loopWidth, 0);
      if (-courtyardOffset + this.loopWidth < w) {
        ctx.drawImage(this.monasteryCourtyardBuffer, -courtyardOffset + this.loopWidth * 2, 0);
      }
    }

    // CAMADA 4: Névoa Rasteira Dinâmica (VFX Móvel - Prancha 04)
    // Ondulação de rolos de pergaminho em tempo real cobrindo a base do cenário
    this.renderLowGroundMist(ctx, cameraX);
  }

  // Renderiza Parallax da Floresta Corrompida
  private renderForestBiome(ctx: CanvasRenderingContext2D, cameraX: number, cameraY: number) {
    const w = GAME_CONFIG.CANVAS_WIDTH;
    if (this.forestDistantBuffer) {
      const factor = 0.14;
      const offset = ((cameraX * factor) % this.loopWidth + this.loopWidth) % this.loopWidth;
      ctx.drawImage(this.forestDistantBuffer, -offset, 0);
      ctx.drawImage(this.forestDistantBuffer, -offset + this.loopWidth, 0);
      if (-offset + this.loopWidth < w) {
        ctx.drawImage(this.forestDistantBuffer, -offset + this.loopWidth * 2, 0);
      }
    }

    if (this.forestMidBuffer) {
      const factor = 0.28;
      const offset = ((cameraX * factor) % this.loopWidth + this.loopWidth) % this.loopWidth;
      ctx.drawImage(this.forestMidBuffer, -offset, 0);
      ctx.drawImage(this.forestMidBuffer, -offset + this.loopWidth, 0);
      if (-offset + this.loopWidth < w) {
        ctx.drawImage(this.forestMidBuffer, -offset + this.loopWidth * 2, 0);
      }
    }
  }

  // Renderiza Parallax da Cripta Esquecida
  private renderCryptBiome(ctx: CanvasRenderingContext2D, cameraX: number, cameraY: number) {
    const w = GAME_CONFIG.CANVAS_WIDTH;
    if (this.cryptVaultsBuffer) {
      const factor = 0.16;
      const offset = ((cameraX * factor) % this.loopWidth + this.loopWidth) % this.loopWidth;
      ctx.drawImage(this.cryptVaultsBuffer, -offset, 0);
      ctx.drawImage(this.cryptVaultsBuffer, -offset + this.loopWidth, 0);
      if (-offset + this.loopWidth < w) {
        ctx.drawImage(this.cryptVaultsBuffer, -offset + this.loopWidth * 2, 0);
      }
    }

    if (this.cryptPillarsBuffer) {
      const factor = 0.32;
      const offset = ((cameraX * factor) % this.loopWidth + this.loopWidth) % this.loopWidth;
      ctx.drawImage(this.cryptPillarsBuffer, -offset, 0);
      ctx.drawImage(this.cryptPillarsBuffer, -offset + this.loopWidth, 0);
      if (-offset + this.loopWidth < w) {
        ctx.drawImage(this.cryptPillarsBuffer, -offset + this.loopWidth * 2, 0);
      }
    }
  }

  // Névoa Rasteira Dinâmica (VFX Móvel - Prancha 04)
  private renderLowGroundMist(ctx: CanvasRenderingContext2D, cameraX: number) {
    ctx.save();
    const w = GAME_CONFIG.CANVAS_WIDTH;
    const baseY = 460;
    const time = this.animTimer * 1.8;
    const mistFactor = 0.38;
    const mistOffset = -(cameraX * mistFactor);

    ctx.fillStyle = 'rgba(244, 236, 216, 0.55)';
    ctx.strokeStyle = 'rgba(20, 61, 153, 0.35)';
    ctx.lineWidth = 1.0;

    ctx.beginPath();
    ctx.moveTo(0, baseY + 80);

    const step = 60;
    for (let x = 0; x <= w + step; x += step) {
      const wave = Math.sin((x + mistOffset) * 0.012 + time) * 14;
      const wave2 = Math.cos((x + mistOffset) * 0.024 - time * 0.8) * 8;
      const py = baseY + wave + wave2;
      ctx.quadraticCurveTo(x - step * 0.5, py - 10, x, py);
    }
    ctx.lineTo(w, 540);
    ctx.lineTo(0, 540);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Rolo de fumaça / voluta de névoa de caneta
    ctx.strokeStyle = 'rgba(10, 37, 112, 0.3)';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    for (let x = 40; x < w; x += 140) {
      const vx = x + ((mistOffset * 0.5) % 140);
      const vy = baseY + 15 + Math.sin(time + x) * 6;
      ctx.arc(vx, vy, 16, Math.PI * 0.2, Math.PI * 1.2);
    }
    ctx.stroke();

    ctx.restore();
  }

  // Partículas e Bruma Atmosférica Móvel (Prancha 04)
  private renderAtmosphericVFX(ctx: CanvasRenderingContext2D, cameraX: number, dt: number) {
    ctx.save();
    const w = GAME_CONFIG.CANVAS_WIDTH;
    const h = GAME_CONFIG.CANVAS_HEIGHT;

    for (const p of this.atmosphericParticles) {
      // Movimento do vento e leve flutuação vertical
      p.x += p.vx * dt;
      p.y += p.vy * dt + Math.sin(this.animTimer * 2 + p.pulsePhase) * 0.4;

      // Wrap horizontal e vertical
      if (p.x > w + 20) p.x = -20;
      if (p.x < -20) p.x = w + 20;
      if (p.y > h + 10) p.y = -10;
      if (p.y < -10) p.y = h + 10;

      const alphaPulse = p.alpha * (0.8 + Math.sin(this.animTimer * 3 + p.pulsePhase) * 0.2);

      if (p.type === 'ink_speck') {
        // Ponto de tinta / poeira de carvão suspensa
        ctx.fillStyle = `rgba(10, 37, 112, ${alphaPulse * 0.7})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 0.7, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Bruma / halo luminoso de vapor d'água
        ctx.fillStyle = `rgba(255, 251, 235, ${alphaPulse * 0.9})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = `rgba(37, 90, 196, ${alphaPulse * 0.3})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
    }

    ctx.restore();
  }
}
