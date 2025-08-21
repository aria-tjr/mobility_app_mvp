class TelemetryProcessor {
  constructor() {
    this.processors = new Map();
  }

  processTelemetry(telemetryData) {
    // Process and enhance telemetry data
    const processed = {
      ...telemetryData,
      timestamp: Date.now(),
      processed: true
    };

    // Add motion analysis
    if (telemetryData.speed !== undefined) {
      processed.motionState = this.analyzeMotion(telemetryData);
    }

    return processed;
  }

  analyzeMotion(telemetryData) {
    const { speed, acceleration } = telemetryData;
    
    if (speed < 0.5) {
      return 'stopped';
    } else if (speed < 5) {
      return 'slow_moving';
    } else if (acceleration > 2) {
      return 'accelerating';
    } else if (acceleration < -2) {
      return 'decelerating';
    } else {
      return 'steady_moving';
    }
  }

  addProcessor(name, processor) {
    this.processors.set(name, processor);
  }

  getProcessor(name) {
    return this.processors.get(name);
  }
}

module.exports = TelemetryProcessor;
