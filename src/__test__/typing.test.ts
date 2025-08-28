import { createRestBase } from '../base';

describe('Type Safety Tests', () => {
  it('should properly type response data in hook state', () => {
    interface Todo {
      id: number;
      title: string;
      completed: boolean;
      userId: number;
    }

    interface CreateTodoRequest {
      title: string;
      completed?: boolean;
      userId: number;
    }

    const api = createRestBase({
      baseUrl: 'https://api.example.com',
    }).createEndpoints((builder) => ({
      getTodos: builder<Todo[], void>({
        url: '/todos',
        params: {
          method: 'GET',
          preferCacheValue: true,
          saveToCache: true,
        },
      }),
      
      createTodo: builder<Todo, CreateTodoRequest>({
        url: '/todos',
        params: {
          method: 'POST',
          preferCacheValue: false,
          saveToCache: false,
        },
      }),
    }));

    // Mock the hooks to test typing
    const mockGetTodos = api.useGetTodos as jest.MockedFunction<typeof api.useGetTodos>;
    const mockCreateTodo = api.useCreateTodo as jest.MockedFunction<typeof api.useCreateTodo>;

    // Test that we can call the hooks
    expect(typeof api.useGetTodos).toBe('function');
    expect(typeof api.useCreateTodo).toBe('function');

    // This test mainly validates that TypeScript compilation passes
    // with proper generic typing in the hook return types
  });

  it('should handle void request types correctly', () => {
    interface UserProfile {
      id: number;
      name: string;
      email: string;
    }

    const api = createRestBase({}).createEndpoints((builder) => ({
      getProfile: builder<UserProfile, void>({
        url: '/profile',
        params: { method: 'GET' },
      }),
    }));

    expect(typeof api.useGetProfile).toBe('function');
  });
});
