/**
 * Todo List Component
 * 
 * Demonstrates usage of todo management hooks from the organized API structure.
 * Uses multiple hooks from api/todos.ts:
 * - useGetTodos: Fetch all todos
 * - useCreateTodo: Create new todo
 * - useToggleTodo: Toggle completion status
 * - useDeleteTodo: Delete a todo
 */

import React, { useEffect, useState } from 'react';
import { useGetTodos, useCreateTodo, useToggleTodo, useDeleteTodo } from '../api/todos';
import type { Todo } from '../api/todos';

export const TodoList: React.FC = () => {
  const [newTodoTitle, setNewTodoTitle] = useState('');

  // Get all hooks we need
  const [getTodos, todosState] = useGetTodos();
  const [createTodo, createState] = useCreateTodo();
  const [toggleTodo, toggleState] = useToggleTodo();
  const [deleteTodo, deleteState] = useDeleteTodo();

  // Load todos on component mount
  useEffect(() => {
    getTodos();
  }, [getTodos]);

  // Refresh todos after create, toggle, or delete
  useEffect(() => {
    if (createState.isSuccess || toggleState.isSuccess || deleteState.isSuccess) {
      getTodos();
    }
  }, [createState.isSuccess, toggleState.isSuccess, deleteState.isSuccess, getTodos]);

  // Handle create todo
  const handleCreateTodo = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newTodoTitle.trim()) {
      alert('Please enter a todo title');
      return;
    }

    createTodo({
      title: newTodoTitle,
      completed: false,
      userId: 1, // In a real app, get this from auth context
    });

    // Clear input
    setNewTodoTitle('');
  };

  // Handle toggle todo completion
  const handleToggleTodo = (todo: Todo) => {
    toggleTodo({
      id: todo.id,
      completed: !todo.completed,
    });
  };

  // Handle delete todo
  const handleDeleteTodo = (todoId: number) => {
    if (confirm('Are you sure you want to delete this todo?')) {
      deleteTodo({ id: todoId });
    }
  };

  // Loading state
  if (todosState.isLoading && !todosState.data) {
    return (
      <div className="todo-list loading">
        <div className="spinner">🔄</div>
        <p>Loading todos...</p>
      </div>
    );
  }

  // Error state
  if (todosState.error) {
    return (
      <div className="todo-list error">
        <h2>Error Loading Todos</h2>
        <p>{String(todosState.error)}</p>
        <button onClick={() => getTodos()}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="todo-list">
      <h2>My Todos</h2>

      {/* Create new todo form */}
      <form onSubmit={handleCreateTodo} className="create-todo-form">
        <input
          type="text"
          value={newTodoTitle}
          onChange={(e) => setNewTodoTitle(e.target.value)}
          placeholder="What needs to be done?"
          disabled={createState.isLoading}
        />
        <button 
          type="submit"
          disabled={createState.isLoading}
        >
          {createState.isLoading ? 'Adding...' : 'Add Todo'}
        </button>
      </form>

      {/* Status messages */}
      {createState.isSuccess && (
        <div className="success-message">
          ✅ Todo created successfully!
        </div>
      )}

      {createState.error && (
        <div className="error-message">
          ❌ Failed to create todo: {String(createState.error)}
        </div>
      )}

      {deleteState.isSuccess && (
        <div className="success-message">
          ✅ Todo deleted successfully!
        </div>
      )}

      {deleteState.error && (
        <div className="error-message">
          ❌ Failed to delete todo: {String(deleteState.error)}
        </div>
      )}

      {/* Todo list */}
      <div className="todos">
        {todosState.data && todosState.data.length === 0 ? (
          <p className="empty-state">No todos yet. Create one above! 🎉</p>
        ) : (
          <ul className="todo-items">
            {todosState.data?.map((todo) => (
              <li key={todo.id} className={todo.completed ? 'completed' : ''}>
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => handleToggleTodo(todo)}
                  disabled={toggleState.isLoading}
                />
                
                <span 
                  className="todo-title"
                  style={{ 
                    textDecoration: todo.completed ? 'line-through' : 'none',
                    opacity: todo.completed ? 0.6 : 1,
                  }}
                >
                  {todo.title}
                </span>

                <button
                  onClick={() => handleDeleteTodo(todo.id)}
                  disabled={deleteState.isLoading}
                  className="delete-button"
                >
                  🗑️ Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Loading overlay when refreshing */}
      {todosState.isLoading && todosState.data && (
        <div className="loading-overlay">
          Refreshing todos...
        </div>
      )}

      {/* Statistics */}
      {todosState.data && (
        <div className="todo-stats">
          <p>
            Total: {todosState.data.length} |
            Completed: {todosState.data.filter(t => t.completed).length} |
            Remaining: {todosState.data.filter(t => !t.completed).length}
          </p>
        </div>
      )}
    </div>
  );
};

export default TodoList;
