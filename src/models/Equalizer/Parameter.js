/**
 * Base parameter class for equalizer parameters
 * Based on Android GAIA Control SDK Parameter class
 */

export class Parameter {
  constructor(parameterType, factor = 1) {
    this.parameterType = parameterType;
    this.factor = factor;
    this.rawValue = 0;
    this.isConfigurable = false;
    this.isUpToDate = false;
    this.rawBounds = [0, 0];
    this.labelBounds = ['', ''];
  }

  /**
   * Get the raw value of this parameter as known by the device
   * @returns {number} The raw value
   */
  getValue() {
    return this.rawValue;
  }

  /**
   * Get the position of this parameter value in a range from 0 to bounds length
   * @returns {number} Position value
   */
  getPositionValue() {
    return this.rawValue - this.rawBounds[0];
  }

  /**
   * Get the length of the parameter range
   * @returns {number} Range length
   */
  getBoundsLength() {
    return this.rawBounds[1] - this.rawBounds[0];
  }

  /**
   * Check if this parameter is configurable
   * @returns {boolean} True if configurable
   */
  isConfigurable() {
    return this.isConfigurable;
  }

  /**
   * Check if this parameter is up to date
   * @returns {boolean} True if up to date
   */
  isUpToDate() {
    return this.isUpToDate;
  }

  /**
   * Get the label for the minimum bound
   * @returns {string} Minimum bound label
   */
  getLabelMinBound() {
    return this.isConfigurable ? this.labelBounds[0] : '';
  }

  /**
   * Get the label for the maximum bound
   * @returns {string} Maximum bound label
   */
  getLabelMaxBound() {
    return this.isConfigurable ? this.labelBounds[1] : '';
  }

  /**
   * Get the label for the current value
   * @returns {string} Current value label
   */
  getLabelValue() {
    const realValue = this.rawValue / this.factor;
    return this.getLabel(realValue);
  }

  /**
   * Set the raw value of this parameter
   * @param {number} value - Raw value
   */
  setValue(value) {
    this.isUpToDate = true;
    this.rawValue = value;
  }

  /**
   * Set the raw value from a proportion value
   * @param {number} lengthValue - Proportion value (0 to bounds length)
   */
  setValueFromProportion(lengthValue) {
    this.rawValue = lengthValue + this.rawBounds[0];
  }

  /**
   * Set this parameter as configurable with given bounds
   * @param {number} minBound - Minimum bound
   * @param {number} maxBound - Maximum bound
   */
  setConfigurable(minBound, maxBound) {
    this.isConfigurable = true;
    this.setBound(0, minBound);
    this.setBound(1, maxBound);
  }

  /**
   * Set this parameter as not configurable
   */
  setNotConfigurable() {
    this.isConfigurable = false;
  }

  /**
   * Mark this parameter as needing update
   */
  hasToBeUpdated() {
    this.isUpToDate = false;
  }

  /**
   * Set a bound value
   * @param {number} position - Bound position (0 for min, 1 for max)
   * @param {number} value - Bound value
   */
  setBound(position, value) {
    this.labelBounds[position] = this.getLabel(value);
    this.rawBounds[position] = Math.round(value * this.factor);
  }

  /**
   * Get a human readable label for a value
   * @param {number} value - Value to format
   * @returns {string} Formatted label
   */
  getLabel(value) {
    // Override in subclasses
    return value.toString();
  }
}
