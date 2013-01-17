var _container;

function _friendly_json(s)
{
	/* this is not a complete nor optimal code formatting, I know */
	var i, j, indents, force_newline;
	var t = "";
	var indent_string = "  ";
	
	indents = 0;
	for (i=0; i<s.length; i++)
	{
		force_newline = false;
		if (s[i] == "{" || s[i] == "[")
		{
			indents++;
			force_newline = true;
		}
		else if (s[i] == "}" || s[i] == "]")
		{
			indents--;
			if (s[i+1] != ",")
			{
				force_newline = true;
			}
		}
		else if (s[i] == ",")
		{
			force_newline = true;
		}
		
		if (s[i] != "\n")
		{
			t += s[i];
		}
		
		if (s[i] == "\n" || force_newline)
		{
			t += "\n";
			for (j=0; j<indents; j++)
			{
				t += indent_string;
			}
		}
		
	}
	
	return t;
}

function _update_container_data()
{
	if (_container === undefined || _container.data === undefined)
	{
		document.getElementById("container_current_status").value = "Container is empty.";
	}
	else if (_container.containerIsOpen)
	{
		document.getElementById("container_current_status").value = "Container is open, " + (_container.keys.length == 0 ? "no keys, " : _container.keys.length + " key(s), ") + (_container.keySlotUsed !== null ? "keyslot #" + _container.keySlotUsed + " is in use." : "unknown keyslot is in use.");
	}
	else
	{
		document.getElementById("container_current_status").value = "Container is not open.";
	}
	document.getElementById("master_key_key").value = _container.masterKey.key ? _container.masterKey.key : "n/a";
	document.getElementById("master_key_iv").value = _container.masterKey.iv ? _container.masterKey.iv : "n/a";
	
	document.getElementById("container_current_data").value = _friendly_json(_container.getJson());
	try
	{
		document.getElementById("current_data_data").value = _container.getContainerData();
	}
	catch (e)
	{
		document.getElementById("current_data_data").value = "n/a";
	}
}

function container_generate()
{
	try
	{
		_container = CryptoJS.TKE;
		_container.create();
		_update_container_data();
	}
	catch (e)
	{
		alert(e);
	}
}

function container_load()
{
	try
	{
		_container = CryptoJS.TKE;
		_container.setJson(document.getElementById("container_load_data").value);
		_update_container_data();
	}
	catch (e)
	{
		alert(e);
	}
}

function container_open()
{
	try
	{
		if (_container.open(document.getElementById("container_open_password").value))
		{
			_update_container_data();
			current_data_discard();
		}
	}
	catch (e)
	{
		alert(e);
	}
}

function container_close()
{
	try
	{
		_container.close();
		_update_container_data();
	}
	catch (e)
	{
		alert(e);
	}
}

function container_reset()
{
	try
	{
		_container.reset();
		_update_container_data();
	}
	catch (e)
	{
		alert(e);
	}
}


function user_key_randomize()
{
	try
	{
		document.getElementById("user_key_salt").value = CryptoJS.lib.WordArray.random(128/8);
		document.getElementById("user_key_iv").value = CryptoJS.lib.WordArray.random(128/8);
		document.getElementById("user_key_iterations").value = Math.floor(3000 + Math.random() * 2000);
	}
	catch (e)
	{
		alert("Could not set up salt, IV or iterations.\nThe error message was: " + e);
	}
}

function user_key_add()
{
	if (document.getElementById("user_key_password").value != document.getElementById("user_key_password").value)
	{
		alert("Passwords do not match.");
		return false;
	}
	
	if (document.getElementById("user_key_password").value == "")
	{
		alert("Password cannot be blank.");
		return false;
	}
	
	try {
		_container.addPassword(
			document.getElementById("user_key_algo").value,
			document.getElementById("user_key_password").value,
			document.getElementById("user_key_salt").value,
			document.getElementById("user_key_iterations").value,
			document.getElementById("user_key_cipher").value,
			document.getElementById("user_key_iv").value
		);
	}
	catch (e)
	{
		alert(e);
		return false;
	}
	
	document.getElementById("user_key_password").value = "";
	document.getElementById("user_key_password2").value = "";
	_update_container_data();
	return true;
}

function user_key_remove()
{
	try {
		_container.removeKeySlot(document.getElementById("user_key_remove_id").value);
		_update_container_data();
	}
	catch (e)
	{
		alert(e);
	}
}

function current_data_save()
{
	try {
		_container.setContainerData(document.getElementById("current_data_data").value);
		_update_container_data();
	}
	catch (e)
	{
		alert(e);
	}
}

function current_data_discard()
{
	try {
		_update_container_data();
	}
	catch (e)
	{
		alert(e);
	}
}
