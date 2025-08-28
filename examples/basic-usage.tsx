import React, { useEffect } from 'react';
import { createRestBase } from 'rest-api-kit';

// Define your API types
interface User {
  id: number;
  name: string;
  email: string;
}

interface Post {
  id: number;
  title: string;
  content: string;
  userId: number;
}

// Create your API base
const api = createRestBase({
  baseUrl: 'https://jsonplaceholder.typicode.com',
  prepareHeaders: (headers) => {
    headers.set('Content-Type', 'application/json');
    return headers;
  },
});

// Define your endpoints with full type safety
const {
  useGetUser,
  useGetUserPosts,
} = api.createEndpoints((builder) => ({
  getUser: builder<User, { userId: number }>({
    url: '/users/{userId}',
    params: {
      method: 'GET',
      preferCacheValue: true,
      saveToCache: true,
    },
  }),
  getUserPosts: builder<Post[], { userId: number }>({
    url: '/users/{userId}/posts',
    params: {
      method: 'GET',
      preferCacheValue: true,
      saveToCache: true,
    },
  }),
}));

// Component using the API
const UserProfile: React.FC<{ userId: number }> = ({ userId }) => {
  // Get hooks from the API
  const [getUserTrigger, userState] = useGetUser();
  const [getUserPostsTrigger, postsState] = useGetUserPosts();

  // Fetch user data when component mounts or userId changes
  useEffect(() => {
    getUserTrigger({ userId });
  }, [userId, getUserTrigger]);

  // Fetch posts when user data is available
  useEffect(() => {
    if (userState.data) {
      getUserPostsTrigger({ userId });
    }
  }, [userState.data, userId, getUserPostsTrigger]);

  const handleRefreshUser = () => {
    getUserTrigger({ userId });
  };

  if (userState.isLoading) return <div>Loading user...</div>;
  if (userState.error) return <div>Error loading user</div>;
  if (!userState.data) return <div>User not found</div>;

  const user = userState.data;

  return (
    <div>
      <h1>{user.name}</h1>
      <p>Email: {user.email}</p>
      
      <button onClick={handleRefreshUser}>
        Refresh User Data
      </button>

      <h2>Posts</h2>
      {postsState.isLoading ? (
        <div>Loading posts...</div>
      ) : postsState.error ? (
        <div>Error loading posts</div>
      ) : (
        <ul>
          {postsState.data?.map(post => (
            <li key={post.id}>
              <h3>{post.title}</h3>
              <p>{post.content}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default UserProfile;
