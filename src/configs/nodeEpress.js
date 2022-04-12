const inquirer = require('inquirer');
const path = require('path');

const baseConfig = {
  builds: [
    {
      src: 'src/index.js',
      use: '@now/node-server',
    },
  ],
  routes: [{ src: '/.*', dest: 'src/index.js' }],
};

const nodeExpress = async (config) => {
  let main = 'src/index.js';

  try {
    const packageJSON = require(path.join(process.cwd, 'package.json'));
    main = packageJSON.main;
  } catch (err) {
    console.warn('warning: unable to find package.json file');
  }

  const answers = await inquirer.prompt([
    {
      type: 'text',
      name: 'main',
      message: 'enterpath to your express entry point',
      default: main,
    },
  ]);

  baseConfig.builds[0].src = answers.main;
  baseConfig.routes[0].dest = answers.main;

  return {
    ...config,
    ...baseConfig,
  };
};

module.exports = nodeExpress;
