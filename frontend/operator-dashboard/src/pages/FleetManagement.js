import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';

const FleetManagement = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        🚗 Fleet Management
      </Typography>
      <Typography variant="body1" color="text.secondary" gutterBottom>
        Manage your vehicle fleet and monitor real-time status
      </Typography>
      
      <Card sx={{ mt: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Vehicle Fleet Overview
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Fleet management features coming soon...
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default FleetManagement;
