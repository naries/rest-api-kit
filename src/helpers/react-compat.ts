// Compatibility helpers for different React versions
import React from 'react';

// Check if React version supports hooks by checking React version
const getReactMajorVersion = (): number => {
  if (React.version) {
    const majorVersion = parseInt(React.version.split('.')[0], 10);
    return majorVersion;
  }
  return 16; // Assume modern React if version is not available
};

const getReactMinorVersion = (): number => {
  if (React.version) {
    const minorVersion = parseInt(React.version.split('.')[1], 10);
    return minorVersion;
  }
  return 8; // Assume hooks are available
};

// Check if hooks are supported (React 16.8+)
const supportsHooks = (): boolean => {
  const major = getReactMajorVersion();
  const minor = getReactMinorVersion();
  
  if (major > 16) return true;
  if (major === 16 && minor >= 8) return true;
  
  // Also check if hooks exist on React object
  return !!(
    typeof React.useState === 'function' &&
    typeof React.useEffect === 'function' &&
    typeof React.useReducer === 'function'
  );
};

const hasHooks = supportsHooks();

// Export React hooks with fallbacks for older versions
export const useStateCompat = hasHooks 
  ? React.useState 
  : () => {
      throw new Error('rest-api-kit requires React 16.8+ for hooks support. Please upgrade React or use class components with connect HOC.');
    };

export const useEffectCompat = hasHooks 
  ? React.useEffect 
  : () => {
      throw new Error('rest-api-kit requires React 16.8+ for hooks support. Please upgrade React or use class components with connect HOC.');
    };

export const useReducerCompat = hasHooks 
  ? React.useReducer 
  : () => {
      throw new Error('rest-api-kit requires React 16.8+ for hooks support. Please upgrade React or use class components with connect HOC.');
    };

export const useCallbackCompat = hasHooks 
  ? React.useCallback 
  : (fn: any) => fn;

export const useMemoCompat = hasHooks 
  ? React.useMemo 
  : (fn: any) => fn();

export const useRefCompat = hasHooks 
  ? React.useRef 
  : () => ({ current: null });

// Version detection
export const getReactVersion = () => {
  if (React.version) {
    return React.version;
  }
  // Fallback detection
  if (hasHooks) {
    return '16.8+';
  }
  return 'legacy';
};

// Check if current React version is supported
export const isReactVersionSupported = () => {
  return hasHooks;
};

// Throw helpful error for unsupported versions
export const assertReactSupport = () => {
  if (!hasHooks) {
    throw new Error(
      'rest-api-kit requires React 16.8 or higher for hooks support. ' +
      'Current React version: ' + getReactVersion() + '. ' +
      'Please upgrade React to use this library.'
    );
  }
};

export { React };
