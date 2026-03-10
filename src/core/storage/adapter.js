// ============================================================
// ACME Landlord Software — Storage Adapter
// Phase 1: IndexedDB local storage
// Phase 2: Swap in OneDrive or Google Drive — zero logic change
// ============================================================
import { initDB, STORES } from '../db/schema.js'
import { v4 as uuid } from 'uuid'

let _db = null
async function getDB() {
  if (!_db) _db = await initDB()
  return _db
}

export async function getAll(store) {
  const db = await getDB()
  return db.getAll(store)
}
export async function getById(store, id) {
  const db = await getDB()
  return db.get(store, id)
}
export async function getByIndex(store, indexName, value) {
  const db = await getDB()
  return db.getAllFromIndex(store, indexName, value)
}
export async function save(store, record) {
  const db = await getDB()
  const now = new Date().toISOString()
  const toSave = { ...record, id: record.id || uuid(), createdAt: record.createdAt || now, updatedAt: now }
  await db.put(store, toSave)
  return toSave
}
export async function remove(store, id) {
  const db = await getDB()
  await db.delete(store, id)
}
export async function getSetting(key, defaultValue = null) {
  const db = await getDB()
  const record = await db.get(STORES.SETTINGS, key)
  return record ? record.value : defaultValue
}
export async function setSetting(key, value) {
  const db = await getDB()
  await db.put(STORES.SETTINGS, { key, value, updatedAt: new Date().toISOString() })
}
export async function exportAllData() {
  const db = await getDB()
  const data = {}
  for (const store of Object.values(STORES)) data[store] = await db.getAll(store)
  return JSON.stringify(data, null, 2)
}
export async function importAllData(jsonString) {
  const db = await getDB()
  const data = JSON.parse(jsonString)
  const tx = db.transaction(Object.values(STORES), 'readwrite')
  for (const [store, records] of Object.entries(data)) {
    if (!Object.values(STORES).includes(store)) continue
    await tx.objectStore(store).clear()
    for (const record of records) await tx.objectStore(store).put(record)
  }
  await tx.done
}
