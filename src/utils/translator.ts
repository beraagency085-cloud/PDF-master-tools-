/**
 * Google Translate Integration Utilities
 * Manages full-page DOM dynamic translation across Asian and Global languages.
 */

declare global {
  interface Window {
    google?: any;
    googleTranslateElementInit?: () => void;
    __googleTranslateLoaded?: boolean;
  }
}

const STORAGE_KEY = 'user_selected_language';

/**
 * Reads the currently active language code from cookies or localStorage
 */
export function getCurrentLanguageCode(): string {
  if (typeof window === 'undefined') return 'en';

  // 1. Check googtrans cookie
  const match = document.cookie.match(/(?:^|;\s*)googtrans=([^;]*)/);
  if (match && match[1]) {
    const parts = decodeURIComponent(match[1]).split('/');
    const target = parts[parts.length - 1];
    if (target && target !== 'en') {
      return target;
    }
  }

  // 2. Check localStorage
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && stored !== 'en' && stored !== 'original') return stored;
  } catch (e) {
    // Ignore storage errors
  }

  return 'en';
}

/**
 * Sets cookies for Google Translate and reloads page for 100% deep DOM translation
 */
export function translatePage(langCode: string): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve(false);
      return;
    }

    const domain = window.location.hostname;
    const expires = 'Thu, 01 Jan 1970 00:00:00 UTC';

    // If English, clear all cookies & storage and reload
    if (langCode === 'en' || langCode === 'original') {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch (e) {}

      const paths = ['/', ''];
      const domains = ['', domain, `.${domain}`];

      domains.forEach((d) => {
        paths.forEach((p) => {
          const domStr = d ? `; domain=${d}` : '';
          const pathStr = p ? `; path=${p}` : '';
          document.cookie = `googtrans=; expires=${expires}${pathStr}${domStr};`;
          document.cookie = `googtrans=; expires=${expires}${pathStr}${domStr}; SameSite=Lax;`;
          document.cookie = `googtrans=; expires=${expires}${pathStr}${domStr}; SameSite=None; Secure;`;
        });
      });

      const select = document.querySelector<HTMLSelectElement>('.goog-te-combo');
      if (select) {
        select.value = 'en';
        select.dispatchEvent(new Event('change'));
      }

      setTimeout(() => {
        window.location.reload();
        resolve(true);
      }, 100);
      return;
    }

    // Save language code
    try {
      localStorage.setItem(STORAGE_KEY, langCode);
    } catch (e) {}

    // Google Translate format: /en/[langCode] since site base is English
    const cookieVal = `/en/${langCode}`;

    // Set cookie variations
    document.cookie = `googtrans=${cookieVal}; path=/;`;
    document.cookie = `googtrans=${cookieVal}; path=/; SameSite=Lax;`;
    document.cookie = `googtrans=${cookieVal}; path=/; SameSite=None; Secure;`;

    // Attempt direct in-place manipulation of Google Translate combo select
    const select = document.querySelector<HTMLSelectElement>('.goog-te-combo');
    if (select) {
      select.value = langCode;
      select.dispatchEvent(new Event('change'));
      resolve(true);
      return;
    }

    // If select not ready yet, poll for up to 1 second before fallback
    let attempts = 0;
    const interval = setInterval(() => {
      attempts++;
      const el = document.querySelector<HTMLSelectElement>('.goog-te-combo');
      if (el) {
        el.value = langCode;
        el.dispatchEvent(new Event('change'));
        clearInterval(interval);
        resolve(true);
      } else if (attempts > 10) {
        clearInterval(interval);
        window.location.reload();
        resolve(true);
      }
    }, 100);
  });
}

/**
 * Helper to re-trigger translation when user navigates to a new view or opens a tool in SPA
 */
export function retriggerTranslation(): void {
  if (typeof window === 'undefined') return;
  const currentLang = getCurrentLanguageCode();
  if (!currentLang || currentLang === 'en' || currentLang === 'original') return;

  const select = document.querySelector<HTMLSelectElement>('.goog-te-combo');
  if (select) {
    select.value = currentLang;
    select.dispatchEvent(new Event('change'));
  }
}
