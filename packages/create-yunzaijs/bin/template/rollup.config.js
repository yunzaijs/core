import { defineConfig } from 'rollup'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'
// 处理ts文件
import typescript from '@rollup/plugin-typescript'
// 处理别名
import alias from '@rollup/plugin-alias'
// 生产dts文件
import dts from 'rollup-plugin-dts'
export default defineConfig([
  {
    // 引入文件
    input: './src/index.ts',
    output: {
      dir: 'lib',
      format: 'es',
      sourcemap: false,
      preserveModules: true
    },
    plugins: [
      // 处理
      typescript({
        compilerOptions: {
          outDir: 'lib'
        },
        include: ['src/**/*']
      })
    ],
    onwarn: (warning, warn) => {
      if (warning.code === 'UNRESOLVED_IMPORT') return
      warn(warning)
    }
  },
  {
    input: './src/index.ts',
    output: {
      dir: 'lib',
      format: 'es',
      sourcemap: false,
      preserveModules: true
    },
    plugins: [
      alias({
        entries: [
          {
            find: '@',
            replacement: resolve(dirname(fileURLToPath(import.meta.url)), 'src')
          }
        ]
      }),
      typescript({
        compilerOptions: {
          outDir: 'lib'
        },
        include: ['src/**/*']
      }),
      dts()
    ],
    onwarn: (warning, warn) => {
      if (warning.code === 'UNRESOLVED_IMPORT') return
      warn(warning)
    }
  }
])
