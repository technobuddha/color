//@ts-check

/** @type import('@technobuddha/project/build').Builds */
const config = {
  default: {
    watch: true,
    steps: [
      {
        name: 'Clean',
        command: 'rm -rf ./dist'
      },
      {
        name: 'Color',
        directory: ['./src'],
        command: 'tsc -p ./src/tsconfig.json',
      },
    ],
  },
  prod: {
    steps: [
      { build: 'default' },
    ]
  },
  publish: {
    steps: [
      { build: 'default' },
      {
        name: 'Version',
        command: 'yarn version prerelease',
      },
      {
        name: 'Publish',
        command: 'yarn npm publish',
      }
    ]
  }
};

export default config;
