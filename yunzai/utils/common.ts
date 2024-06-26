import { pipeline } from 'stream'
import { promisify } from 'util'
import fetch from 'node-fetch'
import { exec } from 'child_process'
import { dirname, join } from 'path'
import { createWriteStream, existsSync, mkdirSync, readFileSync } from 'fs'

/**
 * 休眠函数
 * @param ms 毫秒
 */
export function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * 下载保存文件
 * @param fileUrl 下载地址
 * @param savePath 保存路径
 * @param param
 */
export async function downFile(fileUrl: string, savePath: string, param = {}) {
  try {
    mkdirs(dirname(savePath))
    logger.debug(`[下载文件] ${fileUrl}`)
    const response = await fetch(fileUrl, param)
    const streamPipeline = promisify(pipeline)
    await streamPipeline(response.body, createWriteStream(savePath))
    return true
  } catch (err) {
    logger.error(`下载文件错误：${err}`)
    return false
  }
}

/**
 *  目录
 * @param name
 * @returns
 */
export function mkdirs(name: string) {
  if (existsSync(name)) {
    return true
  } else {
    if (mkdirs(dirname(name))) {
      mkdirSync(name)
      return true
    }
  }
  return false
}

/**
 * 异步执行cmd
 * @param cmd
 * @returns
 */
export function execAsync(cmd: string): Promise<{
  stdout: string
  stderr: string
}> {
  return new Promise((resolve, reject) => {
    exec(cmd, (error, stdout, stderr) => {
      if (error) reject(error)
      resolve({ stdout, stderr })
    })
  })
}

/**
 * 读取json配置
 * @param dir
 * @returns
 */
export function readJSON(dir: string) {
  try {
    const cfg = readFileSync(join(process.cwd(), dir), 'utf-8')
    return JSON.parse(cfg)
  } catch {
    return false
  }
}

/**
 * 随机字符串
 * @returns
 */
export function randomRange() {
  let randomStr = ''
  let charStr = 'abcdef0123456789'
  for (let i = 0; i < 64; i++) {
    let index = Math.round(Math.random() * (charStr.length - 1))
    randomStr += charStr.substring(index, index + 1)
  }
  return randomStr
}
