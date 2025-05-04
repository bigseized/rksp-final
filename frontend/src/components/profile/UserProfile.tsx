import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { API_CONFIG } from '../../config';

const API_URL = API_CONFIG.CHAT_API_URL;

const UserProfile = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState(user?.displayUsername || '');
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAvatar = async () => {
      if (user?.id) {
        try {
          const token = localStorage.getItem('token');
          const response = await axios.get(`${API_URL}/users/${user.id}/avatar`, {
            headers: {
              'Authorization': `Bearer ${token}`
            },
            responseType: 'blob'
          });
          
          if (response.data) {
            const objectUrl = URL.createObjectURL(response.data);
            setAvatarUrl(objectUrl);
          }
        } catch (err) {
          console.error('Failed to fetch avatar:', err);
        }
      }
    };

    fetchAvatar();
  }, [user?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      if (username !== user?.displayUsername) {
        await axios.put(`${API_URL}/users/${user?.id}/username`, null, {
          params: { username },
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      }

      if (avatar) {
        const formData = new FormData();
        formData.append('file', avatar);
        await axios.post(`${API_URL}/users/${user?.id}/avatar`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          }
        });
        // После загрузки нового аватара обновляем изображение
        const response = await axios.get(`${API_URL}/users/${user?.id}/avatar`, {
          headers: {
            'Authorization': `Bearer ${token}`
          },
          responseType: 'blob'
        });
        const objectUrl = URL.createObjectURL(response.data);
        setAvatarUrl(objectUrl);
      }

      setIsEditing(false);
      // TODO: Обновить данные пользователя в контексте
    } catch (err) {
      setError('Не удалось обновить профиль');
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAvatar(e.target.files[0]);
    }
  };

  const handleDeleteAvatar = async () => {
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`${API_URL}/users/${user?.id}/avatar`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setAvatarUrl(null);
      // TODO: Обновить данные пользователя в контексте
    } catch (err) {
      setError('Не удалось удалить аватар');
    }
  };

  // Очищаем URL при размонтировании компонента
  useEffect(() => {
    return () => {
      if (avatarUrl) {
        URL.revokeObjectURL(avatarUrl);
      }
    };
  }, [avatarUrl]);

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center space-x-6 mb-4">
          <div className="relative">
            {avatarUrl ? (
              <img
                src={avatarUrl}
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
            {isEditing && avatarUrl && (
              <button
                onClick={handleDeleteAvatar}
                className="absolute bottom-0 left-0 bg-red-600 rounded-full p-2 cursor-pointer"
              >
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
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
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