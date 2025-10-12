/**
 * User Profile Component
 * 
 * Demonstrates usage of user management hooks from the organized API structure.
 * Uses the useGetUserProfile and useUpdateUser hooks from api/users.ts
 */

import React, { useEffect, useState } from 'react';
import { useGetUserProfile, useUpdateUser } from '../api/users';

export const UserProfile: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');

  // Get profile data
  const [getUserProfile, profileState] = useGetUserProfile();
  
  // Update profile
  const [updateUser, updateState] = useUpdateUser();

  // Load user profile on mount
  useEffect(() => {
    getUserProfile();
  }, [getUserProfile]);

  // Populate form when profile data is loaded
  useEffect(() => {
    if (profileState.data) {
      setName(profileState.data.name);
      setBio(profileState.data.bio || '');
    }
  }, [profileState.data]);

  // Handle successful update
  useEffect(() => {
    if (updateState.isSuccess) {
      setIsEditing(false);
      // Refresh profile data
      getUserProfile();
    }
  }, [updateState.isSuccess, getUserProfile]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Trigger the update
    updateUser({
      userId: profileState.data?.id.toString() || '1',
      name,
      bio,
    });
  };

  const handleCancel = () => {
    // Reset form to original values
    if (profileState.data) {
      setName(profileState.data.name);
      setBio(profileState.data.bio || '');
    }
    setIsEditing(false);
  };

  // Loading state
  if (profileState.isLoading) {
    return (
      <div className="user-profile loading">
        <div className="spinner">🔄</div>
        <p>Loading profile...</p>
      </div>
    );
  }

  // Error state
  if (profileState.error) {
    return (
      <div className="user-profile error">
        <h2>Error Loading Profile</h2>
        <p>{String(profileState.error)}</p>
        <button onClick={() => getUserProfile()}>
          Retry
        </button>
      </div>
    );
  }

  // Main UI
  return (
    <div className="user-profile">
      <h2>User Profile</h2>

      {!isEditing ? (
        // Display mode
        <div className="profile-display">
          <div className="profile-field">
            <label>Name:</label>
            <span>{profileState.data?.name}</span>
          </div>

          <div className="profile-field">
            <label>Email:</label>
            <span>{profileState.data?.email}</span>
          </div>

          <div className="profile-field">
            <label>Username:</label>
            <span>{profileState.data?.username}</span>
          </div>

          <div className="profile-field">
            <label>Bio:</label>
            <p>{profileState.data?.bio || 'No bio yet'}</p>
          </div>

          <button onClick={() => setIsEditing(true)}>
            Edit Profile
          </button>
        </div>
      ) : (
        // Edit mode
        <form onSubmit={handleSubmit} className="profile-edit">
          <div className="form-group">
            <label htmlFor="name">Name:</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={updateState.isLoading}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="bio">Bio:</label>
            <textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              disabled={updateState.isLoading}
              rows={4}
            />
          </div>

          <div className="button-group">
            <button 
              type="submit" 
              disabled={updateState.isLoading}
            >
              {updateState.isLoading ? 'Saving...' : 'Save Changes'}
            </button>
            
            <button 
              type="button" 
              onClick={handleCancel}
              disabled={updateState.isLoading}
            >
              Cancel
            </button>
          </div>

          {/* Update status messages */}
          {updateState.isSuccess && (
            <div className="success-message">
              ✅ Profile updated successfully!
            </div>
          )}

          {updateState.error && (
            <div className="error-message">
              ❌ Failed to update profile: {String(updateState.error)}
            </div>
          )}
        </form>
      )}
    </div>
  );
};

export default UserProfile;
