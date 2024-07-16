import { LocalStorage } from 'node-localstorage';
import levelup from 'levelup';
import leveldown from 'leveldown';
/**
 * 用以复刻浏览器api的存储方案
 * 如果code在未来可能移植至浏览器
 * 在jsx&tsx中，推荐使用此存储
 */
export const localStorage = new LocalStorage('./data/storage/local');
/**
 * 用以本地键值对的存储方案
 * 可使用此存储代替redis
 * 若场景较为复杂，请继续使用redis
 */
export const levelStorage = levelup(leveldown('./data/storage/level'));