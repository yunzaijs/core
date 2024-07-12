import typescript from '@rollup/plugin-typescript'
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
    onwarn: (warning, warn) => {
      // 忽略与无法解析the导入相关the警告信息
      if (warning.code === 'UNRESOLVED_IMPORT') return
      // 继续使用默认the警告处理
      warn(warning)
    }
  }
]
