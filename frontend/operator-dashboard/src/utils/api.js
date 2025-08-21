// API service for Smart Mobility Platform
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Generic request method
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // Health check
  async healthCheck() {
    return this.request('/health');
  }

  // Rides API
  async getRides() {
    return this.request('/api/rides');
  }

  async createRide(rideData) {
    return this.request('/api/rides', {
      method: 'POST',
      body: JSON.stringify(rideData),
    });
  }

  async pauseRide(rideId, pauseData) {
    return this.request(`/api/rides/${rideId}/pause`, {
      method: 'POST',
      body: JSON.stringify(pauseData),
    });
  }

  async resumeRide(rideId) {
    return this.request(`/api/rides/${rideId}/resume`, {
      method: 'POST',
    });
  }

  // Telemetry API
  async getTelemetry(vehicleId) {
    return this.request(`/api/telemetry/${vehicleId}`);
  }

  async simulateTelemetry(simulationType) {
    return this.request('/api/telemetry/simulate/' + simulationType, {
      method: 'POST',
    });
  }

  // Vehicles API
  async getVehicles() {
    return this.request('/api/vehicles');
  }

  async getVehicleStatus(vehicleId) {
    return this.request(`/api/vehicles/${vehicleId}/status`);
  }

  // Users API
  async getUsers() {
    return this.request('/api/users');
  }

  async getUserProfile(userId) {
    return this.request(`/api/users/${userId}`);
  }

  // Analytics API
  async getAnalytics(timeRange = '24h') {
    return this.request(`/api/analytics?range=${timeRange}`);
  }

  async getSmartPauseMetrics() {
    return this.request('/api/analytics/smart-pause');
  }

  // EIC Demo API
  async startEICDemo() {
    return this.request('/api/eic-demo/start', {
      method: 'POST',
    });
  }

  async getEICDemoStatus() {
    return this.request('/api/eic-demo/status');
  }
}

export default new ApiService();
