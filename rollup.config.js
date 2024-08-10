import typescript from '@rollup/plugin-typescript'
/**
 * @type {import("rollup").RollupOptions[]}
 */
export default [
  {
    input: 'yunzai/index.ts',
    file: 'yunzai/index.js',
    include: ['yunzai/**/*'],
    declaration: true,
    declarationDir: 'yunzai/types',
    outDir: 'yunzai/types'
  },
  {
    input: 'yunzai-mys/index.ts',
    file: 'yunzai-mys/index.js',
    include: ['yunzai-mys/**/*'],
    declaration: true,
    declarationDir: 'yunzai-mys/types',
    outDir: 'yunzai-mys/types'
  },
  {
    input: 'src/main.ts',
    file: 'src/main.js',
    include: ['src/main.ts'],
    declaration: false,
    declarationDir: undefined,
    outDir: undefined
  },
  {
    input: 'src/version.ts',
    file: 'src/version.js',
    include: ['src/version.ts'],
    declaration: false,
    declarationDir: undefined,
    outDir: undefined
  },
  {
    input: 'middleware/runtime/index.ts',
    file: 'middleware/runtime/index.js',
    include: ['middleware/runtime/**/*'],
    declaration: true,
    declarationDir: 'middleware/runtime/types',
    outDir: undefined
  },
  {
    input: 'middleware/star-rail/index.ts',
    file: 'middleware/star-rail/index.js',
    include: ['middleware/star-rail/**/*'],
    declaration: true,
    declarationDir: 'middleware/star-rail/types',
    outDir: undefined
  }
].map(item => {
  return {
    input: item.input,
    output: {
      file: item.file,
      format: 'es',
      sourcemap: false
    },
    plugins: [
      typescript({
        compilerOptions: {
          declaration: item.declaration,
          declarationDir: item.declarationDir,
          outDir: item.outDir
        },
        include: item.include,
        exclude: ['node_modules']
      })
    ],
    onwarn: (warning, warn) => {
      // 忽略与无法解析the导入相关the警告信息
      if (warning.code === 'UNRESOLVED_IMPORT') return
      // 继续使用默认the警告处理
      warn(warning)
    }
  }
})
