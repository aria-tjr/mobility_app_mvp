// Socket.IO service for Vehicle Simulator communication
import io from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.eventListeners = new Map();
  }

  // Connect to Vehicle Simulator
  connect() {
    if (this.socket && this.isConnected) {
      return this.socket;
    }

    try {
      this.socket = io('http://localhost:3002', {
        transports: ['websocket'],
        upgrade: false,
        timeout: 10000,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      this.setupEventListeners();
      return this.socket;
    } catch (error) {
      console.error('Failed to create socket connection:', error);
      throw error;
    }
  }

  // Setup event listeners
  setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('🔌 Connected to Vehicle Simulator');
      this.isConnected = true;
      this.emit('dashboard-connected', { timestamp: new Date().toISOString() });
    });

    this.socket.on('disconnect', () => {
      console.log('🔌 Disconnected from Vehicle Simulator');
      this.isConnected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('🔌 Connection error:', error);
      this.isConnected = false;
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log(`🔌 Reconnected to Vehicle Simulator (attempt ${attemptNumber})`);
      this.isConnected = true;
    });

    this.socket.on('reconnect_error', (error) => {
      console.error('🔌 Reconnection error:', error);
    });

    // Vehicle events
    this.socket.on('vehicles-updated', (data) => {
      console.log('🚗 Vehicles updated:', data);
      this.triggerEvent('vehicles-updated', data);
    });

    this.socket.on('telemetry-update', (data) => {
      console.log('📊 Telemetry update:', data);
      this.triggerEvent('telemetry-update', data);
    });

    this.socket.on('bulk-telemetry-update', (data) => {
      console.log('📊 Bulk telemetry update:', data);
      this.triggerEvent('bulk-telemetry-update', data);
    });

    // EIC Demo events
    this.socket.on('eic-demo-event', (data) => {
      console.log('🎬 EIC Demo event:', data);
      this.triggerEvent('eic-demo-event', data);
    });

    // Performance events
    this.socket.on('performance-report', (data) => {
      console.log('📊 Performance report:', data);
      this.triggerEvent('performance-report', data);
    });

    // Error events
    this.socket.on('error', (error) => {
      console.error('🔌 Socket error:', error);
      this.triggerEvent('error', error);
    });
  }

  // Emit event to server
  emit(event, data) {
    if (this.socket && this.isConnected) {
      this.socket.emit(event, data);
    } else {
      console.warn('Socket not connected, cannot emit event:', event);
    }
  }

  // Add event listener
  on(event, callback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event).push(callback);
  }

  // Remove event listener
  off(event, callback) {
    if (this.eventListeners.has(event)) {
      const listeners = this.eventListeners.get(event);
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  // Trigger event for local listeners
  triggerEvent(event, data) {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  // Disconnect socket
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.eventListeners.clear();
    }
  }

  // Get connection status
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      socketId: this.socket?.id,
    };
  }

  // Send command to Vehicle Simulator
  sendCommand(command, data = {}) {
    this.emit('dashboard-command', {
      command,
      data,
      timestamp: new Date().toISOString(),
    });
  }

  // Request vehicle data
  requestVehicles() {
    this.sendCommand('get-vehicles');
  }

  // Request telemetry data
  requestTelemetry(vehicleId) {
    this.sendCommand('get-telemetry', { vehicleId });
  }

  // Start EIC Demo scenario
  startEICDemo() {
    this.sendCommand('start-eic-demo');
  }

  // Stop EIC Demo scenario
  stopEICDemo() {
    this.sendCommand('stop-eic-demo');
  }
}

export default new SocketService();
