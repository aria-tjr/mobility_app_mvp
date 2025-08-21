/**
 * Smart Pause & Resume Engine
 * 
 * Core Innovation Component for EIC Accelerator
 * 
 * This engine implements proprietary motion-recognition algorithms that:
 * 1. Distinguish between legitimate user pauses and unauthorized movement
 * 2. Automatically resume rides when motion is detected
 * 3. Apply dynamic billing rates during pause states
 * 4. Prevent theft through intelligent motion analysis
 */

class SmartPauseEngine {
  constructor() {
    this.motionThresholds = {
      speed: 0.5, // km/h - below this is considered stopped
      acceleration: 0.1, // m/s² - minimum acceleration to trigger motion
      timeThreshold: 5000, // 5 seconds to confirm pause state
      pauseMaxDuration: 600000, // 10 minutes maximum pause
      extendPauseThreshold: 5000 // 5 seconds before showing extend pause option
    };
    
    this.billingRates = {
      active: 1.0, // Full rate during active riding
      paused: 0.5, // Half rate during intentional pauses
      traffic: 0.3, // Reduced rate during traffic stops
      unauthorized: 1.5 // Penalty rate for unauthorized movement
    };
    
    this.activePauses = new Map(); // Track active pause sessions
    this.motionHistory = new Map(); // Store motion patterns for ML analysis
  }

  /**
   * Process incoming telemetry data and determine pause/resume actions
   * @param {Object} telemetryData - Vehicle telemetry information
   * @param {string} vehicleId - Unique vehicle identifier
   * @param {string} rideId - Current ride session ID
   * @returns {Object} Pause/resume decision and billing information
   */
  processTelemetry(telemetryData, vehicleId, rideId) {
    const {
      speed,
      acceleration,
      gps,
      battery,
      timestamp,
      userAction
    } = telemetryData;

    // Store motion history for pattern analysis
    this.storeMotionHistory(vehicleId, telemetryData);

    // Detect current motion state
    const motionState = this.detectMotionState(telemetryData);
    
    // Check for existing pause session
    const existingPause = this.activePauses.get(rideId);
    
    let result = {
      action: 'continue',
      pauseState: false,
      billingRate: this.billingRates.active,
      reason: 'normal_operation',
      autoResume: false,
      extendPauseAvailable: false
    };

    // Handle pause initiation
    if (motionState === 'stopped' && !existingPause && userAction === 'pause') {
      result = this.initiatePause(vehicleId, rideId, telemetryData);
    }
    
    // Handle pause continuation
    else if (existingPause && motionState === 'stopped') {
      result = this.continuePause(vehicleId, rideId, telemetryData, existingPause);
    }
    
    // Handle auto-resume
    else if (existingPause && motionState === 'moving') {
      result = this.handleAutoResume(vehicleId, rideId, telemetryData, existingPause);
    }
    
    // Handle unauthorized movement detection
    else if (existingPause && motionState === 'moving' && !userAction) {
      result = this.handleUnauthorizedMovement(vehicleId, rideId, telemetryData, existingPause);
    }

    return result;
  }

  /**
   * Detect motion state based on telemetry data
   * @param {Object} telemetryData - Vehicle telemetry
   * @returns {string} Motion state: 'moving', 'stopped', 'accelerating'
   */
  detectMotionState(telemetryData) {
    const { speed, acceleration } = telemetryData;
    
    if (speed < this.motionThresholds.speed) {
      return 'stopped';
    } else if (acceleration > this.motionThresholds.acceleration) {
      return 'accelerating';
    } else {
      return 'moving';
    }
  }

  /**
   * Initiate a new pause session
   * @param {string} vehicleId - Vehicle identifier
   * @param {string} rideId - Ride session ID
   * @param {Object} telemetryData - Current telemetry
   * @returns {Object} Pause initiation result
   */
  initiatePause(vehicleId, rideId, telemetryData) {
    const pauseSession = {
      vehicleId,
      rideId,
      startTime: Date.now(),
      startLocation: telemetryData.gps,
      pauseType: 'user_initiated',
      billingRate: this.billingRates.paused,
      motionHistory: []
    };

    this.activePauses.set(rideId, pauseSession);

    return {
      action: 'pause_initiated',
      pauseState: true,
      billingRate: this.billingRates.paused,
      reason: 'user_pause',
      autoResume: false,
      extendPauseAvailable: false,
      pauseSession
    };
  }

  /**
   * Continue an existing pause session
   * @param {string} vehicleId - Vehicle identifier
   * @param {string} rideId - Ride session ID
   * @param {Object} telemetryData - Current telemetry
   * @param {Object} pauseSession - Active pause session
   * @returns {Object} Pause continuation result
   */
  continuePause(vehicleId, rideId, telemetryData, pauseSession) {
    const pauseDuration = Date.now() - pauseSession.startTime;
    
    // Check if pause exceeds maximum duration
    if (pauseDuration >= this.motionThresholds.pauseMaxDuration) {
      return this.forceResume(vehicleId, rideId, telemetryData, pauseSession);
    }

    // Check if extend pause option should be shown
    const extendPauseAvailable = pauseDuration >= this.motionThresholds.extendPauseThreshold;

    // Update pause session
    pauseSession.motionHistory.push({
      timestamp: Date.now(),
      location: telemetryData.gps,
      speed: telemetryData.speed
    });

    return {
      action: 'pause_continued',
      pauseState: true,
      billingRate: this.billingRates.paused,
      reason: 'pause_active',
      autoResume: false,
      extendPauseAvailable,
      pauseSession,
      pauseDuration
    };
  }

  /**
   * Handle automatic resume when motion is detected
   * @param {string} vehicleId - Vehicle identifier
   * @param {string} rideId - Ride session ID
   * @param {Object} telemetryData - Current telemetry
   * @param {Object} pauseSession - Active pause session
   * @returns {Object} Auto-resume result
   */
  handleAutoResume(vehicleId, rideId, telemetryData, pauseSession) {
    // Analyze motion pattern to confirm legitimate user action
    const motionAnalysis = this.analyzeMotionPattern(pauseSession.motionHistory);
    
    if (motionAnalysis.isLegitimate) {
      // End pause session
      this.activePauses.delete(rideId);
      
      return {
        action: 'auto_resume',
        pauseState: false,
        billingRate: this.billingRates.active,
        reason: 'motion_detected',
        autoResume: true,
        extendPauseAvailable: false,
        pauseDuration: Date.now() - pauseSession.startTime,
        motionAnalysis
      };
    } else {
      // Potential unauthorized movement
      return this.handleUnauthorizedMovement(vehicleId, rideId, telemetryData, pauseSession);
    }
  }

  /**
   * Handle unauthorized movement detection
   * @param {string} vehicleId - Vehicle identifier
   * @param {string} rideId - Ride session ID
   * @param {Object} telemetryData - Current telemetry
   * @param {Object} pauseSession - Active pause session
   * @returns {Object} Unauthorized movement result
   */
  handleUnauthorizedMovement(vehicleId, rideId, telemetryData, pauseSession) {
    // Log security event
    console.warn(`Unauthorized movement detected for vehicle ${vehicleId}, ride ${rideId}`);
    
    // Apply penalty billing rate
    pauseSession.billingRate = this.billingRates.unauthorized;
    pauseSession.securityFlag = true;
    
    return {
      action: 'security_alert',
      pauseState: true,
      billingRate: this.billingRates.unauthorized,
      reason: 'unauthorized_movement',
      autoResume: false,
      extendPauseAvailable: false,
      pauseSession,
      securityAlert: true
    };
  }

  /**
   * Force resume after maximum pause duration
   * @param {string} vehicleId - Vehicle identifier
   * @param {string} rideId - Ride session ID
   * @param {Object} telemetryData - Current telemetry
   * @param {Object} pauseSession - Active pause session
   * @returns {Object} Force resume result
   */
  forceResume(vehicleId, rideId, telemetryData, pauseSession) {
    this.activePauses.delete(rideId);
    
    return {
      action: 'force_resume',
      pauseState: false,
      billingRate: this.billingRates.active,
      reason: 'max_pause_exceeded',
      autoResume: false,
      extendPauseAvailable: false,
      pauseDuration: this.motionThresholds.pauseMaxDuration
    };
  }

  /**
   * Extend pause duration (user-initiated)
   * @param {string} rideId - Ride session ID
   * @param {number} extensionMinutes - Additional pause time in minutes
   * @returns {Object} Extension result
   */
  extendPause(rideId, extensionMinutes) {
    const pauseSession = this.activePauses.get(rideId);
    
    if (!pauseSession) {
      throw new Error('No active pause session found');
    }

    const maxExtension = 10; // Maximum 10 additional minutes
    const actualExtension = Math.min(extensionMinutes, maxExtension);
    
    pauseSession.extensionTime = actualExtension * 60 * 1000; // Convert to milliseconds
    pauseSession.extendPauseAvailable = false;

    return {
      action: 'pause_extended',
      pauseState: true,
      billingRate: this.billingRates.paused,
      reason: 'pause_extended',
      autoResume: false,
      extendPauseAvailable: false,
      pauseSession,
      extensionMinutes: actualExtension
    };
  }

  /**
   * Analyze motion pattern to determine legitimacy
   * @param {Array} motionHistory - Array of motion data points
   * @returns {Object} Motion analysis result
   */
  analyzeMotionPattern(motionHistory) {
    if (motionHistory.length < 3) {
      return { isLegitimate: true, confidence: 0.5 };
    }

    // Calculate motion consistency
    const speeds = motionHistory.map(m => m.speed);
    const speedVariance = this.calculateVariance(speeds);
    
    // Calculate location consistency
    const locations = motionHistory.map(m => m.location);
    const locationVariance = this.calculateLocationVariance(locations);
    
    // Determine legitimacy based on patterns
    const isConsistentMotion = speedVariance < 0.1 && locationVariance < 0.01;
    const isGradualStart = this.isGradualAcceleration(motionHistory);
    
    return {
      isLegitimate: isConsistentMotion && isGradualStart,
      confidence: this.calculateConfidence(speedVariance, locationVariance),
      speedVariance,
      locationVariance,
      motionType: isGradualStart ? 'gradual' : 'sudden'
    };
  }

  /**
   * Calculate variance of a dataset
   * @param {Array} data - Numeric data array
   * @returns {number} Variance value
   */
  calculateVariance(data) {
    const mean = data.reduce((a, b) => a + b, 0) / data.length;
    const squaredDiffs = data.map(x => Math.pow(x - mean, 2));
    return squaredDiffs.reduce((a, b) => a + b, 0) / data.length;
  }

  /**
   * Calculate location variance (simplified distance-based)
   * @param {Array} locations - Array of GPS coordinates
   * @returns {number} Location variance metric
   */
  calculateLocationVariance(locations) {
    if (locations.length < 2) return 0;
    
    const distances = [];
    for (let i = 1; i < locations.length; i++) {
      const distance = this.calculateDistance(locations[i-1], locations[i]);
      distances.push(distance);
    }
    
    return this.calculateVariance(distances);
  }

  /**
   * Calculate distance between two GPS coordinates
   * @param {Object} coord1 - First coordinate {lat, lng}
   * @param {Object} coord2 - Second coordinate {lat, lng}
   * @returns {number} Distance in meters
   */
  calculateDistance(coord1, coord2) {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = coord1.lat * Math.PI / 180;
    const φ2 = coord2.lat * Math.PI / 180;
    const Δφ = (coord2.lat - coord1.lat) * Math.PI / 180;
    const Δλ = (coord2.lng - coord1.lng) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
  }

  /**
   * Check if acceleration is gradual (legitimate user behavior)
   * @param {Array} motionHistory - Motion data array
   * @returns {boolean} True if acceleration is gradual
   */
  isGradualAcceleration(motionHistory) {
    if (motionHistory.length < 3) return true;
    
    const recentMotions = motionHistory.slice(-3);
    const speedChanges = [];
    
    for (let i = 1; i < recentMotions.length; i++) {
      const change = recentMotions[i].speed - recentMotions[i-1].speed;
      speedChanges.push(Math.abs(change));
    }
    
    const avgChange = speedChanges.reduce((a, b) => a + b, 0) / speedChanges.length;
    return avgChange < 2.0; // Less than 2 km/h change per reading
  }

  /**
   * Calculate confidence score for motion analysis
   * @param {number} speedVariance - Speed variance metric
   * @param {number} locationVariance - Location variance metric
   * @returns {number} Confidence score (0-1)
   */
  calculateConfidence(speedVariance, locationVariance) {
    const speedConfidence = Math.max(0, 1 - speedVariance);
    const locationConfidence = Math.max(0, 1 - locationVariance * 100);
    
    return (speedConfidence + locationConfidence) / 2;
  }

  /**
   * Store motion history for pattern analysis and ML training
   * @param {string} vehicleId - Vehicle identifier
   * @param {Object} telemetryData - Telemetry data
   */
  storeMotionHistory(vehicleId, telemetryData) {
    if (!this.motionHistory.has(vehicleId)) {
      this.motionHistory.set(vehicleId, []);
    }
    
    const history = this.motionHistory.get(vehicleId);
    history.push({
      ...telemetryData,
      timestamp: Date.now()
    });
    
    // Keep only last 1000 data points per vehicle
    if (history.length > 1000) {
      history.shift();
    }
  }

  /**
   * Get current pause statistics
   * @returns {Object} Pause statistics
   */
  getPauseStatistics() {
    const activePauses = Array.from(this.activePauses.values());
    
    return {
      totalActivePauses: activePauses.length,
      averagePauseDuration: activePauses.length > 0 
        ? activePauses.reduce((sum, pause) => sum + (Date.now() - pause.startTime), 0) / activePauses.length
        : 0,
      pauseTypes: activePauses.reduce((types, pause) => {
        types[pause.pauseType] = (types[pause.pauseType] || 0) + 1;
        return types;
      }, {}),
      securityFlags: activePauses.filter(pause => pause.securityFlag).length
    };
  }

  /**
   * Update motion detection thresholds (for ML model tuning)
   * @param {Object} newThresholds - New threshold values
   */
  updateThresholds(newThresholds) {
    this.motionThresholds = { ...this.motionThresholds, ...newThresholds };
  }

  /**
   * Get engine configuration for monitoring
   * @returns {Object} Engine configuration
   */
  getConfiguration() {
    return {
      motionThresholds: this.motionThresholds,
      billingRates: this.billingRates,
      activePauses: this.activePauses.size,
      motionHistorySize: Array.from(this.motionHistory.values()).reduce((sum, history) => sum + history.length, 0)
    };
  }

  /**
   * Get vehicle motion state for API responses
   * @param {string} vehicleId - Vehicle identifier
   * @returns {Object} Current motion state
   */
  getVehicleMotionState(vehicleId) {
    const motionHistory = this.motionHistory.get(vehicleId) || [];
    const recentMotion = motionHistory[motionHistory.length - 1];
    
    if (!recentMotion) {
      return {
        status: 'unknown',
        speed: 0,
        acceleration: 0,
        pauseState: false,
        billingRate: this.billingRates.active,
        lastUpdate: null
      };
    }
    
    const motionState = this.detectMotionState(recentMotion);
    const pauseSession = Array.from(this.activePauses.values())
      .find(pause => pause.vehicleId === vehicleId);
    
    return {
      status: motionState,
      speed: recentMotion.speed,
      acceleration: recentMotion.acceleration,
      pauseState: !!pauseSession,
      billingRate: pauseSession ? pauseSession.billingRate : this.billingRates.active,
      lastUpdate: recentMotion.timestamp,
      pauseSession: pauseSession ? {
        startTime: pauseSession.startTime,
        duration: Date.now() - pauseSession.startTime,
        type: pauseSession.pauseType
      } : null
    };
  }

  /**
   * Get fleet motion analytics
   * @returns {Object} Fleet analytics data
   */
  getFleetAnalytics() {
    const allVehicles = Array.from(this.motionHistory.keys());
    const analytics = {
      totalVehicles: allVehicles.length,
      movingVehicles: 0,
      stoppedVehicles: 0,
      pausedVehicles: 0,
      averageSpeed: 0,
      totalPauseTime: 0,
      securityAlerts: 0
    };
    
    let totalSpeed = 0;
    let vehicleCount = 0;
    
    for (const vehicleId of allVehicles) {
      const motionState = this.getVehicleMotionState(vehicleId);
      
      if (motionState.status === 'moving') {
        analytics.movingVehicles++;
      } else if (motionState.status === 'stopped') {
        analytics.stoppedVehicles++;
      }
      
      if (motionState.pauseState) {
        analytics.pausedVehicles++;
        analytics.totalPauseTime += motionState.pauseSession.duration;
      }
      
      if (motionState.speed > 0) {
        totalSpeed += motionState.speed;
        vehicleCount++;
      }
    }
    
    analytics.averageSpeed = vehicleCount > 0 ? totalSpeed / vehicleCount : 0;
    analytics.totalPauseTime = Math.round(analytics.totalPauseTime / 1000); // Convert to seconds
    
    return analytics;
  }

  /**
   * Get motion patterns for ML analysis
   * @param {string} vehicleId - Vehicle identifier
   * @returns {Object} Motion patterns data
   */
  getMotionPatterns(vehicleId) {
    const motionHistory = this.motionHistory.get(vehicleId) || [];
    
    if (motionHistory.length < 10) {
      return {
        vehicleId,
        patterns: [],
        confidence: 0,
        message: 'Insufficient data for pattern analysis'
      };
    }
    
    const patterns = [];
    const recentMotions = motionHistory.slice(-50); // Last 50 data points
    
    // Analyze speed patterns
    const speedPatterns = this.analyzeSpeedPatterns(recentMotions);
    patterns.push({
      type: 'speed_pattern',
      data: speedPatterns,
      confidence: this.calculateConfidence(speedPatterns.variance, 0)
    });
    
    // Analyze acceleration patterns
    const accelerationPatterns = this.analyzeAccelerationPatterns(recentMotions);
    patterns.push({
      type: 'acceleration_pattern',
      data: accelerationPatterns,
      confidence: this.calculateConfidence(accelerationPatterns.variance, 0)
    });
    
    // Analyze location patterns
    const locationPatterns = this.analyzeLocationPatterns(recentMotions);
    patterns.push({
      type: 'location_pattern',
      data: locationPatterns,
      confidence: this.calculateConfidence(0, locationPatterns.variance)
    });
    
    const overallConfidence = patterns.reduce((sum, pattern) => sum + pattern.confidence, 0) / patterns.length;
    
    return {
      vehicleId,
      patterns,
      confidence: overallConfidence,
      timestamp: Date.now(),
      dataPoints: recentMotions.length
    };
  }

  /**
   * Analyze speed patterns for ML training
   * @param {Array} motions - Motion data array
   * @returns {Object} Speed pattern analysis
   */
  analyzeSpeedPatterns(motions) {
    const speeds = motions.map(m => m.speed);
    const mean = speeds.reduce((a, b) => a + b, 0) / speeds.length;
    const variance = speeds.reduce((sum, speed) => sum + Math.pow(speed - mean, 2), 0) / speeds.length;
    
    return {
      mean,
      variance,
      min: Math.min(...speeds),
      max: Math.max(...speeds),
      trend: this.calculateTrend(speeds)
    };
  }

  /**
   * Analyze acceleration patterns for ML training
   * @param {Array} motions - Motion data array
   * @returns {Object} Acceleration pattern analysis
   */
  analyzeAccelerationPatterns(motions) {
    const accelerations = motions.map(m => m.acceleration);
    const mean = accelerations.reduce((a, b) => a + b, 0) / accelerations.length;
    const variance = accelerations.reduce((sum, acc) => sum + Math.pow(acc - mean, 2), 0) / accelerations.length;
    
    return {
      mean,
      variance,
      min: Math.min(...accelerations),
      max: Math.max(...accelerations),
      trend: this.calculateTrend(accelerations)
    };
  }

  /**
   * Analyze location patterns for ML training
   * @param {Array} motions - Motion data array
   * @returns {Object} Location pattern analysis
   */
  analyzeLocationPatterns(motions) {
    const locations = motions.filter(m => m.gps).map(m => m.gps);
    
    if (locations.length < 2) {
      return { variance: 0, totalDistance: 0, averageSpeed: 0 };
    }
    
    let totalDistance = 0;
    for (let i = 1; i < locations.length; i++) {
      totalDistance += this.calculateDistance(locations[i-1], locations[i]);
    }
    
    const averageSpeed = totalDistance / (motions.length * 1000); // km/s
    const variance = this.calculateLocationVariance(locations);
    
    return {
      variance,
      totalDistance,
      averageSpeed,
      startLocation: locations[0],
      endLocation: locations[locations.length - 1]
    };
  }

  /**
   * Calculate trend direction from data array
   * @param {Array} data - Numeric data array
   * @returns {string} Trend direction: 'increasing', 'decreasing', 'stable'
   */
  calculateTrend(data) {
    if (data.length < 2) return 'stable';
    
    const firstHalf = data.slice(0, Math.floor(data.length / 2));
    const secondHalf = data.slice(Math.floor(data.length / 2));
    
    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
    
    const difference = secondAvg - firstAvg;
    
    if (Math.abs(difference) < 0.1) return 'stable';
    return difference > 0 ? 'increasing' : 'decreasing';
  }

  /**
   * Get motion alerts for security monitoring
   * @returns {Array} Array of motion alerts
   */
  getMotionAlerts() {
    const alerts = [];
    const now = Date.now();
    
    // Check for unauthorized movement
    for (const [rideId, pause] of this.activePauses) {
      if (pause.securityFlag) {
        alerts.push({
          type: 'unauthorized_movement',
          severity: 'high',
          rideId,
          vehicleId: pause.vehicleId,
          timestamp: pause.securityFlagTime,
          description: 'Unauthorized vehicle movement detected during pause',
          action: 'Investigate immediately'
        });
      }
      
      // Check for extended pauses
      if (now - pause.startTime > this.motionThresholds.pauseMaxDuration) {
        alerts.push({
          type: 'extended_pause',
          severity: 'medium',
          rideId,
          vehicleId: pause.vehicleId,
          timestamp: now,
          description: 'Pause duration exceeded maximum limit',
          action: 'Contact user or auto-resume'
        });
      }
    }
    
    // Check for unusual motion patterns
    for (const [vehicleId, history] of this.motionHistory) {
      if (history.length > 10) {
        const recentMotions = history.slice(-10);
        const speedVariance = this.analyzeSpeedPatterns(recentMotions).variance;
        
        if (speedVariance > 100) { // High speed variance threshold
          alerts.push({
            type: 'unusual_motion',
            severity: 'low',
            vehicleId,
            timestamp: now,
            description: 'Unusual motion pattern detected',
            action: 'Monitor for patterns'
          });
        }
      }
    }
    
    return alerts.sort((a, b) => b.timestamp - a.timestamp);
  }
}

module.exports = SmartPauseEngine;
