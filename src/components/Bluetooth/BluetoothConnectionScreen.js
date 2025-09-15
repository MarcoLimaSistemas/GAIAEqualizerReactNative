import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {BluetoothService} from '../../services/BluetoothService';

/**
 * Bluetooth connection screen
 * Based on Android DeviceDiscoveryActivity
 */
const BluetoothConnectionScreen = ({onConnected}) => {
  const [bluetoothService] = useState(new BluetoothService());
  const [isEnabled, setIsEnabled] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [pairedDevices, setPairedDevices] = useState([]);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    initializeBluetooth();

    return () => {
      bluetoothService.stopListening();
    };
  }, []);

  const initializeBluetooth = async () => {
    try {
      // Request permissions
      const hasPermissions = await bluetoothService.requestPermissions();
      if (!hasPermissions) {
        Alert.alert(
          'Permissions Required',
          'Bluetooth permissions are required to use this app.',
        );
        return;
      }

      // Enable Bluetooth
      const enabled = await bluetoothService.enableBluetooth();
      setIsEnabled(enabled);

      if (enabled) {
        await loadPairedDevices();
      }
    } catch (error) {
      console.error('Error initializing Bluetooth:', error);
      Alert.alert('Error', 'Failed to initialize Bluetooth.');
    }
  };

  const loadPairedDevices = async () => {
    try {
      const devices = await bluetoothService.getPairedDevices();
      setPairedDevices(devices);
    } catch (error) {
      console.error('Error loading paired devices:', error);
    }
  };

  const handleDevicePress = async device => {
    if (isConnecting) {
      return;
    }

    setIsConnecting(true);

    try {
      const connected = await bluetoothService.connect(device.id);

      if (connected) {
        // Set up GAIA protocol
        bluetoothService.setGaiaReady(true);
        onConnected(device);
      } else {
        Alert.alert(
          'Connection Failed',
          'Could not connect to the selected device.',
        );
      }
    } catch (error) {
      console.error('Error connecting to device:', error);
      Alert.alert(
        'Connection Error',
        'An error occurred while connecting to the device.',
      );
    } finally {
      setIsConnecting(false);
    }
  };

  const handleRefresh = async () => {
    setIsScanning(true);
    await loadPairedDevices();
    setIsScanning(false);
  };

  const renderDevice = ({item}) => (
    <TouchableOpacity
      style={styles.deviceItem}
      onPress={() => handleDevicePress(item)}
      disabled={isConnecting}>
      <View style={styles.deviceInfo}>
        <Text style={styles.deviceName}>{item.name || 'Unknown Device'}</Text>
        <Text style={styles.deviceId}>{item.id}</Text>
      </View>
      {isConnecting && <ActivityIndicator size="small" color="#007AFF" />}
    </TouchableOpacity>
  );

  if (!isEnabled) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>GAIA Equalizer</Text>
        <Text style={styles.subtitle}>Bluetooth is not enabled</Text>
        <TouchableOpacity style={styles.button} onPress={initializeBluetooth}>
          <Text style={styles.buttonText}>Enable Bluetooth</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>GAIA Equalizer</Text>
      <Text style={styles.subtitle}>Select a paired device to connect</Text>

      <View style={styles.header}>
        <Text style={styles.sectionTitle}>Paired Devices</Text>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={handleRefresh}
          disabled={isScanning}>
          {isScanning ? (
            <ActivityIndicator size="small" color="#007AFF" />
          ) : (
            <Text style={styles.refreshText}>Refresh</Text>
          )}
        </TouchableOpacity>
      </View>

      <FlatList
        data={pairedDevices}
        keyExtractor={item => item.id}
        renderItem={renderDevice}
        style={styles.deviceList}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No paired devices found</Text>
            <Text style={styles.emptySubtext}>
              Please pair your GAIA device in Bluetooth settings first
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  refreshButton: {
    padding: 8,
  },
  refreshText: {
    color: '#007AFF',
    fontSize: 16,
  },
  deviceList: {
    flex: 1,
  },
  deviceItem: {
    backgroundColor: '#fff',
    padding: 16,
    marginVertical: 4,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  deviceInfo: {
    flex: 1,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  deviceId: {
    fontSize: 12,
    color: '#666',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignSelf: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default BluetoothConnectionScreen;
