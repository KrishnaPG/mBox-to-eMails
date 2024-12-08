const fs = require('node:fs');
const commandLineArgs = require('command-line-args');
const commandLineUsage = require('command-line-usage');
const path = require('path');
const { exit } = require('process');

/**
 * Command line parsing
 */
class ArgFileType {
  constructor(filename) {
    this.filePath = path.resolve(process.cwd(), filename);
    this.exists = fs.existsSync(this.filePath);
  }
}

class ArgFolderType {
  constructor(folderPath, createIfNotExists = false) {
    this.folderPath = path.resolve(process.cwd(), folderPath);
    this.exists = fs.existsSync(this.folderPath);
    // create the folder if asked and does not exist
    if (!this.exists && createIfNotExists) {
      fs.mkdirSync(this.folderPath, { recursive: true });
      this.created = true;
    }
  }
}

function parseCommandLine() {
  const optionDefinitions = [
    {
      name: 'src',
      alias: 'i',
      multiple: false,
      defaultOption: true,
      type: (filename) => new ArgFileType(filename),
      description: 'The input MBox file path',
      typeLabel: '<filePath>',
    },
    {
      name: 'out',
      alias: 'o',
      type: (folderPath) => new ArgFolderType(folderPath, true),
      description: 'The output folder path, if any',
      typeLabel: '<folderPath>',
    },
    {
      name: 'overwrite',
      alias: 'w',
      type: Boolean,
      description: 'Overwrite the destination if already exists',
    },
  ];
  const options = commandLineArgs(optionDefinitions);

  if (!options.src) {
    const usage = commandLineUsage([
      {
        header: 'Error',
        content: 'Missing required input parameter. Refer to the options below.',
      },
      {
        header: 'Options',
        optionList: optionDefinitions,
      },
    ]);
    console.error(usage);
    exit(0);
  } else if (!options.src.exists) {
    console.error(`\nError: "${options.src.filePath}" does not exist`);
    exit(0);
  }
  if (!options.out) {
    options.out = new ArgFolderType("out", true);
  }
  if (options.out.exists && !options.overwrite) {
    console.error(`\nError: "${options.out.folderPath}" already exists; use -w option to overwrite the output;`);
    exit(0);
  }
  return options;
}

module.exports = parseCommandLine;
