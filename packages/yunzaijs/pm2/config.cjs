/**
 * @type {{ apps: import("pm2").StartOptions[] }}
 */
module.exports = {
  apps: [
    {
      name: 'yunzai-next',
      script: 'src/main.js',
      args: [...process.argv].slice(4),
      // 超时时间内进程仍未终止，则 PM2 将强制终止该进程
      kill_timeout: 5000,
      // 发送意外重启
      autorestart: true,
      // 进程到达指定内存时重启
      max_memory_restart: '2G',
      // 进程重启之间的延迟时间
      restart_delay: 5000,
      // 进程重启之间的最大延迟时间
      restart_delay_max: 10000,
      // 将 PM2 进程列表自动保存到文件中
      autodump: true,
      // 不监听文件变化
      watch: false,
      env: {
        // 生产环境
        NODE_ENV: 'production'
        // 此环境变量，都称之为开发环境
      }
    }
  ]
}
