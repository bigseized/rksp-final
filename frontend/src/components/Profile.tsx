import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const Profile: React.FC = () => {
    const { user, updateUser } = useAuth();
    const [isEditingUsername, setIsEditingUsername] = useState(false);
    const [newUsername, setNewUsername] = useState('');

    const getAuthorityColor = (authority: string) => {
        switch (authority) {
            case 'ADMIN':
                return 'bg-red-500';
            case 'MODERATOR':
                return 'bg-yellow-500';
            default:
                return 'bg-gray-500';
        }
    };

    const handleUsernameUpdate = async () => {
        if (!user) return;
        try {
            console.log('Updating username for user ID:', user.id);
            const token = localStorage.getItem('token');
            const response = await axios.put(
                `/api/users/${user.id}/username?username=${newUsername}`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            console.log('Username update response:', response);
            const userResponse = await axios.get('/api/users/me', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            console.log('User data after update:', userResponse.data);
            updateUser(userResponse.data);
            setIsEditingUsername(false);
        } catch (error) {
            console.error('Failed to update username:', error);
        }
    };

    const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!user) return;
        const file = event.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            console.log('Uploading avatar for user ID:', user.id);
            const token = localStorage.getItem('token');
            const response = await axios.post(
                `/api/users/${user.id}/avatar`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data',
                    }
                }
            );
            console.log('Avatar upload response:', response);
            const userResponse = await axios.get('/api/users/me', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            console.log('User data after avatar upload:', userResponse.data);
            updateUser(userResponse.data);
        } catch (error) {
            console.error('Failed to upload avatar:', error);
        }
    };

    const handleAvatarDelete = async () => {
        if (!user) return;
        try {
            console.log('Deleting avatar for user ID:', user.id);
            const token = localStorage.getItem('token');
            const response = await axios.delete(
                `/api/users/${user.id}/avatar`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            console.log('Avatar delete response:', response);
            const userResponse = await axios.get('/api/users/me', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            console.log('User data after avatar delete:', userResponse.data);
            updateUser(userResponse.data);
        } catch (error) {
            console.error('Failed to delete avatar:', error);
        }
    };

    if (!user) {
        return (
            <div className="flex items-center justify-center h-full">
                <p className="text-red-500">Ошибка авторизации</p>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto p-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center space-x-4 mb-6">
                    <div className="relative">
                        {user.avatar ? (
                            <img 
                                src={user.avatar} 
                                alt="Avatar" 
                                className="w-20 h-20 rounded-full object-cover"
                            />
                        ) : (
                            <div className="w-20 h-20 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-3xl">
                                {user.displayUsername.charAt(0).toUpperCase()}
                            </div>
                        )}
                        <div className="absolute bottom-0 right-0 flex space-x-2">
                            <label className="bg-blue-500 text-white p-1 rounded-full cursor-pointer hover:bg-blue-600">
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleAvatarUpload}
                                />
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                            </label>
                            {user.avatar && (
                                <button
                                    onClick={handleAvatarDelete}
                                    className="bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            )}
                        </div>
                    </div>
                    <div>
                        {isEditingUsername ? (
                            <div className="flex items-center space-x-2">
                                <input
                                    type="text"
                                    value={newUsername}
                                    onChange={(e) => setNewUsername(e.target.value)}
                                    className="border rounded px-2 py-1"
                                />
                                <button
                                    onClick={handleUsernameUpdate}
                                    className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
                                >
                                    Сохранить
                                </button>
                                <button
                                    onClick={() => setIsEditingUsername(false)}
                                    className="bg-gray-500 text-white px-2 py-1 rounded hover:bg-gray-600"
                                >
                                    Отмена
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-2">
                                <h1 className="text-2xl font-bold">{user.displayUsername}</h1>
                                <button
                                    onClick={() => {
                                        setNewUsername(user.displayUsername);
                                        setIsEditingUsername(true);
                                    }}
                                    className="text-blue-500 hover:text-blue-600"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                </button>
                            </div>
                        )}
                        <p className="text-gray-600">{user.email}</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="border-t pt-4">
                        <h2 className="text-lg font-semibold mb-2">Информация о пользователе</h2>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Email:</span>
                                <span className="font-medium">{user.email}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Username:</span>
                                <span className="font-medium">{user.displayUsername}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">Роли:</span>
                                <div className="flex space-x-2">
                                    {user.authorities.map((auth, index) => (
                                        <span 
                                            key={index}
                                            className={`px-3 py-1 rounded-full text-sm text-white ${getAuthorityColor(auth.authority)}`}
                                        >
                                            {auth.authority}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile; 