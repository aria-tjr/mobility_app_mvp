class ScenarioManager {
  constructor() {
    this.scenarios = new Map();
    this.activeScenarios = new Map();
  }

  addScenario(name, config) {
    this.scenarios.set(name, config);
    return config;
  }

  startScenario(name) {
    const scenario = this.scenarios.get(name);
    if (scenario) {
      this.activeScenarios.set(name, {
        ...scenario,
        startTime: Date.now(),
        isRunning: true
      });
      return true;
    }
    return false;
  }

  stopScenario(name) {
    return this.activeScenarios.delete(name);
  }

  getActiveScenarios() {
    return Array.from(this.activeScenarios.values());
  }

  getAllScenarios() {
    return Array.from(this.scenarios.values());
  }
}

module.exports = ScenarioManager;
