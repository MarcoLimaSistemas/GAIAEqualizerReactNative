import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import Slider from '@react-native-community/slider';

/**
 * Equalizer slider component
 * Based on Android SliderLayout
 */
const EqualizerSlider = ({title, parameter, onValueChange}) => {
  const isConfigurable = parameter.isConfigurable();
  const boundsLength = parameter.getBoundsLength();
  const positionValue = parameter.getPositionValue();
  const labelValue = parameter.getLabelValue();
  const minBound = parameter.getLabelMinBound();
  const maxBound = parameter.getLabelMaxBound();

  const handleValueChange = value => {
    if (onValueChange) {
      onValueChange(Math.round(value));
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.value}>{labelValue}</Text>
      </View>

      <View style={styles.sliderContainer}>
        <Text style={styles.boundLabel}>{minBound}</Text>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={boundsLength}
          value={positionValue}
          onValueChange={handleValueChange}
          minimumTrackTintColor="#007AFF"
          maximumTrackTintColor="#e0e0e0"
          thumbStyle={styles.thumb}
          disabled={!isConfigurable}
        />
        <Text style={styles.boundLabel}>{maxBound}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  value: {
    fontSize: 16,
    color: '#666',
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  boundLabel: {
    fontSize: 12,
    color: '#666',
    minWidth: 40,
    textAlign: 'center',
  },
  slider: {
    flex: 1,
    height: 40,
    marginHorizontal: 8,
  },
  thumb: {
    backgroundColor: '#007AFF',
    width: 20,
    height: 20,
  },
});

export default EqualizerSlider;
