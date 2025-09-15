/**
 * Filter types for equalizer bands
 * Based on Android GAIA Control SDK Filter enum
 */

export const FILTER_TYPES = {
  BYPASS: 0,
  LOW_PASS_1: 1,
  HIGH_PASS_1: 2,
  ALL_PASS_1: 3,
  LOW_SHELF_1: 4,
  HIGH_SHELF_1: 5,
  TILT_1: 6,
  LOW_PASS_2: 7,
  HIGH_PASS_2: 8,
  ALL_PASS_2: 9,
  LOW_SHELF_2: 10,
  HIGH_SHELF_2: 11,
  TILT_2: 12,
  PARAMETRIC_EQUALIZER: 13,
};

export const FILTER_NAMES = {
  [FILTER_TYPES.BYPASS]: 'BYPASS',
  [FILTER_TYPES.LOW_PASS_1]: 'LPF1',
  [FILTER_TYPES.HIGH_PASS_1]: 'HPF1',
  [FILTER_TYPES.ALL_PASS_1]: 'APF1',
  [FILTER_TYPES.LOW_SHELF_1]: 'LS1',
  [FILTER_TYPES.HIGH_SHELF_1]: 'HS1',
  [FILTER_TYPES.TILT_1]: 'Tilt1',
  [FILTER_TYPES.LOW_PASS_2]: 'LPF2',
  [FILTER_TYPES.HIGH_PASS_2]: 'HPF2',
  [FILTER_TYPES.ALL_PASS_2]: 'APF2',
  [FILTER_TYPES.LOW_SHELF_2]: 'LS2',
  [FILTER_TYPES.HIGH_SHELF_2]: 'HS2',
  [FILTER_TYPES.TILT_2]: 'Tilt2',
  [FILTER_TYPES.PARAMETRIC_EQUALIZER]: 'PEQ',
};

/**
 * Get filter name by type
 * @param {number} filterType - Filter type constant
 * @returns {string} Filter name
 */
export const getFilterName = filterType => {
  return FILTER_NAMES[filterType] || 'UNKNOWN';
};

/**
 * Get filter type by name
 * @param {string} filterName - Filter name
 * @returns {number} Filter type constant
 */
export const getFilterType = filterName => {
  const entry = Object.entries(FILTER_NAMES).find(
    ([_, name]) => name === filterName,
  );
  return entry ? parseInt(entry[0], 10) : FILTER_TYPES.BYPASS;
};

/**
 * Define parameter ranges for each filter type
 * @param {number} filterType - Filter type
 * @returns {Object} Parameter configuration
 */
export const getFilterParameterRanges = filterType => {
  switch (filterType) {
    case FILTER_TYPES.HIGH_PASS_1:
    case FILTER_TYPES.ALL_PASS_1:
    case FILTER_TYPES.LOW_PASS_1:
      // frequency 0.333Hz to 20 kHz, no gain, no quality
      return {
        frequency: {min: 0.333, max: 20000, configurable: true},
        gain: {min: 0, max: 0, configurable: false},
        quality: {min: 0, max: 0, configurable: false},
      };

    case FILTER_TYPES.HIGH_PASS_2:
    case FILTER_TYPES.ALL_PASS_2:
    case FILTER_TYPES.LOW_PASS_2:
      // frequency from 40Hz to 20kHz, no gain, quality from 0.25 to 2.0
      return {
        frequency: {min: 40, max: 20000, configurable: true},
        gain: {min: 0, max: 0, configurable: false},
        quality: {min: 0.25, max: 2.0, configurable: true},
      };

    case FILTER_TYPES.LOW_SHELF_1:
    case FILTER_TYPES.HIGH_SHELF_1:
    case FILTER_TYPES.TILT_1:
      // frequency from 20Hz to 20 kHz, gain from -12dB to 12dB, no quality
      return {
        frequency: {min: 20, max: 20000, configurable: true},
        gain: {min: -12, max: 12, configurable: true},
        quality: {min: 0, max: 0, configurable: false},
      };

    case FILTER_TYPES.LOW_SHELF_2:
    case FILTER_TYPES.HIGH_SHELF_2:
    case FILTER_TYPES.TILT_2:
      // frequency from 40Hz to 20kHz, gain from -12 dB to +12 dB, quality from 0.25 to 2.0
      return {
        frequency: {min: 40, max: 20000, configurable: true},
        gain: {min: -12, max: 12, configurable: true},
        quality: {min: 0.25, max: 2.0, configurable: true},
      };

    case FILTER_TYPES.BYPASS:
      // no frequency, no gain, no quality
      return {
        frequency: {min: 0, max: 0, configurable: false},
        gain: {min: 0, max: 0, configurable: false},
        quality: {min: 0, max: 0, configurable: false},
      };

    case FILTER_TYPES.PARAMETRIC_EQUALIZER:
      // frequency from 20Hz to 20kHz, gain from -36dB to 12dB, quality from 0.25 to 8.0
      return {
        frequency: {min: 20, max: 20000, configurable: true},
        gain: {min: -36, max: 12, configurable: true},
        quality: {min: 0.25, max: 8.0, configurable: true},
      };

    default:
      return {
        frequency: {min: 0, max: 0, configurable: false},
        gain: {min: 0, max: 0, configurable: false},
        quality: {min: 0, max: 0, configurable: false},
      };
  }
};

/**
 * Get all available filter types
 * @returns {Array} Array of filter type objects
 */
export const getAllFilterTypes = () => {
  return Object.entries(FILTER_NAMES).map(([type, name]) => ({
    type: parseInt(type, 10),
    name,
    ranges: getFilterParameterRanges(parseInt(type, 10)),
  }));
};
