// 自定义选点密码闸门：开源部署后防止任意坐标刷地图 API（会话内通过一次即可）
import { CUSTOM_POINT_PASSWORD } from '../config';

export function ensureCustomPointUnlocked(): boolean {
  try {
    if (sessionStorage.getItem('customPointUnlocked') === '1') return true;
  } catch {
    // 存储不可用（隐私模式）则每次询问
  }
  const input = window.prompt('该功能将调用地图 API，需要密码（防滥用）：');
  if (input === null) return false;
  if (input === CUSTOM_POINT_PASSWORD) {
    try {
      sessionStorage.setItem('customPointUnlocked', '1');
    } catch {
      // 写失败不影响本次使用
    }
    return true;
  }
  alert('密码错误');
  return false;
}
