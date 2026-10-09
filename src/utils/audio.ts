// Sound engine disabled as requested
class SoundEngine {
  public setEnabled(_state: boolean) {}
  public isEnabled(): boolean { return false; }
  public playHover() {}
  public playClick() {}
  public playAddToCart() {}
  public play3DModeToggle() {}
  public playCheckoutSuccess() {}
}

export const soundFx = new SoundEngine();
