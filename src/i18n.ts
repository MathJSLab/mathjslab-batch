import { IntlMessageFormat } from 'intl-messageformat';
import en from '../data/i18n-en';
import es from '../data/i18n-es';
import pt from '../data/i18n-pt';

type Locale = 'en' | 'es' | 'pt';
type MessageTree = string | MessageTree[] | { [key: string]: MessageTree };
type MessageValues = Parameters<IntlMessageFormat['format']>[0];

/**
 * Localized UI copy used by the batch application shell and child components.
 */
const source = {
  en,
  es,
  pt,
} as const;

const locales = Object.keys(source) as Locale[];
const localeStorageKey = 'mathjslab-batch:i18n:locale';
const isBrowser = typeof window !== 'undefined';

/**
 * Reduce a browser or query-string locale to one of the supported languages.
 *
 * @param locale Locale value such as `pt-BR`, `es`, or `en-US`.
 * @returns Supported language code, falling back to English.
 */
const normalizeLocale = (locale?: string | null): Locale => {
  const language = locale?.toLowerCase().split('-')[0] as Locale | undefined;
  return language && locales.includes(language) ? language : 'en';
};

/**
 * Find the first locale supported by this application in preference order.
 *
 * @param locales Candidate locale values ordered from most to least preferred.
 * @returns Matching application locale, when one is available.
 */
const firstSupportedLocale = (locales: Iterable<string | null | undefined>): Locale | undefined => {
  for (const locale of locales) {
    const language = locale?.toLowerCase().split('-')[0] as Locale | undefined;
    if (language && source[language]) {
      return language;
    }
  }
  return undefined;
};

/**
 * Build the public endpoint path for one supported locale.
 *
 * @param locale Supported locale identifier.
 * @returns Canonical application path for the locale.
 */
const localePath = (locale: Locale): string => `/${locale}/`;

/**
 * Check whether the current document is the root endpoint.
 *
 * @param pathname Current document path.
 * @returns True when the application is running from the root endpoint.
 */
const isRootPath = (pathname: string): boolean => pathname === '/' || pathname === '/index.html';

/**
 * Pre-format static message values while preserving ICU messages with variables.
 *
 * Messages containing placeholders are formatted later with runtime values.
 *
 * @param value Message tree node to format.
 * @param locale Locale used by `intl-messageformat`.
 * @returns Formatted copy tree.
 */
const formatValue = (value: MessageTree, locale: Locale, key = ''): any => {
  if (typeof value === 'string') {
    if (key.endsWith('Html') || value.includes('{')) {
      return value;
    }
    return new IntlMessageFormat(value, locale).format();
  }

  if (Array.isArray(value)) {
    return value.map((entry) => formatValue(entry, locale, key));
  }

  return Object.fromEntries(Object.entries(value).map(([entryKey, entry]) => [entryKey, formatValue(entry, locale, entryKey)]));
};

const pages = Object.fromEntries(Object.entries(source).map(([locale, values]) => [locale, formatValue(values, locale as Locale)])) as Record<Locale, any>;
const languageNames = Object.fromEntries(Object.entries(source).map(([locale, values]) => [locale, values.languageName])) as Record<Locale, string>;

/**
 * Static locale data shared by browser runtime and Eleventy templates.
 */
const i18nData = {
  defaultLocale: 'en' as Locale,
  locales,
  languageNames,
  pages,
};

/**
 * Resolve a dot-delimited message path in a message tree.
 *
 * @param messages Message tree root.
 * @param path Dot-delimited path such as `shell.status.finished`.
 * @returns Message tree node or an empty string when the path is invalid.
 */
const getByPath = (messages: MessageTree, path: string): MessageTree => {
  return path.split('.').reduce<MessageTree>((current, key) => {
    if (typeof current !== 'object' || Array.isArray(current)) {
      return '';
    }
    return current[key] ?? '';
  }, messages);
};

/**
 * Determine the initial application language.
 *
 * Preference order matches `mathjslab-calc`: explicit query parameter,
 * persisted application choice, browser language list, then English.
 *
 * @returns Initial supported locale.
 */
const getInitialLocale = (): Locale => {
  const location = globalThis.location;
  const navigator = globalThis.navigator;
  const params = new URLSearchParams(location?.search || '');
  const pathLocale = location?.pathname.split('/').find(Boolean);
  const storedLocale = isBrowser ? globalThis.localStorage?.getItem(localeStorageKey) : null;
  return firstSupportedLocale([params.get('lang'), pathLocale, ...(navigator?.languages || []), navigator?.language, storedLocale]) ?? 'en';
};

/**
 * Application internationalization service.
 */
class I18n extends EventTarget {
  public readonly defaultLocale: Locale = i18nData.defaultLocale;
  public readonly locales = i18nData.locales;
  public readonly languageNames = i18nData.languageNames;
  public readonly pages = pages;
  private currentLocale: Locale = getInitialLocale();

  public constructor() {
    super();
    this.redirectRootEndpoint();
  }

  public get locale(): Locale {
    return this.currentLocale;
  }

  public get page(): any {
    return this.pages[this.currentLocale];
  }

  /**
   * Format an ICU message from the source catalog with runtime values.
   *
   * @param path Dot-delimited message path.
   * @param values Values used by ICU placeholders and plural rules.
   * @returns Formatted localized string.
   */
  public format(path: string, values?: MessageValues): string {
    const message = getByPath(source[this.currentLocale], path);
    if (typeof message !== 'string') {
      return '';
    }
    return String(new IntlMessageFormat(message, this.currentLocale).format(values));
  }

  /**
   * Change the active application locale and notify components.
   *
   * @param locale Requested locale value.
   */
  public setLocale(locale?: string | null): void {
    const nextLocale = normalizeLocale(locale);
    if (isBrowser) {
      globalThis.localStorage?.setItem(localeStorageKey, nextLocale);
      if (this.navigateToLocaleEndpoint(nextLocale)) {
        return;
      }
    }
    if (nextLocale === this.currentLocale) {
      return;
    }
    this.currentLocale = nextLocale;
    this.applyDocumentLanguage();
    this.dispatchEvent(new CustomEvent('languagechange', { detail: { locale: nextLocale } }));
  }

  /**
   * Apply language-sensitive document metadata.
   */
  public applyDocumentLanguage(): void {
    if (typeof document === 'undefined') {
      return;
    }
    document.documentElement.lang = this.page.htmlLang;
    document.title = this.page.app.title;
    document.querySelector('meta[name="description"]')?.setAttribute('content', this.page.app.description);
  }

  /**
   * Redirect the root app endpoint to the locale-specific endpoint selected
   * from URL parameters or browser preferences.
   */
  private redirectRootEndpoint(): void {
    if (!isBrowser || !isRootPath(globalThis.location.pathname)) {
      return;
    }
    this.navigateToLocaleEndpoint(this.currentLocale, true);
  }

  /**
   * Navigate to the canonical endpoint for a locale when needed.
   *
   * @param locale Supported locale identifier.
   * @param replace Whether to replace the current history entry.
   * @returns True when navigation was requested.
   */
  private navigateToLocaleEndpoint(locale: Locale, replace = false): boolean {
    const targetPath = localePath(locale);
    if (!isBrowser || globalThis.location.pathname === targetPath) {
      return false;
    }

    const nextUrl = new URL(globalThis.location.href);
    nextUrl.pathname = targetPath;
    if (replace) {
      globalThis.location.replace(nextUrl.href);
    } else {
      globalThis.location.assign(nextUrl.href);
    }
    return true;
  }
}

const i18n = new I18n();

export { type Locale, i18n, i18nData };
export default i18n;
