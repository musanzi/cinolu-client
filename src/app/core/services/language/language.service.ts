import { Injectable, signal, effect, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';

export type Language = 'fr' | 'en';

export interface LanguageOption {
  code: Language;
  name: string;
  flag: string;
}

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  private readonly STORAGE_KEY = 'cinolu_language';
  private readonly translate = inject(TranslateService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  currentLanguage = signal<Language>('fr');

  readonly availableLanguages: LanguageOption[] = [
    { code: 'fr', name: 'Fran\u00e7ais', flag: '/icons/fr.svg' },
    { code: 'en', name: 'English', flag: '/icons/gb.svg' }
  ];

  constructor() {
    const savedLang = this.getSavedLanguage();
    this.setLanguage(savedLang);

    if (this.isBrowser) {
      effect(() => {
        const lang = this.currentLanguage();
        localStorage.setItem(this.STORAGE_KEY, lang);
      });
    }
  }

  setLanguage(lang: Language): void {
    this.translate.use(lang);
    this.currentLanguage.set(lang);

    if (this.isBrowser && typeof document !== 'undefined') {
      document.documentElement.lang = lang;
    }
  }

  switchLanguage(lang: Language): void {
    this.setLanguage(lang);
  }

  toggleLanguage(): void {
    const currentLang = this.currentLanguage();
    const newLang: Language = currentLang === 'fr' ? 'en' : 'fr';
    this.setLanguage(newLang);
  }

  private getSavedLanguage(): Language {
    if (this.isBrowser && typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved === 'fr' || saved === 'en') {
        return saved;
      }
    }

    if (this.isBrowser && typeof navigator !== 'undefined') {
      const browserLang = navigator.language.split('-')[0];
      if (browserLang === 'fr' || browserLang === 'en') {
        return browserLang;
      }
    }

    return 'fr';
  }

  getCurrentLanguageInfo(): LanguageOption {
    const lang = this.currentLanguage();
    return this.availableLanguages.find((l) => l.code === lang) || this.availableLanguages[0];
  }

  instant(key: string, params?: object): string {
    return this.translate.instant(key, params);
  }
}
