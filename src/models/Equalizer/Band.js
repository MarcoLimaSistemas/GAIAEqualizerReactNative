import {Frequency} from './Frequency';
import {Gain} from './Gain';
import {Quality} from './Quality';
import {FILTER_TYPES, getFilterParameterRanges} from './Filter';

/**
 * Band class for equalizer configuration
 * Based on Android GAIA Control SDK Band class
 */
export class Band {
  constructor() {
    this.filter = FILTER_TYPES.BYPASS;
    this.isFilterUpToDate = false;
    this.frequency = new Frequency();
    this.gain = new Gain();
    this.quality = new Quality();
  }

  /**
   * Set the filter for this band
   * @param {number} filterType - Filter type constant
   * @param {boolean} fromUser - Whether this change is from user action
   */
  setFilter(filterType, fromUser = false) {
    this.filter = filterType;
    const ranges = getFilterParameterRanges(filterType);

    // Update parameter configurability based on filter
    if (ranges.frequency.configurable) {
      this.frequency.setConfigurable(
        ranges.frequency.min,
        ranges.frequency.max,
      );
    } else {
      this.frequency.setNotConfigurable();
    }

    if (ranges.gain.configurable) {
      this.gain.setConfigurable(ranges.gain.min, ranges.gain.max);
    } else {
      this.gain.setNotConfigurable();
    }

    if (ranges.quality.configurable) {
      this.quality.setConfigurable(ranges.quality.min, ranges.quality.max);
    } else {
      this.quality.setNotConfigurable();
    }

    if (!fromUser) {
      this.isFilterUpToDate = true;
    }
  }

  /**
   * Get the current filter type
   * @returns {number} Filter type constant
   */
  getFilter() {
    return this.filter;
  }

  /**
   * Get the frequency parameter
   * @returns {Frequency} Frequency parameter
   */
  getFrequency() {
    return this.frequency;
  }

  /**
   * Get the gain parameter
   * @returns {Gain} Gain parameter
   */
  getGain() {
    return this.gain;
  }

  /**
   * Get the quality parameter
   * @returns {Quality} Quality parameter
   */
  getQuality() {
    return this.quality;
  }

  /**
   * Check if this band is up to date
   * @returns {boolean} True if up to date
   */
  isUpToDate() {
    return (
      this.isFilterUpToDate &&
      this.frequency.isUpToDate() &&
      this.gain.isUpToDate() &&
      this.quality.isUpToDate()
    );
  }

  /**
   * Mark this band as needing update
   */
  hasToBeUpdated() {
    this.isFilterUpToDate = false;
    this.frequency.hasToBeUpdated();
    this.gain.hasToBeUpdated();
    this.quality.hasToBeUpdated();
  }
}
