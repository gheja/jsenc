var _container;

function _update_container_data()
{
	if (_container === undefined || _container.data === undefined)
	{
		document.getElementById("container_current_status").value = "Container is empty.";
	}
	else if (_container.containerIsOpen)
	{
		document.getElementById("container_current_status").value = "Container is open, " + (_container.keys.length == 0 ? "no keys defined" : _container.keys.length + " key(s) defined.");
	}
	else
	{
		document.getElementById("container_current_status").value = "Container is not open.";
	}
	document.getElementById("master_key_key").value = _container.masterKey.key ? _container.masterKey.key : "n/a";
	document.getElementById("master_key_iv").value = _container.masterKey.iv ? _container.masterKey.iv : "n/a";
	
	document.getElementById("container_current_data").value = _container.getJson();
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
	alert("current_data_discard()");
}
