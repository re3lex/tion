/* eslint-disable no-param-reassign */
import { terser } from 'rollup-plugin-terser';
import pkg from './package.json';


export default (commandLineArgs) => {
  const { minify } = commandLineArgs;
  delete commandLineArgs.minify;

  const extraPlugins = [];

  if (minify) {
    extraPlugins.push(terser());
  }

  return [

    // CommonJS (for Node) and ES module (for bundlers) build.
    // (We could have three entries in the configuration array
    // instead of two, but it's quicker to generate multiple
    // builds from a single configuration where possible, using
    // an array for the `output` option, where we can specify
    // `file` and `format` for each target)
    {
      input: 'src/TionAPI.js',
      external: ['axios', 'querystring'],
      plugins: [...extraPlugins],
      output: [
        { file: pkg.main, format: 'cjs' },
        { file: pkg.module, format: 'es' },
      ],
    },
  ];
};
