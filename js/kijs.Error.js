/* global kijs */

// --------------------------------------------------------------
// kijs.Error
// --------------------------------------------------------------
kijs.Error = class kijs_Error extends Error {

    // overwrite
    constructor(message, fileName, lineNumber) {
        super(message, fileName, lineNumber);
    }
};