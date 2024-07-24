import { Restart as restart } from 'yz-system'
export default class Restart extends restart {
  constructor(e) {
    super()
    if (e) this.e = e
  }
}
