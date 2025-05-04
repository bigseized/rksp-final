import React, { useEffect, useState } from 'react';
import { chatService } from '../../services/chatService';
import axios from 'axios';
import { API_CONFIG } from '../../config';

const API_URL = API_CONFIG.CHAT_API_URL;

interface Chat {
    id: number;
    name: string;
    description: string;
    personal: boolean;
    interlocutorId?: number;
}

interface ChatListProps {
    onSelectChat: (chatId: number) => void;
    chats: Chat[];
    loading: boolean;
    onChatsUpdate: () => void;
}

export const ChatList: React.FC<ChatListProps> = ({ onSelectChat, chats, loading, onChatsUpdate }) => {
    const [error, setError] = useState<string | null>(null);
    const [newChatName, setNewChatName] = useState('');
    const [newChatDescription, setNewChatDescription] = useState('');
    const [showNewChatForm, setShowNewChatForm] = useState(false);
    const [showGroupChats, setShowGroupChats] = useState(true);
    const [showPrivateChats, setShowPrivateChats] = useState(true);
    const [avatarUrls, setAvatarUrls] = useState<Record<number, string>>({});

    useEffect(() => {
        const fetchAvatars = async () => {
            const newAvatarUrls: Record<number, string> = {};
            const promises = chats
                .filter(chat => chat.personal && chat.interlocutorId)
                .map(async chat => {
                    try {
                        const token = localStorage.getItem('token');
                        const response = await axios.get(`${API_URL}/users/${chat.interlocutorId}/avatar`, {
                            headers: {
                                'Authorization': `Bearer ${token}`
                            },
                            responseType: 'blob'
                        });
                        
                        if (response.data) {
                            const objectUrl = URL.createObjectURL(response.data);
                            newAvatarUrls[chat.interlocutorId!] = objectUrl;
                        }
                    } catch (err) {
                        console.error(`Failed to fetch avatar for user ${chat.interlocutorId}:`, err);
                    }
                });

            await Promise.all(promises);
            
            // Очищаем старые URL перед установкой новых
            Object.values(avatarUrls).forEach(url => URL.revokeObjectURL(url));
            setAvatarUrls(newAvatarUrls);
        };

        fetchAvatars();

        return () => {
            // Очищаем URL при размонтировании компонента
            Object.values(avatarUrls).forEach(url => URL.revokeObjectURL(url));
        };
    }, [chats]);

    const handleCreateChat = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await chatService.createChat(newChatName, newChatDescription, false);
            setNewChatName('');
            setNewChatDescription('');
            setShowNewChatForm(false);
            onChatsUpdate();
        } catch (err) {
            setError('Failed to create chat');
            console.error(err);
        }
    };

    if (loading) return <div>Loading chats...</div>;
    if (error) return <div>Error: {error}</div>;

    const groupChats = chats.filter(chat => !chat.personal);
    const privateChats = chats.filter(chat => chat.personal);

    return (
        <div className="p-4">
            <button
                onClick={() => setShowNewChatForm(true)}
                className="mb-4 w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
            >
                Create New Chat
            </button>

            {showNewChatForm && (
                <form onSubmit={handleCreateChat} className="mb-4 p-4 border rounded">
                    <div className="mb-2">
                        <input
                            type="text"
                            placeholder="Chat Name"
                            value={newChatName}
                            onChange={(e) => setNewChatName(e.target.value)}
                            className="w-full p-2 border rounded"
                            required
                        />
                    </div>
                    <div className="mb-2">
                        <input
                            type="text"
                            placeholder="Description"
                            value={newChatDescription}
                            onChange={(e) => setNewChatDescription(e.target.value)}
                            className="w-full p-2 border rounded"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
                    >
                        Create
                    </button>
                </form>
            )}

            {/* Group Chats Section */}
            <div className="mb-4">
                <div 
                    className="flex items-center justify-between p-2 bg-gray-100 rounded"
                    onClick={() => setShowGroupChats(!showGroupChats)}
                >
                    <h2 className="font-bold">Групповые чаты</h2>
                    <span className={`transform transition-transform duration-200 select-none ${showGroupChats ? 'rotate-0' : '-rotate-90'}`}>▼</span>
                </div>
                {showGroupChats && groupChats.map(chat => (
                    <div
                        key={chat.id}
                        className="chat-item p-4 border-b cursor-pointer hover:bg-gray-100"
                        onClick={() => onSelectChat(chat.id)}
                    >
                        <h3 className="font-bold">{chat.name}</h3>
                        <p className="text-gray-600">{chat.description}</p>
                    </div>
                ))}
            </div>

            {/* Private Chats Section */}
            <div>
                <div 
                    className="flex items-center justify-between p-2 bg-gray-100 rounded"
                    onClick={() => setShowPrivateChats(!showPrivateChats)}
                >
                    <h2 className="font-bold">Личные переписки</h2>
                    <span className={`transform transition-transform duration-200 select-none ${showPrivateChats ? 'rotate-0' : '-rotate-90'}`}>▼</span>
                </div>
                {showPrivateChats && privateChats.map(chat => (
                    <div
                        key={chat.id}
                        className="chat-item p-4 border-b cursor-pointer hover:bg-gray-100 flex items-center space-x-3"
                        onClick={() => onSelectChat(chat.id)}
                    >
                        {chat.interlocutorId && avatarUrls[chat.interlocutorId] ? (
                            <img
                                src={avatarUrls[chat.interlocutorId]}
                                alt="Profile"
                                className="w-10 h-10 rounded-full object-cover"
                            />
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-xl">
                                {chat.name.charAt(0).toUpperCase()}
                            </div>
                        )}
                        <h3 className="font-bold">{chat.name}</h3>
                    </div>
                ))}
            </div>
        </div>
    );
}; 