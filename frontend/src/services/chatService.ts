import axios from 'axios';
import { API_CONFIG } from '../config';

const API_URL = API_CONFIG.CHAT_API_URL;

interface ChatDto {
    name: string;
    description: string;
    personal: boolean;
}

export interface ChatMember {
    id: number;
    username: string;
    displayUsername: string;
    authorities: { authority: string }[];
    role: string;
}

interface ChatService {
    getChats(): Promise<any>;
    createChat(name: string, description: string, personal?: boolean): Promise<any>;
    createPersonalChat(userId: number, username: string): Promise<any>;
    getChatMembers(chatId: number): Promise<ChatMember[]>;
    addUserToChat(chatId: number, userId: number): Promise<void>;
    removeUserFromChat(chatId: number, userId: number): Promise<void>;
    getChatMessages(chatId: number): Promise<any>;
    sendMessage(chatId: number, content: string): Promise<any>;
    searchUsers(query: string): Promise<ChatMember[]>;
    promoteToAdmin(chatId: number, userId: number): Promise<void>;
    demoteFromAdmin(chatId: number, userId: number): Promise<void>;
    leaveChat(chatId: number): Promise<void>;
    getChat(chatId: number): Promise<any>;
    clearChats(): void;
    chats: any[];
}

export const chatService: ChatService = {
    chats: [],

    clearChats() {
        this.chats = [];
    },

    async getChats() {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('No authentication token found');
        }
        const response = await axios.get(`${API_URL}/chats`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return response.data;
    },

    async createChat(name: string, description: string, personal: boolean = false) {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('No authentication token found');
        }
        const response = await axios.post(`${API_URL}/chats`, { name, description, personal }, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return response.data;
    },

    async createPersonalChat(userId: number, username: string) {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('No authentication token found');
        }

        const requestData = {
            name: username,
            description: 'Личный чат',
            personal: true,
            targetUserId: userId
        };

        console.log('Sending request to /personal:', {
            url: `${API_URL}/chats/personal`,
            data: requestData,
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const response = await axios.post(`${API_URL}/chats/personal`, requestData, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return response.data;
    },

    async getChatMembers(chatId: number): Promise<ChatMember[]> {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('No authentication token found');
        }
        const response = await axios.get(`${API_URL}/chats/${chatId}/members`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return response.data;
    },

    async addUserToChat(chatId: number, userId: number) {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('No authentication token found');
        }
        await axios.post(`${API_URL}/chats/${chatId}/users/${userId}`, null, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
    },

    async removeUserFromChat(chatId: number, userId: number) {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('No authentication token found');
        }
        await axios.delete(`${API_URL}/chats/${chatId}/users/${userId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
    },

    async getChatMessages(chatId: number) {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('No authentication token found');
        }
        const response = await axios.get(`${API_URL}/chats/${chatId}/messages`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return response.data;
    },

    async sendMessage(chatId: number, content: string) {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('No authentication token found');
        }
        const response = await axios.post(`${API_URL}/chats/${chatId}/messages`, { content }, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return response.data;
    },

    async searchUsers(query: string): Promise<ChatMember[]> {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('No authentication token found');
        }
        const response = await axios.get(`${API_URL}/users/search`, {
            params: { query },
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return response.data;
    },

    async promoteToAdmin(chatId: number, userId: number) {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('No authentication token found');
        }
        await axios.post(`${API_URL}/chats/${chatId}/users/${userId}/promote`, null, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
    },

    async demoteFromAdmin(chatId: number, userId: number) {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('No authentication token found');
        }
        await axios.post(`${API_URL}/chats/${chatId}/users/${userId}/demote`, null, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
    },

    async leaveChat(chatId: number) {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('No authentication token found');
        }
        await axios.delete(`${API_URL}/chats/${chatId}/users/me`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
    },

    getChat: async (chatId: number) => {
        const response = await axios.get(`${API_URL}/chats/${chatId}`);
        return response.data;
    }
}; 