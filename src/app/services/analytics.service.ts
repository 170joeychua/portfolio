import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject } from '@angular/core';

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);
  private initialized = false;
  private measurementId = '';

  initialize(): boolean {
    if (!isPlatformBrowser(this.platformId) || this.initialized) {
      return this.initialized;
    }

    this.measurementId = this.getMeasurementId();
    if (!this.measurementId) {
      return false;
    }

    const windowRef = window;
    windowRef.dataLayer = windowRef.dataLayer || [];
    windowRef.gtag = (...args: unknown[]) => {
      windowRef.dataLayer.push(args);
    };

    this.loadScript(this.measurementId);
    windowRef.gtag('js', new Date());
    windowRef.gtag('config', this.measurementId, { send_page_view: false });

    this.initialized = true;
    return true;
  }

  trackPageView(path: string): void {
    if (!this.initialized || !window.gtag) {
      return;
    }

    window.gtag('event', 'page_view', {
      page_title: this.document.title,
      page_path: path,
      page_location: window.location.href,
    });
  }

  trackEvent(eventName: string, parameters: Record<string, unknown> = {}): void {
    if (!this.initialized || !window.gtag) {
      return;
    }

    window.gtag('event', eventName, parameters);
  }

  private getMeasurementId(): string {
    const value = this.document
      .querySelector('meta[name="ga-measurement-id"]')
      ?.getAttribute('content')
      ?.trim();

    return value ?? '';
  }

  private loadScript(measurementId: string): void {
    const script = this.document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    this.document.head.appendChild(script);
  }
}
