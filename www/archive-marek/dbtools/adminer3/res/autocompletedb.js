var acdb =
{
	i: document.getElementById('autocompletedb'),
	ss: document.getElementsByName('db')
};

if (acdb.i)
{
	acdb.i.autocomplete = 'off';
	acdb.i.onfocus = function()
	{
		acdb.i.style.color = 'black';
		acdb.i.value = '';
	};

	acdb.i.onblur = function()
	{
		acdb.i.style.color = 'grey';
		acdb.i.value = 'hledat databázi a enter';
	};

	acdb.i.style.color = 'gray';
	acdb.i.value = 'hledat databázi a enter';
}

if (acdb.ss.length == 1)
{
	acdb.s = acdb.ss.item(0);
	acdb.d = [];
	acdb.l = acdb.s.options.length;

	for (var i = 0; i < acdb.l; i++)
		acdb.d.push(acdb.s.options[i].value);

	acdb.c =
	{
		source: acdb.d,
		select: function(event, ui)
		{
			if (ui.item.value == '')
				return;

			for (var i = 0; i < acdb.l; i++)
			{
				if  (acdb.s.options[i].value == ui.item.value)
				{
					acdb.s.selectedIndex = i;
					acdb.s.form.submit();
					break;
				}
			}
		}
	};

	$('#autocompletedb').autocomplete(acdb.c);
}
