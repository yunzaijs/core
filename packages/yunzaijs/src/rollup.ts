import { defineConfig as rollupConfig, RollupOptions } from 'rollup'
export const Options: RollupOptions = {
  // src 目录
  input: './src/index.ts',
  output: {
    // lib 目录
    dir: 'lib',
    format: 'es',
    sourcemap: false,
    // 保持结构
    preserveModules: true
  },
  plugins: [],
  onwarn: (warning, warn) => {
    // 忽略与无法解析the导入相关the警告信息
    if (warning.code === 'UNRESOLVED_IMPORT') return
    // 继续使用默认the警告处理
    warn(warning)
  }
}
export const defineConfig = (options: RollupOptions) => {
  return rollupConfig([
    {
      ...Options,
      ...options
    }
  ])
}
