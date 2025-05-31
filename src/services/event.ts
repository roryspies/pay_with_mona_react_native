// // firebaseSSEListener.ts
// import EventSource from 'react-native-sse';
// import { FIREBASE_URL } from '../utils/config';

// export type SSEEvent = {
//   path: string;
//   data: any;
// };

// type ListenerOptions = {
//   onData: (event: SSEEvent) => void;
//   onError?: (error: any) => void;
//   onMaxRetriesReached?: () => void;
// };

// class FirebaseSSEListener {
//   private eventSource: EventSource | null = null;
//   private keepAliveInterval: NodeJS.Timeout | null = null;
//   private reconnectTimeout: NodeJS.Timeout | null = null;
//   private retryCount = 0;
//   private maxRetries = 5;
//   private lastEventTimestamp: number = 0;

//   private readonly retryDelay = 2000;
//   private readonly connectionTimeout = 10000;
//   private readonly keepAliveCheckInterval = 60 * 1000; // 1 minute
//   private readonly maxInactivityPeriod = 5 * 60 * 1000; // 5 minutes
//   private readonly baseUrl: string;

//   constructor(baseUrl?: string) {
//     this.baseUrl = baseUrl || FIREBASE_URL;
//   }

//   /**
//    * Listen to payments events from Firebase
//    */
//   public async listenToPaymentEvents(
//     transactionId: string,
//     options: ListenerOptions
//   ): Promise<void> {
//     console.log('🔥 Listening to payment events:', transactionId);
//     const streamUrl = `${this.baseUrl}/public/paymentUpdate/${transactionId}.json`;
//     return this.connectToEventSource(streamUrl, options);
//   }

//   /**
//    * Listen to transactions events from Firebase
//    */
//   public async listenToTransactionEvents(
//     transactionId: string,
//     options: ListenerOptions
//   ): Promise<void> {
//     console.log('🔥 Listening to transaction events:', transactionId);
//     const streamUrl = `${this.baseUrl}/public/transaction-messages/${transactionId}.json`;
//     return this.connectToEventSource(streamUrl, options);
//   }

//   /**
//    * Listen to authentication events from Firebase
//    */
//   public async listenToAuthnEvents(
//     sessionId: string,
//     options: ListenerOptions
//   ): Promise<void> {
//     const streamUrl = `${this.baseUrl}/public/login_success/authn_${sessionId}.json`;
//     return this.connectToEventSource(streamUrl, options);
//   }

//   /**
//    * Connect to an event source and set up event listeners
//    */
//   private async connectToEventSource(
//     url: string,
//     options: ListenerOptions
//   ): Promise<void> {
//     if (this.retryCount >= this.maxRetries) {
//       this.cleanup();
//     }
//     return new Promise((resolve, reject) => {
//       // Set up connection timeout
//       const timeout = setTimeout(() => {
//         reject(new Error('Connection timeout exceeded'));
//       }, this.connectionTimeout);
//       try {
//         const headers: Record<string, string> = {
//           'Accept': 'text/event-stream',
//           'Cache-Control': 'no-cache',
//         };

//         this.eventSource = new EventSource(url, { headers });

//         // Set up event handlers
//         this.setupEventHandlers(
//           options,
//           () => {
//             clearTimeout(timeout);
//             resolve();
//           },
//           reject
//         );
//       } catch (error) {
//         clearTimeout(timeout);
//         reject(error);
//         this.scheduleReconnect(url, options);
//       }
//     });
//   }

//   /**
//    * Set up all event handlers for the event source
//    */
//   private setupEventHandlers(
//     options: ListenerOptions,
//     onConnected: () => void,
//     onError: (error: any) => void
//   ) {
//     if (!this.eventSource) return;

//     // Connection established
//     this.eventSource.addEventListener('open', () => {
//       this.retryCount = 0;
//       this.lastEventTimestamp = Date.now();
//       console.log('[FirebaseSSE] Connected');
//       onConnected();
//       // Start keep-alive monitoring
//       this.startKeepAliveMonitor(options);
//     });

//     // Handle connection errors
//     this.eventSource.addEventListener('error', (error) => {
//       console.error('[FirebaseSSE] Connection error:', error);
//       options.onError?.(error);
//       onError(error);
//       // @ts-ignore
//       const url = this.eventSource?.url || '';
//       this.scheduleReconnect(url, options);
//     });

//     // Handle connection close
//     this.eventSource.addEventListener('close', (event) => {
//       console.log('[FirebaseSSE] Connection closed:', event);
//       onError('Connection closed');
//       // @ts-ignore
//       const url = this.eventSource?.url || '';
//       this.scheduleReconnect(url, options);
//     });

//     // Handle Firebase-specific events
//     this.setupDataEventHandlers(options);
//   }

//   /**
//    * Set up handlers for data events
//    */
//   private setupDataEventHandlers(options: ListenerOptions) {
//     if (!this.eventSource) return;

//     const handleEvent = (event: MessageEvent) => {
//       console.log('🔥 Event:', event);

//       // Update last event timestamp
//       this.lastEventTimestamp = Date.now();

//       if (!event.data) return;

//       try {
//         const parsed = JSON.parse(event.data);
//         if (parsed.data == null) return;

//         const sseEvent: SSEEvent = {
//           path: parsed.path,
//           data: parsed.data,
//         };
//         options.onData(sseEvent);
//       } catch (err) {
//         console.log('[FirebaseSSE] Failed to parse event data', err);
//       }
//     };

//     // Listen for specific Firebase event types
//     // @ts-ignore
//     this.eventSource.addEventListener('put', handleEvent);
//     // @ts-ignore
//     this.eventSource.addEventListener('patch', handleEvent);

//     this.eventSource.addEventListener('message', (event) => {
//       console.log('🔥 Event:', event);

//       // Update last event timestamp
//       this.lastEventTimestamp = Date.now();

//       if (!event.data) return;

//       try {
//         const parsed = JSON.parse(event.data);
//         if (parsed.data == null) return;

//         const sseEvent: SSEEvent = {
//           path: parsed.path,
//           data: parsed.data,
//         };
//         options.onData(sseEvent);
//       } catch (err) {
//         console.log('[FirebaseSSE] Failed to parse event data', err);
//       }
//     });
//   }

//   /**
//    * Start monitoring for connection activity
//    */
//   private startKeepAliveMonitor(options: ListenerOptions): void {
//     // Clear any existing interval
//     if (this.keepAliveInterval) {
//       clearInterval(this.keepAliveInterval);
//     }

//     // Check connection health periodically
//     this.keepAliveInterval = setInterval(() => {
//       const now = Date.now();
//       const inactivityTime = now - this.lastEventTimestamp;

//       // If no events received for too long, reconnect
//       if (inactivityTime > this.maxInactivityPeriod) {
//         console.log(
//           `[FirebaseSSE] No events for ${inactivityTime / 1000}s, reconnecting...`
//         );
//         // @ts-ignore
//         const url = this.eventSource?.url || '';

//         this.scheduleReconnect(url, options);
//       }
//     }, this.keepAliveCheckInterval);
//   }

//   /**
//    * Schedule a reconnection attempt with exponential backoff
//    */
//   private scheduleReconnect(url: string, options: ListenerOptions): void {
//     // Clean up existing connection
//     this.cleanup();

//     if (this.retryCount >= this.maxRetries) {
//       console.error('[FirebaseSSE] Max retries reached, giving up');
//       options.onMaxRetriesReached?.();
//       return;
//     }

//     // Calculate backoff delay
//     const delay = Math.min(
//       this.retryDelay * Math.pow(2, this.retryCount),
//       30000
//     );

//     console.log('🔥 Reconnecting to:', url);
//     console.log(
//       `[FirebaseSSE] Reconnecting in ${delay}ms (attempt ${this.retryCount + 1}/${this.maxRetries})`
//     );

//     // Schedule reconnection
//     this.reconnectTimeout = setTimeout(async () => {
//       this.retryCount++;

//       try {
//         await this.connectToEventSource(url, options);
//         console.log('[FirebaseSSE] Reconnection successful');
//       } catch (error) {
//         console.error('[FirebaseSSE] Reconnection failed:', error);
//         // Next retry will be scheduled by error handler
//       }
//     }, delay);
//   }

//   /**
//    * Clean up all resources
//    */
//   private cleanup(): void {
//     // Close existing event source
//     if (this.eventSource) {
//       this.eventSource.close();
//       this.eventSource = null;
//     }

//     // Clear timers
//     if (this.keepAliveInterval) {
//       clearInterval(this.keepAliveInterval);
//       this.keepAliveInterval = null;
//     }

//     if (this.reconnectTimeout) {
//       clearTimeout(this.reconnectTimeout);
//       this.reconnectTimeout = null;
//     }
//   }

//   public disconnect() {
//     console.log('[FirebaseSSE] Disconnecting');
//     this.cleanup();
//   }
// }

// export const FirebaseSSE = new FirebaseSSEListener();
