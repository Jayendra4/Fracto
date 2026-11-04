import { io, Socket } from 'socket.io-client';
import Cookies from 'js-cookie';

class SocketService {
    private socket: Socket | null = null;
    private readonly baseUrl = import.meta.env.VITE_API_URL || 'https://api-houseoffrac.igamingadda.com';

    private storedAccountId: number | null = null;
    private storedToken: string | null = null;
    private isConnecting: boolean = false;

    connect(accountId?: number) {
        // Update stored credentials if provided
        if (accountId) this.storedAccountId = accountId;

        const token = Cookies.get('hof_token');
        if (token) this.storedToken = token;

        // Prevent multiple simultaneous connection attempts
        if (this.isConnecting) return;

        if (this.socket?.connected) {
            return;
        }

        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }

        this.isConnecting = true;

        this.socket = io(`${this.baseUrl}/charts`, {
            auth: {
                token: this.storedToken ? `Bearer ${this.storedToken}` : '',
                accountId: this.storedAccountId,
            },
            query: {
                token: this.storedToken ? `Bearer ${this.storedToken}` : '', // Try Bearer in query too
                accountId: this.storedAccountId,
            },
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: 10,
            reconnectionDelay: 1000,
        });

        this.socket.on('connect', () => {
            this.isConnecting = false;
        });

        this.socket.on('connect_error', (error) => {
            console.error('❌ Socket connection error:', error);
            this.isConnecting = false;
        });

        this.socket.on('disconnect', () => {
            this.isConnecting = false;
        });
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            this.isConnecting = false;
        }
    }

    emit(event: string, data: any) {
        // Emit logging removed

        if (!this.socket?.connected) {
            console.warn('⚠️ Socket not connected when emitting, attempting connect...');
            this.connect();
        }
        this.socket?.emit(event, data);
    }

    on(event: string, callback: (data: any) => void) {
        // Listen logging removed

        if (!this.socket) {
            this.connect();
        }
        this.socket?.on(event, callback);
    }

    off(event: string, callback?: (data: any) => void) {
        if (callback) {
            this.socket?.off(event, callback);
        } else {
            this.socket?.off(event);
        }
    }

    get isConnected() {
        return this.socket?.connected || false;
    }
}

export const socketService = new SocketService();
