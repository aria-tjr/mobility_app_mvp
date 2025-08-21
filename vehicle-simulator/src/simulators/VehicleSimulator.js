class VehicleSimulator {
  constructor() {
    this.vehicles = new Map();
    this.isRunning = false;
    this.updateInterval = null;
    this.scenarios = new Map();
    this.telemetryCallbacks = [];
  }

  addVehicle(vehicleId, config = {}) {
    const vehicle = {
      id: vehicleId,
      location: config.location || { lat: 40.7128, lng: -74.0060 },
      speed: config.speed || 0,
      battery: config.battery || 100,
      status: config.status || 'available',
      lastUpdate: Date.now(),
      rideId: config.rideId || null,
      pauseState: false,
      pauseStartTime: null,
      motionHistory: [],
      ...config
    };
    
    this.vehicles.set(vehicleId, vehicle);
    return vehicle;
  }

  removeVehicle(vehicleId) {
    return this.vehicles.delete(vehicleId);
  }

  updateVehicle(vehicleId, updates) {
    const vehicle = this.vehicles.get(vehicleId);
    if (vehicle) {
      Object.assign(vehicle, updates, { lastUpdate: Date.now() });
      return vehicle;
    }
    return null;
  }

  getAllVehicles() {
    return Array.from(this.vehicles.values());
  }

  // Smart Pause & Resume simulation methods
  simulatePause(vehicleId, duration = 5000) {
    const vehicle = this.vehicles.get(vehicleId);
    if (!vehicle) return false;

    vehicle.pauseState = true;
    vehicle.pauseStartTime = Date.now();
    vehicle.speed = 0;
    vehicle.acceleration = 0;
    vehicle.status = 'paused';

    // Auto-resume after duration
    setTimeout(() => {
      if (vehicle.pauseState) {
        this.simulateResume(vehicleId);
      }
    }, duration);

    return true;
  }

  simulateResume(vehicleId) {
    const vehicle = this.vehicles.get(vehicleId);
    if (!vehicle) return false;

    vehicle.pauseState = false;
    vehicle.pauseStartTime = null;
    vehicle.speed = Math.random() * 20 + 10; // 10-30 km/h
    vehicle.acceleration = Math.random() * 2 + 0.5; // 0.5-2.5 m/s²
    vehicle.status = 'in_use';

    return true;
  }

  // Add telemetry callback for real-time processing
  onTelemetryUpdate(callback) {
    this.telemetryCallbacks.push(callback);
  }

  // Simulate Smart Pause & Resume scenarios
  loadScenario(scenarioName, vehicles) {
    const scenario = {
      name: scenarioName,
      vehicles: vehicles,
      currentStep: 0,
      isRunning: false
    };

    this.scenarios.set(scenarioName, scenario);
    return scenario;
  }

  // EIC Demo Scenario: Smart Pause & Resume showcase
  startEICDemo() {
    const demoVehicles = [
      { id: 'demo_vehicle_1', location: { lat: 40.7128, lng: -74.0060 }, status: 'available' },
      { id: 'demo_vehicle_2', location: { lat: 40.7140, lng: -74.0070 }, status: 'available' },
      { id: 'demo_vehicle_3', location: { lat: 40.7130, lng: -74.0080 }, status: 'available' }
    ];

    demoVehicles.forEach(vehicle => {
      this.addVehicle(vehicle.id, vehicle);
    });

    const demoScenario = this.loadScenario('eic_demo', demoVehicles);
    demoScenario.isRunning = true;

    // Demo sequence: 60-second innovation showcase
    this.runEICDemoSequence(demoScenario);
  }

  runEICDemoSequence(scenario) {
    const steps = [
      { time: 0, action: 'start_ride', vehicleId: 'demo_vehicle_1' },
      { time: 5000, action: 'pause_ride', vehicleId: 'demo_vehicle_1' },
      { time: 12000, action: 'extend_pause', vehicleId: 'demo_vehicle_1' },
      { time: 17000, action: 'resume_ride', vehicleId: 'demo_vehicle_1' },
      { time: 24000, action: 'security_alert', vehicleId: 'demo_vehicle_2' },
      { time: 34000, action: 'auto_resume', vehicleId: 'demo_vehicle_1' },
      { time: 44000, action: 'end_ride', vehicleId: 'demo_vehicle_1' },
      { time: 54000, action: 'demo_complete', vehicleId: 'demo_vehicle_1' }
    ];

    steps.forEach(step => {
      setTimeout(() => {
        this.executeDemoStep(step.action, step.vehicleId);
      }, step.time);
    });
  }

  executeDemoStep(action, vehicleId) {
    switch (action) {
      case 'start_ride':
        this.updateVehicle(vehicleId, { status: 'in_use', speed: 15, rideId: 'demo_ride_1' });
        break;
      case 'pause_ride':
        this.simulatePause(vehicleId, 5000); // 5 seconds for MVP demo
        break;
      case 'extend_pause':
        // Simulate extend pause upsell
        const vehicle = this.vehicles.get(vehicleId);
        if (vehicle && vehicle.pauseState) {
          vehicle.pauseStartTime = Date.now() - 2000; // Add 2 seconds
        }
        break;
      case 'resume_ride':
        this.simulateResume(vehicleId);
        break;
      case 'security_alert':
        // Simulate unauthorized movement
        this.updateVehicle(vehicleId, { 
          status: 'security_alert', 
          speed: 8, 
          acceleration: 1.2 
        });
        break;
      case 'auto_resume':
        this.simulateResume(vehicleId);
        break;
      case 'end_ride':
        this.updateVehicle(vehicleId, { 
          status: 'available', 
          speed: 0, 
          rideId: null,
          pauseState: false 
        });
        break;
      case 'demo_complete':
        console.log('EIC Demo completed successfully!');
        break;
    }

    // Emit telemetry update
    this.emitTelemetryUpdate(vehicleId);
  }

  // Enhanced telemetry simulation
  generateTelemetryData(vehicle) {
    const now = Date.now();
    const baseLocation = vehicle.location;
    
    // Simulate realistic movement patterns
    let newSpeed = vehicle.speed;
    let newAcceleration = vehicle.acceleration;
    let newLocation = { ...baseLocation };

    if (vehicle.status === 'in_use' && !vehicle.pauseState) {
      // Simulate gradual speed changes
      const speedChange = (Math.random() - 0.5) * 2; // ±1 km/h
      newSpeed = Math.max(0, Math.min(35, vehicle.speed + speedChange));
      
      // Simulate acceleration based on speed change
      newAcceleration = speedChange * 0.5; // Convert to m/s²
      
      // Simulate GPS movement
      if (newSpeed > 0) {
        const distance = (newSpeed / 3600) * 1000; // Convert km/h to m/s
        const bearing = Math.random() * 360; // Random direction
        const latChange = (distance * Math.cos(bearing * Math.PI / 180)) / 111000; // Approximate lat change
        const lngChange = (distance * Math.sin(bearing * Math.PI / 180)) / (111000 * Math.cos(baseLocation.lat * Math.PI / 180));
        
        newLocation.lat += latChange;
        newLocation.lng += lngChange;
      }
    } else if (vehicle.pauseState) {
      // During pause, minimal movement
      newSpeed = 0;
      newAcceleration = 0;
      
      // Simulate slight GPS drift (realistic for stationary vehicles)
      newLocation.lat += (Math.random() - 0.5) * 0.00001;
      newLocation.lng += (Math.random() - 0.5) * 0.00001;
    }

    // Simulate battery drain
    const batteryDrain = vehicle.status === 'in_use' ? 0.1 : 0.01;
    const newBattery = Math.max(0, vehicle.battery - batteryDrain);

    // Store motion history for pattern analysis
    const telemetryData = {
      speed: newSpeed,
      acceleration: newAcceleration,
      gps: newLocation,
      battery: newBattery,
      timestamp: now,
      userAction: vehicle.pauseState ? 'pause' : null,
      rideId: vehicle.rideId,
      status: vehicle.status
    };

    if (!vehicle.motionHistory) {
      vehicle.motionHistory = [];
    }
    vehicle.motionHistory.push(telemetryData);

    // Keep only last 100 data points
    if (vehicle.motionHistory.length > 100) {
      vehicle.motionHistory.shift();
    }

    return telemetryData;
  }

  // Emit telemetry updates to registered callbacks
  emitTelemetryUpdate(vehicleId) {
    const vehicle = this.vehicles.get(vehicleId);
    if (!vehicle) return;

    const telemetryData = this.generateTelemetryData(vehicle);
    
    // Update vehicle with new telemetry
    this.updateVehicle(vehicleId, {
      location: telemetryData.gps,
      speed: telemetryData.speed,
      acceleration: telemetryData.acceleration,
      battery: telemetryData.battery
    });

    // Notify all telemetry callbacks
    this.telemetryCallbacks.forEach(callback => {
      callback(vehicleId, telemetryData);
    });
  }

  start() {
    this.isRunning = true;
    this.updateInterval = setInterval(() => {
      this.updateAllVehicles();
    }, 1000);
  }

  stop() {
    this.isRunning = false;
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  updateAllVehicles() {
    for (const vehicle of this.vehicles.values()) {
      // Emit telemetry updates for all vehicles
      this.emitTelemetryUpdate(vehicle.id);
    }
  }

  // Get vehicle status for dashboard
  getVehicleStatus(vehicleId) {
    const vehicle = this.vehicles.get(vehicleId);
    if (!vehicle) return null;

    return {
      id: vehicle.id,
      status: vehicle.status,
      location: vehicle.location,
      speed: vehicle.speed,
      battery: vehicle.battery,
      pauseState: vehicle.pauseState,
      rideId: vehicle.rideId,
      lastUpdate: vehicle.lastUpdate,
      motionHistory: vehicle.motionHistory ? vehicle.motionHistory.length : 0
    };
  }

  // Get fleet overview for dashboard
  getFleetOverview() {
    const vehicles = Array.from(this.vehicles.values());
    
    return {
      total: vehicles.length,
      available: vehicles.filter(v => v.status === 'available').length,
      inUse: vehicles.filter(v => v.status === 'in_use').length,
      paused: vehicles.filter(v => v.pauseState).length,
      maintenance: vehicles.filter(v => v.status === 'maintenance').length,
      averageBattery: vehicles.reduce((sum, v) => sum + v.battery, 0) / vehicles.length,
      activeScenarios: Array.from(this.scenarios.values()).filter(s => s.isRunning).length
    };
  }
}

module.exports = VehicleSimulator;
