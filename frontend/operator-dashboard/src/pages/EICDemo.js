import React, { useState, useEffect, useContext } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Chip,
  LinearProgress,
  Alert,
  IconButton,
  Tooltip,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  PlayArrow,
  Pause,
  Stop,
  Refresh,
  Timeline,
  Speed,
  Security,
  TrendingUp,
  CheckCircle,
  Warning,
  Info,
  PlayCircleOutline,
  PauseCircleOutline,
  StopCircleOutline,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useDashboardContext } from '../context/DashboardContext';

const EICDemo = () => {
  const { socket, isConnected } = useDashboardContext();
  const [demoStatus, setDemoStatus] = useState('idle'); // idle, running, paused, completed
  const [currentStep, setCurrentStep] = useState(0);
  const [totalSteps, setTotalSteps] = useState(7);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [demoData, setDemoData] = useState({});
  const [vehicleStatus, setVehicleStatus] = useState({});
  const [motionData, setMotionData] = useState({});
  const [securityAlerts, setSecurityAlerts] = useState([]);
  const [performanceMetrics, setPerformanceMetrics] = useState({});

  const [demoSteps, setDemoSteps] = useState([
    {
      id: 1,
      title: 'Demo Start',
      description: 'Vehicle Discovery & Reservation',
      icon: '🚀',
      duration: 5,
      status: 'pending'
    },
    {
      id: 2,
      title: 'Ride Initiation',
      description: 'User starts journey',
      icon: '🚗',
      duration: 8,
      status: 'pending'
    },
    {
      id: 3,
      title: 'Smart Pause',
      description: 'User stops for coffee (legitimate pause)',
      icon: '⏸️',
      duration: 12,
      status: 'pending'
    },
    {
      id: 4,
      title: 'Motion Detection',
      description: 'System analyzes movement patterns',
      icon: '🔍',
      duration: 10,
      status: 'pending'
    },
    {
      id: 5,
      title: 'Auto-Resume',
      description: 'Motion detected, ride continues automatically',
      icon: '▶️',
      duration: 8,
      status: 'pending'
    },
    {
      id: 6,
      title: 'Security Demo',
      description: 'Unauthorized movement detection',
      icon: '🚨',
      duration: 10,
      status: 'pending'
    },
    {
      id: 7,
      title: 'Demo Complete',
      description: 'Innovation summary and metrics',
      icon: '✅',
      duration: 7,
      status: 'pending'
    }
  ]);

  useEffect(() => {
    if (!socket) return;

    // Listen for EIC demo events
    socket.on('eic-demo-event', (data) => {
      console.log('🎬 EIC Demo event received:', data);
      handleDemoEvent(data);
    });

    // Listen for telemetry updates
    socket.on('telemetry-update', (data) => {
      if (data.vehicleId && data.vehicleId.includes('eic_demo')) {
        setVehicleStatus(data);
      }
    });

    return () => {
      socket.off('eic-demo-event');
      socket.off('telemetry-update');
    };
  }, [socket]);

  useEffect(() => {
    let interval;
    if (demoStatus === 'running') {
      interval = setInterval(() => {
        setElapsedTime(prev => {
          const newTime = prev + 1;
          
          // Auto-progress demo steps based on time
          if (newTime === 5) {
            // Step 1: Demo Start (0-5 seconds)
            updateStepStatus(1, 'completed');
            updateStepStatus(2, 'active');
            setCurrentStep(2);
            console.log('🎯 Moving to Step 2: Ride Initiation');
            
            // Update vehicle status for ride initiation
            setVehicleStatus(prev => ({
              ...prev,
              available: 2,
              inUse: 1
            }));
          } else if (newTime === 12) {
            // Step 2: Ride Initiation (5-12 seconds)
            updateStepStatus(2, 'completed');
            updateStepStatus(3, 'active');
            setCurrentStep(3);
            console.log('🎯 Moving to Step 3: Smart Pause');
            
            // Update motion data for smart pause
            setMotionData({
              motionDetected: false,
              confidence: 0.95,
              pattern: 'intentional_pause'
            });
          } else if (newTime === 24) {
            // Step 3: Smart Pause (12-24 seconds)
            updateStepStatus(3, 'completed');
            updateStepStatus(4, 'active');
            setCurrentStep(4);
            console.log('🎯 Moving to Step 4: Motion Detection');
            
            // Update vehicle status for pause
            setVehicleStatus(prev => ({
              ...prev,
              paused: 1,
              inUse: 0
            }));
          } else if (newTime === 34) {
            // Step 4: Motion Detection (24-34 seconds)
            updateStepStatus(4, 'completed');
            updateStepStatus(5, 'active');
            setCurrentStep(5);
            console.log('🎯 Moving to Step 5: Auto-Resume');
            
            // Update motion data for motion detection
            setMotionData({
              motionDetected: true,
              confidence: 0.87,
              pattern: 'gradual_acceleration'
            });
          } else if (newTime === 44) {
            // Step 5: Auto-Resume (34-44 seconds)
            updateStepStatus(5, 'completed');
            updateStepStatus(6, 'active');
            setCurrentStep(6);
            console.log('🎯 Moving to Step 6: Security Demo');
            
            // Update vehicle status for auto-resume
            setVehicleStatus(prev => ({
              ...prev,
              paused: 0,
              inUse: 1
            }));
          } else if (newTime === 54) {
            // Step 6: Security Demo (44-54 seconds)
            updateStepStatus(6, 'completed');
            updateStepStatus(7, 'active');
            setCurrentStep(7);
            console.log('🎯 Moving to Step 7: Demo Complete');
            
            // Add security alert
            setSecurityAlerts([
              {
                id: 1,
                type: 'unauthorized_movement',
                severity: 'medium',
                timestamp: new Date().toISOString(),
                description: 'Motion pattern analysis detected potential unauthorized movement'
              }
            ]);
          } else if (newTime === 60) {
            // Step 7: Demo Complete (54-60 seconds)
            updateStepStatus(7, 'completed');
            setDemoStatus('completed');
            console.log('🎉 EIC Demo completed successfully!');
            
            // Set final performance metrics
            setPerformanceMetrics({
              totalSteps: 7,
              completionTime: 60,
              vehiclesUtilized: 1,
              smartPauseEfficiency: '95%',
              motionDetectionAccuracy: '87%',
              securityAlerts: 1,
              innovationScore: 'A+'
            });
          }
          
          return newTime;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [demoStatus]);

  const handleDemoEvent = (data) => {
    const { type, step, data: eventData } = data;
    
    switch (type) {
      case 'demo-started':
        setDemoStatus('running');
        setCurrentStep(1);
        setDemoData(eventData);
        updateStepStatus(1, 'active');
        break;
      case 'ride-initiated':
        setCurrentStep(2);
        updateStepStatus(1, 'completed');
        updateStepStatus(2, 'active');
        break;
      case 'smart-pause-triggered':
        setCurrentStep(3);
        updateStepStatus(2, 'completed');
        updateStepStatus(3, 'active');
        setMotionData(eventData);
        break;
      case 'motion-detection-active':
        setCurrentStep(4);
        updateStepStatus(3, 'completed');
        updateStepStatus(4, 'active');
        break;
      case 'auto-resume-triggered':
        setCurrentStep(5);
        updateStepStatus(4, 'completed');
        updateStepStatus(5, 'active');
        break;
      case 'security-alert':
        setCurrentStep(6);
        updateStepStatus(5, 'completed');
        updateStepStatus(6, 'active');
        setSecurityAlerts(prev => [...prev, eventData]);
        break;
      case 'demo-completed':
        setDemoStatus('completed');
        setCurrentStep(7);
        updateStepStatus(6, 'completed');
        updateStepStatus(7, 'completed');
        setPerformanceMetrics(eventData);
        break;
      default:
        break;
    }
  };

  const updateStepStatus = (stepNumber, status) => {
    setDemoSteps(prev => prev.map(step => 
      step.id === stepNumber 
        ? { ...step, status }
        : step.status === 'active' 
          ? { ...step, status: 'pending' }
          : step
    ));
  };

  const startDemo = async () => {
    try {
      console.log('🚀 Starting EIC Demo...');
      
      // Add EIC demo scenario
      console.log('📝 Adding EIC demo scenario...');
      const scenarioResponse = await fetch('http://localhost:3002/api/scenarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'eic-demo',
          config: { type: 'eic-demo' }
        })
      });
      
      if (!scenarioResponse.ok) {
        throw new Error(`Failed to add scenario: ${scenarioResponse.status}`);
      }
      
      const scenarioResult = await scenarioResponse.json();
      console.log('✅ Scenario added:', scenarioResult);

      // Start the demo
      console.log('▶️ Starting EIC demo scenario...');
      const startResponse = await fetch('http://localhost:3002/api/scenarios/eic-demo/start', {
        method: 'POST'
      });
      
      if (!startResponse.ok) {
        throw new Error(`Failed to start scenario: ${startResponse.status}`);
      }
      
      const startResult = await startResponse.json();
      console.log('✅ Scenario started:', startResult);

      // Add some vehicles for the demo
      console.log('🚗 Adding demo vehicles...');
      const vehiclesResponse = await fetch('http://localhost:3002/api/vehicles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          count: 3,
          scenario: 'eic-demo'
        })
      });
      
      if (vehiclesResponse.ok) {
        const vehiclesResult = await vehiclesResponse.json();
        console.log('✅ Vehicles added:', vehiclesResult);
      }

      // Initialize demo data
      setDemoData({
        scenario: 'eic-demo',
        vehicles: 3,
        startTime: new Date().toISOString()
      });

      setDemoStatus('running');
      setElapsedTime(0);
      setCurrentStep(1);
      setVehicleStatus({
        total: 3,
        available: 3,
        inUse: 0,
        paused: 0
      });
      setMotionData({
        motionDetected: false,
        confidence: 0.0,
        pattern: 'stationary'
      });
      setSecurityAlerts([]);
      setPerformanceMetrics({});

      // Reset all steps
      setDemoSteps(prev => prev.map(step => ({ ...step, status: 'pending' })));
      updateStepStatus(1, 'active');
      
      console.log('🎉 EIC Demo started successfully!');

    } catch (error) {
      console.error('❌ Error starting demo:', error);
      alert(`Failed to start demo: ${error.message}`);
    }
  };

  const pauseDemo = () => {
    setDemoStatus('paused');
  };

  const resumeDemo = () => {
    setDemoStatus('running');
  };

  const stopDemo = () => {
    setDemoStatus('idle');
    setElapsedTime(0);
    setCurrentStep(0);
    setDemoData({});
    setVehicleStatus({});
    setMotionData({});
    setSecurityAlerts([]);
    setPerformanceMetrics({});
    setDemoSteps(prev => prev.map(step => ({ ...step, status: 'pending' })));
  };

  const resetDemo = () => {
    stopDemo();
    startDemo();
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getStepColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'active': return 'primary';
      case 'pending': return 'default';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ color: 'primary.main' }}>
          🎬 EIC Accelerator Demo
        </Typography>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          Smart Pause & Resume Innovation Demonstration
        </Typography>
        <Typography variant="body1" color="text.secondary">
          €2.5M Deep-Tech Funding Program - Complete Innovation Showcase in 60 Seconds
        </Typography>
      </Box>

      {/* Connection Status */}
      <Alert 
        severity={isConnected ? 'success' : 'error'} 
        sx={{ mb: 3 }}
        action={
          <Button 
            color="inherit" 
            size="small"
            onClick={() => window.location.reload()}
          >
            Reconnect
          </Button>
        }
      >
        {isConnected ? 'Connected to Vehicle Simulator' : 'Disconnected from Vehicle Simulator'}
      </Alert>

      {/* Demo Controls */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Typography variant="h6">Demo Controls</Typography>
            <Chip 
              label={demoStatus.toUpperCase()} 
              color={demoStatus === 'running' ? 'success' : demoStatus === 'paused' ? 'warning' : 'default'}
              variant="outlined"
            />
          </Box>
          
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              color="success"
              startIcon={<PlayArrow />}
              onClick={startDemo}
              disabled={demoStatus === 'running' || !isConnected}
            >
              Start Demo
            </Button>
            
            <Button
              variant="contained"
              color="warning"
              startIcon={<Pause />}
              onClick={pauseDemo}
              disabled={demoStatus !== 'running'}
            >
              Pause
            </Button>
            
            <Button
              variant="contained"
              color="info"
              startIcon={<PlayCircleOutline />}
              onClick={resumeDemo}
              disabled={demoStatus !== 'paused'}
            >
              Resume
            </Button>
            
            <Button
              variant="contained"
              color="error"
              startIcon={<Stop />}
              onClick={stopDemo}
              disabled={demoStatus === 'idle'}
            >
              Stop
            </Button>
            
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={resetDemo}
              disabled={!isConnected}
            >
              Reset
            </Button>
          </Box>

          {/* Progress Bar */}
          {demoStatus !== 'idle' && (
            <Box sx={{ mt: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">
                  Progress: {currentStep}/{totalSteps} steps
                </Typography>
                <Typography variant="body2">
                  Time: {formatTime(elapsedTime)} / 01:00
                </Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={(currentStep / totalSteps) * 100}
                sx={{ height: 8, borderRadius: 4 }}
              />
            </Box>
          )}
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        {/* Demo Steps */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Demo Steps
              </Typography>
              <List>
                {demoSteps.map((step) => (
                  <ListItem key={step.id} sx={{ px: 0 }}>
                    <ListItemIcon>
                      <Box sx={{ fontSize: '1.5rem' }}>{step.icon}</Box>
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body1" fontWeight="medium">
                            {step.title}
                          </Typography>
                          <Chip 
                            label={step.status} 
                            size="small" 
                            color={getStepColor(step.status)}
                            variant={step.status === 'active' ? 'filled' : 'outlined'}
                          />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {step.description}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Duration: {step.duration}s
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Real-time Data */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Real-time Data
              </Typography>
              
              {/* Vehicle Status */}
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="primary" gutterBottom>
                  Vehicle Status
                </Typography>
                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <Typography variant="body2">Total: {vehicleStatus.total || 0}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2">Available: {vehicleStatus.available || 0}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2">In Use: {vehicleStatus.inUse || 0}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2">Paused: {vehicleStatus.paused || 0}</Typography>
                  </Grid>
                </Grid>
              </Box>

              {/* Motion Data */}
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="primary" gutterBottom>
                  Motion Analysis
                </Typography>
                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <Typography variant="body2">Motion Detected: {motionData.motionDetected ? 'Yes' : 'No'}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2">Confidence: {Math.round((motionData.confidence || 0) * 100)}%</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2">Pattern: {motionData.pattern || 'Unknown'}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2">Status: {motionData.motionDetected ? 'Active' : 'Stationary'}</Typography>
                  </Grid>
                </Grid>
              </Box>

              {/* Security Alerts */}
              <Box>
                <Typography variant="subtitle2" color="error" gutterBottom>
                  Security Alerts
                </Typography>
                {securityAlerts.length > 0 ? (
                  securityAlerts.map((alert, index) => (
                    <Alert key={index} severity="warning" sx={{ mb: 1 }}>
                      <Typography variant="body2" fontWeight="bold">
                        {alert.type?.replace('_', ' ').toUpperCase() || 'Security Alert'}
                      </Typography>
                      <Typography variant="body2">
                        {alert.description || 'Security event detected'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(alert.timestamp).toLocaleTimeString()}
                      </Typography>
                    </Alert>
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No security alerts at this time
                  </Typography>
                )}
              </Box>

              {/* Demo Data */}
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" color="info.main" gutterBottom>
                  Demo Information
                </Typography>
                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <Typography variant="body2">Scenario: {demoData.scenario || 'None'}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2">Vehicles: {demoData.vehicles || 0}</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2">Start Time: {demoData.startTime ? new Date(demoData.startTime).toLocaleTimeString() : 'Not started'}</Typography>
                  </Grid>
                </Grid>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Innovation Highlights */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                🚀 Innovation Highlights
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={3}>
                  <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'primary.dark' }}>
                    <Speed sx={{ fontSize: 40, color: 'white', mb: 1 }} />
                    <Typography variant="h6" color="white">Smart Pause</Typography>
                    <Typography variant="body2" color="white">
                      Revolutionary 10-minute pause system
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'secondary.dark' }}>
                    <Timeline sx={{ fontSize: 40, color: 'white', mb: 1 }} />
                    <Typography variant="h6" color="white">Motion Detection</Typography>
                    <Typography variant="body2" color="white">
                      AI-powered pattern recognition
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'success.dark' }}>
                    <TrendingUp sx={{ fontSize: 40, color: 'white', mb: 1 }} />
                    <Typography variant="h6" color="white">Auto-Resume</Typography>
                    <Typography variant="body2" color="white">
                      Automatic ride continuation
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'warning.dark' }}>
                    <Security sx={{ fontSize: 40, color: 'white', mb: 1 }} />
                    <Typography variant="h6" color="white">Theft Prevention</Typography>
                    <Typography variant="body2" color="white">
                      Real-time security monitoring
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Performance Metrics */}
        {demoStatus === 'completed' && performanceMetrics.technicalMetrics && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  📊 Demo Performance Metrics
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={4}>
                    <Typography variant="subtitle1" color="primary" gutterBottom>
                      Technical Excellence
                    </Typography>
                    <List dense>
                      {Object.entries(performanceMetrics.technicalMetrics).map(([key, value]) => (
                        <ListItem key={key} sx={{ px: 0 }}>
                          <ListItemIcon>
                            <CheckCircle color="success" />
                          </ListItemIcon>
                          <ListItemText
                            primary={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                            secondary={value}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="subtitle1" color="secondary" gutterBottom>
                      Business Value
                    </Typography>
                    <List dense>
                      {Object.entries(performanceMetrics.businessValue).map(([key, value]) => (
                        <ListItem key={key} sx={{ px: 0 }}>
                          <ListItemIcon>
                            <TrendingUp color="secondary" />
                          </ListItemIcon>
                          <ListItemText
                            primary={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                            secondary={value}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="subtitle1" color="success" gutterBottom>
                      EIC Accelerator Ready
                    </Typography>
                    <List dense>
                      {performanceMetrics.innovationPoints?.map((point, index) => (
                        <ListItem key={index} sx={{ px: 0 }}>
                          <ListItemIcon>
                            <CheckCircle color="success" />
                          </ListItemIcon>
                          <ListItemText primary={point} />
                        </ListItem>
                      ))}
                    </List>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default EICDemo;
