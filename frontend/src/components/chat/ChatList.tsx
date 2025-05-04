import React, { useEffect, useState } from 'react';
import { chatService } from '../../services/chatService';

interface Chat {
    id: number;
    name: string;
    description: string;
    personal: boolean;
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
        <div className="chat-list p-4">
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
                        className="chat-item p-4 border-b cursor-pointer hover:bg-gray-100"
                        onClick={() => onSelectChat(chat.id)}
                    >
                        <h3 className="font-bold">{chat.name}</h3>
                        <p className="text-gray-600">{chat.description}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}; 