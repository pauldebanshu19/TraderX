interface Window {
  ethereum?: {
    isMetaMask?: boolean;
    request: (args: { method: string; params?: any[] }) => Promise<any>;
    on: (eventName: string, handler: (...args: any[]) => void) => void;
    removeAllListeners: () => void;
  };
}
