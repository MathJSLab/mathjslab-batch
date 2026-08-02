import { IntlMessageFormat } from 'intl-messageformat';

type Locale = 'en' | 'es' | 'pt';
type MessageTree = string | MessageTree[] | { [key: string]: MessageTree };
type MessageValues = Parameters<IntlMessageFormat['format']>[0];

/**
 * Localized UI copy used by the batch application shell and child components.
 */
const source = {
  en: {
    locale: 'en',
    htmlLang: 'en',
    languageName: 'English',
    app: {
      title: 'MathJSLab Batch',
      description: 'MATLAB-style command batch runner',
    },
    shell: {
      languageLabel: 'Language',
      controlsLabel: 'Batch controls',
      run: 'Run',
      clearOutput: 'Clear output',
      resetSample: 'Reset sample',
      status: {
        ready: 'Ready',
        finished: 'Finished: {count, plural, one {# statement} other {# statements}}',
        error: 'Stopped with error',
      },
    },
    editor: {
      ariaLabel: 'MATLAB batch commands',
    },
    output: {
      placeholder: 'Output will appear here.',
    },
  },
  es: {
    locale: 'es',
    htmlLang: 'es',
    languageName: 'Español',
    app: {
      title: 'MathJSLab Batch',
      description: 'Ejecutor de lotes de comandos con sintaxis tipo MATLAB',
    },
    shell: {
      languageLabel: 'Idioma',
      controlsLabel: 'Controles del lote',
      run: 'Ejecutar',
      clearOutput: 'Limpiar salida',
      resetSample: 'Restaurar ejemplo',
      status: {
        ready: 'Listo',
        finished: 'Finalizado: {count, plural, one {# sentencia} other {# sentencias}}',
        error: 'Interrumpido por error',
      },
    },
    editor: {
      ariaLabel: 'Comandos MATLAB en lote',
    },
    output: {
      placeholder: 'La salida aparecerá aquí.',
    },
  },
  pt: {
    locale: 'pt',
    htmlLang: 'pt-BR',
    languageName: 'Português',
    app: {
      title: 'MathJSLab Batch',
      description: 'Executor de lote de comandos com sintaxe MATLAB',
    },
    shell: {
      languageLabel: 'Idioma',
      controlsLabel: 'Controles do lote',
      run: 'Executar',
      clearOutput: 'Limpar saída',
      resetSample: 'Restaurar exemplo',
      status: {
        ready: 'Pronto',
        finished: 'Concluído: {count, plural, one {# comando} other {# comandos}}',
        error: 'Interrompido por erro',
      },
    },
    editor: {
      ariaLabel: 'Comandos MATLAB em lote',
    },
    output: {
      placeholder: 'A saída aparecerá aqui.',
    },
  },
} as const;

const locales = Object.keys(source) as Locale[];
const localeStorageKey = 'mathjslab-batch:i18n:locale';

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
 * Pre-format static message values while preserving ICU messages with variables.
 *
 * Messages containing placeholders are formatted later with runtime values.
 *
 * @param value Message tree node to format.
 * @param locale Locale used by `intl-messageformat`.
 * @returns Formatted copy tree.
 */
const formatValue = (value: MessageTree, locale: Locale): any => {
  if (typeof value === 'string') {
    if (value.includes('{')) {
      return value;
    }
    return new IntlMessageFormat(value, locale).format();
  }

  if (Array.isArray(value)) {
    return value.map((entry) => formatValue(entry, locale));
  }

  return Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, formatValue(entry, locale)]));
};

const pages = Object.fromEntries(Object.entries(source).map(([locale, values]) => [locale, formatValue(values, locale as Locale)])) as Record<Locale, any>;

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
  const params = new URLSearchParams(globalThis.location.search);
  return firstSupportedLocale([params.get('lang'), globalThis.localStorage.getItem(localeStorageKey), ...globalThis.navigator.languages, globalThis.navigator.language]) ?? 'en';
};

/**
 * Application internationalization service.
 */
class I18n extends EventTarget {
  public readonly defaultLocale: Locale = 'en';
  public readonly locales = locales;
  public readonly languageNames = Object.fromEntries(Object.entries(source).map(([locale, values]) => [locale, values.languageName])) as Record<Locale, string>;
  public readonly pages = pages;
  private currentLocale: Locale = getInitialLocale();

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
    if (nextLocale === this.currentLocale) {
      return;
    }
    this.currentLocale = nextLocale;
    globalThis.localStorage.setItem(localeStorageKey, nextLocale);
    this.applyDocumentLanguage();
    this.dispatchEvent(new CustomEvent('languagechange', { detail: { locale: nextLocale } }));
  }

  /**
   * Apply language-sensitive document metadata.
   */
  public applyDocumentLanguage(): void {
    document.documentElement.lang = this.page.htmlLang;
    document.title = this.page.app.title;
    document.querySelector('meta[name="description"]')?.setAttribute('content', this.page.app.description);
  }
}

const i18n = new I18n();

export { type Locale, i18n };
export default i18n;
