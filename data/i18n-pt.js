import licenseText from './i18n-licenseText.js';

export default {
  locale: 'pt',
  htmlLang: 'pt-BR',
  ogLocale: 'pt_BR',
  languageName: 'Português',
  app: {
    title: 'MathJSLab Batch',
    description: 'Executor de lote de comandos com sintaxe MATLAB',
    noscript: 'O JavaScript deve estar habilitado para executar o MathJSLab Batch.',
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
  licenseTitle: 'Licença MIT',
  licenseLeadPrefixHtml: 'O <strong>MathJSLab</strong> é distribuído como software livre sob a ',
  licenseLinkLabel: 'Licença MIT',
  licenseHref: 'https://opensource.org/license/MIT',
  licenseLeadSuffix: ', permitindo uso, modificação e redistribuição nos termos abaixo.',
  licenseText,
};
