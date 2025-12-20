// 🚨
// 🚨 CHANGES TO THIS FILE WILL BE OVERRIDDEN
// 🚨
import jestExtended from 'jest-extended';
import jestMatcherDeepCloseTo from 'jest-matcher-deep-close-to';
import { expect } from 'vitest';

expect.extend(jestExtended);
expect.extend(jestMatcherDeepCloseTo);
