// tweak the create-react-app webpack config(s) without using 'eject' and without creating a fork of the react-scripts.
const path = require('path');
const { override, addWebpackAlias } = require('customize-cra');

module.exports = override(
  // npm link duplicate react dependencies issue
  // useful when developing shared react component library
  // https://blog.maximeheckel.com/posts/duplicate-dependencies-npm-link/
  addWebpackAlias({
    react: path.resolve('./node_modules/react'),
  }),
  // ignore create-react-app imports restriction outside of src directory
  // https://stackoverflow.com/questions/44114436/the-create-react-app-imports-restriction-outside-of-src-directory/55298684#55298684
  (config) => {
    const index = config.resolve.plugins.find((plugin) => plugin.constructor.name === 'ModuleScopePlugin');

    if (index) {
      config.resolve.plugins.splice(index, 1);
    }

    return config;
  },
);
