// Smart Pause & Resume Prototype App
class SmartPausePrototype {
    constructor() {
        this.currentSection = 'dashboard';
        this.demoRunning = false;
        this.demoTime = 0;
        this.demoInterval = null;
        this.currentStep = 0;
        this.init();
    }

    init() {
        this.setupNavigation();
        this.setupDemoControls();
        this.setupInteractiveElements();
        this.startLiveUpdates();
        console.log('🚀 Smart Pause & Resume Prototype initialized');
    }

    // Navigation Setup
    setupNavigation() {
        const navLinks = document.querySelectorAll('.nav-link');
        const sections = document.querySelectorAll('.section');

        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetSection = link.getAttribute('href').substring(1);
                this.showSection(targetSection);
                
                // Update active nav link
                navLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
            });
        });
    }

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
            
            // Special handling for EIC Demo section
            if (sectionId === 'eic-demo') {
                this.prepareDemoSection();
            }
        }
    }

    // Demo Controls Setup
    setupDemoControls() {
        this.startBtn = document.getElementById('startBtn');
        this.pauseBtn = document.getElementById('pauseBtn');
        this.stopBtn = document.getElementById('stopBtn');
        this.progressFill = document.getElementById('progressFill');
        this.progressText = document.getElementById('progressText');
        this.demoStatus = document.getElementById('demoStatus');
    }

    prepareDemoSection() {
        // Reset demo state when entering the section
        this.resetDemo();
        console.log('🎬 EIC Demo section prepared');
    }

    // Demo Functions
    startDemo() {
        if (this.demoRunning) return;

        console.log('🚀 Starting EIC Demo...');
        this.demoRunning = true;
        this.demoTime = 0;
        this.currentStep = 0;

        // Update UI
        this.startBtn.disabled = true;
        this.pauseBtn.disabled = false;
        this.stopBtn.disabled = false;
        this.demoStatus.textContent = 'Running';
        this.demoStatus.style.background = 'rgba(33, 150, 243, 0.2)';
        this.demoStatus.style.color = 'var(--primary-color)';

        // Start demo timer
        this.demoInterval = setInterval(() => {
            this.demoTime++;
            this.updateDemoProgress();
            this.checkDemoSteps();
        }, 1000);

        // Start first step
        this.activateStep(1);
    }

    pauseDemo() {
        if (!this.demoRunning) return;

        console.log('⏸️ Pausing EIC Demo...');
        this.demoRunning = false;
        clearInterval(this.demoInterval);

        // Update UI
        this.startBtn.disabled = false;
        this.pauseBtn.disabled = true;
        this.demoStatus.textContent = 'Paused';
        this.demoStatus.style.background = 'rgba(255, 152, 0, 0.2)';
        this.demoStatus.style.color = 'var(--warning-color)';
    }

    stopDemo() {
        console.log('⏹️ Stopping EIC Demo...');
        this.demoRunning = false;
        clearInterval(this.demoInterval);
        this.resetDemo();
    }

    resetDemo() {
        this.demoTime = 0;
        this.currentStep = 0;
        this.updateDemoProgress();
        this.resetAllSteps();

        // Update UI
        this.startBtn.disabled = false;
        this.pauseBtn.disabled = true;
        this.stopBtn.disabled = true;
        this.demoStatus.textContent = 'Ready';
        this.demoStatus.style.background = 'rgba(76, 175, 80, 0.2)';
        this.demoStatus.style.color = 'var(--success-color)';
    }

    updateDemoProgress() {
        const progress = (this.demoTime / 60) * 100;
        this.progressFill.style.width = `${Math.min(progress, 100)}%`;
        
        const minutes = Math.floor(this.demoTime / 60);
        const seconds = this.demoTime % 60;
        this.progressText.textContent = `${minutes}:${seconds.toString().padStart(2, '0')} / 1:00`;
    }

    checkDemoSteps() {
        // Demo step timing (in seconds)
        const stepTimings = [5, 12, 24, 34, 44, 54, 60];
        
        stepTimings.forEach((timing, index) => {
            if (this.demoTime === timing && this.currentStep === index) {
                this.completeStep(index + 1);
                if (index < stepTimings.length - 1) {
                    this.activateStep(index + 2);
                }
            }
        });

        // Auto-complete demo after 60 seconds
        if (this.demoTime >= 60) {
            this.completeDemo();
        }
    }

    activateStep(stepNumber) {
        console.log(`🎯 Activating step ${stepNumber}`);
        this.currentStep = stepNumber - 1;
        
        // Update step status
        const stepElement = document.querySelector(`[data-step="${stepNumber}"]`);
        if (stepElement) {
            const statusElement = stepElement.querySelector('.step-status');
            statusElement.textContent = 'Active';
            statusElement.className = 'step-status active';
        }
    }

    completeStep(stepNumber) {
        console.log(`✅ Completing step ${stepNumber}`);
        
        // Update step status
        const stepElement = document.querySelector(`[data-step="${stepNumber}"]`);
        if (stepElement) {
            const statusElement = stepElement.querySelector('.step-status');
            statusElement.textContent = 'Completed';
            statusElement.className = 'step-status completed';
        }

        // Show step completion animation
        this.showStepCompletion(stepNumber);
    }

    showStepCompletion(stepNumber) {
        const stepElement = document.querySelector(`[data-step="${stepNumber}"]`);
        if (stepElement) {
            stepElement.style.transform = 'scale(1.05)';
            stepElement.style.borderColor = 'var(--success-color)';
            
            setTimeout(() => {
                stepElement.style.transform = 'scale(1)';
            }, 300);
        }
    }

    resetAllSteps() {
        document.querySelectorAll('.step').forEach((step, index) => {
            const statusElement = step.querySelector('.step-status');
            statusElement.textContent = 'Pending';
            statusElement.className = 'step-status';
        });
    }

    completeDemo() {
        console.log('🎉 EIC Demo completed successfully!');
        clearInterval(this.demoInterval);
        this.demoRunning = false;
        
        // Update UI
        this.startBtn.disabled = false;
        this.pauseBtn.disabled = true;
        this.stopBtn.disabled = true;
        this.demoStatus.textContent = 'Completed';
        this.demoStatus.style.background = 'rgba(76, 175, 80, 0.2)';
        this.demoStatus.style.color = 'var(--success-color)';

        // Show completion message
        this.showDemoCompletion();
    }

    showDemoCompletion() {
        // Create completion notification
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: var(--success-color);
            color: white;
            padding: 20px;
            border-radius: var(--border-radius);
            box-shadow: var(--shadow);
            z-index: 10000;
            animation: slideIn 0.5s ease;
        `;
        notification.innerHTML = `
            <h4>🎉 EIC Demo Complete!</h4>
            <p>Innovation showcase finished successfully</p>
            <p><strong>Smart Pause Efficiency:</strong> 95%</p>
            <p><strong>Motion Detection:</strong> 87%</p>
            <p><strong>Security Score:</strong> A+</p>
        `;

        document.body.appendChild(notification);

        // Remove notification after 5 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.5s ease';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 500);
        }, 5000);
    }

    // Interactive Elements Setup
    setupInteractiveElements() {
        // Fleet management functions
        window.addVehicle = this.addVehicle.bind(this);
        window.refreshFleet = this.refreshFleet.bind(this);
        window.pauseVehicle = this.pauseVehicle.bind(this);
        window.resumeVehicle = this.resumeVehicle.bind(this);
        window.reserveVehicle = this.reserveVehicle.bind(this);

        // Map functions
        window.refreshMap = this.refreshMap.bind(this);

        // Demo functions
        window.startDemo = this.startDemo.bind(this);
        window.pauseDemo = this.pauseDemo.bind(this);
        window.stopDemo = this.stopDemo.bind(this);
    }

    // Fleet Management Functions
    addVehicle() {
        console.log('🚗 Adding new vehicle...');
        this.showNotification('Vehicle added successfully', 'success');
        
        // Simulate adding vehicle to table
        setTimeout(() => {
            this.refreshFleet();
        }, 1000);
    }

    refreshFleet() {
        console.log('🔄 Refreshing fleet data...');
        this.showNotification('Fleet data refreshed', 'info');
        
        // Simulate data refresh
        const fleetTable = document.querySelector('.fleet-table');
        fleetTable.style.opacity = '0.7';
        setTimeout(() => {
            fleetTable.style.opacity = '1';
        }, 500);
    }

    pauseVehicle(vehicleId) {
        console.log(`⏸️ Pausing vehicle ${vehicleId}...`);
        this.showNotification(`Vehicle ${vehicleId} paused`, 'warning');
        
        // Update vehicle status in table
        const row = document.querySelector(`tr:has(td:contains('${vehicleId}'))`);
        if (row) {
            const statusCell = row.querySelector('.status-badge');
            statusCell.textContent = 'Paused';
            statusCell.className = 'status-badge paused';
        }
    }

    resumeVehicle(vehicleId) {
        console.log(`▶️ Resuming vehicle ${vehicleId}...`);
        this.showNotification(`Vehicle ${vehicleId} resumed`, 'success');
        
        // Update vehicle status in table
        const row = document.querySelector(`tr:has(td:contains('${vehicleId}'))`);
        if (row) {
            const statusCell = row.querySelector('.status-badge');
            statusCell.textContent = 'Active';
            statusCell.className = 'status-badge active';
        }
    }

    reserveVehicle(vehicleId) {
        console.log(`🔒 Reserving vehicle ${vehicleId}...`);
        this.showNotification(`Vehicle ${vehicleId} reserved`, 'info');
        
        // Update vehicle status in table
        const row = document.querySelector(`tr:has(td:contains('${vehicleId}'))`);
        if (row) {
            const statusCell = row.querySelector('.status-badge');
            statusCell.textContent = 'Reserved';
            statusCell.className = 'status-badge active';
        }
    }

    // Map Functions
    refreshMap() {
        console.log('🗺️ Refreshing map...');
        this.showNotification('Map refreshed', 'info');
        
        // Simulate map refresh
        const mapContainer = document.querySelector('.map-placeholder');
        mapContainer.style.opacity = '0.7';
        setTimeout(() => {
            mapContainer.style.opacity = '1';
        }, 500);
    }

    // Live Updates
    startLiveUpdates() {
        // Simulate real-time data updates
        setInterval(() => {
            this.updateDashboardData();
        }, 5000);

        // Simulate connection status changes
        setInterval(() => {
            this.simulateConnectionStatus();
        }, 15000);
    }

    updateDashboardData() {
        // Update dashboard card values randomly
        const cardValues = document.querySelectorAll('.card-value');
        cardValues.forEach(card => {
            if (Math.random() > 0.7) { // 30% chance to update
                const currentValue = card.textContent;
                if (currentValue.includes('€')) {
                    // Update revenue
                    const currentAmount = parseInt(currentValue.replace(/[€,]/g, ''));
                    const newAmount = currentAmount + Math.floor(Math.random() * 50);
                    card.textContent = `€${newAmount.toLocaleString()}`;
                } else if (currentValue.includes('%')) {
                    // Update percentage
                    const currentPercent = parseInt(currentValue);
                    const newPercent = Math.max(0, Math.min(100, currentPercent + (Math.random() > 0.5 ? 1 : -1)));
                    card.textContent = `${newPercent}%`;
                } else {
                    // Update count
                    const currentCount = parseInt(currentValue);
                    const newCount = Math.max(0, currentCount + (Math.random() > 0.5 ? 1 : -1));
                    card.textContent = newCount.toString();
                }
            }
        });
    }

    simulateConnectionStatus() {
        const statusIndicator = document.querySelector('.status-indicator');
        const statusText = document.querySelector('.status-text');
        
        if (Math.random() > 0.8) { // 20% chance to simulate disconnection
            statusIndicator.classList.remove('connected');
            statusIndicator.classList.add('disconnected');
            statusText.textContent = 'Disconnected';
            statusText.style.color = 'var(--danger-color)';
            
            // Reconnect after 3 seconds
            setTimeout(() => {
                statusIndicator.classList.remove('disconnected');
                statusIndicator.classList.add('connected');
                statusText.textContent = 'Connected';
                statusText.style.color = 'var(--dark-text)';
            }, 3000);
        }
    }

    // Utility Functions
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: var(--${type === 'success' ? 'success' : type === 'warning' ? 'warning' : type === 'danger' ? 'danger' : 'primary'}-color);
            color: white;
            padding: 16px 20px;
            border-radius: var(--border-radius);
            box-shadow: var(--shadow);
            z-index: 10000;
            animation: slideIn 0.5s ease;
            max-width: 300px;
        `;
        notification.textContent = message;

        document.body.appendChild(notification);

        // Remove notification after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.5s ease';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 500);
        }, 3000);
    }

    // Vehicle marker interactions
    setupVehicleMarkers() {
        const markers = document.querySelectorAll('.vehicle-marker');
        markers.forEach(marker => {
            marker.addEventListener('click', () => {
                const vehicleId = marker.getAttribute('data-vehicle');
                this.showVehicleDetails(vehicleId);
            });
        });
    }

    showVehicleDetails(vehicleId) {
        const details = {
            'V001': { location: 'Central Park', battery: '85%', status: 'Active' },
            'V002': { location: 'Coffee Shop', battery: '72%', status: 'Paused' },
            'V003': { location: 'Station A', battery: '91%', status: 'Available' }
        };

        const vehicle = details[vehicleId];
        if (vehicle) {
            this.showNotification(`Vehicle ${vehicleId}: ${vehicle.status} at ${vehicle.location} (Battery: ${vehicle.battery})`, 'info');
        }
    }
}

// CSS Animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
    }
`;
document.head.appendChild(style);

// Initialize the prototype when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.smartPausePrototype = new SmartPausePrototype();
    
    // Setup vehicle markers
    setTimeout(() => {
        window.smartPausePrototype.setupVehicleMarkers();
    }, 1000);
    
    console.log('🎉 Smart Pause & Resume Prototype loaded successfully!');
});

// Export for external use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SmartPausePrototype;
}
