console.warn('Je načtena JS knihovna kompatibility s VF 1.1');

/**
* Deprecated API
*/

function findObj(id)
{
	console.warn('findObj je zastaralá funkce, náhradou je nativní document.getElementById');
	return window.document.getElementById(id);
}

function win(url, width, height, resizable, scroll, target)
{
	console.warn('win je zastaralá funkce, náhradou je vizus.window.open');
	vizus.window.open(url, width, height, {target: target, resizable: resizable ? true : false, scrollbars: scroll ? true: false});
}

function show(url, width, height)
{
	console.warn('show je zastaralá funkce, náhradou je vizus.window.open nebo vizus.image.showbox');
	vizus.window.open(url, width, height);
}

function round(num, dec)
{
	console.warn('round je zastaralá funkce, náhradou je vizus.number.round');
	return vizus.number.round(num, dec);
}

function numFormat(num, dec, decPnt, thsSep)
{
	console.warn('numFormat je zastaralá funkce, náhradou je vizus.number.format');
	return vizus.number.format(num, dec, decPnt, thsSep);
}

function inpNumVal(obj, dec, neg)
{
	console.warn('inpNumVal je zastaralá funkce, náhradou je vizus.input.number.validate');
	vizus.input.number.validate(obj, dec, neg);
}

function inpNumFmt(obj, dec, neg)
{
	console.warn('inpNumFmt je zastaralá funkce, náhradou je vizus.input.number.finish');
	vizus.input.number.finish(obj, dec, neg);
}

function isNumVal(num, dec, neg)
{
	console.warn('isNumVal je zastaralá funkce, náhradou je vizus.number.isValid');
	return vizus.number.isValid(num, dec, neg);
}

function getNumInt(val, defaultVal)
{
	console.warn('getNumInt je zastaralá funkce, náhradou je vizus.number.parseInt');
	return vizus.number.parseInt(val, defaultVal);
}
		
function getNumFloat(val, defaultVal)
{
	console.warn('getNumFloat je zastaralá funkce, náhradou je vizus.number.parseFloat');
	return vizus.number.parseFloat(val, defaultVal);
}

function repairUrl(obj, protocol)
{
	console.warn('repairUrl je zastaralá funkce, náhradou je vizus.url.fix nebo vizus.input.url.fix');
	vizus.input.url.fix(obj, protocol);
}

/**
* Removed API
*/

function getInnerText()
{
	console.error('getInnerText je odstraněná funkce, náhradou jQuery');
}

function setInnerText()
{
	console.error('getInnerText je odstraněná funkce, náhradou jQuery');
}

function writeObject()
{
	console.error('writeObject je odstraněná funkce');
}

function AntiSpamDecodeUrl()
{
	console.error('AntiSpamDecodeUrl je odstraněná funkce');
}
