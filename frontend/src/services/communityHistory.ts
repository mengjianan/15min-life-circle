// 社区体检历史：IndexedDB 存最近 3 条全量结果，社区对比的数据源
// 存全量是为了对比能取任意维度（设施/时间档/方式/盲区/风水），不只是分数摘要
import { FullAnalysisResult } from '../types';

export interface HistoryEntry {
  id: string; // 社区名（同名视为同一社区）
  communityName: string;
  lng: number;
  lat: number;
  savedAt: string; // ISO 时间，排序/淘汰用
  fullResult: FullAnalysisResult;
}

const DB_NAME = 'community-history';
const STORE = 'entries';
const DB_VERSION = 1;
export const MAX_HISTORY = 3;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(STORE)) {
        req.result.createObjectStore(STORE, { keyPath: 'id' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

const byNewest = (list: HistoryEntry[]) =>
  [...list].sort((a, b) => b.savedAt.localeCompare(a.savedAt));

// 距离近似（米），同社区判定用（100m 内视为同一社区）
const approxDistance = (a: { lng: number; lat: number }, b: { lng: number; lat: number }) =>
  Math.hypot((a.lng - b.lng) * 95000, (a.lat - b.lat) * 111000);

async function persist(list: HistoryEntry[]): Promise<void> {
  // ponytail: 上限 3 条，clear + 全量回写比增量删改更短且够用
  try {
    const db = await openDB();
    await new Promise<void>((resolve) => {
      const tx = db.transaction(STORE, 'readwrite');
      const store = tx.objectStore(STORE);
      store.clear();
      list.forEach((e) => store.put(e));
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve(); // 写失败不阻塞 UI，下次体检再覆盖
    });
  } catch {
    // IndexedDB 不可用（隐私模式）时静默放弃持久化
  }
}

export async function loadHistory(): Promise<HistoryEntry[]> {
  try {
    const db = await openDB();
    const all = await new Promise<HistoryEntry[]>((resolve) => {
      const req = db.transaction(STORE).objectStore(STORE).getAll();
      req.onsuccess = () => resolve((req.result || []) as HistoryEntry[]);
      req.onerror = () => resolve([]);
    });
    // 坏条目（缺 fullResult）直接丢弃，不让一条脏数据废掉对比区
    return byNewest(all.filter((e) => e && e.id && e.fullResult && e.savedAt));
  } catch {
    return [];
  }
}

export async function saveHistory(result: FullAnalysisResult): Promise<HistoryEntry[]> {
  const entry: HistoryEntry = {
    id: result.community_name,
    communityName: result.community_name,
    lng: result.center.lng,
    lat: result.center.lat,
    savedAt: new Date().toISOString(),
    fullResult: result,
  };
  const all = await loadHistory();
  // 同名或 100m 内 = 同一社区：原地覆盖（反复体检只留最新），不占第 4 席
  const same = all.find((e) => e.id === entry.id || approxDistance(e, entry) < 100);
  const next = byNewest(
    same ? all.map((e) => (e.id === same.id ? entry : e)) : [entry, ...all].slice(0, MAX_HISTORY)
  );
  await persist(next);
  return next;
}

export async function removeHistory(id: string): Promise<HistoryEntry[]> {
  const next = (await loadHistory()).filter((e) => e.id !== id);
  await persist(next);
  return next;
}
