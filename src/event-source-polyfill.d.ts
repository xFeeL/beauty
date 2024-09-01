declare module 'event-source-polyfill' {
    export class EventSourcePolyfill extends EventTarget {
      static readonly CONNECTING: number;
      static readonly OPEN: number;
      static readonly CLOSED: number;
  
      constructor(url: string, eventSourceInitDict?: EventSourceInit);
  
      url: string;
      withCredentials: boolean;
      readyState: number;
  
      onopen: ((this: EventSourcePolyfill, ev: MessageEvent) => any) | null;
      onmessage: ((this: EventSourcePolyfill, ev: MessageEvent) => any) | null;
      onerror: ((this: EventSourcePolyfill, ev: MessageEvent) => any) | null;
  
      close(): void;
    }
  
    export const NativeEventSource: typeof EventSourcePolyfill;
  }
  