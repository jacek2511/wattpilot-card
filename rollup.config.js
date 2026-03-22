import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';

export default {
  input: 'src/wattpilot-card.ts',
  output: {
    file: 'dist/wattpilot-card.js',
    format: 'es',
    sourcemap: false,
    inlineDynamicImports: true,
  },
  // KLUCZOWE: Upewnij się, że ta lista jest PUSTA
  external: [], 
  plugins: [
    resolve({
      browser: true,
      preferBuiltins: false
    }),
    typescript({
      declaration: false,
    }),
    terser({
      format: { comments: false },
    })
  ],
  // Dodaj to, aby widzieć w logach Actions, jeśli coś idzie nie tak z importem
  onwarn(warning, warn) {
    if (warning.code === 'UNRESOLVED_IMPORT') throw new Error(warning.message);
    warn(warning);
  }
};
