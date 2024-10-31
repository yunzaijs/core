import { createWriteStream, existsSync, mkdirSync, readFileSync } from 'fs'
import { exec } from 'child_process'
import { dirname, join } from 'path'
import { pipeline } from 'stream'
import { promisify } from 'util'
import fetch from 'node-fetch'
import crypto from 'crypto'

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
 * @deprecated 已废弃，这是一个没有辅助意义的函数。
 * @returns
 */
export function mkdirs(name: string) {
  if (existsSync(name)) return true
  if (!mkdirs(dirname(name))) return false
  mkdirSync(name, {
    recursive: true
  })
  return true
}

/**
 * 异步执行cmd
 * @param cmd
 * @deprecated 已废弃，这是一个没有辅助意义的函数。
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
 * @deprecated 已废弃，这是一个没有辅助意义的函数。
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
 * @deprecated 已废弃，请改用
 * @returns
 * ***
 * import crypto from 'crypto';
 * ***
 * crypto.randomBytes(32).toString('hex')
 */
export function randomRange() {
  const randomBytes = crypto.randomBytes(32)
  return randomBytes.toString('hex')
}

/**
 * 休眠函数
 * @param ms 毫秒
 * @deprecated 已废弃. 请改用
 * ***
 * import { promisify } from 'util'
 * *****
 * const sleep = promisify(setTimeout)
 */
export const sleep = promisify(setTimeout)
