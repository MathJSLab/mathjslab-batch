import licenseText from './i18n-licenseText.js';

export default {
  locale: 'en',
  htmlLang: 'en',
  ogLocale: 'en_US',
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
  licenseTitle: 'MIT License',
  licenseLeadPrefixHtml: '<strong>MathJSLab</strong> is distributed as free software under the ',
  licenseLinkLabel: 'MIT License',
  licenseHref: 'https://opensource.org/license/MIT',
  licenseLeadSuffix: ', allowing use, modification and redistribution under the terms below.',
  licenseText,
};
