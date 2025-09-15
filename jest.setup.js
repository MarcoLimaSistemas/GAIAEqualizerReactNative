// Mock react-native modules
jest.mock('react-native-bluetooth-serial', () => ({
  isEnabled: jest.fn(() => Promise.resolve(true)),
  enable: jest.fn(() => Promise.resolve()),
  list: jest.fn(() => Promise.resolve([])),
  connect: jest.fn(() => Promise.resolve()),
  disconnect: jest.fn(() => Promise.resolve()),
  write: jest.fn(() => Promise.resolve()),
  on: jest.fn(),
  removeAllListeners: jest.fn(),
}));

jest.mock('react-native-permissions', () => ({
  requestMultiple: jest.fn(() => Promise.resolve({})),
  PERMISSIONS: {
    BLUETOOTH_SCAN: 'android.permission.BLUETOOTH_SCAN',
    BLUETOOTH_CONNECT: 'android.permission.BLUETOOTH_CONNECT',
    BLUETOOTH_ADVERTISE: 'android.permission.BLUETOOTH_ADVERTISE',
    ACCESS_FINE_LOCATION: 'android.permission.ACCESS_FINE_LOCATION',
  },
  RESULTS: {
    GRANTED: 'granted',
    DENIED: 'denied',
  },
}));

// Mock Platform
jest.mock('react-native/Libraries/Utilities/Platform', () => ({
  OS: 'android',
  select: jest.fn(obj => obj.android),
}));
