import typescript from '@rollup/plugin-typescript'
import { defineConfig } from 'rollup'
import deletePlugin from 'rollup-plugin-delete'
import { dts } from 'rollup-plugin-dts'

export default defineConfig([
  {
    input: 'src/index.ts',
    output: { file: './dist/index.d.ts', format: 'es' },
    plugins: [deletePlugin({ targets: './dist/*' }), dts({ compilerOptions: { preserveSymlinks: false } })],
    external: ['vite'],
  },

  {
    input: ['src/index.ts'],
    output: [
      { format: 'cjs', file: './dist/index.cjs.js' },
      { format: 'es', file: './dist/index.esm.js' },
    ],
    plugins: [typescript({ declaration: false })],
    external: ['vite'],
  },
])
