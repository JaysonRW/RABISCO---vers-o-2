/**
 * O Cavaleiro Arruinado - PenRenderer
 * Motor de Renderização Estilo Caneta Esferográfica sobre Papel Pergaminho
 */

import { GAME_CONFIG } from '../config';
import { AscensionStats, DamageType, Direction, FloatingText, Particle, PlayerState, SoulOrb } from '../types';
import { BiomeTheme } from '../world/Section';
import { ParallaxBackgroundSystem } from './ParallaxBackgroundSystem';
import { AssetLoader } from '../utils/AssetLoader';

export class PenRenderer {
  private noiseCanvas: HTMLCanvasElement | null = null;
  private backgroundSystem: ParallaxBackgroundSystem = new ParallaxBackgroundSystem();
  private treesSprite: HTMLCanvasElement | null = null;
  private patioGroundBuffer: HTMLCanvasElement | null = null;

  constructor() {
    this.createNoisePattern();
    this.loadTreesSprite();
    this.loadPatioGround();
    this.loadPlatformImages();
    this.loadLordeCarmimImg();
  }


  private lordeCarmimImg: HTMLImageElement | null = null;
  private loadLordeCarmimImg() {
    if (typeof window === 'undefined') return;
    const img = new Image();
    img.src = '/lord1.png';
    img.onload = () => {
      this.lordeCarmimImg = img;
    };
  }

  private loadPlatformImages() {
    if (typeof window === 'undefined') return;
    AssetLoader.loadImage('/plataforma4.png').catch(err => {
      console.error('Failed to load plataforma4.png', err);
    });
    AssetLoader.loadImage('/plataforma5.png').catch(err => {
      console.error('Failed to load plataforma5.png', err);
    });
    AssetLoader.loadImage('/plataforma6.png').catch(err => {
      console.error('Failed to load plataforma6.png', err);
    });
  }

  private loadPatioGround() {
    if (typeof window === 'undefined') return;
    const img = new Image();
    img.src = '/chão_patio_1.jpeg';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;
      ctx.drawImage(img, 0, 0);
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;
      
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i+1];
        const b = data[i+2];
        if (r > 200 && g > 200 && b > 200) {
          data[i+3] = 0; 
        }
      }
      ctx.putImageData(imgData, 0, 0);
      this.patioGroundBuffer = canvas;
    };
  }

  private loadTreesSprite() {
    if (typeof window === 'undefined') return;
    const img = new Image();
    img.src = '/trees.png';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;
      ctx.drawImage(img, 0, 0);
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;
      
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i+1];
        const b = data[i+2];
        const luma = r * 0.299 + g * 0.587 + b * 0.114;
        
        // Remove totalmente fundos brancos/muito claros
        if (luma > 240) {
          data[i+3] = 0; 
        } else {
          // Ajusta a transparência gradualmente para as bordas não ficarem serrilhadas (anti-aliasing)
          const alpha = 255 - luma;
          data[i+3] = Math.min(255, alpha * 1.6);
        }
      }
      ctx.putImageData(imgData, 0, 0);
      this.treesSprite = canvas;
    };
  }

  // Gera textura procedural de papel/grão para o pós-processamento
  private createNoisePattern() {
    if (typeof document === 'undefined') return;
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const imgData = ctx.createImageData(128, 128);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * 26;
      data[i] = 120 + noise;     // R
      data[i + 1] = 110 + noise; // G
      data[i + 2] = 90 + noise;  // B
      data[i + 3] = 22;          // Alpha sutil
    }
    ctx.putImageData(imgData, 0, 0);
    this.noiseCanvas = canvas;
  }

  // Desenha o fundo de caderno/pergaminho e parallax com os backgrounds conceituais
  public renderBackground(
    ctx: CanvasRenderingContext2D,
    cameraX: number,
    cameraY: number,
    theme: BiomeTheme = 'MONASTERY',
    dt: number = 0.016
  ) {
    this.backgroundSystem.render(ctx, cameraX, cameraY, theme, dt);
  }

  // Camada 1: Montanhas ao longe em hachura de caneta azul
  private renderParallaxMountains(ctx: CanvasRenderingContext2D, cameraX: number) {
    ctx.save();
    const parallaxFactor = 0.12;
    const baseOffsetX = -(cameraX * parallaxFactor);
    const loopW = 800;
    const baseY = 360;

    ctx.strokeStyle = GAME_CONFIG.PALETTE.PEN_LIGHT;
    ctx.lineWidth = 1.2;
    ctx.fillStyle = 'rgba(235, 227, 206, 0.45)';

    for (let i = -1; i <= 2; i++) {
      const startX = (i * loopW) + (baseOffsetX % loopW);

      ctx.beginPath();
      ctx.moveTo(startX, baseY + 80);
      ctx.lineTo(startX + 80, baseY - 50);
      ctx.lineTo(startX + 180, baseY + 10);
      ctx.lineTo(startX + 270, baseY - 90);
      ctx.lineTo(startX + 360, baseY - 20);
      ctx.lineTo(startX + 480, baseY - 120);
      ctx.lineTo(startX + 600, baseY - 10);
      ctx.lineTo(startX + 720, baseY - 70);
      ctx.lineTo(startX + loopW, baseY + 80);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Hachuras diagonais de caneta nas encostas
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(37, 90, 196, 0.28)';
      ctx.lineWidth = 0.8;
      for (let hx = startX + 270; hx < startX + 480; hx += 12) {
        ctx.moveTo(hx, baseY - 40);
        ctx.lineTo(hx - 20, baseY + 40);
      }
      ctx.stroke();
    }
    ctx.restore();
  }

  // Camada 2: Ruínas de Castelo com ameias e arcos em ruínas
  private renderParallaxCastles(ctx: CanvasRenderingContext2D, cameraX: number) {
    ctx.save();
    const parallaxFactor = 0.28;
    const baseOffsetX = -(cameraX * parallaxFactor);
    const loopW = 900;
    const baseY = 370;

    ctx.strokeStyle = GAME_CONFIG.PALETTE.PEN_SECONDARY;
    ctx.lineWidth = 1.4;
    ctx.fillStyle = 'rgba(230, 220, 195, 0.65)';

    for (let i = -1; i <= 2; i++) {
      const startX = (i * loopW) + (baseOffsetX % loopW);

      ctx.beginPath();
      // Torre esquerda desmoronada
      ctx.moveTo(startX + 40, baseY + 40);
      ctx.lineTo(startX + 40, baseY - 90);
      ctx.lineTo(startX + 55, baseY - 90);
      ctx.lineTo(startX + 55, baseY - 110);
      ctx.lineTo(startX + 70, baseY - 110);
      ctx.lineTo(startX + 70, baseY - 95);
      ctx.lineTo(startX + 85, baseY - 95);
      ctx.lineTo(startX + 85, baseY - 110);
      ctx.lineTo(startX + 100, baseY - 110);
      ctx.lineTo(startX + 100, baseY - 70);

      // Muralha intermediária e arco quebrado
      ctx.lineTo(startX + 160, baseY - 50);
      ctx.lineTo(startX + 175, baseY - 75);
      ctx.lineTo(startX + 210, baseY - 75);
      ctx.lineTo(startX + 230, baseY - 35);

      // Torre central alta em ruínas
      ctx.lineTo(startX + 270, baseY - 35);
      ctx.lineTo(startX + 270, baseY - 140);
      ctx.lineTo(startX + 285, baseY - 140);
      ctx.lineTo(startX + 285, baseY - 125);
      ctx.lineTo(startX + 300, baseY - 125);
      ctx.lineTo(startX + 300, baseY - 145);
      ctx.lineTo(startX + 320, baseY - 145);
      ctx.lineTo(startX + 325, baseY - 100);
      ctx.lineTo(startX + 360, baseY - 40);

      // Arco de pedra antigo
      ctx.lineTo(startX + 420, baseY - 40);
      ctx.lineTo(startX + 460, baseY + 40);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Hachuras cruzadas de tijolos de caneta
      ctx.strokeStyle = GAME_CONFIG.PALETTE.PEN_HATCHING;
      ctx.lineWidth = 0.9;
      ctx.beginPath();
      for (let ty = baseY - 120; ty < baseY + 20; ty += 10) {
        ctx.moveTo(startX + 275, ty);
        ctx.lineTo(startX + 315, ty + 12);
      }
      ctx.stroke();
    }
    ctx.restore();
  }

  // Camada 3: Nuvens e bruma rasteira animada com hachuras de caneta
  private renderParallaxClouds(ctx: CanvasRenderingContext2D, cameraX: number) {
    ctx.save();
    const time = Date.now() * 0.0008;
    const baseOffsetX = -(cameraX * 0.18) + (time * 15);
    const loopW = 750;

    ctx.strokeStyle = 'rgba(20, 61, 153, 0.35)';
    ctx.lineWidth = 1;

    for (let i = -1; i <= 2; i++) {
      const cx = (i * loopW) + (baseOffsetX % loopW) + 200;
      const cy = 110 + Math.sin(time + i) * 6;

      ctx.beginPath();
      // Silhueta de nuvem em curvas manuais
      ctx.arc(cx, cy, 26, Math.PI, Math.PI * 1.8);
      ctx.arc(cx + 34, cy - 14, 32, Math.PI * 1.1, Math.PI * 2);
      ctx.arc(cx + 74, cy - 4, 28, Math.PI * 1.3, Math.PI * 0.2);
      ctx.arc(cx + 50, cy + 18, 30, 0, Math.PI * 0.9);
      ctx.arc(cx + 10, cy + 15, 24, Math.PI * 0.4, Math.PI);
      ctx.stroke();

      // Hachura de sombra na parte inferior da nuvem
      ctx.beginPath();
      for (let hx = cx - 10; hx < cx + 70; hx += 8) {
        ctx.moveTo(hx, cy + 6);
        ctx.lineTo(hx - 8, cy + 24);
      }
      ctx.stroke();
    }
    ctx.restore();
  }

  // Renderiza blocos de terreno e plataformas com raízes, pedras e hachuras
  public renderPlatform(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    type: 'GROUND' | 'FLOATING' | 'WOOD' = 'GROUND'
  ) {
    ctx.save();

    // Cor interna sólida para ocultar o fundo (somente se não tivermos a imagem da plataforma)
    const isAlt = Math.floor((x + y) / 10) % 2 === 0;
    const platformImage = AssetLoader.getImage(isAlt ? '/plataforma5.png' : '/plataforma4.png');
    const woodImage = AssetLoader.getImage('/plataforma6.png');
    
    const hasFloatingImage = (type === 'FLOATING' && !!platformImage);
    const hasWoodImage = (type === 'WOOD' && !!woodImage);
    
    if (!hasFloatingImage && !hasWoodImage) {
      ctx.fillStyle = GAME_CONFIG.PALETTE.PAPER_BG;
      ctx.fillRect(x, y, w, h);
    }

    const penPrimary = GAME_CONFIG.PALETTE.PEN_PRIMARY;
    const penDarkest = GAME_CONFIG.PALETTE.PEN_DARKEST;
    const penHatching = GAME_CONFIG.PALETTE.PEN_HATCHING;

    if (type === 'FLOATING') {
      const isAlt = Math.floor((x + y) / 10) % 2 === 0;
      const buffer = AssetLoader.getImage(isAlt ? '/plataforma5.png' : '/plataforma4.png');

      if (buffer) {
        ctx.save();
        ctx.globalCompositeOperation = 'source-over';
        
        const imgW = buffer.naturalWidth || buffer.width;
        const imgH = buffer.naturalHeight || buffer.height;
        
        const imageAspectRatio = imgW / imgH;
        
        // A largura da imagem desenhada deve ser igual à largura física da plataforma (platform.width).
        const drawW = w;
        // A altura deve ser calculada dinamicamente para manter o aspect ratio original da imagem.
        const drawH = drawW / imageAspectRatio;
        
        // Deslocamento visual (offset) vertical
        // Puxa a imagem um pouco para cima para que os pés do personagem (física) encostem perfeitamente na textura
        const PLATFORM_VISUAL_Y_OFFSET = -12;
        
        // A coordenada Y do topo da imagem alinha com a área de colisão + offset,
        // permitindo que a base do desenho fique 'pendurada' para baixo da área de colisão.
        ctx.drawImage(buffer, x, y + PLATFORM_VISUAL_Y_OFFSET, drawW, drawH);
        
        ctx.restore();
      } else {
        // Fallback enquanto a imagem não carrega
        ctx.strokeStyle = penPrimary;
        ctx.lineWidth = 2.0;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + w, y);
        ctx.lineTo(x + w, y + h);
        ctx.lineTo(x, y + h);
        ctx.closePath();
        ctx.stroke();
      }
    } else {
      // GROUND e WOOD
      if (type === 'GROUND' && this.patioGroundBuffer) {
        ctx.save();
        ctx.beginPath();
        ctx.rect(x, y, w, h);
        ctx.clip();
        
        const imgW = this.patioGroundBuffer.width;
        const imgH = this.patioGroundBuffer.height;
        
        // Mantém a proporção da imagem
        const drawH = 200;
        const drawW = drawH * (imgW / imgH);
        
        // Y deslocado para cima. Precisamos que a base da grama da imagem (a borda superior desenhada)
        // toque a linha do chão Y. Como a imagem parece ter muito céu/branco no topo, 
        // vamos desenhar a imagem "subindo" (com offset negativo) para a parte desenhada tocar o Y
        const yOffset = -70; 
        
        // Repetição horizontal lado a lado
        for (let ix = x; ix < x + w; ix += drawW) {
          ctx.drawImage(this.patioGroundBuffer, ix, y + yOffset, drawW, drawH);
        }
        
        // Preenchimento para baixo: Truque para preencher com hachuras 
        // caso a plataforma seja mais funda que a imagem da IA
        const hatchStartY = y + yOffset + drawH - 15; // Sobreposição leve para fundir
        if (hatchStartY < y + h) {
          ctx.save();
          ctx.beginPath();
          ctx.rect(x, hatchStartY, w, (y + h) - hatchStartY);
          ctx.clip();

          ctx.beginPath();
          ctx.strokeStyle = penHatching;
          ctx.lineWidth = 1;
          const hatchStep = 12;

          for (let d = x; d < x + w + h; d += hatchStep) {
            if (Math.sin(d * 11) > 0.6) continue;
            
            const x1 = Math.max(x, d - h);
            const y1 = Math.min(y + h, y + (d - x));
            const x2 = Math.min(x + w, d);
            const y2 = Math.max(y, y + (d - (x + w)));
            if (x1 < x + w && y1 > y) {
              ctx.moveTo(x1, y1);
              ctx.lineTo(x2, y2);
            }
          }
          ctx.stroke();
          ctx.restore();
        }
        
        ctx.restore();
        
        // Contorno superior simples para demarcar o limite físico
        ctx.strokeStyle = penPrimary;
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + w, y);
        ctx.stroke();
      } else if (hasWoodImage && woodImage) {
        ctx.save();
        ctx.globalCompositeOperation = 'source-over';
        
        const imgW = woodImage.naturalWidth || woodImage.width;
        const imgH = woodImage.naturalHeight || woodImage.height;
        
        const imageAspectRatio = imgW / imgH;
        const drawW = w;
        const drawH = drawW / imageAspectRatio;
        
        const PLATFORM_VISUAL_Y_OFFSET = -12;
        ctx.drawImage(woodImage, x, y + PLATFORM_VISUAL_Y_OFFSET, drawW, drawH);
        
        ctx.restore();
      } else {
        // Fallback procedural (se a imagem não carregar)
        // Contorno principal
        ctx.strokeStyle = penPrimary;
        ctx.lineWidth = 2.4;
        ctx.lineJoin = 'miter';
        ctx.strokeRect(x, y, w, h);

        // Linha superior com grama em manchas (patches) e falhas (bare spots)
        ctx.beginPath();
        ctx.strokeStyle = penDarkest;
        ctx.lineWidth = 2;
        
        for (let gx = x + 4; gx < x + w - 4; gx += 5) {
          // Lógica pseudo-aleatória orgânica para distribuição de grama
          const noise = Math.sin(gx * 0.08) + Math.cos(gx * 0.03);
          
          if (noise > 0.3) {
            // Manchas densas de grama
            const bladeH = 5 + Math.abs(Math.sin(gx * 17)) * 8;
            ctx.moveTo(gx, y);
            ctx.quadraticCurveTo(gx - 2, y - bladeH/2, gx - 4, y - bladeH);
          } else if (noise < -0.6 && (gx % 15) < 5) {
            // Pedrinhas / solo exposto
            ctx.moveTo(gx, y);
            ctx.arc(gx + 2, y, 1.5, Math.PI, 0);
          }
        }
        ctx.stroke();

        // Hachura densa de terra/pedra (cross-hatching) com falhas rústicas
        ctx.beginPath();
        ctx.strokeStyle = penHatching;
        ctx.lineWidth = 1;
        const hatchStep = 12;

        for (let d = x; d < x + w + h; d += hatchStep) {
          // Pula algumas linhas para criar imperfeições na textura da terra
          if (Math.sin(d * 11) > 0.6) continue;
          
          const x1 = Math.max(x, d - h);
          const y1 = Math.min(y + h, y + (d - x));
          const x2 = Math.min(x + w, d);
          const y2 = Math.max(y, y + (d - (x + w)));
          if (x1 < x + w && y1 > y) {
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
          }
        }
        ctx.stroke();
      }
    }

    ctx.restore();
  }

  // Renderiza uma única árvore de primeiro plano ancorada no mundo
  public renderForegroundTrees(ctx: CanvasRenderingContext2D, sectionId: string, time: number = 0) {
    if (!this.treesSprite) return;

    // Somente renderizar no primeiro cenário
    if (sectionId !== 'monastery_courtyard') return;

    ctx.save();
    
    // Posição no mundo exata (onde o personagem pisa)
    const worldX = 650; // Posição fixa
    const worldY = 440; // Altura exata da plataforma GROUND (ver Section.ts)
    
    const frameIndex = 0; // Pega a primeira árvore do seu sprite
    const spriteW = this.treesSprite.width / 5;
    const spriteH = this.treesSprite.height;
    
    // Escala muito mais contida e proporcional
    const scale = 0.28; 
    const drawW = spriteW * scale;
    const drawH = spriteH * scale;

    // Animação de vento procedural suave
    const swayAngle = Math.sin(time * 1.2) * 0.02;
    
    ctx.save();
    // O espaço vazio na parte inferior da imagem ajustado
    const emptySpaceOffset = drawH * 0.18; 

    // O ctx já está no mundo (afetado pela câmera), então basta transladar para a posição da árvore
    ctx.translate(worldX, worldY);
    ctx.rotate(swayAngle);

    ctx.drawImage(
      this.treesSprite,
      frameIndex * spriteW, 0, spriteW, spriteH,
      -drawW / 2, -drawH + emptySpaceOffset, drawW, drawH
    );
    ctx.restore();
    
    ctx.restore();
  }

  // Helper de hachuras (Hatching) dinâmicas para sombreamento e volume esferográfico
  public drawHatching(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    density: number = 4,
    angle: number = Math.PI / 4,
    color: string = GAME_CONFIG.PALETTE.PEN_PRIMARY,
    lineWidth: number = 0.9
  ) {
    if (width <= 0 || height <= 0) return;
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, width, height);
    ctx.clip();

    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.beginPath();

    const cosA = Math.cos(angle);
    const sinA = Math.sin(angle);
    const diag = Math.hypot(width, height) * 1.5;

    for (let offset = -diag; offset <= diag; offset += Math.max(2.5, density)) {
      const cx = x + width / 2 + cosA * offset;
      const cy = y + height / 2 + sinA * offset;
      const p1x = cx - sinA * diag;
      const p1y = cy + cosA * diag;
      const p2x = cx + sinA * diag;
      const p2y = cy - cosA * diag;
      ctx.moveTo(p1x, p1y);
      ctx.lineTo(p2x, p2y);
    }
    ctx.stroke();
    ctx.restore();
  }

  // Renderiza o Cavaleiro Arruinado (Player) - Animação Procedural em Traços de Palito e Caneta Esferográfica
  public renderPlayer(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    state: PlayerState,
    facing: Direction,
    animTime: number,
    hasSaltWeapon: boolean,
    isInvulnerable: boolean,
    spinAngle: number = 0,
    isSpinJumping: boolean = false
  ) {
    ctx.save();

    const penDark = GAME_CONFIG.PALETTE.PEN_DARKEST;
    const penMid = GAME_CONFIG.PALETTE.PEN_PRIMARY;
    const penLight = GAME_CONFIG.PALETTE.PEN_LIGHT;
    const holyGold = GAME_CONFIG.PALETTE.FX_HOLY_GOLD;
    const bloodRed = GAME_CONFIG.PALETTE.FX_BLOOD_RED;

    // 1. Sombra projetada no solo (com elipse e hachuras finas de nanquim)
    if (state !== PlayerState.JUMP && state !== PlayerState.FALL && state !== PlayerState.SPIN_JUMP && !isSpinJumping) {
      ctx.beginPath();
      ctx.ellipse(Math.floor(x + w / 2), Math.floor(y + h), 20, 5, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(10, 37, 112, 0.22)';
      ctx.fill();

      // Hachura sutil na sombra do solo
      ctx.strokeStyle = 'rgba(5, 20, 66, 0.35)';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      for (let sx = -14; sx <= 14; sx += 4) {
        ctx.moveTo(Math.floor(x + w / 2 + sx - 2), Math.floor(y + h - 1));
        ctx.lineTo(Math.floor(x + w / 2 + sx + 2), Math.floor(y + h + 2));
      }
      ctx.stroke();
    }

    // 2. Posiciona a origem central dos pés para transformações
    const centerX = Math.floor(x + w / 2);
    const baseY = Math.floor(y + h);
    ctx.translate(centerX, baseY);
    ctx.scale(facing, 1);

    // Efeito de invulnerabilidade (piscar rápido)
    if (isInvulnerable && Math.floor(animTime * 26) % 2 === 0) {
      ctx.globalAlpha = 0.45;
    }

    // Giro acrobático no centro da gravidade do corpo
    if (isSpinJumping || spinAngle !== 0) {
      ctx.translate(0, -30);
      ctx.rotate(spinAngle);
      ctx.translate(0, 30);
    }

    // Cálculos cinemáticos e angulares para cada estado
    let bodyAngle = 0;
    let headOffsetY = 0;
    let chestY = -34;
    let pelvisY = -18;
    let legFrontKneeX = 0, legFrontKneeY = -9, legFrontFootX = 4, legFrontFootY = 0;
    let legBackKneeX = 0, legBackKneeY = -9, legBackFootX = -4, legBackFootY = 0;
    let armSwordElbowX = 0, armSwordElbowY = -28, armSwordHandX = 14, armSwordHandY = -24;
    let armShieldElbowX = 0, armShieldElbowY = -28, armShieldHandX = -6, armShieldHandY = -26;
    let capeWave = Math.sin(animTime * 6) * 4;
    let swordTipX = 26, swordTipY = -32;

    switch (state) {
      case PlayerState.IDLE: {
        const breathe = Math.sin(animTime * 3) * 1.5;
        chestY += breathe;
        headOffsetY = breathe * 0.8;
        legFrontKneeX = 3; legFrontKneeY = -9; legFrontFootX = 6; legFrontFootY = 0;
        legBackKneeX = -4; legBackKneeY = -9; legBackFootX = -6; legBackFootY = 0;
        armSwordElbowX = 6; armSwordElbowY = -26 + breathe;
        armSwordHandX = 12; armSwordHandY = -18 + breathe;
        swordTipX = 22; swordTipY = -30 + breathe;
        armShieldHandX = -8; armShieldHandY = -25 + breathe;
        capeWave = Math.sin(animTime * 4) * 3;
        break;
      }
      case PlayerState.RUN: {
        const cycle = animTime * 13;
        const bob = Math.abs(Math.sin(cycle)) * 3;
        bodyAngle = 0.18; // Inclinado para a frente
        chestY = -34 + bob;
        pelvisY = -18 + bob;
        headOffsetY = bob;

        const sinLeg = Math.sin(cycle);
        const cosLeg = Math.cos(cycle);

        // Perna Dianteira
        legFrontKneeX = 5 + sinLeg * 9;
        legFrontKneeY = -10 - Math.max(0, -cosLeg * 6);
        legFrontFootX = 6 + sinLeg * 15;
        legFrontFootY = Math.min(0, cosLeg * 6);

        // Perna Traseira
        legBackKneeX = -4 - sinLeg * 9;
        legBackKneeY = -10 - Math.max(0, cosLeg * 6);
        legBackFootX = -6 - sinLeg * 15;
        legBackFootY = Math.min(0, -cosLeg * 6);

        // Braço com Espada em balanço de corrida
        armSwordElbowX = 8 - sinLeg * 6;
        armSwordElbowY = -28 + bob;
        armSwordHandX = 15 - sinLeg * 10;
        armSwordHandY = -22 + bob;
        swordTipX = armSwordHandX + 16;
        swordTipY = armSwordHandY - 10;

        // Braço do escudo em guarda
        armShieldHandX = -4; armShieldHandY = -24 + bob;
        capeWave = -8 + Math.sin(cycle * 1.5) * 8;
        break;
      }
      case PlayerState.JUMP: {
        bodyAngle = 0.08;
        chestY = -36;
        pelvisY = -20;
        // Pernas recolhidas
        legFrontKneeX = 7; legFrontKneeY = -14; legFrontFootX = 9; legFrontFootY = -7;
        legBackKneeX = -5; legBackKneeY = -14; legBackFootX = -7; legBackFootY = -6;
        // Espada apontando para cima
        armSwordElbowX = 10; armSwordElbowY = -32;
        armSwordHandX = 14; armSwordHandY = -36;
        swordTipX = 22; swordTipY = -52;
        armShieldHandX = -6; armShieldHandY = -24;
        capeWave = 6 + Math.sin(animTime * 8) * 4;
        break;
      }
      case PlayerState.FALL: {
        bodyAngle = -0.05;
        chestY = -34;
        pelvisY = -18;
        // Pernas estendidas para aterrissagem
        legFrontKneeX = 4; legFrontKneeY = -8; legFrontFootX = 5; legFrontFootY = 0;
        legBackKneeX = -3; legBackKneeY = -8; legBackFootX = -4; legBackFootY = 0;
        armSwordElbowX = 8; armSwordElbowY = -26;
        armSwordHandX = 14; armSwordHandY = -20;
        swordTipX = 24; swordTipY = -30;
        armShieldHandX = -6; armShieldHandY = -26;
        capeWave = 9 + Math.sin(animTime * 10) * 5;
        break;
      }
      case PlayerState.SPIN_JUMP: {
        chestY = -24;
        pelvisY = -16;
        legFrontKneeX = 6; legFrontKneeY = -16; legFrontFootX = 2; legFrontFootY = -14;
        legBackKneeX = -6; legBackKneeY = -16; legBackFootX = -2; legBackFootY = -14;
        armSwordElbowX = 8; armSwordElbowY = -24;
        armSwordHandX = 16; armSwordHandY = -24;
        swordTipX = 34; swordTipY = -24;
        armShieldHandX = -8; armShieldHandY = -22;
        break;
      }
      case PlayerState.ATTACK: {
        bodyAngle = 0.24; // Avanço com golpe de lâmina
        chestY = -32;
        pelvisY = -16;
        // Perna dianteira flexionada em estocada
        legFrontKneeX = 12; legFrontKneeY = -8; legFrontFootX = 14; legFrontFootY = 0;
        legBackKneeX = -10; legBackKneeY = -8; legBackFootX = -14; legBackFootY = 0;
        // Arco de corte frontal vigoroso
        armSwordElbowX = 12; armSwordElbowY = -26;
        armSwordHandX = 22; armSwordHandY = -26;
        swordTipX = 42; swordTipY = -22;
        armShieldHandX = -10; armShieldHandY = -22;
        capeWave = -10 + Math.sin(animTime * 12) * 6;
        break;
      }
      case PlayerState.DASH: {
        bodyAngle = 0.45; // Agachado deslizando rente ao solo
        chestY = -24;
        pelvisY = -12;
        legFrontKneeX = 14; legFrontKneeY = -6; legFrontFootX = 16; legFrontFootY = 0;
        legBackKneeX = -12; legBackKneeY = -6; legBackFootX = -18; legBackFootY = 0;
        armSwordHandX = 6; armSwordHandY = -16;
        swordTipX = -12; swordTipY = -20; // Espada recolhida para trás
        armShieldHandX = 14; armShieldHandY = -18; // Escudo à frente cortando o vento
        capeWave = -16 + Math.sin(animTime * 16) * 4;
        break;
      }
      case PlayerState.USE_ITEM: {
        chestY = -36;
        pelvisY = -18;
        armSwordHandX = 4; armSwordHandY = -16;
        swordTipX = 10; swordTipY = -26;
        // Mão erguida para o alto segurando o sal sagrado
        armShieldHandX = 8; armShieldHandY = -46;
        break;
      }
      case PlayerState.HIT: {
        bodyAngle = -0.28; // Jogado para trás
        chestY = -34;
        pelvisY = -18;
        legFrontKneeX = 4; legFrontKneeY = -8; legFrontFootX = 6; legFrontFootY = 0;
        legBackKneeX = -8; legBackKneeY = -10; legBackFootX = -12; legBackFootY = 0;
        armSwordHandX = 10; armSwordHandY = -34;
        swordTipX = 18; swordTipY = -46;
        armShieldHandX = -12; armShieldHandY = -30;
        capeWave = 12;
        break;
      }
      case PlayerState.DEATH: {
        bodyAngle = 1.4; // Caído no chão
        chestY = -10;
        pelvisY = -8;
        legFrontKneeX = 8; legFrontKneeY = -6; legFrontFootX = 14; legFrontFootY = -2;
        legBackKneeX = 6; legBackKneeY = -4; legBackFootX = 12; legBackFootY = -2;
        armSwordHandX = 6; armSwordHandY = -4;
        swordTipX = 22; swordTipY = -2;
        armShieldHandX = -4; armShieldHandY = -6;
        break;
      }
    }

    ctx.save();
    ctx.rotate(bodyAngle);

    // 3. Capa Medieval de Caneta (Ondulante nas Costas)
    if (state !== PlayerState.SPIN_JUMP) {
      ctx.beginPath();
      ctx.fillStyle = 'rgba(10, 37, 112, 0.16)';
      ctx.strokeStyle = penDark;
      ctx.lineWidth = 1.6;
      ctx.lineJoin = 'round';
      const capeAnchorX = -5;
      const capeAnchorY = chestY + 2;
      ctx.moveTo(capeAnchorX, capeAnchorY);
      ctx.quadraticCurveTo(-14, chestY + 12, -18 + capeWave, -4);
      ctx.lineTo(-12 + capeWave, -2);
      ctx.quadraticCurveTo(-8, chestY + 14, capeAnchorX + 4, capeAnchorY + 4);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Hachuras finas de tecido na capa
      ctx.strokeStyle = penMid;
      ctx.lineWidth = 0.9;
      ctx.beginPath();
      for (let ch = 6; ch < 28; ch += 5) {
        ctx.moveTo(capeAnchorX - 2, capeAnchorY + ch * 0.7);
        ctx.lineTo(-15 + capeWave * (ch / 28), -4 + ch * 0.1);
      }
      ctx.stroke();
    }

    // 4. Pernas em Palito (Articuladas com caneta firme de nanquim)
    ctx.strokeStyle = penDark;
    ctx.lineWidth = 2.6;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Perna Traseira
    ctx.beginPath();
    ctx.moveTo(-2, pelvisY);
    ctx.lineTo(legBackKneeX, legBackKneeY);
    ctx.lineTo(legBackFootX, legBackFootY);
    ctx.lineTo(legBackFootX + 4, legBackFootY); // Ponta da bota
    ctx.stroke();

    // Perna Dianteira
    ctx.beginPath();
    ctx.moveTo(2, pelvisY);
    ctx.lineTo(legFrontKneeX, legFrontKneeY);
    ctx.lineTo(legFrontFootX, legFrontFootY);
    ctx.lineTo(legFrontFootX + 5, legFrontFootY); // Ponta da bota
    ctx.stroke();

    // 5. Tronco de Palito com Cota de Malha e Armadura de Caneta
    // Linha espinhal / tronco principal
    ctx.strokeStyle = penDark;
    ctx.lineWidth = 3.2;
    ctx.beginPath();
    ctx.moveTo(0, pelvisY);
    ctx.lineTo(0, chestY);
    ctx.stroke();

    // Placa peitoral / cota de malha com hachuras em nanquim
    ctx.fillStyle = 'rgba(235, 225, 205, 0.95)';
    ctx.strokeStyle = penDark;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(-6, chestY);
    ctx.lineTo(6, chestY);
    ctx.lineTo(4, pelvisY + 2);
    ctx.lineTo(-4, pelvisY + 2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Hachura peitoral de aço
    ctx.strokeStyle = penMid;
    ctx.lineWidth = 1.0;
    ctx.beginPath();
    ctx.moveTo(-4, chestY + 4);
    ctx.lineTo(4, chestY + 4);
    ctx.moveTo(-3, chestY + 8);
    ctx.lineTo(3, chestY + 8);
    ctx.stroke();

    // Clavícula / Ombreiras
    ctx.strokeStyle = penDark;
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(-8, chestY);
    ctx.lineTo(8, chestY);
    ctx.stroke();

    // 6. Cabeça / Elmo de Caneta (Estilo Sallet com fenda de visor e brilho rubi)
    const headX = 0;
    const headY = chestY - 11 + headOffsetY;
    const headRadius = 7.5;

    // Cúpula do elmo
    ctx.fillStyle = 'rgba(240, 235, 220, 0.95)';
    ctx.strokeStyle = penDark;
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    ctx.arc(headX, headY, headRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Crista superior do elmo
    ctx.strokeStyle = penDark;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(headX - 6, headY - 6);
    ctx.quadraticCurveTo(headX, headY - 11, headX + 7, headY - 4);
    ctx.stroke();

    // Hachura na têmpora do elmo
    ctx.strokeStyle = penMid;
    ctx.lineWidth = 0.9;
    ctx.beginPath();
    ctx.moveTo(headX - 4, headY - 3);
    ctx.lineTo(headX - 1, headY - 5);
    ctx.moveTo(headX - 4, headY);
    ctx.lineTo(headX, headY - 3);
    ctx.stroke();

    // Fenda do Visor (horizontal com brilho vermelho)
    ctx.fillStyle = penDark;
    ctx.fillRect(headX + 1, headY - 1, 5.5, 2);

    // Olho / Brilho Carmim no visor
    ctx.fillStyle = bloodRed;
    ctx.fillRect(headX + 3.5, headY - 0.5, 2, 1.2);

    // 7. Braço Traseiro e Escudo Redondo Rebitado
    ctx.strokeStyle = penDark;
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(-6, chestY + 1);
    ctx.lineTo(armShieldElbowX, armShieldElbowY);
    ctx.lineTo(armShieldHandX, armShieldHandY);
    ctx.stroke();

    // Escudo Redondo Medieval
    const shieldRadius = 10;
    ctx.fillStyle = 'rgba(235, 225, 205, 0.95)';
    ctx.strokeStyle = penDark;
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    ctx.arc(armShieldHandX, armShieldHandY, shieldRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Aro interno e umbo central de caneta
    ctx.strokeStyle = penMid;
    ctx.lineWidth = 1.0;
    ctx.beginPath();
    ctx.arc(armShieldHandX, armShieldHandY, shieldRadius - 3, 0, Math.PI * 2);
    ctx.stroke();

    // Umbo central saliente
    ctx.fillStyle = penDark;
    ctx.beginPath();
    ctx.arc(armShieldHandX, armShieldHandY, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Rebites do escudo
    for (let r = 0; r < 4; r++) {
      const rAngle = (r * Math.PI) / 2;
      const rx = armShieldHandX + Math.cos(rAngle) * (shieldRadius - 1.5);
      const ry = armShieldHandY + Math.sin(rAngle) * (shieldRadius - 1.5);
      ctx.fillStyle = penDark;
      ctx.fillRect(Math.floor(rx), Math.floor(ry), 1.5, 1.5);
    }

    // 8. Braço Frontal e Espada Medieval com Canaleta
    ctx.strokeStyle = penDark;
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(6, chestY + 1);
    ctx.lineTo(armSwordElbowX, armSwordElbowY);
    ctx.lineTo(armSwordHandX, armSwordHandY);
    ctx.stroke();

    // Guarda da Espada (Cruzada)
    const swordDirX = swordTipX - armSwordHandX;
    const swordDirY = swordTipY - armSwordHandY;
    const swordLen = Math.hypot(swordDirX, swordDirY) || 1;
    const nx = -swordDirY / swordLen;
    const ny = swordDirX / swordLen;

    ctx.strokeStyle = penDark;
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(armSwordHandX + nx * 5, armSwordHandY + ny * 5);
    ctx.lineTo(armSwordHandX - nx * 5, armSwordHandY - ny * 5);
    ctx.stroke();

    // Pomo da Espada
    ctx.fillStyle = penDark;
    ctx.beginPath();
    ctx.arc(armSwordHandX - (swordDirX / swordLen) * 4, armSwordHandY - (swordDirY / swordLen) * 4, 1.8, 0, Math.PI * 2);
    ctx.fill();

    // Lâmina de Aço de Caneta
    ctx.strokeStyle = penDark;
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    ctx.moveTo(armSwordHandX, armSwordHandY);
    ctx.lineTo(swordTipX, swordTipY);
    ctx.stroke();

    // Canaleta central da lâmina
    ctx.strokeStyle = penLight;
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(armSwordHandX + (swordDirX / swordLen) * 3, armSwordHandY + (swordDirY / swordLen) * 3);
    ctx.lineTo(swordTipX - (swordDirX / swordLen) * 4, swordTipY - (swordDirY / swordLen) * 4);
    ctx.stroke();

    // Efeito de Frasco de Sal em USE_ITEM
    if (state === PlayerState.USE_ITEM) {
      ctx.fillStyle = holyGold;
      ctx.beginPath();
      ctx.arc(armShieldHandX, armShieldHandY - 6, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = penDark;
      ctx.lineWidth = 1;
      ctx.stroke();

      // Raios dourados sagrados
      ctx.strokeStyle = holyGold;
      ctx.lineWidth = 1.2;
      for (let s = 0; s < 5; s++) {
        const sAngle = (s * Math.PI * 2) / 5 + animTime * 3;
        ctx.beginPath();
        ctx.moveTo(armShieldHandX + Math.cos(sAngle) * 5, armShieldHandY - 6 + Math.sin(sAngle) * 5);
        ctx.lineTo(armShieldHandX + Math.cos(sAngle) * 11, armShieldHandY - 6 + Math.sin(sAngle) * 11);
        ctx.stroke();
      }
    }

    // 9. Arco Cinético de Ataque (Slash Arc com Hachuras)
    if (state === PlayerState.ATTACK) {
      ctx.save();
      ctx.strokeStyle = 'rgba(10, 37, 112, 0.75)';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.arc(armSwordHandX - 4, armSwordHandY + 2, 28, -Math.PI * 0.45, Math.PI * 0.35);
      ctx.stroke();

      // Linhas dinâmicas de vento do corte
      ctx.strokeStyle = 'rgba(59, 98, 196, 0.45)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(armSwordHandX - 4, armSwordHandY + 2, 33, -Math.PI * 0.38, Math.PI * 0.28);
      ctx.stroke();
      ctx.restore();
    }

    // 10. Linhas de Velocidade no Dash (Motion Lines)
    if (state === PlayerState.DASH) {
      ctx.save();
      ctx.strokeStyle = 'rgba(10, 37, 112, 0.5)';
      ctx.lineWidth = 1.4;
      for (let d = 0; d < 3; d++) {
        const lineY = -8 - d * 8;
        ctx.beginPath();
        ctx.moveTo(-18 - d * 6, lineY);
        ctx.lineTo(-34 - d * 10, lineY);
        ctx.stroke();
      }
      ctx.restore();
    }

    // 11. Efeito de Pulo com Giro 360° (Spin Jump Rastro de Nanquim)
    if (isSpinJumping || state === PlayerState.SPIN_JUMP) {
      ctx.save();
      ctx.strokeStyle = 'rgba(10, 37, 112, 0.6)';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(0, -22, 26, 0, Math.PI * 1.6);
      ctx.stroke();
      ctx.restore();
    }

    // 12. Efeito de buff 'Arma com Sal': Resplendor Sagrado e Cristais Cintilantes
    if (hasSaltWeapon) {
      const saltPulse = Math.sin(animTime * 8) * 0.25 + 0.75;
      ctx.strokeStyle = `rgba(245, 158, 11, ${0.7 * saltPulse})`;
      ctx.lineWidth = 2.0;

      // Aura ao redor da lâmina
      ctx.beginPath();
      ctx.moveTo(armSwordHandX, armSwordHandY);
      ctx.lineTo(swordTipX, swordTipY);
      ctx.stroke();

      // Partículas sagradas de sal cintilando
      for (let i = 0; i < 4; i++) {
        const pFrac = (animTime * 2 + i * 0.25) % 1.0;
        const px = armSwordHandX + (swordTipX - armSwordHandX) * pFrac + Math.sin(animTime * 10 + i) * 3;
        const py = armSwordHandY + (swordTipY - armSwordHandY) * pFrac + Math.cos(animTime * 10 + i) * 3;
        ctx.fillStyle = i % 2 === 0 ? holyGold : '#FFFFFF';
        ctx.fillRect(Math.floor(px), Math.floor(py), 2, 2);
      }
    }

    ctx.restore(); // Restaura a rotação do corpo
    ctx.restore(); // Restaura transformações gerais
  }

  // Renderiza o Espectro / Fantasma (Ghost Enemy)
  public renderGhost(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    facing: Direction,
    animTime: number,
    hp: number,
    maxHp: number,
    isHurt: boolean
  ) {
    ctx.save();
    const centerX = x + w / 2;
    const centerY = y + h / 2;
    ctx.translate(centerX, centerY);
    ctx.scale(facing, 1);

    const floatY = Math.sin(animTime * 3) * 6;
    ctx.translate(0, floatY);

    const acidGreen = GAME_CONFIG.PALETTE.FX_ACID_GREEN;
    const penDark = GAME_CONFIG.PALETTE.PEN_DARKEST;
    const penMid = GAME_CONFIG.PALETTE.PEN_PRIMARY;

    // 1. Aura Etérea Verde Ácido (Exceção de Cor do GDD)
    ctx.save();
    ctx.fillStyle = 'rgba(16, 185, 129, 0.15)';
    ctx.strokeStyle = acidGreen;
    ctx.lineWidth = 1.4;
    ctx.setLineDash([4, 4]);

    ctx.beginPath();
    ctx.ellipse(0, 0, w * 0.65, h * 0.6, Math.sin(animTime * 2) * 0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();

    // 2. Manto Espectral e Cauda de Fumaça
    ctx.beginPath();
    ctx.fillStyle = isHurt ? 'rgba(245, 158, 11, 0.4)' : 'rgba(240, 245, 255, 0.7)';
    ctx.strokeStyle = penDark;
    ctx.lineWidth = 2;

    // Capuz e manto rasgado
    ctx.moveTo(-16, -24);
    ctx.quadraticCurveTo(0, -32, 16, -24);
    ctx.quadraticCurveTo(22, 0, 18, 18);

    // Cauda fantasmagórica ondulante
    const wave1 = Math.sin(animTime * 6) * 8;
    const wave2 = Math.cos(animTime * 6) * 8;
    ctx.quadraticCurveTo(12, 28, 4 + wave1, 36);
    ctx.quadraticCurveTo(-4, 30, -10 + wave2, 38);
    ctx.quadraticCurveTo(-18, 26, -18, 16);
    ctx.quadraticCurveTo(-22, 0, -16, -24);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Hachura interna de caneta azul escura
    ctx.beginPath();
    ctx.strokeStyle = penMid;
    ctx.lineWidth = 1;
    for (let hy = -16; hy < 20; hy += 7) {
      ctx.moveTo(-12, hy);
      ctx.lineTo(12, hy + 3);
    }
    ctx.stroke();

    // 3. Olhos Espectrais Verde Ácido
    ctx.fillStyle = acidGreen;
    ctx.shadowColor = acidGreen;
    ctx.shadowBlur = 8;

    ctx.beginPath();
    ctx.ellipse(5, -14, 3, 2, 0.2, 0, Math.PI * 2);
    ctx.ellipse(13, -14, 3, 2, -0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // 4. Mãos esqueléticas ou garras fantasmagóricas estendidas
    ctx.beginPath();
    ctx.strokeStyle = penDark;
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.moveTo(10, -2);
    ctx.lineTo(24, -4);
    ctx.lineTo(30, -8);
    ctx.moveTo(10, 6);
    ctx.lineTo(22, 8);
    ctx.lineTo(28, 6);
    ctx.stroke();

    ctx.restore();

    // 5. Barra de Vida do Fantasma (Estilo Caneta)
    this.renderEnemyHealthBar(ctx, x, y - 16, w, hp, maxHp, 'ESPECTRO [IMUNE A FÍSICO]');
  }

  // Renderiza o Carniçal / Zumbi Amaldiçoado (Ghoul Enemy)
  public renderGhoul(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    facing: Direction,
    animTime: number,
    hp: number,
    maxHp: number,
    isHurt: boolean
  ) {
    ctx.save();
    const centerX = x + w / 2;
    const bottomY = y + h;
    ctx.translate(centerX, bottomY);
    ctx.scale(facing, 1);

    const penDark = GAME_CONFIG.PALETTE.PEN_DARKEST;
    const penMid = GAME_CONFIG.PALETTE.PEN_PRIMARY;
    const bloodRed = GAME_CONFIG.PALETTE.FX_BLOOD_RED;

    // Movimento curvado e trôpego
    const hunch = Math.sin(animTime * 5) * 3;
    const legWalk = Math.sin(animTime * 8) * 10;

    // 1. Pernas esqueléticas e trôpegas
    ctx.strokeStyle = penDark;
    ctx.lineWidth = 2.4;
    ctx.lineCap = 'round';

    // Perna esquerda
    ctx.beginPath();
    ctx.moveTo(-8, -20);
    ctx.lineTo(-12 - legWalk * 0.5, -10);
    ctx.lineTo(-8 - legWalk, 0);
    ctx.stroke();

    // Perna direita
    ctx.beginPath();
    ctx.moveTo(8, -20);
    ctx.lineTo(12 + legWalk * 0.5, -10);
    ctx.lineTo(8 + legWalk, 0);
    ctx.stroke();

    // 2. Tronco encurvado e rasgado
    ctx.fillStyle = isHurt ? 'rgba(200, 30, 30, 0.35)' : 'rgba(235, 225, 205, 0.95)';
    ctx.strokeStyle = penDark;
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(-12, -20);
    ctx.lineTo(-16, -38 + hunch);
    ctx.lineTo(10, -42 + hunch);
    ctx.lineTo(14, -20);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Costelas / Hachura de carne apodrecida
    ctx.strokeStyle = penMid;
    ctx.lineWidth = 1.2;
    for (let r = 0; r < 4; r++) {
      ctx.beginPath();
      ctx.moveTo(-10, -36 + r * 5 + hunch);
      ctx.lineTo(8, -34 + r * 5 + hunch);
      ctx.stroke();
    }

    // 3. Braços com garras afiadas estendidas
    ctx.strokeStyle = penDark;
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    // Braço traseiro
    ctx.moveTo(-12, -34 + hunch);
    ctx.lineTo(12, -26 + hunch);
    ctx.lineTo(24, -22 + hunch);
    // Braço dianteiro
    ctx.moveTo(6, -36 + hunch);
    ctx.lineTo(20, -32 + hunch);
    ctx.lineTo(28, -28 + hunch);
    ctx.stroke();

    // Garras
    ctx.strokeStyle = bloodRed;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(28, -28 + hunch);
    ctx.lineTo(34, -26 + hunch);
    ctx.moveTo(24, -22 + hunch);
    ctx.lineTo(30, -20 + hunch);
    ctx.stroke();

    // 4. Crânio bestial e mandíbula aberta
    ctx.fillStyle = GAME_CONFIG.PALETTE.PAPER_BG;
    ctx.strokeStyle = penDark;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(8, -48 + hunch, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Mandíbula alongada e dentes
    ctx.beginPath();
    ctx.moveTo(14, -45 + hunch);
    ctx.lineTo(22, -43 + hunch);
    ctx.lineTo(16, -38 + hunch);
    ctx.stroke();

    // Olhos vermelhos furiosos
    ctx.fillStyle = bloodRed;
    ctx.beginPath();
    ctx.arc(14, -50 + hunch, 2.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    // Barra de Vida
    this.renderEnemyHealthBar(ctx, x, y - 14, w, hp, maxHp, 'CARNIÇAL [FRACO A FÍSICO]');
  }

  // Renderiza NPC (Monge Cego / Eremita do Sal nas Ruínas)
  
  public drawDestructible(ctx: CanvasRenderingContext2D, destructible: Destructible) {
    ctx.save();
    const { x, y, width, height, type } = destructible;
    const primary = GAME_CONFIG.PALETTE.PEN_PRIMARY;
    const hatch = GAME_CONFIG.PALETTE.PEN_HATCHING;

    ctx.fillStyle = '#ffffff'; // Solid white background so it stands out against the parchment
    if (type === 'box') {
      ctx.fillRect(x, y, width, height);
    } else if (type === 'vase') {
      ctx.fillRect(x, y, width, height);
    } else if (type === 'rubble') {
      ctx.fillRect(x, y, width, height);
    }

    ctx.strokeStyle = primary;
    ctx.lineWidth = 1.8; // Made slightly thicker to be more visible
    ctx.lineJoin = 'round';

    // Text label to ensure user sees it
    ctx.font = '10px Caveat';
    ctx.fillStyle = primary;
    ctx.textAlign = 'center';
    ctx.fillText(type.toUpperCase(), x + width / 2, y - 5);

    // Multiple strokes to simulate ballpoint pen sketch
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      const ox = (Math.random() - 0.5) * 1.5;
      const oy = (Math.random() - 0.5) * 1.5;
      
      if (type === 'box') {
        ctx.rect(x + ox, y + oy, width, height);
        // Draw diagonal cross on box
        ctx.moveTo(x + ox, y + oy);
        ctx.lineTo(x + width + ox, y + height + oy);
        ctx.moveTo(x + width + ox, y + oy);
        ctx.lineTo(x + ox, y + height + oy);
      } else if (type === 'vase') {
        // Simple vase shape
        ctx.moveTo(x + width * 0.2 + ox, y + oy);
        ctx.lineTo(x + width * 0.8 + ox, y + oy);
        ctx.quadraticCurveTo(x + width + ox, y + height / 2 + oy, x + width * 0.7 + ox, y + height + oy);
        ctx.lineTo(x + width * 0.3 + ox, y + height + oy);
        ctx.quadraticCurveTo(x + ox, y + height / 2 + oy, x + width * 0.2 + ox, y + oy);
      } else if (type === 'rubble') {
        // Irregular rubble pile
        ctx.moveTo(x + ox, y + height + oy);
        ctx.lineTo(x + width * 0.3 + ox, y + height * 0.2 + oy);
        ctx.lineTo(x + width * 0.7 + ox, y + height * 0.4 + oy);
        ctx.lineTo(x + width + ox, y + height + oy);
        ctx.closePath();
      }
      ctx.stroke();
    }

    // Cross-hatching for shading in the bottom-right corner
    ctx.strokeStyle = hatch;
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    const hatchSteps = 4;
    for (let j = 0; j < width + height; j += hatchSteps) {
      const hx1 = x + Math.max(0, j - height);
      const hy1 = y + Math.min(height, j);
      const hx2 = x + Math.min(width, j);
      const hy2 = y + Math.max(0, j - width);
      
      // Only draw hatching in the bottom right 60%
      if (hx1 > x + width * 0.4 && hy2 > y + height * 0.4) {
        ctx.moveTo(hx1, hy1);
        ctx.lineTo(hx2, hy2);
      }
    }
    ctx.stroke();

    ctx.restore();
  }

  public renderNPC(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    iconType: 'HERMIT' | 'SPIRIT',
    animTime: number,
    isPlayerNearby: boolean,
    npcName: string
  ) {
    ctx.save();
    
    // Custom drawing for Lorde Carmim
    if (npcName === 'Lorde Carmim') {
      const centerX = x + w / 2;
      const bottomY = y + h;
      ctx.translate(centerX, bottomY);
      
      const breathe = Math.sin(animTime * 2) * 5; // Slight hover effect
      
      if (this.lordeCarmimImg) {
        // The image is quite large, let's scale it so its height is roughly 350
        const drawH = 350;
        const drawW = drawH * (this.lordeCarmimImg.width / this.lordeCarmimImg.height);
        
        ctx.drawImage(
          this.lordeCarmimImg, 
          -drawW / 2, 
          -drawH + breathe, 
          drawW, 
          drawH
        );
      }
      
      ctx.restore();
      return;
    }

    const centerX = x + w / 2;
    const bottomY = y + h;
    ctx.translate(centerX, bottomY);

    const penDark = GAME_CONFIG.PALETTE.PEN_DARKEST;
    const penMid = GAME_CONFIG.PALETTE.PEN_PRIMARY;
    const holyGold = GAME_CONFIG.PALETTE.FX_HOLY_GOLD;

    const breathe = Math.sin(animTime * 2.5) * 1.5;

    // 1. Túnica de Monge / Eremita em caneta esferográfica detalhada
    ctx.fillStyle = 'rgba(238, 230, 210, 0.95)';
    ctx.strokeStyle = penDark;
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(-16, 0);
    ctx.lineTo(-18, -42 + breathe);
    ctx.quadraticCurveTo(0, -56 + breathe, 18, -42 + breathe);
    ctx.lineTo(16, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Hachura densa de tecido rústico na túnica
    ctx.strokeStyle = penMid;
    ctx.lineWidth = 1;
    for (let hy = -38; hy < -6; hy += 5) {
      ctx.beginPath();
      ctx.moveTo(-14, hy + breathe);
      ctx.lineTo(14, hy + 2 + breathe);
      ctx.stroke();
    }

    // Cordão de oração / rosário na cintura
    ctx.strokeStyle = holyGold;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, -22 + breathe, 12, 0, Math.PI);
    ctx.stroke();

    // 2. Capuz e barba branca longa
    ctx.fillStyle = GAME_CONFIG.PALETTE.PAPER_BG;
    ctx.strokeStyle = penDark;
    ctx.lineWidth = 2;
    // Capuz
    ctx.beginPath();
    ctx.arc(0, -48 + breathe, 12, Math.PI * 0.8, Math.PI * 2.2);
    ctx.fill();
    ctx.stroke();

    // Faixa sobre os olhos (Monge Cego)
    ctx.fillStyle = GAME_CONFIG.PALETTE.PEN_LIGHT;
    ctx.fillRect(-8, -50 + breathe, 16, 4);
    ctx.strokeRect(-8, -50 + breathe, 16, 4);

    // Barba longa descendo
    ctx.beginPath();
    ctx.moveTo(-6, -44 + breathe);
    ctx.quadraticCurveTo(0, -28 + breathe, 2, -26 + breathe);
    ctx.quadraticCurveTo(6, -34 + breathe, 6, -44 + breathe);
    ctx.strokeStyle = penMid;
    ctx.stroke();

    // 3. Cajado com lanterna de Sal sagrado
    ctx.strokeStyle = penDark;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(18, 0);
    ctx.lineTo(20, -58 + breathe);
    ctx.stroke();

    // Lanterna no topo do cajado
    const lanternY = -58 + breathe;
    ctx.fillStyle = holyGold;
    ctx.beginPath();
    ctx.arc(20, lanternY, 5 + Math.sin(animTime * 5) * 1, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = penDark;
    ctx.lineWidth = 1.2;
    ctx.stroke();

    ctx.restore();

    // 4. Balão / Indicador de Interação "[E] Conversar" quando o jogador estiver perto
    ctx.save();
    ctx.textAlign = 'center';

    if (isPlayerNearby) {
      const bubbleY = y - 24 + Math.sin(animTime * 4) * 2;
      const bubbleW = 120;
      const bubbleH = 22;

      // Fundo do balão
      ctx.fillStyle = GAME_CONFIG.PALETTE.FX_HOLY_WHITE;
      ctx.strokeStyle = GAME_CONFIG.PALETTE.PEN_PRIMARY;
      ctx.lineWidth = 1.5;
      ctx.fillRect(x + w / 2 - bubbleW / 2, bubbleY, bubbleW, bubbleH);
      ctx.strokeRect(x + w / 2 - bubbleW / 2, bubbleY, bubbleW, bubbleH);

      // Texto de tecla de ação
      ctx.font = 'bold 11px "Cinzel", serif';
      ctx.fillStyle = GAME_CONFIG.PALETTE.PEN_DARKEST;
      ctx.fillText(`[E] ${npcName}`, x + w / 2, bubbleY + 15);
    } else {
      // Nome simples sutil sobre a cabeça
      ctx.font = 'italic 10px serif';
      ctx.fillStyle = 'rgba(10, 37, 112, 0.75)';
      ctx.fillText(npcName, x + w / 2, y - 8);
    }
    ctx.restore();
  }

  // Barra de Vida desenhada à caneta com texto de status
  private renderEnemyHealthBar(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    hp: number,
    maxHp: number,
    label: string
  ) {
    ctx.save();
    const barW = Math.max(w + 20, 64);
    const barH = 6;
    const barX = x + (w - barW) / 2;

    // Fundo
    ctx.fillStyle = GAME_CONFIG.PALETTE.PAPER_BG;
    ctx.fillRect(barX, y, barW, barH);

    // Contorno caneta
    ctx.strokeStyle = GAME_CONFIG.PALETTE.PEN_PRIMARY;
    ctx.lineWidth = 1.2;
    ctx.strokeRect(barX, y, barW, barH);

    // HP preenchido com tinta
    const hpRatio = Math.max(0, Math.min(1, hp / maxHp));
    ctx.fillStyle = GAME_CONFIG.PALETTE.FX_BLOOD_RED;
    ctx.fillRect(barX + 1, y + 1, (barW - 2) * hpRatio, barH - 2);

    // Rótulo
    ctx.font = 'bold 9px "Cinzel", serif';
    ctx.fillStyle = GAME_CONFIG.PALETTE.PEN_DARKEST;
    ctx.textAlign = 'center';
    ctx.fillText(label, barX + barW / 2, y - 3);

    ctx.restore();
  }

  // Renderiza partículas visuais no estilo caneta esferográfica azul sobre pergaminho
  public renderParticles(ctx: CanvasRenderingContext2D, particles: Particle[]) {
    ctx.save();
    for (const p of particles) {
      ctx.globalAlpha = Math.max(0, Math.min(1, p.alpha));

      if (p.shape === 'ink_splatter') {
        // Mancha de tinta esferográfica azul com micro-respingos orgânicos (sangue de tinta)
        ctx.fillStyle = p.color;
        ctx.beginPath();
        // Núcleo da mancha
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        // Micro-respingos satélites ao redor da gota de impacto
        if (p.satellites && p.satellites.length > 0) {
          for (const sat of p.satellites) {
            ctx.beginPath();
            ctx.arc(p.x + sat.dx, p.y + sat.dy, Math.max(0.6, sat.r), 0, Math.PI * 2);
            ctx.fill();
          }
        } else {
          // Satélites padrões procedurais caso não especificados
          ctx.beginPath();
          ctx.arc(p.x + p.size * 0.8, p.y - p.size * 0.6, Math.max(0.7, p.size * 0.35), 0, Math.PI * 2);
          ctx.arc(p.x - p.size * 0.7, p.y + p.size * 0.75, Math.max(0.6, p.size * 0.28), 0, Math.PI * 2);
          ctx.fill();
        }

        // Hachura fina de caneta dentro da mancha maior para textura de tinta líquida fresca
        if (p.size >= 3.2) {
          ctx.strokeStyle = GAME_CONFIG.PALETTE.PEN_DARKEST;
          ctx.lineWidth = 0.75;
          ctx.beginPath();
          ctx.moveTo(p.x - p.size * 0.5, p.y - p.size * 0.25);
          ctx.lineTo(p.x + p.size * 0.5, p.y + p.size * 0.25);
          ctx.stroke();
        }
      } else if (p.shape === 'ink_droplet') {
        // Gota de tinta esferográfica cinética, alongada na direção da velocidade (spray de corte)
        ctx.save();
        ctx.translate(p.x, p.y);
        const angle = p.rotation !== undefined ? p.rotation : Math.atan2(p.vy, p.vx);
        ctx.rotate(angle);

        const speed = Math.hypot(p.vx, p.vy);
        const stretch = Math.min(3.4, 1.4 + speed / 85);
        const len = p.size * stretch;
        const wid = Math.max(1, p.size * 0.65);

        // Corpo da gota de tinta
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.ellipse(0, 0, len, wid, 0, 0, Math.PI * 2);
        ctx.fill();

        // Filamento / rastro fino de caneta esferográfica escorrendo no ar
        ctx.strokeStyle = p.color;
        ctx.lineWidth = Math.max(0.8, wid * 0.55);
        ctx.beginPath();
        ctx.moveTo(-len * 0.6, 0);
        ctx.lineTo(-len * 1.8, 0);
        ctx.stroke();

        ctx.restore();
      } else if (p.shape === 'pen_scratch' || p.shape === 'ink_slash') {
        // Riscos vigorosos de lâmina desenhados à caneta no pergaminho (corte de espada)
        ctx.save();
        ctx.translate(p.x, p.y);
        if (p.rotation) ctx.rotate(p.rotation);

        ctx.strokeStyle = p.color;
        ctx.lineCap = 'round';

        if (p.scratchLines && p.scratchLines.length > 0) {
          for (const line of p.scratchLines) {
            ctx.lineWidth = line.width;
            ctx.beginPath();
            ctx.moveTo(line.dx1, line.dy1);
            ctx.lineTo(line.dx2, line.dy2);
            ctx.stroke();
          }
        } else {
          // Golpe de corte padrão com 2 a 3 traços rápidos de caneta
          ctx.lineWidth = 2.4;
          ctx.beginPath();
          ctx.moveTo(-p.size, -p.size * 0.7);
          ctx.lineTo(p.size, p.size * 0.7);
          ctx.stroke();

          // Segundo traço rápido paralelo / cruzado
          ctx.lineWidth = 1.4;
          ctx.beginPath();
          ctx.moveTo(-p.size * 0.7, -p.size * 0.9);
          ctx.lineTo(p.size * 0.8, p.size * 0.5);
          ctx.stroke();
        }
        ctx.restore();
      } else if (p.shape === 'ink_blot') {
        // Mancha de absorção de tinta no papel (levemente translúcida com anel de borda)
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = GAME_CONFIG.PALETTE.PEN_PRIMARY;
        ctx.lineWidth = 0.8;
        ctx.stroke();
      } else if (p.shape === 'spark') {
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(p.x - p.size, p.y);
        ctx.lineTo(p.x + p.size, p.y);
        ctx.moveTo(p.x, p.y - p.size);
        ctx.lineTo(p.x, p.y + p.size);
        ctx.stroke();
      } else if (p.shape === 'cross') {
        // Cruz sagrada de sal
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(p.x - p.size * 0.8, p.y);
        ctx.lineTo(p.x + p.size * 0.8, p.y);
        ctx.moveTo(p.x, p.y - p.size * 1.2);
        ctx.lineTo(p.x, p.y + p.size * 1.2);
        ctx.stroke();
      } else {
        // Ponto padrão
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  }

  // Renderiza textos flutuantes de dano e status (ex: "IMUNE!", "FRAQUEZA!", "35")
  public renderFloatingTexts(ctx: CanvasRenderingContext2D, texts: FloatingText[]) {
    ctx.save();
    for (const ft of texts) {
      ctx.globalAlpha = ft.alpha;
      ctx.fillStyle = ft.color;
      ctx.font = `bold ${Math.round(14 * ft.scale)}px "Cinzel", "Special Elite", serif`;
      ctx.textAlign = 'center';

      // Sombra de caneta escura para contraste
      ctx.strokeStyle = GAME_CONFIG.PALETTE.PEN_DARKEST;
      ctx.lineWidth = 2;
      ctx.strokeText(ft.text, ft.x, ft.y);
      ctx.fillText(ft.text, ft.x, ft.y);
    }
    ctx.restore();
  }

  /**
   * Renderiza Almas Espectrais Flutuantes liberadas na derrota de inimigos
   * Estilo caneta esferográfica azul/ciano com núcleo luminoso sobre pergaminho
   */
  public renderSoulOrbs(ctx: CanvasRenderingContext2D, orbs: SoulOrb[]) {
    ctx.save();
    for (const orb of orbs) {
      if (orb.collected) continue;

      const alpha = Math.min(1, orb.life / 0.4);
      ctx.globalAlpha = alpha;

      const pulse = Math.sin(orb.animTime * 6) * 2;
      const baseRadius = 8 + pulse;

      // 1. Halo etéreo externo desenhado com hachura fina
      ctx.save();
      ctx.strokeStyle = GAME_CONFIG.PALETTE.FX_SOUL_AURA;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(orb.x, orb.y, baseRadius + 6, 0, Math.PI * 2);
      ctx.stroke();

      // Linhas radiais de energia espiritual
      for (let i = 0; i < 6; i++) {
        const angle = orb.animTime * 2 + (i * Math.PI) / 3;
        const r1 = baseRadius + 3;
        const r2 = baseRadius + 8 + Math.sin(orb.animTime * 8 + i) * 3;
        ctx.beginPath();
        ctx.moveTo(orb.x + Math.cos(angle) * r1, orb.y + Math.sin(angle) * r1);
        ctx.lineTo(orb.x + Math.cos(angle) * r2, orb.y + Math.sin(angle) * r2);
        ctx.stroke();
      }
      ctx.restore();

      // 2. Chama/cauda da alma subindo
      ctx.save();
      ctx.fillStyle = GAME_CONFIG.PALETTE.FX_SOUL_CYAN;
      for (let w = 0; w < 3; w++) {
        const wispX = orb.x + Math.sin(orb.animTime * 5 + w * 2) * 4;
        const wispY = orb.y - 6 - w * 4 - Math.sin(orb.animTime * 4 + w) * 3;
        const wispSize = Math.max(1, 4 - w * 1.2);
        ctx.beginPath();
        ctx.arc(wispX, wispY, wispSize, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // 3. Núcleo da alma: esfera ciano com contorno de caneta azul profundo
      ctx.save();
      ctx.fillStyle = GAME_CONFIG.PALETTE.FX_SOUL_CYAN;
      ctx.beginPath();
      ctx.arc(orb.x, orb.y, baseRadius, 0, Math.PI * 2);
      ctx.fill();

      // Contorno de caneta escura
      ctx.strokeStyle = GAME_CONFIG.PALETTE.PEN_PRIMARY;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // 4. Centro brilhante de luz pura
      ctx.fillStyle = GAME_CONFIG.PALETTE.FX_SOUL_CORE;
      ctx.beginPath();
      ctx.arc(orb.x, orb.y, baseRadius * 0.5, 0, Math.PI * 2);
      ctx.fill();

      // Brilho em cruz de luz
      ctx.strokeStyle = GAME_CONFIG.PALETTE.FX_HOLY_WHITE;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(orb.x - 5, orb.y);
      ctx.lineTo(orb.x + 5, orb.y);
      ctx.moveTo(orb.x, orb.y - 5);
      ctx.lineTo(orb.x, orb.y + 5);
      ctx.stroke();
      ctx.restore();
    }
    ctx.restore();
  }

  /**
   * Renderiza a aura de Ascensão ao redor do Cavaleiro quando possui níveis de ascensão
   */
  public renderPlayerAscensionAura(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    ascensionLevel: number,
    animTime: number
  ) {
    if (ascensionLevel <= 0) return;

    ctx.save();
    const centerX = x + w / 2;
    const centerY = y + h / 2;

    // Anéis de poder sagrado orbitando o cavaleiro
    const ringCount = Math.min(3, ascensionLevel);
    for (let r = 0; r < ringCount; r++) {
      const radius = 34 + r * 8 + Math.sin(animTime * 3 + r) * 3;
      ctx.strokeStyle = r === 0 ? GAME_CONFIG.PALETTE.FX_SOUL_AURA : GAME_CONFIG.PALETTE.FX_HOLY_GOLD;
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);

      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Centelhas etéreas ascendentes
    const sparkCount = ascensionLevel * 2;
    for (let i = 0; i < sparkCount; i++) {
      const offsetAngle = (animTime * 1.5 + (i * Math.PI * 2) / sparkCount);
      const sparkX = centerX + Math.cos(offsetAngle) * (26 + (i % 2) * 8);
      const sparkY = centerY + Math.sin(offsetAngle) * (32 + (i % 2) * 6) - (animTime * 20 % 30);

      ctx.fillStyle = i % 2 === 0 ? GAME_CONFIG.PALETTE.FX_SOUL_CYAN : GAME_CONFIG.PALETTE.FX_HOLY_GOLD;
      ctx.beginPath();
      ctx.arc(sparkX, sparkY, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  /**
   * Renderiza a Barra de Progresso de 'Ascensão' no topo do Canvas
   * Estilo Manuscrito Gótico e Caneta Esferográfica com Ornamentos e Efeito de Almas
   */
  public renderInGameAscensionBar(ctx: CanvasRenderingContext2D, stats: AscensionStats, animTime: number) {
    ctx.save();
    const w = GAME_CONFIG.CANVAS_WIDTH;
    const barW = 320;
    const barH = 14;
    const barX = (w - barW) / 2;
    const barY = 16;

    // 1. Placa/fundo de pergaminho para a barra
    ctx.fillStyle = 'rgba(244, 236, 216, 0.95)';
    ctx.strokeStyle = GAME_CONFIG.PALETTE.PEN_PRIMARY;
    ctx.lineWidth = 1.5;

    // Moldura chanfrada com pontas decoradas
    ctx.beginPath();
    ctx.moveTo(barX - 18, barY + barH / 2);
    ctx.lineTo(barX - 8, barY - 4);
    ctx.lineTo(barX + barW + 8, barY - 4);
    ctx.lineTo(barX + barW + 18, barY + barH / 2);
    ctx.lineTo(barX + barW + 8, barY + barH + 18);
    ctx.lineTo(barX - 8, barY + barH + 18);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // 2. Detalhes ornamentais laterais (asas/floreios de caneta)
    ctx.beginPath();
    ctx.moveTo(barX - 18, barY + barH / 2);
    ctx.lineTo(barX - 26, barY + barH / 2 - 4);
    ctx.lineTo(barX - 22, barY + barH / 2 + 5);
    ctx.moveTo(barX + barW + 18, barY + barH / 2);
    ctx.lineTo(barX + barW + 26, barY + barH / 2 - 4);
    ctx.lineTo(barX + barW + 22, barY + barH / 2 + 5);
    ctx.strokeStyle = GAME_CONFIG.PALETTE.PEN_PRIMARY;
    ctx.stroke();

    // 3. Fundo do canal da barra de progresso
    ctx.fillStyle = GAME_CONFIG.PALETTE.PAPER_ACCENT;
    ctx.fillRect(barX, barY, barW, barH);
    ctx.strokeStyle = GAME_CONFIG.PALETTE.PEN_PRIMARY;
    ctx.lineWidth = 1;
    ctx.strokeRect(barX, barY, barW, barH);

    // 4. Preenchimento da barra de Ascensão (Progresso de Almas)
    const fillW = Math.max(0, Math.min(barW, (stats.progressPercent / 100) * barW));
    if (fillW > 0) {
      // Preenchimento com gradiente de energia de alma (ciano para ouro celestial)
      const grad = ctx.createLinearGradient(barX, barY, barX + fillW, barY);
      grad.addColorStop(0, GAME_CONFIG.PALETTE.PEN_LIGHT);
      grad.addColorStop(0.5, GAME_CONFIG.PALETTE.FX_SOUL_CYAN);
      grad.addColorStop(1, stats.level >= 3 ? GAME_CONFIG.PALETTE.FX_HOLY_GOLD : GAME_CONFIG.PALETTE.FX_SOUL_AURA);

      ctx.fillStyle = grad;
      ctx.fillRect(barX + 1, barY + 1, fillW - 2, barH - 2);

      // Hachuras inclinadas de caneta dentro do preenchimento
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 1;
      for (let hx = barX + (animTime * 15 % 10); hx < barX + fillW; hx += 10) {
        ctx.beginPath();
        ctx.moveTo(hx, barY + 1);
        ctx.lineTo(hx - 4, barY + barH - 1);
        ctx.stroke();
      }

      // Ponta luminosa na frente da barra
      ctx.fillStyle = GAME_CONFIG.PALETTE.FX_HOLY_WHITE;
      ctx.beginPath();
      ctx.arc(barX + fillW, barY + barH / 2, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    // 5. Divisórias de checkpoints de progresso
    ctx.strokeStyle = 'rgba(10, 37, 112, 0.5)';
    ctx.lineWidth = 1;
    const steps = 4;
    for (let s = 1; s < steps; s++) {
      const sx = barX + (barW * s) / steps;
      ctx.beginPath();
      ctx.moveTo(sx, barY);
      ctx.lineTo(sx, barY + barH);
      ctx.stroke();
    }

    // 6. Texto Superior da Barra: Nível de Ascensão e Almas
    ctx.font = 'bold 9px "Cinzel", serif';
    ctx.fillStyle = GAME_CONFIG.PALETTE.PEN_DARKEST;
    ctx.textAlign = 'left';
    ctx.fillText(
      `ASCENSÃO: GRAU ${stats.level} • ${stats.title.toUpperCase()}`,
      barX,
      barY - 7
    );

    // Contagem de Almas no lado direito
    ctx.textAlign = 'right';
    ctx.fillStyle = GAME_CONFIG.PALETTE.PEN_PRIMARY;
    ctx.fillText(
      `${stats.soulsCurrentLevel}/${stats.soulsNeededForNext} ALMAS (${stats.progressPercent}%)`,
      barX + barW,
      barY - 7
    );

    // 7. Subtexto / Bônus Ativo abaixo da barra
    ctx.font = 'italic 8.5px serif';
    ctx.fillStyle = stats.level > 0 ? GAME_CONFIG.PALETTE.FX_BLOOD_RED : 'rgba(10, 37, 112, 0.7)';
    ctx.textAlign = 'center';
    ctx.fillText(
      `Bônus: ${stats.bonusText} (${Math.round(stats.damageMultiplier * 100)}% Poder)`,
      barX + barW / 2,
      barY + barH + 12
    );

    // 8. Pequeno orbe/ícone de alma à esquerda da barra
    const soulPulse = Math.sin(animTime * 5) * 1.5;
    ctx.fillStyle = GAME_CONFIG.PALETTE.FX_SOUL_CYAN;
    ctx.beginPath();
    ctx.arc(barX - 10, barY + barH / 2, 4 + soulPulse, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = GAME_CONFIG.PALETTE.PEN_PRIMARY;
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.restore();
  }

  // Pós-processamento de vinheta e textura granulada de papel
  public renderPostProcessing(ctx: CanvasRenderingContext2D) {
    const w = GAME_CONFIG.CANVAS_WIDTH;
    const h = GAME_CONFIG.CANVAS_HEIGHT;

    ctx.save();

    // 1. Textura de ruído de papel (pattern repeat)
    if (this.noiseCanvas) {
      const pattern = ctx.createPattern(this.noiseCanvas, 'repeat');
      if (pattern) {
        ctx.fillStyle = pattern;
        ctx.fillRect(0, 0, w, h);
      }
    }

    // 2. Vinheta escura sutil nas bordas (efeito papel antigo envelhecido)
    const vignette = ctx.createRadialGradient(
      w / 2, h / 2, Math.min(w, h) * 0.45,
      w / 2, h / 2, Math.max(w, h) * 0.72
    );
    vignette.addColorStop(0, 'rgba(10, 37, 112, 0)');
    vignette.addColorStop(1, 'rgba(15, 30, 75, 0.22)');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, w, h);

    // 3. Borda em moldura dupla desenhada à mão
    ctx.strokeStyle = GAME_CONFIG.PALETTE.PEN_PRIMARY;
    ctx.lineWidth = 3;
    ctx.strokeRect(4, 4, w - 8, h - 8);

    ctx.strokeStyle = GAME_CONFIG.PALETTE.PEN_LIGHT;
    ctx.lineWidth = 1;
    ctx.strokeRect(8, 8, w - 16, h - 16);

    ctx.restore();
  }

  // =========================================================================
  // PARALLAX ESPECÍFICO: FLORESTA CORROMPIDA
  // =========================================================================

  private renderParallaxForestDistant(ctx: CanvasRenderingContext2D, cameraX: number) {
    ctx.save();
    const parallaxFactor = 0.14;
    const baseOffsetX = -(cameraX * parallaxFactor);
    const loopW = 750;
    const baseY = 360;

    ctx.strokeStyle = GAME_CONFIG.PALETTE.PEN_LIGHT;
    ctx.lineWidth = 1.2;
    ctx.fillStyle = 'rgba(232, 224, 202, 0.5)';

    for (let i = -1; i <= 2; i++) {
      const startX = (i * loopW) + (baseOffsetX % loopW);
      ctx.beginPath();
      ctx.moveTo(startX, baseY + 90);

      // Silhuetas de copas pontiagudas de pinheiros e copas retorcidas
      for (let tx = 0; tx < loopW; tx += 60) {
        const peakH = 45 + ((tx * 17) % 35);
        ctx.lineTo(startX + tx + 15, baseY - peakH);
        ctx.lineTo(startX + tx + 30, baseY - peakH + 15);
        ctx.lineTo(startX + tx + 45, baseY - peakH - 10);
        ctx.lineTo(startX + tx + 60, baseY + 10);
      }
      ctx.lineTo(startX + loopW, baseY + 90);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Hachuras verticais de árvores distantes
      ctx.strokeStyle = 'rgba(37, 90, 196, 0.22)';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      for (let hx = startX + 20; hx < startX + loopW - 20; hx += 14) {
        ctx.moveTo(hx, baseY - 30);
        ctx.lineTo(hx, baseY + 40);
      }
      ctx.stroke();
    }
    ctx.restore();
  }

  private renderParallaxForestGnarledTrees(ctx: CanvasRenderingContext2D, cameraX: number) {
    ctx.save();
    const parallaxFactor = 0.26;
    const baseOffsetX = -(cameraX * parallaxFactor);
    const loopW = 850;
    const baseY = 400;

    ctx.strokeStyle = GAME_CONFIG.PALETTE.PEN_SECONDARY;
    ctx.lineWidth = 1.5;

    for (let i = -1; i <= 2; i++) {
      const startX = (i * loopW) + (baseOffsetX % loopW);

      // Tronco retorcido 1
      const t1x = startX + 180;
      ctx.beginPath();
      ctx.moveTo(t1x - 18, baseY + 40);
      ctx.quadraticCurveTo(t1x - 30, baseY - 80, t1x - 65, baseY - 160);
      ctx.lineTo(t1x - 45, baseY - 160);
      ctx.quadraticCurveTo(t1x - 10, baseY - 70, t1x + 14, baseY + 40);
      ctx.stroke();

      // Galhos espinhosos se estendendo
      ctx.beginPath();
      ctx.moveTo(t1x - 40, baseY - 110);
      ctx.lineTo(t1x + 40, baseY - 145);
      ctx.lineTo(t1x + 85, baseY - 130);

      ctx.moveTo(t1x - 55, baseY - 140);
      ctx.lineTo(t1x - 110, baseY - 170);
      ctx.lineTo(t1x - 130, baseY - 150);
      ctx.stroke();

      // Cipós e raízes penduradas (hachuras em gotas)
      ctx.strokeStyle = 'rgba(20, 61, 153, 0.45)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let vx = t1x - 80; vx <= t1x + 60; vx += 24) {
        ctx.moveTo(vx, baseY - 120);
        ctx.quadraticCurveTo(vx + 6, baseY - 70, vx - 4, baseY - 40);
      }
      ctx.stroke();

      // Tronco retorcido 2 com oco
      const t2x = startX + 540;
      ctx.strokeStyle = GAME_CONFIG.PALETTE.PEN_SECONDARY;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(t2x - 24, baseY + 40);
      ctx.quadraticCurveTo(t2x + 15, baseY - 60, t2x + 45, baseY - 175);
      ctx.lineTo(t2x + 65, baseY - 175);
      ctx.quadraticCurveTo(t2x + 35, baseY - 50, t2x + 20, baseY + 40);
      ctx.stroke();

      // Oco da árvore
      ctx.beginPath();
      ctx.arc(t2x + 22, baseY - 45, 12, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(10, 37, 112, 0.35)';
      ctx.fill();
      ctx.stroke();
    }
    ctx.restore();
  }

  private renderParallaxForestSpores(ctx: CanvasRenderingContext2D, cameraX: number) {
    ctx.save();
    const time = Date.now() * 0.001;
    const baseOffsetX = -(cameraX * 0.35);
    const loopW = 600;

    ctx.fillStyle = 'rgba(37, 90, 196, 0.5)';
    ctx.strokeStyle = GAME_CONFIG.PALETTE.PEN_LIGHT;

    for (let i = -1; i <= 2; i++) {
      const startX = (i * loopW) + (baseOffsetX % loopW);
      for (let s = 0; s < 12; s++) {
        const sx = startX + (s * 52) + Math.sin(time + s) * 16;
        const sy = 160 + ((s * 29) % 220) + Math.cos(time * 0.8 + s) * 12;
        ctx.beginPath();
        ctx.arc(sx, sy, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  }

  // =========================================================================
  // PARALLAX ESPECÍFICO: CRIPTA ESQUECIDA
  // =========================================================================

  private renderParallaxCryptVaults(ctx: CanvasRenderingContext2D, cameraX: number) {
    ctx.save();
    const parallaxFactor = 0.15;
    const baseOffsetX = -(cameraX * parallaxFactor);
    const loopW = 700;

    ctx.strokeStyle = GAME_CONFIG.PALETTE.PEN_SECONDARY;
    ctx.lineWidth = 1.3;

    for (let i = -1; i <= 2; i++) {
      const startX = (i * loopW) + (baseOffsetX % loopW);

      // Abóbada gótica ogival no teto subterrâneo
      for (let archX = startX; archX < startX + loopW; archX += 220) {
        ctx.beginPath();
        ctx.moveTo(archX, 0);
        ctx.lineTo(archX, 85);
        ctx.quadraticCurveTo(archX + 110, 160, archX + 220, 85);
        ctx.lineTo(archX + 220, 0);
        ctx.stroke();

        // Nervuras centrais da abóbada ogival
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(37, 90, 196, 0.35)';
        ctx.lineWidth = 0.9;
        ctx.moveTo(archX + 110, 0);
        ctx.lineTo(archX + 110, 150);
        ctx.moveTo(archX + 40, 40);
        ctx.lineTo(archX + 110, 130);
        ctx.moveTo(archX + 180, 40);
        ctx.lineTo(archX + 110, 130);
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  private renderParallaxCryptPillars(ctx: CanvasRenderingContext2D, cameraX: number) {
    ctx.save();
    const parallaxFactor = 0.3;
    const baseOffsetX = -(cameraX * parallaxFactor);
    const loopW = 800;
    const baseY = 440;

    ctx.strokeStyle = GAME_CONFIG.PALETTE.PEN_PRIMARY;
    ctx.lineWidth = 1.6;

    for (let i = -1; i <= 2; i++) {
      const startX = (i * loopW) + (baseOffsetX % loopW);

      // Pilares de sustentação góticos maciços
      for (let px = startX + 100; px < startX + loopW; px += 340) {
        // Coluna principal
        ctx.strokeRect(px, 70, 48, baseY - 70);

        // Capitel esculpido no topo
        ctx.strokeRect(px - 8, 70, 64, 18);

        // Base de pedra alargada
        ctx.strokeRect(px - 10, baseY - 30, 68, 30);

        // Hachuras cruzadas de tijolos de cantaria
        ctx.strokeStyle = 'rgba(20, 61, 153, 0.4)';
        ctx.lineWidth = 0.9;
        ctx.beginPath();
        for (let py = 100; py < baseY - 30; py += 22) {
          ctx.moveTo(px, py);
          ctx.lineTo(px + 48, py);
          ctx.moveTo(px + 14, py);
          ctx.lineTo(px + 14, py + 18);
        }
        ctx.stroke();

        // Corrente de ferro pendurada na coluna
        ctx.strokeStyle = GAME_CONFIG.PALETTE.PEN_DARKEST;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        let chainY = 120;
        ctx.moveTo(px + 52, chainY);
        for (let c = 0; c < 5; c++) {
          ctx.arc(px + 54, chainY + 8, 5, 0, Math.PI * 2);
          chainY += 12;
        }
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  private renderParallaxCryptTombs(ctx: CanvasRenderingContext2D, cameraX: number) {
    ctx.save();
    const parallaxFactor = 0.22;
    const baseOffsetX = -(cameraX * parallaxFactor);
    const loopW = 850;
    const baseY = 430;

    ctx.strokeStyle = GAME_CONFIG.PALETTE.PEN_SECONDARY;
    ctx.lineWidth = 1.3;
    ctx.fillStyle = 'rgba(230, 222, 200, 0.6)';

    for (let i = -1; i <= 2; i++) {
      const startX = (i * loopW) + (baseOffsetX % loopW);

      // Sarcófagos de pedra no fundo
      for (let tx = startX + 160; tx < startX + loopW; tx += 380) {
        ctx.fillRect(tx, baseY - 45, 90, 45);
        ctx.strokeRect(tx, baseY - 45, 90, 45);

        // Tampa do sarcófago
        ctx.strokeRect(tx - 4, baseY - 54, 98, 10);

        // Cruz entalhada na pedra
        ctx.beginPath();
        ctx.moveTo(tx + 45, baseY - 38);
        ctx.lineTo(tx + 45, baseY - 12);
        ctx.moveTo(tx + 32, baseY - 28);
        ctx.lineTo(tx + 58, baseY - 28);
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  // =========================================================================
  // BANNER DE TÍTULO DA SEÇÃO / ZONA (Entrada em nova área)
  // =========================================================================

  public renderSectionTitleBanner(
    ctx: CanvasRenderingContext2D,
    title: string,
    subtitle: string,
    alpha: number
  ) {
    if (alpha <= 0) return;

    ctx.save();
    const w = GAME_CONFIG.CANVAS_WIDTH;
    const cx = w / 2;
    const cy = 105;

    ctx.globalAlpha = Math.min(1, Math.max(0, alpha));

    // Fita / Placa de pergaminho de fundo com sombra de caneta
    const boxW = 380;
    const boxH = 68;
    ctx.fillStyle = 'rgba(244, 237, 216, 0.95)';
    ctx.fillRect(cx - boxW / 2, cy - boxH / 2, boxW, boxH);

    // Moldura dupla estilo códice medieval
    ctx.strokeStyle = GAME_CONFIG.PALETTE.PEN_DARKEST;
    ctx.lineWidth = 2;
    ctx.strokeRect(cx - boxW / 2, cy - boxH / 2, boxW, boxH);

    ctx.strokeStyle = GAME_CONFIG.PALETTE.PEN_PRIMARY;
    ctx.lineWidth = 1;
    ctx.strokeRect(cx - boxW / 2 + 4, cy - boxH / 2 + 4, boxW - 8, boxH - 8);

    // Linha divisória com cruz central
    ctx.beginPath();
    ctx.strokeStyle = GAME_CONFIG.PALETTE.MARGIN_LINE;
    ctx.lineWidth = 1.2;
    ctx.moveTo(cx - 130, cy + 8);
    ctx.lineTo(cx - 15, cy + 8);
    ctx.moveTo(cx + 15, cy + 8);
    ctx.lineTo(cx + 130, cy + 8);
    ctx.stroke();

    // Pequena cruz dourada
    ctx.strokeStyle = GAME_CONFIG.PALETTE.FX_HOLY_GOLD;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(cx, cy + 2);
    ctx.lineTo(cx, cy + 14);
    ctx.moveTo(cx - 5, cy + 6);
    ctx.lineTo(cx + 5, cy + 6);
    ctx.stroke();

    // Título Principal
    ctx.font = 'bold 20px "Cinzel", "Cinzel Decorative", serif';
    ctx.fillStyle = GAME_CONFIG.PALETTE.PEN_DARKEST;
    ctx.textAlign = 'center';
    ctx.letterSpacing = '2px';
    ctx.fillText(title.toUpperCase(), cx, cy - 4);

    // Subtítulo em caligrafia
    ctx.font = 'italic bold 13px "Caveat", "Special Elite", cursive';
    ctx.fillStyle = GAME_CONFIG.PALETTE.PEN_PRIMARY;
    ctx.fillText(subtitle, cx, cy + 24);

    ctx.restore();
  }

  // =========================================================================
  // OVERLAY DE TRANSIÇÃO ENTRE SEÇÕES (Dissolução de Tinta / Vinheta)
  // =========================================================================

  public renderScreenTransition(ctx: CanvasRenderingContext2D, alpha: number) {
    if (alpha <= 0) return;

    ctx.save();
    const w = GAME_CONFIG.CANVAS_WIDTH;
    const h = GAME_CONFIG.CANVAS_HEIGHT;

    ctx.globalAlpha = Math.min(1, Math.max(0, alpha));

    // Banho de tinta azul profundo que recobre a tela
    ctx.fillStyle = 'rgba(10, 37, 112, 0.88)';
    ctx.fillRect(0, 0, w, h);

    // Vinheta negra radial de borda
    const grad = ctx.createRadialGradient(w / 2, h / 2, 80, w / 2, h / 2, Math.max(w, h) * 0.6);
    grad.addColorStop(0, 'rgba(5, 18, 55, 0.1)');
    grad.addColorStop(1, 'rgba(5, 18, 55, 0.95)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Símbolo sutil da lâmina e cálice de sal no centro durante a virada
    ctx.font = 'italic 15px "Cinzel", serif';
    ctx.fillStyle = GAME_CONFIG.PALETTE.PAPER_BG;
    ctx.textAlign = 'center';
    ctx.fillText('Transitando pelo Manuscrito...', w / 2, h / 2 + 10);

    ctx.restore();
  }
}

