import React from 'react';
import { Box, Typography, Grid, Card, CardContent } from '@mui/material';

const Dashboard = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        🚗 Fleet Dashboard
      </Typography>
      <Typography variant="body1" color="text.secondary" gutterBottom>
        Real-time monitoring and management of your Smart Mobility fleet
      </Typography>
      
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} md={6} lg={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="primary">
                Total Vehicles
              </Typography>
              <Typography variant="h4">0</Typography>
              <Typography variant="body2" color="text.secondary">
                In fleet
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6} lg={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="success.main">
                Active Rides
              </Typography>
              <Typography variant="h4">0</Typography>
              <Typography variant="body2" color="text.secondary">
                Currently in progress
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6} lg={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="warning.main">
                Paused Rides
              </Typography>
              <Typography variant="h4">0</Typography>
              <Typography variant="body2" color="text.secondary">
                Smart Pause active
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6} lg={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="info.main">
                Revenue Today
              </Typography>
              <Typography variant="h4">€0</Typography>
              <Typography variant="body2" color="text.secondary">
                Smart Pause optimized
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
