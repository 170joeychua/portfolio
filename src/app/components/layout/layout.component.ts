import { isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  Component,
  EventEmitter,
  inject,
  OnDestroy,
  PLATFORM_ID,
} from '@angular/core';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { HomePage } from '../../../pages/home/home.page';
import { BottomFooterComponent } from '../bottom-footer/bottom-footer';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterModule, BottomFooterComponent],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
})
export class LayoutComponent implements AfterViewInit, OnDestroy {
  // @ViewChild('homeVideo') homeVideoRef!: ElementRef<HTMLVideoElement>;
  // @ViewChild('transitionVideo') transitionVideoRef!: ElementRef<HTMLVideoElement>;
  private platformId = inject(PLATFORM_ID);
  private activeNavigateSub: Subscription | null = null;
  showFooter = false;
  constructor() {}

  ngAfterViewInit() {
    if (!isPlatformBrowser(this.platformId)) return;

    // const homeVideo = this.homeVideoRef.nativeElement;
    // homeVideo.muted = true;
    // homeVideo.autoplay = true;
    // homeVideo.loop = true;
    // homeVideo.playsInline = true;
    // homeVideo.setAttribute('muted', '');
    // homeVideo.setAttribute('playsinline', '');
    // homeVideo.load();
    // homeVideo.play().catch(() => console.warn('Autoplay failed, user interaction required'));
  }

  ngOnDestroy() {
    this.activeNavigateSub?.unsubscribe();
  }

  onActivate(component: unknown) {
    this.activeNavigateSub?.unsubscribe();
    this.showFooter = component instanceof HomePage;
    if (
      component &&
      (component as { navigate?: EventEmitter<string> }).navigate instanceof EventEmitter
    ) {
      this.activeNavigateSub = (component as { navigate: EventEmitter<string> }).navigate.subscribe(
        () => this.navigate(),
      );
    }
  }

  navigate() {
    // this.transitionService.navigate(
    //   route,
    //   this.homeVideoRef.nativeElement,
    //   this.transitionVideoRef.nativeElement,
    // );
  }
}
