import { renderHook, act } from '@testing-library/react-hooks';
import { useStore, useStoreSelector, useStoreEvents, storeMethods, StoreEvent } from '../../hooks/storeListener';

// Mock console methods to avoid noise in tests
const originalConsole = console;
beforeAll(() => {
  console.warn = jest.fn();
  console.error = jest.fn();
});

afterAll(() => {
  console.warn = originalConsole.warn;
  console.error = originalConsole.error;
});

beforeEach(() => {
  // Clear store before each test
  storeMethods.clearAll();
  storeMethods.clearHistory();
});

describe('storeListener', () => {
  describe('useStore hook', () => {
    it('should save and retrieve data', () => {
      const { result } = renderHook(() => useStore());
      
      act(() => {
        result.current.save('test-id', { message: 'hello' });
      });

      const retrieved = result.current.get('test-id');
      expect(retrieved).toEqual({ message: 'hello' });
    });

    it('should update existing data', () => {
      const { result } = renderHook(() => useStore());
      
      act(() => {
        result.current.save('test-id', { name: 'John', age: 30 });
      });

      act(() => {
        result.current.update('test-id', { age: 31 });
      });

      const retrieved = result.current.get('test-id');
      expect(retrieved).toEqual({ name: 'John', age: 31 });
    });

    it('should clear specific data', () => {
      const { result } = renderHook(() => useStore());
      
      act(() => {
        result.current.save('test-id-1', 'data1');
        result.current.save('test-id-2', 'data2');
      });

      act(() => {
        result.current.clear('test-id-1');
      });

      expect(result.current.get('test-id-1')).toBeUndefined();
      expect(result.current.get('test-id-2')).toBe('data2');
    });

    it('should clear all data', () => {
      const { result } = renderHook(() => useStore());
      
      act(() => {
        result.current.save('test-id-1', 'data1');
        result.current.save('test-id-2', 'data2');
      });

      act(() => {
        result.current.clearAll();
      });

      expect(result.current.getAll()).toEqual({});
    });

    it('should perform batch operations', () => {
      const { result } = renderHook(() => useStore());
      
      act(() => {
        result.current.batch([
          { type: 'store/save', payload: { id: 'id1', data: 'data1' } },
          { type: 'store/save', payload: { id: 'id2', data: 'data2' } },
          { type: 'store/update', payload: { id: 'id1', data: { updated: true } } }
        ]);
      });

      expect(result.current.get('id1')).toEqual({ updated: true });
      expect(result.current.get('id2')).toBe('data2');
    });

    it('should provide store utility methods', () => {
      const { result } = renderHook(() => useStore());
      
      expect(result.current.isEmpty()).toBe(true);
      expect(result.current.size()).toBe(0);

      act(() => {
        result.current.save('test1', 'data1');
        result.current.save('test2', 'data2');
      });

      expect(result.current.isEmpty()).toBe(false);
      expect(result.current.size()).toBe(2);
      expect(result.current.has('test1')).toBe(true);
      expect(result.current.has('nonexistent')).toBe(false);
      expect(result.current.keys()).toEqual(['test1', 'test2']);
      expect(result.current.values()).toEqual(['data1', 'data2']);
      expect(result.current.entries()).toEqual([['test1', 'data1'], ['test2', 'data2']]);
    });

    it('should use selector with memoization', () => {
      const { result } = renderHook(() => useStore());
      
      act(() => {
        result.current.save('user', { name: 'John', age: 30 });
      });

      const userName = result.current.select((state: any) => state.user?.name);
      expect(userName).toBe('John');
    });
  });

  describe('useStoreSelector hook', () => {
    it('should select specific data and update only when selection changes', () => {
      const selector = (state: any) => state.user?.name;
      const { result } = renderHook(() => useStoreSelector(selector));
      
      expect(result.current).toBeUndefined();

      act(() => {
        storeMethods.save('user', { name: 'John', age: 30 });
      });

      expect(result.current).toBe('John');

      // Update age - should not trigger update since we're only selecting name
      act(() => {
        storeMethods.update('user', { age: 31 });
      });

      expect(result.current).toBe('John');

      // Update name - should trigger update
      act(() => {
        storeMethods.update('user', { name: 'Jane' });
      });

      expect(result.current).toBe('Jane');
    });

    it('should use custom equality function', () => {
      const selector = (state: any) => state.items || [];
      const equalityFn = (a: any[], b: any[]) => a.length === b.length;
      
      const { result } = renderHook(() => useStoreSelector(selector, equalityFn));
      
      act(() => {
        storeMethods.save('items', [1, 2, 3]);
      });

      const firstResult = result.current;

      // Replace with different array of same length - should not update due to custom equality
      act(() => {
        storeMethods.save('items', [4, 5, 6]);
      });

      expect(result.current).toBe(firstResult); // Same reference due to equality function

      // Change length - should update
      act(() => {
        storeMethods.save('items', [1, 2, 3, 4]);
      });

      expect(result.current).not.toBe(firstResult);
      expect(result.current).toEqual([1, 2, 3, 4]);
    });
  });

  describe('useStoreEvents hook', () => {
    it('should listen to store events', () => {
      const eventListener = jest.fn();
      
      renderHook(() => useStoreEvents(eventListener));

      act(() => {
        storeMethods.save('test', 'data');
      });

      expect(eventListener).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'save',
          payload: expect.objectContaining({
            id: 'test',
            data: 'data',
            timestamp: expect.any(Number),
          }),
        })
      );
    });

    it('should handle immediate option', () => {
      const eventListener = jest.fn();
      
      renderHook(() => useStoreEvents(eventListener, { immediate: true }));

      expect(eventListener).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'change',
          payload: expect.objectContaining({
            timestamp: expect.any(Number),
          }),
        })
      );
    });
  });

  describe('storeMethods', () => {
    it('should provide direct store access', () => {
      storeMethods.save('direct-test', { value: 123 });
      
      expect(storeMethods.get('direct-test')).toEqual({ value: 123 });
      expect(storeMethods.getAll()).toEqual({ 'direct-test': { value: 123 } });
      
      storeMethods.clear('direct-test');
      expect(storeMethods.get('direct-test')).toBeUndefined();
    });

    it('should maintain action history', () => {
      storeMethods.save('history-test', 'data1');
      storeMethods.update('history-test', 'data2');
      storeMethods.clear('history-test');

      const history = storeMethods.getHistory();
      expect(history).toHaveLength(3);
      expect(history[0].action.type).toBe('store/save');
      expect(history[1].action.type).toBe('store/update');
      expect(history[2].action.type).toBe('store/clear');
    });

    it('should handle middleware', () => {
      const middleware = jest.fn((action, state, next) => {
        next(action);
      });

      storeMethods.addMiddleware(middleware);
      storeMethods.save('middleware-test', 'data');

      expect(middleware).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'store/save' }),
        expect.any(Object),
        expect.any(Function)
      );

      storeMethods.removeMiddleware(middleware);
    });
  });

  describe('persistence', () => {
    // Skip persistence tests in Node environment since they require browser APIs
    it('should handle localStorage unavailability gracefully', () => {
      const { result } = renderHook(() => useStore());
      
      act(() => {
        result.current.save('persist-test', 'data');
      });

      // In Node environment, localStorage operations should return false
      const saveSuccess = result.current.saveToStorage('test-key');
      expect(saveSuccess).toBe(false);

      const loadSuccess = result.current.loadFromStorage('test-key');
      expect(loadSuccess).toBe(false);
    });
  });

  describe('error handling', () => {
    it('should handle invalid actions gracefully', () => {
      const { result } = renderHook(() => useStore());
      
      // This should not crash the store
      act(() => {
        result.current.batch([
          { type: 'invalid-action' as any, payload: { id: 'test' } }
        ]);
      });

      // Store should still be functional
      act(() => {
        result.current.save('after-error', 'data');
      });

      expect(result.current.get('after-error')).toBe('data');
    });

    it('should handle listener errors gracefully', () => {
      const errorListener = jest.fn(() => {
        throw new Error('Listener error');
      });
      
      renderHook(() => useStoreEvents(errorListener));

      // This should not crash the store
      act(() => {
        storeMethods.save('error-test', 'data');
      });

      expect(storeMethods.get('error-test')).toBe('data');
    });
  });
});
