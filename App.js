import React, {useState} from 'react';
import {StatusBar} from 'react-native';
import BluetoothConnectionScreen from './src/components/Bluetooth/BluetoothConnectionScreen';
import EqualizerScreen from './src/components/Equalizer/EqualizerScreen';

/**
 * Main App component
 * Handles navigation between Bluetooth connection and Equalizer screens
 */
const App = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectedDevice, setConnectedDevice] = useState(null);

  const handleConnected = device => {
    setConnectedDevice(device);
    setIsConnected(true);
  };

  const handleDisconnected = () => {
    setConnectedDevice(null);
    setIsConnected(false);
  };

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />
      {isConnected ? (
        <EqualizerScreen onDisconnected={handleDisconnected} />
      ) : (
        <BluetoothConnectionScreen onConnected={handleConnected} />
      )}
    </>
  );
};

export default App;
