/**
 * O Cavaleiro Arruinado - NPC System
 * Personagens não-jogáveis para diálogos narrativos, dicas de sobrevivência
 * e trocas de almas por bênçãos ou bênçãos de sal.
 */

import { PenRenderer } from '../rendering/PenRenderer';
import { Rect } from '../types';

export interface DialogChoice {
  text: string;
  soulCost?: number;
  actionId?: 'HEAL' | 'REFILL_SALT' | 'BLESS_STAMINA' | 'CLOSE' | 'START_CLIMAX';
}

export interface NpcDialogNode {
  id: string;
  speaker: string;
  lines: string[];
  choices?: DialogChoice[];
}

export class NPC {
  public id: string;
  public name: string;
  public title: string;
  public x: number;
  public y: number;
  public width: number = 38;
  public height: number = 62;
  public dialogs: NpcDialogNode[];
  public currentDialogId: string;
  public autoTriggerDistance?: number;
  public hasTriggeredAutoDialog: boolean = false;
  public animTime: number = 0;
  public iconType: 'HERMIT' | 'SPIRIT';

  constructor(
    id: string,
    name: string,
    title: string,
    x: number,
    y: number,
    dialogs: NpcDialogNode[],
    iconType: 'HERMIT' | 'SPIRIT' = 'HERMIT'
  ) {
    this.id = id;
    this.name = name;
    this.title = title;
    this.x = x;
    this.y = y;
    this.dialogs = dialogs;
    this.currentDialogId = dialogs[0]?.id || '';
    this.iconType = iconType;
  }

  public update(dt: number) {
    this.animTime += dt;
  }

  public getBounds(): Rect {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
    };
  }

  public getCurrentDialog(): NpcDialogNode | undefined {
    return this.dialogs.find((d) => d.id === this.currentDialogId);
  }

  public render(ctx: CanvasRenderingContext2D, renderer: PenRenderer, isPlayerNearby: boolean) {
    renderer.renderNPC(
      ctx,
      this.x,
      this.y,
      this.width,
      this.height,
      this.iconType,
      this.animTime,
      isPlayerNearby,
      this.name
    );
  }
}
