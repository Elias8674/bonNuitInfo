// Chargeur et gestionnaire d'animation pour les sprites Stickman

// Frames codées en dur
const WALK_FRAMES = [1, 2, 3, 4, 5, 6, 7, 8, 9]; // Marche : frames 1 à 9
const LIGHT_ATTACK_FRAMES = [10, 11, 12, 13, 14, 15]; // Light attack : frames 10 à 15
const HEAVY_ATTACK_FRAMES = [16, 17, 18, 19, 20, 21, 22, 23, 24]; // Heavy attack : frames 16 à 24
const MEDIUM_ATTACK_FRAMES = [25, 26, 27, 28, 29, 30]; // Medium attack : frames 25 à 30
const HIT_FRAMES = [31, 32, 33, 34]; // Hit (prendre un coup) : frames 31 à 34
const GRAB_THROW_FRAMES = [35, 36, 37]; // Projection du grab : frames 35 à 37
const GET_UP_FRAMES = [38, 39, 40]; // Se relever : frames 38 à 40
const ROLL_FRAMES = [41, 42, 43, 44, 45, 46, 47]; // Roulade : frames 41 à 47 (ou 40-47 selon besoin)
const SUPER_ATTACK_FRAMES = [50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66]; // Super attaque : frames 50 à 66

class StickAnimation {
  private frames: Map<number, HTMLImageElement> = new Map();
  private loaded: boolean = false;

  async loadFrames(): Promise<void> {
    if (this.loaded) return;

    const loadPromises: Promise<void>[] = [];

    // Toutes les frames à charger
    const allFrames = [
      ...WALK_FRAMES,
      ...LIGHT_ATTACK_FRAMES,
      ...HEAVY_ATTACK_FRAMES,
      ...MEDIUM_ATTACK_FRAMES,
      ...HIT_FRAMES,
      ...GRAB_THROW_FRAMES,
      ...GET_UP_FRAMES,
      ...ROLL_FRAMES,
      ...SUPER_ATTACK_FRAMES,
    ];

    // Charger toutes les frames depuis npc1 (dans public)
    for (const frameNum of allFrames) {
      const frameStr = frameNum.toString().padStart(4, '0');
      const path = `/assets/stickman/npc1/stickMan${frameStr}.png`;
      
      const promise = new Promise<void>((resolve) => {
        const img = new Image();
        img.onload = () => {
          this.frames.set(frameNum, img);
          resolve();
        };
        img.onerror = () => {
          console.warn(`Failed to load frame: ${path}`);
          resolve();
        };
        img.src = path;
      });

      loadPromises.push(promise);
    }

    await Promise.all(loadPromises);
    this.loaded = true;
  }

  getFrame(frameNumber: number): HTMLImageElement | null {
    if (!this.loaded) {
      return null;
    }
    return this.frames.get(frameNumber) || null;
  }

  getWalkFrames(): number[] {
    return WALK_FRAMES;
  }

  getLightAttackFrames(): number[] {
    return LIGHT_ATTACK_FRAMES;
  }

  getMediumAttackFrames(): number[] {
    return MEDIUM_ATTACK_FRAMES;
  }

  getHeavyAttackFrames(): number[] {
    return HEAVY_ATTACK_FRAMES;
  }

  getHitFrames(): number[] {
    return HIT_FRAMES;
  }

  getGrabThrowFrames(): number[] {
    return GRAB_THROW_FRAMES;
  }

  getGetUpFrames(): number[] {
    return GET_UP_FRAMES;
  }

  getRollFrames(): number[] {
    return ROLL_FRAMES;
  }

  getSuperAttackFrames(): number[] {
    return SUPER_ATTACK_FRAMES;
  }

  isLoaded(): boolean {
    return this.loaded;
  }
}

export const stickAnimation = new StickAnimation();

