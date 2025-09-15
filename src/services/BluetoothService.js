import BluetoothSerial from 'react-native-bluetooth-serial';
import {PermissionsAndroid, Platform} from 'react-native';

/**
 * Bluetooth Classic service for GAIA protocol communication
 * Based on Android GAIA Control SDK BluetoothService
 */
export class BluetoothService {
  constructor() {
    this.isConnected = false;
    this.isGaiaReady = false;
    this.connectedDevice = null;
    this.listeners = [];
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
    try {
      const enabled = await BluetoothSerial.isEnabled();
      if (!enabled) {
        await BluetoothSerial.enable();
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
    try {
      const devices = await BluetoothSerial.list();
      return devices.filter(device => device.paired);
    } catch (error) {
      console.error('Error getting paired devices:', error);
      return [];
    }
  }

  /**
   * Connect to a device
   * @param {string} deviceId - Device ID to connect to
   * @returns {Promise<boolean>} True if connected
   */
  async connect(deviceId) {
    try {
      await BluetoothSerial.connect(deviceId);
      this.isConnected = true;
      this.connectedDevice = deviceId;
      this.notifyListeners('CONNECTION_STATE_HAS_CHANGED', 'CONNECTED');
      return true;
    } catch (error) {
      console.error('Error connecting to device:', error);
      this.isConnected = false;
      this.connectedDevice = null;
      this.notifyListeners('CONNECTION_STATE_HAS_CHANGED', 'DISCONNECTED');
      return false;
    }
  }

  /**
   * Disconnect from current device
   * @returns {Promise<boolean>} True if disconnected
   */
  async disconnect() {
    try {
      await BluetoothSerial.disconnect();
      this.isConnected = false;
      this.isGaiaReady = false;
      this.connectedDevice = null;
      this.notifyListeners('CONNECTION_STATE_HAS_CHANGED', 'DISCONNECTED');
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
    try {
      if (!this.isConnected) {
        console.warn('Not connected to any device');
        return false;
      }

      await BluetoothSerial.write(data);
      return true;
    } catch (error) {
      console.error('Error sending data:', error);
      return false;
    }
  }

  /**
   * Start listening for incoming data
   */
  startListening() {
    BluetoothSerial.on('bluetoothSerialData', data => {
      this.handleIncomingData(data);
    });
  }

  /**
   * Stop listening for incoming data
   */
  stopListening() {
    BluetoothSerial.removeAllListeners('bluetoothSerialData');
  }

  /**
   * Handle incoming data from Bluetooth
   * @param {Uint8Array} data - Incoming data
   */
  handleIncomingData(data) {
    // Process GAIA packet
    this.notifyListeners('GAIA_PACKET', data);
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
    this.listeners.forEach(listener => {
      if (listener.event === event) {
        listener.callback(data);
      }
    });
  }

  /**
   * Check if connected to a device
   * @returns {boolean} True if connected
   */
  isConnectedToDevice() {
    return this.isConnected;
  }

  /**
   * Check if GAIA protocol is ready
   * @returns {boolean} True if ready
   */
  isGaiaProtocolReady() {
    return this.isGaiaReady;
  }

  /**
   * Set GAIA protocol ready state
   * @param {boolean} ready - Ready state
   */
  setGaiaReady(ready) {
    this.isGaiaReady = ready;
    if (ready) {
      this.notifyListeners('GAIA_READY', null);
    }
  }

  /**
   * Get connected device ID
   * @returns {string|null} Connected device ID
   */
  getConnectedDevice() {
    return this.connectedDevice;
  }
}
