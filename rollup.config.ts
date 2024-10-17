import { defineConfig, RollupOptions } from 'rollup'
import typescript from '@rollup/plugin-typescript'
import dts from 'rollup-plugin-dts'

/**
 * @param {*} input
 * @param {*} dir
 * @param {*} inc
 * @returns
 */
const buildJs = (input: string, dir: string, inc: string) => {
  return {
    input: input,
    output: {
      dir: dir,
      format: 'es',
      sourcemap: false,
      preserveModules: true
    },
    plugins: [
      typescript({
        compilerOptions: {
          outDir: dir
        },
        include: [inc]
      })
    ],
    onwarn: (warning, warn) => {
      if (warning.code === 'UNRESOLVED_IMPORT') return
      warn(warning)
    }
  } as RollupOptions
}

/**
 *
 * @param {*} input
 * @param {*} dir
 * @param {*} inc
 * @returns
 */
const buildDts = (input: string, dir: string, inc: string) => {
  return {
    input: input,
    output: {
      // lib 目录
      dir: dir,
      format: 'es',
      sourcemap: false,
      preserveModules: true
    },
    plugins: [
      typescript({
        compilerOptions: {
          outDir: dir
        },
        include: [inc]
      }),
      dts()
    ],
    onwarn: (warning, warn) => {
      if (warning.code === 'UNRESOLVED_IMPORT') return
      warn(warning)
    }
  } as RollupOptions
}

/**
 *
 */
const config: any[] = []

const BuildByName = (name: string) => {
  const input = `packages/${name}/src/index.ts`
  const dir = `packages/${name}/lib`
  const inc = `packages/${name}/src/**/*`
  config.push(buildJs(input, dir, inc))
  config.push(buildDts(input, dir, inc))
}

const Build1 = (name: string, file: string) => {
  const input = `packages/${name}/src/middleware/${file}.ts`
  const dir = `packages/${name}/lib/middleware`
  const inc = `packages/${name}/src/middleware/**/*`
  config.push(buildJs(input, dir, inc))
  config.push(buildDts(input, dir, inc))
}

const build = () => {
  if (process.env.build == 'mys') {
    BuildByName('mys')
    Build1('mys', 'runtime')
    Build1('mys', 'message')
  } else {
    BuildByName('yunzaijs')
  }
}

build()

export default defineConfig(config.flat(Infinity))
