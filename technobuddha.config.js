//@ts-check
/** @type import("@technobuddha/project").TechnobuddhaConfig */
const config = {
  directories: {
    src: {
      platform: 'esnext',
    },
  },
  typedoc: { readme: 'doc/intro.md' },
};

export default config;
