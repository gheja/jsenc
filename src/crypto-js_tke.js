CryptoJS.TKE || (function (undefined) {
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
	
	var C_TKE = C.TKE = {
		containerIsOpen: false,
		masterKey: {
			cipher: null,
			key: null,
			iv: null
		},
		keys: [],
		keySlotUsed: null,
		data: null,
		
		_setMasterKey: function(cfg)
		{
			if (this.data != null && this.containerIsOpen)
			{
				throw new Error("Cannot set master key as container already holds data and is open, you may want to close() and reset() the container.");
			}
			
			this.masterKey = cfg;
			this.containerIsOpen = true;
		},
		
		_clearMasterKey: function()
		{
			this.masterKey = { cipher: null, key: null, iv: null };
			this.containerIsOpen = false;
		},
		
		addKey: function(algo, key, salt, iterations, cipher, iv)
		{
			if (!this.containerIsOpen && this.data != null)
			{
				throw new Error("Cannot add key. Data present but container is not open.");
			}
			
			/* master key data to be stored as string (strip the unneded things, store values in hexadecimal form) */
			var masterKeyAsString = JSON.stringify({
				cipher: this.masterKey.cipher,
				key: this.masterKey.key.toString(CryptoJS.enc.Hex),
				iv: this.masterKey.iv.toString(CryptoJS.enc.Hex)
			});
			
			var key256Bits = CryptoJS.PBKDF2(key, CryptoJS.enc.Hex.parse(salt), { keySize: 256/32, iterations: iterations, hasher: CryptoJS.algo.SHA256 });
			var masterKeyData = CryptoJS.AES.encrypt(masterKeyAsString, key256Bits, { iv: CryptoJS.enc.Hex.parse(iv), format: CryptoJS.format.Hex });
			this.keys[this.keys.length] = {
				encoding: "hex",
				algo: "SHA256",
				salt: CryptoJS.enc.Hex.parse(salt),
				iterations: iterations,
				cipher: "AES",
				iv: CryptoJS.enc.Hex.parse(iv),
				master_key_data: masterKeyData
			};
			
			return true;
		},
		
		addPassword: function(algo, password, salt, iterations, cipher, iv)
		{
			if (!this.containerIsOpen && this.data != null)
			{
				throw new Error("Cannot add key. Data present but container is not open.");
			}
			return this.addKey(algo, CryptoJS.enc.Utf8.parse(password), salt, iterations, cipher, iv);
		},
		
		removeKeySlot: function(keySlotId)
		{
			if (!this.containerIsOpen)
			{
				throw new Error("Cannot remove key, container is not open.");
			}
			
			if (this.keySlotUsed == keySlotId)
			{
				throw new Error("Cannot remove active keyslot.");
			}
			
			if (!this.keys[keySlotId])
			{
				throw new Error("Selected keyslot is not set.");
			}
			
			var i;
			var count = 0;
			for (i=0; i<this.keys.length; i++)
			{
				if (this.keys[i] != null)
				{
					count++;
				}
			}
			if (count < 2)
			{
				throw new Error("Cannot delete the only key.");
			}
			
			this.keys[keySlotId] = null;
			
			return true;
		},
		
		create: function()
		{
//			if (this.data != null)
//			{
//				throw new Error("Container already holds data, you may want to reset() it first.");
//			}
			
			this.masterKey = {
				cipher: "AES",
				key: CryptoJS.lib.WordArray.random(256/8),
				iv: CryptoJS.lib.WordArray.random(128/8)
			};
			this.containerIsOpen = true;
			this.keys = [];
			this.setContainerData("");
		},
		
		load: function(keyslots, data)
		{
			this.keys = keyslots;
			this.data = data;
		},
		
		open: function(password)
		{
			var i;
			var key256Bits;
			var masterKeyAsString;
			var masterKeyAsJson;
			var masterKey;
			
			for (i=0; i<this.keys.length; i++)
			{
				try
				{
					var key256Bits = CryptoJS.PBKDF2(password, this.keys[i].salt, { keySize: 256/32, iterations: this.keys[i].iterations, hasher: CryptoJS.algo.SHA256 });
					try
					{
						masterKeyAsString = CryptoJS.AES.decrypt(this.keys[i].master_key_data, key256Bits, { iv: this.keys[i].iv, format: CryptoJS.format.Hex }).toString(CryptoJS.enc.Utf8);
						masterKeyAsJson = eval("(" + masterKeyAsString + ")");
						masterKey = { cipher: masterKeyAsJson.cipher, key: CryptoJS.enc.Hex.parse(masterKeyAsJson.key), iv: CryptoJS.enc.Hex.parse(masterKeyAsJson.iv) };
					}
					catch (e)
					{
						key256Bits = null;
						masterKeyAsString = null;
						masterKeyAsJson = null;
						masterKey = null;
						continue;
					}
					
					this._setMasterKey(masterKey);
					this.keySlotUsed = i;
					
					key256Bits = null;
					masterKeyAsString = null;
					masterKeyAsJson = null;
					masterKey = null;
					
					return true;
				}
				catch (e)
				{
					throw new Error("CryptoJS.TKE.open() failed with error: " + e);
				}
			}
			
			return false;
		},
		
		close: function()
		{
			this._clearMasterKey();
			this.keySlotUsed = null;
		},
		
		getContainerData: function()
		{
			var decryptedData;
			
			if (!this.containerIsOpen)
			{
				throw new Error("Container is not open.");
			}
			
			decryptedData = CryptoJS.AES.decrypt(this.data, this.masterKey.key, { iv: this.masterKey.iv, format: CryptoJS.format.Hex }).toString(CryptoJS.enc.Utf8);
			
			return decryptedData;
		},
		
		setContainerData: function(data)
		{
			if (!this.containerIsOpen)
			{
				throw new Error("Container is not open.");
			}
			
			this.data = CryptoJS.AES.encrypt(data, this.masterKey.key, { iv: this.masterKey.iv, format: CryptoJS.format.Hex }).toString();
			
			return true;
		},
		
		reset: function()
		{
			this.close();
			this.data = null;
		},
		
		getJson: function()
		{
			var i;
			var json = {
				version: 1,
				keys: [],
				encoding: "hex",
				data: (this.data ? this.data.toString() : null)
			};
			
			for (i=0; i<this.keys.length; i++)
			{
				if (this.keys[i] == null)
				{
					json.keys[i] = null;
				}
				else
				{
					/* convert all the internal types (for salt, iv) to hex encoded strings */
					json.keys[i] = {
						encoding: "hex",
						algo: "SHA256",
						salt: this.keys[i].salt.toString(CryptoJS.enc.Hex),
						iterations: this.keys[i].iterations,
						cipher: "AES",
						iv: this.keys[i].iv.toString(CryptoJS.enc.Hex),
						master_key_data: this.keys[i].master_key_data.toString()
					};
				}
			}
			
			return JSON.stringify(json);
		},
		
		setJson: function(jsonString)
		{
			var json;
			var i;
			
			if (typeof jsonString == "string")
			{
				json = eval("(" + jsonString + ")");
				// this may throw an error, we do not want to interfere
			}
			else
			{
				json = jsonString;
			}
			if (json.version != 1)
			{
				throw new Error("Unknown version.");
			}
			this.data = CryptoJS.enc.Hex.parse(json.data).toString();
			this.encoding = json.encoding;
			this.keys = [];
			for (i=0; i<json.keys.length; i++)
			{
				if (json.keys[i] == null)
				{
					this.keys[i] = null;
				}
				else
				{
					this.keys[i] = {
						encoding: "hex",
						algo: "SHA256",
						salt: CryptoJS.enc.Hex.parse(json.keys[i].salt),
						iterations: json.keys[i].iterations,
						cipher: "AES",
						iv: CryptoJS.enc.Hex.parse(json.keys[i].iv),
						master_key_data: json.keys[i].master_key_data
					};
				}
			}
			return true;
		}
	}
}());
