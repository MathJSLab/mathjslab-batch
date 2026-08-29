import licenseText from './i18n-licenseText.js';

export default {
  locale: 'es',
  htmlLang: 'es',
  ogLocale: 'es_ES',
  languageName: 'Español',
  app: {
    title: 'MathJSLab Batch',
    description: 'Ejecutor de lotes de comandos con sintaxis tipo MATLAB',
    noscript: 'JavaScript debe estar habilitado para ejecutar MathJSLab Batch.',
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
  licenseTitle: 'Licencia MIT',
  licenseLeadPrefixHtml: '<strong>MathJSLab</strong> se distribuye como software libre bajo la ',
  licenseLinkLabel: 'Licencia MIT',
  licenseHref: 'https://opensource.org/license/MIT',
  licenseLeadSuffix: ', permitiendo uso, modificación y redistribución según los términos siguientes.',
  licenseText,
};
