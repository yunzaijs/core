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
    include: ['src/**/*']
  },
  {
    input: 'src/version.ts',
    file: 'src/version.js',
    include: ['src/**/*']
  },
  {
    input: 'middleware/runtime/index.ts',
    file: 'middleware/runtime/index.js',
    include: ['middleware/**/*']
  },
  {
    input: 'middleware/star-rail/index.ts',
    file: 'middleware/star-rail/index.js',
    include: ['middleware/**/*']
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
          target: 'ESNext',
          module: 'ESNext',
          jsx: 'react',
          strict: false,
          esModuleInterop: true,
          skipLibCheck: true,
          allowJs: false,
          noImplicitAny: false,
          moduleResolution: 'bundler',
          allowImportingTsExtensions: true,
          noEmit: true,
          typeRoots: ['node_modules/@types'],
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
            target: 'ESNext',
            module: 'ESNext',
            jsx: 'react',
            strict: false,
            esModuleInterop: true,
            skipLibCheck: true,
            allowJs: false,
            noImplicitAny: false,
            moduleResolution: 'bundler',
            allowImportingTsExtensions: true,
            noEmit: true,
            typeRoots: ['node_modules/@types']
            // declaration: true,
            // declarationDir: 'yunzai/types',
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
