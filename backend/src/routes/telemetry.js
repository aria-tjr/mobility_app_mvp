const express = require('express');
const router = express.Router();
const SmartPauseEngine = require('../services/SmartPauseEngine');

const smartPauseEngine = new SmartPauseEngine();

// Health check for telemetry service
router.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'Telemetry Service' });
});

// Process real-time telemetry data
router.post('/process', async (req, res) => {
  try {
    const { vehicleId, rideId, telemetryData } = req.body;
    
    // Process through Smart Pause Engine
    const result = smartPauseEngine.processTelemetry(
      telemetryData,
      vehicleId,
      rideId
    );
    
    res.json({ 
      message: 'Telemetry processed successfully',
      vehicleId,
      rideId,
      result,
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get vehicle motion status
router.get('/vehicle/:vehicleId/motion', async (req, res) => {
  try {
    const { vehicleId } = req.params;
    
    // Get current motion state from Smart Pause Engine
    const motionState = smartPauseEngine.getVehicleMotionState(vehicleId);
    
    res.json({ 
      vehicleId,
      motionState,
      timestamp: new Date(),
      smartPause: {
        available: motionState.status !== 'maintenance',
        currentRate: motionState.billingRate,
        pauseState: motionState.pauseState
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get fleet motion analytics
router.get('/fleet/analytics', async (req, res) => {
  try {
    const fleetAnalytics = smartPauseEngine.getFleetAnalytics();
    
    res.json({ 
      message: 'Fleet motion analytics retrieved',
      analytics: fleetAnalytics,
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Simulate motion detection for MVP demo
router.post('/simulate/:scenario', async (req, res) => {
  try {
    const { scenario } = req.params;
    const { vehicleId, rideId } = req.body;
    
    let telemetryData;
    
    switch (scenario) {
      case 'traffic_stop':
        telemetryData = {
          speed: 0,
          acceleration: 0,
          gps: { lat: 40.7128, lng: -74.0060 },
          battery: 85,
          timestamp: Date.now(),
          userAction: null
        };
        break;
        
      case 'user_pause':
        telemetryData = {
          speed: 0,
          acceleration: 0,
          gps: { lat: 40.7128, lng: -74.0060 },
          battery: 85,
          timestamp: Date.now(),
          userAction: 'pause'
        };
        break;
        
      case 'resume_motion':
        telemetryData = {
          speed: 15,
          acceleration: 2.5,
          gps: { lat: 40.7128, lng: -74.0060 },
          battery: 84,
          timestamp: Date.now(),
          userAction: null
        };
        break;
        
      case 'unauthorized_movement':
        telemetryData = {
          speed: 8,
          acceleration: 1.2,
          gps: { lat: 40.7128, lng: -74.0060 },
          battery: 84,
          timestamp: Date.now(),
          userAction: null
        };
        break;
        
      default:
        return res.status(400).json({ error: 'Invalid scenario' });
    }
    
    // Process simulated telemetry
    const result = smartPauseEngine.processTelemetry(
      telemetryData,
      vehicleId,
      rideId
    );
    
    res.json({ 
      message: `Scenario '${scenario}' simulated successfully`,
      scenario,
      vehicleId,
      rideId,
      telemetryData,
      result,
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get motion detection patterns for ML analysis
router.get('/patterns/:vehicleId', async (req, res) => {
  try {
    const { vehicleId } = req.params;
    
    // Get motion patterns from Smart Pause Engine
    const patterns = smartPauseEngine.getMotionPatterns(vehicleId);
    
    res.json({ 
      message: 'Motion patterns retrieved successfully',
      vehicleId,
      patterns,
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update motion detection thresholds
router.put('/thresholds', async (req, res) => {
  try {
    const { speed, acceleration, timeThreshold } = req.body;
    
    // Update Smart Pause Engine thresholds
    smartPauseEngine.updateThresholds({
      speed: speed || 0.5,
      acceleration: acceleration || 0.1,
      timeThreshold: timeThreshold || 5000
    });
    
    res.json({ 
      message: 'Motion detection thresholds updated successfully',
      thresholds: {
        speed: speed || 0.5,
        acceleration: acceleration || 0.1,
        timeThreshold: timeThreshold || 5000
      },
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get real-time motion alerts
router.get('/alerts', async (req, res) => {
  try {
    const alerts = smartPauseEngine.getMotionAlerts();
    
    res.json({ 
      message: 'Motion alerts retrieved successfully',
      alerts,
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
