import { defineConfig } from '@technobuddha/project/config';

export default defineConfig({
  directories: {
    src: {
      platform: 'esnext',
    },
  },
  typedoc: { readme: 'doc/intro.md' },
});
