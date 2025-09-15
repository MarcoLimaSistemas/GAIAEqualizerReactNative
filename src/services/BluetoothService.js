import NativeBluetoothService from './NativeBluetoothService';
import FallbackBluetoothService from './FallbackBluetoothService';
import {PermissionsAndroid, Platform} from 'react-native';

/**
 * Bluetooth Classic service for GAIA protocol communication
 * Based on Android GAIA Control SDK BluetoothService
 */

class BluetoothService {
  constructor() {
    this.isConnected = false;
    this.connectedDevice = null;
    this.listeners = [];
    this.nativeService = null;
    this.fallbackService = null;

    // Check if native module is available before trying to use it
    const {NativeModules} = require('react-native');
    const hasNativeModule = NativeModules.BluetoothModule && typeof NativeModules.BluetoothModule === 'object';
    
    if (hasNativeModule) {
      try {
        this.nativeService = new NativeBluetoothService();
        
        // Forward events from native service
        this.nativeService.addListener('onDeviceConnected', device => {
          this.isConnected = true;
          this.connectedDevice = device;
          this.notifyListeners('onDeviceConnected', device);
        });

        this.nativeService.addListener('onDeviceDisconnected', () => {
          this.isConnected = false;
          this.connectedDevice = null;
          this.notifyListeners('onDeviceDisconnected');
        });

        this.nativeService.addListener('onDataReceived', data => {
          this.notifyListeners('onDataReceived', data);
        });

        this.nativeService.addListener('onConnectionError', error => {
          this.notifyListeners('onConnectionError', error);
        });
        
        console.log('Native Bluetooth service initialized successfully');
      } catch (error) {
        console.error('Failed to initialize native Bluetooth service:', error);
        this.nativeService = null;
      }
    } else {
      console.log('Native Bluetooth module not available, using fallback');
    }
    
    // If native service failed or is not available, use fallback
    if (!this.nativeService) {
      console.log('Initializing fallback Bluetooth service...');
      this.fallbackService = new FallbackBluetoothService();
      
      // Forward events from fallback service
      this.fallbackService.addListener('onDeviceConnected', device => {
        this.isConnected = true;
        this.connectedDevice = device;
        this.notifyListeners('onDeviceConnected', device);
      });

      this.fallbackService.addListener('onDeviceDisconnected', () => {
        this.isConnected = false;
        this.connectedDevice = null;
        this.notifyListeners('onDeviceDisconnected');
      });

      this.fallbackService.addListener('onDataReceived', data => {
        this.notifyListeners('onDataReceived', data);
      });

      this.fallbackService.addListener('onConnectionError', error => {
        this.notifyListeners('onConnectionError', error);
      });
    }
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
    if (this.nativeService) {
      return await this.nativeService.enableBluetooth();
    } else if (this.fallbackService) {
      return await this.fallbackService.enableBluetooth();
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
    if (this.nativeService) {
      return await this.nativeService.getPairedDevices();
    } else if (this.fallbackService) {
      return await this.fallbackService.getPairedDevices();
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
    if (this.nativeService) {
      return await this.nativeService.connectToDevice(deviceId);
    } else if (this.fallbackService) {
      return await this.fallbackService.connectToDevice(deviceId);
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
    if (this.nativeService) {
      return await this.nativeService.disconnect();
    } else if (this.fallbackService) {
      return await this.fallbackService.disconnect();
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
    if (this.nativeService) {
      return await this.nativeService.sendData(data);
    } else if (this.fallbackService) {
      return await this.fallbackService.sendData(data);
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
