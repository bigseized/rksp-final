export interface ChatMessage {
    id: number;
    chatId: number;
    sender: string;
    content: string;
    timestamp: string;
}

export interface Chat {
    id: number;
    name: string;
    description: string;
}