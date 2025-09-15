import {Band} from './Band';
import {MasterGain} from './MasterGain';

/**
 * Bank class for equalizer configuration
 * Based on Android GAIA Control SDK Bank class
 */
export class Bank {
  constructor(numberOfBands = 5) {
    this.bands = [];
    this.currentBand = 1;
    this.masterGain = new MasterGain();

    // Initialize bands
    for (let i = 0; i < numberOfBands; i++) {
      this.bands.push(new Band());
    }
  }

  /**
   * Set the current band to configure
   * @param {number} bandNumber - Band number (1-based)
   */
  setCurrentBand(bandNumber) {
    if (bandNumber < 1) {
      this.currentBand = 1;
    } else if (bandNumber > this.bands.length) {
      this.currentBand = this.bands.length;
    } else {
      this.currentBand = bandNumber;
    }
  }

  /**
   * Get the current band number
   * @returns {number} Current band number
   */
  getNumberCurrentBand() {
    return this.currentBand;
  }

  /**
   * Get the current band object
   * @returns {Band} Current band
   */
  getCurrentBand() {
    return this.bands[this.currentBand - 1];
  }

  /**
   * Get a specific band by number
   * @param {number} bandNumber - Band number (1-based)
   * @returns {Band} Band object
   */
  getBand(bandNumber) {
    if (bandNumber < 1 || bandNumber > this.bands.length) {
      return null;
    }
    return this.bands[bandNumber - 1];
  }

  /**
   * Get the master gain parameter
   * @returns {MasterGain} Master gain parameter
   */
  getMasterGain() {
    return this.masterGain;
  }

  /**
   * Check if the bank is up to date
   * @returns {boolean} True if up to date
   */
  isUpToDate() {
    return (
      this.bands.every(band => band.isUpToDate()) &&
      this.masterGain.isUpToDate()
    );
  }

  /**
   * Mark the bank as needing update
   */
  hasToBeUpdated() {
    this.bands.forEach(band => band.hasToBeUpdated());
    this.masterGain.hasToBeUpdated();
  }

  /**
   * Get all bands
   * @returns {Array<Band>} Array of band objects
   */
  getAllBands() {
    return this.bands;
  }

  /**
   * Get the number of bands
   * @returns {number} Number of bands
   */
  getNumberOfBands() {
    return this.bands.length;
  }
}
