import replacePlugin from '@rollup/plugin-replace'
import terser from '@rollup/plugin-terser'
import typescript from '@rollup/plugin-typescript'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import { defineConfig } from 'rollup'
import deletePlugin from 'rollup-plugin-delete'
import { dts } from 'rollup-plugin-dts'

const lernaJson = JSON.parse(readFileSync(resolve(process.cwd(), '../../lerna.json')))
const replace = replacePlugin({
  preventAssignment: true,
  values: {
    __VERSION__: lernaJson.version,
  },
})

export default defineConfig([
  {
    input: 'src/index.ts',
    output: { file: './dist/index.d.ts', format: 'es' },
    plugins: [deletePlugin({ targets: './dist/*' }), dts({ compilerOptions: { preserveSymlinks: false } })],
  },
  {
    input: 'src/react/index.ts',
    output: { file: './dist/react/index.d.ts', format: 'es' },
    plugins: [dts({ compilerOptions: { preserveSymlinks: false } })],
  },
  {
    input: 'src/vue/index.ts',
    output: { file: './dist/vue/index.d.ts', format: 'es' },
    plugins: [dts({ compilerOptions: { preserveSymlinks: false } })],
  },

  {
    input: ['src/index.ts'],
    output: [
      { format: 'cjs', file: './dist/index.cjs.js' },
      { format: 'es', file: './dist/index.esm.js' },
    ],
    plugins: [replace, typescript({ declaration: false })],
  },
  {
    input: ['src/react/index.ts'],
    output: [
      { format: 'cjs', file: './dist/react/index.cjs.js' },
      { format: 'es', file: './dist/react/index.esm.js' },
    ],
    plugins: [replace, typescript({ declaration: false })],
    external: ['react'],
  },
  {
    input: ['src/vue/index.ts'],
    output: [
      { format: 'cjs', file: './dist/vue/index.cjs.js' },
      { format: 'es', file: './dist/vue/index.esm.js' },
    ],
    plugins: [replace, typescript({ declaration: false })],
    external: ['vue'],
  },

  {
    input: ['src/index.ts'],
    output: {
      format: 'umd',
      file: './dist/index.umd.js',
      name: 'useUpgrade',
    },
    plugins: [replace, typescript({ declaration: false }), terser()],
  },
  {
    input: ['src/react/index.ts'],
    output: {
      format: 'umd',
      file: './dist/react/index.umd.js',
      name: 'useUpgradeReact',
      globals: { react: 'React' },
    },
    plugins: [replace, typescript({ declaration: false }), terser()],
    external: ['react'],
  },
  {
    input: ['src/vue/index.ts'],
    output: {
      format: 'umd',
      file: './dist/vue/index.umd.js',
      name: 'useUpgradeVue',
      globals: { vue: 'Vue' },
    },
    plugins: [replace, typescript({ declaration: false }), terser()],
    external: ['vue'],
  },
])
