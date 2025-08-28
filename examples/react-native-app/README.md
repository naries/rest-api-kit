# React Native Mobile App Integration Example

A complete example showing how to integrate Rest API Kit into a React Native mobile application.

## 📱 Quick Start

### 1. Install Dependencies

```bash
# Core dependencies
npm install rest-api-kit react react-native

# For async storage (recommended for token storage)
npm install @react-native-async-storage/async-storage

# For navigation (optional)
npm install @react-navigation/native @react-navigation/stack
```

### 2. Create API Configuration

```typescript
// src/api/base.ts
import { createRestBase } from 'rest-api-kit';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const api = createRestBase({
  baseUrl: 'https://jsonplaceholder.typicode.com',
  prepareHeaders: async (headers) => {
    try {
      // Get authentication token from AsyncStorage
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      
      // Set default headers
      headers.set('Content-Type', 'application/json');
      headers.set('Accept', 'application/json');
      
      return headers;
    } catch (error) {
      console.warn('Failed to prepare headers:', error);
      return headers;
    }
  },
});
```

### 3. Define Mobile-Optimized Endpoints

```typescript
// src/api/endpoints.ts
import { api } from './base';

// Type definitions
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

interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  website: string;
}

// Create endpoints optimized for mobile
export const {
  useGetTodos,
  useCreateTodo,
  useUpdateTodo,
  useDeleteTodo,
  useGetUser,
  useGetUserPosts,
} = api.createEndpoints((builder) => ({
  
  // GET todos with mobile-optimized caching
  getTodos: builder<Todo[], void>({
    url: '/todos',
    params: {
      method: 'GET',
      preferCacheValue: true,  // Use cache for offline support
      saveToCache: true,
      timeout: 30000,          // 30 second timeout for mobile
    },
  }),

  // POST create todo
  createTodo: builder<Todo, CreateTodoRequest>({
    url: '/todos',
    params: {
      method: 'POST',
      preferCacheValue: false,
      saveToCache: false,
      updates: ['getTodos'],
      timeout: 15000,
      transformResponse: (data, requestBody) => ({
        ...data,
        locallyCreated: true,
        createdAt: new Date().toISOString(),
      }),
    },
  }),

  // PUT update todo with optimistic updates
  updateTodo: builder<Todo, { id: number; title?: string; completed?: boolean }>({
    url: '/todos',
    params: {
      method: 'PUT',
      updates: ['getTodos'],
      buildUrl: (baseUrl, body) => `${baseUrl}/${body.id}`,
      timeout: 15000,
    },
  }),

  // DELETE todo
  deleteTodo: builder<{ success: boolean }, { id: number }>({
    url: '/todos',
    params: {
      method: 'DELETE',
      updates: ['getTodos'],
      buildUrl: (baseUrl, body) => `${baseUrl}/${body.id}`,
      timeout: 15000,
    },
  }),

  // GET user profile
  getUser: builder<User, { userId: number }>({
    url: '/users',
    params: {
      method: 'GET',
      preferCacheValue: true,
      saveToCache: true,
      buildUrl: (baseUrl, body) => `${baseUrl}/${body.userId}`,
      timeout: 20000,
    },
  }),

  // GET user posts
  getUserPosts: builder<any[], { userId: number }>({
    url: '/posts',
    params: {
      method: 'GET',
      preferCacheValue: true,
      saveToCache: true,
      buildUrl: (baseUrl, body) => `${baseUrl}?userId=${body.userId}`,
    },
  }),
}));
```

### 4. Create Mobile Components

```typescript
// src/components/TodoList.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  StyleSheet,
  SafeAreaView,
  RefreshControl,
} from 'react-native';
import { useGetTodos, useCreateTodo, useUpdateTodo, useDeleteTodo } from '../api/endpoints';

interface Todo {
  id: number;
  title: string;
  completed: boolean;
  userId: number;
}

const TodoList: React.FC = () => {
  const [getTodos, { data: todos, loading, error }] = useGetTodos();
  const [createTodo, createState] = useCreateTodo();
  const [updateTodo, updateState] = useUpdateTodo();
  const [deleteTodo, deleteState] = useDeleteTodo();
  
  const [newTodoTitle, setNewTodoTitle] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Load todos on component mount
  useEffect(() => {
    loadTodos();
  }, []);

  const loadTodos = async () => {
    try {
      await getTodos();
    } catch (error) {
      Alert.alert('Error', 'Failed to load todos. Please try again.');
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadTodos();
    setRefreshing(false);
  };

  const handleCreateTodo = async () => {
    if (!newTodoTitle.trim()) {
      Alert.alert('Error', 'Please enter a todo title');
      return;
    }
    
    try {
      const result = await createTodo({
        title: newTodoTitle,
        completed: false,
        userId: 1,
      });
      
      if (result.type === 'success') {
        setNewTodoTitle('');
        await getTodos(); // Refresh list
        Alert.alert('Success', 'Todo created successfully!');
      } else {
        Alert.alert('Error', 'Failed to create todo');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to create todo. Please try again.');
    }
  };

  const handleToggleTodo = async (todo: Todo) => {
    try {
      const result = await updateTodo({
        id: todo.id,
        completed: !todo.completed,
      });
      
      if (result.type === 'success') {
        await getTodos(); // Refresh list
      } else {
        Alert.alert('Error', 'Failed to update todo');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update todo. Please try again.');
    }
  };

  const handleDeleteTodo = (todo: Todo) => {
    Alert.alert(
      'Delete Todo',
      `Are you sure you want to delete "${todo.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await deleteTodo({ id: todo.id });
              
              if (result.type === 'success') {
                await getTodos(); // Refresh list
                Alert.alert('Success', 'Todo deleted successfully!');
              } else {
                Alert.alert('Error', 'Failed to delete todo');
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to delete todo. Please try again.');
            }
          },
        },
      ]
    );
  };

  const renderTodoItem = ({ item }: { item: Todo }) => (
    <View style={styles.todoItem}>
      <TouchableOpacity
        style={styles.todoContent}
        onPress={() => handleToggleTodo(item)}
        disabled={updateState.loading}
      >
        <View style={[
          styles.checkbox,
          item.completed && styles.checkboxCompleted
        ]}>
          {item.completed && <Text style={styles.checkmark}>✓</Text>}
        </View>
        
        <Text style={[
          styles.todoTitle,
          item.completed && styles.todoTitleCompleted
        ]}>
          {item.title}
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDeleteTodo(item)}
        disabled={deleteState.loading}
      >
        <Text style={styles.deleteButtonText}>🗑️</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading && !todos) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading todos...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Todos</Text>
      </View>
      
      {/* Add new todo */}
      <View style={styles.addTodoContainer}>
        <TextInput
          style={styles.textInput}
          value={newTodoTitle}
          onChangeText={setNewTodoTitle}
          placeholder="Enter new todo..."
          returnKeyType="done"
          onSubmitEditing={handleCreateTodo}
        />
        <TouchableOpacity
          style={[
            styles.addButton,
            (!newTodoTitle.trim() || createState.loading) && styles.addButtonDisabled
          ]}
          onPress={handleCreateTodo}
          disabled={!newTodoTitle.trim() || createState.loading}
        >
          <Text style={styles.addButtonText}>
            {createState.loading ? '...' : 'Add'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Error state */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error: {error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadTodos}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Todo list */}
      <FlatList
        data={todos || []}
        renderItem={renderTodoItem}
        keyExtractor={(item) => item.id.toString()}
        style={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#007AFF']}
          />
        }
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                No todos yet. Add one above to get started!
              </Text>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#007AFF',
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  addTodoContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: 'white',
    marginBottom: 8,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    marginRight: 8,
  },
  addButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    justifyContent: 'center',
  },
  addButtonDisabled: {
    backgroundColor: '#ccc',
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 16,
    margin: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#f44336',
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 14,
    marginBottom: 8,
  },
  retryButton: {
    backgroundColor: '#f44336',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  retryButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  list: {
    flex: 1,
  },
  todoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  todoContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#007AFF',
    borderRadius: 12,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxCompleted: {
    backgroundColor: '#007AFF',
  },
  checkmark: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  todoTitle: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  todoTitleCompleted: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  deleteButton: {
    padding: 8,
  },
  deleteButtonText: {
    fontSize: 18,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default TodoList;
```

### 5. Main App Component

```typescript
// App.tsx
import React from 'react';
import TodoList from './src/components/TodoList';

const App: React.FC = () => {
  return <TodoList />;
};

export default App;
```

### 6. Authentication Helper (Optional)

```typescript
// src/utils/auth.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

export const AuthStorage = {
  async setToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem('authToken', token);
    } catch (error) {
      console.error('Failed to save auth token:', error);
    }
  },

  async getToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem('authToken');
    } catch (error) {
      console.error('Failed to get auth token:', error);
      return null;
    }
  },

  async removeToken(): Promise<void> {
    try {
      await AsyncStorage.removeItem('authToken');
    } catch (error) {
      console.error('Failed to remove auth token:', error);
    }
  },

  async isAuthenticated(): Promise<boolean> {
    const token = await this.getToken();
    return !!token;
  },
};
```

## 📱 Mobile-Specific Features

### ✅ Offline Support
- Automatic caching for offline access
- Network state handling
- Background sync when connected

### ✅ Performance Optimization
- Optimized re-renders with FlatList
- Pull-to-refresh functionality
- Lazy loading for large datasets

### ✅ Native UI Patterns
- Native alerts and modals
- Touch interactions
- Platform-specific styling

### ✅ Error Handling
- Network error recovery
- User-friendly error messages
- Retry mechanisms

## 🚀 Running the Example

### Prerequisites
- React Native development environment set up
- iOS Simulator or Android Emulator running

### Steps
1. **Clone and Setup**
   ```bash
   git clone [your-repo]
   cd rest-api-kit/examples/react-native-app
   npm install
   ```

2. **iOS**
   ```bash
   cd ios && pod install && cd ..
   npx react-native run-ios
   ```

3. **Android**
   ```bash
   npx react-native run-android
   ```

## 🎯 Key Mobile Considerations

### Network Handling
```typescript
// Check network connectivity
import NetInfo from '@react-native-community/netinfo';

const useNetworkStatus = () => {
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected ?? false);
    });

    return unsubscribe;
  }, []);

  return isConnected;
};
```

### Background App State
```typescript
import { AppState } from 'react-native';

const useAppStateSync = () => {
  const [getTodos] = useGetTodos();

  useEffect(() => {
    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === 'active') {
        // Refresh data when app becomes active
        getTodos();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, []);
};
```

### Secure Storage
```typescript
// For sensitive data, use react-native-keychain
import * as Keychain from 'react-native-keychain';

export const SecureStorage = {
  async setToken(token: string) {
    await Keychain.setInternetCredentials('auth', 'user', token);
  },

  async getToken() {
    try {
      const credentials = await Keychain.getInternetCredentials('auth');
      return credentials ? credentials.password : null;
    } catch {
      return null;
    }
  },
};
```

## 📚 Additional Mobile Resources

- [React Native Performance Guide](https://reactnative.dev/docs/performance)
- [Offline-First Architecture](https://redux-offline.github.io/redux-offline/)
- [Push Notifications Integration](https://rnfirebase.io/messaging/usage)
- [Background Tasks](https://github.com/jamesisaac/react-native-background-task)

## 🔄 Next Steps

1. **Add Navigation**
   - React Navigation integration
   - Deep linking support
   - Tab-based navigation

2. **Implement Push Notifications**
   - Real-time updates
   - Background notifications
   - Action buttons

3. **Add Offline Capabilities**
   - Queue failed requests
   - Background sync
   - Conflict resolution

4. **Performance Monitoring**
   - Flipper integration
   - Performance metrics
   - Crash reporting

Happy mobile development! 📱✨
