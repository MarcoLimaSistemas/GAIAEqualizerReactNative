import {Parameter} from './Parameter';

/**
 * Gain parameter for equalizer bands
 * Based on Android GAIA Control SDK Gain class
 */
export class Gain extends Parameter {
  constructor() {
    super('GAIN', 100); // Factor of 100 for gain (stored as centi-dB)
  }

  /**
   * Get a human readable label for gain value
   * @param {number} value - Gain value in dB
   * @returns {string} Formatted gain label
   */
  getLabel(value) {
    return `${value.toFixed(1)}dB`;
  }
}
