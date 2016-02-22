console.warn('Je načtena JS knihovna kompatibility s CMS 2');

/**
* Deprecated API
*/

function pgRedirect(params, url)
{
	console.warn('pgRedirect je zastaralá funkce, náhradou je vizus.page.redirect');
	vizus.page.redirect(vizus.url.replace(url, {query: params}));
}

function urlChange(url, params)
{
	console.warn('urlChange je zastaralá funkce, náhradou je vizus.url.replace, vizus.url.make nebo vizus.url.build');
	return vizus.url.replace(url, {query: params});
}

function win(url, width, height, resizable, scroll)
{
	console.warn('win je zastaralá funkce, náhradou je vizus.window.open');
	vizus.window.open(url, width, height, {resizable: resizable ? true : false, scrollbars: scroll ? true: false});
}

function getWin(url, width, height, resizable, scroll)
{
	console.warn('getWin je zastaralá funkce, náhradou je vizus.window.create');
	return vizus.window.create(url, width, height, {resizable: resizable ? true : false, scrollbars: scroll ? true: false});
}

function show(url, width, height)
{
	console.warn('show je zastaralá funkce, náhradou je vizus.dialog.show');
	vizus.dialog.show(url, width, height);
}

function preview(url, width, height)
{
	console.warn('preview je zastaralá funkce, náhradou je vizus.window.open');
	vizus.window.open(url, width, height);
}

function dialog(url, width, height, resizable, scroll, modeless)
{
	console.warn('dialog je zastaralá funkce, náhradou je vizus.cms.dialog.open');
	vizus.cms.dialog.open(url, width, height);
}

var pgOnloaderStack = [];

vizus.page.ready(function()
{
	for (var i = 0; i < pgOnloaderStack.length; i++)
	{
		console.warn('pgOnloaderStack je zastaralá konstrukce, náhradou je vizus.page.ready nebo vizus.input.focus');
		pgOnloaderStack[i]();
	}
});

var pgUnloaderStack = [];

$(window).unload(function()
{
	for (var i = 0; i < pgUnloaderStack.length; i++)
	{
		console.warn('pgUnloaderStack je zastaralá konstrukce, nahradou je $(window).unload()');
		pgUnloaderStack[i]();
	}
});

function focusFirstElement()
{
	console.warn('focusFirstElement je zastaralá funkce, náhradou je vizus.input.focus');
	vizus.input.focus();
}

function randomBetween(from, to)
{
	console.warn('randomBetween je zastaralá funkce, náhradou je vizus.number.random');
	return vizus.number.random(from, to);
}

function generatePassword(easy)
{
	console.warn('generatePassword je zastaralá funkce, náhradou je vizus.text.password');
	return vizus.text.password(easy ? 1 : 2);
}

function tabSwitch(tab, name, id)
{
	console.warn('tabSwitch je zastaralá funkce, náhradou je vizus.cms.form.tabs.select');
	vizus.cms.form.tabs.select(name, id);
}

function tabSwitch2(name, id)
{
	console.warn('tabSwitch2 je zastaralá funkce, náhradou je vizus.cms.form.tabs.select');
	vizus.cms.form.tabs.select(name, id);
}

function makeIdent(elm, label, add)
{
	console.warn('makeIdent je zastaralá funkce, náhradou je vizus.input.ident.prepare');
	vizus.input.ident.prepare(elm, label);
}

function toAscii(str)
{
	console.warn('toAscii je zastaralá funkce, náhradou je vizus.text.ascii');
	return vizus.text.ascii(str);
}

function repairUrl(obj, protocol)
{
	console.warn('repairUrl je zastaralá funkce, náhradou je vizus.url.fix nebo vizus.input.url.fix');
	vizus.input.url.fix(obj, protocol);
}

function changeStencil(sel)
{
	console.warn('changeStencil je zastaralá funkce, náhradou je vizus.cms.form.htmlStencil.change');
	vizus.cms.form.htmlStencil(sel.id);
}

function EscapeURI(str)
{
	console.warn('EscapeURI je zastaralá funkce, náhradou je nativní encodeURI');
	return encodeURI(str);
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

function CmsGetKeyCode(e)
{
	console.warn('CmsGetKeyCode je zastaralá funkce, náhradou je vizus.event.keyCode');
	return vizus.event.keyCode(e);
}

function CmsStopEvent(e)
{
	console.warn('CmsStopEvent je zastaralá funkce, náhradou je vizus.event.stop');
	vizus.event.stop(e);
}

function inpDisable(obj)
{
	console.warn('inpDisable je zastaralá funkce, náhrada není');
	obj.disabled = true;
}

function inpEnable(obj)
{
	console.warn('inpEnable je zastaralá funkce, náhrada není');
	obj.disabled = false;
}

function zeroPad(str, num)
{
	console.warn('inpEnable je zastaralá funkce, náhradou je vizus.text.pad');
	return vizus.text.pad(str, num, 0);
}

function AntiSpamDecodeEmail(email, label)
{
	console.warn('AntiSpamDecodeEmail je zastaralá funkce, náhradou je vizus.page.writeEmailLink');
	vizus.page.writeEmailLink(email, label);
}

function CmsAllowDigitValue(e)
{
	console.warn('CmsAllowDigitValue je zastaralá funkce, náhradou je vizus.event.onlyKeyChars');
	vizus.event.onlyKeyChars(e, '0123456789');
}

function hideChildren(parent, disable, unset)
{
	console.warn('hideChildren je zastaralá funkce, náhradou je vizus.dom.hide');
	vizus.dom.hide(parent, disable, unset, true);
}

function showChildren(parent, enable)
{
	console.warn('showChildren je zastaralá funkce, náhradou je vizus.dom.show');
	vizus.dom.show(parent, enable, true, true);
}

/**
* Removed API
*/

function inpEmpty()
{
	console.error('inpEmpty je odstraněná funkce');
}

function inpCut()
{
	console.error('inpCut je odstraněná funkce');
}

function inpPaste()
{
	console.error('inpPaste je odstraněná funkce');
}

function inpAutocomplete()
{
	console.error('inpAutocomplete je odstraněná funkce');
}

function switchDisplay()
{
	console.error('switchDisplay je odstraněná funkce');
}

function switchDisplayRow()
{
	console.error('switchDisplayRow je odstraněná funkce');
}

function htmlSyntax()
{
	console.error('htmlSyntax je odstraněná funkce');
}

function htmlSpecialChars()
{
	console.error('htmlSpecialChars je odstraněná funkce');
}

function CD_INPUT()
{
	console.error('CD_INPUT je odstraněná funkce');
}

function CD_TEXT()
{
	console.error('CD_TEXT je odstraněná funkce');
}

function CD_JS()
{
	console.error('CD_JS je odstraněná funkce');
}

function boxDynamicCode()
{
	console.error('boxDynamicCode je odstraněná funkce');
}

function unboxDynamicCode()
{
	console.error('unboxDynamicCode je odstraněná funkce');
}

function tabCopyLang()
{
	console.error('tabCopyLang je odstraněná funkce');
}
