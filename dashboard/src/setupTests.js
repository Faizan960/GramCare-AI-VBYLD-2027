import '@testing-library/jest-dom';
import { beforeAll, afterAll } from 'vitest';

global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Suppress Recharts ResponsiveContainer dimensions warnings in jsdom
const originalWarn = console.warn;
beforeAll(() => {
  console.warn = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('The width(0) and height(0) of chart should be greater than 0')
    ) {
      return;
    }
    originalWarn(...args);
  };
});

afterAll(() => {
  console.warn = originalWarn;
});
