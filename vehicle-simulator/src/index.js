/**
 * Vehicle Telemetry Simulator
 * 
 * Core component for EIC Accelerator MVP demonstration
 * 
 * This simulator generates realistic vehicle telemetry data to test:
 * 1. Smart Pause & Resume functionality
 * 2. Motion detection algorithms
 * 3. Billing rate calculations
 * 4. Security and theft prevention
 * 5. Performance under load (100+ concurrent vehicles)
 */

const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cron = require('node-cron');
const chalk = require('chalk');
const cliProgress = require('cli-progress');
require('dotenv').config();

const VehicleSimulator = require('./simulators/VehicleSimulator');
const RouteGenerator = require('./routes/RouteGenerator');
const ScenarioManager = require('./scenarios/ScenarioManager');
const TelemetryProcessor = require('./telemetry/TelemetryProcessor');

class VehicleSimulatorServer {
  constructor() {
    this.app = express();
    this.server = createServer(this.app);
    this.io = new Server(this.server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    });
    
    this.port = process.env.SIMULATOR_PORT || 3002;
    this.vehicles = new Map();
    this.scenarios = new Map();
    this.isRunning = false;
    
    this.vehicleSimulator = new VehicleSimulator();
    this.routeGenerator = new RouteGenerator();
    this.scenarioManager = new ScenarioManager();
    this.telemetryProcessor = new TelemetryProcessor();
    
    this.setupMiddleware();
    this.setupRoutes();
    this.setupWebSocket();
    this.setupCronJobs();
  }

  setupMiddleware() {
    this.app.use(express.json());
    this.app.use(express.static('public'));
    
    // Add CORS middleware
    this.app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
      
      if (req.method === 'OPTIONS') {
        res.sendStatus(200);
      } else {
        next();
      }
    });
  }

  setupRoutes() {
    // Health check
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        service: 'Vehicle Simulator',
        vehicles: this.vehicles.size,
        scenarios: this.scenarios.size,
        uptime: process.uptime()
      });
    });

    // Vehicle management
    this.app.post('/api/vehicles', (req, res) => {
      const { count = 1, scenario = 'default' } = req.body;
      this.addVehicles(count, scenario);
      res.json({ message: `Added ${count} vehicles`, total: this.vehicles.size });
    });

    this.app.delete('/api/vehicles/:id', (req, res) => {
      const { id } = req.params;
      this.removeVehicle(id);
      res.json({ message: 'Vehicle removed', total: this.vehicles.size });
    });

    this.app.delete('/api/vehicles', (req, res) => {
      this.clearAllVehicles();
      res.json({ message: 'All vehicles cleared' });
    });

    // Scenario management
    this.app.post('/api/scenarios', (req, res) => {
      const { name, config } = req.body;
      this.addScenario(name, config);
      res.json({ message: `Scenario ${name} added`, total: this.scenarios.size });
    });

    this.app.post('/api/scenarios/:name/start', (req, res) => {
      const { name } = req.params;
      this.startScenario(name);
      res.json({ message: `Scenario ${name} started` });
    });

    this.app.post('/api/scenarios/:name/stop', (req, res) => {
      const { name } = req.params;
      this.stopScenario(name);
      res.json({ message: `Scenario ${name} stopped` });
    });

    // Simulation control
    this.app.post('/api/simulator/start', (req, res) => {
      this.startSimulation();
      res.json({ message: 'Simulation started', status: 'running' });
    });

    this.app.post('/api/simulator/stop', (req, res) => {
      this.stopSimulation();
      res.json({ message: 'Simulation stopped', status: 'stopped' });
    });

    this.app.post('/api/simulator/pause', (req, res) => {
      this.pauseSimulation();
      res.json({ message: 'Simulation paused', status: 'paused' });
    });

    // Statistics and monitoring
    this.app.get('/api/stats', (req, res) => {
      res.json(this.getSimulationStats());
    });

    this.app.get('/api/vehicles/status', (req, res) => {
      const status = Array.from(this.vehicles.values()).map(vehicle => ({
        id: vehicle.id,
        status: vehicle.status,
        location: vehicle.currentLocation,
        battery: vehicle.batteryLevel,
        speed: vehicle.currentSpeed,
        scenario: vehicle.scenario
      }));
      res.json(status);
    });
  }

  setupWebSocket() {
    this.io.on('connection', (socket) => {
      console.log(chalk.blue(`🔌 Client connected: ${socket.id}`));
      
      // Join vehicle-specific room
      socket.on('join-vehicle', (vehicleId) => {
        socket.join(`vehicle-${vehicleId}`);
        console.log(chalk.green(`📱 Client ${socket.id} joined vehicle ${vehicleId}`));
      });
      
      // Join scenario room
      socket.on('join-scenario', (scenarioName) => {
        socket.join(`scenario-${scenarioName}`);
        console.log(chalk.green(`🎬 Client ${socket.id} joined scenario ${scenarioName}`));
      });
      
      // Handle vehicle control commands
      socket.on('vehicle-command', (data) => {
        const { vehicleId, command, params } = data;
        this.handleVehicleCommand(vehicleId, command, params);
      });
      
      // Handle scenario control
      socket.on('scenario-command', (data) => {
        const { scenarioName, command, params } = data;
        this.handleScenarioCommand(scenarioName, command, params);
      });
      
      socket.on('disconnect', () => {
        console.log(chalk.yellow(`🔌 Client disconnected: ${socket.id}`));
      });
    });
  }

  setupCronJobs() {
    // Update vehicle telemetry every second
    cron.schedule('* * * * * *', () => {
      if (this.isRunning) {
        this.updateAllVehicles();
      }
    });

    // Generate performance reports every minute
    cron.schedule('* * * * *', () => {
      this.generatePerformanceReport();
    });
  }

  addVehicles(count, scenario = 'default') {
    console.log(chalk.blue(`🚗 Adding ${count} vehicles with scenario: ${scenario}`));
    
    const progressBar = new cliProgress.SingleBar({
      format: 'Adding vehicles |{bar}| {percentage}% | {value}/{total} vehicles',
      barCompleteChar: '\u2588',
      barIncompleteChar: '\u2591',
      hideCursor: true
    });
    
    progressBar.start(count, 0);
    
    for (let i = 0; i < count; i++) {
      const vehicleId = `vehicle_${Date.now()}_${i}`;
      const vehicle = this.vehicleSimulator.addVehicle(vehicleId, { scenario });
      
      // Generate initial route
      const route = this.routeGenerator.generateRandomRoute();
      
      this.vehicles.set(vehicleId, vehicle);
      progressBar.increment();
    }
    
    progressBar.stop();
    console.log(chalk.green(`✅ Successfully added ${count} vehicles`));
    
    // Emit update to connected clients
    this.io.emit('vehicles-updated', {
      count: this.vehicles.size,
      scenario: scenario
    });
  }

  removeVehicle(vehicleId) {
    if (this.vehicles.has(vehicleId)) {
      const vehicle = this.vehicles.get(vehicleId);
      vehicle.stop();
      this.vehicles.delete(vehicleId);
      
      console.log(chalk.yellow(`🚗 Vehicle ${vehicleId} removed`));
      
      this.io.emit('vehicle-removed', { vehicleId });
    }
  }

  clearAllVehicles() {
    console.log(chalk.yellow('🧹 Clearing all vehicles...'));
    
    for (const [id, vehicle] of this.vehicles) {
      vehicle.stop();
    }
    
    this.vehicles.clear();
    console.log(chalk.green('✅ All vehicles cleared'));
    
    this.io.emit('all-vehicles-cleared');
  }

  addScenario(name, config) {
    this.scenarioManager.addScenario(name, config);
    this.scenarios.set(name, config);
    
    console.log(chalk.blue(`🎬 Scenario ${name} added`));
    this.io.emit('scenario-added', { name, config });
  }

  startScenario(scenarioName) {
    const scenario = this.scenarios.get(scenarioName);
    if (scenario) {
      this.scenarioManager.startScenario(scenarioName);
      console.log(chalk.green(`🎬 Scenario ${scenarioName} started`));
      this.io.emit('scenario-started', { name: scenarioName });
    }
  }

  stopScenario(scenarioName) {
    const scenario = this.scenarios.get(scenarioName);
    if (scenario) {
      this.scenarioManager.stopScenario(scenarioName);
      console.log(chalk.yellow(`🎬 Scenario ${scenarioName} stopped`));
      this.io.emit('scenario-stopped', { name: scenarioName });
    }
  }

  startSimulation() {
    if (this.isRunning) {
      console.log(chalk.yellow('⚠️  Simulation already running'));
      return;
    }
    
    this.isRunning = true;
    console.log(chalk.green('🚀 Vehicle simulation started'));
    
    // Start the vehicle simulator
    this.vehicleSimulator.start();
    
    this.io.emit('simulation-started');
  }

  stopSimulation() {
    if (!this.isRunning) {
      console.log(chalk.yellow('⚠️  Simulation not running'));
      return;
    }
    
    this.isRunning = false;
    console.log(chalk.yellow('⏹️  Vehicle simulation stopped'));
    
    // Stop the vehicle simulator
    this.vehicleSimulator.stop();
    
    this.io.emit('simulation-stopped');
  }

  pauseSimulation() {
    this.isRunning = !this.isRunning;
    const status = this.isRunning ? 'resumed' : 'paused';
    console.log(chalk.blue(`⏸️  Vehicle simulation ${status}`));
    
    this.io.emit('simulation-paused', { status: this.isRunning ? 'running' : 'paused' });
  }

  updateAllVehicles() {
    const telemetryData = [];
    
    for (const [id, vehicle] of this.vehicles) {
      try {
        const telemetry = vehicle.update();
        if (telemetry) {
          telemetryData.push(telemetry);
          
          // Process telemetry through Smart Pause engine
          const processedData = this.telemetryProcessor.process(telemetry);
          
          // Emit to vehicle-specific room
          this.io.to(`vehicle-${id}`).emit('telemetry-update', processedData);
          
          // Emit to scenario room if applicable
          if (vehicle.scenario) {
            this.io.to(`scenario-${vehicle.scenario}`).emit('telemetry-update', {
              vehicleId: id,
              ...processedData
            });
          }
        }
      } catch (error) {
        console.error(chalk.red(`Error updating vehicle ${id}:`, error.message));
      }
    }
    
    // Emit bulk update for dashboard
    if (telemetryData.length > 0) {
      this.io.emit('bulk-telemetry-update', {
        timestamp: Date.now(),
        count: telemetryData.length,
        data: telemetryData
      });
    }
  }

  handleVehicleCommand(vehicleId, command, params) {
    const vehicle = this.vehicles.get(vehicleId);
    if (!vehicle) {
      console.log(chalk.red(`❌ Vehicle ${vehicleId} not found`));
      return;
    }
    
    try {
      switch (command) {
        case 'pause':
          vehicle.pause(params);
          break;
        case 'resume':
          vehicle.resume();
          break;
        case 'set-speed':
          vehicle.setSpeed(params.speed);
          break;
        case 'set-location':
          vehicle.setLocation(params.lat, params.lng);
          break;
        case 'trigger-incident':
          vehicle.triggerIncident(params.type);
          break;
        default:
          console.log(chalk.yellow(`⚠️  Unknown command: ${command}`));
      }
      
      console.log(chalk.green(`✅ Vehicle ${vehicleId} command executed: ${command}`));
    } catch (error) {
      console.error(chalk.red(`❌ Error executing command on vehicle ${vehicleId}:`, error.message));
    }
  }

  handleScenarioCommand(scenarioName, command, params) {
    const scenario = this.scenarios.get(scenarioName);
    if (!scenario) {
      console.log(chalk.red(`❌ Scenario ${scenarioName} not found`));
      return;
    }
    
    try {
      scenario.executeCommand(command, params);
      console.log(chalk.green(`✅ Scenario ${scenarioName} command executed: ${command}`));
    } catch (error) {
      console.error(chalk.red(`❌ Error executing scenario command:`, error.message));
    }
  }

  generatePerformanceReport() {
    const stats = this.getSimulationStats();
    
    // Log performance metrics
    if (stats.totalVehicles > 0) {
      console.log(chalk.blue('📊 Performance Report:'), {
        vehicles: stats.totalVehicles,
        active: stats.activeVehicles,
        paused: stats.pausedVehicles,
        incidents: stats.totalIncidents,
        avgResponseTime: `${stats.avgResponseTime}ms`
      });
    }
    
    // Emit to dashboard
    this.io.emit('performance-report', stats);
  }

  getSimulationStats() {
    let activeVehicles = 0;
    let pausedVehicles = 0;
    
    for (const [id, vehicle] of this.vehicles) {
      if (vehicle.status === 'in_use') activeVehicles++;
      if (vehicle.status === 'paused') pausedVehicles++;
    }
    
    return {
      totalVehicles: this.vehicles.size,
      activeVehicles,
      pausedVehicles,
      totalIncidents: 0,
      avgResponseTime: 0,
      scenarios: this.scenarios.size,
      uptime: process.uptime(),
      timestamp: Date.now()
    };
  }

  start() {
    this.server.listen(this.port, () => {
      console.log(chalk.green(`🚀 Vehicle Simulator running on port ${this.port}`));
      console.log(chalk.blue(`📱 Health check: http://localhost:${this.port}/health`));
      console.log(chalk.blue(`🔌 WebSocket ready for real-time telemetry`));
      console.log(chalk.yellow(`💡 Use /api/vehicles to add vehicles and start simulation`));
    });
  }
}

// Start the simulator server
const simulator = new VehicleSimulatorServer();
simulator.start();

module.exports = VehicleSimulatorServer;
