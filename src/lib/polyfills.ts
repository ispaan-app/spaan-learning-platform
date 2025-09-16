// Polyfills for server-side rendering
if (typeof globalThis !== 'undefined') {
  // @ts-ignore
  globalThis.self = globalThis;
}

if (typeof global !== 'undefined') {
  // @ts-ignore
  global.self = global;
}

if (typeof window === 'undefined') {
  // @ts-ignore
  global.self = global;
}

// Additional polyfills for problematic libraries
if (typeof self === 'undefined') {
  // @ts-ignore
  global.self = global;
}

// Polyfill for libraries that expect browser globals
if (typeof window === 'undefined') {
  // @ts-ignore
  global.window = global;
  // @ts-ignore
  global.document = {};
  // @ts-ignore
  global.navigator = {};
  // @ts-ignore
  global.location = {};
}
