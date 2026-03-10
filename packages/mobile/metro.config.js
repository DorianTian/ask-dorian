const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const path = require('path');

const monorepoRoot = path.resolve(__dirname, '../..');

const config = {
  watchFolders: [monorepoRoot],
  resolver: {
    nodeModulesPaths: [
      path.resolve(__dirname, 'node_modules'),
      path.resolve(monorepoRoot, 'node_modules'),
    ],
    // Enable package.json "exports" field resolution (for @ask-dorian/core)
    unstable_enablePackageExports: true,
    unstable_conditionNames: ['import', 'require'],
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
