const fs = require('fs');

let code = fs.readFileSync('src/game/entities/Destructible.ts', 'utf8');

// Add properties
code = code.replace(
  /public animTime: number = 0;/,
  `public animTime: number = 0;
  public vx: number = 0;
  public vy: number = 0;
  public isGrounded: boolean = true;
  public mass: number = 1;`
);

// Modify update to include platforms and physics
code = code.replace(
  /public update\(dt: number\) \{[\s\S]*?\}\n/,
  `public update(dt: number, platforms?: Rect[]) {
    if (this.isDestroying) {
      this.animTime += dt;
      if (this.animTime > 0.4) {
        this.isDestroyed = true;
        this.isDestroying = false;
      }
      return;
    }

    if (this.type === 'box') {
      // Apply gravity
      this.vy += 800 * dt;
      this.vy = Math.min(this.vy, 400); // max fall speed
      
      // X Movement
      this.x += this.vx * dt;
      let rect = this.getBounds();
      
      if (platforms) {
          for (const plat of platforms) {
             if (plat === this) continue; // skip self if we ever get passed in
             if (this.x < plat.x + plat.width &&
                 this.x + this.width > plat.x &&
                 this.y < plat.y + plat.height &&
                 this.y + this.height > plat.y) {
                 
                 if (this.vx > 0) {
                     this.x = plat.x - this.width;
                 } else if (this.vx < 0) {
                     this.x = plat.x + plat.width;
                 }
                 this.vx = 0;
             }
          }
      }

      // Y Movement
      this.y += this.vy * dt;
      this.isGrounded = false;
      
      if (platforms) {
          for (const plat of platforms) {
             if (plat === this) continue;
             if (this.x < plat.x + plat.width &&
                 this.x + this.width > plat.x &&
                 this.y < plat.y + plat.height &&
                 this.y + this.height > plat.y) {
                 
                 if (this.vy > 0) {
                     this.y = plat.y - this.height;
                     this.vy = 0;
                     this.isGrounded = true;
                 } else if (this.vy < 0) {
                     this.y = plat.y + plat.height;
                     this.vy = 0;
                 }
             }
          }
      }

      // Friction
      if (this.isGrounded) {
         if (this.vx > 0) {
             this.vx -= 400 * dt;
             if (this.vx < 0) this.vx = 0;
         } else if (this.vx < 0) {
             this.vx += 400 * dt;
             if (this.vx > 0) this.vx = 0;
         }
      }
    }
  }
`
);

fs.writeFileSync('src/game/entities/Destructible.ts', code);
