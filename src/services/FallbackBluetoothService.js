/**
 * Fallback Bluetooth service when native module is not available
 * Provides mock functionality for development and testing
 */

class FallbackBluetoothService {
  constructor() {
    this.isConnected = false;
    this.connectedDevice = null;
    this.listeners = [];
    this.mockDevices = [
      {id: '00:11:22:33:44:55', name: 'Mock Headphone 1'},
      {id: 'AA:BB:CC:DD:EE:FF', name: 'Mock Headphone 2'},
    ];
  }

  /**
   * Request Bluetooth permissions
   * @returns {Promise<boolean>} True if permissions granted
   */
  async requestPermissions() {
    console.log('Mock: Requesting Bluetooth permissions...');
    return true;
  }

  /**
   * Enable Bluetooth
   * @returns {Promise<boolean>} True if enabled
   */
  async enableBluetooth() {
    console.log('Mock: Enabling Bluetooth...');
    return true;
  }

  /**
   * Get paired devices
   * @returns {Promise<Array>} Array of paired devices
   */
  async getPairedDevices() {
    console.log('Mock: Getting paired devices...');
    return this.mockDevices;
  }

  /**
   * Connect to device
   * @param {string} deviceId - Device ID to connect to
   * @returns {Promise<boolean>} True if connected
   */
  async connectToDevice(deviceId) {
    console.log(`Mock: Connecting to device: ${deviceId}`);
    
    // Simulate connection delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    this.isConnected = true;
    this.connectedDevice = {id: deviceId, name: 'Mock GAIA Device'};
    
    this.notifyListeners('onDeviceConnected', this.connectedDevice);
    return true;
  }

  /**
   * Disconnect from device
   * @returns {Promise<boolean>} True if disconnected
   */
  async disconnect() {
    console.log('Mock: Disconnecting from device');
    
    this.isConnected = false;
    this.connectedDevice = null;
    
    this.notifyListeners('onDeviceDisconnected');
    return true;
  }

  /**
   * Send data to connected device
   * @param {Uint8Array} data - Data to send
   * @returns {Promise<boolean>} True if sent successfully
   */
  async sendData(data) {
    if (!this.isConnected) {
      console.warn('Mock: Not connected to any device.');
      return false;
    }
    
    console.log(
      'Mock: Sending GAIA data:',
      Array.from(data)
        .map(b => `0x${b.toString(16).padStart(2, '0')}`)
        .join(' '),
    );
    
    // Simulate receiving an ACK
    setTimeout(() => {
      const ackPayload = new Uint8Array([0x00, 0x01, 0x10, 0x00, 0x00]); // Example ACK
      this.notifyListeners('onDataReceived', ackPayload);
    }, 100);
    
    return true;
  }

  /**
   * Add event listener
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   */
  addListener(event, callback) {
    this.listeners.push({event, callback});
  }

  /**
   * Remove event listener
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   */
  removeListener(event, callback) {
    this.listeners = this.listeners.filter(
      listener => !(listener.event === event && listener.callback === callback),
    );
  }

  /**
   * Notify all listeners of an event
   * @param {string} event - Event name
   * @param {*} data - Event data
   */
  notifyListeners(event, data) {
    this.listeners
      .filter(listener => listener.event === event)
      .forEach(listener => listener.callback(data));
  }

  /**
   * Get connection status
   * @returns {boolean} True if connected
   */
  getConnectionStatus() {
    return this.isConnected;
  }

  /**
   * Get connected device info
   * @returns {Object|null} Connected device info
   */
  getConnectedDevice() {
    return this.connectedDevice;
  }
}

export default FallbackBluetoothService;
