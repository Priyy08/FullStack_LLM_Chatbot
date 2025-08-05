// class WebSocketService {
//   constructor() {
//     this.socket = null;
//     this.messageHandler = null;
//   }

//   connect(chatId, token, onMessage) {
//     if (this.socket && this.socket.readyState === WebSocket.OPEN) {
//       this.disconnect();
//     }
    
//     // --- THIS IS THE CRITICAL FIX ---
//     // Get the base HTTP/HTTPS URL from environment variables
//     const httpBaseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';
//     // Convert http -> ws and https -> wss for the WebSocket protocol
//     const wsBaseUrl = httpBaseUrl.replace(/^http/, 'ws');

//     const url = `${wsBaseUrl}/ws/${chatId}?token=${token}`;
//     console.log("Connecting to WebSocket at:", url); // For debugging
    
//     this.socket = new WebSocket(url);
//     this.messageHandler = onMessage;

//     this.socket.onopen = () => {
//       console.log('WebSocket connected');
//     };

//     this.socket.onmessage = (event) => {
//       if (this.messageHandler) {
//         const message = JSON.parse(event.data);
//         this.messageHandler(message);
//       }
//     };

//     this.socket.onclose = (event) => {
//       console.log('WebSocket disconnected:', event.reason);
//       this.socket = null;
//     };

//     this.socket.onerror = (error) => {
//       console.error('WebSocket error:', error);
//     };
//   }

//   sendMessage(message) {
//     if (this.socket && this.socket.readyState === WebSocket.OPEN) {
//       this.socket.send(message);
//     } else {
//       console.error('WebSocket is not connected.');
//     }
//   }

//   disconnect() {
//     if (this.socket) {
//       this.socket.close();
//       this.socket = null;
//     }
//   }
// }

// export const webSocketService = new WebSocketService();

class WebSocketService {
  constructor() {
    this.socket = null;
    this.messageHandler = null;
  }

  connect(chatId, token, onMessage) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.disconnect();
    }
    
    const httpBaseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';
    const wsBaseUrl = httpBaseUrl.replace(/^http/, 'ws');
    const url = `${wsBaseUrl}/ws/${chatId}?token=${token}`;
    
    console.log(`[WebSocket] Attempting to connect to: ${url}`);
    
    this.socket = new WebSocket(url);
    this.messageHandler = onMessage;

    this.socket.onopen = () => {
      console.log(`[WebSocket] ✅ Connection opened successfully for chat ID: ${chatId}`);
    };

    this.socket.onmessage = (event) => {
      // --- DETAILED MESSAGE LOGGING ---
      console.log("[WebSocket] 📩 Message received from server.");
      
      try {
        const message = JSON.parse(event.data);
        console.log("[WebSocket] 🔍 Parsed message object:", message);

        if (this.messageHandler) {
          console.log(`[WebSocket] 📢 Calling message handler to update Redux store for role: '${message.role}'.`);
          this.messageHandler(message);
        } else {
          console.warn("[WebSocket] ⚠️ Message received, but no message handler is set.");
        }

      } catch (e) {
        console.error("[WebSocket] ❌ Failed to parse JSON from WebSocket message:", e);
        console.error("[WebSocket] Raw data received:", event.data);
      }
      // --- END OF DETAILED LOGGING ---
    };

    this.socket.onclose = (event) => {
      console.log(`[WebSocket] 🔌 Connection closed. Reason: ${event.reason || 'No reason specified'}. Code: ${event.code}`);
      this.socket = null;
    };

    this.socket.onerror = (error) => {
      // The onerror event doesn't give specific details, but it always precedes onclose.
      console.error('[WebSocket] ❌ An error occurred with the WebSocket connection.', error);
    };
  }

  sendMessage(message) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      console.log(`[WebSocket] 📤 Sending message to server: "${message}"`);
      this.socket.send(message);
    } else {
      console.error('[WebSocket] ⚠️ Attempted to send a message, but the socket is not connected.');
    }
  }

  disconnect() {
    if (this.socket) {
      console.log('[WebSocket] 🛑 Manually disconnecting...');
      this.socket.close(1000, "Client disconnected"); // Code 1000 for normal closure
      this.socket = null;
    }
  }
}

export const webSocketService = new WebSocketService();