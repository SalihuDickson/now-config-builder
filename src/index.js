#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const inquirer = require('inquirer');

const nodeExpress = require('./configs/nodeEpress');
const staticConfig = require('./configs/staticConfig');
const fef = require('./configs/fef');

const nowPath = path.join(process.cwd(), 'now.json');
const existingConfig = fs.existsSync('now.json');

const buildConfig = async () => {
  let config = {
    name: '',
    version: 2,

    alias: null,
  };

  inquirer
    .prompt([
      {
        type: 'text',
        name: 'name',
        message: 'what is the name of the project',
        default: path.basename(process.cwd()),
      },
      {
        type: 'list',
        name: 'type',
        message: 'what type of project',
        choices: ['node-express', 'static', 'react', 'vue', 'static-biuld'],
      },
    ])
    .then(async ({ name, type }) => {
      config.name = name;

      switch (type) {
        case 'node-express':
          config = await nodeExpress(config);
          break;
        case 'static':
          config = await staticConfig(config);
          break;
        case 'react':
          config = await fef(config, 'build');
          break;
        case 'vue':
          config = await fef(config);
          break;
        case 'static-build':
          config = await fef(config);
          break;
        default:
          break;
      }

      return { name, type };
    })
    .then(async ({ name, type }) => {
      const moreAnswers = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'specifyAlias',
          message: 'would you like  to specify an alias',
          default: true,
        },
        {
          type: 'name',
          name: 'alias',
          message:
            'what is the alias(to specify multiple seperate by commas e.g: "who, what")',
          default: name,
          when: (a) => a.specifyAlias,
        },
      ]);

      config.alias = moreAnswers.alias
        ? moreAnswers.alias.split(',').map((a) => a.trim())
        : null;

      fs.writeFileSync(nowPath, JSON.stringify(config, null, 2), 'utf-8');
    })
    .then(() => {
      console.log('done, type now to deploy');
      process.exit(0);
    });
};

if (existingConfig) {
  inquirer
    .prompt([
      {
        type: 'confirm',
        name: 'overwrite',
        message: 'now.json already exist! Would you like to replace it',
        default: true,
      },
    ])
    .then((answers) => {
      if (answers.overwrite) buildConfig();
      else console.log('closing...');
    });
} else {
  buildConfig();
}
