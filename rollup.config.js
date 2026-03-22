import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';

export default {
  input: 'src/wattpilot-card.ts',
  output: {
    dir: 'dist',
    format: 'es',
    sourcemap: false
  },
  plugins: [
    resolve(),
    typescript(),
    terser()
  ]
};
