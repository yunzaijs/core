import fetch from 'node-fetch'
import { createRequire } from 'module'
try {
  const require = createRequire(import.meta.url)
  const pkg = require('../package.json')
  const repoOwner = 'yunzai-org'
  const repoName = 'yunzaijs'
  const filePath = 'package.json'
  const url = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${filePath}`
  const response = await fetch(url)
  if (response.status === 200) {
    const content = ((await response.json()) as any).content
    const buffer = Buffer.from(content, 'base64')
    const packageJson = buffer.toString('utf-8')
    const pkg2 = JSON.parse(packageJson)
    const version = String(pkg.version).split('.').join('')
    const version2 = String(pkg2.version).split('.').join('')
    if (Number(version) <= Number(version2)) {
      console.error('警告：版本未提升！', version, version2)
      process.exit(1)
    }
  } else {
    console.error('无法获取 package.json 文件。状态码:', response.status)
    process.exit(1)
  }
} catch (error) {
  console.error('发生错误:', error.message)
  process.exit(1)
}
