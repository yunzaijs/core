import typescript from '@rollup/plugin-typescript'
import { copyFileSync, mkdirSync } from 'fs'
/**
 * @type {import("rollup").RollupOptions[]}
 */
export default [
  // 编译 core
  {
    input: 'yunzai/index.ts',
    output: {
      dir: 'yunzai/dist',
      format: 'es',
      sourcemap: false
    },
    plugins: [
      typescript({
        // 这里指定了 tsconfig 文件的位置
        tsconfig: 'tsconfig.build.json'
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

mkdirSync('./yunzai/dist', {
  recursive: true
})

// 复制文件
copyFileSync('./yunzai/main.css', './yunzai/dist/main.css')

// rm -rf ./yunzai/**/*.js
