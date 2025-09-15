import FallbackBluetoothService from './FallbackBluetoothService';
import {PermissionsAndroid, Platform} from 'react-native';

/**
 * Bluetooth Classic service for GAIA protocol communication
 * Uses external library with fallback to mock service
 */

class BluetoothService {
  constructor() {
    this.isConnected = false;
    this.connectedDevice = null;
    this.listeners = [];
    this.bluetoothService = null;

    // Initialize fallback service (can be replaced with real Bluetooth later)
    console.log('Initializing Bluetooth service...');
    this.bluetoothService = new FallbackBluetoothService();

    // Forward events from Bluetooth service
    this.bluetoothService.addListener('onDeviceConnected', device => {
      this.isConnected = true;
      this.connectedDevice = device;
      this.notifyListeners('onDeviceConnected', device);
    });

    this.bluetoothService.addListener('onDeviceDisconnected', () => {
      this.isConnected = false;
      this.connectedDevice = null;
      this.notifyListeners('onDeviceDisconnected');
    });

    this.bluetoothService.addListener('onDataReceived', data => {
      this.notifyListeners('onDataReceived', data);
    });

    this.bluetoothService.addListener('onConnectionError', error => {
      this.notifyListeners('onConnectionError', error);
    });
  }

  /**
   * Request Bluetooth permissions
   * @returns {Promise<boolean>} True if permissions granted
   */
  async requestPermissions() {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_ADVERTISE,
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        ]);

        return Object.values(granted).every(
          permission => permission === PermissionsAndroid.RESULTS.GRANTED,
        );
      } catch (err) {
        console.warn('Error requesting permissions:', err);
        return false;
      }
    }
    return true;
  }

  /**
   * Enable Bluetooth
   * @returns {Promise<boolean>} True if enabled
   */
  async enableBluetooth() {
    if (this.bluetoothService) {
      return await this.bluetoothService.enableBluetooth();
    } else {
      console.error('No Bluetooth service available');
      return false;
    }
  }

  /**
   * Get paired devices
   * @returns {Promise<Array>} Array of paired devices
   */
  async getPairedDevices() {
    if (this.bluetoothService) {
      return await this.bluetoothService.getPairedDevices();
    } else {
      console.error('No Bluetooth service available');
      return [];
    }
  }

  /**
   * Connect to device
   * @param {string} deviceId - Device ID to connect to
   * @returns {Promise<boolean>} True if connected
   */
  async connectToDevice(deviceId) {
    if (this.bluetoothService) {
      return await this.bluetoothService.connectToDevice(deviceId);
    } else {
      console.error('No Bluetooth service available');
      return false;
    }
  }

  /**
   * Disconnect from device
   * @returns {Promise<boolean>} True if disconnected
   */
  async disconnect() {
    if (this.bluetoothService) {
      return await this.bluetoothService.disconnect();
    } else {
      console.error('No Bluetooth service available');
      return false;
    }
  }

  /**
   * Send data to connected device
   * @param {Uint8Array} data - Data to send
   * @returns {Promise<boolean>} True if sent successfully
   */
  async sendData(data) {
    if (this.bluetoothService) {
      return await this.bluetoothService.sendData(data);
    } else {
      console.error('No Bluetooth service available');
      return false;
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

export default BluetoothService;
