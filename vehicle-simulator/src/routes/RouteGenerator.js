class RouteGenerator {
  constructor() {
    this.baseLocation = { lat: 40.7128, lng: -74.0060 }; // NYC
  }

  generateRandomRoute(startLocation = null, distance = 5) {
    const start = startLocation || this.baseLocation;
    const route = [start];
    
    for (let i = 0; i < 10; i++) {
      const lastPoint = route[route.length - 1];
      const newPoint = {
        lat: lastPoint.lat + (Math.random() - 0.5) * 0.01,
        lng: lastPoint.lng + (Math.random() - 0.5) * 0.01
      };
      route.push(newPoint);
    }
    
    return route;
  }

  generateTrafficRoute() {
    return this.generateRandomRoute(null, 3);
  }

  generateParkingRoute() {
    return this.generateRandomRoute(null, 1);
  }
}

module.exports = RouteGenerator;
