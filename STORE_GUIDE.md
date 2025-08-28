# Enhanced Store Management Guide

The `storeListener.ts` has been completely refactored and expanded into an enterprise-grade state management solution. This guide covers all the new features and improvements.

## 🚀 What's New

### Major Enhancements
- **Enterprise-grade architecture** with middleware support
- **Performance optimizations** with selective subscriptions
- **Comprehensive error handling** and debugging capabilities
- **Persistence layer** with localStorage integration
- **DevTools integration** for Redux DevTools compatibility
- **Type safety improvements** with better TypeScript support
- **Memory management** with proper cleanup and lifecycle handling

## 📚 API Reference

### Core Store Operations

#### Basic Operations
```typescript
import { useStore, storeMethods } from 'rest-api-kit';

// Hook usage
const MyComponent = () => {
  const store = useStore();
  
  // Save data
  store.save('user-123', { name: 'John', age: 30 });
  
  // Get data
  const user = store.get('user-123');
  
  // Update data (merges objects)
  store.update('user-123', { age: 31 });
  
  // Clear specific item
  store.clear('user-123');
  
  // Clear all data
  store.clearAll();
  
  return <div>{user?.name}</div>;
};

// Direct usage (outside components)
storeMethods.save('session', { token: 'abc123' });
const session = storeMethods.get('session');
```

#### Advanced Operations
```typescript
const store = useStore();

// Batch operations
store.batch([
  { type: 'store/save', payload: { id: 'user1', data: { name: 'Alice' } } },
  { type: 'store/save', payload: { id: 'user2', data: { name: 'Bob' } } },
  { type: 'store/update', payload: { id: 'user1', data: { age: 25 } } }
]);

// Utility methods
console.log(store.isEmpty()); // false
console.log(store.size()); // 2
console.log(store.has('user1')); // true
console.log(store.keys()); // ['user1', 'user2']
console.log(store.values()); // [{ name: 'Alice', age: 25 }, { name: 'Bob' }]
console.log(store.entries()); // [['user1', { name: 'Alice', age: 25 }], ...]
```

### Selective Subscriptions

#### useStoreSelector Hook
```typescript
import { useStoreSelector } from 'rest-api-kit';

const UserProfile = () => {
  // Only re-render when user name changes
  const userName = useStoreSelector(
    state => state.user?.name,
    (a, b) => a === b // Custom equality function
  );
  
  return <h1>{userName}</h1>;
};

// Complex selectors
const UserCount = () => {
  const userCount = useStoreSelector(state => 
    Object.keys(state).filter(key => key.startsWith('user-')).length
  );
  
  return <div>Total users: {userCount}</div>;
};
```

#### Store Events
```typescript
import { useStoreEvents } from 'rest-api-kit';

const AuditLogger = () => {
  useStoreEvents((event) => {
    console.log(`Store ${event.type}:`, {
      id: event.payload.id,
      data: event.payload.data,
      timestamp: event.payload.timestamp
    });
  });
  
  return null;
};

// With options
const UserWatcher = () => {
  useStoreEvents(
    (event) => {
      if (event.payload.id?.startsWith('user-')) {
        console.log('User data changed:', event);
      }
    },
    { immediate: true } // Trigger immediately on mount
  );
  
  return null;
};
```

### Middleware System

```typescript
import { storeMethods } from 'rest-api-kit';

// Logging middleware
const loggingMiddleware = (action, state, next) => {
  console.log('Before:', action.type, state);
  next(action);
  console.log('After:', storeMethods.getAll());
};

// Validation middleware
const validationMiddleware = (action, state, next) => {
  if (action.type === 'store/save' && !action.payload.data) {
    console.error('Cannot save empty data');
    return;
  }
  next(action);
};

// Add middleware
storeMethods.addMiddleware(loggingMiddleware);
storeMethods.addMiddleware(validationMiddleware);

// Remove middleware when needed
storeMethods.removeMiddleware(loggingMiddleware);
```

### Persistence

```typescript
const store = useStore();

// Save current store state to localStorage
const success = store.saveToStorage('my-app-store');
if (success) {
  console.log('Store saved successfully');
}

// Load store state from localStorage
const loaded = store.loadFromStorage('my-app-store');
if (loaded) {
  console.log('Store loaded successfully');
}

// Using default key
store.saveToStorage(); // Uses 'rest-api-kit-store'
store.loadFromStorage(); // Uses 'rest-api-kit-store'
```

### Debugging and DevTools

```typescript
const store = useStore();

// Get action history
const history = store.getHistory();
console.log('Last 10 actions:', history.slice(-10));

// Clear history
store.clearHistory();

// Redux DevTools integration (automatic)
// Install Redux DevTools browser extension to see store state and actions
```

## 🏗️ Architecture Improvements

### Performance Optimizations

1. **Selective Subscriptions**: Components only re-render when specific data changes
2. **Memoized Selectors**: Expensive computations are cached
3. **Batch Operations**: Multiple actions processed in a single update cycle
4. **Memory Management**: Proper cleanup prevents memory leaks

### Error Handling

```typescript
// All operations include error boundaries
try {
  store.save('invalid-id', complexData);
} catch (error) {
  // Errors are logged in development but don't crash the app
  console.log('Store operation failed safely');
}
```

### Type Safety

```typescript
// Enhanced type definitions
import { StoreEvent, StoreSelector, StoreMiddleware } from 'rest-api-kit';

// Type-safe selectors
const typedSelector: StoreSelector<string> = (state) => state.user?.name || '';

// Type-safe middleware
const typedMiddleware: StoreMiddleware = (action, state, next) => {
  // Full type checking available
  next(action);
};
```

## 🔧 Migration Guide

### From Old Store (v0.0.52 and earlier)

```typescript
// OLD API
const store = useStore();
store.save('id', data, options); // Required options parameter
const result = store.get('id');  // Returns data directly

// NEW API
const store = useStore();
store.save('id', data, options); // Options now optional
const result = store.get('id');  // Returns data directly (same)

// NEW FEATURES NOW AVAILABLE
store.update('id', partialData);  // Merge updates
store.clearAll();                 // Clear everything
store.batch([...operations]);     // Batch operations
store.select(state => state.id);  // Selector pattern
```

### New Hooks Available

```typescript
// Selective subscriptions (NEW)
import { useStoreSelector, useStoreEvents } from 'rest-api-kit';

// Event listening (NEW)
useStoreEvents((event) => {
  console.log('Store changed:', event);
});

// Selector-based subscriptions (NEW)
const userName = useStoreSelector(state => state.user?.name);
```

## 📊 Performance Comparison

| Feature | Old Implementation | New Implementation |
|---------|-------------------|-------------------|
| Re-renders | All components on any change | Only affected components |
| Memory Usage | Basic cleanup | Comprehensive lifecycle management |
| Error Handling | Basic try/catch | Enterprise-grade error boundaries |
| Debugging | Console logs | Full history + DevTools integration |
| Type Safety | Basic types | Comprehensive generic typing |
| Middleware | None | Full middleware system |
| Persistence | None | localStorage integration |

## 🛠️ Best Practices

### Component Design
```typescript
// ✅ Good: Use selectors for specific data
const UserName = () => {
  const name = useStoreSelector(state => state.user?.name);
  return <span>{name}</span>;
};

// ❌ Avoid: Using full store in components that only need specific data
const UserName = () => {
  const store = useStore();
  const user = store.get('user'); // Re-renders on any store change
  return <span>{user?.name}</span>;
};
```

### Data Management
```typescript
// ✅ Good: Use batch operations for multiple updates
store.batch([
  { type: 'store/save', payload: { id: 'user1', data: userData1 } },
  { type: 'store/save', payload: { id: 'user2', data: userData2 } },
  { type: 'store/clear', payload: { id: 'old-user' } }
]);

// ❌ Avoid: Multiple individual operations
store.save('user1', userData1);
store.save('user2', userData2);
store.clear('old-user');
```

### Memory Management
```typescript
// ✅ Good: Components automatically clean up subscriptions
useEffect(() => {
  const unsubscribe = store.subscribe(handleChange);
  return unsubscribe; // Automatic cleanup
}, []);

// ✅ Good: Use clearAll() when appropriate (logout, app reset)
const handleLogout = () => {
  store.clearAll();
  store.saveToStorage(); // Persist empty state
};
```

## 🧪 Testing

The enhanced store includes comprehensive test coverage:

```typescript
// Example test patterns
import { storeMethods, useStore } from 'rest-api-kit';
import { renderHook, act } from '@testing-library/react-hooks';

test('should handle store operations', () => {
  const { result } = renderHook(() => useStore());
  
  act(() => {
    result.current.save('test', { value: 123 });
  });
  
  expect(result.current.get('test')).toEqual({ value: 123 });
});
```

## 🔮 Future Enhancements

The enhanced store is designed to be extensible. Planned features include:

- Time-travel debugging
- Store snapshots and rollbacks
- Advanced persistence strategies (IndexedDB, WebSQL)
- Real-time synchronization
- Schema validation
- Performance monitoring

---

This enhanced store maintains full backward compatibility while providing powerful new features for enterprise applications.
