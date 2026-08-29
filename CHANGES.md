# Release notes

All notable changes to this project will be documented in this file. This
project adheres to [Semantic Versioning](http://semver.org/).

## 0.1.0

- Added localized application endpoints for English, Spanish, and Portuguese.
- Added Nunjucks page templates and a shared application shell template for the
  multilingual pages.
- Exposed the i18n data catalog to Eleventy so static metadata, SEO tags, and
  no-script messages are generated per language.
- Updated the Webpack HTML generation to emit the root page and each localized
  endpoint.
- Updated the sitemap with multilingual URL entries and alternate language
  links.
- Dependencies updated (`webpack` 5.110.1).

## 0.0.9

- The project page was implemented using SCSS templates in the same way as in
  the `mathjslab-app` project, by copying files from the organization's
  repository.
- Dependencies updated (`mathjslab` 2.5.1).

## 0.0.8

- Dependencies updated (`mathjslab` 2.5.0).

## 0.0.7

- Dependencies updated (`mathjslab` 2.4.0).

## 0.0.6

- Added the shared `appEngine` bootstrap model used by MathJSLab applications.
- Added centralized `InterpreterConfiguration` with locale-specific aliases.
- Fixed initial locale detection to honor the browser language preference list.
- Added JSDoc and inline documentation for the batch shell, editor, output,
  i18n, and interpreter services.
- Updated prepublication metadata and commit message configuration.

## 0.0.5

- Multilanguage support.

## 0.0.4

- Dependencies updated (`mathjslab` 2.3.0).

## 0.0.3

- DOI and other badges added.

## 0.0.2

- Dependencies updated (`mathjslab` 2.2.1).

## 0.0.1

- Project launch.
