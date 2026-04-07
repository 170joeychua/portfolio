import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';

import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import Aura from '@primeng/themes/aura';
import { providePrimeNG } from 'primeng/config';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(), // use signals-based change detection
    provideBrowserGlobalErrorListeners(), // catches uncaught JS errors globally in the browser
    provideRouter(routes), // registers app routes for navigation
    provideClientHydration(withEventReplay()), // reuses SSR-rendered HTML + replays clicks before JS was ready
    provideAnimationsAsync(), // enables Angular animations (keep until PrimeNG supports native CSS animations)
    providePrimeNG({
      theme: {
        preset: Aura,
        options: {
          darkModeSelector: false,
        },
      },
    }),
  ],
};
