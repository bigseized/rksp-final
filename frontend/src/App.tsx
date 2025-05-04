import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import { ChatList } from './components/chat/ChatList';
import { ChatWindow } from './components/chat/ChatWindow';
import UserProfile from './components/profile/UserProfile';
import Header from './components/Header';
import { chatService } from './services/chatService';

interface PrivateRouteProps {
    children: React.ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
    const { user, loading } = useAuth();
    
    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-xl">Loading...</div>
            </div>
        );
    }
    
    return user ? <>{children}</> : <Navigate to="/login" />;
};

const App: React.FC = () => {
    const [selectedChatId, setSelectedChatId] = useState<number | null>(null);
    const [chats, setChats] = useState<any[]>([]);
    const [loadingChats, setLoadingChats] = useState(true);
    const fetchChats = async () => {
        setLoadingChats(true);
        try {
            const data = await chatService.getChats();
            setChats(data);
        } catch (err) {
            // Можно добавить обработку ошибок
        } finally {
            setLoadingChats(false);
        }
    };
    React.useEffect(() => {
        fetchChats();
    }, []);

    return (
        <AuthProvider>
            <Router>
                <div className="app">
                    <ToastContainer
                        position="top-center"
                        autoClose={2000}
                        hideProgressBar={false}
                        newestOnTop={false}
                        closeOnClick
                        rtl={false}
                        pauseOnFocusLoss
                        draggable
                        pauseOnHover
                        theme="light"
                        className="custom-toast-container"
                    />
                    <Routes>
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/" element={<Navigate to="/chats" replace />} />
                        <Route
                            path="/chats"
                            element={
                                <PrivateRoute>
                                    <div className="flex flex-col h-screen">
                                        <Header onChatsUpdate={fetchChats} />
                                        <div className="flex flex-1 h-0 min-h-0">
                                            <div className="w-1/4 border-r h-full">
                                                <ChatList onSelectChat={setSelectedChatId} chats={chats} loading={loadingChats} onChatsUpdate={fetchChats} />
                                            </div>
                                            <div className="flex-1 h-full">
                                                {selectedChatId ? (
                                                    <ChatWindow chatId={selectedChatId} />
                                                ) : (
                                                    <div className="flex items-center justify-center h-full">
                                                        <p>Select a chat to start messaging</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </PrivateRoute>
                            }
                        />
                        <Route
                            path="/profile"
                            element={
                                <PrivateRoute>
                                    <div className="flex flex-col h-screen">
                                        <Header onChatsUpdate={fetchChats} />
                                        <div className="flex-1 h-0 min-h-0">
                                            <UserProfile />
                                        </div>
                                    </div>
                                </PrivateRoute>
                            }
                        />
                    </Routes>
                </div>
            </Router>
        </AuthProvider>
    );
};

export default App; 