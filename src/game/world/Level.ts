/**
 * O Cavaleiro Arruinado - Level / World Design
 * Plataformas, perigos e notas de grimório escritas à mão no pergaminho
 */

import { Rect } from '../types';
import { PenRenderer } from '../rendering/PenRenderer';
import { GAME_CONFIG } from '../config';
import { BiomeTheme, EdgeTrigger, SectionData, SECTIONS_DATA } from './Section';

export interface PlatformData extends Rect {
  type: 'GROUND' | 'FLOATING' | 'WOOD';
}

export interface LoreNote {
  x: number;
  y: number;
  title: string;
  lines: string[];
}

export interface SaltAltar {
  x: number;
  y: number;
  width: number;
  height: number;
  hasRefill: boolean;
}

export class Level {
  public sectionId: string = 'monastery_courtyard';
  public sectionName: string = 'Pátio do Monastério';
  public sectionSubtitle: string = 'O Santuário das Cruzes';
  public theme: BiomeTheme = 'MONASTERY';

  public width: number = 2400;
  public height: number = 540;

  public platforms: PlatformData[] = [];
  public saltAltars: SaltAltar[] = [];
  public loreNotes: LoreNote[] = [];
  public edgeTriggers: EdgeTrigger[] = [];

  constructor(initialSection: SectionData = SECTIONS_DATA.monastery_courtyard) {
    this.loadSection(initialSection);
  }

  public loadSection(section: SectionData) {
    this.sectionId = section.id;
    this.sectionName = section.name;
    this.sectionSubtitle = section.subtitle;
    this.theme = section.theme;
    this.width = section.width;
    this.height = section.height;

    // Clona plataformas e objetos para permitir alteração em runtime (ex: altares usados)
    this.platforms = section.platforms.map(p => ({ ...p }));
    this.saltAltars = section.saltAltars.map(a => ({ ...a }));
    this.loreNotes = section.loreNotes.map(n => ({ ...n }));
    this.edgeTriggers = section.edgeTriggers.map(t => ({ ...t }));
  }

  public render(ctx: CanvasRenderingContext2D, renderer: PenRenderer) {
    // 1. Renderiza Plataformas com caneta esferográfica e hachuras azuis
    for (const plat of this.platforms) {
      renderer.renderPlatform(ctx, plat.x, plat.y, plat.width, plat.height, plat.type);
    }

    // 2. Renderiza Altares de Sal Consagrado
    for (const altar of this.saltAltars) {
      this.renderAltar(ctx, altar);
    }

    // 3. Renderiza Anotações de Caderno no Cenário

    // 4. Renderiza Portais e Indicadores de Borda de Tela (Edge Gateways)
    this.renderEdgeGateways(ctx);
  }

  private renderEdgeGateways(ctx: CanvasRenderingContext2D) {
    const time = Date.now() * 0.003;
    const penDark = GAME_CONFIG.PALETTE.PEN_DARKEST;
    const penMid = GAME_CONFIG.PALETTE.PEN_PRIMARY;
    const gold = GAME_CONFIG.PALETTE.FX_HOLY_GOLD;

    for (const trigger of this.edgeTriggers) {
      ctx.save();
      const isRight = trigger.side === 'RIGHT';
      const gx = isRight ? trigger.bounds.x : trigger.bounds.x + trigger.bounds.width;
      const groundY = 440;

      // 1. Portal / Marco de Pedra / Árvore de passagem desenhada em caneta azul
      ctx.strokeStyle = penDark;
      ctx.lineWidth = 2.2;
      ctx.fillStyle = GAME_CONFIG.PALETTE.PAPER_BG;

      if (isRight) {
        // Arco de passagem à direita
        const archX = trigger.bounds.x + 10;
        ctx.beginPath();
        ctx.moveTo(archX, groundY);
        ctx.lineTo(archX, groundY - 140);
        ctx.quadraticCurveTo(archX + 35, groundY - 180, archX + 70, groundY - 140);
        ctx.lineTo(archX + 70, groundY);
        ctx.stroke();

        // Hachuras decorativas do portal
        ctx.strokeStyle = penMid;
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let y = groundY - 130; y < groundY; y += 12) {
          ctx.moveTo(archX + 2, y);
          ctx.lineTo(archX + 16, y + 8);
        }
        ctx.stroke();

        // Cruz ou selo no topo do arco
        ctx.strokeStyle = penDark;
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(archX + 35, groundY - 180);
        ctx.lineTo(archX + 35, groundY - 195);
        ctx.moveTo(archX + 28, groundY - 188);
        ctx.lineTo(archX + 42, groundY - 188);
        ctx.stroke();

        // Seta fluida animada apontando para a direita
        const pulse = Math.sin(time) * 6;
        ctx.fillStyle = penMid;
        ctx.beginPath();
        const arrowX = archX + 30 + pulse;
        const arrowY = groundY - 70;
        ctx.moveTo(arrowX - 8, arrowY - 10);
        ctx.lineTo(arrowX + 8, arrowY);
        ctx.lineTo(arrowX - 8, arrowY + 10);
        ctx.closePath();
        ctx.fill();

        // Rótulo da Próxima Seção
        ctx.font = 'bold 11px "Cinzel", serif';
        ctx.fillStyle = penDark;
        ctx.textAlign = 'right';
        ctx.fillText(trigger.label, archX + 60, groundY - 150);

        ctx.font = 'italic 10px "Caveat", cursive';
        ctx.fillStyle = penMid;
      } else {
        // Marco de passagem à esquerda
        const postX = trigger.bounds.x + trigger.bounds.width - 20;
        ctx.beginPath();
        ctx.moveTo(postX, groundY);
        ctx.lineTo(postX, groundY - 140);
        ctx.quadraticCurveTo(postX - 35, groundY - 180, postX - 70, groundY - 140);
        ctx.lineTo(postX - 70, groundY);
        ctx.stroke();

        // Seta fluida animada apontando para a esquerda
        const pulse = Math.sin(time) * 6;
        ctx.fillStyle = penMid;
        ctx.beginPath();
        const arrowX = postX - 30 - pulse;
        const arrowY = groundY - 70;
        ctx.moveTo(arrowX + 8, arrowY - 10);
        ctx.lineTo(arrowX - 8, arrowY);
        ctx.lineTo(arrowX + 8, arrowY + 10);
        ctx.closePath();
        ctx.fill();

        // Rótulo da Próxima Seção
        ctx.font = 'bold 11px "Cinzel", serif';
        ctx.fillStyle = penDark;
        ctx.textAlign = 'left';
        ctx.fillText(trigger.label, postX - 60, groundY - 150);

        ctx.font = 'italic 10px "Caveat", cursive';
        ctx.fillStyle = penMid;
      }

      ctx.restore();
    }
  }

  private renderAltar(ctx: CanvasRenderingContext2D, altar: SaltAltar) {
    ctx.save();
    const penDark = GAME_CONFIG.PALETTE.PEN_DARKEST;
    const penMid = GAME_CONFIG.PALETTE.PEN_PRIMARY;
    const gold = GAME_CONFIG.PALETTE.FX_HOLY_GOLD;

    // Base de pedra
    ctx.fillStyle = GAME_CONFIG.PALETTE.PAPER_BG;
    ctx.strokeStyle = penDark;
    ctx.lineWidth = 1.8;
    ctx.fillRect(altar.x, altar.y, altar.width, altar.height);
    ctx.strokeRect(altar.x, altar.y, altar.width, altar.height);

    // Hachura de pedra no pedestal
    ctx.strokeStyle = penMid;
    ctx.lineWidth = 1;
    for (let y = altar.y + 4; y < altar.y + altar.height; y += 7) {
      ctx.beginPath();
      ctx.moveTo(altar.x + 4, y);
      ctx.lineTo(altar.x + altar.width - 4, y + 2);
      ctx.stroke();
    }

    // Cálice de sal em cima do altar
    ctx.beginPath();
    ctx.strokeStyle = penDark;
    ctx.lineWidth = 2;
    const cx = altar.x + altar.width / 2;
    const cy = altar.y - 6;
    ctx.arc(cx, cy, 10, 0, Math.PI);
    ctx.stroke();

    // Brilho dourado se o sal estiver disponível para coleta
    if (altar.hasRefill) {
      ctx.fillStyle = gold;
      ctx.beginPath();
      ctx.arc(cx, cy - 3, 5, 0, Math.PI * 2);
      ctx.fill();

      // Cruz sagrada brilhante
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(cx, cy - 8);
      ctx.lineTo(cx, cy + 2);
      ctx.moveTo(cx - 5, cy - 3);
      ctx.lineTo(cx + 5, cy - 3);
      ctx.stroke();

      // Texto de interação
      ctx.font = 'bold 9px "Cinzel", serif';
      ctx.fillStyle = penDark;
      ctx.textAlign = 'center';
      ctx.fillText('[E] Altar de Sal', cx, altar.y - 18);
    }

    ctx.restore();
  }

}
