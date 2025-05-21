// @ts-check
// 🚨
// 🚨 CHANGES TO THIS FILE WILL BE OVERRIDDEN
// 🚨
import { app } from '@technobuddha/project';

/**
 * @import { type Linter } from 'eslint';
 * @type {Linter.Config[]}
 */
const config = [
  // src/tsconfig.json
  app.lint({ files: ['src/*.ts'], ignores: [], tsConfig: 'src/tsconfig.json' }),
  // tsconfig.json
  app.lint({ files: ['*.config.js'], ignores: [], environment: 'node' }),
];

export default config;
