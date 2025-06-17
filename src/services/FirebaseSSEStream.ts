// firebaseSSEListener.ts
import EventSource from 'react-native-sse';
import { FIREBASE_URL } from '../utils/config';

export type SSEEvent = {
  path: string;
  data: any;
  streamId: string; // Added to identify which stream the event came from
};

type ListenerOptions = {
  onData: (event: SSEEvent) => void;
  onError?: (error: any) => void;
  onMaxRetriesReached?: (streamId: string) => void;
  onConnected?: (streamId: string) => void;
  onDisconnected?: (streamId: string) => void;
};

type StreamConfig = {
  url: string;
  streamId: string;
  options: ListenerOptions;
  maxRetries?: number;
  retryDelay?: number;
  keepAliveCheckInterval?: number;
  maxInactivityPeriod?: number;
};

type StreamMeta = {
  config: StreamConfig;
  source: EventSource;
  retryCount: number;
  lastEventTimestamp: number;
  keepAliveInterval?: NodeJS.Timeout;
  reconnectTimeout?: NodeJS.Timeout;
  isConnected: boolean;
  connectionPromise?: Promise<void>;
};

class FirebaseSSEListener {
  private readonly baseUrl: string;
  private activeStreams: Map<string, StreamMeta> = new Map();

  // Default configuration
  private readonly defaultConfig = {
    maxRetries: 5,
    retryDelay: 2000,
    connectionTimeout: 60 * 1000,
    keepAliveCheckInterval: 60 * 1000, // 1 minute
    maxInactivityPeriod: 5 * 60 * 1000, // 5 minutes
  };

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || FIREBASE_URL;
  }

  /**
   * Listen to payments events from Firebase
   */
  // public async listenToPaymentEvents(
  //   transactionId: string,
  //   options: ListenerOptions
  // ): Promise<void> {
  //   const streamId = `payment`;
  //   const streamUrl = `${this.baseUrl}/public/paymentUpdate/${transactionId}.json`;

  //   console.log('🔥 Listening to payment events:', transactionId);

  //   const config: StreamConfig = {
  //     url: streamUrl,
  //     streamId,
  //     options,
  //   };

  //   await this.connectToStream(config);
  // }

  /**
   * Listen to transactions events from Firebase
   */
  public async listenToTransactionEvents(
    transactionId: string,
    options: ListenerOptions
  ): Promise<void> {
    const streamId = `transaction-messages`;
    const streamUrl = `${this.baseUrl}/public/transaction-messages/${transactionId}.json`;

    console.log('🔥 Listening to transaction events:', transactionId);

    const config: StreamConfig = {
      url: streamUrl,
      streamId,
      options,
    };

    await this.connectToStream(config);
  }

  /**
   * Listen to authentication events from Firebase
   */
  public async listenToAuthnEvents(
    sessionId: string,
    options: ListenerOptions
  ): Promise<void> {
    const streamId = `login_success`;
    const streamUrl = `${this.baseUrl}/public/login_success/authn_${sessionId}.json`;

    const config: StreamConfig = {
      url: streamUrl,
      streamId,
      options,
    };

    await this.connectToStream(config);
  }

  public async listenToCloseTabEvents(
    transactionId: string,
    options: ListenerOptions
  ): Promise<void> {
    const streamId = `close_tab`;
    const streamUrl = `${this.baseUrl}/public/close_tab/custom_tab_${transactionId}.json`;

    const config: StreamConfig = {
      url: streamUrl,
      streamId,
      options,
    };

    await this.connectToStream(config);
  }

  /**
   * Generic method to connect to any Firebase SSE stream
   */
  public async connectToCustomStream(
    streamId: string,
    url: string,
    options: ListenerOptions,
    customConfig?: Partial<StreamConfig>
  ): Promise<string> {
    console.log('🔥 Connecting to custom stream:', streamId, url);

    const config: StreamConfig = {
      url,
      streamId,
      options,
      ...customConfig,
    };

    await this.connectToStream(config);
    return streamId;
  }

  /**
   * Connect to a stream with the given configuration
   */
  private async connectToStream(config: StreamConfig): Promise<void> {
    const { streamId } = config;

    // If stream already exists, disconnect it first
    if (this.activeStreams.has(streamId)) {
      await this.disconnectStream(streamId);
    }

    // Create stream metadata
    const streamMeta: StreamMeta = {
      config,
      source: null as any, // Will be set in connectToEventSource
      retryCount: 0,
      lastEventTimestamp: Date.now(),
      isConnected: false,
    };

    this.activeStreams.set(streamId, streamMeta);

    // Start connection
    streamMeta.connectionPromise = this.connectToEventSource(streamMeta);

    try {
      await streamMeta.connectionPromise;
    } catch (error) {
      console.error(
        `[FirebaseSSE] Failed to connect stream ${streamId}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Connect to an event source and set up event listeners
   */
  private async connectToEventSource(streamMeta: StreamMeta): Promise<void> {
    const { config } = streamMeta;
    const { streamId, url, options } = config;
    const maxRetries = config.maxRetries || this.defaultConfig.maxRetries;

    if (streamMeta.retryCount >= maxRetries) {
      console.error(
        `[FirebaseSSE] Max retries reached for stream ${streamId}, giving up`
      );
      options.onMaxRetriesReached?.(streamId);
      this.cleanupStream(streamId);
      return;
    }

    return new Promise((resolve, reject) => {
      // Set up connection timeout
      const timeout = setTimeout(() => {
        reject(new Error(`Connection timeout exceeded for stream ${streamId}`));
      }, this.defaultConfig.connectionTimeout);

      try {
        const headers: Record<string, string> = {
          'Accept': 'text/event-stream',
          'Cache-Control': 'no-cache',
        };

        const eventSource = new EventSource(url, { headers });
        streamMeta.source = eventSource;

        // Set up event handlers
        this.setupEventHandlers(
          streamMeta,
          () => {
            clearTimeout(timeout);
            streamMeta.isConnected = true;
            options.onConnected?.(streamId);
            resolve();
          },
          (error) => {
            clearTimeout(timeout);
            reject(error);
          }
        );
      } catch (error) {
        clearTimeout(timeout);
        reject(error);
        this.scheduleReconnect(streamMeta);
      }
    });
  }

  /**
   * Set up all event handlers for the event source
   */
  private setupEventHandlers(
    streamMeta: StreamMeta,
    onConnected: () => void,
    onError: (error: any) => void
  ) {
    const { source, config } = streamMeta;
    const { streamId, options } = config;

    if (!source) return;

    // Connection established
    source.addEventListener('open', () => {
      streamMeta.retryCount = 0;
      streamMeta.lastEventTimestamp = Date.now();
      console.log(`[FirebaseSSE] Stream ${streamId} connected`);
      onConnected();
      // Start keep-alive monitoring
      this.startKeepAliveMonitor(streamMeta);
    });

    // Handle connection errors
    source.addEventListener('error', (error) => {
      console.error(
        `[FirebaseSSE] Stream ${streamId} connection error:`,
        error
      );
      streamMeta.isConnected = false;
      options.onError?.(error);
      options.onDisconnected?.(streamId);
      onError(error);
      this.scheduleReconnect(streamMeta);
    });

    // Handle connection close
    source.addEventListener('close', (event) => {
      console.log(`[FirebaseSSE] Stream ${streamId} connection closed:`, event);
      streamMeta.isConnected = false;
      options.onDisconnected?.(streamId);
      onError(new Error('Connection closed'));
      this.scheduleReconnect(streamMeta);
    });

    // Handle Firebase-specific events
    this.setupDataEventHandlers(streamMeta);
  }

  /**
   * Set up handlers for data events
   */
  private setupDataEventHandlers(streamMeta: StreamMeta) {
    const { source, config } = streamMeta;
    const { streamId, options } = config;

    if (!source) return;

    const handleEvent = (event: MessageEvent) => {
      console.log(`🔥 Event from ${streamId}:`, event);

      // Update last event timestamp
      streamMeta.lastEventTimestamp = Date.now();

      if (!event.data) return;

      try {
        const parsed = JSON.parse(event.data);
        if (parsed.data == null) return;

        const sseEvent: SSEEvent = {
          path: parsed.path,
          data: parsed.data,
          streamId,
        };
        options.onData(sseEvent);
      } catch (err) {
        console.log(
          `[FirebaseSSE] Failed to parse event data for ${streamId}`,
          err
        );
      }
    };

    // Listen for specific Firebase event types
    //@ts-ignore
    source.addEventListener('put', handleEvent);
    //@ts-ignore
    source.addEventListener('patch', handleEvent);
    //@ts-ignore
    source.addEventListener('message', handleEvent);
  }

  /**
   * Start monitoring for connection activity
   */
  private startKeepAliveMonitor(streamMeta: StreamMeta): void {
    const { config } = streamMeta;
    const { streamId } = config;
    const keepAliveInterval =
      config.keepAliveCheckInterval ||
      this.defaultConfig.keepAliveCheckInterval;
    const maxInactivityPeriod =
      config.maxInactivityPeriod || this.defaultConfig.maxInactivityPeriod;

    // Clear any existing interval
    if (streamMeta.keepAliveInterval) {
      clearInterval(streamMeta.keepAliveInterval);
    }

    // Check connection health periodically
    streamMeta.keepAliveInterval = setInterval(() => {
      const now = Date.now();
      const inactivityTime = now - streamMeta.lastEventTimestamp;

      // If no events received for too long, reconnect
      if (inactivityTime > maxInactivityPeriod) {
        console.log(
          `[FirebaseSSE] Stream ${streamId} - No events for ${inactivityTime / 1000}s, reconnecting...`
        );
        this.scheduleReconnect(streamMeta);
      }
    }, keepAliveInterval);
  }

  /**
   * Schedule a reconnection attempt with exponential backoff
   */
  private scheduleReconnect(streamMeta: StreamMeta): void {
    const { config } = streamMeta;
    const { streamId, options } = config;
    const maxRetries = config.maxRetries || this.defaultConfig.maxRetries;
    const baseRetryDelay = config.retryDelay || this.defaultConfig.retryDelay;

    // Clean up existing connection
    this.cleanupStreamConnection(streamMeta);

    if (streamMeta.retryCount >= maxRetries) {
      console.error(
        `[FirebaseSSE] Max retries reached for stream ${streamId}, giving up`
      );
      options.onMaxRetriesReached?.(streamId);
      this.cleanupStream(streamId);
      return;
    }

    // Calculate backoff delay
    const delay = Math.min(
      baseRetryDelay * Math.pow(2, streamMeta.retryCount),
      30000
    );

    console.log(`🔥 Reconnecting stream ${streamId}`);
    console.log(
      `[FirebaseSSE] Stream ${streamId} reconnecting in ${delay}ms (attempt ${streamMeta.retryCount + 1}/${maxRetries})`
    );

    // Schedule reconnection
    streamMeta.reconnectTimeout = setTimeout(async () => {
      streamMeta.retryCount++;

      try {
        await this.connectToEventSource(streamMeta);
        console.log(`[FirebaseSSE] Stream ${streamId} reconnection successful`);
      } catch (error) {
        console.error(
          `[FirebaseSSE] Stream ${streamId} reconnection failed:`,
          error
        );
        // Next retry will be scheduled by error handler
      }
    }, delay);
  }

  /**
   * Clean up connection resources for a stream without removing it from activeStreams
   */
  private cleanupStreamConnection(streamMeta: StreamMeta) {
    try {
      if (streamMeta.source) {
        streamMeta.source.close();
        streamMeta.source = null as any;
      }
    } catch (error) {
      console.warn(
        `[FirebaseSSE] Error closing stream ${streamMeta.config.streamId}:`,
        error
      );
    }

    if (streamMeta.keepAliveInterval) {
      clearInterval(streamMeta.keepAliveInterval);
      streamMeta.keepAliveInterval = undefined;
    }

    if (streamMeta.reconnectTimeout) {
      clearTimeout(streamMeta.reconnectTimeout);
      streamMeta.reconnectTimeout = undefined;
    }

    streamMeta.isConnected = false;
  }

  /**
   * Clean up and remove a specific stream
   */
  private cleanupStream(streamId: string) {
    const streamMeta = this.activeStreams.get(streamId);
    if (!streamMeta) return;

    this.cleanupStreamConnection(streamMeta);
    this.activeStreams.delete(streamId);

    console.log(`[FirebaseSSE] Stream ${streamId} cleaned up`);
  }

  /**
   * Disconnect a specific stream
   */
  public async disconnectStream(streamId: string): Promise<void> {
    console.log(`[FirebaseSSE] Disconnecting stream ${streamId}`);
    const streamMeta = this.activeStreams.get(streamId);

    if (streamMeta) {
      streamMeta.config.options.onDisconnected?.(streamId);
    }

    this.cleanupStream(streamId);
  }

  /**
   * Disconnect all streams
   */
  public async disconnectAll(): Promise<void> {
    console.log('[FirebaseSSE] Disconnecting all streams');

    const streamIds = Array.from(this.activeStreams.keys());
    await Promise.all(
      streamIds.map((streamId) => this.disconnectStream(streamId))
    );
  }

  /**
   * Get connection status for a specific stream
   */
  public isStreamConnected(streamId: string): boolean {
    const streamMeta = this.activeStreams.get(streamId);
    return streamMeta?.isConnected || false;
  }

  /**
   * Get retry count for a specific stream
   */
  public getStreamRetryCount(streamId: string): number {
    const streamMeta = this.activeStreams.get(streamId);
    return streamMeta?.retryCount || 0;
  }

  /**
   * Get all active stream IDs
   */
  public getActiveStreamIds(): string[] {
    return Array.from(this.activeStreams.keys());
  }

  /**
   * Get active streams count
   */
  public getActiveStreamsCount(): number {
    return this.activeStreams.size;
  }

  /**
   * Get detailed status of all streams
   */
  public getStreamsStatus(): Record<
    string,
    { isConnected: boolean; retryCount: number; lastEventTime: Date }
  > {
    const status: Record<
      string,
      { isConnected: boolean; retryCount: number; lastEventTime: Date }
    > = {};

    this.activeStreams.forEach((streamMeta, streamId) => {
      status[streamId] = {
        isConnected: streamMeta.isConnected,
        retryCount: streamMeta.retryCount,
        lastEventTime: new Date(streamMeta.lastEventTimestamp),
      };
    });

    return status;
  }

  /**
   * Reconnect a specific stream manually
   */
  public async reconnectStream(streamId: string): Promise<void> {
    const streamMeta = this.activeStreams.get(streamId);
    if (!streamMeta) {
      throw new Error(`Stream ${streamId} not found`);
    }

    console.log(`[FirebaseSSE] Manually reconnecting stream ${streamId}`);

    // Reset retry count for manual reconnection
    streamMeta.retryCount = 0;

    // Clean up existing connection and reconnect
    this.cleanupStreamConnection(streamMeta);
    await this.connectToEventSource(streamMeta);
  }

  /**
   * Update stream configuration
   */
  public updateStreamConfig(
    streamId: string,
    newConfig: Partial<StreamConfig>
  ): boolean {
    const streamMeta = this.activeStreams.get(streamId);
    if (!streamMeta) {
      return false;
    }

    // Update configuration (excluding url and streamId which shouldn't change)
    const { ...updatableConfig } = newConfig;
    Object.assign(streamMeta.config, updatableConfig);

    return true;
  }
}

export const FirebaseSSE = new FirebaseSSEListener();
