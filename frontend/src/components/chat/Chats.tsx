import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { chatService } from '../../services/chatService';
import { ChatList } from './ChatList';
import { ChatWindow } from './ChatWindow';
import { Chat } from '../../types/chat';

interface ExtendedChat extends Chat {
  personal: boolean;
}

const Chats = () => {
  const { user } = useAuth();
  const [selectedChatId, setSelectedChatId] = useState<number | null>(null);
  const [chats, setChats] = useState<ExtendedChat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Перезагружаем страницу при первом переходе на чаты
    if (!sessionStorage.getItem('chatsLoaded')) {
      sessionStorage.setItem('chatsLoaded', 'true');
      window.location.reload();
      return;
    }

    const loadChats = async () => {
      try {
        setLoading(true);
        const loadedChats = await chatService.getChats();
        setChats(loadedChats as ExtendedChat[]);
      } catch (error) {
        console.error('Failed to load chats:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadChats();
    }
  }, [user]);

  const handleChatsUpdate = async () => {
    try {
      const updatedChats = await chatService.getChats();
      setChats(updatedChats as ExtendedChat[]);
    } catch (error) {
      console.error('Failed to update chats:', error);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="flex h-screen">
      <ChatList 
        onSelectChat={setSelectedChatId}
        chats={chats}
        loading={loading}
        onChatsUpdate={handleChatsUpdate}
      />
      {selectedChatId && (
        <ChatWindow 
          chatId={selectedChatId}
          isPersonal={chats.find(chat => chat.id === selectedChatId)?.personal || false}
        />
      )}
    </div>
  );
};

export default Chats; 