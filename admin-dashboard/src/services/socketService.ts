import { io, Socket } from 'socket.io-client';

export type SocketStatus = 'connected' | 'connecting' | 'disconnected' | 'error';

export interface NewOrderPayload {
  orderId: string;
  orderNumber?: string;
  userId: string;
  customerName?: string;
  customerEmail?: string;
  totalAmount: number;
  itemsCount: number;
  timestamp: string;
}

export interface PaymentCompletedPayload {
  orderId: string;
  orderNumber?: string;
  razorpayPaymentId?: string;
  razorpayOrderId?: string;
  amount: number;
  customerName?: string;
  timestamp: string;
}

export interface LowInventoryPayload {
  productId: string;
  productName: string;
  barcode: string;
  category?: string;
  stockQuantity: number;
  lowStockThreshold: number;
  timestamp: string;
}

export interface ExitVerifiedPayload {
  orderId: string;
  orderNumber?: string;
  customerName?: string;
  verifierNode?: string;
  verifiedAt: string;
  timestamp: string;
}

class SocketService {
  private socket: Socket | null = null;
  private statusListeners: ((status: SocketStatus) => void)[] = [];
  private currentStatus: SocketStatus = 'disconnected';

  public connect(baseUrl?: string): Socket {
    if (this.socket && this.socket.connected) {
      return this.socket;
    }

    const socketUrl = baseUrl || import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

    this.setStatus('connecting');

    this.socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 15,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 10000,
      autoConnect: true,
    });

    this.socket.on('connect', () => {
      this.setStatus('connected');
      // Join staff admin room
      this.socket?.emit('join:admin');
    });

    this.socket.on('disconnect', (reason) => {
      if (reason === 'io server disconnect') {
        // the disconnection was initiated by the server, reconnect manually
        this.socket?.connect();
      }
      this.setStatus('disconnected');
    });

    this.socket.on('connect_error', () => {
      this.setStatus('error');
    });

    this.socket.on('reconnect_attempt', () => {
      this.setStatus('connecting');
    });

    this.socket.on('reconnect', () => {
      this.setStatus('connected');
    });

    return this.socket;
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.setStatus('disconnected');
    }
  }

  public getSocket(): Socket | null {
    return this.socket;
  }

  public getStatus(): SocketStatus {
    return this.currentStatus;
  }

  public onStatusChange(callback: (status: SocketStatus) => void): () => void {
    this.statusListeners.push(callback);
    callback(this.currentStatus);
    return () => {
      this.statusListeners = this.statusListeners.filter((cb) => cb !== callback);
    };
  }

  private setStatus(status: SocketStatus): void {
    this.currentStatus = status;
    this.statusListeners.forEach((cb) => cb(status));
  }

  // Type-safe listeners
  public onNewOrder(callback: (payload: NewOrderPayload) => void): () => void {
    if (!this.socket) this.connect();
    this.socket?.on('admin:new_order', callback);
    return () => {
      this.socket?.off('admin:new_order', callback);
    };
  }

  public onPaymentCompleted(callback: (payload: PaymentCompletedPayload) => void): () => void {
    if (!this.socket) this.connect();
    this.socket?.on('admin:payment_completed', callback);
    return () => {
      this.socket?.off('admin:payment_completed', callback);
    };
  }

  public onLowInventory(callback: (payload: LowInventoryPayload) => void): () => void {
    if (!this.socket) this.connect();
    this.socket?.on('admin:low_inventory', callback);
    return () => {
      this.socket?.off('admin:low_inventory', callback);
    };
  }

  public onExitVerified(callback: (payload: ExitVerifiedPayload) => void): () => void {
    if (!this.socket) this.connect();
    this.socket?.on('admin:exit_verified', callback);
    return () => {
      this.socket?.off('admin:exit_verified', callback);
    };
  }
}

export const socketService = new SocketService();
