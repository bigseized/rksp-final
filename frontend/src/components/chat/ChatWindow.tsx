import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { chatService } from '../../services/chatService';
import { websocketService } from '../../services/websocketService';
import ChatSidePanel from './ChatSidePanel';
import { useNavigate } from 'react-router-dom';

interface Message {
    id: number;
    content: string;
    sender: string;
    timestamp: string;
}

interface ChatWindowProps {
    chatId: number;
    isPersonal: boolean;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ chatId, isPersonal }) => {
    const { user, loading } = useAuth();
    const navigate = useNavigate();
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loadingMessages, setLoadingMessages] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const [panelWidth, setPanelWidth] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);
    const [chat, setChat] = useState<any>(null);
    const minPanelWidth = 200;
    const maxPanelWidth = 500;
    const isResizing = useRef(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!user && !loading) {
            console.error('Пользователь не авторизован');
            return;
        }

        const fetchChatInfo = async () => {
            try {
                const chatInfo = await chatService.getChat(chatId);
                setChat(chatInfo);
            } catch (error) {
                console.error('Failed to fetch chat info:', error);
            }
        };

        fetchChatInfo();
    }, [user, loading, chatId]);

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const data = await chatService.getChatMessages(chatId);
                setMessages(data);
            } catch (err) {
                setError('Failed to load messages');
                console.error(err);
            } finally {
                setLoadingMessages(false);
            }
        };

        fetchMessages();

        // Subscribe to WebSocket messages
        const setupWebSocket = async () => {
            try {
                // Subscribe to chat messages
                await websocketService.subscribe(`/topic/chat/${chatId}`, (message: Message) => {
                    setMessages(prev => [...prev, message]);
                });

                // Subscribe to error messages
                await websocketService.subscribe('/user/queue/errors', (error: string) => {
                    setError(error);
                });
            } catch (err) {
                console.error('Failed to subscribe to WebSocket:', err);
                setError('Failed to connect to chat');
            }
        };

        setupWebSocket();

        return () => {
            websocketService.disconnect();
        };
    }, [chatId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        try {
            await websocketService.sendMessage(`/app/chat/${chatId}/sendMessage`, {
                content: newMessage
            });
            setNewMessage('');
            setError(null);
        } catch (err) {
            console.error('Failed to send message:', err);
            setError('Failed to send message');
        }
    };

    const handleMouseMove = (e: MouseEvent) => {
        if (!isResizing.current) return;
        const newWidth = window.innerWidth - e.clientX;
        if (newWidth >= minPanelWidth && newWidth <= maxPanelWidth) {
            setPanelWidth(newWidth);
        }
    };
    const handleMouseUp = () => {
        isResizing.current = false;
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
    };
    useEffect(() => {
        if (!isPanelOpen) return;
        const onMove = (e: MouseEvent) => handleMouseMove(e);
        const onUp = () => handleMouseUp();
        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onUp);
        return () => {
            window.removeEventListener('mousemove', onMove);
            window.removeEventListener('mouseup', onUp);
        };
    }, [isPanelOpen]);

    useEffect(() => {
        // Set initial panel width when panel is opened
        if (isPanelOpen) {
            setIsAnimating(true);
            setPanelWidth(350);
            // Remove animation class after transition completes
            setTimeout(() => setIsAnimating(false), 300);
        } else {
            setIsAnimating(true);
            setPanelWidth(0);
            setTimeout(() => setIsAnimating(false), 300);
        }
    }, [isPanelOpen]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex items-center justify-center h-full">
                <p className="text-red-500">Ошибка авторизации</p>
            </div>
        );
    }

    return (
        <div className="flex flex-row h-full relative">
            {/* Основная часть чата */}
            <div className="flex flex-col flex-1 h-full">
                {/* Кнопка открытия панели */}
                {!isPanelOpen && !isPersonal && (
                    <button
                        className="absolute top-4 right-4 z-20 bg-white border rounded-full shadow p-2"
                        onClick={() => setIsPanelOpen(true)}
                        title="Открыть панель управления чатом"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                )}
                {/* Ошибка */}
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mt-2 mx-4" role="alert">
                        <span className="block sm:inline">{error}</span>
                        <button
                            className="absolute top-0 bottom-0 right-0 px-4 py-3"
                            onClick={() => setError(null)}
                        >
                            <span className="sr-only">Dismiss</span>
                            <svg className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                )}
                {/* Сообщения */}
                <div className="flex-1 min-h-0 overflow-y-auto p-4">
                    {messages.map(message => (
                        <div
                            key={message.id}
                            className={`mb-4 flex ${
                                message.sender === user?.username ? 'flex-row-reverse' : 'flex-row'
                            }`}
                        >
                            <div
                                className={`rounded-lg p-3 max-w-xs break-words ${
                                    message.sender === user?.username
                                        ? 'bg-blue-500 text-white ml-4'
                                        : 'bg-gray-200 text-gray-800 mr-4'
                                }`}
                            >
                                <p className="text-sm font-semibold">{message.sender}</p>
                                <p>{message.content}</p>
                                <p className="text-xs mt-1">
                                    {new Date(message.timestamp).toLocaleTimeString()}
                                </p>
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>
                <form onSubmit={handleSendMessage} className="p-4 border-t">
                    <div className="flex">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type a message..."
                            className="flex-1 p-2 border rounded-l"
                        />
                        <button
                            type="submit"
                            className="bg-blue-500 text-white px-4 py-2 rounded-r hover:bg-blue-600"
                        >
                            Send
                        </button>
                    </div>
                </form>
            </div>
            {/* Resizer и боковая панель */}
            {isPanelOpen && user && (
                <>
                    {/* Resizer */}
                    <div
                        style={{ cursor: 'col-resize', width: '6px', zIndex: 30 }}
                        className="h-full bg-gray-200 hover:bg-gray-400 transition-colors duration-150"
                        onMouseDown={() => {
                            isResizing.current = true;
                            document.body.style.cursor = 'col-resize';
                            document.body.style.userSelect = 'none';
                        }}
                    />
                    <div
                        style={{ 
                            width: panelWidth, 
                            transition: isAnimating ? 'width 0.3s ease-in-out' : 'none'
                        }}
                    >
                        <ChatSidePanel
                            isOpen={isPanelOpen}
                            onClose={() => setIsPanelOpen(false)}
                            width={panelWidth}
                            chatId={chatId}
                            onChatLeave={() => {
                                setIsPanelOpen(false);
                                window.location.reload();
                            }}
                        />
                    </div>
                </>
            )}
        </div>
    );
}; 