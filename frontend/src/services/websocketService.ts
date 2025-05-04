import { API_CONFIG } from '../config';
import SockJS from 'sockjs-client';
import { Client, StompHeaders } from '@stomp/stompjs';

class WebSocketService {
    private stompClient: Client | null = null;
    private subscriptions: Map<string, (message: any) => void> = new Map();
    private isConnecting: boolean = false;
    private connectionPromise: Promise<void> | null = null;

    private getHeaders(): StompHeaders {
        const token = localStorage.getItem('token');
        const headers: StompHeaders = {};
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        return headers;
    }

    private async ensureConnected(): Promise<void> {
        if (this.stompClient?.connected) {
            return;
        }

        if (this.isConnecting && this.connectionPromise) {
            return this.connectionPromise;
        }

        this.isConnecting = true;
        this.connectionPromise = new Promise((resolve, reject) => {
            if (!this.stompClient) {
                this.stompClient = new Client({
                    webSocketFactory: () => new SockJS(API_CONFIG.WS_URL),
                    connectHeaders: this.getHeaders(),
                    onConnect: () => {
                        console.log('Connected to WebSocket');
                        this.isConnecting = false;
                        // Resubscribe to all active subscriptions
                        this.subscriptions.forEach((callback, destination) => {
                            this.subscribe(destination, callback);
                        });
                        resolve();
                    },
                    onStompError: (frame) => {
                        console.error('STOMP error:', frame);
                        this.isConnecting = false;
                        reject(frame);
                    },
                    onWebSocketError: (event) => {
                        console.error('WebSocket error:', event);
                        this.isConnecting = false;
                        reject(event);
                    },
                    onDisconnect: () => {
                        console.log('Disconnected from WebSocket');
                        this.isConnecting = false;
                    }
                });

                this.stompClient.activate();
            }
        });

        return this.connectionPromise;
    }

    async subscribe(destination: string, callback: (message: any) => void) {
        try {
            await this.ensureConnected();
            
            if (!this.stompClient?.connected) {
                throw new Error('WebSocket connection not established');
            }

            console.log('Subscribing to:', destination);
            const subscription = this.stompClient.subscribe(destination, (message) => {
                console.log('Received message:', message);
                callback(JSON.parse(message.body));
            }, this.getHeaders());

            this.subscriptions.set(destination, callback);
            return subscription;
        } catch (error) {
            console.error('Error subscribing to WebSocket:', error);
            throw error;
        }
    }

    async sendMessage(destination: string, message: any) {
        try {
            console.log('Attempting to send message to:', destination);
            console.log('Message content:', message);
            
            await this.ensureConnected();
            
            if (!this.stompClient?.connected) {
                throw new Error('WebSocket connection not established');
            }

            const headers = this.getHeaders();
            console.log('Sending with headers:', headers);

            this.stompClient.publish({
                destination,
                headers: {
                    ...headers,
                    'content-type': 'application/json'
                },
                body: JSON.stringify(message)
            });
            
            console.log('Message sent successfully');
        } catch (error) {
            console.error('Error sending WebSocket message:', error);
            throw error;
        }
    }

    disconnect() {
        if (this.stompClient) {
            this.stompClient.deactivate();
            this.stompClient = null;
            this.subscriptions.clear();
            this.isConnecting = false;
            this.connectionPromise = null;
        }
    }
}

export const websocketService = new WebSocketService(); 