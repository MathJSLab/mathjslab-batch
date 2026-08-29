import { tsImport } from 'tsx/esm/api';

/**
 * Load TypeScript i18n data for Eleventy templates.
 *
 * @returns Locale metadata and preformatted message catalogs.
 */
export default async () => {
  const { i18nData } = await tsImport('../src/i18n.ts', import.meta.url);
  return i18nData;
};
