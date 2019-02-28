import svelte from 'rollup-plugin-svelte'
import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import { terser } from 'rollup-plugin-terser'
import standard from 'rollup-plugin-standard'
import css from 'rollup-plugin-css-only'
import nodent from 'rollup-plugin-nodent'
import json from 'rollup-plugin-json'

const production = !process.env.ROLLUP_WATCH

export default {
  input: 'src/main.js',
  output: {
    sourcemap: true,
    format: 'iife',
    name: 'app',
    file: 'public/bundle.js'
  },
  plugins: [
    svelte({
      dev: !production,
      css: css => {
        css.write('public/bundle.css')
      }
    }),
    css({
      output: 'public/global.css'
    }),
    json(),
    standard(),
    resolve(),
    commonjs(),
    production && nodent({
      promises: true,
      noRuntime: true
    }),
    production && terser()
  ]
}
