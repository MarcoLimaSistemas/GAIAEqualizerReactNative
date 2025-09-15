import {Parameter} from './Parameter';

/**
 * Master gain parameter for equalizer bank
 * Based on Android GAIA Control SDK MasterGain class
 */
export class MasterGain extends Parameter {
  constructor() {
    super('MASTER_GAIN', 100); // Factor of 100 for master gain (stored as centi-dB)
    // Default master gain range: -36dB to +12dB
    this.setConfigurable(-36, 12);
  }

  /**
   * Get a human readable label for master gain value
   * @param {number} value - Master gain value in dB
   * @returns {string} Formatted master gain label
   */
  getLabel(value) {
    return `${value.toFixed(1)}dB`;
  }
}
