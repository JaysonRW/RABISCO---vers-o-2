import fs from 'fs';
let code = fs.readFileSync('src/game/rendering/PenRenderer.ts', 'utf8');

// Adiciona propriedades de imagem e carregamento
const propsAnchor = `  private fireGlowImg: HTMLImageElement;`;
const propsInj = `  private fireGlowImg: HTMLImageElement;
  private caixa1Img: HTMLImageElement;
  private caixa2Img: HTMLImageElement;
  private caixa3Img: HTMLImageElement;
  private caixa4Img: HTMLImageElement;`;
if(code.includes(propsAnchor)) { code = code.replace(propsAnchor, propsInj); }

const constrAnchor = `    this.fireGlowImg = new Image();
    this.fireGlowImg.src = '/fire_glow.png';`; // Just an example, let's see constructor
