import typescript from '@rollup/plugin-typescript'

/**
 *
 * @param {*} warning
 * @param {*} warn
 * @returns
 */
const onwarn = (warning, warn) => {
  // 忽略与无法解析the导入相关the警告信息
  if (warning.code === 'UNRESOLVED_IMPORT') return
  // 继续使用默认the警告处理
  warn(warning)
}

/**
 *
 */
const cfg = [
  {
    input: 'src/main.ts',
    file: 'src/main.js',
    include: ['src/main.ts'],
    declaration: false
  },
  {
    input: 'src/version.ts',
    file: 'src/version.js',
    include: ['src/version.ts'],
    declaration: false
  },
  {
    input: 'middleware/runtime/index.ts',
    file: 'middleware/runtime/index.js',
    include: ['middleware/runtime/index.ts'],
    declaration: true,
    declarationDir: 'middleware/runtime/types'
  },
  {
    input: 'middleware/star-rail/index.ts',
    file: 'middleware/star-rail/index.js',
    include: ['middleware/star-rail/index.ts'],
    declaration: true,
    declarationDir: 'middleware/star-rail/types'
  }
]

/**
 * @type {import("rollup").RollupOptions[]}
 */
export default [
  // 编译 core
  {
    input: 'yunzai/index.ts',
    output: {
      file: 'yunzai/index.js',
      format: 'es',
      sourcemap: false
    },
    plugins: [
      typescript({
        compilerOptions: {
          declaration: true,
          declarationDir: 'yunzai/types',
          outDir: 'yunzai/types'
        },
        include: ['yunzai/**/*'],
        exclude: ['node_modules']
      })
    ],
    onwarn
  }
].concat(
  cfg.map(item => {
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
            declarationDir: item?.declarationDir
            // outDir: 'yunzai/types'
          },
          include: item.include,
          exclude: ['node_modules']
        })
      ],
      onwarn
    }
  })
)
