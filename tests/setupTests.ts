// Globales Setup für jest-dom Matcher in Vitest
import matchers from '@testing-library/jest-dom/matchers';
import { expect } from 'vitest';

expect.extend(matchers);
