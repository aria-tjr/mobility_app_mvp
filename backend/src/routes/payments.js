const express = require('express');
const router = express.Router();

// Health check for payment service
router.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'Payment Service' });
});

// Initialize payment session for ride
router.post('/create-session', async (req, res) => {
  try {
    const { rideId, userId, amount, currency = 'eur' } = req.body;
    
    // TODO: Integrate with Stripe for real payments
    // For MVP demo, simulate payment session creation
    
    const paymentSession = {
      id: 'ps_' + Date.now(),
      rideId,
      userId,
      amount,
      currency,
      status: 'pending',
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
      stripe: {
        sessionId: 'cs_test_' + Math.random().toString(36).substr(2, 9),
        paymentIntentId: 'pi_test_' + Math.random().toString(36).substr(2, 9)
      }
    };
    
    res.json({ 
      message: 'Payment session created successfully',
      session: paymentSession,
      clientSecret: 'pi_test_secret_' + Math.random().toString(36).substr(2, 9)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Process Smart Pause & Resume payment
router.post('/process-pause-payment', async (req, res) => {
  try {
    const { rideId, pauseDuration, baseRate, pauseRate } = req.body;
    
    // Calculate pause savings
    const fullCost = (pauseDuration / 60) * baseRate; // Convert seconds to minutes
    const pauseCost = (pauseDuration / 60) * pauseRate;
    const savings = fullCost - pauseCost;
    
    const pausePayment = {
      id: 'pp_' + Date.now(),
      rideId,
      pauseDuration,
      baseRate,
      pauseRate,
      fullCost: Math.round(fullCost * 100) / 100,
      pauseCost: Math.round(pauseCost * 100) / 100,
      savings: Math.round(savings * 100) / 100,
      status: 'completed',
      processedAt: new Date()
    };
    
    res.json({ 
      message: 'Pause payment processed successfully',
      payment: pausePayment,
      smartPause: {
        savings: pausePayment.savings,
        efficiency: savings > 0 ? 'cost_effective' : 'standard_rate',
        userBenefit: `Saved €${pausePayment.savings} during ${Math.round(pauseDuration / 60)} minute pause`
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Process ride completion payment
router.post('/complete-ride', async (req, res) => {
  try {
    const { rideId, totalDistance, totalDuration, pauseTime, baseRate } = req.body;
    
    // Calculate final ride cost with Smart Pause & Resume
    const activeTime = totalDuration - pauseTime;
    const activeCost = (activeTime / 60) * baseRate;
    const pauseCost = (pauseTime / 60) * (baseRate * 0.5); // 50% rate during pause
    const totalCost = activeCost + pauseCost;
    
    const ridePayment = {
      id: 'rp_' + Date.now(),
      rideId,
      totalDistance: Math.round(totalDistance * 100) / 100,
      totalDuration,
      pauseTime,
      activeTime,
      baseRate,
      activeCost: Math.round(activeCost * 100) / 100,
      pauseCost: Math.round(pauseCost * 100) / 100,
      totalCost: Math.round(totalCost * 100) / 100,
      savings: Math.round((pauseTime / 60) * (baseRate * 0.5) * 100) / 100,
      status: 'completed',
      processedAt: new Date()
    };
    
    res.json({ 
      message: 'Ride payment completed successfully',
      payment: ridePayment,
      smartPause: {
        totalSavings: ridePayment.savings,
        efficiency: pauseTime > 0 ? 'pause_optimized' : 'standard_ride',
        userBenefit: `Smart Pause saved you €${ridePayment.savings}`
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get payment history for user
router.get('/user/:userId/history', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // TODO: Fetch from database
    const paymentHistory = [
      {
        id: 'rp_1',
        rideId: 'ride_1',
        amount: 15.50,
        status: 'completed',
        date: new Date(Date.now() - 24 * 60 * 60 * 1000),
        smartPause: {
          savings: 2.25,
          pauseTime: 180
        }
      },
      {
        id: 'rp_2',
        rideId: 'ride_2',
        amount: 12.80,
        status: 'completed',
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        smartPause: {
          savings: 1.50,
          pauseTime: 120
        }
      }
    ];
    
    res.json({ 
      message: 'Payment history retrieved successfully',
      userId,
      payments: paymentHistory,
      totalSavings: paymentHistory.reduce((sum, p) => sum + (p.smartPause?.savings || 0), 0)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Smart Pause & Resume analytics
router.get('/analytics/smart-pause', async (req, res) => {
  try {
    const analytics = {
      totalRides: 150,
      ridesWithPause: 89,
      totalPauseTime: 26700, // seconds
      totalSavings: 45.75,
      averageSavingsPerRide: 0.51,
      pauseUtilization: 59.3, // percentage
      userSatisfaction: 4.8, // out of 5
      costEfficiency: 'excellent'
    };
    
    res.json({ 
      message: 'Smart Pause analytics retrieved successfully',
      analytics,
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Simulate payment failure for testing
router.post('/simulate-failure', async (req, res) => {
  try {
    const { scenario } = req.body;
    
    let failureResponse;
    
    switch (scenario) {
      case 'insufficient_funds':
        failureResponse = {
          error: 'insufficient_funds',
          message: 'Your card has insufficient funds',
          code: 'card_declined',
          declineCode: 'insufficient_funds'
        };
        break;
        
      case 'expired_card':
        failureResponse = {
          error: 'expired_card',
          message: 'Your card has expired',
          code: 'expired_card'
        };
        break;
        
      case 'fraud_detection':
        failureResponse = {
          error: 'fraud_detection',
          message: 'Transaction flagged for fraud review',
          code: 'fraud_detection'
        };
        break;
        
      default:
        return res.status(400).json({ error: 'Invalid failure scenario' });
    }
    
    res.json({ 
      message: 'Payment failure simulated successfully',
      scenario,
      failure: failureResponse,
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get payment methods for user
router.get('/user/:userId/payment-methods', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // TODO: Fetch from Stripe customer
    const paymentMethods = [
      {
        id: 'pm_1',
        type: 'card',
        brand: 'visa',
        last4: '4242',
        expMonth: 12,
        expYear: 2025,
        isDefault: true
      },
      {
        id: 'pm_2',
        type: 'card',
        brand: 'mastercard',
        last4: '5555',
        expMonth: 8,
        expYear: 2026,
        isDefault: false
      }
    ];
    
    res.json({ 
      message: 'Payment methods retrieved successfully',
      userId,
      paymentMethods
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add new payment method
router.post('/user/:userId/payment-methods', async (req, res) => {
  try {
    const { userId } = req.params;
    const { paymentMethodId, isDefault = false } = req.body;
    
    // TODO: Attach to Stripe customer
    const newPaymentMethod = {
      id: paymentMethodId || 'pm_' + Date.now(),
      type: 'card',
      brand: 'visa',
      last4: '4242',
      expMonth: 12,
      expYear: 2025,
      isDefault,
      createdAt: new Date()
    };
    
    res.json({ 
      message: 'Payment method added successfully',
      userId,
      paymentMethod: newPaymentMethod
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get payment status
router.get('/status/:paymentId', async (req, res) => {
  try {
    const { paymentId } = req.params;
    
    // TODO: Fetch from database/Stripe
    const paymentStatus = {
      id: paymentId,
      status: 'completed',
      amount: 15.50,
      currency: 'eur',
      createdAt: new Date(Date.now() - 60 * 60 * 1000),
      completedAt: new Date(Date.now() - 30 * 60 * 1000),
      smartPause: {
        savings: 2.25,
        pauseTime: 180
      }
    };
    
    res.json({ 
      message: 'Payment status retrieved successfully',
      payment: paymentStatus
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
