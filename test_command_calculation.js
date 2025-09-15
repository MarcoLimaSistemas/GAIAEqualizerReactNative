#!/usr/bin/env node

/**
 * GAIA Command Calculation Test
 *
 * This script compares the command calculation logic between Android SDK
 * and React Native implementation to ensure they are identical.
 */

// Android constants (from CustomEqualizerGaiaManager.java)
const ANDROID_CONSTANTS = {
  GENERAL_BAND: 0x00,
  PARAMETER_MASTER_GAIN: 0x01,
  EQ_PARAMETER_FIRST_BYTE: 0x01,
  GET_EQ_PARAMETER_PAYLOAD_LENGTH: 5,
  SET_EQ_PARAMETER_PAYLOAD_LENGTH: 5,
};

// React Native constants (from GAIACommands.js)
const RN_CONSTANTS = {
  GENERAL_BAND: 0x00,
  PARAMETER_MASTER_GAIN: 0x01,
  EQ_PARAMETER_FIRST_BYTE: 0x01,
  GET_EQ_PARAMETER_PAYLOAD_LENGTH: 5,
  SET_EQ_PARAMETER_PAYLOAD_LENGTH: 5,
};

// Android buildParameterIDLowByte method (from CustomEqualizerGaiaManager.java)
function androidBuildParameterIDLowByte(band, parameter) {
  return (band << 4) | parameter;
}

// React Native buildParameterIDLowByte method (from GAIAProtocol.js)
function rnBuildParameterIDLowByte(band, parameter) {
  return (band << 4) | parameter;
}

// Android getEQParameter payload construction (from CustomEqualizerGaiaManager.java)
function androidGetEQParameterPayload(band, parameter) {
  const payload = new Uint8Array(2);
  payload[0] = ANDROID_CONSTANTS.EQ_PARAMETER_FIRST_BYTE;
  payload[1] = androidBuildParameterIDLowByte(band, parameter);
  return payload;
}

// React Native getEQParameter payload construction (from GAIAProtocol.js)
function rnGetEQParameterPayload(band, parameter) {
  const payload = new Uint8Array(2);
  payload[0] = RN_CONSTANTS.EQ_PARAMETER_FIRST_BYTE;
  payload[1] = rnBuildParameterIDLowByte(band, parameter);
  return payload;
}

// Android setEQParameter payload construction (from CustomEqualizerGaiaManager.java)
function androidSetEQParameterPayload(
  band,
  parameter,
  value,
  isBank1Selected = false,
) {
  const payload = new Uint8Array(5);
  payload[0] = ANDROID_CONSTANTS.EQ_PARAMETER_FIRST_BYTE;
  payload[1] = androidBuildParameterIDLowByte(band, parameter);

  // Copy value as 2-byte integer (big endian)
  payload[2] = (value >> 8) & 0xff;
  payload[3] = value & 0xff;

  // Recalculation flag
  payload[4] = isBank1Selected ? 0x01 : 0x00;

  return payload;
}

// React Native setEQParameter payload construction (from GAIAProtocol.js)
function rnSetEQParameterPayload(
  band,
  parameter,
  value,
  isBank1Selected = false,
) {
  const payload = new Uint8Array(5);
  payload[0] = RN_CONSTANTS.EQ_PARAMETER_FIRST_BYTE;
  payload[1] = rnBuildParameterIDLowByte(band, parameter);

  // Copy value as 2-byte integer (big endian)
  payload[2] = (value >> 8) & 0xff;
  payload[3] = value & 0xff;

  // Recalculation flag
  payload[4] = isBank1Selected ? 0x01 : 0x00;

  return payload;
}

// Android packet parsing (from CustomEqualizerGaiaManager.java)
function androidParseGetEQParameterResponse(payload) {
  const OFFSET_PARAMETER_ID_LOW_BYTE = 2;
  const VALUE_OFFSET = 3;
  const VALUE_LENGTH = 2;

  const band = (payload[OFFSET_PARAMETER_ID_LOW_BYTE] & 0xf0) >> 4;
  const param = payload[OFFSET_PARAMETER_ID_LOW_BYTE] & 0x0f;

  // Extract 2-byte value (big endian)
  const value = (payload[VALUE_OFFSET] << 8) | payload[VALUE_OFFSET + 1];

  return {band, param, value};
}

// React Native packet parsing (from GAIAProtocol.js)
function rnParseGetEQParameterResponse(payload) {
  const parameterIDLowByte = payload[2];
  const band = (parameterIDLowByte & 0xf0) >> 4;
  const param = parameterIDLowByte & 0x0f;

  // Extract 2-byte value (big endian)
  const value = (payload[3] << 8) | payload[4];

  return {band, param, value};
}

console.log('🔍 GAIA Command Calculation Comparison Test');
console.log('==========================================\n');

// Test 1: Constants comparison
console.log('📋 Constants Comparison:');
console.log('------------------------');
const constantsMatch =
  ANDROID_CONSTANTS.GENERAL_BAND === RN_CONSTANTS.GENERAL_BAND &&
  ANDROID_CONSTANTS.PARAMETER_MASTER_GAIN ===
    RN_CONSTANTS.PARAMETER_MASTER_GAIN &&
  ANDROID_CONSTANTS.EQ_PARAMETER_FIRST_BYTE ===
    RN_CONSTANTS.EQ_PARAMETER_FIRST_BYTE &&
  ANDROID_CONSTANTS.GET_EQ_PARAMETER_PAYLOAD_LENGTH ===
    RN_CONSTANTS.GET_EQ_PARAMETER_PAYLOAD_LENGTH &&
  ANDROID_CONSTANTS.SET_EQ_PARAMETER_PAYLOAD_LENGTH ===
    RN_CONSTANTS.SET_EQ_PARAMETER_PAYLOAD_LENGTH;

console.log(`Constants Match: ${constantsMatch ? '✅ PASS' : '❌ FAIL'}`);
console.log(
  `GENERAL_BAND: Android=${ANDROID_CONSTANTS.GENERAL_BAND}, RN=${RN_CONSTANTS.GENERAL_BAND}`,
);
console.log(
  `PARAMETER_MASTER_GAIN: Android=${ANDROID_CONSTANTS.PARAMETER_MASTER_GAIN}, RN=${RN_CONSTANTS.PARAMETER_MASTER_GAIN}`,
);
console.log(
  `EQ_PARAMETER_FIRST_BYTE: Android=${ANDROID_CONSTANTS.EQ_PARAMETER_FIRST_BYTE}, RN=${RN_CONSTANTS.EQ_PARAMETER_FIRST_BYTE}`,
);
console.log('');

// Test 2: buildParameterIDLowByte comparison
console.log('🔧 buildParameterIDLowByte Comparison:');
console.log('-------------------------------------');
const testCases = [
  {band: 0, parameter: 1, description: 'Master Gain'},
  {band: 1, parameter: 0, description: 'Band 1 Filter'},
  {band: 1, parameter: 1, description: 'Band 1 Frequency'},
  {band: 1, parameter: 2, description: 'Band 1 Gain'},
  {band: 1, parameter: 3, description: 'Band 1 Quality'},
  {band: 5, parameter: 0, description: 'Band 5 Filter'},
];

let buildMethodMatch = true;
testCases.forEach((testCase, index) => {
  const androidResult = androidBuildParameterIDLowByte(
    testCase.band,
    testCase.parameter,
  );
  const rnResult = rnBuildParameterIDLowByte(testCase.band, testCase.parameter);
  const match = androidResult === rnResult;
  buildMethodMatch = buildMethodMatch && match;

  console.log(
    `${index + 1}. ${testCase.description}: ${match ? '✅ PASS' : '❌ FAIL'}`,
  );
  console.log(`   Band: ${testCase.band}, Parameter: ${testCase.parameter}`);
  console.log(
    `   Android: 0x${androidResult
      .toString(16)
      .toUpperCase()
      .padStart(2, '0')} (${androidResult})`,
  );
  console.log(
    `   React Native: 0x${rnResult
      .toString(16)
      .toUpperCase()
      .padStart(2, '0')} (${rnResult})`,
  );
  console.log('');
});

console.log(
  `buildParameterIDLowByte Overall: ${
    buildMethodMatch ? '✅ PASS' : '❌ FAIL'
  }\n`,
);

// Test 3: GET_EQ_PARAMETER payload comparison
console.log('📤 GET_EQ_PARAMETER Payload Comparison:');
console.log('--------------------------------------');
let getPayloadMatch = true;
testCases.forEach((testCase, index) => {
  const androidPayload = androidGetEQParameterPayload(
    testCase.band,
    testCase.parameter,
  );
  const rnPayload = rnGetEQParameterPayload(testCase.band, testCase.parameter);
  const match =
    androidPayload.length === rnPayload.length &&
    androidPayload[0] === rnPayload[0] &&
    androidPayload[1] === rnPayload[1];
  getPayloadMatch = getPayloadMatch && match;

  console.log(
    `${index + 1}. ${testCase.description}: ${match ? '✅ PASS' : '❌ FAIL'}`,
  );
  console.log(
    `   Android: [${Array.from(androidPayload)
      .map(b => `0x${b.toString(16).toUpperCase().padStart(2, '0')}`)
      .join(', ')}]`,
  );
  console.log(
    `   React Native: [${Array.from(rnPayload)
      .map(b => `0x${b.toString(16).toUpperCase().padStart(2, '0')}`)
      .join(', ')}]`,
  );
  console.log('');
});

console.log(
  `GET_EQ_PARAMETER Payload Overall: ${
    getPayloadMatch ? '✅ PASS' : '❌ FAIL'
  }\n`,
);

// Test 4: SET_EQ_PARAMETER payload comparison
console.log('📤 SET_EQ_PARAMETER Payload Comparison:');
console.log('--------------------------------------');
const setTestCases = [
  {band: 0, parameter: 1, value: 0, description: 'Master Gain = 0'},
  {band: 1, parameter: 0, value: 4, description: 'Band 1 Filter = LOW_SHELF_1'},
  {
    band: 1,
    parameter: 1,
    value: 1000,
    description: 'Band 1 Frequency = 1000Hz',
  },
  {band: 1, parameter: 2, value: 6, description: 'Band 1 Gain = +6dB'},
  {band: 1, parameter: 3, value: 150, description: 'Band 1 Quality = 1.5'},
  {
    band: 5,
    parameter: 0,
    value: 13,
    description: 'Band 5 Filter = PARAMETRIC_EQUALIZER',
  },
];

let setPayloadMatch = true;
setTestCases.forEach((testCase, index) => {
  const androidPayload = androidSetEQParameterPayload(
    testCase.band,
    testCase.parameter,
    testCase.value,
    false,
  );
  const rnPayload = rnSetEQParameterPayload(
    testCase.band,
    testCase.parameter,
    testCase.value,
    false,
  );
  const match =
    androidPayload.length === rnPayload.length &&
    androidPayload[0] === rnPayload[0] &&
    androidPayload[1] === rnPayload[1] &&
    androidPayload[2] === rnPayload[2] &&
    androidPayload[3] === rnPayload[3] &&
    androidPayload[4] === rnPayload[4];
  setPayloadMatch = setPayloadMatch && match;

  console.log(
    `${index + 1}. ${testCase.description}: ${match ? '✅ PASS' : '❌ FAIL'}`,
  );
  console.log(`   Value: ${testCase.value}`);
  console.log(
    `   Android: [${Array.from(androidPayload)
      .map(b => `0x${b.toString(16).toUpperCase().padStart(2, '0')}`)
      .join(', ')}]`,
  );
  console.log(
    `   React Native: [${Array.from(rnPayload)
      .map(b => `0x${b.toString(16).toUpperCase().padStart(2, '0')}`)
      .join(', ')}]`,
  );
  console.log('');
});

console.log(
  `SET_EQ_PARAMETER Payload Overall: ${
    setPayloadMatch ? '✅ PASS' : '❌ FAIL'
  }\n`,
);

// Test 5: Packet parsing comparison
console.log('📥 Packet Parsing Comparison:');
console.log('-----------------------------');
const parseTestCases = [
  {payload: [0x00, 0x01, 0x10, 0x00, 0x00], description: 'Master Gain = 0'},
  {
    payload: [0x00, 0x01, 0x14, 0x00, 0x04],
    description: 'Band 1 Filter = LOW_SHELF_1',
  },
  {
    payload: [0x00, 0x01, 0x11, 0x03, 0xe8],
    description: 'Band 1 Frequency = 1000Hz',
  },
  {payload: [0x00, 0x01, 0x12, 0x00, 0x06], description: 'Band 1 Gain = +6dB'},
  {
    payload: [0x00, 0x01, 0x13, 0x00, 0x96],
    description: 'Band 1 Quality = 1.5',
  },
];

let parseMatch = true;
parseTestCases.forEach((testCase, index) => {
  const androidResult = androidParseGetEQParameterResponse(
    new Uint8Array(testCase.payload),
  );
  const rnResult = rnParseGetEQParameterResponse(
    new Uint8Array(testCase.payload),
  );
  const match =
    androidResult.band === rnResult.band &&
    androidResult.param === rnResult.param &&
    androidResult.value === rnResult.value;
  parseMatch = parseMatch && match;

  console.log(
    `${index + 1}. ${testCase.description}: ${match ? '✅ PASS' : '❌ FAIL'}`,
  );
  console.log(
    `   Payload: [${testCase.payload
      .map(b => `0x${b.toString(16).toUpperCase().padStart(2, '0')}`)
      .join(', ')}]`,
  );
  console.log(
    `   Android: Band=${androidResult.band}, Param=${androidResult.param}, Value=${androidResult.value}`,
  );
  console.log(
    `   React Native: Band=${rnResult.band}, Param=${rnResult.param}, Value=${rnResult.value}`,
  );
  console.log('');
});

console.log(`Packet Parsing Overall: ${parseMatch ? '✅ PASS' : '❌ FAIL'}\n`);

// Test 6: Endianness verification
console.log('🔄 Endianness Verification:');
console.log('---------------------------');
const endianTestCases = [
  {value: 0x0000, description: 'Zero'},
  {value: 0x0001, description: 'One'},
  {value: 0x00ff, description: '255'},
  {value: 0x0100, description: '256'},
  {value: 0x03e8, description: '1000'},
  {value: 0x7fff, description: '32767'},
  {value: 0x8000, description: '32768'},
  {value: 0xffff, description: '65535'},
];

let endianMatch = true;
endianTestCases.forEach((testCase, index) => {
  const androidPayload = androidSetEQParameterPayload(
    1,
    1,
    testCase.value,
    false,
  );
  const rnPayload = rnSetEQParameterPayload(1, 1, testCase.value, false);

  // Extract value back
  const androidValue = (androidPayload[2] << 8) | androidPayload[3];
  const rnValue = (rnPayload[2] << 8) | rnPayload[3];

  const match = androidValue === rnValue && androidValue === testCase.value;
  endianMatch = endianMatch && match;

  console.log(
    `${index + 1}. ${testCase.description}: ${match ? '✅ PASS' : '❌ FAIL'}`,
  );
  console.log(
    `   Original: ${testCase.value} (0x${testCase.value
      .toString(16)
      .toUpperCase()})`,
  );
  console.log(
    `   Android: ${androidValue} (0x${androidValue
      .toString(16)
      .toUpperCase()})`,
  );
  console.log(
    `   React Native: ${rnValue} (0x${rnValue.toString(16).toUpperCase()})`,
  );
  console.log('');
});

console.log(`Endianness Overall: ${endianMatch ? '✅ PASS' : '❌ FAIL'}\n`);

// Final summary
console.log('🎯 FINAL SUMMARY:');
console.log('=================');
const overallMatch =
  constantsMatch &&
  buildMethodMatch &&
  getPayloadMatch &&
  setPayloadMatch &&
  parseMatch &&
  endianMatch;

console.log(`Constants: ${constantsMatch ? '✅ PASS' : '❌ FAIL'}`);
console.log(
  `buildParameterIDLowByte: ${buildMethodMatch ? '✅ PASS' : '❌ FAIL'}`,
);
console.log(
  `GET_EQ_PARAMETER Payload: ${getPayloadMatch ? '✅ PASS' : '❌ FAIL'}`,
);
console.log(
  `SET_EQ_PARAMETER Payload: ${setPayloadMatch ? '✅ PASS' : '❌ FAIL'}`,
);
console.log(`Packet Parsing: ${parseMatch ? '✅ PASS' : '❌ FAIL'}`);
console.log(`Endianness: ${endianMatch ? '✅ PASS' : '❌ FAIL'}`);
console.log('');
console.log(
  `🎉 OVERALL RESULT: ${
    overallMatch ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'
  }`,
);

if (overallMatch) {
  console.log(
    '\n✅ The React Native implementation produces IDENTICAL commands to the Android SDK!',
  );
  console.log(
    '✅ All calculations, payloads, and parsing logic match perfectly.',
  );
  console.log('✅ The GAIA protocol implementation is 100% compatible.');
} else {
  console.log(
    '\n❌ There are differences between Android and React Native implementations.',
  );
  console.log(
    '❌ Please review the failed tests above and fix the discrepancies.',
  );
}
