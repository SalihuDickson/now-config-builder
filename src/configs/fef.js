const inquirer = require('inquirer');
const path = require('path');
const fs = require('fs');

const baseConfig = {
  name: 'static-example',
  version: 2,
  builds: [
    {
      src: 'package.json',
      use: '@now/static-build',
      config: { distDir: 'build' },
    },
  ],
  routes: [{ handle: 'filesystem' }, { src: '/.*', dest: 'index.html' }],
};

const fef = async (config, defaultBuild = 'dist') => {
  let buildScript = '';
  let packageJSON; let
    packageJSONPath;

  try {
    packageJSONPath = path.join(process.cwd(), 'package.json');
    packageJSON = require(packageJSONPath);
    buildScript = (packageJSON.scripts || {})['now-build'] || 'npm run build';
    packageJSON.scripts = packageJSON.scripts || {};
  } catch (err) {
    console.warn('warning: could not find a package json');
  }

  const answers = await inquirer.prompt([
    {
      type: 'text',
      name: 'directory',
      message: 'what is the build directory',
      default: defaultBuild,
    },
    {
      type: 'confirm',
      name: 'addBuildScript',
      message:
        'do you want to add/update a now-build script to your package.json',
      default: true,
    },
    {
      type: 'text',
      name: 'buildScript',
      message: 'what is the build command',
      default: buildScript,
      when: (a) => a.addBuildScript,
    },
  ]);

  if (answers.addBuildScript) {
    packageJSON.scripts['now-build'] = answers.buildScript;
    fs.writeFileSync(
      packageJSONPath,
      JSON.stringify(packageJSON, null, 2),
      'utf-8',
    );
  }
  baseConfig.builds[0].config.distDir = answers.directory;

  return {
    ...config,
    ...baseConfig,
  };
};

module.exports = fef;
