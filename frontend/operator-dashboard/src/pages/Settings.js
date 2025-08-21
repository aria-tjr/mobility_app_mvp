import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';

const Settings = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        ⚙️ Settings
      </Typography>
      <Typography variant="body1" color="text.secondary" gutterBottom>
        Configure your Smart Mobility platform settings
      </Typography>
      
      <Card sx={{ mt: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Platform Configuration
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Settings features coming soon...
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Settings;
