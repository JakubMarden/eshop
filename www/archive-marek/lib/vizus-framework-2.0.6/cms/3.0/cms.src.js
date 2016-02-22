/**
* Vizus CMS Javascript Library
* (c) 2014 VIZUS.CZ s.r.o.
*/

if (!vizus)
	throw new Error('Chybí system.js');

if (!jQuery)
	throw new Error('Chybí jquery.js');

// credits http://stackoverflow.com/questions/561844/how-to-move-div-with-the-mouse-using-jquery
jQuery.fn.draggable = function(selector)
{
	var elm = $(selector);
	
	this.mousedown(function(e)
	{
		var offset = elm.offset();
		
		var overlay = $(window.document.createElement('div'));
		overlay.css({position: 'fixed', zIndex: elm.css('zIndex') + 1});
		overlay.offset(offset);
		overlay.width(elm.outerWidth()).height(elm.outerHeight());
		overlay.appendTo(elm);
		
		var rx = e.pageX - offset.left;
		var ry = e.pageY - offset.top;
		
		$(window).bind('mousemove.draggable', function(e)
		{
			var position = {left: e.pageX - rx, top: e.pageY - ry};
			elm.offset(position);
			overlay.offset(position);
		});

		$(window).bind('mouseup.draggable', function(e)
		{
			$(window).unbind('mousemove.draggable');
			$(window).unbind('mouseup.draggable');
			overlay.remove();
		});
		
		vizus.event.stop(e.originalEvent);
	});
	
	return this;
};

jQuery.fn.outerHTML = function()
{
	return $(this).clone().wrap('<div>').parent().html();
};

/**
* Vizus CMS
* @namespace
* =============================================================================
*/

if (!vizus.cms)
	vizus.cms = {};

// stav
vizus.cms.status =
{
	zIndex: 60000,
	messageBoxInstances: [],
	overlayInstances: [],
	dialogInstances: []
};

// zmena jazyka obsahu
vizus.cms.changeLanguage = function(id, name, alternativeUrl)
{
	var url = '';
	var params = {};
	params[name] = id;
	var module = document.getElementById('Module').contentWindow;
	var moduleUrl = module.document.location.toString();
	var moduleUrlOK = true;
	var pairs = moduleUrl.substr(moduleUrl.indexOf('?') + 1).split('&');

	for (var i = 0; i < pairs.length; i++)
	{
		var nv = pairs[i].split('=');

		if (nv[0] == 'type' || nv[0] == 'cmsSID' || nv[0] == 'cmd' || nv[0] == name)
			continue;

		moduleUrlOK = false;
		break;
	}

	if (moduleUrlOK)
		url = moduleUrl;
	else
		url = alternativeUrl;

	module.document.location = vizus.url.replace(url, {query: params});
	window.focus();
};

// trida message boxu
vizus.cms.MessageBox = function(message, buttons, opener, context)
{
	this.message = message || 'Message';
	this.buttons = buttons || [{name: vizus.i18n.text('OK')}];
	this.opener = opener || window;
	this.context = context || top;

	this.stack = top.vizus.cms.status.messageBoxInstances;
	this.stack.push(this);
	this.index = this.stack.length - 1;
	this.overlay = new vizus.cms.page.Overlay('light', this.context);
	
	this.x = null;
	this.y = null;
	this.id = 'MessageBox' + this.index;
	this.box = top.$('#MessageBox').clone();
	this.box.attr('id', this.id);
	this.box.css({zIndex: this.context.vizus.cms.status.zIndex++, display: 'table'})
	this.box.find('pre.message').text(this.message);
	this.active = null;
	
	var makeOnclick = function(onclick)
	{
		return function(event)
		{
			this.close();

			if (typeof onclick == 'function')
				onclick();
		};
	};
	
	var buttons = this.box.find('div.buttons');
	
	for (var i = 0; i < this.buttons.length; i++)
	{
		var data = this.buttons[i];
		var name = typeof data.name == 'string' ? data.name : 'Button';
		var button = this.context.document.createElement('button');
		button.className = typeof data['class'] == 'string' ? data['class'] : '';
		button.onclick = makeOnclick(data.onclick).bind(this);
		
		if (name.indexOf('&') != -1)
		{
			this.buttons[i].key = name.match(/&(\w)/)[1];
			$(button).html(name.replace(/&(\w)/, '<u>$1</u>'));
		}
		else
			$(button).text(name);

		buttons.append(button);
	}
		
	this.box.appendTo(this.context.document.body);
	this.width = this.box.width();
	this.height = this.box.height();
	this.viewport = {width: this.context.innerWidth, height: this.context.innerHeight};
	this.margin = {width: this.box.outerWidth(true) - this.box.width(), height: this.box.outerHeight(true) - this.box.height()};
	
	this.centre();
	this.box.css({visibility: 'visible'});

	var onresize = function(event)
	{
		this.viewport = {width: this.context.innerWidth, height: this.context.innerHeight};
		this.centre();
	};
	
	var onkeydown = function(event)
	{
		if (vizus.event.keyCode(event.originalEvent) == vizus.event.keys.keyEsc)
			this.close();
		
		var chr = vizus.event.keyChar(event.originalEvent);
		
		if (typeof chr == 'string' && chr.length == 1)
		{
			for (var i = 0; i < this.buttons.length; i++)
			{
				if (this.buttons[i].key == chr)
				{
					this.close();
		
					if (typeof this.buttons[i].onclick == 'function')
						this.buttons[i].onclick();
					
					break;
				}
			}
		}
	};
	
	var focus = function()
	{
		this.active = this.opener.document.activeElement;
		this.box.find('button:first').focus();
	}
	
	$(this.context).on('resize.vizus.cms.' + this.id, onresize.bind(this));
	$(this.context.document).on('keydown.vizus.cms.' + this.id, onkeydown.bind(this));
	this.context.setTimeout(focus.bind(this), 10);
};

// vycentrovani boxu na stred okna
vizus.cms.MessageBox.prototype.centre = function()
{
	this.x = Math.round(this.context.innerWidth / 2 - (this.width + this.margin.width) / 2);
	this.y = Math.round(this.context.innerHeight / 2 - (this.height + this.margin.height) / 2);

	this.box.css({left: this.x + 'px', top: this.y + 'px'});
	return this;
};

// zavreni  boxu
vizus.cms.MessageBox.prototype.close = function()
{
	this.remove();
};

// zruseni  boxu
vizus.cms.MessageBox.prototype.remove = function()
{
	$(this.context).off('resize.vizus.cms.' + this.id);
	$(this.context.document).off('keydown.vizus.cms.' + this.id);
	
	this.stack.splice(this.index, 1);
	this.box.remove();
	this.overlay.remove();
	this.context.vizus.cms.status.zIndex--;
	
	if (this.active)
		this.active.focus();
};

// upozorneni
vizus.cms.alert = function(message, onclick)
{
	var buttons = [{name: vizus.i18n.text('OK'), onclick: onclick}];
	var msgbox = new vizus.cms.MessageBox(message, buttons, window, top);
};

// potvrzeni
vizus.cms.confirm = function(message, onconfirm, oncancel)
{
	var buttons = [{name: vizus.i18n.text('&Ano'), onclick: onconfirm}, {name: vizus.i18n.text('&Ne'), 'class': 'second', onclick: oncancel}];
	var msgbox = new vizus.cms.MessageBox(message, buttons, window, top);
	return false;
};

// potvrzeni kliknuti
vizus.cms.confirmClick = function(event, message, before, after)
{
	vizus.event.stop(event);
	
	var onclick = function()
	{
		if (typeof before == 'function')
			before();
		
		switch (vizus.getClass(event.target))
		{
			case 'HTMLAnchorElement':
			{
				(event.target.target == '_top' ? top : window).document.location = event.target.href;
				break;
			}
			case 'HTMLInputElement':
			{
				switch (event.target.type)
				{
					case 'checkbox':
					{
						event.target.checked = !event.target.checked;
						break;
					}
					case 'submit':
					{
						if (typeof event.target.form.onsubmit != 'function' || event.target.form.onsubmit())
						{
							event.target.type = 'hidden';
							event.target.form.submit();
						}
						
						break;
					}
				}
				
				break;
			}
		}
		
		if (typeof after == 'function')
			after();
	};
	
	var buttons = [{name: vizus.i18n.text('&Ano'), onclick: onclick}, {name: vizus.i18n.text('&Ne'), 'class': 'second'}];
	var msgbox = new vizus.cms.MessageBox(message, buttons, window, top);
	return false;
};

/**
* Stránky
* @namespace
* =============================================================================
*/

if (!vizus.cms.page)
	vizus.cms.page = {};

// inicializace cms stranek dle body.className
vizus.cms.page.init = function(bodyClass, options)
{
	var names = bodyClass.split(/\s+/);
	
	for (var n = 0; n < names.length; n++)
	{
		switch (names[n])
		{
			// prihlasovaci stranka cms
			case 'login':
			{
				// zavreni popup okna
				try
				{
					if (window.opener)
					{
						window.opener.top.location = window.location;
						window.close();
					}
					else if (window.top.location != window.document.location)
						window.top.location = window.location;
				}
				catch (e) {}
	
				$(document).ready(function()
				{
					$('#Form').css('visibility', 'visible');
					$('#Login').get(0).focus();
				});
	
				break;
			}
			// hlavni stranka cms
			case 'main':
			{
				$(document).ready(function()
				{
					$('ul.menu').find('li.closed > ul').css('display', 'none');
	
					$('ul.menu').find('a[target="module"]').on('click', function()
					{
						$('ul.menu a.active').removeClass('active');
						$(this).addClass('active');
					});
	
					$('ul.menu a').not('[class*="icon"]').addClass('icon-module');
	
					$('ul.menu').find('span.node').on('click', function()
					{
						var li = $(this).parent();
	
						if (li.hasClass('opened'))
							li.removeClass('opened').addClass('closed').find('ul').eq(0).slideUp(200);
						else
							li.removeClass('closed').addClass('opened').find('ul').eq(0).slideDown(200);
					});
					
					var left = $('#Left');
					var splitter = $('#Splitter');
					var right = $('#Right');
					var splitterWidth = splitter.width();

					splitter.css('left', left.width() - splitterWidth);
					splitter.mousedown(function(event)
					{
						var overlay = new vizus.cms.page.Overlay('transparent');
						
						splitter.addClass('active');
						
						$(document).bind('mousemove.splitter', function(event)
						{
							if (event.pageX > 50 && event.pageX < 500)
							{
								left.css('width', event.pageX);
								splitter.css('left', event.pageX - splitterWidth);
								right.css('left', event.pageX);
							}
						});
						
						$(window).bind('mouseup.splitter', function(event)
						{
							splitter.removeClass('active');
							overlay.remove();
							$(document).unbind('mousemove.splitter');
							$(this).unbind('mouseup.splitter');
							document.cookie = 'CmsUserSettings[cms.menuWidth]=' + parseInt(left.css('width'), 10);
						});
						
						return false;
					});

					$('#Module').on('load', function()
					{
						var url = this.contentWindow.document.location.toString();
						$('ul.menu a[target="module"]').each(function()
						{
							if (this.href == url && !$(this).hasClass('active'))
							{
								$('ul.menu a.active').removeClass('active');
								$(this).addClass('active');
							}
						});
					});
				});
				
				break;
			}
			// bezny modul cms
			case 'module':
			{
				$(document).ready(function()
				{
					$('body.module > div.content').each(function()
					{
						if (options && options.fullContent)
							$(this).addClass('full');
	
						if ($(this).hasClass('full'))
							$(this).find('div.cmd-line a.resize-left').parent().show();
						else
							$(this).find('div.cmd-line a.resize-right').parent().show();
					});
	
					vizus.cms.wcom.reorder();
				});
				
				break;
			}
			case 'dialog':
			{
				$(document).ready(function()
				{
					window.dialog = vizus.cms.dialog.resolve(window).init(window).title(document.title);
				});
				
				break;
			}
		}
	}
};

// zmena sirky obsahu modulu
vizus.cms.page.resizeContent = function()
{
	$('body.module > div.content').each(function()
	{
		if ($(this).hasClass('full'))
		{
			$(this).removeClass('full');
			$(this).find('div.cmd-line a.resize-left').parent().hide();
			$(this).find('div.cmd-line a.resize-right').parent().show();
		}
		else
		{
			$(this).addClass('full');
			$(this).find('div.cmd-line a.resize-left').parent().show();
			$(this).find('div.cmd-line a.resize-right').parent().hide();
		}
	});
};

// zobrazeni cekani
vizus.cms.page.wait = function(display, context)
{
	if (display == undefined)
		display = true;
	
	context = context || window;
	var div = context.document.getElementById('Wait');
	
	if (display && !div)
	{
		var overlay = new vizus.cms.page.Overlay('light', context);
		div = context.document.createElement('DIV');
		div.id = 'Wait';
		div.className = 'wait';
		div.waitOverlay = overlay;
		div.waitAngle = 0;
		div.waitTimer = context.setInterval(function()
		{
			div.waitAngle = div.waitAngle + 10 > 360 ? 0 : div.waitAngle + 10;
			var rotate = 'rotate(' + div.waitAngle + 'deg)';
			$(div).css({'-webkit-transform': rotate, 'transform': rotate});
		}, 27);
		
		context.document.body.appendChild(div);
	}
	else if (!display && div)
	{
		div.waitOverlay.remove();
		context.clearInterval(div.waitTimer);
		context.document.body.removeChild(div);
	}
};

// objekt prekryti
vizus.cms.page.Overlay = function(className, context)
{
	this.className = className || 'light';
	this.context = context || window;
	this.zIndex = this.context.vizus.cms.status.zIndex++;
	
	this.stack = this.context.vizus.cms.status.overlayInstances;
	this.stack.push(this);
	this.index = this.stack.length - 1;

	for (var i = 0; i < this.stack.length - 1; i++)
		this.stack[i].hide();

	this.div = this.context.document.createElement('DIV');
	this.div.id = 'Overlay' + this.index;
	this.div.className = 'overlay ' + this.className;
	this.div.style.zIndex = this.zIndex;
	this.context.document.body.appendChild(this.div);
	this.show();
};

// zobrazeni
vizus.cms.page.Overlay.prototype.show = function()
{
	if (this.div.style.display != 'block')
		this.div.style.display = 'block';
	
	return this;
};

// skryti
vizus.cms.page.Overlay.prototype.hide = function()
{
	if (this.div.style.display != 'none')
		this.div.style.display = 'none';
	
	return this;
};

// odstraneni
vizus.cms.page.Overlay.prototype.remove = function()
{
	this.context.document.body.removeChild(this.div);
	this.stack.splice(this.index, 1);
	this.context.vizus.cms.status.zIndex--;

	if (this.stack.length > 0)
		this.stack[this.stack.length - 1].show();
};

/**
* Komponenty
* @namespace
* =============================================================================
*/

if (!vizus.cms.wcom)
	vizus.cms.wcom = {};

// presunuti komponent na pozici
vizus.cms.wcom.reorder = function(initPadding)
{
	var content = $('body > div.content').first();
	var padding = initPadding || {top: parseInt(content.css('padding-top'), 10) || 0, bottom: parseInt(content.css('padding-bottom'), 10) || 0};
		
	var top = 0;
	content.find('div.cmd-line.top, ul.path.top').each(function()
	{
		$(this).css('top', top + 'px');
		top += $(this).outerHeight(false);
	});

	var bottom = 0;
	$(content.find('ul.list-pager.bottom, ul.list-select.bottom').get().reverse()).each(function()
	{
		$(this).css('bottom', bottom + 'px');
		bottom += $(this).outerHeight(false);
	});

	content.css({'padding-top': padding.top + top + 'px', 'padding-bottom': padding.bottom + bottom + 'px'});
	
	if (top + bottom > 0 && !initPadding)
		$(window).on('resize.vizus.cms.reorder', function(){ vizus.cms.wcom.reorder(padding); });
};

/**
* Komponenta seznamu
* @namespace
* =============================================================================
*/

if (!vizus.cms.wcom.list)
	vizus.cms.wcom.list = {};

// filtrovani listu
vizus.cms.wcom.list.filter = function(event, name)
{
	event = $.event.fix(event || window.event);
	var filter = {from: 0};
	
	switch (event.target.tagName)
	{
		case 'INPUT':
		{
			switch (event.target.type.toUpperCase())
			{
				case 'TEXT':
				{
					filter[name] = event.target.value;
					
					if (event.type == 'keydown' && event.which == 13)
						vizus.page.redirect({query: filter});
					else if (event.type == 'keydown' && event.which == 27)
					{
						event.target.value = '';
						event.target.focus();
					}
					break;
				}
				case 'CHECKBOX':
				{
					filter[name] = event.target.checked ? 1 : 0;
					vizus.page.redirect({query: filter});
					break;
				}
			}
			
			break;
		}
		case 'SELECT':
		{
			filter[name] = event.target.value ? event.target.value : null;
			vizus.page.redirect({query: filter});
			break;
		}
	}
};

// vyber polozky
vizus.cms.wcom.list.select = function(id, itemId, listSelectId)
{
	var selected = document.getElementById(id + 'Item' + itemId + 'Selected');
	selected.checked = !selected.checked;
	vizus.cms.wcom.list.onchange(id, itemId);
	
	if (listSelectId)
		vizus.cms.wcom.listSelect.update(listSelectId, selected.name);
};

// zmena polozky
vizus.cms.wcom.list.onchange = function(id, itemId)
{
	var select = document.getElementById(id + 'Item' + itemId + 'Select');
	var selected = document.getElementById(id + 'Item' + itemId + 'Selected');
	
	if (selected.checked)
		$(select).addClass('icon-checked').removeClass('icon-unchecked');
	else
		$(select).removeClass('icon-checked').addClass('icon-unchecked');
};

/**
* Komponenta seznamu dlazdic
* @namespace
* =============================================================================
*/

if (!vizus.cms.wcom.listTile)
	vizus.cms.wcom.listTile = {};

// vyber polozky
vizus.cms.wcom.listTile.select = function(id)
{
	var tile = vizus.dom.get(id);
	var selected = $(tile).find('input.selected').get(0);
	var selectId = $(tile).data('list-select-id');
	selected.checked = !selected.checked;
	vizus.cms.wcom.listTile.onchange(id);
		
	if (selectId)
		vizus.cms.wcom.listSelect.update(selectId, selected.name);
};

// zmena polozky
vizus.cms.wcom.listTile.onchange = function(id)
{
	var tile = vizus.dom.get(id);
	var select = $(tile).find('a.select').get(0);
	var selected = $(tile).find('input.selected').get(0);
	
	if (selected.checked)
	{
		$(select).addClass('icon-checked').removeClass('icon-unchecked');
		$(tile).addClass('selected');
		vizus.cms.dragdrop.disableDrop(tile);
	}
	else
	{
		$(select).removeClass('icon-checked').addClass('icon-unchecked');
		$(tile).removeClass('selected');
		vizus.cms.dragdrop.enableDrop(tile);
	}
};

/**
* Komponenta vyberu v seznamu
* @namespace
* =============================================================================
*/

if (!vizus.cms.wcom.listSelect)
	vizus.cms.wcom.listSelect = {};

/**
* Kontanty výběru
* @const
*/

vizus.cms.wcom.listSelect.NONE = false;
vizus.cms.wcom.listSelect.ALL = true;
vizus.cms.wcom.listSelect.INVERT = null;

// vyber vsech, zruseni vyberu, inverze vyberu
vizus.cms.wcom.listSelect.select = function(id, name, mode)
{
	var items = document.getElementsByName(name);
	
	for (var i = 0; i < items.length; i++)
	{
		items[i].checked = mode === null ? !items[i].checked : mode;
		
		if (typeof items[i].onchange == 'function')
			typeof items[i].onchange();
	}
	
	vizus.cms.wcom.listSelect.update(id, name);
};

// vyber vsech
vizus.cms.wcom.listSelect.all = function(id, name)
{
	vizus.cms.wcom.listSelect.select(id, name, vizus.cms.wcom.listSelect.ALL);
};

// zruseni vyberu
vizus.cms.wcom.listSelect.none = function(id, name)
{
	vizus.cms.wcom.listSelect.select(id, name, vizus.cms.wcom.listSelect.NONE);
};

// inverze vyberu
vizus.cms.wcom.listSelect.invert = function(id, name)
{
	vizus.cms.wcom.listSelect.select(id, name, vizus.cms.wcom.listSelect.INVERT);
};

// kontroluje, zdali je vybrana alespon jedna polozka
vizus.cms.wcom.listSelect.check = function(id, name)
{
	var operation = document.getElementById(id + 'Operation');
	var items = document.getElementsByName(name);
	
	if (operation && !operation.value)
		return false;

	for (var i = 0; i < items.length; i++)
	{
		if (items[i].checked)
			return true;
	}
	
	return false;
};

// aktualizuje pocitadlo
vizus.cms.wcom.listSelect.update = function(id, name)
{
	var counter = document.getElementById(id + 'Counter');
	
	if (!counter)
		return;
	
	var items = document.getElementsByName(name);
	var checked = 0;
	
	for (var i = 0; i < items.length; i++)
	{
		if (items[i].checked)
			checked++;
	}
	
	$(counter).text(checked);
};

/**
* Komponenta poradi
* @namespace
* =============================================================================
*/

if (!vizus.cms.wcom.order)
	vizus.cms.wcom.order = {};

// stisknuti klavey
vizus.cms.wcom.order.onkeydown = function(event, id)
{
	event = event || window.event;
	var keys = vizus.event.keys;
	
	switch (event.keyCode)
	{
		case keys.keyPageUp:
		{
			vizus.cms.wcom.order.jump(id, -10);
			break;
		}
		case keys.keyPageDown:
		{
			vizus.cms.wcom.order.jump(id, 10);
			break;
		}
		case keys.keyUp:
		{
			vizus.cms.wcom.order.up(id);
			break;
		}
		case keys.keyDown:
		{
			vizus.cms.wcom.order.down(id);
			break;
		}
		case keys.keyHome:
		{
			vizus.cms.wcom.order.first(id);
			break;
		}
		case keys.keyEnd:
		{
			vizus.cms.wcom.order.last(id);
			break;
		}
		default:
		{
			return;
		}
	}
	
	vizus.event.stop(event);
	return false;
};

// polozka jako prvni
vizus.cms.wcom.order.first = function(id)
{
	var order = vizus.dom.get(id + 'Order');
	
	if (order.selectedIndex > 0)
	{
		var option = vizus.dom.moveTo(order.options[order.selectedIndex], 0);
		vizus.cms.wcom.order.update(id, option);
	}
};

// skok nahoru/dolu
vizus.cms.wcom.order.jump = function(id, jump)
{
	var order = vizus.dom.get(id + 'Order');
	
	if (order.selectedIndex != -1)
	{
		var option = vizus.dom.moveBy(order.options[order.selectedIndex], jump);
		vizus.cms.wcom.order.update(id, option);
	}
};

// polozka nahoru
vizus.cms.wcom.order.up = function(id)
{
	var order = vizus.dom.get(id + 'Order');
	
	if (order.selectedIndex > 0)
	{
		var option = vizus.dom.moveBy(order.options[order.selectedIndex], -1);
		vizus.cms.wcom.order.update(id, option);
	}
};

// polozka dolu
vizus.cms.wcom.order.down = function(id)
{
	var order = vizus.dom.get(id + 'Order');
	
	if (order.selectedIndex != -1)
	{
		var option = vizus.dom.moveBy(order.options[order.selectedIndex], 1);
		vizus.cms.wcom.order.update(id, option);
	}
};

// polozka jako posledni
vizus.cms.wcom.order.last = function(id)
{
	var order = vizus.dom.get(id + 'Order');
	
	if (order.selectedIndex != -1)
	{
		var option = vizus.dom.moveTo(order.options[order.selectedIndex], -1);
		vizus.cms.wcom.order.update(id, option);
	}
};

// aktualizace
vizus.cms.wcom.order.update = function(id, option)
{
	var values = [];
	var order = vizus.dom.get(id + 'Order');
	var set = vizus.dom.get(id + 'Set');
	
	for (var i = 0; i < order.options.length; i++)
		values.push(order.options[i].value + '=' + i);
	
	set.value = values.join(',');

	// workaround - https://bugzilla.mozilla.org/show_bug.cgi?id=291082
	if (/firefox/i.test(window.navigator.userAgent) && option)
		window.setTimeout(function() { option.selected = true; }, 1);
};

/**
* Komponenta hromadne zmeny galerie
* @namespace
* =============================================================================
*/

if (!vizus.cms.wcom.galleryChange)
	vizus.cms.wcom.galleryChange = {};

// odstraneni polozky galerie
vizus.cms.wcom.galleryChange.remove = function(id, index)
{
	$('#' + id + 'Item' + index).addClass('removed');
	$('#' + id + 'Item' + index + 'Removed').val(1);
};

// obnoveni polozky galerie
vizus.cms.wcom.galleryChange.renew = function(id, index)
{
	$('#' + id + 'Item' + index).removeClass('removed');
	$('#' + id + 'Item' + index + 'Removed').val(0);
};

/**
* Formularove komponenty
* @namespace
* =============================================================================
*/

if (!vizus.cms.form)
	vizus.cms.form = {};

/**
* Komponenta GPS
* @namespace
* =============================================================================
*/

if (!vizus.cms.form.gps)
	vizus.cms.form.gps = {};

// vyber pozice
vizus.cms.form.gps.select = function(id, latitude, longitude)
{
	var latd = Math.floor(latitude);
	var latm = Math.floor(60 * (latitude - latd));
	var lats = Math.floor(3600 * (latitude - latd - latm / 60));
	var lat10 = latitude + '°';
	var lat60 = latd + '° ' + latm + '′ ' + lats + '″';
	var lngd = Math.floor(longitude);
	var lngm = Math.floor(60 * (longitude - lngd));
	var lngs = Math.floor(3600 * (longitude - lngd - lngm / 60));
	var lng10 = longitude + '°';
	var lng60 = lngd + '° ' + lngm + '′ ' + lngs + '″';

	$('#' + id).val(latitude + ',' + longitude);
	$('#' + id + 'Latitude60').text(lat60);
	$('#' + id + 'Latitude10').text('(' + lat10 + ')');
	$('#' + id + 'Latitude').show();
	$('#' + id + 'Longitude60').text(lng60);
	$('#' + id + 'Longitude10').text('(' + lng10 + ')');
	$('#' + id + 'Longitude').show();
	$('#' + id + 'None').hide();
};

// zrusi vyber pozice
vizus.cms.form.gps.remove = function(id)
{
	$('#' + id).val('');
	$('#' + id + 'Latitude60').empty();
	$('#' + id + 'Latitude10').empty();
	$('#' + id + 'Latitude').hide();
	$('#' + id + 'Longitude').hide();
	$('#' + id + 'Longitude60').empty();
	$('#' + id + 'Longitude10').empty();
	$('#' + id + 'None').show();
};

// inicializace
vizus.cms.form.gps.googleMapInitialize = function(canvasId, searchId, point, opener, openerElement, options)
{
	options = options ||
	{
		zoom: 7,
		center: new google.maps.LatLng(50.081572, 14.427066),
		mapTypeId: google.maps.MapTypeId.ROADMAP
	};

	if (point)
	{
		var gps = point.toString().match(/^(\d+(?:\.\d+)?),(\d+(?:\.\d+)?)$/);

		if (gps)
			options.center = new google.maps.LatLng(gps[1], gps[2]);
	}

	var map = new google.maps.Map(document.getElementById(canvasId), options);
	var marker = new google.maps.Marker({position: map.getCenter(), map: map});
	map.controls[google.maps.ControlPosition.TOP_LEFT].push(document.getElementById(searchId));
	var searchBox = new google.maps.places.SearchBox(document.getElementById(searchId));

	google.maps.event.addListener(map, 'click', function(event)
	{
		point = event.latLng;
		marker.setPosition(point);
		opener.vizus.cms.form.gps.select(openerElement, point.lat(), point.lng());
	});
	
	google.maps.event.addListener(searchBox, 'places_changed', function()
	{
		var places = searchBox.getPlaces();
		var bounds = new google.maps.LatLngBounds();
		for (var i = 0, place; place = places[i]; i++)
			bounds.extend(place.geometry.location);
		
		map.fitBounds(bounds);
	});
};

/**
* Komponenta hesla
* @namespace
* =============================================================================
*/

if (!vizus.cms.form.password)
	vizus.cms.form.password = {};

// vygenerovani hesla
vizus.cms.form.password.generate = function(id, strength)
{
	document.getElementById(id).value = vizus.text.password(strength);
	vizus.cms.form.password.check(id);
};

// kontrola hesla
vizus.cms.form.password.check = function(id)
{
	var levels = [];
	var password = document.getElementById(id).value;
	
	for (var i = 0; i < 10; i++)
	{
		levels[i] = document.getElementById(id+'Level'+i)
		levels[i].className = levels[i].className.replace(/ level\d+/, '');
	}
	
	if (password.length > 0)
	{
		var found = null;
		var bits = 0;
		
		if ((found = password.match(/[a-z]/g)) != null)
			bits += 4.7 * found.length;
		
		if ((found = password.match(/[A-Z]/g)) != null)
			bits += 4.705 * found.length;
		
		if ((found = password.match(/[0-9]/g)) != null)
			bits += 3.33 * found.length;

		if ((found = password.match(/\W/g)) != null)
			bits += 4 * found.length;
		
		if ((found = password.match(/[\u00C0-\uFFFF]/g)) != null)
			bits += 16 * found.length;

		var quality = Math.round(bits / 6);
		
		for (var i = 0; i < quality && i < 10; i++)
			levels[i].className += ' level' + i;
	}
};

/**
* Komponenta zalozek
* @namespace
* =============================================================================
*/

if (!vizus.cms.form.tabs)
	vizus.cms.form.tabs = {};

// vybere zalozku
vizus.cms.form.tabs.select = function(id, tabId)
{
	$('#' + id + 'Tabs > li > a.active').removeClass('active');
	$('#' + id + 'Tab' + tabId + ' > a').addClass('active');
	$('#' + id + 'Blocks > div > div').hide();
	$('#' + id + 'Block' + tabId).show();
};

/**
* Komponenta vyberu
* @namespace
* =============================================================================
*/

if (!vizus.cms.form.multiselect)
	vizus.cms.form.multiselect = {};

// vyber nebo zruseni vyberu polozky
vizus.cms.form.multiselect.toggleItem = function(id, index)
{
	var options = document.getElementById(id).options;
	options[index].selected = !options[index].selected;
	$('#' + id + 'Container > ul.items li:eq(' + index + ') > a.item').toggleClass('active icon-checked icon-unchecked');
	$('#' + id + 'Container > ul.items li:eq(' + index + ') ul li > a.item').each(function(i, elm)
	{
		options[index + i + 1].selected = options[index].selected;
		
		if (options[index].selected)
			$(this).addClass('active icon-checked').removeClass('icon-unchecked');
		else
			$(this).addClass('icon-unchecked').removeClass('active icon-checked');
	});
	
	vizus.cms.form.multiselect.update(id);
};

// otevreni podpolozek
vizus.cms.form.multiselect.toggleChildren = function(id, index)
{
	$('#' + id + 'Container > ul.items li:eq(' + index + ') > ul:visible').slideUp(200);
	$('#' + id + 'Container > ul.items li:eq(' + index + ') > ul:hidden').slideDown(200);
	$('#' + id + 'Container > ul.items li:eq(' + index + ') > a.children').toggleClass('icon-plus icon-minus');
};

// vyber skupiny
vizus.cms.form.multiselect.selectGroup = function(id, indexes)
{
	var options = document.getElementById(id).options;

	for (var i = 0; i < options.length; i++)
	{
		if (indexes.indexOf(i) != -1)
		{
			options[i].selected = true;
			$('#' + id + 'Item' + i + ' > a.item').addClass('active icon-checked').removeClass('icon-unchecked');
		}
		else
		{
			options[i].selected = false;
			$('#' + id + 'Item' + i + ' > a.item').addClass('icon-unchecked').removeClass('active icon-checked');
		}
	}
	
	vizus.cms.form.multiselect.update(id);
};

// aktualizace
vizus.cms.form.multiselect.update = function(id)
{
	var selected = 0;
	var options = document.getElementById(id).options;
	
	for (var i = 0; i < options.length; i++)
	{
		if (options[i].selected)
			selected++;
	}
	
	$('#' + id + 'Counter').text(selected + ' / ' + options.length);
};

/**
* Komponenta textového pole
* @namespace
* =============================================================================
*/

if (!vizus.cms.form.textarea)
	vizus.cms.form.textarea = {};

// kontroluje zapis textu
vizus.cms.form.textarea.onkeypress = function(event, id, maxLength)
{
	if (maxLength <= 0)
		return;

	var textarea = document.getElementById(id);
	
	if (textarea.value.length > maxLength)
	{
		vizus.event.stop(event);
		return false;
	}
};

// kontroluje delku textu vlozeneho ze schranky
vizus.cms.form.textarea.onpaste = function(event, id, maxLength)
{
	if (maxLength <= 0)
		return;

	var text = vizus.event.clipboard(event);
	var textarea = document.getElementById(id);
	
	if (text !== false && textarea.value.length < maxLength)
	{
		if (textarea.value.length + text.length <= maxLength)
		{
			window.setTimeout('vizus.cms.form.textarea.update("' + id + '")', 50);
			return;
		}

		textarea.value += text.substr(0, maxLength - textarea.value.length);
		vizus.cms.form.textarea.update(id);
	}
		
	vizus.event.stop(event);
	return false;
};

// aktualizuje pocitadlo znaku
vizus.cms.form.textarea.update = function(id)
{
	$('#' + id + 'Counter').text(document.getElementById(id).value.length);
};

/**
* Komponenta souboru z AS
* @namespace
* =============================================================================
*/

if (!vizus.cms.form.file)
	vizus.cms.form.file = {};

// vyber souboru z AS
vizus.cms.form.file.select = function(id, fileId, nameElementId)
{
	var file = window[id + 'Files'][fileId];
	
	if (file)
	{
		window.opener.$('#' + id).val(file.id);
		window.opener.$('#' + id + 'Link').html(file.link).show();
		window.opener.$('#' + id + 'Info').html('(' + file.size + ', ' + file.date + ')').show();
		window.opener.$('#' + id + 'None').hide();
		
		if (nameElementId)
			window.opener.$('#' + nameElementId).val(file.name);
	}
	else
		vizus.cms.form.file.remove(id);
	
	if (window.dialog != undefined && window.dialog.close != undefined)
		window.dialog.close();
	else
		window.close();
};

// nastaveni souboru z AS
vizus.cms.form.file.set = function(id, file, nameElementId)
{
	if (file)
	{
		$('#' + id).val(file.id);
		$('#' + id + 'Link').html(file.link).show();
		$('#' + id + 'Info').html('(' + file.size + ', ' + file.date + ')').show();
		$('#' + id + 'None').hide();
		
		if (nameElementId)
			$('#' + nameElementId).val(file.name);
	}
	else
		vizus.cms.form.file.remove(id);
};

// zrusi vyber souboru z AS
vizus.cms.form.file.remove = function(id)
{
	$('#' + id).val(0);
	$('#' + id + 'Link').hide();
	$('#' + id + 'Info').hide();
	$('#' + id + 'None').show();
};

/**
* Komponenta souborů z AS
* @namespace
* =============================================================================
*/

if (!vizus.cms.form.fileList)
	vizus.cms.form.fileList = {};

// vybere soubor z AS
vizus.cms.form.fileList.select = function(id, index, fileId)
{
	var file = window[id + 'Files'][fileId];
	
	if (file)
	{
		window.opener[id + 'Ids'][index] = file.id;
		vizus.cms.form.fileList.update(id, window.opener);

		window.opener.$('#' + id + 'Row' + index).attr('data-id', file.id);
		window.opener.$('#' + id + 'Link' + index).html(file.link).show();
		window.opener.$('#' + id + 'Info' + index).html('(' + file.size + ', ' + file.date + ')').show();
		window.opener.$('#' + id + 'None' + index).hide();
		
		if (window.opener.$('#' + id + 'Container li[data-id=0]:visible').length == 0)
			window.opener.$('#' + id + 'Container li:not(:visible)').eq(0).show();
	}
	else
		vizus.cms.form.fileList.remove(id, index);
	
	window.close();
};

// nastavi soubory z AS
vizus.cms.form.fileList.set = function(id, files)
{
	var index = 0;
	
	for (var f = 0; f < files.length; f++)
	{
		var file = files[f];
		
		outer: while (window[id + 'Ids'][index])
		{
			index++;
			
			if ($('#' + id + 'Row' + index).length == 0)
				break outer;
		}
		
		window[id + 'Ids'][index] = file.id;

		$('#' + id + 'Row' + index).attr('data-id', file.id);
		$('#' + id + 'Link' + index).html(file.link).show();
		$('#' + id + 'Info' + index).html('(' + file.size + ', ' + file.date + ')').show();
		$('#' + id + 'None' + index).hide();
		
		if ($('#' + id + 'Container li[data-id=0]:visible').length == 0)
			$('#' + id + 'Container li:not(:visible)').eq(0).show();
	}
	
	vizus.cms.form.fileList.update(id, window);
};

// zrusi vyber souboru z AS
vizus.cms.form.fileList.remove = function(id, index)
{
	window[id + 'Ids'][index] = null;
	vizus.cms.form.fileList.update(id, window);
	
	$('#' + id + 'Row' + index).attr('data-id', 0);
	$('#' + id + 'Link' + index).hide();
	$('#' + id + 'Info' + index).hide();
	$('#' + id + 'None' + index).show();
	
	if ($('#' + id + 'Container li[data-id=0]:visible').length > 1)
		$('#' + id + 'Row' + index).hide();
};

// aktualizuje seznam id
vizus.cms.form.fileList.update = function(id, context)
{
	var ids = [];
	var src = context[id + 'Ids'];
	
	for (var i = 0; i < src.length; i++)
	{
		if (src[i])
			ids.push(src[i]);
	}
	
	context.$('#' + id).val(ids.join(','));
};

/**
* Komponenta odkazu
* @namespace
* =============================================================================
*/

if (!vizus.cms.form.link)
	vizus.cms.form.link = {};

// vyber odkazu
vizus.cms.form.link.select = function(id, link)
{
	$('#' + id).val(link);
	$('#' + id + 'Link').text(link);
	$('#' + id + 'None').hide();
};

// zrusi vyber odkazu
vizus.cms.form.link.remove = function(id)
{
	$('#' + id).val('');
	$('#' + id + 'Link').empty();
	$('#' + id + 'None').show();
};

/**
* Komponenta html
* @namespace
* =============================================================================
*/

if (!vizus.cms.form.html)
	vizus.cms.form.html = {};

// zobrazi html
vizus.cms.form.html.view = function(id)
{
	$('#' + id).hide();
	$('#' + id + 'Preview').show();
};

// zobrazi zdroj
vizus.cms.form.html.source = function(id)
{
	$('#' + id).show();
	$('#' + id + 'Preview').hide();
};

// zmena zdrojoveho kodu
vizus.cms.form.html.onchange = function(id)
{
	$('#' + id + 'Preview > iframe').get(0).contentWindow.document.location.reload();
};

// nahled kodu
vizus.cms.form.html.preview = function(url, width, height)
{
	vizus.cms.dialog.open(url, width, height, {autoSize: true, autoResize: true, autoVisible: true, overflowX: 'auto', overflowY: 'scroll'});
};

// nahled webu
vizus.cms.form.html.web = function(url, width, height)
{
	vizus.cms.dialog.open(url, width, height, {autoSize: false, autoResize: true, autoVisible: true, overflowX: 'auto', overflowY: 'scroll'});
};

// editace kodu
vizus.cms.form.html.edit = function(url, width, height)
{
	vizus.cms.dialog.open(url, width, height, {autoSize: false, autoResize: true, autoVisible: true, overflowX: 'hidden', overflowY: 'hidden'});
};

/**
* Komponenta šablony
* @namespace
* =============================================================================
*/

if (!vizus.cms.form.htmlStencil)
	vizus.cms.form.htmlStencil = {};

// zmena sablony
vizus.cms.form.htmlStencil.change = function(id)
{
	var sid = document.getElementById(id).value;
	var stencil = window[id + 'Stencils'][sid];
	var applyTo = window[id + 'ApplyTo'];
	
	function changeS(i, val)
	{
		return val.replace(/\bstencil=\d+/, 'stencil=' + stencil.id)
	}
	
	function changeSWH(i, val)
	{
		return val.replace(/\bstencil=\d+/, 'stencil=' + stencil.id).replace(/, \d+, \d+/, ', ' + stencil.width + ', ' + stencil.height);
	}

	for (var i = 0; i < applyTo.length; i++)
	{
		$('#' + applyTo[i] + 'EditLink').attr('href', changeS);
		$('#' + applyTo[i] + 'WebLink').attr('href', changeSWH);
		$('#' + applyTo[i] + 'PreviewLink').attr('href', changeSWH);
		$('#' + applyTo[i] + 'PreviewFrame').attr('src', changeS);
	}
};

/**
* Komponenta seznamu položek
* @namespace
* =============================================================================
*/

if (!vizus.cms.form.itemList)
	vizus.cms.form.itemList = {};

// stisknuti klavey
vizus.cms.form.itemList.onkeydown = function(event, id)
{
	event = event || window.event;
	var keys = vizus.event.keys;
	
	switch (event.keyCode)
	{
		case keys.keyPageUp:
		{
			vizus.cms.form.itemList.jump(id, -10);
			break;
		}
		case keys.keyPageDown:
		{
			vizus.cms.form.itemList.jump(id, 10);
			break;
		}
		case keys.keyUp:
		{
			vizus.cms.form.itemList.up(id);
			break;
		}
		case keys.keyDown:
		{
			vizus.cms.form.itemList.down(id);
			break;
		}
		case keys.keyHome:
		{
			vizus.cms.form.itemList.first(id);
			break;
		}
		case keys.keyEnd:
		{
			vizus.cms.form.itemList.last(id);
			break;
		}
		case keys.keyDelete:
		{
			vizus.cms.form.itemList.remove(id);
			return;
		}
		default:
		{
			return;
		}
	}
	
	vizus.event.stop(event);
	return false;
};

// vyber polozky
vizus.cms.form.itemList.select = function(id, itemId, itemName, limit)
{
	var select = vizus.dom.get(id + 'Order');

	if (!limit || select.options.length < limit)
	{
		var option = document.createElement('OPTION');
		option.value = itemId;
		option.selected = true;
		option.appendChild(document.createTextNode(itemName));
		select.appendChild(option);
		option = option.cloneNode(true);
		option.selected = true;
		document.getElementById(id).appendChild(option);
		vizus.cms.form.itemList.updateActions(id);
	}
};

// zruseni vyberu polozky
vizus.cms.form.itemList.unselect = function(id, itemId)
{
	var select = vizus.dom.get(id + 'Order');
	
	for (var i = 0; i < select.options.length; i++)
	{
		if (select.options[i].value == itemId)
		{
			vizus.dom.remove(select.options[i]);
			vizus.cms.form.itemList.update(id);
			break;
		}
	}
};

// pridani polozky
vizus.cms.form.itemList.add = function(id, url, width, height, limit)
{
	var select = vizus.dom.get(id + 'Order');
	
	if (!limit || select.options.length < limit)
	{
		var ids = [];
		
		for (var i = 0; i < select.options.length; i++)
			ids.push(select.options[i].value);
		
		url += '&paramSelectedIds=' + encodeURIComponent(ids.join(','));
		vizus.cms.dialog.page(url, width, height);
	}
};

// polozka jako prvni
vizus.cms.form.itemList.first = function(id)
{
	var select = vizus.dom.get(id + 'Order');
	
	if (select.selectedIndex > 0)
	{
		var option = vizus.dom.moveTo(select.options[select.selectedIndex], 0);
		vizus.cms.form.itemList.update(id, option);
	}
};

// polozka nahoru o 10
vizus.cms.form.itemList.jump = function(id, jump)
{
	var select = vizus.dom.get(id + 'Order');
	
	if (select.selectedIndex != -1)
	{
		var option = vizus.dom.moveBy(select.options[select.selectedIndex], jump);
		vizus.cms.form.itemList.update(id, option);
	}
};

// polozka nahoru
vizus.cms.form.itemList.up = function(id)
{
	var select = vizus.dom.get(id + 'Order');
	
	if (select.selectedIndex > 0)
	{
		var option = vizus.dom.moveBy(select.options[select.selectedIndex], -1);
		vizus.cms.form.itemList.update(id, option);
	}
};

// polozka dolu
vizus.cms.form.itemList.down = function(id)
{
	var select = vizus.dom.get(id + 'Order');
	
	if (select.selectedIndex != -1)
	{
		var option = vizus.dom.moveBy(select.options[select.selectedIndex], 1);
		vizus.cms.form.itemList.update(id, option);
	}
};

// polozka jako posledni
vizus.cms.form.itemList.last = function(id)
{
	var select = vizus.dom.get(id + 'Order');
	
	if (select.selectedIndex != -1)
	{
		var option = vizus.dom.moveTo(select.options[select.selectedIndex], -1);
		vizus.cms.form.itemList.update(id, option);
	}
};

// odstraneni polozky
vizus.cms.form.itemList.remove = function(id)
{
	var select = vizus.dom.get(id + 'Order');
	
	if (select.selectedIndex != -1)
	{
		vizus.dom.remove(select.options[select.selectedIndex]);
		vizus.cms.form.itemList.update(id);
	}
};

// aktualizace
vizus.cms.form.itemList.update = function(id, option)
{
	$('#' + id).empty();
	$('#' + id + 'Order > option').clone().attr('selected', true).appendTo('#' + id);
	vizus.cms.form.itemList.updateActions(id);

	// workaround - https://bugzilla.mozilla.org/show_bug.cgi?id=291082
	if (/firefox/i.test(window.navigator.userAgent) && option)
		window.setTimeout(function() { option.selected = true; }, 1);
};

// aktualizace akci
vizus.cms.form.itemList.updateActions = function(id, limit)
{
	var select = $('#' + id + 'Order').get(0);
	
	if (select.selectedIndex == -1)
	{
		$('#' + id + 'Up').addClass('disabled');
		$('#' + id + 'Down').addClass('disabled');
		$('#' + id + 'Remove').addClass('disabled');
	}
	else if (select.selectedIndex == 0)
	{
		$('#' + id + 'Up').addClass('disabled');
		$('#' + id + 'Down').removeClass('disabled');
		$('#' + id + 'Remove').removeClass('disabled');
	}
	else if (select.selectedIndex == select.options.length - 1)
	{
		$('#' + id + 'Up').removeClass('disabled');
		$('#' + id + 'Down').addClass('disabled');
		$('#' + id + 'Remove').removeClass('disabled');
	}
	else
	{
		$('#' + id + 'Up').removeClass('disabled');
		$('#' + id + 'Down').removeClass('disabled');
		$('#' + id + 'Remove').removeClass('disabled');
	}
	
	if (!limit || select.options.length < limit)
		$('#' + id + 'Add').removeClass('disabled');
	else
		$('#' + id + 'Add').addClass('disabled');
};

/**
* Komponenta listovani pohledy
* @namespace
* =============================================================================
*/

if (!vizus.cms.form.views)
	vizus.cms.form.views = {};

// stisknuti klavesy
vizus.cms.form.views.select = function(id, index)
{
	$('#' + id + 'List tr.selected').removeClass('selected');
	$('#' + id + 'Views > div.selected').removeClass('selected');
	$('#' + id + 'Row' + index).addClass('selected');
	$('#' + id + 'View' + index).addClass('selected');
	window[id + 'Selected'] = window.document.getElementById(id + 'Row' + index);
};

/**
* Dialogy
* @namespace
* =============================================================================
*/

if (!vizus.cms.dialog)
	vizus.cms.dialog = {};

// otevre zakladni dialog
vizus.cms.dialog.open = function(url, width, height, options, data)
{
	options = options || {};
	options.width = width;
	options.height = height;
	options.autoVisible = true;

	new vizus.cms.dialog.Dialog(url, options, data, window, top);
};

// otevre dialog pro scrolovatelnou stranku
vizus.cms.dialog.page = function(url, width, height, options, data)
{
	options = options || {};
	options.width = width;
	options.height = height;
	options.overflowX = 'auto';
	options.overflowY = 'scroll';
	options.autoResize = true;
	options.autoVisible = true;
	
	new vizus.cms.dialog.Dialog(url, options, data, window, top);
};

// otevre dialog pro nahled media
vizus.cms.dialog.preview = function(url, width, height, options, data)
{
	options = options || {};
	options.width = width || 320;
	options.height = height || 240;
	options.overlay = 'dark';
	options.autoSize = true;
	options.autoRatio = true;
	options.autoResize = true;
	options.autoVisible = true;
	options.autoShrink = true;
	
	new vizus.cms.dialog.Dialog(url, options, data, window, top);
};

// zjisti instanci dialogu dle okna
vizus.cms.dialog.resolve = function(context)
{
	context = context || window;
	var found = context.name.match(/^dialog(\d+)$/);
	
	if (found && top.vizus.cms.status.dialogInstances[found[1]])
		return top.vizus.cms.status.dialogInstances[found[1]];
	else
		return null;
};

// trida dialogu se strankou
vizus.cms.dialog.Dialog = function(url, options, data, opener, context)
{
	this.url = url || '';
	this.options = options || {};
	this.data = data || {};
	this.opener = opener || window;
	this.context = context || top;

	this.options.x = 'x' in this.options ? this.options.x : null;
	this.options.y = 'y' in this.options ? this.options.y : null;
	this.options.width = 'width' in this.options ? this.options.width : null;
	this.options.height = 'height' in this.options ? this.options.height : null;
	this.options.overlay = 'overlay' in this.options ? this.options.overlay : 'light';
	this.options.overflowX = 'overflowX' in this.options ? this.options.overflowX : 'hidden';
	this.options.overflowY = 'overflowY' in this.options ? this.options.overflowY : 'hidden';
	this.options.autoSize = 'autoSize' in this.options ? this.options.autoSize : false;
	this.options.autoResize = 'autoResize' in this.options ? this.options.autoResize : false;
	this.options.autoRatio = 'autoRatio' in this.options ? this.options.autoRatio : false;
	this.options.autoVisible = 'autoVisible' in this.options ? this.options.autoVisible : false;
	this.options.autoShrink = 'autoShrink' in this.options ? this.options.autoShrink : false;
	
	this.stack = top.vizus.cms.status.dialogInstances;
	this.stack.push(this);
	this.index = this.stack.length - 1;
	this.overlay = new vizus.cms.page.Overlay(this.options.overlay, top);
	
	this.visible = false;
	this.x = this.options.x;
	this.y = this.options.y;
	this.width = this.options.width;
	this.height = this.options.height;
	this.id = 'Dialog' + this.index;
	this.dialog = this.context.$('#Dialog').clone();
	this.dialog.attr('id', this.id);
	this.dialog.css({zIndex: this.context.vizus.cms.status.zIndex++, display: 'table'})
	this.dialog.find('h1').draggable(this.dialog);
	this.dialog.find('a').on('click', this.close.bind(this)).attr('href', 'javascript:');
	this.frame = this.dialog.find('iframe');
	this.frame.attr({src: this.url, name: 'dialog' + this.index}).css({overflowX: this.options.overflowX, overflowY: this.options.overflowY});
	this.dialog.appendTo(this.context.document.body);
	this.viewport = {width: this.context.innerWidth, height: this.context.innerHeight};
	this.content = {width: this.options.width, height: this.options.height, window: this.frame.get(0).contentWindow};
	this.margin = {width: this.dialog.outerWidth(true) - this.dialog.width(), height: this.dialog.outerHeight(true) - this.dialog.height()};
	this.content.window.close = this.close.bind(this);
	this.content.window.opener = this.opener;
	this.onclose = null;
	
	if (this.options.width > 0 && this.options.height > 0)
	{
		this.resizeTo(this.options.width, this.options.height);

		if (this.options.autoShrink)
			this.shrink();

		this.moveTo(this.options.x, this.options.y);
		this.centre(this.options.x === null, this.options.y === null);
		this.show();
	}
	
	var onload = function()
	{
		if (!this.visible)
		{
			var dialog = this;
			window.setTimeout(function() { dialog.init(dialog.content.window); }, 500);
		}
	};
	
	$(this.frame).on('load', onload.bind(this));

	var onresize = function()
	{
		this.viewport = {width: this.context.innerWidth, height: this.context.innerHeight};
		
		if (this.options.autoResize)
			this.resizeTo(this.content.width, this.content.height);
		
		if (this.options.autoShrink)
			this.shrink();

		this.centre(this.options.x === null, this.options.y === null);
	};
	
	$(this.context).on('resize.vizus.cms.' + this.id, onresize.bind(this));
};

// inicializace dialogu v cilovem okne
vizus.cms.dialog.Dialog.prototype.init = function(context)
{
	var doc = context.document;
	var html = doc.body.parentNode;
	var body = $(doc.body);
	body.addClass('dialog').css({overflowX: this.options.overflowX, overflowY: this.options.overflowY});
	
	// IE fix
	if (this.options.overflowX == 'hidden')
		$(html).css({overflowX: 'hidden'});
	
	// IE fix
	if (this.options.overflowY == 'hidden')
		$(html).css({overflowY: 'hidden'});
	
	if (!this.options.width || !this.options.height || this.options.autoSize)
	{
		body.addClass('flexible');
		this.frame.width(10).height(10);
		this.content.width = Math.max(body.outerWidth(true) + ($(html).outerWidth(true) - $(html).width()), doc.body.scrollWidth);
		this.content.height = Math.max(body.outerHeight(true) + ($(html).outerHeight(true) - $(html).height()), doc.body.scrollHeight);
		
		if (this.options.overflowX == 'auto' || this.options.overflowX == 'scroll')
			this.content.width += 30;
			
		if (this.options.overflowY == 'auto' || this.options.overflowY == 'scroll')
			this.content.height += 30;

		//console.log(this.content.width + ' x ' + this.content.height);
		this.resizeTo(this.content.width, this.content.height);
		this.moveTo(this.options.x, this.options.y);
		this.centre(this.options.x === null, this.options.y === null);
		
		if (this.options.autoShrink)
			this.shrink();
		
		this.show();
	}
	else
		body.addClass('fixed');
	
	var onkeydown = function(event)
	{
		if (vizus.event.keyCode(event.originalEvent) == vizus.event.keys.keyEsc)
			this.close();
	};
	
	$(doc).on('keydown.vizus.cms.' + this.id, onkeydown.bind(this));
	context.setTimeout('window.focus();', 100);
	context.opener = this.opener;
	context.close = this.close.bind(this);
	return this;
};

// vycentrovani dialogu na stred okna
vizus.cms.dialog.Dialog.prototype.centre = function(x, y)
{
	if (x)
		this.x = Math.round(this.context.innerWidth / 2 - (this.width + this.margin.width) / 2);
	
	if (y)
		this.y = Math.round(this.context.innerHeight / 2 - (this.height + this.margin.height) / 2);

	this.dialog.css({left: this.x + 'px', top: this.y + 'px'});
	return this;
};

// presun dialogu na souradnice monitoru
vizus.cms.dialog.Dialog.prototype.moveTo = function(x, y)
{
	if (typeof x == 'number')
		this.dialog.css({left: (this.x = x) + 'px'});
	
	if (typeof y == 'number')
		this.dialog.css({top: (this.y = y) + 'px'});
	
	return this;
};

// zmena velikosti obsahu dialogu
vizus.cms.dialog.Dialog.prototype.resizeTo = function(width, height)
{
	if (this.options.autoVisible && width > 0 && height > 0)
	{
		if (width + this.margin.width > this.viewport.width)
		{
			var maxWidth = this.viewport.width - this.margin.width;
			
			if (this.options.autoRatio)
				height = Math.round(height / (width / maxWidth));
	
			width = maxWidth;
		}
				
		if (height + this.margin.height > this.viewport.height)
		{
			var maxHeight = this.viewport.height - this.margin.height;
			
			if (this.options.autoRatio)
				width = Math.round(width / (height / maxHeight));
	
			height = maxHeight;
		}
	}

	if (width > 0)
		this.frame.width(this.width = width);
	
	if (height > 0)
		this.frame.height(this.height = height);
	
	return this;
};

// zmena velikosti obsahu dialogu
vizus.cms.dialog.Dialog.prototype.shrink = function()
{
	$(this.content.window.document).find('body > img, embed, object, body > div.video-js').css({width: this.width + 'px', height: this.height + 'px', display: 'block'});
};

// zobrazeni dialogu
vizus.cms.dialog.Dialog.prototype.show = function()
{
	this.dialog.css({visibility: 'visible'});
	this.visible = true;
	return this;
};

// nastaveni nebo vraceni titulku
vizus.cms.dialog.Dialog.prototype.title = function(title)
{
	if (title == undefined)
		return this.dialog.find('h1').text();

	this.dialog.find('h1').text(title);
	return this;
};

// zavreni dialogu
vizus.cms.dialog.Dialog.prototype.close = function()
{
	if (typeof this.onclose != 'function' || this.onclose() !== false)
		this.remove();
};

// odstraneni dialogu
vizus.cms.dialog.Dialog.prototype.remove = function()
{
	$(this.context).off('resize.vizus.cms.' + this.id);
	$(this.context.document).off('keydown.vizus.cms.' + this.id);
	
	this.stack.splice(this.index, 1);
	this.dialog.remove();
	this.overlay.remove();
	this.context.vizus.cms.status.zIndex--;
};

/**
* Editor
* @namespace
* =============================================================================
*/

if (!vizus.cms.editor)
	vizus.cms.editor = {};

/**
* Komponenta marginu editoru
* @namespace
* =============================================================================
*/

if (!vizus.cms.editor.margins)
	vizus.cms.editor.margins = {};

// nacteni nebo inicializace marginu
vizus.cms.editor.margins.load = function(id, element, margins)
{
	var get = window.document.getElementById.bind(window.document);
	
	if (element)
	{
		get(id + 'Top').value = element.style.marginTop != '' ? parseInt(element.style.marginTop, 10) : '';
		get(id + 'Right').value = element.style.marginRight != '' ? parseInt(element.style.marginRight, 10) : '';
		get(id + 'Bottom').value = element.style.marginBottom != '' ? parseInt(element.style.marginBottom, 10) : '';
		get(id + 'Left').value = element.style.marginLeft != '' ? parseInt(element.style.marginLeft, 10) : '';
	}
	else
	{
		get(id + 'Top').value = margins.top;
		get(id + 'Right').value = margins.right;
		get(id + 'Bottom').value = margins.bottom;
		get(id + 'Left').value = margins.left;
	}
};

// ulozeni marginu
vizus.cms.editor.margins.save = function(id, store)
{
	store = store || 'cms.editor';
	var get = window.document.getElementById.bind(window.document);
	document.cookie = 'CmsUserSessionSettings[' + store + '.marginTop]=' + get(id + 'Top').value;
	document.cookie = 'CmsUserSessionSettings[' + store + '.marginLeft]=' + get(id + 'Left').value;
	document.cookie = 'CmsUserSessionSettings[' + store + '.marginRight]=' + get(id + 'Right').value;
	document.cookie = 'CmsUserSessionSettings[' + store + '.marginBottom]=' + get(id + 'Bottom').value;
};

/**
* Komponenta souboru z AS pro editor
* @namespace
* =============================================================================
*/

if (!vizus.cms.editor.file)
	vizus.cms.editor.file = {};

// soubor z AS
vizus.cms.editor.file.enter = function(id, archiveId)
{
	window.opener.vizus.cms.editor.file.select(id, archiveId);

	if (window.dialog != undefined && window.dialog.close != undefined)
		window.dialog.close();
	else
		window.close();
};

// soubor z AS
vizus.cms.editor.file.select = function(id, archiveId)
{
	var data = window[id];
	
	if (typeof data.onselect == 'function')
		data.onselect.call(data, id);

	$('#' + id + 'Link').hide();
	$('#' + id + 'Info').hide();
	$('#' + id + 'None').show();
	
	if (archiveId)
	{
		vizus.cms.page.wait();
		document.getElementById(id + 'Loader').src = vizus.url.replace(data.infoUrl, {query: {archiveID: archiveId}});
	}
};

// informace o souboru z AS
vizus.cms.editor.file.load = function(id)
{
	var loader = document.getElementById(id + 'Loader').contentWindow;
	var data = window[id];
	data.file = loader.file;
	data.images = loader.images;
	
	if (data.file)
	{
		$('#' + id + 'Browser').html(data.browserLink.replace('FOLDER_ID', data.file.folderId));
		$('#' + id + 'Link').html(data.file.link).show();
		$('#' + id + 'Info').html('(' + data.file.size + ', ' + data.file.created + ')').show();
		$('#' + id + 'None').hide();
		
		if (typeof data.onload == 'function')
			data.onload.call(data, id);
	}
	
	vizus.cms.page.wait(false);
};

/**
* Editor TinyMCE
* @namespace
* =============================================================================
*/

if (!vizus.cms.editor.tinymce)
	vizus.cms.editor.tinymce = {};

// vraci informace o odkazu
vizus.cms.editor.tinymce.getLinkData = function(editor)
{
	var selected = editor.selection.getNode();
	var html = editor.selection.getContent();
	var anchor = editor.dom.getParent(selected, 'a[href]');
	var data =
	{
		anchor:		anchor,
		onlyText:	!(/</.test(html) && (!/^<a [^>]+>[^<]+<\/a>$/.test(html) || html.indexOf('href=') == -1)),
		text:			anchor ? (anchor.innerText || anchor.textContent) : editor.selection.getContent({format: 'text'}),
		href:			anchor ? editor.dom.getAttrib(anchor, 'href') : '',
		target:		anchor ? editor.dom.getAttrib(anchor, 'target') : (editor.settings.default_link_target || null),
		rel:			anchor ? editor.dom.getAttrib(anchor, 'rel') : null,
		title:		anchor ? editor.dom.getAttrib(anchor, 'title') : '',
		className:	anchor ? editor.dom.getAttrib(anchor, 'class') : null,
		attrs:		[]
	};
	
	return data;
};

// vlozeni odkazu
vizus.cms.editor.tinymce.insertLink = function(editor, data)
{
	var attrs =
	{
		href: data.href ? data.href : null,
		target: data.target ? data.target : null,
		rel: data.rel ? data.rel : null,
		title: data.title ? data.title : null,
		'class': data.className ? data.className : null
	};
	
	if (data.attrs)
	{
		for (var key in data.attrs)
			attrs[key] = data.attrs[key];
	}
	
	if (data.anchor)
	{
		editor.focus();
	
		if (data.onlyText)
			$(data.anchor).text(data.text);

		editor.dom.setAttribs(data.anchor, attrs);
		editor.selection.select(data.anchor);
		editor.undoManager.add();
	}
	else if (data.onlyText)
		editor.insertContent(editor.dom.createHTML('a', attrs, editor.dom.encode(data.text)));
	else
		editor.execCommand('mceInsertLink', false, attrs);
};

/**
* Archiv souboru
* @namespace
* =============================================================================
*/

if (!vizus.cms.archive)
	vizus.cms.archive = {};
	
/**
* Drag & drop presun
* @namespace
* =============================================================================
*/

if (!vizus.cms.archive.move)
	vizus.cms.archive.move = {};

// obsluha udalosti ondragstart
vizus.cms.archive.move.ondragstart = function(event)
{
	var target = event.target;
	
	if ($(target).find('input.selected:checked').length == 0)
		vizus.cms.wcom.listTile.select(target.id);
		
	vizus.cms.dragdrop.ondragstart(event);
};

// obsluha udalosti ondrop
vizus.cms.archive.move.ondrop = function(event)
{
	event.preventDefault();

	var id = event.dataTransfer.getData('Text');
	var target = event.currentTarget;
	
	if (id)
	{
		var source = vizus.dom.get(id);
		
		if (source !== target)
		{
			var listSelectId = $(source).data('list-select-id');
			var operation = vizus.dom.get(listSelectId + 'Operation');
			operation.value = 'move';
			operation.form.action = vizus.url.replace(operation.form.action, {query: {targetID: $(target).data('id')}});
			operation.form.submit();
			vizus.cms.page.wait();
		}
	}

	vizus.dom.removeClass(target, 'dragover');
};

// Drag & drop nahravac souboru
// credits http://html5demos.com/dnd-upload
vizus.cms.archive.Uploader = function(id, url, callback, messages)
{
	this.id = id;
	this.url = url;
	this.callback = callback;
	this.element = vizus.dom.get(this.id);
	this.element.innerHTML = '<span class="message"></span><span class="complete"></span><span class="progress"></span>';
	this.xhr = null;
	
	messages = messages || {};
	this.messages = {};
	this.messages.wait = messages.wait || vizus.i18n.text('Nové soubory přetáhněte myší sem');
	this.messages.dragover = messages.dragover || '';
	this.messages.uploading = messages.uploading || vizus.i18n.text('Nahrávání, čekejte...');
	this.messages.processing = messages.processing || vizus.i18n.text('Zpracovávání, čekejte...');
	this.messages.nofile = messages.nofile || vizus.i18n.text('Žádný soubor k nahrání');
	this.messages.onerror = messages.onerror || vizus.i18n.text('Chyba při nahrávání souboru');
	this.messages.ontimeout = messages.ontimeout || vizus.i18n.text('Vypršel časový limit');

	this.$element = $(this.element);
	this.$message = this.$element.find('span.message').eq(0);
	this.$complete = this.$element.find('span.complete').eq(0);
	this.$progress = this.$element.find('span.progress').eq(0);
	this.$percent = [];
	
	for (var i = 10; i <= 100; i += 10)
	{
		this.$percent[i] = $('<span class="percent-' + i + '"></span>');
		this.$progress.append(this.$percent[i]);
	}

	this.state('wait');
};

// nastaveni/ziskani stavu
vizus.cms.archive.Uploader.prototype.state = function(status)
{
	if (!status)
		return this.status;
	
	if (status == this.status)
		return;
	
	var that = this;
	
	function enable()
	{
		that.element.ondragover = that.ondragover.bind(that);
		that.element.ondragleave = that.ondragleave.bind(that);
		that.element.ondrop = that.ondrop.bind(that);
	}
	
	function disable()
	{
		that.element.ondragover = null;
		that.element.ondragleave = null;
		that.element.ondrop = null;
	}
	
	function wait()
	{
		window.setTimeout(function() { that.state('wait'); }, 5000);
	}
	
	switch (status)
	{
		case 'wait': { enable(); break; }
		case 'dragover': { break; }
		case 'uploading': { disable(); break; }
		case 'processing': { disable(); break; }
		case 'done': { disable(); wait(); break; }
		case 'error': { disable(); wait(); break; }
	}
	
	this.$element.removeClass('wait dragover uploading processing done error').addClass(status);
	this.message(this.messages[status])
	this.status = status;
};

// nahrani souboru
vizus.cms.archive.Uploader.prototype.upload = function(event)
{
	var data = new FormData();
	var files = event.dataTransfer.files;
	var size = 0;

	for (var i = 0; i < files.length; i++)
	{
		if (files[i].size > 0)
		{
			data.append('file' + i, files[i]);
			size += files[i].size;
		}
	}
	
	if (size == 0)
	{
		this.error(this.messages.nofile);
		return false;
	}

	this.progress(0);
	this.state('uploading');
	
	this.xhr = new XMLHttpRequest();
	this.xhr.open('POST', this.url, true);
	this.xhr.onerror = this.onerror.bind(this);
	this.xhr.ontimeout = this.ontimeout.bind(this);
	this.xhr.onload = this.onload.bind(this);
	this.xhr.upload.onprogress = this.onprogress.bind(this);
	this.xhr.send(data);
};

// zobrazeni prubehu
vizus.cms.archive.Uploader.prototype.progress = function(complete)
{
	for (var i = 10; i <= 100; i += 10)
		this.$percent[i].toggleClass('shown', i <= complete);
		
	this.$complete.text(complete + '%');
};

// zobrazeni zpravy
vizus.cms.archive.Uploader.prototype.message = function(message)
{
	this.$message.text(message || '');
};

// zobrazeni chyby
vizus.cms.archive.Uploader.prototype.error = function(message)
{
	this.state('error');
	this.message(message);
};
	
// obsluha udalosti
vizus.cms.archive.Uploader.prototype.ondragover = function(event)
{
	this.state('dragover');
	return false;
};

// obsluha udalosti
vizus.cms.archive.Uploader.prototype.ondragleave = function(event)
{
	this.state('wait');
	return false;
};

// obsluha udalosti
vizus.cms.archive.Uploader.prototype.ondrop = function(event)
{
   event.preventDefault();
	this.upload(event);
};

// obsluha udalosti dokonceni nahravani
vizus.cms.archive.Uploader.prototype.onload = function(event)
{
	var response = null;
	var that = this;

	function finish(delay)
	{
		if (that.callback)
		{
			window.setTimeout(function() { that.callback(that.id, response); }, delay);
		}
	}
		
	try
	{
		response = JSON.parse(this.xhr.response);

		if (response.number)
		{
			this.progress(100);
			this.state('done');
			this.message(response.result);
			finish(500);
		}
		else
		{
			this.error(response.result);
			finish(5000);
		}
	}
	catch (e)
	{
		this.error(this.messages.onerror);
		finish(5000);
	}
};

// obsluha udalosti vyvoje nahravani
vizus.cms.archive.Uploader.prototype.onprogress = function(event)
{
	if (event.lengthComputable)
	{
		var complete = Math.round(event.loaded / event.total * 100 | 0);
		this.progress(complete);
		
		if (complete == 100)
			this.state('processing');
	}
};

// obsluha udalosti chyby
vizus.cms.archive.Uploader.prototype.onerror = function(event)
{
	this.error(this.messages.onerror);
};

// obsluha udalosti vyprseni cas. limitu
vizus.cms.archive.Uploader.prototype.ontimeout = function(event)
{
	this.error(this.messages.ontimeout);
};

/**
* Podpora drag & drop operaci
* @namespace
* =============================================================================
*/

if (!vizus.cms.dragdrop)
	vizus.cms.dragdrop = {};

// nastaveni drag elementu
vizus.cms.dragdrop.addDrag = function(elements, ondrag, ondragstart, ondragend)
{
	for (var i = 0; i < elements.length; i++)
	{
		var element = vizus.dom.get(elements[i]);
		element.draggable = true;
		element.ondrag = ondrag || null;
		element.ondragstart = ondragstart || vizus.cms.dragdrop.ondragstart;
		element.ondragend = ondragend || null;
		$(element).find('*').each(function() { this.draggable = false; });
	}
};

// docasne zakaze dropovani
vizus.cms.dragdrop.disableDrop = function(element)
{
	element = vizus.dom.get(element);
	
	if ($(element).hasClass('dropzone'))
	{
		element.disabledDrop =
		{ 
			ondrop: element.ondrop,
			ondragenter: element.ondragenter,
			ondragover: element.ondragover,
			ondragleave: element.ondragleave
		};
		
		element.ondrop = null;
		element.ondragenter = null;
		element.ondragover = null;
		element.ondragleave = null;
		vizus.dom.removeClass(element, 'dropzone');
	}
};

// povoli drive zakaze dropovani
vizus.cms.dragdrop.enableDrop = function(element)
{
	element = vizus.dom.get(element);
	
	if (element.disabledDrop)
	{
		element.ondrop = element.disabledDrop.ondrop;
		element.ondragenter = element.disabledDrop.ondragenter;
		element.ondragover = element.disabledDrop.ondragover;
		element.ondragleave = element.disabledDrop.ondragleave;
		element.disabledDrop = null;
		vizus.dom.addClass(element, 'dropzone');
	};
};

// nastaveni drop elementu
vizus.cms.dragdrop.addDrop = function(elements, ondrop, ondragenter, ondragover, ondragleave)
{
	for (var i = 0; i < elements.length; i++)
	{
		var element = vizus.dom.get(elements[i]);
		element.ondrop = ondrop || vizus.cms.dragdrop.ondrop;
		element.ondragenter = ondragenter || null;
		element.ondragover = ondragover || vizus.cms.dragdrop.ondragover;
		element.ondragleave = ondragleave || vizus.cms.dragdrop.ondragleave;
		vizus.dom.addClass(element, 'dropzone');
	}
};

// obsluha udalosti ondragover
vizus.cms.dragdrop.ondragover = function(event)
{
	vizus.dom.addClass(this, 'dragover');
	return false;
};

// obsluha udalosti ondragleave
vizus.cms.dragdrop.ondragleave = function(event)
{
	vizus.dom.removeClass(this, 'dragover');
	return false;
};

// obsluha udalosti ondragstart
vizus.cms.dragdrop.ondragstart = function(event)
{
	event.dataTransfer.setData('Text', event.target.id);
};

// obsluha udalosti ondrop
vizus.cms.dragdrop.ondrop = function(event)
{
	event.preventDefault();

	var id = event.dataTransfer.getData('Text');
	var target = event.currentTarget;
	
	if (id)
	{
		var source = vizus.dom.get(id);
		
		if (source !== target)
		{
			if (target.compareDocumentPosition(source) & Node.DOCUMENT_POSITION_FOLLOWING)
				target.parentNode.insertBefore(source, target);
			else
				target.parentNode.insertBefore(source, target.nextSibling);
		}
	}

	vizus.dom.removeClass(target, 'dragover');
};

/**
* Aplikování video/audio přehrávače Video.js
* Pokud není přehrávač zatím natažen, bude načten, včetně skinu a CS překladu.
*
* @function
* @param {String|HTMLVideoElement|HTMLAudioElement} element Element HTML5 tagu VIDEO nebo AUDIO nebo jeho ID.
*/
vizus.cms.player = function(element)
{
	if (!vizus.isClassOf(element, ['String', 'HTMLVideoElement', 'HTMLAudioElement']))
		return;

	if (typeof videojs == 'function')
		videojs(element, {plugins: {VizusAddOns: {element: element}}});
	else
	{
		var base = vizus.cms.config.baseUrl + 'player/';
		var version = 1;
		
		vizus.page.addCss(base + 'skin.css?version=' + version);
		vizus.page.addJs(base + 'vjs.js?version=' + version, function()
		{
			vizus.page.addJs(base + 'localize.js?version=' + version, function()
			{
				videojs.options.flash.swf = base + 'vjs.swf?version=' + version;
				videojs.plugin('VizusAddOns', function(setup)
				{
					var play = this.controlBar.getChild('playToggle').el();
					var remain = this.controlBar.getChild('remainingTimeDisplay').el();
					var mute = this.controlBar.getChild('muteToggle').el();
					
					var ext = this.currentSrc().match(/\.(\w{3,4})($|\?)/)[1];
					var format = document.createElement('div');
					format.className = 'vjs-control vjs-source-format';
					format.innerHTML = ext ? ext.toUpperCase() : '';
					remain.parentNode.insertBefore(format, remain);

					var title = document.createElement('div');
					title.className = 'vjs-control vjs-source-title';
					title.innerHTML = vizus.dom.get(setup.element).getAttribute('title') || '';
					title.style.display = 'none';
					remain.parentNode.insertBefore(title, remain);

					function resize()
					{
						title.style.display = 'none';
						var muteRect = mute.getBoundingClientRect();
						var formatRect = format.getBoundingClientRect();
						var playRect = play.getBoundingClientRect();
						var width = muteRect.left - formatRect.right - 30;
						
						if (width > 20 && playRect.top == muteRect.top)
						{
							title.style.width = width + 'px';
							title.style.display = 'block';
						}
					}
					
					this.on('resize', resize);
					this.on('firstplay', resize);
					this.on('fullscreenchange', resize);
					resize();
				});
			
				vizus.cms.player(element);
			});
		});
	}
};

/**
* Konfigurace
* @namespace
* =============================================================================
*/

if (typeof vizus.cms.config != 'object')
	vizus.cms.config = {};

/**
* Prováděný kód
* =============================================================================
*/

// base
if (typeof vizus.cms.config.baseUrl != 'string')
	vizus.cms.config.baseUrl = vizus.page.getJsSrc(/^(.+?\/cms\/3\.0\/)(cms|web)(\.src)?\.js/, 1);
