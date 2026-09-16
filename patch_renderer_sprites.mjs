import fs from 'fs';
let code = fs.readFileSync('src/game/rendering/PenRenderer.ts', 'utf8');

const anchorProp = `  private fogoSprites: HTMLImageElement[] = [];`;
const injProp = `  private fogoSprites: HTMLImageElement[] = [];
  private caixaSprites: HTMLImageElement[] = [];`;
code = code.replace(anchorProp, injProp);

const anchorLoad = `    if (typeof window !== "undefined") {
      for(let i=1; i<=4; i++) {
        const img = new Image();
        img.src = \`/fogo\${i}.png\`;
        this.fogoSprites.push(img);
      }
    }`;
const injLoad = `    if (typeof window !== "undefined") {
      for(let i=1; i<=4; i++) {
        const img = new Image();
        img.src = \`/fogo\${i}.png\`;
        this.fogoSprites.push(img);
      }
      
      for(let i=1; i<=4; i++) {
        const img = new Image();
        img.src = \`/caixa\${i}.png\`;
        this.caixaSprites.push(img);
      }
    }`;
code = code.replace(anchorLoad, injLoad);


const drawAnchor = `  public drawDestructible(ctx: CanvasRenderingContext2D, destructible: Destructible) {
    ctx.save();
    const { x, y, width, height, type } = destructible;
    const primary = GAME_CONFIG.PALETTE.PEN_PRIMARY;
    const hatch = GAME_CONFIG.PALETTE.PEN_HATCHING;

    ctx.fillStyle = '#ffffff'; // Solid white background so it stands out against the parchment
    if (type === 'box') {
      ctx.fillRect(x, y, width, height);
    } else if (type === 'vase') {`;

const drawInj = `  public drawDestructible(ctx: CanvasRenderingContext2D, destructible: Destructible) {
    ctx.save();
    const { x, y, width, height, type } = destructible;
    const isDestroying = (destructible as any).isDestroying;
    const animTime = (destructible as any).animTime || 0;
    const primary = GAME_CONFIG.PALETTE.PEN_PRIMARY;
    const hatch = GAME_CONFIG.PALETTE.PEN_HATCHING;

    if (type === 'box') {
      let frame = 0;
      if (isDestroying) {
        // animTime vai de 0 a 0.4.
        frame = Math.min(3, Math.floor((animTime / 0.4) * 4));
      }
      
      const img = this.caixaSprites[frame];
      if (img && img.complete && img.naturalWidth > 0) {
        // Reduzimos um pouco o width/height padrão na hora de desenhar para bater com as hitboxes,
        // ou desenhamos um pouco maior e centralizamos.
        // A hitbox é width=30, height=30 (definida em Destructible.ts)
        // Se a sprite for maior, podemos desenhar com um fator de escala.
        // Vou desenhar do tamanho exato da hitbox (x, y, width, height) pra ficar alinhado.
        ctx.drawImage(img, x, y, width, height);
      } else {
        // Fallback
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x, y, width, height);
        ctx.strokeStyle = primary;
        ctx.lineWidth = 1.8;
        ctx.strokeRect(x, y, width, height);
      }
      ctx.restore();
      return;
    }

    ctx.fillStyle = '#ffffff'; // Solid white background so it stands out against the parchment
    if (type === 'vase') {`;

code = code.replace(drawAnchor, drawInj);

fs.writeFileSync('src/game/rendering/PenRenderer.ts', code);
console.log('PenRenderer patched for caixas');
