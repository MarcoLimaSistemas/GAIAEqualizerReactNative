import {Parameter} from './Parameter';

/**
 * Quality parameter for equalizer bands
 * Based on Android GAIA Control SDK Quality class
 */
export class Quality extends Parameter {
  constructor() {
    super('QUALITY', 100); // Factor of 100 for quality (stored as centi-Q)
  }

  /**
   * Get a human readable label for quality value
   * @param {number} value - Quality value
   * @returns {string} Formatted quality label
   */
  getLabel(value) {
    return value.toFixed(2);
  }
}
