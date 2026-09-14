import http from 'http';
import { AddressInfo } from 'net';
import { io as Client, Socket as ClientSocket } from 'socket.io-client';
import app from '../src/app';
import {
  initSocketServer,
  getSocketServer,
  setSocketServer,
  emitNewOrder,
  emitPaymentCompleted,
  emitLowInventory,
  emitExitVerified,
} from '../src/socket/socketServer';

describe('Real-Time Socket.IO Notification Layer', () => {
  let httpServer: http.Server;
  let clientSocket: ClientSocket;
  let serverPort: number;

  beforeAll((done) => {
    httpServer = http.createServer(app);
    initSocketServer(httpServer);
    httpServer.listen(() => {
      const port = (httpServer.address() as AddressInfo).port;
      serverPort = port;
      clientSocket = Client(`http://localhost:${port}`);
      clientSocket.on('connect', done);
    });
  });

  afterAll((done) => {
    if (clientSocket && clientSocket.connected) {
      clientSocket.disconnect();
    }
    const io = getSocketServer();
    if (io) {
      io.close();
    }
    httpServer.close(done);
  });

  it('1. Should connect and receive connection:ack event', (done) => {
    const tempSocket = Client(`http://localhost:${serverPort}`);
    tempSocket.on('connection:ack', (data: any) => {
      expect(data.status).toBe('connected');
      expect(data.socketId).toBeDefined();
      expect(data.serverTime).toBeDefined();
      tempSocket.disconnect();
      done();
    });
  });

  it('2. Should receive admin:new_order broadcast event on new order', (done) => {
    const orderPayload = {
      orderId: 'ord-test-12345',
      orderNumber: 'ORD-TEST1234',
      userId: 'u-123',
      customerName: 'Aarav Sharma',
      totalAmount: 145.50,
      itemsCount: 3,
      timestamp: new Date().toISOString(),
    };

    clientSocket.once('admin:new_order', (payload: any) => {
      expect(payload.orderId).toBe(orderPayload.orderId);
      expect(payload.totalAmount).toBe(145.50);
      expect(payload.itemsCount).toBe(3);
      done();
    });

    emitNewOrder(orderPayload);
  });

  it('3. Should receive admin:payment_completed broadcast event upon payment capture', (done) => {
    const paymentPayload = {
      orderId: 'ord-test-12345',
      orderNumber: 'ORD-TEST1234',
      razorpayPaymentId: 'pay_test_98765',
      amount: 145.50,
      customerName: 'Aarav Sharma',
      timestamp: new Date().toISOString(),
    };

    clientSocket.once('admin:payment_completed', (payload: any) => {
      expect(payload.orderId).toBe(paymentPayload.orderId);
      expect(payload.razorpayPaymentId).toBe('pay_test_98765');
      expect(payload.amount).toBe(145.50);
      done();
    });

    emitPaymentCompleted(paymentPayload);
  });

  it('4. Should receive admin:low_inventory warning event when stock is low', (done) => {
    const inventoryPayload = {
      productId: 'p-101',
      productName: 'Amul Butter 100g',
      barcode: '8901030000001',
      stockQuantity: 4,
      lowStockThreshold: 10,
      timestamp: new Date().toISOString(),
    };

    clientSocket.once('admin:low_inventory', (payload: any) => {
      expect(payload.productId).toBe('p-101');
      expect(payload.stockQuantity).toBe(4);
      expect(payload.lowStockThreshold).toBe(10);
      done();
    });

    emitLowInventory(inventoryPayload);
  });

  it('5. Should receive admin:exit_verified event when turnstile validates exit token', (done) => {
    const exitPayload = {
      orderId: 'ord-test-12345',
      orderNumber: 'ORD-TEST1234',
      customerName: 'Aarav Sharma',
      verifierNode: 'North Turnstile Gate #2',
      verifiedAt: new Date().toISOString(),
      timestamp: new Date().toISOString(),
    };

    clientSocket.once('admin:exit_verified', (payload: any) => {
      expect(payload.orderId).toBe(exitPayload.orderId);
      expect(payload.verifierNode).toBe('North Turnstile Gate #2');
      done();
    });

    emitExitVerified(exitPayload);
  });

  it('6. Should gracefully handle emission when Socket server instance is null (Non-blocking fallback)', () => {
    const currentIo = getSocketServer();
    setSocketServer(null);

    // None of these should throw an error
    expect(() => {
      emitNewOrder({
        orderId: '1',
        userId: 'u1',
        totalAmount: 10,
        itemsCount: 1,
        timestamp: new Date().toISOString(),
      });
      emitPaymentCompleted({
        orderId: '1',
        amount: 10,
        timestamp: new Date().toISOString(),
      });
      emitLowInventory({
        productId: '1',
        productName: 'Item',
        barcode: '123',
        stockQuantity: 1,
        lowStockThreshold: 5,
        timestamp: new Date().toISOString(),
      });
      emitExitVerified({
        orderId: '1',
        verifiedAt: new Date().toISOString(),
        timestamp: new Date().toISOString(),
      });
    }).not.toThrow();

    // Restore io instance
    setSocketServer(currentIo);
  });
});
