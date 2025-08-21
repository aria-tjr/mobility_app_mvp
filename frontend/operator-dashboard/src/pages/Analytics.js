import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';

const Analytics = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        📊 Analytics & Insights
      </Typography>
      <Typography variant="body1" color="text.secondary" gutterBottom>
        Performance metrics and business intelligence for your Smart Mobility platform
      </Typography>
      
      <Card sx={{ mt: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Smart Pause Analytics
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Analytics features coming soon...
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Analytics;
