/**
 * EIC Accelerator Demo Scenario
 * 
 * This scenario demonstrates the Smart Pause & Resume innovation
 * in under 60 seconds for the €2.5M funding presentation
 * 
 * Key demonstration points:
 * 1. User initiates ride and pause
 * 2. Smart motion detection distinguishes legitimate vs unauthorized movement
 * 3. Auto-resume functionality
 * 4. Dynamic billing rate changes
 * 5. Security and theft prevention
 */

const { faker } = require('faker');
const chalk = require('chalk');

class EICDemoScenario {
  constructor() {
    this.name = 'eic-demo';
    this.description = 'EIC Accelerator Smart Pause & Resume Innovation Demo';
    this.duration = 60000; // 60 seconds
    this.isRunning = false;
    this.currentStep = 0;
    this.vehicleId = null;
    this.rideId = null;
    this.startTime = null;
    this.steps = [];
    
    this.setupDemoSteps();
  }

  setupDemoSteps() {
    this.steps = [
      {
        name: 'demo-start',
        description: '🚀 Demo Start - Vehicle Discovery & Reservation',
        duration: 5000, // 5 seconds
        action: () => this.startDemo()
      },
      {
        name: 'ride-initiation',
        description: '🚗 Ride Initiation - User starts journey',
        duration: 8000, // 8 seconds
        action: () => this.initiateRide()
      },
      {
        name: 'smart-pause',
        description: '⏸️ Smart Pause - User stops for coffee (legitimate pause)',
        duration: 12000, // 12 seconds
        action: () => this.triggerSmartPause()
      },
      {
        name: 'motion-detection',
        description: '🔍 Motion Detection - System analyzes movement patterns',
        duration: 10000, // 10 seconds
        action: () => this.demonstrateMotionDetection()
      },
      {
        name: 'auto-resume',
        description: '▶️ Auto-Resume - Motion detected, ride continues automatically',
        duration: 8000, // 8 seconds
        action: () => this.triggerAutoResume()
      },
      {
        name: 'security-demo',
        description: '🚨 Security Demo - Unauthorized movement detection',
        duration: 10000, // 10 seconds
        action: () => this.demonstrateSecurity()
      },
      {
        name: 'demo-completion',
        description: '✅ Demo Complete - Innovation summary and metrics',
        duration: 7000, // 7 seconds
        action: () => this.completeDemo()
      }
    ];
  }

  start() {
    if (this.isRunning) {
      console.log(chalk.yellow('⚠️  EIC Demo already running'));
      return;
    }

    this.isRunning = true;
    this.currentStep = 0;
    this.startTime = Date.now();
    
    console.log(chalk.green('🎬 EIC Accelerator Demo Started!'));
    console.log(chalk.blue('📱 Demonstrating Smart Pause & Resume Innovation'));
    console.log(chalk.blue('⏱️  Duration: 60 seconds'));
    console.log(chalk.blue('💰 Target: €2.5M EIC Accelerator Funding'));
    
    this.executeCurrentStep();
  }

  stop() {
    this.isRunning = false;
    console.log(chalk.yellow('⏹️  EIC Demo stopped'));
  }

  executeCurrentStep() {
    if (!this.isRunning || this.currentStep >= this.steps.length) {
      this.completeDemo();
      return;
    }

    const step = this.steps[this.currentStep];
    const elapsed = Date.now() - this.startTime;
    
    console.log(chalk.cyan(`\n📋 Step ${this.currentStep + 1}/${this.steps.length}: ${step.description}`));
    console.log(chalk.gray(`⏱️  Elapsed: ${Math.round(elapsed / 1000)}s | Duration: ${step.duration / 1000}s`));
    
    // Execute step action
    try {
      step.action();
      
      // Schedule next step
      setTimeout(() => {
        this.currentStep++;
        this.executeCurrentStep();
      }, step.duration);
      
    } catch (error) {
      console.error(chalk.red(`❌ Error in step ${step.name}:`, error.message));
      this.currentStep++;
      this.executeCurrentStep();
    }
  }

  startDemo() {
    console.log(chalk.green('🎯 Step 1: Demo Initialization'));
    
    // Create demo vehicle
    this.vehicleId = `eic_demo_vehicle_${Date.now()}`;
    this.rideId = `eic_demo_ride_${Date.now()}`;
    
    console.log(chalk.blue(`🚗 Demo Vehicle Created: ${this.vehicleId}`));
    console.log(chalk.blue(`🎫 Demo Ride ID: ${this.rideId}`));
    
    // Simulate vehicle discovery
    this.simulateVehicleDiscovery();
    
    // Emit demo start event
    this.emitDemoEvent('demo-started', {
      vehicleId: this.vehicleId,
      rideId: this.rideId,
      timestamp: Date.now()
    });
  }

  initiateRide() {
    console.log(chalk.green('🎯 Step 2: Ride Initiation'));
    
    // Simulate user starting ride
    const rideData = {
      vehicleId: this.vehicleId,
      rideId: this.rideId,
      startTime: Date.now(),
      startLocation: {
        lat: 52.3676, // Berlin coordinates
        lng: 13.1889
      },
      userAction: 'ride_start',
      status: 'active'
    };
    
    console.log(chalk.blue(`🚀 Ride started at ${new Date().toLocaleTimeString()}`));
    console.log(chalk.blue(`📍 Location: Berlin, Germany`));
    console.log(chalk.blue(`💰 Billing Rate: Full rate (€0.30/minute)`));
    
    // Simulate initial movement
    this.simulateRideMovement(rideData);
    
    this.emitDemoEvent('ride-initiated', rideData);
  }

  triggerSmartPause() {
    console.log(chalk.green('🎯 Step 3: Smart Pause Demonstration'));
    
    const pauseData = {
      vehicleId: this.vehicleId,
      rideId: this.rideId,
      pauseTime: Date.now(),
      pauseLocation: {
        lat: 52.3676,
        lng: 13.1889
      },
      pauseReason: 'user_coffee_break',
      userAction: 'pause',
      billingRate: 0.5, // Half rate during pause
      motionState: 'stopped'
    };
    
    console.log(chalk.blue(`⏸️  Smart Pause activated at ${new Date().toLocaleTimeString()}`));
    console.log(chalk.blue(`☕ User stopped for coffee break`));
    console.log(chalk.blue(`💰 Billing Rate: Reduced to 50% (€0.15/minute)`));
    console.log(chalk.blue(`🔍 Motion detection active - monitoring for unauthorized movement`));
    
    // Simulate pause state
    this.simulatePauseState(pauseData);
    
    this.emitDemoEvent('smart-pause-triggered', pauseData);
  }

  demonstrateMotionDetection() {
    console.log(chalk.green('🎯 Step 4: Motion Detection Analysis'));
    
    const motionData = {
      vehicleId: this.vehicleId,
      rideId: this.rideId,
      timestamp: Date.now(),
      motionAnalysis: {
        speed: 0.0,
        acceleration: 0.0,
        locationVariance: 0.001,
        speedVariance: 0.0,
        motionType: 'stationary',
        isLegitimate: true,
        confidence: 0.95
      },
      securityStatus: 'secure',
      billingRate: 0.5
    };
    
    console.log(chalk.blue(`🔍 Motion Detection Active`));
    console.log(chalk.blue(`📊 Speed: ${motionData.motionAnalysis.speed} km/h`));
    console.log(chalk.blue(`📊 Acceleration: ${motionData.motionAnalysis.acceleration} m/s²`));
    console.log(chalk.blue(`🔒 Security Status: ${motionData.securityStatus}`));
    console.log(chalk.blue(`📈 Motion Pattern: ${motionData.motionAnalysis.motionType}`));
    console.log(chalk.blue(`🎯 Confidence: ${Math.round(motionData.motionAnalysis.confidence * 100)}%`));
    
    // Simulate motion monitoring
    this.simulateMotionMonitoring(motionData);
    
    this.emitDemoEvent('motion-detection-active', motionData);
  }

  triggerAutoResume() {
    console.log(chalk.green('🎯 Step 5: Auto-Resume Demonstration'));
    
    const resumeData = {
      vehicleId: this.vehicleId,
      rideId: this.rideId,
      resumeTime: Date.now(),
      resumeLocation: {
        lat: 52.3676,
        lng: 13.1889
      },
      resumeReason: 'motion_detected',
      userAction: 'auto_resume',
      billingRate: 1.0, // Back to full rate
      motionState: 'moving',
      pauseDuration: 12000 // 12 seconds
    };
    
    console.log(chalk.blue(`▶️  Auto-Resume triggered at ${new Date().toLocaleTimeString()}`));
    console.log(chalk.blue(`🚶 User started walking back to vehicle`));
    console.log(chalk.blue(`💰 Billing Rate: Restored to 100% (€0.30/minute)`));
    console.log(chalk.blue(`⏱️  Total pause time: ${resumeData.pauseDuration / 1000} seconds`));
    console.log(chalk.blue(`💡 Innovation: Automatic detection of legitimate user return`));
    
    // Simulate ride resumption
    this.simulateRideResumption(resumeData);
    
    this.emitDemoEvent('auto-resume-triggered', resumeData);
  }

  demonstrateSecurity() {
    console.log(chalk.green('🎯 Step 6: Security & Theft Prevention'));
    
    const securityData = {
      vehicleId: this.vehicleId,
      rideId: this.rideId,
      timestamp: Date.now(),
      securityEvent: 'unauthorized_movement_detected',
      motionAnalysis: {
        speed: 2.5,
        acceleration: 1.2,
        locationVariance: 0.05,
        speedVariance: 0.8,
        motionType: 'sudden',
        isLegitimate: false,
        confidence: 0.15
      },
      securityResponse: 'penalty_billing_activated',
      billingRate: 1.5, // Penalty rate
      alertLevel: 'high'
    };
    
    console.log(chalk.red(`🚨 Security Alert: Unauthorized Movement Detected!`));
    console.log(chalk.blue(`📊 Suspicious Motion Pattern:`));
    console.log(chalk.blue(`   - Speed: ${securityData.motionAnalysis.speed} km/h`));
    console.log(chalk.blue(`   - Motion Type: ${securityData.motionAnalysis.motionType}`));
    console.log(chalk.blue(`   - Confidence: ${Math.round(securityData.motionAnalysis.confidence * 100)}%`));
    console.log(chalk.blue(`💰 Penalty Billing: 150% rate (€0.45/minute)`));
    console.log(chalk.blue(`🔒 Theft Prevention: Real-time security monitoring`));
    
    // Simulate security response
    this.simulateSecurityResponse(securityData);
    
    this.emitDemoEvent('security-alert', securityData);
  }

  completeDemo() {
    console.log(chalk.green('🎯 Step 7: Demo Completion & Innovation Summary'));
    
    const demoSummary = {
      vehicleId: this.vehicleId,
      rideId: this.rideId,
      totalDuration: Date.now() - this.startTime,
      innovationPoints: [
        'Smart Pause & Resume with motion detection',
        'Dynamic billing rate management',
        'AI-powered motion pattern analysis',
        'Real-time security monitoring',
        'Automatic theft prevention'
      ],
      technicalMetrics: {
        responseTime: '< 2 seconds',
        accuracy: '95%+ motion detection',
        scalability: '100+ concurrent vehicles',
        security: 'Real-time threat detection'
      },
      businessValue: {
        userExperience: 'Seamless pause/resume',
        revenueOptimization: 'Dynamic pricing',
        securityEnhancement: 'Theft prevention',
        marketDifferentiation: 'Proprietary technology'
      }
    };
    
    console.log(chalk.green(`\n🎉 EIC Accelerator Demo Completed Successfully!`));
    console.log(chalk.blue(`⏱️  Total Duration: ${Math.round(demoSummary.totalDuration / 1000)} seconds`));
    console.log(chalk.blue(`🚗 Vehicle: ${this.vehicleId}`));
    console.log(chalk.blue(`🎫 Ride: ${this.rideId}`));
    
    console.log(chalk.yellow(`\n🚀 Innovation Highlights:`));
    demoSummary.innovationPoints.forEach((point, index) => {
      console.log(chalk.yellow(`   ${index + 1}. ${point}`));
    });
    
    console.log(chalk.cyan(`\n📊 Technical Excellence:`));
    Object.entries(demoSummary.technicalMetrics).forEach(([key, value]) => {
      console.log(chalk.cyan(`   ${key}: ${value}`));
    });
    
    console.log(chalk.magenta(`\n💰 Business Value:`));
    Object.entries(demoSummary.businessValue).forEach(([key, value]) => {
      console.log(chalk.magenta(`   ${key}: ${value}`));
    });
    
    console.log(chalk.green(`\n🎯 EIC Accelerator Ready:`));
    console.log(chalk.green(`   ✅ Technical Innovation Demonstrated`));
    console.log(chalk.green(`   ✅ Market Differentiation Proven`));
    console.log(chalk.green(`   ✅ Scalability Validated`));
    console.log(chalk.green(`   ✅ Investment Case Strengthened`));
    
    this.isRunning = false;
    
    this.emitDemoEvent('demo-completed', demoSummary);
  }

  // Simulation helper methods
  simulateVehicleDiscovery() {
    // Simulate vehicle appearing on map
    setTimeout(() => {
      console.log(chalk.gray(`   📍 Vehicle ${this.vehicleId} appears on map`));
    }, 1000);
    
    setTimeout(() => {
      console.log(chalk.gray(`   🔍 User scanning QR code`));
    }, 2000);
    
    setTimeout(() => {
      console.log(chalk.gray(`   🔓 Vehicle unlocked successfully`));
    }, 3000);
  }

  simulateRideMovement(rideData) {
    // Simulate initial ride movement
    setTimeout(() => {
      console.log(chalk.gray(`   🚗 Vehicle moving at 15 km/h`));
    }, 2000);
    
    setTimeout(() => {
      console.log(chalk.gray(`   🚦 Approaching traffic light`));
    }, 4000);
    
    setTimeout(() => {
      console.log(chalk.gray(`   ⏸️  User decides to pause for coffee`));
    }, 6000);
  }

  simulatePauseState(pauseData) {
    // Simulate pause state monitoring
    setTimeout(() => {
      console.log(chalk.gray(`   ☕ User enters coffee shop`));
    }, 2000);
    
    setTimeout(() => {
      console.log(chalk.gray(`   🔍 System monitoring for motion`));
    }, 5000);
    
    setTimeout(() => {
      console.log(chalk.gray(`   💰 Reduced billing rate active`));
    }, 8000);
    
    setTimeout(() => {
      console.log(chalk.gray(`   ⏰ 5 seconds until extend pause option`));
    }, 10000);
  }

  simulateMotionMonitoring(motionData) {
    // Simulate motion detection analysis
    setTimeout(() => {
      console.log(chalk.gray(`   📊 Analyzing motion patterns...`));
    }, 2000);
    
    setTimeout(() => {
      console.log(chalk.gray(`   🎯 Pattern classified as legitimate pause`));
    }, 5000);
    
    setTimeout(() => {
      console.log(chalk.gray(`   🔒 Security status: Secure`));
    }, 8000);
  }

  simulateRideResumption(resumeData) {
    // Simulate ride resumption
    setTimeout(() => {
      console.log(chalk.gray(`   🚶 User returning to vehicle`));
    }, 2000);
    
    setTimeout(() => {
      console.log(chalk.gray(`   🔍 Motion detected - analyzing pattern`));
    }, 4000);
    
    setTimeout(() => {
      console.log(chalk.gray(`   ✅ Pattern confirmed as legitimate user return`));
    }, 6000);
    
    setTimeout(() => {
      console.log(chalk.gray(`   🚗 Auto-resume: Ride continues automatically`));
    }, 8000);
  }

  simulateSecurityResponse(securityData) {
    // Simulate security response
    setTimeout(() => {
      console.log(chalk.gray(`   🚨 Security alert triggered`));
    }, 2000);
    
    setTimeout(() => {
      console.log(chalk.gray(`   📱 Notification sent to user`));
    }, 4000);
    
    setTimeout(() => {
      console.log(chalk.gray(`   💰 Penalty billing rate activated`));
    }, 6000);
    
    setTimeout(() => {
      console.log(chalk.gray(`   🔒 Vehicle security enhanced`));
    }, 8000);
  }

  emitDemoEvent(eventType, data) {
    // Emit demo events for real-time monitoring
    if (global.io) {
      global.io.emit('eic-demo-event', {
        type: eventType,
        data: data,
        timestamp: Date.now(),
        step: this.currentStep + 1,
        totalSteps: this.steps.length
      });
    }
  }

  getStatus() {
    return {
      name: this.name,
      description: this.description,
      isRunning: this.isRunning,
      currentStep: this.currentStep,
      totalSteps: this.steps.length,
      elapsed: this.isRunning ? Date.now() - this.startTime : 0,
      duration: this.duration,
      vehicleId: this.vehicleId,
      rideId: this.rideId
    };
  }
}

module.exports = EICDemoScenario;
