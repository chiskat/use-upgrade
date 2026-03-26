import { copyFileSync, lstatSync, mkdirSync, readdirSync, readlinkSync } from 'fs'
import { dirname, join, resolve } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const src = resolve(__dirname, '../../../skills')
const dest = resolve(__dirname, '../skills')

function copyDir(srcDir, destDir) {
  mkdirSync(destDir, { recursive: true })
  for (const name of readdirSync(srcDir)) {
    const srcPath = join(srcDir, name)
    const destPath = join(destDir, name)
    const stat = lstatSync(srcPath)

    if (stat.isSymbolicLink()) {
      const realPath = resolve(srcDir, readlinkSync(srcPath))
      copyFileSync(realPath, destPath)
    } else if (stat.isDirectory()) {
      copyDir(srcPath, destPath)
    } else {
      copyFileSync(srcPath, destPath)
    }
  }
}

copyDir(src, dest)
