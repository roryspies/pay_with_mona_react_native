const path = require('path');
const escape = require('escape-string-regexp');
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const { getConfig } = require('react-native-builder-bob/metro-config');
const exclusionList = require('metro-config/src/defaults/exclusionList');
const pkg = require('../package.json');

const root = path.resolve(__dirname, '..');
const modules = Object.keys({ ...pkg.peerDependencies });

// /**
//  * Metro configuration
//  * https://facebook.github.io/metro/docs/configuration
//  *
//  * @type {import('metro-config').MetroConfig}
//  */
// module.exports = getConfig(getDefaultConfig(__dirname), {
//   root,
//   pkg,
//   project: __dirname,
// });

const config = getDefaultConfig(__dirname);

module.exports = mergeConfig(config, {
  root,
  pkg,
  project: __dirname,
  watchFolders: [root],
  resolver: {
    blockListRE: exclusionList(
      modules.map(
        (m) =>
          new RegExp(`^${escape(path.join(root, 'node_modules', m))}\\/.*$`)
      )
    ),
    extraNodeModules: modules.reduce((acc, name) => {
      acc[name] = path.join(__dirname, 'node_modules', name);
      return acc;
    }, {}),
  },
});
