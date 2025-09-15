import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {BluetoothService} from '../../services/BluetoothService';
import {GAIAProtocol} from '../../services/GAIAProtocol';
import {Bank} from '../../models/Equalizer/Bank';
import {FILTER_TYPES, getFilterName} from '../../models/Equalizer/Filter';
import {PARAMETER_TYPES} from '../../constants/GAIACommands';
import EqualizerSlider from './EqualizerSlider';
import FilterButton from './FilterButton';
import BandButton from './BandButton';

/**
 * Main equalizer screen component
 * Based on Android CustomEqualizerActivity
 */
const EqualizerScreen = () => {
  const [bluetoothService] = useState(new BluetoothService());
  const [gaiaProtocol] = useState(new GAIAProtocol(bluetoothService));
  const [bank] = useState(new Bank(5));

  const [isConnected, setIsConnected] = false;
  const [isGaiaReady, setIsGaiaReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedBand, setSelectedBand] = useState(1);
  const [selectedFilter, setSelectedFilter] = useState(FILTER_TYPES.BYPASS);

  // Initialize listeners
  useEffect(() => {
    const handleConnectionChange = state => {
      setIsConnected(state === 'CONNECTED');
      if (state === 'CONNECTED') {
        setIsGaiaReady(true);
        getInformation();
      } else {
        setIsGaiaReady(false);
      }
    };

    const handleGaiaReady = () => {
      setIsGaiaReady(true);
      getInformation();
    };

    const handleGaiaPacket = data => {
      gaiaProtocol.handleIncomingPacket(data);
    };

    const handleIncorrectState = () => {
      Alert.alert(
        'Board incorrect state',
        'Please stream some music to use this feature.',
        [{text: 'OK', onPress: () => {}}],
      );
    };

    const handleControlNotSupported = () => {
      Alert.alert(
        'Control not supported',
        'The application is not able to set up the connected device.',
        [{text: 'OK', onPress: () => {}}],
      );
    };

    const handleGetMasterGain = value => {
      bank.getMasterGain().setValue(value);
    };

    const handleGetFilter = (band, filter) => {
      const bandObj = bank.getBand(band);
      if (bandObj) {
        bandObj.setFilter(filter, false);
        if (band === selectedBand) {
          setSelectedFilter(filter);
        }
      }
    };

    const handleGetFrequency = (band, value) => {
      const bandObj = bank.getBand(band);
      if (bandObj) {
        bandObj.getFrequency().setValue(value);
      }
    };

    const handleGetGain = (band, value) => {
      const bandObj = bank.getBand(band);
      if (bandObj) {
        bandObj.getGain().setValue(value);
      }
    };

    const handleGetQuality = (band, value) => {
      const bandObj = bank.getBand(band);
      if (bandObj) {
        bandObj.getQuality().setValue(value);
      }
    };

    // Add listeners
    bluetoothService.addListener(
      'CONNECTION_STATE_HAS_CHANGED',
      handleConnectionChange,
    );
    bluetoothService.addListener('GAIA_READY', handleGaiaReady);
    bluetoothService.addListener('GAIA_PACKET', handleGaiaPacket);

    gaiaProtocol.addListener('onIncorrectState', handleIncorrectState);
    gaiaProtocol.addListener(
      'onControlNotSupported',
      handleControlNotSupported,
    );
    gaiaProtocol.addListener('onGetMasterGain', handleGetMasterGain);
    gaiaProtocol.addListener('onGetFilter', handleGetFilter);
    gaiaProtocol.addListener('onGetFrequency', handleGetFrequency);
    gaiaProtocol.addListener('onGetGain', handleGetGain);
    gaiaProtocol.addListener('onGetQuality', handleGetQuality);

    // Start listening
    bluetoothService.startListening();

    return () => {
      // Cleanup listeners
      bluetoothService.removeListener(
        'CONNECTION_STATE_HAS_CHANGED',
        handleConnectionChange,
      );
      bluetoothService.removeListener('GAIA_READY', handleGaiaReady);
      bluetoothService.removeListener('GAIA_PACKET', handleGaiaPacket);

      gaiaProtocol.removeListener('onIncorrectState', handleIncorrectState);
      gaiaProtocol.removeListener(
        'onControlNotSupported',
        handleControlNotSupported,
      );
      gaiaProtocol.removeListener('onGetMasterGain', handleGetMasterGain);
      gaiaProtocol.removeListener('onGetFilter', handleGetFilter);
      gaiaProtocol.removeListener('onGetFrequency', handleGetFrequency);
      gaiaProtocol.removeListener('onGetGain', handleGetGain);
      gaiaProtocol.removeListener('onGetQuality', handleGetQuality);

      bluetoothService.stopListening();
    };
  }, []);

  /**
   * Get device information
   */
  const getInformation = useCallback(async () => {
    if (
      !bluetoothService.isConnectedToDevice() ||
      !bluetoothService.isGaiaProtocolReady()
    ) {
      return;
    }

    setIsLoading(true);
    bank.hasToBeUpdated();

    try {
      // Get master gain
      await gaiaProtocol.getMasterGain();

      // Get current band filter
      await gaiaProtocol.getEQParameter(selectedBand, PARAMETER_TYPES.FILTER);

      // Get preset to determine if bank 1 is selected
      await gaiaProtocol.getPreset();
    } catch (error) {
      console.error('Error getting information:', error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedBand]);

  /**
   * Handle band selection
   * @param {number} bandNumber - Band number (1-5)
   */
  const handleBandSelection = useCallback(
    async bandNumber => {
      setSelectedBand(bandNumber);
      bank.setCurrentBand(bandNumber);

      const band = bank.getBand(bandNumber);
      setSelectedFilter(band.getFilter());

      // Get band parameters
      if (isGaiaReady) {
        await gaiaProtocol.getEQParameter(bandNumber, PARAMETER_TYPES.FILTER);
      }
    },
    [isGaiaReady],
  );

  /**
   * Handle filter selection
   * @param {number} filterType - Filter type
   */
  const handleFilterSelection = useCallback(
    async filterType => {
      setSelectedFilter(filterType);

      const band = bank.getCurrentBand();
      band.setFilter(filterType, true);
      band.hasToBeUpdated();

      if (isGaiaReady) {
        await gaiaProtocol.setEQParameter(
          selectedBand,
          PARAMETER_TYPES.FILTER,
          filterType,
        );

        // Get updated parameters for the new filter
        if (band.getFrequency().isConfigurable()) {
          await gaiaProtocol.getEQParameter(
            selectedBand,
            PARAMETER_TYPES.FREQUENCY,
          );
        }
        if (band.getGain().isConfigurable()) {
          await gaiaProtocol.getEQParameter(selectedBand, PARAMETER_TYPES.GAIN);
        }
        if (band.getQuality().isConfigurable()) {
          await gaiaProtocol.getEQParameter(
            selectedBand,
            PARAMETER_TYPES.QUALITY,
          );
        }
      }
    },
    [selectedBand, isGaiaReady],
  );

  /**
   * Handle parameter change
   * @param {string} parameterType - Parameter type
   * @param {number} value - New value
   */
  const handleParameterChange = useCallback(
    async (parameterType, value) => {
      const band = bank.getCurrentBand();
      let parameter;

      switch (parameterType) {
        case 'FREQUENCY':
          parameter = band.getFrequency();
          break;
        case 'GAIN':
          parameter = band.getGain();
          break;
        case 'QUALITY':
          parameter = band.getQuality();
          break;
        case 'MASTER_GAIN':
          parameter = bank.getMasterGain();
          break;
        default:
          return;
      }

      parameter.setValueFromProportion(value);

      if (isGaiaReady) {
        const bandNumber = parameterType === 'MASTER_GAIN' ? 0 : selectedBand;
        const paramType =
          parameterType === 'MASTER_GAIN' ? 1 : PARAMETER_TYPES[parameterType];

        await gaiaProtocol.setEQParameter(
          bandNumber,
          paramType,
          parameter.getValue(),
        );
      }
    },
    [selectedBand, isGaiaReady],
  );

  /**
   * Refresh equalizer values
   */
  const handleRefresh = useCallback(() => {
    getInformation();
  }, [getInformation]);

  const currentBand = bank.getCurrentBand();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Customize bank 1</Text>
        <TouchableOpacity onPress={handleRefresh} style={styles.refreshButton}>
          <Text style={styles.refreshText}>Refresh values</Text>
        </TouchableOpacity>
      </View>

      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      )}

      {/* Master Gain */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Master gain</Text>
        <EqualizerSlider
          parameter={bank.getMasterGain()}
          onValueChange={value => handleParameterChange('MASTER_GAIN', value)}
        />
      </View>

      {/* Bands */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Bands</Text>
        <View style={styles.bandsContainer}>
          {[1, 2, 3, 4, 5].map(bandNumber => (
            <BandButton
              key={bandNumber}
              bandNumber={bandNumber}
              isSelected={bandNumber === selectedBand}
              onPress={() => handleBandSelection(bandNumber)}
            />
          ))}
        </View>
      </View>

      {/* Parameter Sliders */}
      <View style={styles.section}>
        <EqualizerSlider
          title="F"
          parameter={currentBand.getFrequency()}
          onValueChange={value => handleParameterChange('FREQUENCY', value)}
        />
        <EqualizerSlider
          title="G"
          parameter={currentBand.getGain()}
          onValueChange={value => handleParameterChange('GAIN', value)}
        />
        <EqualizerSlider
          title="Q"
          parameter={currentBand.getQuality()}
          onValueChange={value => handleParameterChange('QUALITY', value)}
        />
      </View>

      {/* Filter Types */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Filter type</Text>
        <View style={styles.filtersContainer}>
          {Object.entries(FILTER_TYPES).map(([name, type]) => (
            <FilterButton
              key={type}
              filterType={type}
              filterName={getFilterName(type)}
              isSelected={type === selectedFilter}
              onPress={() => handleFilterSelection(type)}
            />
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 20,
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
  loadingContainer: {
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  section: {
    backgroundColor: '#fff',
    marginVertical: 4,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  bandsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  filtersContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
});

export default EqualizerScreen;
