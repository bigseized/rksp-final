import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { chatService } from '../../services/chatService';
import { toast } from 'react-toastify';
import { debounce } from 'lodash';
import axios from 'axios';

interface ChatMember {
  id: number;
  username: string;
  role: 'ADMIN' | 'USER' | string;
}

interface ChatSidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  width: number;
  chatId: number;
  onChatLeave?: () => void;
}

interface SearchUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddUser: (userId: number) => Promise<void>;
  chatId: number;
}

const SearchUserModal: React.FC<SearchUserModalProps> = ({ isOpen, onClose, onAddUser, chatId }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ChatMember[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setError(null);
      return;
    }

    try {
      setIsSearching(true);
      setError(null);
      const results = await chatService.searchUsers(query);
      setSearchResults(results);
    } catch (error) {
      console.error('Failed to search users:', error);
      setError('Не удалось выполнить поиск');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const debouncedSearch = useCallback(
    debounce((query: string) => {
      handleSearch(query);
    }, 300),
    [handleSearch]
  );

  useEffect(() => {
    debouncedSearch(searchQuery);
    return () => {
      debouncedSearch.cancel();
    };
  }, [searchQuery, debouncedSearch]);

  const handleAddUserClick = async (userId: number) => {
    try {
      setIsSearching(true);
      await onAddUser(userId);
      setSearchQuery('');
      setSearchResults([]);
      onClose();
    } catch (error) {
      console.error('Failed to add user:', error);
      setError('Не удалось добавить пользователя');
    } finally {
      setIsSearching(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold">Добавить пользователя</h3>
            <button
              onClick={() => {
                onClose();
                setSearchQuery('');
                setSearchResults([]);
                setError(null);
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6 flex-1 overflow-hidden">
          <div className="relative mb-6">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Введите имя пользователя для поиска..."
                className="w-full p-4 border rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {isSearching && (
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                </div>
              )}
            </div>
            {error && (
              <p className="mt-2 text-red-500 text-center">{error}</p>
            )}
            {searchQuery && !isSearching && searchResults.length === 0 && !error && (
              <p className="mt-2 text-gray-500 text-center">Пользователи не найдены</p>
            )}
          </div>

          <div className="space-y-3 overflow-y-auto max-h-[calc(80vh-200px)]">
            {searchResults.map((result) => (
              <div
                key={result.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-medium">
                      {result.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium text-lg">{result.username}</div>
                    {result.role === 'ADMIN' && (
                      <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded-full font-medium">
                        Админ
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleAddUserClick(result.id)}
                  className="p-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSearching}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 border-t bg-gray-50 rounded-b-lg">
          <div className="flex justify-end">
            <button
              onClick={() => {
                onClose();
                setSearchQuery('');
                setSearchResults([]);
                setError(null);
              }}
              className="px-6 py-2 text-gray-600 hover:text-gray-800"
              disabled={isSearching}
            >
              Отмена
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ChatSidePanel: React.FC<ChatSidePanelProps> = ({ isOpen, onClose, width, chatId, onChatLeave }) => {
  const { user, loading } = useAuth();
  const [users, setUsers] = useState<ChatMember[]>([]);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCurrentUserAdmin, setIsCurrentUserAdmin] = useState(false);

  useEffect(() => {
    if (!user && !loading) {
      console.error('Пользователь не авторизован');
      return;
    }
  }, [user, loading]);

  const loadChatMembers = useCallback(async () => {
    if (!user) {
      console.error('Пользователь не авторизован');
      return;
    }

    try {
      setIsLoading(true);
      const members = await chatService.getChatMembers(chatId);
      console.log('Chat members:', members);
      
      // Сохраняем порядок пользователей
      setUsers(prevUsers => {
        const newUsers = [...members];
        // Сортируем новых пользователей в том же порядке, что и старые
        newUsers.sort((a, b) => {
          const prevIndexA = prevUsers.findIndex(u => u.id === a.id);
          const prevIndexB = prevUsers.findIndex(u => u.id === b.id);
          // Если пользователь был в предыдущем списке, сохраняем его позицию
          if (prevIndexA !== -1 && prevIndexB !== -1) {
            return prevIndexA - prevIndexB;
          }
          // Новые пользователи добавляются в конец
          if (prevIndexA === -1) return 1;
          if (prevIndexB === -1) return -1;
          return 0;
        });
        return newUsers;
      });
      
      // Проверяем, является ли текущий пользователь администратором
      const currentUserMember = members.find(member => member.id === user.id);
      setIsCurrentUserAdmin(currentUserMember?.role === 'ADMIN');
    } catch (error) {
      console.error('Failed to load chat members:', error);
      toast.error('Не удалось загрузить участников чата');
    } finally {
      setIsLoading(false);
    }
  }, [chatId, user]);

  useEffect(() => {
    if (isOpen && chatId && user) {
      loadChatMembers();
    }
  }, [isOpen, chatId, loadChatMembers, user]);

  const handleAddUser = async (userId: number) => {
    if (!user) {
      console.error('Пользователь не авторизован');
      return;
    }

    try {
      setIsLoading(true);
      await chatService.addUserToChat(chatId, userId);
      await loadChatMembers();
      setShowAddUserModal(false);
      toast.success('Пользователь успешно добавлен');
    } catch (error) {
      console.error('Failed to add user:', error);
      toast.error('Не удалось добавить пользователя');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveUser = async (userId: number) => {
    if (!user) {
      console.error('Пользователь не авторизован');
      return;
    }

    try {
      setIsLoading(true);
      console.log('Removing user:', userId, 'Current user:', user.id);
      await chatService.removeUserFromChat(chatId, userId);
      await loadChatMembers();
      toast.success('Пользователь успешно удален');
    } catch (error) {
      console.error('Failed to remove user:', error);
      toast.error('Не удалось удалить пользователя');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePromoteToAdmin = async (userId: number) => {
    if (!user) {
      console.error('Пользователь не авторизован');
      return;
    }

    try {
      setIsLoading(true);
      await chatService.promoteToAdmin(chatId, userId);
      await loadChatMembers();
      toast.success('Пользователь успешно повышен до админа');
    } catch (error) {
      console.error('Failed to promote user:', error);
      toast.error('Не удалось повысить пользователя до админа');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoteFromAdmin = async (userId: number) => {
    if (!user) {
      console.error('Пользователь не авторизован');
      return;
    }

    try {
      setIsLoading(true);
      await chatService.demoteFromAdmin(chatId, userId);
      await loadChatMembers();
      toast.success('Пользователь понижен до обычного участника');
    } catch (error) {
      console.error('Failed to demote user:', error);
      toast.error('Не удалось понизить пользователя');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLeaveChat = async () => {
    if (!user) {
      console.error('Пользователь не авторизован');
      return;
    }

    try {
      setIsLoading(true);
      await chatService.leaveChat(chatId);
      toast.success('Вы покинули чат');
      onClose();
      if (onChatLeave) {
        onChatLeave();
      }
    } catch (err) {
      console.error('Failed to leave chat:', err);
      
      // Проверяем, является ли ошибка AxiosError
      if (axios.isAxiosError(err)) {
        console.log('Axios error details:', {
          status: err.response?.status,
          data: err.response?.data,
          headers: err.response?.headers
        });

        // Проверяем статус ответа
        if (err.response?.status === 409) {
          console.log('Showing admin transfer required message');
          toast.error('Сначала передайте права администратора');
          return;
        }
      }

      // Общая ошибка
      toast.error('Не удалось покинуть чат');
    } finally {
      setIsLoading(false);
    }
  };

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
    <>
      <div
        className={`flex flex-col h-full bg-white shadow-lg border-l z-10 transition-transform duration-300
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
        style={{ width }}
      >
        <div className="p-4 font-bold text-lg border-b flex items-center justify-between min-w-0">
          <span>Управление чатом</span>
          <button onClick={onClose} className="ml-2 p-1 rounded hover:bg-gray-100">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-4 flex-1 overflow-y-auto">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Участники чата</h3>
              <button
                onClick={() => setShowAddUserModal(true)}
                className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                disabled={isLoading}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>

            {isLoading ? (
              <div key="loading-spinner1" className="flex justify-center">
                <div key="loading-spinner2" className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            ) : (
              <div key="users-list" className="space-y-2">
                {users.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{member.username}</span>
                      {member.role === 'ADMIN' && (
                        <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded-full font-medium">Админ</span>
                      )}
                    </div>
                    {isCurrentUserAdmin && user?.id && user.id !== member.id && (
                      <div className="flex items-center gap-2">
                        {member.role === 'ADMIN' ? (
                          <button
                            onClick={() => handleDemoteFromAdmin(member.id)}
                            className="text-yellow-500 hover:text-yellow-700"
                            disabled={isLoading}
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                            </svg>
                          </button>
                        ) : (
                          <button
                            onClick={() => handlePromoteToAdmin(member.id)}
                            className="text-blue-500 hover:text-blue-700"
                            disabled={isLoading}
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                            </svg>
                          </button>
                        )}
                        <button
                          onClick={() => handleRemoveUser(member.id)}
                          className="text-red-500 hover:text-red-700"
                          disabled={isLoading}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="p-4 border-t">
          <button
            onClick={handleLeaveChat}
            className="w-full py-2 px-4 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
            disabled={isLoading}
          >
            Покинуть чат
          </button>
        </div>
      </div>
      <SearchUserModal
        isOpen={showAddUserModal}
        onClose={() => setShowAddUserModal(false)}
        onAddUser={handleAddUser}
        chatId={chatId}
      />
    </>
  );
};

export default ChatSidePanel;
