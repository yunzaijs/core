import { ComponentCreateOpsionType } from '../utils/component'
export type RouterType = {
  url: string
  element: React.ReactNode
  options?: ComponentCreateOpsionType
}[]
