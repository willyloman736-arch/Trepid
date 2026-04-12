/* ============================================================
   Offline trade queue — IndexedDB-backed.
   Queues trades when the device is offline. The useOnlineStatus
   hook auto-syncs when the connection returns. The service
   worker's 'sync' event handler also calls syncPendingTrades()
   for background sync on supported browsers.
   ============================================================ */

const DB_NAME = 'trepid-offline'
const STORE_NAME = 'pending-trades'
const DB_VERSION = 1

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB unavailable'))
      return
    }
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onerror = () => reject(req.error)
    req.onsuccess = () => resolve(req.result)
    req.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'localId' })
      }
    }
  })
}

export async function queueTrade(trade: Record<string, unknown>): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    const store = tx.objectStore(STORE_NAME)
    store.add({
      ...trade,
      localId: `local_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      queuedAt: new Date().toISOString(),
    })
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

export async function getPendingTrades(): Promise<Record<string, unknown>[]> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly')
    const req = tx.objectStore(STORE_NAME).getAll()
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

export async function removePendingTrade(localId: string): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    tx.objectStore(STORE_NAME).delete(localId)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

export async function syncPendingTrades(): Promise<number> {
  let synced = 0
  try {
    const pending = await getPendingTrades()
    if (pending.length === 0) return 0

    for (const trade of pending) {
      try {
        const res = await fetch('/api/trades', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(trade),
        })
        if (res.ok) {
          await removePendingTrade(trade.localId as string)
          synced++
        }
      } catch {
        break // Still offline, stop trying
      }
    }
  } catch {
    // IndexedDB unavailable or empty — nothing to sync
  }
  return synced
}
