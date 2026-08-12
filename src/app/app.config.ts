import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
  isDevMode,
  CUSTOM_ELEMENTS_SCHEMA
} from '@angular/core';
import { provideRouter, withComponentInputBinding, withInMemoryScrolling, withViewTransitions } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { COLOR_SCHEME_LOCAL_KEY, ColorSchemeStore } from '@elementar-rt/components/color-scheme';

import { routes } from './app.routes';

/**
 * `ColorSchemeStore` persists the scheme on change but always boots to 'light',
 * so the saved preference has to be replayed at startup — otherwise every reload
 * flips a dark-mode user back to light.
 */
function restoreColorScheme(): void {
  const saved = localStorage.getItem(COLOR_SCHEME_LOCAL_KEY);
  if (saved === 'dark' || saved === 'light') {
    inject(ColorSchemeStore).setScheme(saved);
  }
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(
      routes,
      withComponentInputBinding(),
      withViewTransitions(),
      withInMemoryScrolling({ scrollPositionRestoration: 'enabled', anchorScrolling: 'enabled' })
    ),
    provideAnimationsAsync(),
    provideHttpClient(withFetch()),
    provideNativeDateAdapter(),
    { provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: { appearance: 'outline' } },
    ColorSchemeStore,
    provideAppInitializer(restoreColorScheme)
  ]
};
