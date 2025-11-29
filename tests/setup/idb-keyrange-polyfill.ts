/**
 * Minimal IndexedDB key range polyfill for Vitest (Node) runtime.
 * Only implements the APIs the journal insights store relies on.
 */
type IDBKeyRangeLike = {
  only: (value: unknown) => unknown
}

const globalWithIDB = globalThis as { IDBKeyRange?: IDBKeyRangeLike }

if (!globalWithIDB.IDBKeyRange) {
  class IDBKeyRangePolyfill {
    readonly lower: unknown
    readonly upper: unknown
    readonly lowerOpen: boolean
    readonly upperOpen: boolean

    private constructor(config: { lower: unknown; upper: unknown; lowerOpen: boolean; upperOpen: boolean }) {
      this.lower = config.lower
      this.upper = config.upper
      this.lowerOpen = config.lowerOpen
      this.upperOpen = config.upperOpen
    }

    static only(value: unknown) {
      return new IDBKeyRangePolyfill({ lower: value, upper: value, lowerOpen: false, upperOpen: false })
    }
  }

  globalWithIDB.IDBKeyRange = IDBKeyRangePolyfill
}
