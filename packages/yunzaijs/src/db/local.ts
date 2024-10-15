import { LocalStorage } from 'node-localstorage'
/**
 * 用以复刻浏览器api的存储方案
 * 如果code在未来可能移植至浏览器
 * 在jsx&tsx中，推荐使用此存储
 */
export const localStorage = new LocalStorage('./data/storage/local')
