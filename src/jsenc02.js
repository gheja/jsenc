/* extensions to CryptoJS */
CryptoJS.lib.Cipher.HexFormatter || (function (undefined) {
    // Shortcuts
    var C = CryptoJS;
    var C_lib = C.lib;
    var Base = C_lib.Base;
    var WordArray = C_lib.WordArray;
    var BufferedBlockAlgorithm = C_lib.BufferedBlockAlgorithm;
    var C_enc = C.enc;
    var Utf8 = C_enc.Utf8;
    var Base64 = C_enc.Base64;
    var Hex = C_enc.Hex;
    var C_algo = C.algo;
    var EvpKDF = C_algo.EvpKDF;
    var C_format = C.format;

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

CryptoJS.tke || (function (undefined) {
    var C = CryptoJS;
    var C_lib = C.lib;
    var Base = C_lib.Base;
    var WordArray = C_lib.WordArray;
    var BufferedBlockAlgorithm = C_lib.BufferedBlockAlgorithm;
    var C_enc = C.enc;
    var Utf8 = C_enc.Utf8;
    var Base64 = C_enc.Base64;
    var Hex = C_enc.Hex;
    var C_algo = C.algo;
    var EvpKDF = C_algo.EvpKDF;
    var C_format = C.format;
    
	var C.TKE = C_TKE = {
		masterKeyCfg: Base.extend({
			algo: null,
			salt: null,
			key: null,
			iteration: 1000,
			cipher: null,
			iv: null
		}),
		
		key0Cfg: Base.extend({
			algo: null,
			salt: null,
			key: null,
			iteration: 1000,
			cipher: null,
			iv: null
		}),
		
		create: function()
		{
			C_TKE.cfg.masterKeyEncoding
		},
		
		addPassword: function(password)
		{
			
		},
		
		removePassword: function(password)
		{
			
		},
		
		open: function()
		{
		},
		
		close: function()
		{
		}
	}
}());

function randomize_parameters()
{
	try
	{
		document.getElementById("param_salt").value = CryptoJS.lib.WordArray.random(128/8);
		document.getElementById("param_iv").value = CryptoJS.lib.WordArray.random(128/8);
		document.getElementById("param_iterations").value = Math.floor(3000 + Math.random() * 2000);
	}
	catch (e)
	{
		alert("Could not set up salt, IV or iterations.\nThe error message was: " + e);
	}
}

function encrypt()
{
	var salt = CryptoJS.enc.Hex.parse(document.getElementById("param_salt").value);
	var iv = CryptoJS.enc.Hex.parse(document.getElementById("param_iv").value);
	var iterations = document.getElementById("param_iterations").value;
	var password = document.getElementById("param_password").value;
	var password2 = document.getElementById("param_password2").value;
	var data = document.getElementById("encrypt_data").value;
	var result = "";
	
	if (password != password2)
	{
		alert("Passwords do not match.");
		return false;
	}
	
	if (password == "")
	{
		alert("Warning: password is blank, continuing.");
	}
	
	var key256Bits = CryptoJS.PBKDF2(password, salt, { keySize: 256/32, iterations: iterations, hasher: CryptoJS.algo.SHA256 });
	var encoded_data = CryptoJS.AES.encrypt(data, key256Bits, { iv: iv, format: CryptoJS.format.Hex });
	
	result += "{\n";
	result += "\"algo\": \"SHA256\",\n";
	result += "\"cipher\": \"AES\",\n";
	result += "\"iterations\": " + iterations + ",\n";
	result += "\"encoding\": \"hex\",\n";
	result += "\"salt\": \"" + salt + "\",\n";
	result += "\"iv\": \"" + iv + "\",\n";
// 	result += "\"checksum\": \"" + CryptoJS.SHA256(data) + "\",\n";
	result += "\"data\": \"" + encoded_data + "\"\n";
	result += "}\n";
	
	document.getElementById("output").value = result; 
	
	return true;
}

function decrypt()
{
	var data = document.getElementById("decrypt_data").value;
	try
	{
		var json = eval("(" + data + ")");
	}
	catch (e)
	{
		alert("eval() error: " + e);
		return false;
	}
	
	var password = document.getElementById("param_password").value;
	document.getElementById("param_salt").value = json.salt;
	document.getElementById("param_iv").value = json.iv;
	document.getElementById("param_iterations").value = json.iterations;
	var data = document.getElementById("encrypt_data").value;
	
	var key256Bits = CryptoJS.PBKDF2(password, CryptoJS.enc.Hex.parse(json.salt), { keySize: 256/32, iterations: json.iterations, hasher: CryptoJS.algo.SHA256 });
	document.getElementById("output").value = CryptoJS.AES.decrypt(json.data, key256Bits, { iv: CryptoJS.enc.Hex.parse(json.iv), format: CryptoJS.format.Hex }).toString(CryptoJS.enc.Utf8);
	
	return true;
}