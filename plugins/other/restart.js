import { Restart as restart } from 'yz-system'
export default class Restart extends restart {
  e
  constructor(e) {
    super()
    if (e) this.e = e
  }
}
