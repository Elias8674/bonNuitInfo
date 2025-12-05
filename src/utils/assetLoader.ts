// Chargeur d'assets pour les animations Stickmin

export interface StickminAsset {
  name: string;
  image?: HTMLImageElement;
  frames?: number;
}

class AssetLoader {
  private assets: Map<string, HTMLImageElement> = new Map();
  private loaded: boolean = false;

  async loadAssets(): Promise<void> {
    if (this.loaded) return;

    // Charger les images disponibles
    const imagePaths = [
      '/src/assets/stickmin/未命名-2/LIBRARY/gun.png',
    ];

    const loadPromises = imagePaths.map(path => {
      return new Promise<void>((resolve) => {
        const img = new Image();
        img.onload = () => {
          const name = path.split('/').pop()?.replace('.png', '') || 'unknown';
          this.assets.set(name, img);
          resolve();
        };
        img.onerror = () => {
          console.warn(`Failed to load image: ${path}`);
          resolve(); // Continue même si une image échoue
        };
        img.src = path;
      });
    });

    await Promise.all(loadPromises);
    this.loaded = true;
  }

  getAsset(name: string): HTMLImageElement | undefined {
    return this.assets.get(name);
  }

  hasAsset(name: string): boolean {
    return this.assets.has(name);
  }
}

export const assetLoader = new AssetLoader();

