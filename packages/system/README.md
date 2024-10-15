# Yunzai-System

提供一些必要的，对机器人进行管理的功能。

## 使用教程

- install

```sh
# yarn
yarn add yz-system@latest -W
```

- yunzai.config.json

```json
{
  "applications": ["yz-system"]
}
```

- use

聊天窗口发送`#系统帮助`

## 开发

```sh
git clone git@github.com:yunzai-org/system.git
cd system
```

```sh
git clone https://github.com/yunzai-org/system.git
cd system
```

```sh
npm install yarn@1.19.1 -g
yarn
```

```sh
yarn app
```

## 更新记录

### 1.0.12

- 消除实例化

### 1.0.11

- 降低 puppeteer 版本

### 1.0.10

- 增加 /cwd
- 增加对 json 的修改

### 1.0.9

- 因权限设计错误而修改判断

### 1.0.8

- 调整更新逻辑

### 1.0.7

- 预匹配，减少 new 行为

### 1.0.6

- 修复消息乱发

### 1.0.5

- 扩展#依赖配置
- 修复#重启
- 增加#结束进程
- 增加二次确认

### 1.0.3

- 增加#依赖管理
- 增加#系统帮助
