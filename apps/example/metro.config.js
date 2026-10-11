const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);
// @tanstack/charts has no `main`, only package exports.
config.resolver.unstable_enablePackageExports = true;
config.resolver.unstable_conditionNames = ['react-native', 'import', 'require', 'default'];

module.exports = config;
