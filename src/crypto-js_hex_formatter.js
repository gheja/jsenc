/* extensions to CryptoJS */
CryptoJS.lib.Cipher.HexFormatter || (function (undefined) {
    // Shortcuts
    
    // Shortcuts
    var C = CryptoJS;
    var C_enc = C.enc;
    var C_lib = C.lib;
    var C_format = C.format;
    var Hex = C_enc.Hex;
    var CipherParams = C_lib.CipherParams;
    
    var HexFormatter = C_format.Hex = {
        /**
         * Converts a cipher params object to a hexadecimally encoded string.
         *
         * @param {CipherParams} cipherParams The cipher params object.
         *
         * @return {string} The OpenSSL-compatible string.
         *
         * @static
         *
         * @example
         *
         *     var hexString = CryptoJS.format.Hex.stringify(cipherParams);
         */
        stringify: function (cipherParams) {
            return cipherParams.ciphertext.toString(Hex);
        },

        /**
         * Converts a hexadecimally encoded string to a cipher params object.
         *
         * @param {string} input The hexadecimally encoded string.
         *
         * @return {CipherParams} The cipher params object.
         *
         * @static
         *
         * @example
         *
         *     var cipherParams = CryptoJS.format.Hex.parse(hexString);
         */
        parse: function (input) {
            var ciphertext = Hex.parse(input);
            return CipherParams.create({ ciphertext: ciphertext });
        }
    };
}());
