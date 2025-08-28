import { createRestBase } from '../base';

describe('createRestBase direct hook access', () => {
  it('should allow direct access to hooks on the API object', () => {
    const api = createRestBase({
      baseUrl: 'https://api.example.com',
      prepareHeaders: (headers) => {
        headers.set('Authorization', 'Bearer token');
        return headers;
      },
    }).createEndpoints((builder) => ({
      getUser: builder<
        { id: number; name: string },
        void
      >({
        url: '/user',
        params: {
          method: 'GET',
          preferCacheValue: true,
          saveToCache: true,
        },
      }),
      createPost: builder<
        { id: number; title: string },
        { title: string; content: string }
      >({
        url: '/posts',
        params: {
          method: 'POST',
          preferCacheValue: false,
          saveToCache: false,
          updates: ['getUser'],
        },
      }),
    }));

    // Verify hooks are directly accessible
    expect(typeof api.useGetUser).toBe('function');
    expect(typeof api.useCreatePost).toBe('function');
    
    // Verify endpoints are still accessible
    expect(api.endpoints).toBeDefined();
    expect(typeof api.createEndpoints).toBe('function');
  });

  it('should initialize endpoints only once per app lifecycle', () => {
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
    
    const baseApi = createRestBase({
      baseUrl: 'https://api.example.com',
    });

    // First call should initialize
    const api1 = baseApi.createEndpoints((builder) => ({
      endpoint1: builder({ url: '/test1', params: { method: 'GET' } }),
    }));

    // Second call should warn and reuse existing endpoints
    const api2 = baseApi.createEndpoints((builder) => ({
      endpoint2: builder({ url: '/test2', params: { method: 'GET' } }),
    }));

    expect(consoleSpy).toHaveBeenCalledWith(
      'rest-api-kit: createEndpoints called multiple times. ' +
      'Endpoints should be created once at app initialization. ' +
      'Using previously initialized endpoints.'
    );

    // Both should have the same hooks from the first initialization
    expect(typeof api1.useEndpoint1).toBe('function');
    expect(typeof (api2 as any).useEndpoint1).toBe('function');
    
    // The second endpoint should NOT be available since it wasn't in the first call
    expect((api1 as any).useEndpoint2).toBeUndefined();
    expect((api2 as any).useEndpoint2).toBeUndefined();

    consoleSpy.mockRestore();
  });

  it('should handle edge cases like empty endpoint names', () => {
    const api = createRestBase({}).createEndpoints((builder) => ({}));
    
    // Should not break with empty endpoints
    expect(api.endpoints).toBeDefined();
    expect(typeof api.createEndpoints).toBe('function');
  });

  it('should handle special characters in endpoint names', () => {
    const api = createRestBase({}).createEndpoints((builder) => ({
      'get-user-profile': builder({
        url: '/user-profile',
        params: { method: 'GET' },
      }),
      'create_post': builder({
        url: '/posts',
        params: { method: 'POST' },
      }),
    }));

    // Should create camelCase hook names from kebab-case and snake_case
    expect(typeof api['useGet-user-profile']).toBe('function');
    expect(typeof api['useCreate_post']).toBe('function');
  });

  it('should memoize hook configurations to prevent recreation', () => {
    const api = createRestBase({
      baseUrl: 'https://api.example.com',
    }).createEndpoints((builder) => ({
      testEndpoint: builder({
        url: '/test',
        params: { method: 'GET' },
      }),
    }));

    // Get the hook function multiple times
    const hook1 = api.useTestEndpoint;
    const hook2 = api.useTestEndpoint;

    // Should be the same function reference (memoized)
    expect(hook1).toBe(hook2);
  });
});
