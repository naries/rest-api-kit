# Type Safety Guide

## ✅ Full TypeScript Support Implemented

The REST API Kit now provides **complete type safety** for both request and response data. Here's how it works:

## Generic Type Parameters

When defining endpoints, you specify two type parameters:

```typescript
builder<ResponseType, RequestBodyType>({
  url: '/endpoint',
  params: { ... }
})
```

### 1. **Response Type** (First Parameter)
- **Purpose**: Types the `data` property in hook state
- **Usage**: When you destructure `{ data }` from hook state, it's typed with this type
- **Examples**:
  - `Todo` for single objects
  - `Todo[]` for arrays
  - `void` for endpoints that don't return data (like DELETE)

### 2. **Request Body Type** (Second Parameter)  
- **Purpose**: Types the parameter passed to trigger function
- **Usage**: When you call `trigger(body)`, TypeScript enforces this type
- **Examples**:
  - `{ title: string; completed?: boolean }` for POST bodies
  - `{ id: number }` for path parameters
  - `void` for endpoints that don't need request data

## Real-World Examples

### GET Endpoint (No Request Body)
```typescript
// Response: Todo[], Request: void (no body needed)
getTodos: builder<Todo[], void>({
  url: '/todos',
  params: { method: 'GET' }
})

// Usage in component:
const [fetchTodos, { data }] = api.useGetTodos();
//                    ^^^^ typed as Todo[] | undefined
fetchTodos(); // ✅ No parameters needed
```

### GET with Parameters
```typescript
// Response: Todo, Request: { id: number }
getTodo: builder<Todo, { id: number }>({
  url: '/todos/:id',
  params: { 
    method: 'GET',
    bodyAsParams: true // Converts body to URL params
  }
})

// Usage:
const [fetchTodo, { data }] = api.useGetTodo();
//                    ^^^^ typed as Todo | undefined
fetchTodo({ id: 123 }); // ✅ TypeScript enforces { id: number }
```

### POST Endpoint
```typescript
interface CreateTodoRequest {
  title: string;
  completed?: boolean;
  userId: number;
}

// Response: Todo, Request: CreateTodoRequest
createTodo: builder<Todo, CreateTodoRequest>({
  url: '/todos',
  params: { method: 'POST' }
})

// Usage:
const [createTodo, { data }] = api.useCreateTodo();
//                      ^^^^ typed as Todo | undefined
createTodo({
  title: 'New Todo',
  userId: 1
}); // ✅ TypeScript enforces CreateTodoRequest shape
```

### DELETE Endpoint (No Response Data)
```typescript
// Response: void (no data returned), Request: { id: number }
deleteTodo: builder<void, { id: number }>({
  url: '/todos/:id',
  params: { 
    method: 'DELETE',
    bodyAsParams: true
  }
})

// Usage:
const [deleteTodo, { data }] = api.useDeleteTodo();
//                      ^^^^ typed as void | undefined
deleteTodo({ id: 123 }); // ✅ TypeScript enforces { id: number }
```

## Type Safety Benefits

### ✅ IntelliSense & Autocomplete
```typescript
const [fetchTodos, { data: todos }] = api.useGetTodos();

if (todos) {
  todos.map(todo => {
    // ✅ TypeScript knows todo has: id, title, completed, userId
    console.log(todo.title); // Autocomplete works!
    console.log(todo.id);    // All properties available
  });
}
```

### ✅ Compile-Time Error Prevention
```typescript
const [createTodo] = api.useCreateTodo();

// ❌ TypeScript Error: Missing required fields
createTodo({ title: 'Test' }); // Error: userId is required

// ❌ TypeScript Error: Wrong field name  
createTodo({ 
  title: 'Test',
  userId: 1,
  isCompleted: false // Error: should be 'completed'
});

// ✅ Correct usage
createTodo({
  title: 'Test',
  userId: 1,
  completed: false
});
```

### ✅ Response Transformation Typing
```typescript
getTodos: builder<Todo[], void>({
  url: '/todos',
  params: {
    transformResponse: (data: Todo[]) => {
      // ✅ data parameter is typed as Todo[]
      return data.slice(0, 10); // Return type must match Todo[]
    }
  }
})
```

## Migration from Untyped

If you have existing endpoints without types, you can gradually add them:

```typescript
// Before (untyped)
getTodos: builder({
  url: '/todos',
  params: { method: 'GET' }
})

// After (typed)
getTodos: builder<Todo[], void>({
  url: '/todos', 
  params: { method: 'GET' }
})
```

## Best Practices

1. **Define Interfaces**: Create clear interfaces for your data types
2. **Use `void`**: For endpoints that don't need request/response data
3. **Be Specific**: Use exact types rather than `any` or `unknown`
4. **Gradual Adoption**: Add types incrementally to existing projects
5. **Share Types**: Export interfaces for reuse across components

## Type Flow Summary

```
Builder Generic Types
       ↓
useRest Hook Types  
       ↓
Hook Return Types
       ↓
Component Usage
```

The type system ensures end-to-end type safety from endpoint definition to component usage, preventing runtime errors and improving developer experience with full IntelliSense support.
