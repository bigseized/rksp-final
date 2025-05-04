import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { chatService } from '../services/chatService';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

interface User {
    id: number;
    username: string;
    displayUsername: string;
    authorities: { authority: string }[];
}

interface HeaderProps {
    onChatsUpdate: () => void;
}

const Header: React.FC<HeaderProps> = ({ onChatsUpdate }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<User[]>([]);
    const [showSearchResults, setShowSearchResults] = useState(false);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);
    const profileRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowSearchResults(false);
            }
            if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
                setShowProfileMenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            try {
                const results = await chatService.searchUsers(searchQuery);
                setSearchResults(results);
                setShowSearchResults(true);
            } catch (error) {
                console.error('Error searching users:', error);
            }
        }
    };

    const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchQuery(value);
        
        if (value.trim()) {
            try {
                const results = await chatService.searchUsers(value);
                setSearchResults(results);
                setShowSearchResults(true);
            } catch (error) {
                console.error('Error searching users:', error);
            }
        } else {
            setShowSearchResults(false);
        }
    };

    const handleCreatePrivateChat = async (userId: number, username: string) => {
        try {
            await chatService.createPersonalChat(userId, username);
            toast.success('Личный чат успешно создан!');
            onChatsUpdate();
        } catch (error: any) {
            if (error.response && error.response.status === 409) {
                toast.error('Личный чат с этим пользователем уже существует!');
            } else {
                toast.error('Ошибка при создании личного чата');
            }
            console.error('Error creating private chat:', error);
        }
    };

    const handleProfileClick = () => {
        setShowProfileMenu(!showProfileMenu);
    };

    const handleNavigateToProfile = () => {
        navigate('/profile');
        setShowProfileMenu(false);
    };

    const handleNavigateToChats = () => {
        navigate('/chats');
    };

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

    return (
        <header className="flex items-center justify-between px-6 py-3 bg-white shadow-md border-b">
            <div 
                className="flex items-center space-x-3 cursor-pointer"
                onClick={handleNavigateToChats}
            >
                <img src="/logo.png" alt="Soika Logo" className="h-10 w-10" />
                <span className="text-2xl font-bold text-gray-800">SOIKA</span>
            </div>

            <form onSubmit={handleSearch} className="flex-1 max-w-md mx-4">
                <div className="relative" ref={searchRef}>
                    <input
                        type="text"
                        placeholder="Найти пользователя"
                        value={searchQuery}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {showSearchResults && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white border rounded-lg shadow-lg z-50">
                            {searchResults.length > 0 ? (
                                searchResults.map((user) => (
                                    <div
                                        key={user.id}
                                        className="flex items-center justify-between p-3 hover:bg-gray-100"
                                    >
                                        <span>{user.username}</span>
                                        <button
                                            onClick={() => handleCreatePrivateChat(user.id, user.username)}
                                            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                                        >
                                            Написать
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <div className="p-3 text-gray-500">Пользователи не найдены</div>
                            )}
                        </div>
                    )}
                </div>
            </form>

            {user && (
                <div className="flex items-center space-x-4">
                    <div className="relative" ref={profileRef}>
                        <button
                            onClick={handleProfileClick}
                            className="flex items-center space-x-2 focus:outline-none"
                        >
                            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-xl">
                                {user.displayUsername.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-medium">{user.displayUsername}</span>
                            {user.authorities.map((auth, index) => (
                                <span 
                                    key={index}
                                    className={`px-2 py-1 rounded-full text-xs text-white ${getAuthorityColor(auth.authority)}`}
                                >
                                    {auth.authority}
                                </span>
                            ))}
                        </button>
                        
                        {showProfileMenu && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50">
                                <button
                                    onClick={handleNavigateToProfile}
                                    className="w-full px-4 py-2 text-left hover:bg-gray-100"
                                >
                                    Профиль
                                </button>
                                <button
                                    onClick={logout}
                                    className="w-full px-4 py-2 text-left text-red-500 hover:bg-gray-100"
                                >
                                    Выйти
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
};

export default Header; 