const config = {
  backendUrl: process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:8000',
  wsUrl: process.env.EXPO_PUBLIC_WEBSOCKET_URL || 'ws://localhost:8000/ws',
};

export default config;
