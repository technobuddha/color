//@ts-check

/** @type import('@technobuddha/project/build').Builds */
const config = {
  default: {
    steps: [
      {
        name: 'Clean',
        command: 'rm -rf ./dist'
      },
      {
        name: 'Color',
        command: 'npx tsc --build ./src/tsconfig.json',
      },
    ],
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
        command: 'yarn npm publish --access=public',
      }
    ]
  }
};

export default config;
