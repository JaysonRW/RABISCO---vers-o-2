import fs from 'fs';
let code = fs.readFileSync('src/game/entities/Destructible.ts', 'utf8');

const initialProperties = `  public hp: number;
  public isDestroyed: boolean = false;`;

const newProperties = `  public hp: number;
  public isDestroyed: boolean = false;
  public isDestroying: boolean = false;
  public animTime: number = 0;`;

code = code.replace(initialProperties, newProperties);

const takeDamageLogic = `    this.hp -= info.amount;
    
    if (this.hp <= 0) {
      this.isDestroyed = true;`;

const newTakeDamageLogic = `    this.hp -= info.amount;
    
    if (this.hp <= 0 && !this.isDestroying) {
      this.isDestroying = true;
      this.animTime = 0;`;

code = code.replace(takeDamageLogic, newTakeDamageLogic);

const isDestroyedCheck = `  public takeDamage(info: DamageInfo, inventory: InventoryManager, addParticles: (particles: any[]) => void, addFloatingText?: (x: number, y: number, text: string, color: string) => void): DamageResult {
    if (this.isDestroyed) {`;

const newIsDestroyedCheck = `  public takeDamage(info: DamageInfo, inventory: InventoryManager, addParticles: (particles: any[]) => void, addFloatingText?: (x: number, y: number, text: string, color: string) => void): DamageResult {
    if (this.isDestroyed || this.isDestroying) {`;

code = code.replace(isDestroyedCheck, newIsDestroyedCheck);

const renderCheck = `  public render(ctx: CanvasRenderingContext2D, renderer: PenRenderer): void {
    if (this.isDestroyed) return;
    renderer.drawDestructible(ctx, this);
  }`;

const updateMethod = `
  public update(dt: number) {
    if (this.isDestroying) {
      this.animTime += dt;
      if (this.animTime > 0.4) {
        this.isDestroyed = true;
        this.isDestroying = false;
      }
    }
  }

  public render(ctx: CanvasRenderingContext2D, renderer: PenRenderer): void {
    if (this.isDestroyed) return;
    renderer.drawDestructible(ctx, this);
  }`;

code = code.replace(renderCheck, updateMethod);

fs.writeFileSync('src/game/entities/Destructible.ts', code);
console.log('Destructible.ts patched.');
