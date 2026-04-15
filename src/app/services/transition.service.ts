// transition.service.ts
import { inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { gsap } from 'gsap';

@Injectable({ providedIn: 'root' })
export class TransitionService {
  private router = inject(Router);

  private transitionVideos: Record<string, string> = {
    'about-me': '/videos/app-me.mp4',
  };

  private isTransitioning = false;
  readonly isTransitionPlaying = signal(false);

  constructor() {}

  async navigate(route: string, homeVideo: HTMLVideoElement, transitionVideo: HTMLVideoElement) {
    if (this.isTransitioning) return;
    this.isTransitioning = true;

    try {
      const transitionSrc = this.transitionVideos[route];
      if (!transitionSrc) {
        await this.router.navigate([route]);
        return;
      }
      this.isTransitionPlaying.set(true);

      // preload + speed up home video
      await Promise.all([
        this.preloadVideo(transitionVideo, transitionSrc),
        this.rampPlaybackRate(homeVideo, 4, 0.6),
      ]);

      await this.playToEnd(homeVideo);

      homeVideo.playbackRate = 1;

      transitionVideo.play();
      await this.blurDissolve(homeVideo, transitionVideo);

      await this.waitForEnd(transitionVideo);

      await this.router.navigate([route]);
    } finally {
      // reset
      gsap.set(transitionVideo, { opacity: 0, filter: 'blur(0px)' });
      transitionVideo.pause();
      transitionVideo.src = '';
      transitionVideo.load();

      gsap.set(homeVideo, { opacity: 1, filter: 'blur(0px)' });
      homeVideo.loop = true;
      homeVideo.playbackRate = 1;
      homeVideo.currentTime = 0;
      homeVideo.play().catch(() => console.warn('Failed to play home video after transition.'));

      this.isTransitionPlaying.set(false);
      this.isTransitioning = false;
    }
  }

  private rampPlaybackRate(video: HTMLVideoElement, target: number, duration: number) {
    return new Promise<void>((resolve) => {
      const proxy = { rate: video.playbackRate };
      gsap.to(proxy, {
        rate: target,
        duration,
        ease: 'power2.in',
        onUpdate: () => {
          video.playbackRate = proxy.rate;
        },
        onComplete: resolve,
      });
    });
  }

  private preloadVideo(video: HTMLVideoElement, src: string) {
    return new Promise<void>((resolve) => {
      video.src = src;
      video.load();
      video.addEventListener('canplaythrough', () => resolve(), { once: true });
      setTimeout(resolve, 3000);
    });
  }

  private playToEnd(video: HTMLVideoElement) {
    return new Promise<void>((resolve) => {
      video.loop = false;
      if (!isFinite(video.duration) || video.duration - video.currentTime <= 0)
        video.currentTime = 0;
      video.addEventListener('ended', () => resolve(), { once: true });
    });
  }

  private blurDissolve(out: HTMLVideoElement, inn: HTMLVideoElement) {
    inn.play();
    return Promise.all([
      gsap.to(out, { filter: 'blur(40px)', opacity: 0, duration: 0.9, ease: 'power2.in' }),
      gsap.fromTo(
        inn,
        { filter: 'blur(40px)', opacity: 0 },
        { filter: 'blur(0px)', opacity: 1, duration: 0.9, ease: 'power2.out' },
      ),
    ]);
  }

  private waitForEnd(video: HTMLVideoElement) {
    return new Promise<void>((resolve) => {
      if (video.ended) resolve();
      else video.addEventListener('ended', () => resolve(), { once: true });
    });
  }
}
