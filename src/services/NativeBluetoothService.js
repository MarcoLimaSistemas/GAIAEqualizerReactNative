import {NativeModules, NativeEventEmitter} from 'react-native';

const {BluetoothModule} = NativeModules;

// Check if BluetoothModule is available
if (!BluetoothModule) {
  console.error(
    'BluetoothModule not found. Make sure the native module is properly linked.',
  );
}

let bluetoothEventEmitter = null;

// Only create NativeEventEmitter if BluetoothModule is available and valid
if (BluetoothModule && typeof BluetoothModule === 'object') {
  try {
    bluetoothEventEmitter = new NativeEventEmitter(BluetoothModule);
  } catch (error) {
    console.error('Failed to create NativeEventEmitter:', error);
    bluetoothEventEmitter = null;
  }
} else {
  console.log('BluetoothModule not available, using fallback mode');
}

/**
 * Native Bluetooth Classic service for GAIA protocol communication
 * Uses native Android Bluetooth implementation
 */

class NativeBluetoothService {
  constructor() {
    this.isConnected = false;
    this.connectedDevice = null;
    this.listeners = [];

    // Set up event listeners
    this.setupEventListeners();
  }

  setupEventListeners() {
    if (!bluetoothEventEmitter) {
      console.error(
        'BluetoothEventEmitter not available. Native module not linked.',
      );
      return;
    }

    bluetoothEventEmitter.addListener('onDataReceived', data => {
      this.handleIncomingData(data);
    });

    bluetoothEventEmitter.addListener('onConnectionError', error => {
      console.error('Bluetooth connection error:', error);
      this.notifyListeners('onConnectionError', error);
    });
  }

  /**
   * Request Bluetooth permissions
   * @returns {Promise<boolean>} True if permissions granted
   */
  async requestPermissions() {
    // Permissions are handled by the native module
    return true;
  }

  /**
   * Enable Bluetooth
   * @returns {Promise<boolean>} True if enabled
   */
  async enableBluetooth() {
    if (!BluetoothModule) {
      console.error('BluetoothModule not available');
      return false;
    }

    try {
      const enabled = await BluetoothModule.isEnabled();
      if (!enabled) {
        await BluetoothModule.enable();
      }
      return true;
    } catch (error) {
      console.error('Error enabling Bluetooth:', error);
      return false;
    }
  }

  /**
   * Get paired devices
   * @returns {Promise<Array>} Array of paired devices
   */
  async getPairedDevices() {
    if (!BluetoothModule) {
      console.error('BluetoothModule not available');
      return [];
    }

    try {
      const devices = await BluetoothModule.getPairedDevices();
      return devices;
    } catch (error) {
      console.error('Error getting paired devices:', error);
      return [];
    }
  }

  /**
   * Connect to device
   * @param {string} deviceId - Device ID to connect to
   * @returns {Promise<boolean>} True if connected
   */
  async connectToDevice(deviceId) {
    if (!BluetoothModule) {
      console.error('BluetoothModule not available');
      return false;
    }

    try {
      console.log(`Connecting to device: ${deviceId}`);

      const device = await BluetoothModule.connect(deviceId);

      this.isConnected = true;
      this.connectedDevice = device;

      this.notifyListeners('onDeviceConnected', device);
      return true;
    } catch (error) {
      console.error('Error connecting to device:', error);
      this.notifyListeners('onConnectionError', error);
      return false;
    }
  }

  /**
   * Disconnect from device
   * @returns {Promise<boolean>} True if disconnected
   */
  async disconnect() {
    if (!BluetoothModule) {
      console.error('BluetoothModule not available');
      return false;
    }

    try {
      console.log('Disconnecting from device');
      await BluetoothModule.disconnect();

      this.isConnected = false;
      this.connectedDevice = null;

      this.notifyListeners('onDeviceDisconnected');
      return true;
    } catch (error) {
      console.error('Error disconnecting:', error);
      return false;
    }
  }

  /**
   * Send data to connected device
   * @param {Uint8Array} data - Data to send
   * @returns {Promise<boolean>} True if sent successfully
   */
  async sendData(data) {
    if (!BluetoothModule) {
      console.error('BluetoothModule not available');
      return false;
    }

    try {
      if (!this.isConnected) {
        throw new Error('Not connected to any device');
      }

      console.log(
        'Sending GAIA data:',
        Array.from(data)
          .map(b => `0x${b.toString(16).padStart(2, '0')}`)
          .join(' '),
      );

      // Convert Uint8Array to string for native transmission
      const dataString = Array.from(data)
        .map(byte => String.fromCharCode(byte))
        .join('');
      await BluetoothModule.write(dataString);

      return true;
    } catch (error) {
      console.error('Error sending data:', error);
      return false;
    }
  }

  /**
   * Handle incoming data from Bluetooth
   * @param {string} data - Incoming data
   */
  handleIncomingData(data) {
    try {
      // Convert string back to Uint8Array
      const dataArray = new Uint8Array(data.length);
      for (let i = 0; i < data.length; i++) {
        dataArray[i] = data.charCodeAt(i);
      }

      console.log(
        'Received GAIA data:',
        Array.from(dataArray)
          .map(b => `0x${b.toString(16).padStart(2, '0')}`)
          .join(' '),
      );

      this.notifyListeners('onDataReceived', dataArray);
    } catch (error) {
      console.error('Error handling incoming data:', error);
    }
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

export default NativeBluetoothService;
