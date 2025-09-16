// Comprehensive polyfills for server-side rendering
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

// Comprehensive polyfill for libraries that expect browser globals
if (typeof window === 'undefined') {
  // @ts-ignore
  global.window = global;
  
  // Create a comprehensive document polyfill
  const documentPolyfill = {
    getElementsByTagName: (tagName: string) => [],
    querySelector: (selector: string) => null,
    querySelectorAll: (selector: string) => [],
    createElement: (tagName: string) => ({
      style: {},
      setAttribute: () => {},
      getAttribute: () => null,
      addEventListener: () => {},
      removeEventListener: () => {},
      appendChild: () => {},
      removeChild: () => {},
      innerHTML: '',
      textContent: '',
      className: '',
      id: '',
      tagName: tagName.toUpperCase()
    }),
    createTextNode: (text: string) => ({ textContent: text }),
    addEventListener: () => {},
    removeEventListener: () => {},
    body: {
      style: {},
      appendChild: () => {},
      removeChild: () => {},
      innerHTML: '',
      textContent: ''
    },
    head: {
      style: {},
      appendChild: () => {},
      removeChild: () => {},
      innerHTML: '',
      textContent: ''
    },
    documentElement: {
      style: {},
      appendChild: () => {},
      removeChild: () => {},
      innerHTML: '',
      textContent: ''
    },
    title: '',
    URL: 'http://localhost:3000',
    readyState: 'complete'
  };
  
  // @ts-ignore
  global.document = documentPolyfill;
  
  // @ts-ignore
  global.navigator = {
    userAgent: 'Node.js',
    platform: 'Node.js',
    language: 'en-US',
    languages: ['en-US'],
    cookieEnabled: false,
    onLine: true
  };
  
  // @ts-ignore
  global.location = {
    href: 'http://localhost:3000',
    origin: 'http://localhost:3000',
    protocol: 'http:',
    host: 'localhost:3000',
    hostname: 'localhost',
    port: '3000',
    pathname: '/',
    search: '',
    hash: '',
    assign: () => {},
    replace: () => {},
    reload: () => {}
  };
  
  // Add HTMLElement polyfill
  // @ts-ignore
  global.HTMLElement = class HTMLElement {
    constructor() {
      this.style = {};
      this.className = '';
      this.id = '';
      this.innerHTML = '';
      this.textContent = '';
    }
    
    setAttribute() {}
    getAttribute() { return null; }
    addEventListener() {}
    removeEventListener() {}
    appendChild() {}
    removeChild() {}
  };
}
