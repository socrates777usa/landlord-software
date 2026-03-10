// ============================================================
// ACME Landlord Software — IndexedDB Schema v1
// Storage adapter pattern: swap local for cloud without rewrite
// ============================================================
export const DB_NAME = 'acme-landlord-db'
export const DB_VERSION = 1

export const STORES = {
  PROPERTIES:     'properties',
  TENANTS:        'tenants',
  LEASES:         'leases',
  TRANSACTIONS:   'transactions',
  MAINTENANCE:    'maintenance',
  INSURANCE:      'insurance',
  ENTITIES:       'entities',
  DOCUMENTS:      'documents',
  VENDORS:        'vendors',
  ALERTS:         'alerts',
  SETTINGS:       'settings',
  HELOC:          'heloc',
  CAPITAL_EVENTS: 'capital_events',
}

export async function initDB() {
  const { openDB } = await import('idb')
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORES.PROPERTIES)) {
        const ps = db.createObjectStore(STORES.PROPERTIES, { keyPath: 'id' })
        ps.createIndex('llcId',  'llcId',  { unique: false })
        ps.createIndex('status', 'status', { unique: false })
        ps.createIndex('zip',    'zip',    { unique: false })
      }
      if (!db.objectStoreNames.contains(STORES.TENANTS)) {
        const ts = db.createObjectStore(STORES.TENANTS, { keyPath: 'id' })
        ts.createIndex('propertyId', 'propertyId', { unique: false })
        ts.createIndex('status',     'status',     { unique: false })
      }
      if (!db.objectStoreNames.contains(STORES.LEASES)) {
        const ls = db.createObjectStore(STORES.LEASES, { keyPath: 'id' })
        ls.createIndex('propertyId', 'propertyId', { unique: false })
        ls.createIndex('tenantId',   'tenantId',   { unique: false })
        ls.createIndex('endDate',    'endDate',    { unique: false })
      }
      if (!db.objectStoreNames.contains(STORES.TRANSACTIONS)) {
        const tr = db.createObjectStore(STORES.TRANSACTIONS, { keyPath: 'id' })
        tr.createIndex('propertyId', 'propertyId', { unique: false })
        tr.createIndex('llcId',      'llcId',      { unique: false })
        tr.createIndex('date',       'date',       { unique: false })
        tr.createIndex('type',       'type',       { unique: false })
      }
      if (!db.objectStoreNames.contains(STORES.MAINTENANCE)) {
        const ms = db.createObjectStore(STORES.MAINTENANCE, { keyPath: 'id' })
        ms.createIndex('propertyId', 'propertyId', { unique: false })
        ms.createIndex('status',     'status',     { unique: false })
        ms.createIndex('priority',   'priority',   { unique: false })
      }
      if (!db.objectStoreNames.contains(STORES.INSURANCE))
        db.createObjectStore(STORES.INSURANCE,      { keyPath: 'id' })
      if (!db.objectStoreNames.contains(STORES.ENTITIES))
        db.createObjectStore(STORES.ENTITIES,       { keyPath: 'id' })
      if (!db.objectStoreNames.contains(STORES.VENDORS))
        db.createObjectStore(STORES.VENDORS,        { keyPath: 'id' })
      if (!db.objectStoreNames.contains(STORES.ALERTS))
        db.createObjectStore(STORES.ALERTS,         { keyPath: 'id' })
      if (!db.objectStoreNames.contains(STORES.SETTINGS))
        db.createObjectStore(STORES.SETTINGS,       { keyPath: 'key' })
      if (!db.objectStoreNames.contains(STORES.HELOC))
        db.createObjectStore(STORES.HELOC,          { keyPath: 'id' })
      if (!db.objectStoreNames.contains(STORES.DOCUMENTS)) {
        const ds = db.createObjectStore(STORES.DOCUMENTS, { keyPath: 'id' })
        ds.createIndex('propertyId', 'propertyId', { unique: false })
        ds.createIndex('type',       'type',       { unique: false })
      }
      if (!db.objectStoreNames.contains(STORES.CAPITAL_EVENTS)) {
        const ce = db.createObjectStore(STORES.CAPITAL_EVENTS, { keyPath: 'id' })
        ce.createIndex('propertyId', 'propertyId', { unique: false })
        ce.createIndex('type',       'type',       { unique: false })
      }
    }
  })
}
