// Smart Pause & Resume Mobile App
class SmartPauseMobileApp {
    constructor() {
        this.currentSection = 'mapSection';
        this.selectedVehicle = null;
        this.activeRide = null;
        this.rideTimer = null;
        this.rideStartTime = null;
        this.notificationCount = 0;
        this.userProfile = {
            name: 'John Doe',
            email: 'cinque.diecidue@gmail.com',
            totalRides: 24,
            totalDistance: 156.7,
            smartPauseSavings: 28.50
        };
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.simulateLoading();
        this.updateNotificationCount();
        console.log('🚗 Smart Pause & Resume Mobile App initialized');
    }

    // Setup Event Listeners
    setupEventListeners() {
        // Search functionality
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.handleSearch(e.target.value);
            });
        }

        // Vehicle marker interactions
        document.querySelectorAll('.vehicle-marker').forEach(marker => {
            marker.addEventListener('click', () => {
                const vehicleId = marker.getAttribute('data-vehicle');
                this.selectVehicle(vehicleId);
            });
        });

        // Bottom navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', () => {
                const section = item.getAttribute('onclick').match(/'([^']+)'/)[1];
                this.showSection(section);
            });
        });
    }

    // Loading Simulation
    simulateLoading() {
        setTimeout(() => {
            document.getElementById('loadingScreen').style.display = 'none';
            document.getElementById('appContainer').style.display = 'block';
            this.showToast('Welcome to Smart Pause & Resume!', 'success');
        }, 2000);
    }

    // Navigation Functions
    showSection(sectionId) {
        // Hide all sections
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
        });

        // Show target section
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.add('active');
            this.currentSection = sectionId;
            
            // Update navigation
            document.querySelectorAll('.nav-item').forEach(item => {
                item.classList.remove('active');
            });
            
            const navItem = document.querySelector(`[onclick*="${sectionId}"]`);
            if (navItem) {
                navItem.classList.add('active');
            }
        }
    }

    // Vehicle Management
    selectVehicle(vehicleId) {
        this.selectedVehicle = {
            id: vehicleId,
            battery: this.getVehicleBattery(vehicleId),
            location: this.getVehicleLocation(vehicleId),
            eta: this.getVehicleETA(vehicleId)
        };

        // Update vehicle details
        document.getElementById('selectedVehicleId').textContent = `Vehicle ${vehicleId}`;
        document.getElementById('vehicleBattery').textContent = this.selectedVehicle.battery;
        document.getElementById('vehicleLocation').textContent = this.selectedVehicle.location;
        document.getElementById('vehicleETA').textContent = this.selectedVehicle.eta;

        // Show vehicle section
        this.showSection('vehicleSection');
    }

    getVehicleBattery(vehicleId) {
        const batteries = { 'V001': '85%', 'V002': '72%', 'V003': '91%' };
        return batteries[vehicleId] || '85%';
    }

    getVehicleLocation(vehicleId) {
        const locations = { 'V001': 'Central Park', 'V002': 'Coffee Shop', 'V003': 'Station A' };
        return locations[vehicleId] || 'Central Park';
    }

    getVehicleETA(vehicleId) {
        const etas = { 'V001': '2 min', 'V002': '5 min', 'V003': '3 min' };
        return etas[vehicleId] || '2 min';
    }

    backToMap() {
        this.showSection('mapSection');
        this.selectedVehicle = null;
    }

    // Vehicle Actions
    unlockVehicle() {
        if (!this.selectedVehicle) return;

        console.log(`🔓 Unlocking vehicle ${this.selectedVehicle.id}...`);
        this.showToast(`Vehicle ${this.selectedVehicle.id} unlocked!`, 'success');
        
        // Start ride
        this.startRide(this.selectedVehicle.id);
    }

    reserveVehicle() {
        if (!this.selectedVehicle) return;

        console.log(`⏰ Reserving vehicle ${this.selectedVehicle.id}...`);
        this.showToast(`Vehicle ${this.selectedVehicle.id} reserved for 15 minutes`, 'info');
        
        // Show countdown
        this.showReservationCountdown();
    }

    startRide(vehicleId) {
        this.activeRide = {
            vehicleId: vehicleId,
            startTime: new Date(),
            distance: 0,
            cost: 0,
            isPaused: false,
            pauseStartTime: null
        };

        this.rideStartTime = Date.now();
        this.startRideTimer();
        this.showSection('activeRideSection');
        
        // Update user status
        document.querySelector('.user-status').textContent = 'Riding...';
        
        this.showToast('Ride started! Use Smart Pause for breaks.', 'success');
    }

    startRideTimer() {
        this.rideTimer = setInterval(() => {
            if (this.activeRide && !this.activeRide.isPaused) {
                const elapsed = Date.now() - this.rideStartTime;
                const minutes = Math.floor(elapsed / 60000);
                const seconds = Math.floor((elapsed % 60000) / 1000);
                
                document.getElementById('rideTimer').textContent = 
                    `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
                
                // Update distance and cost
                this.activeRide.distance += 0.001; // Simulate movement
                this.activeRide.cost += 0.01; // Simulate cost increase
                
                document.getElementById('rideDistance').textContent = 
                    `${this.activeRide.distance.toFixed(1)} km`;
                document.getElementById('rideCost').textContent = 
                    `€${this.activeRide.cost.toFixed(2)}`;
            }
        }, 1000);
    }

    pauseRide() {
        if (!this.activeRide || this.activeRide.isPaused) return;

        console.log('⏸️ Pausing ride with Smart Pause...');
        this.activeRide.isPaused = true;
        this.activeRide.pauseStartTime = Date.now();
        
        // Update UI
        const pauseBtn = document.getElementById('pauseBtn');
        pauseBtn.innerHTML = '<i class="fas fa-play"></i><span>Resume</span>';
        pauseBtn.onclick = () => this.resumeRide();
        pauseBtn.className = 'action-btn success';
        
        document.getElementById('pauseStatus').textContent = 'Paused (Free)';
        document.getElementById('pauseStatus').style.color = 'var(--success-color)';
        
        this.showToast('Smart Pause activated! First 10 minutes are free.', 'success');
        
        // Start pause timer
        this.startPauseTimer();
    }

    resumeRide() {
        if (!this.activeRide || !this.activeRide.isPaused) return;

        console.log('▶️ Resuming ride...');
        this.activeRide.isPaused = false;
        
        // Calculate pause duration
        const pauseDuration = Date.now() - this.activeRide.pauseStartTime;
        const pauseMinutes = Math.floor(pauseDuration / 60000);
        
        // Update UI
        const pauseBtn = document.getElementById('pauseBtn');
        pauseBtn.innerHTML = '<i class="fas fa-pause"></i><span>Smart Pause</span>';
        pauseBtn.onclick = () => this.pauseRide();
        pauseBtn.className = 'action-btn warning';
        
        document.getElementById('pauseStatus').textContent = 'Active';
        document.getElementById('pauseStatus').style.color = 'var(--dark-text)';
        
        if (pauseMinutes <= 10) {
            this.showToast(`Resumed! ${pauseMinutes} minutes were completely free.`, 'success');
        } else {
            const extraMinutes = pauseMinutes - 10;
            const extraCost = extraMinutes * 0.05; // 50% rate
            this.showToast(`Resumed! Extra ${extraMinutes} minutes cost €${extraCost.toFixed(2)}.`, 'info');
        }
        
        this.activeRide.pauseStartTime = null;
    }

    startPauseTimer() {
        const pauseTimer = setInterval(() => {
            if (!this.activeRide || !this.activeRide.isPaused) {
                clearInterval(pauseTimer);
                return;
            }
            
            const pauseDuration = Date.now() - this.activeRide.pauseStartTime;
            const pauseMinutes = Math.floor(pauseDuration / 60000);
            
            if (pauseMinutes >= 10) {
                document.getElementById('pauseStatus').textContent = `Paused (€${(pauseMinutes - 10) * 0.05} extra)`;
                document.getElementById('pauseStatus').style.color = 'var(--warning-color)';
            }
        }, 1000);
    }

    endRide() {
        if (!this.activeRide) return;

        console.log('⏹️ Ending ride...');
        
        // Stop timer
        if (this.rideTimer) {
            clearInterval(this.rideTimer);
            this.rideTimer = null;
        }
        
        // Calculate final cost
        const finalCost = this.activeRide.cost;
        const totalDistance = this.activeRide.distance;
        const rideDuration = Math.floor((Date.now() - this.rideStartTime) / 60000);
        
        // Show ride summary
        this.showRideSummary({
            vehicleId: this.activeRide.vehicleId,
            distance: totalDistance,
            duration: rideDuration,
            cost: finalCost,
            startTime: this.activeRide.startTime
        });
        
        // Reset ride
        this.activeRide = null;
        this.rideStartTime = null;
        
        // Update user status
        document.querySelector('.user-status').textContent = 'Ready to ride';
        
        // Go back to map
        this.showSection('mapSection');
        
        this.showToast(`Ride ended! Total cost: €${finalCost.toFixed(2)}`, 'success');
    }

    showRideSummary(rideData) {
        const summary = `
            🚗 Ride Summary
            
            Vehicle: ${rideData.vehicleId}
            Distance: ${rideData.distance.toFixed(1)} km
            Duration: ${rideData.duration} minutes
            Total Cost: €${rideData.cost.toFixed(2)}
            Start Time: ${rideData.startTime.toLocaleTimeString()}
            
            Thank you for using Smart Pause & Resume!
        `;
        
        alert(summary);
    }

    // QR Code Functions
    scanQRCode() {
        this.showModal('qrModal');
    }

    simulateQRScan() {
        console.log('📱 Simulating QR code scan...');
        this.closeModal('qrModal');
        
        // Simulate finding vehicle
        const vehicleId = 'V001';
        this.selectVehicle(vehicleId);
        
        this.showToast('QR Code scanned successfully!', 'success');
    }

    // Map Functions
    refreshMap() {
        console.log('🗺️ Refreshing map...');
        this.showToast('Map refreshed', 'info');
        
        // Simulate map refresh
        const mapContainer = document.querySelector('.map-placeholder');
        mapContainer.style.opacity = '0.7';
        setTimeout(() => {
            mapContainer.style.opacity = '1';
        }, 500);
    }

    centerMap() {
        console.log('📍 Centering map on user location...');
        this.showToast('Map centered on your location', 'info');
    }

    // History Functions
    showRideHistory() {
        this.showSection('historySection');
    }

    showRideDetails(rideId) {
        console.log(`📋 Showing details for ride ${rideId}`);
        this.showToast(`Ride ${rideId} details`, 'info');
    }

    showFilters() {
        console.log('🔍 Showing ride filters...');
        this.showToast('Filter options', 'info');
    }

    // Profile Functions
    showPaymentMethods() {
        console.log('💳 Showing payment methods...');
        this.showToast('Payment methods', 'info');
    }

    showKYCVerification() {
        console.log('🆔 Showing KYC verification...');
        this.showToast('KYC verification status', 'info');
    }

    showPrivacySettings() {
        console.log('🔒 Showing privacy settings...');
        this.showToast('Privacy settings', 'info');
    }

    showSupport() {
        console.log('🎧 Showing support...');
        this.showToast('Support options', 'info');
    }

    logout() {
        console.log('🚪 Logging out...');
        this.showToast('Logged out successfully', 'success');
        
        // Reset app state
        setTimeout(() => {
            location.reload();
        }, 1000);
    }

    // Modal Functions
    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
        }
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
        }
    }

    // Notification Functions
    showNotifications() {
        this.showModal('notificationModal');
    }

    showSettings() {
        this.showModal('settingsModal');
    }

    updateNotificationCount() {
        this.notificationCount = Math.floor(Math.random() * 5);
        const badge = document.getElementById('notificationCount');
        if (badge) {
            badge.textContent = this.notificationCount;
            badge.style.display = this.notificationCount > 0 ? 'block' : 'none';
        }
    }

    // Toast Notifications
    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        
        const container = document.getElementById('toastContainer');
        container.appendChild(toast);
        
        // Auto-remove after 3 seconds
        setTimeout(() => {
            toast.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (container.contains(toast)) {
                    container.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }

    // Quick Actions
    showQuickActions() {
        console.log('⚡ Showing quick actions...');
        this.showToast('Quick actions menu', 'info');
    }

    // Reservation Functions
    showReservationCountdown() {
        let timeLeft = 15 * 60; // 15 minutes in seconds
        
        const countdown = setInterval(() => {
            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            
            this.showToast(`Reservation: ${minutes}:${seconds.toString().padStart(2, '0')} remaining`, 'warning');
            
            if (timeLeft <= 0) {
                clearInterval(countdown);
                this.showToast('Vehicle reservation expired', 'error');
            }
            
            timeLeft--;
        }, 60000); // Update every minute
    }

    // Search Functionality
    handleSearch(query) {
        if (query.length < 2) return;
        
        console.log(`🔍 Searching for: ${query}`);
        
        // Simulate search results
        const results = this.searchVehicles(query);
        this.showSearchResults(results);
    }

    searchVehicles(query) {
        const vehicles = [
            { id: 'V001', location: 'Central Park', distance: '50m', battery: '85%' },
            { id: 'V002', location: 'Coffee Shop', distance: '120m', battery: '72%' },
            { id: 'V003', location: 'Station A', distance: '200m', battery: '91%' }
        ];
        
        return vehicles.filter(vehicle => 
            vehicle.location.toLowerCase().includes(query.toLowerCase()) ||
            vehicle.id.toLowerCase().includes(query.toLowerCase())
        );
    }

    showSearchResults(results) {
        if (results.length === 0) {
            this.showToast('No vehicles found', 'warning');
            return;
        }
        
        this.showToast(`Found ${results.length} vehicles`, 'success');
    }

    // Utility Functions
    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    formatDistance(meters) {
        if (meters < 1000) {
            return `${meters}m`;
        }
        return `${(meters / 1000).toFixed(1)}km`;
    }

    formatCurrency(amount) {
        return `€${amount.toFixed(2)}`;
    }

    // Simulate Real-time Updates
    startRealTimeUpdates() {
        // Update notification count every 30 seconds
        setInterval(() => {
            this.updateNotificationCount();
        }, 30000);
        
        // Simulate vehicle movement
        setInterval(() => {
            this.simulateVehicleMovement();
        }, 10000);
    }

    simulateVehicleMovement() {
        const markers = document.querySelectorAll('.vehicle-marker');
        markers.forEach(marker => {
            const distanceElement = marker.querySelector('.distance');
            if (distanceElement) {
                const currentDistance = parseInt(distanceElement.textContent);
                const newDistance = Math.max(10, currentDistance + (Math.random() > 0.5 ? 5 : -5));
                distanceElement.textContent = `${newDistance}m away`;
            }
        });
    }
}

// Global Functions for HTML onclick handlers
window.selectVehicle = function(vehicleId) {
    window.smartPauseApp.selectVehicle(vehicleId);
};

window.backToMap = function() {
    window.smartPauseApp.backToMap();
};

window.unlockVehicle = function() {
    window.smartPauseApp.unlockVehicle();
};

window.reserveVehicle = function() {
    window.smartPauseApp.reserveVehicle();
};

window.pauseRide = function() {
    window.smartPauseApp.pauseRide();
};

window.endRide = function() {
    window.smartPauseApp.endRide();
};

window.scanQRCode = function() {
    window.smartPauseApp.scanQRCode();
};

window.simulateQRScan = function() {
    window.smartPauseApp.simulateQRScan();
};

window.refreshMap = function() {
    window.smartPauseApp.refreshMap();
};

window.centerMap = function() {
    window.smartPauseApp.centerMap();
};

window.showRideHistory = function() {
    window.smartPauseApp.showRideHistory();
};

window.showRideDetails = function(rideId) {
    window.smartPauseApp.showRideDetails(rideId);
};

window.showFilters = function() {
    window.smartPauseApp.showFilters();
};

window.showPaymentMethods = function() {
    window.smartPauseApp.showPaymentMethods();
};

window.showKYCVerification = function() {
    window.smartPauseApp.showKYCVerification();
};

window.showPrivacySettings = function() {
    window.smartPauseApp.showPrivacySettings();
};

window.showSupport = function() {
    window.smartPauseApp.showSupport();
};

window.logout = function() {
    window.smartPauseApp.logout();
};

window.showNotifications = function() {
    window.smartPauseApp.showNotifications();
};

window.showSettings = function() {
    window.smartPauseApp.showSettings();
};

window.showQuickActions = function() {
    window.smartPauseApp.showQuickActions();
};

window.closeModal = function(modalId) {
    window.smartPauseApp.closeModal(modalId);
};

window.showSection = function(sectionId) {
    window.smartPauseApp.showSection(sectionId);
};

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.smartPauseApp = new SmartPauseMobileApp();
    
    // Start real-time updates
    setTimeout(() => {
        window.smartPauseApp.startRealTimeUpdates();
    }, 5000);
    
    console.log('🎉 Smart Pause & Resume Mobile App loaded successfully!');
});

// Export for external use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SmartPauseMobileApp;
}
