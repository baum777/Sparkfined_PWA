type ClassValue =
  | string
  | number
  | null
  | undefined
  | ClassDictionary
  | ClassValue[]

type ClassDictionary = Record<string, boolean | undefined | null>

/**
 * Lightweight clsx-style helper to compose Tailwind classes.
 * Supports string, array and object inputs without needing an external dependency.
 */
export function cn(...inputs: ClassValue[]): string {
  const classes: string[] = []

  for (const input of inputs) {
    if (!input) continue

    if (typeof input === 'string' || typeof input === 'number') {
      classes.push(String(input))
      continue
    }

    if (Array.isArray(input)) {
      const nested = cn(...input)
      if (nested) classes.push(nested)
      continue
    }

    if (typeof input === 'object') {
      for (const [key, value] of Object.entries(input)) {
        if (value) classes.push(key)
      }
    }
  }

  return classes.join(' ')
}
