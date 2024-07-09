import { LocalStorage } from 'node-localstorage';
import levelup from 'levelup';
import leveldown from 'leveldown';
/**
 * 用以复刻浏览器api的存储方案
 */
export const localStorage = new LocalStorage('./localStorage');
/**
 * 用以本地键值对的存储方案
 */
export const levelStorage = levelup(leveldown('./levelStorage'));