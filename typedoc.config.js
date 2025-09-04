//@ts-check

/** @type {import('typedoc').TypeDocOptions} */
const config = {
  // typedoc
  //  Configuration
  name: 'color',
  tsconfig: 'src/tsconfig.code.json',
  //  Input
  entryPoints: ['src/index.ts'],
  entryPointStrategy: 'resolve',
  excludeInternal: true,
  excludePrivate: true,
  excludeProtected: true,
  gitRevision: 'main',
  readme: 'doc/intro.md',
  //  Output
  basePath: '.',
  //  Organization
  categorizeByGroup: true,
  defaultCategory: 'Uncategorized',
  categoryOrder: ['Uncategorized', '*'],
};

export default config;
