import {Parameter} from './Parameter';

/**
 * Frequency parameter for equalizer bands
 * Based on Android GAIA Control SDK Frequency class
 */
export class Frequency extends Parameter {
  constructor() {
    super('FREQUENCY', 1); // Factor of 1 for frequency
  }

  /**
   * Get a human readable label for frequency value
   * @param {number} value - Frequency value in Hz
   * @returns {string} Formatted frequency label
   */
  getLabel(value) {
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}kHz`;
    } else {
      return `${value.toFixed(1)}Hz`;
    }
  }
}
