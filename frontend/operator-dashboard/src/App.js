import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box, Container } from '@mui/material';
import socketService from './utils/socket';
import apiService from './utils/api';

// Components
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import FleetManagement from './pages/FleetManagement';
import EICDemo from './pages/EICDemo';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';

// Context
import { DashboardProvider } from './context/DashboardContext';

// Theme
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#2196f3',
    },
    secondary: {
      main: '#f50057',
    },
    background: {
      default: '#0a0a0a',
      paper: '#1a1a1a',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 500,
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#1a1a1a',
          border: '1px solid #333',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: '#1a1a1a',
          border: '1px solid #333',
        },
      },
    },
  },
});

function App() {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    // Initialize Socket.IO connection using the service
    try {
      const newSocket = socketService.connect();
      
      // Listen for connection status changes
      socketService.on('vehicles-updated', (data) => {
        console.log('🚗 Vehicles updated:', data);
      });

      socketService.on('telemetry-update', (data) => {
        console.log('📊 Telemetry update:', data);
      });

      socketService.on('bulk-telemetry-update', (data) => {
        console.log('📊 Bulk telemetry update:', data);
      });

      socketService.on('eic-demo-event', (data) => {
        console.log('🎬 EIC Demo event:', data);
      });

      socketService.on('performance-report', (data) => {
        console.log('📊 Performance report:', data);
      });

      // Check connection status periodically
      const checkConnection = () => {
        const status = socketService.getConnectionStatus();
        setIsConnected(status.isConnected);
      };

      checkConnection();
      const interval = setInterval(checkConnection, 2000);

      setSocket(newSocket);

      return () => {
        clearInterval(interval);
        socketService.disconnect();
      };
    } catch (error) {
      console.error('Failed to initialize socket service:', error);
    }
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <DashboardProvider socket={socket} isConnected={isConnected}>
        <Router>
          <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
            <Header 
              onMenuClick={toggleSidebar}
              isConnected={isConnected}
            />
            
            <Sidebar 
              open={sidebarOpen}
              onClose={() => setSidebarOpen(false)}
            />
            
            <Box
              component="main"
              sx={{
                flexGrow: 1,
                p: 3,
                mt: 8,
                ml: sidebarOpen ? '240px' : 0,
                transition: theme.transitions.create('margin', {
                  easing: theme.transitions.easing.sharp,
                  duration: theme.transitions.duration.leavingScreen,
                }),
              }}
            >
              <Container maxWidth="xl">
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/fleet" element={<FleetManagement />} />
                  <Route path="/eic-demo" element={<EICDemo />} />
                  <Route path="/analytics" element={<Analytics />} />
                  <Route path="/settings" element={<Settings />} />
                </Routes>
              </Container>
            </Box>
          </Box>
        </Router>
      </DashboardProvider>
    </ThemeProvider>
  );
}

export default App;
