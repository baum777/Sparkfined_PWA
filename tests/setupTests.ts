import '@testing-library/jest-dom/vitest'

// Global setup for jest-dom matchers in Vitest
import matchers from '@testing-library/jest-dom/matchers'
import { expect } from 'vitest'

expect.extend(matchers)
