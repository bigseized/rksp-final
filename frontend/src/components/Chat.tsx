import React, { useState, useEffect, useRef } from 'react';
import SockJS from 'sockjs-client';
import type { ChatMessage, Chat } from '../types/chat';
import { Stomp } from '@stomp/stompjs';
import CreateChat from './CreateChat';
import { API_CONFIG } from '../config';

interface ChatProps {
    currentUser: string;
}

const Chat: React.FC<ChatProps> = ({ currentUser }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [message, setMessage] = useState('');
    const [stompClient, setStompClient] = useState<any>(null);
    const [chats, setChats] = useState<Chat[]>([]);
    const [selectedChat, setSelectedChat] = useState<number | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const socket = new SockJS(API_CONFIG.WS_URL);
        const stomp = Stomp.over(socket);

        const token = localStorage.getItem('token');

        stomp.connect(
            { 
                'Authorization': `Bearer ${token}`
            }, 
            () => {
                setStompClient(stomp);
            }
        );

        // Load chats
        fetch(`${API_CONFIG.CHAT_API_URL}/chats`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
            .then(response => response.json())
            .then(data => setChats(data));

        return () => {
            if (stompClient) {
                stompClient.disconnect();
            }
        };
    }, []);

    useEffect(() => {
        if (selectedChat && stompClient) {
            // Unsubscribe from previous chat if exists
            if (stompClient.subscriptions) {
                Object.keys(stompClient.subscriptions).forEach(key => {
                    stompClient.unsubscribe(key);
                });
            }

            // Subscribe to new chat
            stompClient.subscribe(`/topic/chat/${selectedChat}`, (message: any) => {
                const receivedMessage = JSON.parse(message.body);
                setMessages(prev => [...prev, receivedMessage]);
            });

            // Load chat history
            fetch(`${API_CONFIG.CHAT_API_URL}/chats/${selectedChat}/messages`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            })
                .then(response => response.json())
                .then(data => setMessages(data));
        }
    }, [selectedChat, stompClient]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleCreateChat = (name: string, description: string) => {
        fetch(`${API_CONFIG.CHAT_API_URL}/chats`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ name, description }),
        })
        .then(response => response.json())
        .then(newChat => {
            setChats(prev => [...prev, newChat]);
            setSelectedChat(newChat.id);
        });
    };

    const sendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (message.trim() && stompClient && selectedChat) {
            const chatMessage = {
                content: message
            };
            stompClient.send(`/app/chat/${selectedChat}/sendMessage`, {}, JSON.stringify(chatMessage));
            setMessage('');
        }
    };

    return (
        <div className="flex h-screen">
            <div className="w-1/4 border-r">
                <CreateChat onCreate={handleCreateChat} />
                <div className="p-4">
                    <h2 className="text-lg font-semibold mb-4">Chats</h2>
                    <div className="space-y-2">
                        {chats.map(chat => (
                            <div
                                key={chat.id}
                                className={`p-2 rounded cursor-pointer ${
                                    selectedChat === chat.id ? 'bg-blue-100' : 'hover:bg-gray-100'
                                }`}
                                onClick={() => setSelectedChat(chat.id)}
                            >
                                <div className="font-semibold">{chat.name}</div>
                                <div className="text-sm text-gray-600">{chat.description}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <div className="flex-1 flex flex-col">
                {selectedChat ? (
                    <>
                        <div className="flex-1 overflow-y-auto">
                            {messages.map((msg, index) => (
                                <div
                                    key={index}
                                    className={`mb-4 flex ${
                                        msg.sender === currentUser
                                            ? 'flex-row-reverse'
                                            : 'flex-row'
                                    }`}
                                >
                                    <div className={`min-w-0 max-w-[70%] p-3 rounded-lg break-words ${
                                        msg.sender === currentUser
                                            ? 'bg-blue-500 text-white ml-4'
                                            : 'bg-gray-200 text-gray-800 mr-4'
                                    }`}>
                                        <div className="text-sm font-semibold mb-1">
                                            {msg.sender}
                                        </div>
                                        <div>{msg.content}</div>
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>
                        <form onSubmit={sendMessage} className="p-4 border-t">
                            <div className="flex">
                                <input
                                    type="text"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    className="flex-1 p-2 border rounded-l"
                                    placeholder="Type a message..."
                                />
                                <button
                                    type="submit"
                                    className="bg-blue-500 text-white p-2 rounded-r"
                                >
                                    Send
                                </button>
                            </div>
                        </form>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-gray-500">
                        Select a chat to start messaging
                    </div>
                )}
            </div>
        </div>
    );
};

export default Chat;