/**
 * O Cavaleiro Arruinado - Asset Loader
 * Gerenciador assíncrono para pré-carregamento e cache de texturas e spritesheets
 */

export class AssetLoader {
  private static images: Map<string, HTMLImageElement> = new Map();
  private static loadingPromises: Map<string, Promise<HTMLImageElement>> = new Map();

  /**
   * Carrega uma imagem e armazena em cache
   */
  public static loadImage(url: string): Promise<HTMLImageElement> {
    if (this.images.has(url)) {
      return Promise.resolve(this.images.get(url)!);
    }

    if (this.loadingPromises.has(url)) {
      return this.loadingPromises.get(url)!;
    }

    const promise = new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        this.images.set(url, img);
        this.loadingPromises.delete(url);
        resolve(img);
      };
      img.onerror = (err) => {
        this.loadingPromises.delete(url);
        console.error(`[AssetLoader] Falha ao carregar imagem: ${url}`, err);
        // Fallback: resolve com a própria imagem para não travar a aplicação
        resolve(img);
      };
      img.src = url;
    });

    this.loadingPromises.set(url, promise);
    return promise;
  }

  /**
   * Obtém uma imagem já carregada de forma síncrona
   */
  public static getImage(url: string): HTMLImageElement | null {
    return this.images.get(url) || null;
  }

  /**
   * Verifica se o recurso já está pronto para uso
   */
  public static isLoaded(url: string): boolean {
    const img = this.images.get(url);
    return !!img && img.complete && img.naturalWidth > 0;
  }

  /**
   * Pré-carrega uma lista de imagens essenciais antes de iniciar o jogo
   */
  public static async preloadAll(urls: string[]): Promise<void> {
    await Promise.all(urls.map((url) => this.loadImage(url)));
  }
}
