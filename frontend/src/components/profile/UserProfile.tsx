import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const UserProfile = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState(user?.displayUsername || '');
  const [avatar, setAvatar] = useState<File | null>(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement profile update logic
    try {
      const formData = new FormData();
      formData.append('username', username);
      if (avatar) {
        formData.append('avatar', avatar);
      }

      // TODO: Make API call to update profile
      setIsEditing(false);
    } catch (err) {
      setError('Failed to update profile');
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAvatar(e.target.files[0]);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center space-x-6 mb-4">
          <div className="relative">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt="Profile"
                className="h-24 w-24 rounded-full object-cover"
              />
            ) : (
              <div className="h-24 w-24 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-4xl">
                {user?.displayUsername?.charAt(0).toUpperCase()}
              </div>
            )}
            {isEditing && (
              <label className="absolute bottom-0 right-0 bg-primary-600 rounded-full p-2 cursor-pointer">
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleAvatarChange}
                />
                <svg
                  className="h-4 w-4 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
              </label>
            )}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {isEditing ? (
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="border rounded px-2 py-1"
                />
              ) : (
                user?.displayUsername
              )}
            </h2>
            <p className="text-gray-600">{user?.email}</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded">
            {error}
          </div>
        )}

        {isEditing ? (
          <div className="flex space-x-4">
            <button
              onClick={handleSubmit}
              className="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700"
            >
              Сохранить
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
            >
              Отмена
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700"
          >
            Редактировать профиль
          </button>
        )}
      </div>
    </div>
  );
};

export default UserProfile; 