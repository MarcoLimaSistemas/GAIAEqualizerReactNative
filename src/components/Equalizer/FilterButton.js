import React from 'react';
import {TouchableOpacity, Text, StyleSheet} from 'react-native';

/**
 * Filter button component
 * Based on Android filter buttons
 */
const FilterButton = ({filterType, filterName, isSelected, onPress}) => {
  return (
    <TouchableOpacity
      style={[styles.button, isSelected && styles.selectedButton]}
      onPress={() => onPress(filterType)}>
      <Text
        style={[styles.buttonText, isSelected && styles.selectedButtonText]}>
        {filterName}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 8,
    paddingHorizontal: 12,
    margin: 2,
    borderRadius: 4,
    minWidth: 60,
    alignItems: 'center',
  },
  selectedButton: {
    backgroundColor: '#007AFF',
  },
  buttonText: {
    fontSize: 12,
    color: '#333',
    fontWeight: '500',
  },
  selectedButtonText: {
    color: '#fff',
  },
});

export default FilterButton;
