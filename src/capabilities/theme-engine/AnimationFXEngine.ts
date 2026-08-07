// Capabilities: Built-in CSS Animation & FX Engine

export interface AnimationDefinition {
  className: string;
  name: string;
  category: 'entrances' | 'hover_effects' | 'attention' | 'loaders';
  description: string;
}

export class AnimationFXEngine {
  private static instance: AnimationFXEngine;
  private animations: AnimationDefinition[] = [
    { className: 'animate-fade-in', name: 'Fade In', category: 'entrances', description: 'Smooth 0.4s opacity entrance' },
    { className: 'animate-slide-up', name: 'Slide Up', category: 'entrances', description: 'Cubic bezier upwards entrance' },
    { className: 'animate-slide-down', name: 'Slide Down', category: 'entrances', description: 'Cubic bezier downwards entrance' },
    { className: 'animate-scale-up', name: 'Scale Up', category: 'entrances', description: 'Zoom-in scale transition' },
    { className: 'animate-float', name: 'Floating Element', category: 'attention', description: 'Continuous 4s floating bobbing effect' },
    { className: 'shimmer', name: 'Skeleton Shimmer', category: 'loaders', description: 'Linear gradient loading shimmer' },
    { className: 'fx-glow-hover', name: 'Glow Border Hover', category: 'hover_effects', description: 'Neon glow border on hover' },
    { className: 'fx-card-tilt', name: '3D Card Tilt', category: 'hover_effects', description: 'Interactive 3D tilt perspective' },
  ];

  private constructor() {}

  public static getInstance(): AnimationFXEngine {
    if (!AnimationFXEngine.instance) {
      AnimationFXEngine.instance = new AnimationFXEngine();
    }
    return AnimationFXEngine.instance;
  }

  public listAnimations(): AnimationDefinition[] {
    return this.animations;
  }

  public getAnimationByClass(className: string): AnimationDefinition | undefined {
    return this.animations.find((a) => a.className === className);
  }
}
