/* global kijs */

// --------------------------------------------------------------
// kijs.Error
// --------------------------------------------------------------
/**
 * Fehlerklasse von kijs (abgeleitet von Error).
 *
 * @example
 * throw new kijs.Error('invalid value');
 */
kijs.Error = class kijs_Error extends Error {

    // overwrite
    constructor(message, fileName, lineNumber) {
        super(message, fileName, lineNumber);
    }
};