import { glob } from 'glob';
import path from 'node:path';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default glob.sync('src/js/*.js').map(file => ({
  input: file,
  output: {
    file: `assets/js/${path.basename(file, '.js')}-bundle.js`,
    format: 'esm',
    sourcemap: true
  },
  plugins: [
    resolve(),   // Teaches Rollup how to find 'practice-js' in node_modules
    commonjs()  // Converts CommonJS to ES modules if needed
  ]
}));