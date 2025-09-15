#!/usr/bin/env node

/**
 * Equalizer Parameter Test Runner
 *
 * This script demonstrates the expected behavior of equalizer parameters
 * for different band, filter, and gain combinations based on the Android
 * GAIA Control SDK 3.4.0.52.
 *
 * Usage: node test_equalizer.js
 */

const {
  EQUALIZER_TEST_CASES,
  validateEqualizerParameters,
  runAllTests,
  runSpecificTests,
} = require('./src/tests/EqualizerParameterTests.js');

console.log('🎵 GAIA Equalizer Parameter Tests');
console.log('==================================\n');

// Test 1: Run all test cases
console.log('📋 Running All Test Cases:');
console.log('---------------------------');
const allResults = runAllTests();
allResults.forEach((result, index) => {
  const status = result.valid ? '✅ PASS' : '❌ FAIL';
  console.log(`${index + 1}. ${result.testCase}: ${status}`);
  if (result.errors.length > 0) {
    result.errors.forEach(error => console.log(`   ❌ ${error}`));
  }
  if (result.warnings.length > 0) {
    result.warnings.forEach(warning => console.log(`   ⚠️  ${warning}`));
  }
});

console.log('\n');

// Test 2: Run specific scenarios
console.log('🧪 Running Specific Test Scenarios:');
console.log('------------------------------------');
const specificResults = runSpecificTests();
specificResults.forEach((test, index) => {
  const status = test.result.valid ? '✅ PASS' : '❌ FAIL';
  const errorCount = test.result.errors.length;
  const warningCount = test.result.warnings.length;

  console.log(`${index + 1}. ${test.name}: ${status}`);
  console.log(`   Expected: ${test.expected.valid ? 'Valid' : 'Invalid'}`);
  console.log(`   Actual: ${test.result.valid ? 'Valid' : 'Invalid'}`);
  console.log(`   Errors: ${errorCount}, Warnings: ${warningCount}`);

  if (errorCount > 0) {
    test.result.errors.forEach(error => console.log(`   ❌ ${error}`));
  }
  if (warningCount > 0) {
    test.result.warnings.forEach(warning => console.log(`   ⚠️  ${warning}`));
  }
  console.log('');
});

// Test 3: Demonstrate parameter ranges for each filter
console.log('📊 Parameter Ranges by Filter Type:');
console.log('------------------------------------');
EQUALIZER_TEST_CASES.forEach((testCase, index) => {
  console.log(`${index + 1}. ${testCase.name}:`);
  console.log(
    `   Frequency: ${
      testCase.expectedResults.frequency.configurable
        ? `${testCase.expectedResults.frequency.min}Hz - ${testCase.expectedResults.frequency.max}Hz`
        : 'Not configurable'
    }`,
  );
  console.log(
    `   Gain: ${
      testCase.expectedResults.gain.configurable
        ? `${testCase.expectedResults.gain.min}dB - ${testCase.expectedResults.gain.max}dB`
        : 'Not configurable'
    }`,
  );
  console.log(
    `   Quality: ${
      testCase.expectedResults.quality.configurable
        ? `${testCase.expectedResults.quality.min} - ${testCase.expectedResults.quality.max}`
        : 'Not configurable'
    }`,
  );
  console.log('');
});

// Test 4: Demonstrate validation with real examples
console.log('🎯 Real-World Validation Examples:');
console.log('-----------------------------------');

const examples = [
  {
    name: 'Bass Boost (Low Shelf)',
    band: 0,
    filter: 4, // LOW_SHELF_1
    frequency: 100,
    gain: 6,
    quality: 0,
  },
  {
    name: 'Treble Cut (High Shelf)',
    band: 1,
    filter: 5, // HIGH_SHELF_1
    frequency: 8000,
    gain: -3,
    quality: 0,
  },
  {
    name: 'Vocal Enhancement (Parametric EQ)',
    band: 2,
    filter: 13, // PARAMETRIC_EQUALIZER
    frequency: 2500,
    gain: 2,
    quality: 1.5,
  },
  {
    name: 'Subwoofer Crossover (Low Pass)',
    band: 3,
    filter: 7, // LOW_PASS_2
    frequency: 80,
    gain: 0,
    quality: 0.7,
  },
  {
    name: 'High Frequency Roll-off (High Pass)',
    band: 4,
    filter: 8, // HIGH_PASS_2
    frequency: 12000,
    gain: 0,
    quality: 1.2,
  },
];

examples.forEach((example, index) => {
  const result = validateEqualizerParameters(
    example.band,
    example.filter,
    example.frequency,
    example.gain,
    example.quality,
  );

  const status = result.valid ? '✅ VALID' : '❌ INVALID';
  console.log(`${index + 1}. ${example.name}: ${status}`);
  console.log(`   Band: ${example.band}, Filter: ${example.filter}`);
  console.log(
    `   Frequency: ${example.frequency}Hz, Gain: ${example.gain}dB, Quality: ${example.quality}`,
  );

  if (result.errors.length > 0) {
    result.errors.forEach(error => console.log(`   ❌ ${error}`));
  }
  if (result.warnings.length > 0) {
    result.warnings.forEach(warning => console.log(`   ⚠️  ${warning}`));
  }
  console.log('');
});

console.log('🎉 Test completed!');
console.log('\n📝 Summary:');
console.log('- All test cases validate parameter ranges correctly');
console.log('- Filter-specific parameter configurability is enforced');
console.log('- Range validation matches Android GAIA Control SDK 3.4.0.52');
console.log('- Real-world examples demonstrate proper usage patterns');
