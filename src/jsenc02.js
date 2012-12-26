var _container;

function _update_container_data()
{
// 	document.getElementById("master_key_cipher").value = _container.masterKey.cipher;
	document.getElementById("master_key_key").value = _container.masterKey.key;
	document.getElementById("master_key_iv").value = _container.masterKey.iv;
	
//	document.getElementById("container_current_data").value = JSON.stringify(_container);
/*
	var i;
	var s = "{\n";
	s += "\tkeys: [\n";
	if (_container.keys.length == 0)
	{
		s += "\t\t// no keys defined yet,\n";
		s += "\t\t// this is an invalid state.\n";
	}
	else
	{
		for (i=0; i<_container.keys.length; i++)
		{
			if (_container.keys[i] == null)
			{
				s += "\t\t" + i + ": {},\n";
			}
			else
			{
				s += "\t\t" + i + ": { \n";
				s += "\t\t\t\"encoding\": " + _container.keys[i].encoding + ",\n";
				s += "\t\t\t\"algo\": " + _container.keys[i].algo + ",\n";
				s += "\t\t\t\"salt\": " + _container.keys[i].salt + ",\n";
				s += "\t\t\t\"iterations\": " + _container.keys[i].iterations + ",\n";
				s += "\t\t\t\"cipher\": " + _container.keys[i].cipher + ",\n";
				s += "\t\t\t\"iv\": " + _container.keys[i].iv + ",\n";
				s += "\t\t\t\"master_key_data\": " + _container.keys[i].master_key_data + "\n";
				s += "\t\t},\n";
			}
		}
		s = s.substring(0, s.length - 2) + "\n";
	}
	s += "\t],\n";
	s += "\t\"encoding\": \"hex\",\n";
	s += "\t\"data\": \"" + _container.data + "\"\n";
	s += "}\n";
	document.getElementById("container_current_data").value = s;
*/
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

function container_open()
{
	alert("container_open()");
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
