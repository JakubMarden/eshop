// (c) 2006 VIZUS.CZ s.r.o.
// updated: 9.1.2009 19:09:53

function CmsFormSelectKeyDown(event, prefix)
{
	var eventObject = event || window.event;
	var keyCode = vizus.event.keyCode(eventObject);
	
	window['formSelect'+prefix+'ControlMode'] = true;
	var objId = document.getElementById(prefix);
	var objNew = document.getElementById(prefix+'New');
	var objFound = document.getElementById(prefix+'Found');
	var objSearch = document.getElementById(prefix+'Search');

	switch (keyCode)
	{
		case 13: // enter
		{
			if (window['formSelect'+prefix+'Found'])
			{
				window['formSelect'+prefix+'Selected'] = window['formSelect'+prefix+'Found'];
				objId.value = window['formSelect'+prefix+'Found'].id;
				objFound.value = window['formSelect'+prefix+'Found'].name;
				objFound.style.fontWeight = 'bold';
				objFound.style.color = '#000000';

				if (window['formSelect'+prefix+'HideSearchInputOnSelect'])
				{
					objSearch.style.display = 'none';
					objFound.style.width = window['formSelect'+prefix+'FoundInputWidthWide'];
				}

				if (window['formSelect'+prefix+'Callback'])
				{
					var fn = window[ window['formSelect'+prefix+'Callback'] ];
					fn(prefix, "select", window['formSelect'+prefix+'Found'].id, window['formSelect'+prefix+'Found'].name);
				}
			}
			else if (window['formSelect'+prefix+'NewIsEnabled'])
			{
				window['formSelect'+prefix+'Selected'] = null;
				window['formSelect'+prefix+'Created'] = objSearch.value;
				objId.value = '';
				objNew.value = objSearch.value;
				objFound.value = objSearch.value;;
				objFound.style.fontWeight = 'bold';
				objFound.style.color = '#0000FF';

				if (window['formSelect'+prefix+'HideSearchInputOnSelect'])
				{
					objSearch.style.display = 'none';
					objFound.style.width = window['formSelect'+prefix+'FoundInputWidthWide'];
				}

				if (window['formSelect'+prefix+'Callback'])
				{
					var fn = window[ window['formSelect'+prefix+'Callback'] ];
					fn(prefix, "new", null, objSearch.value);
				}
			}
			vizus.event.stop(eventObject);
			break;
		}
		case 27: // esc
		{
			if (window['formSelect'+prefix+'Selected'])
			{
				window['formSelect'+prefix+'Found'] = window['formSelect'+prefix+'Selected'];
				objId.value = window['formSelect'+prefix+'Found'].id;
				objFound.value = window['formSelect'+prefix+'Found'].name;
				objFound.style.fontWeight = 'bold';
			}
			else
			{
				window['formSelect'+prefix+'Found'] = null;
				objId.value = '';
				objFound.value = '';
				objFound.style.fontWeight = 'normal';
			}
			objSearch.value = '';
			vizus.event.stop(eventObject);
			break;
		}
		case 38: // up
		{
			if (window['formSelect'+prefix+'Result'].length > 1 && window['formSelect'+prefix+'ResultIndex'] > 0)
				CmsFormSelectMove(eventObject, prefix, -1);

			break;
		}
		case 40: // down
		{
			if (window['formSelect'+prefix+'Result'].length > 1 && window['formSelect'+prefix+'ResultIndex'] < window['formSelect'+prefix+'Result'].length - 1)
				CmsFormSelectMove(eventObject, prefix, +1);

			break;
		}
		default:
		{
			window['formSelect'+prefix+'ControlMode'] = false;
			break;
		}
	}
}

function CmsFormSelectKeyUp(prefix, elm)
{
	if (window['formSelect'+prefix+'ControlMode'])
		return;

	window['formSelect'+prefix+'Found'] = null;
	window['formSelect'+prefix+'Result'] = new Array();
	window['formSelect'+prefix+'ResultIndex'] = 0;

	if (elm.value == '')
		return;

	var objFound = document.getElementById(prefix+'Found');
	objFound.style.color = '#000';
	objFound.style.fontWeight = 'normal';

	var mask = elm.value.toString().toLowerCase();
	mask = mask.replace(/([\.\+\^\$\[\]\{\}\(\)\\\|\/])/g, '\\$1').replace(/:/g, '__COLON__').replace(/;/g, '__SEMICOLON__').replace(/\*/g, '[^;]*?').replace(/\?/g, '[^;]');

	var re = new RegExp(';\\d+:'+mask+'[^;]*', 'ig');
	var result = window['formSelect'+prefix+'List'].match(re);

	if (result != null)
	{
		for (var i = 0; i < result.length; i++)
		{
			result[i].match(/^;(\d+):(.+)$/);
			var id = RegExp.$1;
			var name = RegExp.$2.replace(/__COLON__/g, ':').replace(/__SEMICOLON__/g, ';');
			window['formSelect'+prefix+'Result'][i] = {id:id, name:name};
		}

		window['formSelect'+prefix+'Found'] = window['formSelect'+prefix+'Result'][0];
		objFound.value = window['formSelect'+prefix+'Found'].name+' ('+window['formSelect'+prefix+'Result'].length+')';
	}
	else
		objFound.value = '';
}

function CmsFormSelectBlur(prefix)
{
	var objId = document.getElementById(prefix);
	var objNew = document.getElementById(prefix+'New');
	var objFound = document.getElementById(prefix+'Found');
	var objSearch = document.getElementById(prefix+'Search');

	objSearch.value = '';

	if (window['formSelect'+prefix+'Selected'])
	{
		objId.value = window['formSelect'+prefix+'Selected'].id;
		objFound.value = window['formSelect'+prefix+'Selected'].name;
		objFound.style.fontWeight = 'bold';
	}
	else if (!window['formSelect'+prefix+'Created'])
	{
		if (window['formSelect'+prefix+'NewIsEnabled'])
			objNew.value = '';

		objFound.style.color = '';
		objFound.style.fontWeight = 'normal';
		objFound.value = window['formSelect'+prefix+'Help'];
	}
}

function CmsFormSelectMove(eventObject, prefix, dir)
{
	window['formSelect'+prefix+'ResultIndex'] += dir;
	window['formSelect'+prefix+'Found'] = window['formSelect'+prefix+'Result'][ window['formSelect'+prefix+'ResultIndex'] ];

	var obj = document.getElementById(prefix+'Found');
	obj.value = window['formSelect'+prefix+'Found'].name+' ('+window['formSelect'+prefix+'Result'].length+')';
	obj.style.fontWeight = 'normal';
	
	vizus.event.stop(eventObject);
}

function CmsFormSelectRemove(prefix)
{
	var objId = document.getElementById(prefix);
	var objNew = document.getElementById(prefix+'New');
	var objFound = document.getElementById(prefix+'Found');
	var objSearch = document.getElementById(prefix+'Search');

	window['formSelect'+prefix+'Found'] = null;
	window['formSelect'+prefix+'Selected'] = null;
	window['formSelect'+prefix+'Created'] = null;

	objId.value = '';
	objFound.style.color = '';
	objFound.style.fontWeight = 'normal';
	objFound.style.width = window['formSelect'+prefix+'FoundInputWidthNormal'];
	objFound.value = window['formSelect'+prefix+'Help'];

	objSearch.style.display = '';

	if (window['formSelect'+prefix+'NewIsEnabled'])
		objNew.value = '';

	if (window['formSelect'+prefix+'Callback'])
	{
		var fn = window[ window['formSelect'+prefix+'Callback'] ];
		fn(prefix, "remove", null, null);
	}

	objSearch.select();
	objSearch.focus();
}

function CmsFormSelectAdd(prefix, id, name)
{
	id = id.toString().replace(/:/g, '__COLON__').replace(/;/g, '__SEMICOLON__').replace(/([\u0000-\u001F'"\\])/g, '\\$1');
	name = name.toString().replace(/:/g, '__COLON__').replace(/;/g, '__SEMICOLON__').replace(/([\u0000-\u001F'"\\])/g, '\\$1');
	window['formSelect'+prefix+'List'] += id+':'+name+';';
}

function CmsFormSelectChoiceId(prefix, id)
{
	var objId = document.getElementById(prefix);
	var objFound = document.getElementById(prefix+'Found');
	var objSearch = document.getElementById(prefix+'Search');

	window['formSelect'+prefix+'Found'] = null;
	window['formSelect'+prefix+'Result'] = new Array();
	window['formSelect'+prefix+'ResultIndex'] = 0;

	var re = new RegExp(';'+id+':[^;]+');
	var result = window['formSelect'+prefix+'List'].match(re);

	if (result != null)
	{
		result[0].match(/^;(\d+):(.+)$/);
		var id = RegExp.$1;
		var name = RegExp.$2.replace(/__COLON__/g, ':').replace(/__SEMICOLON__/g, ';');
		window['formSelect'+prefix+'Result'][0] = {id:id, name:name};
		window['formSelect'+prefix+'Found'] = window['formSelect'+prefix+'Result'][0];

		if (window['formSelect'+prefix+'Found'])
		{
			window['formSelect'+prefix+'Selected'] = window['formSelect'+prefix+'Found'];
			objId.value = window['formSelect'+prefix+'Found'].id;
			objFound.value = window['formSelect'+prefix+'Found'].name;
			objFound.style.fontWeight = 'bold';
			objFound.style.color = '#000000';

			if (window['formSelect'+prefix+'HideSearchInputOnSelect'])
			{
				objSearch.style.display = 'none';
				objFound.style.width = window['formSelect'+prefix+'FoundInputWidthWide'];
			}

			if (window['formSelect'+prefix+'Callback'])
			{
				var fn = window[ window['formSelect'+prefix+'Callback'] ];
				fn(prefix, "select", window['formSelect'+prefix+'Found'].id, window['formSelect'+prefix+'Found'].name);
			}
		}
	}
	else
		objFound.value = '';
}
