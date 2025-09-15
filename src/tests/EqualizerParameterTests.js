/**
 * Equalizer Parameter Tests
 * Based on Android GAIA Control SDK 3.4.0.52 validation logic
 *
 * These tests validate the expected behavior of equalizer parameters
 * for different band, filter, and gain combinations.
 */

import {
  FILTER_TYPES,
  getFilterParameterRanges,
} from '../models/Equalizer/Filter';
import {PARAMETER_TYPES} from '../constants/GAIACommands';

/**
 * Test cases for equalizer parameter validation
 * Based on the Android Filter.defineParameters() method
 */
export const EQUALIZER_TEST_CASES = [
  // Test Case 1: BYPASS Filter
  {
    name: 'BYPASS Filter - All parameters disabled',
    band: 0,
    filter: FILTER_TYPES.BYPASS,
    expectedResults: {
      frequency: {configurable: false, min: 0, max: 0},
      gain: {configurable: false, min: 0, max: 0},
      quality: {configurable: false, min: 0, max: 0},
    },
  },

  // Test Case 2: First Order Low Pass Filter
  {
    name: 'LOW_PASS_1 Filter - Frequency only',
    band: 1,
    filter: FILTER_TYPES.LOW_PASS_1,
    expectedResults: {
      frequency: {configurable: true, min: 0.333, max: 20000},
      gain: {configurable: false, min: 0, max: 0},
      quality: {configurable: false, min: 0, max: 0},
    },
  },

  // Test Case 3: First Order High Pass Filter
  {
    name: 'HIGH_PASS_1 Filter - Frequency only',
    band: 2,
    filter: FILTER_TYPES.HIGH_PASS_1,
    expectedResults: {
      frequency: {configurable: true, min: 0.333, max: 20000},
      gain: {configurable: false, min: 0, max: 0},
      quality: {configurable: false, min: 0, max: 0},
    },
  },

  // Test Case 4: First Order All Pass Filter
  {
    name: 'ALL_PASS_1 Filter - Frequency only',
    band: 3,
    filter: FILTER_TYPES.ALL_PASS_1,
    expectedResults: {
      frequency: {configurable: true, min: 0.333, max: 20000},
      gain: {configurable: false, min: 0, max: 0},
      quality: {configurable: false, min: 0, max: 0},
    },
  },

  // Test Case 5: First Order Low Shelf Filter
  {
    name: 'LOW_SHELF_1 Filter - Frequency and Gain',
    band: 4,
    filter: FILTER_TYPES.LOW_SHELF_1,
    expectedResults: {
      frequency: {configurable: true, min: 20, max: 20000},
      gain: {configurable: true, min: -12, max: 12},
      quality: {configurable: false, min: 0, max: 0},
    },
  },

  // Test Case 6: First Order High Shelf Filter
  {
    name: 'HIGH_SHELF_1 Filter - Frequency and Gain',
    band: 5,
    filter: FILTER_TYPES.HIGH_SHELF_1,
    expectedResults: {
      frequency: {configurable: true, min: 20, max: 20000},
      gain: {configurable: true, min: -12, max: 12},
      quality: {configurable: false, min: 0, max: 0},
    },
  },

  // Test Case 7: First Order Tilt Filter
  {
    name: 'TILT_1 Filter - Frequency and Gain',
    band: 6,
    filter: FILTER_TYPES.TILT_1,
    expectedResults: {
      frequency: {configurable: true, min: 20, max: 20000},
      gain: {configurable: true, min: -12, max: 12},
      quality: {configurable: false, min: 0, max: 0},
    },
  },

  // Test Case 8: Second Order Low Pass Filter
  {
    name: 'LOW_PASS_2 Filter - Frequency and Quality',
    band: 7,
    filter: FILTER_TYPES.LOW_PASS_2,
    expectedResults: {
      frequency: {configurable: true, min: 40, max: 20000},
      gain: {configurable: false, min: 0, max: 0},
      quality: {configurable: true, min: 0.25, max: 2.0},
    },
  },

  // Test Case 9: Second Order High Pass Filter
  {
    name: 'HIGH_PASS_2 Filter - Frequency and Quality',
    band: 8,
    filter: FILTER_TYPES.HIGH_PASS_2,
    expectedResults: {
      frequency: {configurable: true, min: 40, max: 20000},
      gain: {configurable: false, min: 0, max: 0},
      quality: {configurable: true, min: 0.25, max: 2.0},
    },
  },

  // Test Case 10: Second Order All Pass Filter
  {
    name: 'ALL_PASS_2 Filter - Frequency and Quality',
    band: 9,
    filter: FILTER_TYPES.ALL_PASS_2,
    expectedResults: {
      frequency: {configurable: true, min: 40, max: 20000},
      gain: {configurable: false, min: 0, max: 0},
      quality: {configurable: true, min: 0.25, max: 2.0},
    },
  },

  // Test Case 11: Second Order Low Shelf Filter
  {
    name: 'LOW_SHELF_2 Filter - All parameters',
    band: 10,
    filter: FILTER_TYPES.LOW_SHELF_2,
    expectedResults: {
      frequency: {configurable: true, min: 40, max: 20000},
      gain: {configurable: true, min: -12, max: 12},
      quality: {configurable: true, min: 0.25, max: 2.0},
    },
  },

  // Test Case 12: Second Order High Shelf Filter
  {
    name: 'HIGH_SHELF_2 Filter - All parameters',
    band: 11,
    filter: FILTER_TYPES.HIGH_SHELF_2,
    expectedResults: {
      frequency: {configurable: true, min: 40, max: 20000},
      gain: {configurable: true, min: -12, max: 12},
      quality: {configurable: true, min: 0.25, max: 2.0},
    },
  },

  // Test Case 13: Second Order Tilt Filter
  {
    name: 'TILT_2 Filter - All parameters',
    band: 12,
    filter: FILTER_TYPES.TILT_2,
    expectedResults: {
      frequency: {configurable: true, min: 40, max: 20000},
      gain: {configurable: true, min: -12, max: 12},
      quality: {configurable: true, min: 0.25, max: 2.0},
    },
  },

  // Test Case 14: Parametric Equalizer Filter
  {
    name: 'PARAMETRIC_EQUALIZER Filter - All parameters with extended ranges',
    band: 13,
    filter: FILTER_TYPES.PARAMETRIC_EQUALIZER,
    expectedResults: {
      frequency: {configurable: true, min: 20, max: 20000},
      gain: {configurable: true, min: -36, max: 12},
      quality: {configurable: true, min: 0.25, max: 8.0},
    },
  },
];

/**
 * Test function to validate equalizer parameters
 * @param {number} band - Band number (0-4)
 * @param {number} filter - Filter type
 * @param {number} frequency - Frequency value
 * @param {number} gain - Gain value
 * @param {number} quality - Quality value
 * @returns {Object} Test result with validation status
 */
export function validateEqualizerParameters(
  band,
  filter,
  frequency,
  gain,
  quality,
) {
  const testCase = EQUALIZER_TEST_CASES.find(tc => tc.filter === filter);

  if (!testCase) {
    return {
      valid: false,
      error: `Unknown filter type: ${filter}`,
      expectedResults: null,
    };
  }

  const ranges = getFilterParameterRanges(filter);
  const results = {
    valid: true,
    errors: [],
    warnings: [],
    expectedResults: testCase.expectedResults,
    actualResults: {
      frequency: {
        configurable: ranges.frequency.configurable,
        min: ranges.frequency.min,
        max: ranges.frequency.max,
        value: frequency,
        valid: true,
      },
      gain: {
        configurable: ranges.gain.configurable,
        min: ranges.gain.min,
        max: ranges.gain.max,
        value: gain,
        valid: true,
      },
      quality: {
        configurable: ranges.quality.configurable,
        min: ranges.quality.min,
        max: ranges.quality.max,
        value: quality,
        valid: true,
      },
    },
  };

  // Validate frequency
  if (ranges.frequency.configurable) {
    if (frequency < ranges.frequency.min || frequency > ranges.frequency.max) {
      results.valid = false;
      results.errors.push(
        `Frequency ${frequency}Hz is out of range [${ranges.frequency.min}-${ranges.frequency.max}]Hz`,
      );
      results.actualResults.frequency.valid = false;
    }
  } else if (frequency !== 0) {
    results.warnings.push(
      `Frequency should be 0 for ${testCase.name} (not configurable)`,
    );
  }

  // Validate gain
  if (ranges.gain.configurable) {
    if (gain < ranges.gain.min || gain > ranges.gain.max) {
      results.valid = false;
      results.errors.push(
        `Gain ${gain}dB is out of range [${ranges.gain.min}-${ranges.gain.max}]dB`,
      );
      results.actualResults.gain.valid = false;
    }
  } else if (gain !== 0) {
    results.warnings.push(
      `Gain should be 0 for ${testCase.name} (not configurable)`,
    );
  }

  // Validate quality
  if (ranges.quality.configurable) {
    if (quality < ranges.quality.min || quality > ranges.quality.max) {
      results.valid = false;
      results.errors.push(
        `Quality ${quality} is out of range [${ranges.quality.min}-${ranges.quality.max}]`,
      );
      results.actualResults.quality.valid = false;
    }
  } else if (quality !== 0) {
    results.warnings.push(
      `Quality should be 0 for ${testCase.name} (not configurable)`,
    );
  }

  return results;
}

/**
 * Run all test cases
 * @returns {Array} Array of test results
 */
export function runAllTests() {
  const results = [];

  EQUALIZER_TEST_CASES.forEach(testCase => {
    const ranges = getFilterParameterRanges(testCase.filter);

    // Test with valid values
    const validTest = validateEqualizerParameters(
      testCase.band,
      testCase.filter,
      ranges.frequency.configurable
        ? (ranges.frequency.min + ranges.frequency.max) / 2
        : 0,
      ranges.gain.configurable ? (ranges.gain.min + ranges.gain.max) / 2 : 0,
      ranges.quality.configurable
        ? (ranges.quality.min + ranges.quality.max) / 2
        : 0,
    );

    results.push({
      testCase: testCase.name,
      filter: testCase.filter,
      valid: validTest.valid,
      errors: validTest.errors,
      warnings: validTest.warnings,
    });
  });

  return results;
}

/**
 * Test specific scenarios
 * @returns {Array} Array of specific test results
 */
export function runSpecificTests() {
  return [
    // Test 1: BYPASS with all zeros
    {
      name: 'BYPASS with all zeros',
      result: validateEqualizerParameters(0, FILTER_TYPES.BYPASS, 0, 0, 0),
      expected: {valid: true, errors: [], warnings: []},
    },

    // Test 2: BYPASS with non-zero values (should warn)
    {
      name: 'BYPASS with non-zero values',
      result: validateEqualizerParameters(0, FILTER_TYPES.BYPASS, 1000, 5, 1.5),
      expected: {valid: true, errors: [], warnings: 3},
    },

    // Test 3: PEQ with valid values
    {
      name: 'PEQ with valid values',
      result: validateEqualizerParameters(
        0,
        FILTER_TYPES.PARAMETRIC_EQUALIZER,
        1000,
        -6,
        2.0,
      ),
      expected: {valid: true, errors: [], warnings: []},
    },

    // Test 4: PEQ with invalid gain (too high)
    {
      name: 'PEQ with invalid gain (too high)',
      result: validateEqualizerParameters(
        0,
        FILTER_TYPES.PARAMETRIC_EQUALIZER,
        1000,
        20,
        2.0,
      ),
      expected: {valid: false, errors: 1, warnings: []},
    },

    // Test 5: LPF1 with invalid frequency (too low)
    {
      name: 'LPF1 with invalid frequency (too low)',
      result: validateEqualizerParameters(
        0,
        FILTER_TYPES.LOW_PASS_1,
        0.1,
        0,
        0,
      ),
      expected: {valid: false, errors: 1, warnings: []},
    },

    // Test 6: LPF1 with invalid frequency (too high)
    {
      name: 'LPF1 with invalid frequency (too high)',
      result: validateEqualizerParameters(
        0,
        FILTER_TYPES.LOW_PASS_1,
        25000,
        0,
        0,
      ),
      expected: {valid: false, errors: 1, warnings: []},
    },
  ];
}
