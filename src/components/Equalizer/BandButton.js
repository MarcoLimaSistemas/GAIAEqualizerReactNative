import React from 'react';
import {TouchableOpacity, Text, StyleSheet} from 'react-native';

/**
 * Band button component
 * Based on Android band buttons
 */
const BandButton = ({bandNumber, isSelected, onPress}) => {
  return (
    <TouchableOpacity
      style={[styles.button, isSelected && styles.selectedButton]}
      onPress={() => onPress(bandNumber)}>
      <Text
        style={[styles.buttonText, isSelected && styles.selectedButtonText]}>
        band {bandNumber}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 12,
    paddingHorizontal: 16,
    margin: 2,
    borderRadius: 4,
    flex: 1,
    alignItems: 'center',
  },
  selectedButton: {
    backgroundColor: '#007AFF',
  },
  buttonText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  selectedButtonText: {
    color: '#fff',
  },
});

export default BandButton;
