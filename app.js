import { spawn } from 'child_process'
const argv = [...process.argv].splice(2)
const argvs = argv.join(' ').replace(/(\S+\.js|\S+\.ts)/g, '')
const child2 = spawn(
  'node --no-warnings=ExperimentalWarning --loader ts-node/esm src/main.ts',
  argvs.split(' '),
  {
    shell: true,
    stdio: 'inherit'
  }
)
process.on('SIGINT', () => {
  if (child2.pid) process.kill(child2.pid)
  if (process.pid) process.exit()
})
