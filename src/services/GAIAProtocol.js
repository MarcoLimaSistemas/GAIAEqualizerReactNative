import {
  GAIA_COMMANDS,
  GAIA_STATUS,
  GAIA_VENDOR,
  EQUALIZER_CONSTANTS,
  PARAMETER_TYPES,
} from '../constants/GAIACommands';

/**
 * GAIA Protocol implementation for equalizer control
 * Based on Android GAIA Control SDK GAIA protocol
 */
export class GAIAProtocol {
  constructor(bluetoothService) {
    this.bluetoothService = bluetoothService;
    this.isBank1Selected = false;
    this.listeners = [];
  }

  /**
   * Create a GAIA packet
   * @param {number} command - GAIA command
   * @param {Uint8Array} payload - Packet payload
   * @param {boolean} isAck - Whether this is an acknowledgment
   * @returns {Uint8Array} GAIA packet
   */
  createPacket(command, payload = new Uint8Array(0), isAck = false) {
    const payloadLength = payload.length;
    const packetLength = 4 + payloadLength; // Header + payload

    const packet = new Uint8Array(packetLength);

    // Header
    packet[0] = 0xff; // SOP1
    packet[1] = 0xff; // SOP2
    packet[2] = command & 0xff; // Command low byte
    packet[3] = ((command >> 8) & 0xff) | (isAck ? 0x80 : 0x00); // Command high byte + ACK bit

    // Payload
    for (let i = 0; i < payloadLength; i++) {
      packet[4 + i] = payload[i];
    }

    return packet;
  }

  /**
   * Send a GAIA packet
   * @param {Uint8Array} packet - GAIA packet to send
   * @returns {Promise<boolean>} True if sent successfully
   */
  async sendPacket(packet) {
    return await this.bluetoothService.sendData(packet);
  }

  /**
   * Parse incoming GAIA packet
   * @param {Uint8Array} data - Incoming data
   * @returns {Object|null} Parsed packet or null if invalid
   */
  parsePacket(data) {
    if (data.length < 4) {
      return null;
    }

    // Check SOP
    if (data[0] !== 0xff || data[1] !== 0xff) {
      return null;
    }

    const command = data[2] | ((data[3] & 0x7f) << 8);
    const isAck = (data[3] & 0x80) !== 0;
    const payload = data.slice(4);

    return {
      command,
      isAck,
      payload,
      status: payload.length > 0 ? payload[0] : GAIA_STATUS.SUCCESS,
    };
  }

  /**
   * Build parameter ID low byte
   * @param {number} band - Band number (0 for general, 1-5 for specific bands)
   * @param {number} parameter - Parameter type
   * @returns {number} Parameter ID low byte
   */
  buildParameterIDLowByte(band, parameter) {
    return (band << 4) | parameter;
  }

  /**
   * Copy integer into byte array
   * @param {number} value - Value to copy
   * @param {Uint8Array} array - Target array
   * @param {number} offset - Offset in array
   * @param {number} length - Number of bytes
   * @param {boolean} littleEndian - Whether to use little endian
   */
  copyIntIntoByteArray(value, array, offset, length, littleEndian = false) {
    for (let i = 0; i < length; i++) {
      const byteIndex = littleEndian ? i : length - 1 - i;
      array[offset + byteIndex] = (value >> (i * 8)) & 0xff;
    }
  }

  /**
   * Extract short from byte array
   * @param {Uint8Array} array - Source array
   * @param {number} offset - Offset in array
   * @param {number} length - Number of bytes
   * @param {boolean} littleEndian - Whether to use little endian
   * @returns {number} Extracted value
   */
  extractShortFromByteArray(array, offset, length, littleEndian = false) {
    let value = 0;
    for (let i = 0; i < length; i++) {
      const byteIndex = littleEndian ? i : length - 1 - i;
      value |= array[offset + byteIndex] << (i * 8);
    }
    return value;
  }

  /**
   * Set equalizer preset
   * @param {number} preset - Preset number (0-2)
   * @returns {Promise<boolean>} True if sent successfully
   */
  async setPreset(preset) {
    if (preset < 0 || preset >= EQUALIZER_CONSTANTS.NUMBER_OF_PRESETS) {
      console.warn('Invalid preset:', preset);
      return false;
    }

    const payload = new Uint8Array(1);
    payload[0] = preset;

    const packet = this.createPacket(
      GAIA_COMMANDS.COMMAND_SET_EQ_CONTROL,
      payload,
    );
    return await this.sendPacket(packet);
  }

  /**
   * Get equalizer preset
   * @returns {Promise<boolean>} True if sent successfully
   */
  async getPreset() {
    const packet = this.createPacket(GAIA_COMMANDS.COMMAND_GET_EQ_CONTROL);
    return await this.sendPacket(packet);
  }

  /**
   * Get equalizer parameter
   * @param {number} band - Band number (0 for general, 1-5 for specific bands)
   * @param {number} parameter - Parameter type
   * @returns {Promise<boolean>} True if sent successfully
   */
  async getEQParameter(band, parameter) {
    const payload = new Uint8Array(2);
    payload[0] = EQUALIZER_CONSTANTS.EQ_PARAMETER_FIRST_BYTE;
    payload[1] = this.buildParameterIDLowByte(band, parameter);

    const packet = this.createPacket(
      GAIA_COMMANDS.COMMAND_GET_EQ_PARAMETER,
      payload,
    );
    return await this.sendPacket(packet);
  }

  /**
   * Set equalizer parameter
   * @param {number} band - Band number (0 for general, 1-5 for specific bands)
   * @param {number} parameter - Parameter type
   * @param {number} value - Parameter value
   * @returns {Promise<boolean>} True if sent successfully
   */
  async setEQParameter(band, parameter, value) {
    const payload = new Uint8Array(5);
    payload[0] = EQUALIZER_CONSTANTS.EQ_PARAMETER_FIRST_BYTE;
    payload[1] = this.buildParameterIDLowByte(band, parameter);

    // Copy value as 2-byte integer
    this.copyIntIntoByteArray(value, payload, 2, 2, false);

    // Recalculation flag (1 if bank 1 is selected, 0 otherwise)
    payload[4] = this.isBank1Selected ? 0x01 : 0x00;

    const packet = this.createPacket(
      GAIA_COMMANDS.COMMAND_SET_EQ_PARAMETER,
      payload,
    );
    return await this.sendPacket(packet);
  }

  /**
   * Get master gain
   * @returns {Promise<boolean>} True if sent successfully
   */
  async getMasterGain() {
    return await this.getEQParameter(
      EQUALIZER_CONSTANTS.GENERAL_BAND,
      EQUALIZER_CONSTANTS.PARAMETER_MASTER_GAIN,
    );
  }

  /**
   * Set master gain
   * @param {number} value - Master gain value
   * @returns {Promise<boolean>} True if sent successfully
   */
  async setMasterGain(value) {
    return await this.setEQParameter(
      EQUALIZER_CONSTANTS.GENERAL_BAND,
      EQUALIZER_CONSTANTS.PARAMETER_MASTER_GAIN,
      value,
    );
  }

  /**
   * Handle incoming GAIA packet
   * @param {Uint8Array} data - Incoming data
   */
  handleIncomingPacket(data) {
    const packet = this.parsePacket(data);
    if (!packet) {
      return;
    }

    if (packet.isAck) {
      this.handleAcknowledgement(packet);
    } else {
      this.handleNotification(packet);
    }
  }

  /**
   * Handle acknowledgment packet
   * @param {Object} packet - Parsed packet
   */
  handleAcknowledgement(packet) {
    if (packet.status === GAIA_STATUS.SUCCESS) {
      this.handleSuccessfulAcknowledgement(packet);
    } else {
      this.handleUnsuccessfulAcknowledgement(packet);
    }
  }

  /**
   * Handle successful acknowledgment
   * @param {Object} packet - Parsed packet
   */
  handleSuccessfulAcknowledgement(packet) {
    switch (packet.command) {
      case GAIA_COMMANDS.COMMAND_GET_EQ_PARAMETER:
        this.handleGetEQParameterACK(packet);
        break;
      case GAIA_COMMANDS.COMMAND_GET_EQ_CONTROL:
        this.handleGetEQControlACK(packet);
        break;
      default:
        break;
    }
  }

  /**
   * Handle unsuccessful acknowledgment
   * @param {Object} packet - Parsed packet
   */
  handleUnsuccessfulAcknowledgement(packet) {
    if (packet.status === GAIA_STATUS.INCORRECT_STATE) {
      this.notifyListeners('onIncorrectState');
    } else {
      this.notifyListeners('onControlNotSupported');
    }
  }

  /**
   * Handle GET_EQ_PARAMETER acknowledgment
   * @param {Object} packet - Parsed packet
   */
  handleGetEQParameterACK(packet) {
    if (
      packet.payload.length <
      EQUALIZER_CONSTANTS.GET_EQ_PARAMETER_PAYLOAD_LENGTH
    ) {
      console.warn('GET_EQ_PARAMETER packet with missing arguments');
      return;
    }

    const parameterIDLowByte = packet.payload[2];
    const band = (parameterIDLowByte & 0xf0) >> 4;
    const param = parameterIDLowByte & 0x0f;
    const value = this.extractShortFromByteArray(packet.payload, 3, 2, false);

    // Master gain
    if (
      band === EQUALIZER_CONSTANTS.GENERAL_BAND &&
      param === EQUALIZER_CONSTANTS.PARAMETER_MASTER_GAIN
    ) {
      this.notifyListeners('onGetMasterGain', value);
    } else {
      // Band parameters
      switch (param) {
        case PARAMETER_TYPES.FILTER:
          this.notifyListeners('onGetFilter', band, value);
          break;
        case PARAMETER_TYPES.FREQUENCY:
          this.notifyListeners('onGetFrequency', band, value);
          break;
        case PARAMETER_TYPES.GAIN:
          this.notifyListeners('onGetGain', band, value);
          break;
        case PARAMETER_TYPES.QUALITY:
          this.notifyListeners('onGetQuality', band, value);
          break;
        default:
          console.warn('Unknown parameter type:', param);
          break;
      }
    }
  }

  /**
   * Handle GET_EQ_CONTROL acknowledgment
   * @param {Object} packet - Parsed packet
   */
  handleGetEQControlACK(packet) {
    if (packet.payload.length >= 2) {
      const preset = packet.payload[1];
      this.isBank1Selected = preset === EQUALIZER_CONSTANTS.CUSTOMIZABLE_PRESET;
    }
  }

  /**
   * Handle notification packet
   * @param {Object} packet - Parsed packet
   */
  handleNotification(packet) {
    // Handle notifications if needed
    console.log('Received notification:', packet);
  }

  /**
   * Add event listener
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   */
  addListener(event, callback) {
    this.listeners.push({event, callback});
  }

  /**
   * Remove event listener
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   */
  removeListener(event, callback) {
    this.listeners = this.listeners.filter(
      listener => !(listener.event === event && listener.callback === callback),
    );
  }

  /**
   * Notify all listeners of an event
   * @param {string} event - Event name
   * @param {...any} args - Event arguments
   */
  notifyListeners(event, ...args) {
    this.listeners.forEach(listener => {
      if (listener.event === event) {
        listener.callback(...args);
      }
    });
  }
}
