import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/vue';

// Sans globals Vitest, Testing Library ne démonte pas les rendus tout seul.
afterEach(() => {
  cleanup();
});
