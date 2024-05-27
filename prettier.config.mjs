import prettierConfig from '@theguild/prettier-config';

/**
 * @type {import('prettier').Config}
 */

const config = {
  ...prettierConfig,
  importOrderParserPlugins: ['importAssertions', ...prettierConfig.importOrderParserPlugins],
};

// eslint-disable-next-line import/no-default-export
export default config;
