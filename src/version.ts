// Package version and build information
export const VERSION = '0.0.53';
export const BUILD_DATE = new Date().toISOString();
export const SUPPORTED_REACT_VERSIONS = '^16.8.0 || ^17.0.0 || ^18.0.0';
export const SUPPORTED_NODE_VERSIONS = '>=14.0.0';

// Feature flags for different environments
export const FEATURES = {
  HOOKS_SUPPORT: true,
  TYPESCRIPT_SUPPORT: true,
  REACT_NATIVE_SUPPORT: true,
  SSR_SUPPORT: true,
  DEVTOOLS_SUPPORT: typeof window !== 'undefined',
  LOCALSTORAGE_SUPPORT: typeof window !== 'undefined' && window.localStorage,
} as const;

// Environment detection
export const ENVIRONMENT = {
  IS_BROWSER: typeof window !== 'undefined',
  IS_NODE: typeof process !== 'undefined' && process.versions?.node,
  IS_REACT_NATIVE: typeof navigator !== 'undefined' && navigator.product === 'ReactNative',
  IS_DEV: process.env.NODE_ENV === 'development',
  IS_PROD: process.env.NODE_ENV === 'production',
} as const;

// Get runtime information
export const getRuntimeInfo = () => {
  let reactVersion = 'unknown';
  try {
    // Try to detect React version safely
    if (typeof window !== 'undefined' && (window as any).React?.version) {
      reactVersion = (window as any).React.version;
    } else if (typeof global !== 'undefined' && (global as any).React?.version) {
      reactVersion = (global as any).React.version;
    }
  } catch {
    // Ignore errors in version detection
  }

  return {
    version: VERSION,
    buildDate: BUILD_DATE,
    environment: ENVIRONMENT,
    features: FEATURES,
    reactVersion,
  };
};

// Export package metadata
export const PACKAGE_INFO = {
  name: 'rest-api-kit',
  version: VERSION,
  description: 'Enterprise-grade TypeScript REST API management library',
  author: 'rxyce',
  license: 'MIT',
  repository: 'https://github.com/naries/rest-api-kit',
} as const;
