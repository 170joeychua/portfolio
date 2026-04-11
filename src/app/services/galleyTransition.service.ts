import { Injectable } from '@angular/core';

export interface HeroSnapshot {
  rect: DOMRect;
  imageUrl: string;
  scrollY: number;
}

@Injectable({ providedIn: 'root' })
export class GalleryTransitionService {
  private _snapshot: HeroSnapshot | null = null;

  save(snapshot: HeroSnapshot) {
    this._snapshot = snapshot;
  }

  consume(): HeroSnapshot | null {
    const snap = this._snapshot;
    this._snapshot = null;
    return snap;
  }

  getLastScrollY(): number {
    return this._snapshot?.scrollY ?? 0;
  }
}
