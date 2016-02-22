/**
* Vizus Framework System JS Library
* (c) 2014 VIZUS.CZ s.r.o.
*
* TODO:
* vizus.Argument.min/max nelze pouzit pri, pokud typ muze byt string a number zaroven
* vizus.input.* - validatory nejsou prepsany
*
* Koncepce:
* - Funkce vs. metody - některé věci by bylo lepší řešit pomocí objektů, např. validátory, ale to by znamenalo zásadní změnu v místě použití.
* - Výkonné funkce vs. makro-funkce - makro funkce teď nekontrolují své parametry a spoléhají na kontrolu volané výkonné funkce, např. vizus.url.make vs. vizus.url.replace
* - Vnitřní vs. vnější volání - funkce nerozlišují, zda je volána z vnějšku nebo zevnitř, tudíž se některé kontroly provádějí opakovaně.
* - Místo volání a výjimky - výjimky nejsou vyvolávány na úrovní vnějšího rozhraní, ale uvnitř.
* - getClass/getType/getPrototypeName, getClasses/getTypes, isClassOf/isTypeOf
*/

// Kompatibilita se staršími prohlížeči
if (Array.prototype.indexOf == undefined)
{
	/**
	* Vyhledávání v poli.
	*
	* @function
	*/
	Array.prototype.indexOf = function(o)
	{
		for (var i = 0; i < this.length; i++)
		{
			if (this[i] === o)
				return i;
		}
		
		return -1;
	};
}

if (Array.prototype.isArray == undefined)
{
	/**
	* Detekce pole.
	*
	* @function
	*/
	Array.prototype.isArray = function(o)
	{
		return Object.prototype.toString.call(o) === '[object Array]';
	};
}

if (String.prototype.trim == undefined)
{
	/**
	* Odstranění whitespace kolem řetězce.
	*
	* @function
	*/
	String.prototype.trim = function()
	{
		return this.replace(/^\s+|\s+$/g, '');
	};
}

// referenci na head element nepodporuje -IE9
if (document.head == undefined)
	document.head = document.getElementsByTagName('HEAD')[0];

// IF8 fix pro video/audio elementy
document.createElement('video');
document.createElement('audio');
document.createElement('track');

/**
* Vizus FRAMEWORK
* @namespace
* =============================================================================
*/

if (vizus == undefined)
	var vizus = {};

/**
* Obecná chyba.
*
* @object
* @param {String} [message] Chybové sdělení
*/
vizus.Error = function(message)
{
	this.name = 'vizus.Error';
	this.message = message;
	
	if (vizus.config.debug)
		this.message += '\n' + vizus.debug.source(1) + '\n' + vizus.debug.backtrace(1);
};

vizus.Error.prototype = new Error;

/**
* Neplatná reference na objekt.
*
* @object
* @param {String} [message] Chybové sdělení
*/
vizus.ReferenceError = function(message)
{
	this.name = 'vizus.ReferenceError';
	this.message = message;

	if (vizus.config.debug)
		this.message += '\n' + vizus.debug.source(1) + '\n' + vizus.debug.backtrace(1);
};

vizus.ReferenceError.prototype = new ReferenceError;

/**
* Neplatný parametr funkce.
*
* @object
* @param {String} [message] Chybové sdělení
*/
vizus.ArgumentError = function(message)
{
	this.name = 'vizus.ArgumentError';
	this.message = message;

	if (vizus.config.debug)
		this.message += '\n' + vizus.debug.source(1) + '\n' + vizus.debug.backtrace(1);
};
			
vizus.ArgumentError.prototype = new Error;

/**
* Vrací textový název třídy objektu.
* Příklady: Undefined, Null, String, Number, Boolean, Array, Object, Date, RegExp, Function,
* HTMLDocument, HTMLBodyElement, HTMLAnchorElement, HTMLInputElement, HTMLTextAreaElement
*
* WebKit používá pro window objekt třídu "global", nikoliv "Window"
* Trident používá pro okna vytvořená přes window.open() třídu "Object", nikoliv "Window"
*
* @function
* @param {Object} object Testovaný objekt.
* @return {String} Vrací textový název třídy objektu.
* @tested
*/
vizus.getClass = function(object)
{
	var objectClass = Object.prototype.toString.call(object);

	switch (objectClass)
	{
		// FF + IE bez window.open
		case '[object Window]':
		// CH + OP + SF
		case '[object global]':
			return 'Window';
		// IE přes window.open
		case '[object Object]':
		{
			// IE8 fix
			if (typeof object == 'undefined')
				return 'Undefined';
			
			// Funguje pouze při testu ve stejném okně
			if (object instanceof Window)
				return 'Window';
			
			// Toto není 100% přesný test
			if (object === object.self)
				return 'Window';
		}
	}

	return objectClass.match(/object (\w+)/)[1];
};

/**
* Vrací pole textových názvů tříd, které objekt zdědil.
* Pozor, názvy tříd jsou hodně závislé na prohlížeči.
*
* @function
* @param {Object} object Testovaný objekt.
* @return {Array} Seznam tříd.
* @tested
* @example
* console.log(vizus.getClasses(window.document.body));
* // FF: ["HTMLBodyElement", "HTMLBodyElementPrototype", "HTMLElementPrototype", "ElementPrototype", "NodePrototype", "EventTargetPrototype", "Object"]
* // CH: ["HTMLBodyElement", "Object", "Object", "Object", "Object", "Object", "Object"]
* // IE: ["HTMLBodyElement", "HTMLBodyElementPrototype", "HTMLElementPrototype", "ElementPrototype", "NodePrototype", "Object"]
*/
vizus.getClasses = function(object)
{
	var classess = [Object.prototype.toString.call(object).match(/object (\w+)/)[1]];
	
	if (object.__proto__)
		classess = classess.concat(vizus.getClasses(object.__proto__));

	return classess;
};

/**
* Testuje, zdali je předaný objekt třídy requiredClass. Parametr requiredClass může být text, pole textů nebo regulární výraz.
*
* @function
* @param {Object} object Testovaný objekt.
* @param {String|Array|RegExp} requiredClass Požadovaná třída.
* @return {Boolean} Vrací true, pokud je object třídy requiredClass.
* @tested
*/
vizus.isClassOf = function(object, requiredClass)
{
	var objectClass = Object.prototype.toString.call(object).match(/object (\w+)/)[1];
	
	switch (objectClass)
	{
		// FF + IE bez window.open
		case 'Window':
		// CH + OP + SF
		case 'global':
			objectClass = 'Window';
		// IE přes window.open
		case 'Object':
		{
			// Funguje pouze při testu ve stejném okně
			if (object instanceof Window)
				objectClass = 'Window';
			// Toto není 100% test
			else if (object === object.self)
				objectClass = 'Window';
		}
	}

	switch (Object.prototype.toString.call(requiredClass))
	{
		case '[object String]':
			return requiredClass == objectClass;
		case '[object Array]':
			return requiredClass.indexOf(objectClass) != -1;
		case '[object RegExp]':
			return requiredClass.test(objectClass);
		default:
			return false;
	}
};

/**
* Kontroluje parametr funkce
*
* @constructor
* @param {Mixed} value Hodnota parametru
* @param {String} name Název parametru, např. "url"
* @tested
*/
vizus.Argument = function(value, name)
{
	if (typeof name != 'string' || name == '')
		throw new vizus.ArgumentError("Parametr 'name' musí obsahovat název parametru");
	
	this.argValue = value;
	this.argName = name;
	this.argClass = vizus.getClass(value);
};
	
/**
* Kontroluje typ parametru dle jeho třídy, např. String, Number, Null, RegExp, Window.
*
* @method
* @param {String|Array|RegExp} type Název třídy, seznam názvů tříd nebo regulární výraz.
* @return {Argument} Vrací instanci ArgumentValidator.
* @throw {ArgumentError} Parametr není platný.
* @tested
*/
vizus.Argument.prototype.type = function(type)
{
	switch (Object.prototype.toString.call(type))
	{
		case '[object String]':
		{
			if (type == this.argClass)
				return this;
			
			break;
		}
		case '[object Array]':
		{
			if (type.indexOf(this.argClass) != -1)
				return this;
			
			break;
		}
		case '[object RegExp]':
		{
			if (type.test(this.argClass))
				return this;
			
			break;
		}
		default:
			throw new vizus.ArgumentError("Neplatná hodnota 'type'");
	}

	throw new vizus.ArgumentError(vizus.text.format("Parametr '{0}' musí být typu {1}, ale je typu {2}", [this.argName, vizus.debug.dump(type), this.argClass]));
};

/**
* Kontroluje minimální délku řetězce, min. délku pole nebo min. hodnotu čísla.
*
* @method
* @param {Number} min Minimální hodnota nebo délka.
* @return {Argument} Vrací instanci ArgumentValidator.
* @throw {ArgumentError} Parametr není platný.
* @tested
*/
vizus.Argument.prototype.min = function(min)
{
	if (typeof min != 'number' || !isFinite(min))
		throw new vizus.ArgumentError("Neplatná hodnota 'min'");

	switch (this.argClass)
	{
		case 'String':
		{
			if (this.argValue.length >= min)
				return this;

			throw new vizus.ArgumentError(vizus.text.format("Parametr '{0}' musí být minimálně {1} {2} dlouhý, ale je {3}", [this.argName, min, vizus.text.plural(min, "znak", "znaky", "znaků"), this.argValue.length]));
		}
		case 'Array':
		{
			if (this.argValue.length >= min)
				return this;

			throw new vizus.ArgumentError(vizus.text.format("Parametr '{0}' musí mít minimálně {1} {2}, ale má {3}", [this.argName, min, vizus.text.plural(min, "prvek", "prvky", "prvků"), this.argValue.length]));
		}
		case 'Number':
		{
			if (isFinite(this.argValue) && this.argValue >= min)
				return this;

			throw new vizus.ArgumentError(vizus.text.format("Parametr '{0}' musí být číslo větší nebo rovno {1}, ale hodnota je {2}", [this.argName, min, this.argValue]));
		}
		default:
			return this;
	}
};

/**
* Kontroluje maximální délku řetězce, max. délku pole nebo max. hodnotu čísla.
*
* @method
* @param {Number} max Maximální hodnota nebo délka.
* @return {Argument} Vrací instanci ArgumentValidator.
* @throw {ArgumentError} Parametr není platný.
* @tested
*/
vizus.Argument.prototype.max = function(max)
{
	if (typeof max != 'number' || !isFinite(max))
		throw new vizus.ArgumentError("Neplatná hodnota max");
	
	switch (this.argClass)
	{
		case 'String':
		{
			if (this.argValue.length <= max)
				return this;

			throw new vizus.ArgumentError(vizus.text.format("Parametr '{0}' může být maximálně {1} {2} dlouhý, ale má {3}", [this.argName, max, vizus.text.plural(max, "znak", "znaky", "znaků"), this.argValue.length]));
		}
		case 'Array':
		{
			if (this.argValue.length <= max)
				return this;

			throw new vizus.ArgumentError(vizus.text.format("Parametr '{0}' může mít maximálně {1} {2}, ale má {3}", [this.argName, max, vizus.text.plural(max, "prvek", "prvky", "prvků"), this.argValue.length]));
		}
		case 'Number':
		{
			if (isFinite(this.argValue) && this.argValue <= max)
				return this;

			throw new vizus.ArgumentError(vizus.text.format("Parametr '{0}' musí být číslo menší nebo rovno {1}, ale hodnota je {2}", [this.argName, max, this.argValue]));
		}
		default:
			return this;
	}
};

/**
* Kontroluje platnou hodnotu parametru.
*
* @method
* @param {Mixed} valid Platná hodnota, seznam platných hodnot nebo regulární výraz.
* @return {Argument} Vrací instanci ArgumentValidator.
* @throw {ArgumentError} Parametr není platný.
* @tested
*/
vizus.Argument.prototype.valid = function(valid)
{
	switch (Object.prototype.toString.call(valid))
	{
		case '[object Array]':
		{
			if (valid.indexOf(this.argValue) != -1)
				return this;
			
			break;
		}
		case '[object RegExp]':
		{
			if (valid.test(this.argValue))
				return this;
			
			break;
		}
		case '[object Undefined]':
		{
			switch (this.argClass)
			{
				case 'Number':
				{
					if (isFinite(this.argValue))
						return this;
					
					break;
				}
				default:
					return this;
			}
			
			break;
		}
		default:
		{
			if (valid === this.argValue)
				return this;
			
			break;
		}
	}

	throw new vizus.ArgumentError(vizus.text.format("Parametr '{0}' musí mít hodnotu {1}, nikoliv {2}", [this.argName, vizus.debug.dump(valid), vizus.debug.dump(this.argValue)]));
};

/**
* Kontroluje neplatnou hodnotu parametru.
*
* @method
* @param {Mixed} invalid Neplatná hodnota, seznam neplatných hodnot nebo regulární výraz.
* @return {Argument} Vrací instanci ArgumentValidator.
* @throw {ArgumentError} Parametr není platný.
* @tested
*/
vizus.Argument.prototype.invalid = function(invalid)
{
	switch (Object.prototype.toString.call(invalid))
	{
		case '[object Array]':
		{
			if (invalid.indexOf(this.argValue) == -1)
				return this;
			
			break;
		}
		case '[object RegExp]':
		{
			if (!invalid.test(this.argValue))
				return this;
			
			break;
		}
		default:
		{
			if (invalid !== this.argValue)
				return this;
			
			break;
		}
	}

	throw new vizus.ArgumentError(vizus.text.format("Parametr '{0}' nesmí mít hodnotu {1}", [this.argName, vizus.debug.dump(invalid)]));
};

/**
* Vrací aktuální hodnotu nebo zadanou, pokud je aktuální hodnota undefined nebo null.
*
* @method
* @param {Mixed} value Výchozí hodnota.
* @return {Mixed} Vrací aktuální nebo výchozí hodnotu.
* @tested
*/
vizus.Argument.prototype.value = function(value)
{
	if (this.argValue === undefined || this.argValue === null)
		return value;
	else
		return this.argValue;
};

/**
* Ladící nástroje
* @namespace
* =============================================================================
*/

if (vizus.debug == undefined)
	vizus.debug = {};

/**
* Vrací textovou reprezentaci proměnné. Pokud je hotnota pole nebo objekt, jsou zpracovány i vnořené struktury
* do hlouby vizus.config.maxDebugDumpDepth a délky vizus.config.maxDebugDumpLength.
*
* @function
* @param {Mixed} value Hodnota.
* @param {Number} [depth] Hodnota zanoření, interní parametr.
* @return {String} Vrací textovou variantu hodnoty.
* @tested
*/
vizus.debug.dump = function(value, depth)
{
	if (typeof depth !== 'number')
		depth = 1;
	
	if (depth > vizus.config.maxDebugDumpDepth)
		return '...';
	
	switch (typeof value)
	{
		case 'undefined':
			return 'undefined';
		case 'string':
			return "'" + value.replace(/\'/, "\'") + "'"; // TODO - special chars
		case 'number':
			return value.toString();
		case 'boolean':
			return value ? 'true' : 'false';
		case 'object':
		{
			if (value === null)
				return 'null';
			
			var type = vizus.getClass(value);
			
			switch (type)
			{
				case 'Array':
				{
					var items = [];
					
					for (var i = 0; i < value.length && i < vizus.config.maxDebugDumpLength; i++)
						items.push(vizus.debug.dump(value[i], depth + 1));
					
					if (i + 1 == vizus.config.maxDebugDumpLength && value.length > vizus.config.maxDebugDumpLength)
						items.push('...');
					
					return '[' + items.join(', ') + ']';
				}
				case 'RegExp':
					return value.toString();
				case 'Date':
					return '<' + value.toString() + '>';
				case 'Object':
				{
					var items = [];
					var name = '';
					var i = 0;
					
					try
					{
						for (name in value)
						{
							if (value.hasOwnProperty(name))
							{
								items.push(name + ': ' + vizus.debug.dump(value[name], depth + 1));
								
								if (++i == vizus.config.maxDebugDumpLength)
								{
									if (value.length > vizus.config.maxDebugDumpLength)
										items.push('...');
									
									break;
								}
							}
						}
					}
					catch (e)
					{
						items.push('?');
					}
					
					return '{' + items.join(', ') + '}';
				}
				default:
					return '{object ' + type + '}';
			}
		}
		case 'function':
			return '<function>';
	}
};
	
/**
* Vrací zásobník volání. Položka zásobníku obsahuje tyto vlastnosti:
* - scope: místo volání
* - file: URL souboru místa volání
* - line: řádek místa volání
* - column: sloupec místa volání
* - name: název volané funkce
* - arguments: seznam parametrů volané funkce
*
* @function
* @return {Array} Pole s položkami zásobníku.
*/
vizus.debug.callstack = function()
{
	try
	{
		throw new Error();
	}
	catch (e)
	{
		if (!e.stack)
			return [];

		var stack = e.stack.split("\n");
		
		if (stack[0] == 'Error')
			stack.shift();

		stack.shift();

		if (stack[stack.length - 1] == '')
			stack.pop();

		var call = {};
		var caller = arguments && arguments.callee ? arguments.callee : null;
		
		for (var s = 0; s < stack.length; s++)
		{
			if ((found = stack[s].match(/^(\S+)@(.+?):(\d+)$/)))
				call = {scope: found[1], file: found[2], line: found[3], column: 0};
			else if ((found = stack[s].match(/^@(.+?):(\d+)$/)))
				call = {scope: 'global', file: found[1], line: found[2], column: 0};
			else if ((found = stack[s].match(/^\s*(?:at )?(\w+) \((.+?):(\d+):(\d+)\)$/)))
				call = {scope: found[1], file: found[2], line: found[3], column: found[4]};
			else if ((found = stack[s].match(/^\s*(?:at Global code |at )?\(?(.+?):(\d+):(\d+)\)?$/)))
				call = {scope: 'global', file: found[1], line: found[2], column: found[3]};
			else
			{
				console.log("Neznámý formát zásobníku: '" + stack[s] + "'");
				call = {scope: 'unknown', file: 'unknown', line: 0, column: 0};
			}
			
			call.name = '';
			call.arguments = [];

			if (caller && caller.arguments)
			{
				call.name = caller.name ? caller.name : (stack[s - 1] ? stack[s - 1].scope : 'unknown');
				
				for (var a = 0; a < caller.arguments.length; a++)
					call.arguments.push(caller.arguments[a]);
				
				if (caller.arguments.callee && caller.arguments.callee.caller)
					caller = caller.arguments.callee.caller;
				else
					caller = null;
			}
			
			stack[s] = call;
		}

		stack.shift();
		return stack;
	}
};

/**
* Vrací informace o volání.
*
* @function
* @return {String} Informace.
*/
vizus.debug.calling = function(offset)
{
	if (typeof offset !== 'number')
		offset = 0;
	
	var callstack = vizus.debug.callstack();
	var call = callstack[offset + 1] != undefined ? callstack[offset + 1] : null;
	var args = [];
	
	if (!call)
		return '';
	
	for (var a = 0; a < call.arguments.length; a++)
		args.push(vizus.debug.dump(call.arguments[a]));
		
	return 'Calling ' + call.name + '(' + args.join(', ') + ') at ' + call.file + ':' + call.line + ':' + call.column;
};

/**
* Vrací informace o zdrojovém místě v kódu.
*
* @function
* @return {String} Informace.
*/
vizus.debug.source = function(offset)
{
	if (typeof offset !== 'number')
		offset = 0;
	
	var callstack = vizus.debug.callstack();
	var call = callstack[offset] != undefined ? callstack[offset] : null;
	
	if (!call)
		return '';
	
	return 'Source ' + call.scope + ' at ' + call.file + ':' + call.line + ':' + call.column;
};

/**
* Vrací zpětný výpis zásobníku volání.
*
* @function
* @return {String} Výpis volání.
*/
vizus.debug.backtrace = function(offset)
{
	if (typeof offset !== 'number')
		offset = 0;

	var stack = vizus.debug.callstack();
	var trace = [];
	
	if (!stack)
		return '';
	
	for (var s = offset + 1; s < stack.length; s++)
	{
		if (stack[s] == undefined)
			break;
		
		var args = [];
		
		for (var a = 0; a < stack[s].arguments.length; a++)
			args.push(vizus.debug.dump(stack[s].arguments[a]));
		
		trace.push(stack[s].name + '(' + args.join(', ') + ') at ' + stack[s].file + ':' + stack[s].line + ':' + stack[s].column);
	}
	
	return 'Backtrace:\n ' + trace.join('\n ');
};

/**
* Zobrazí událost aplikace, např. chybu.
*
* @function
* @param {String} event HTML kód události
* @tested
*/
vizus.debug.showAppEvent = function(event)
{
	try
	{
		var events = vizus.dom.get('SystemEvents');
	}
	catch (e)
	{
		var events = document.createElement('div');
		events.id = 'SystemEvents';
		events.className = 'system-events';
		
		if (!document.body)
			document.write('<body></body>');

		document.body.appendChild(events);
		events.innerHTML = '<a href="javascript:vizus.debug.hideAppEvents()" class="hide"></a>';
	}
	
	events.innerHTML += event;
};

/**
* Skryje události aplikace, např. chybu.
*
* @function
* @tested
*/
vizus.debug.hideAppEvents = function()
{
	vizus.dom.hide('SystemEvents');
};

/**
* URL adresy
* @namespace
* =============================================================================
*/

if (vizus.url == undefined)
	vizus.url = {};

/**
* Opravuje URL z "www.neco.cz/?search=začátek" na "http://www.neco.cz/?search=za%C4%8D%C3%A1tek".
*
* @function
* @param {String} url URL adresa k opravení, např. "www.vizus.cz"
* @param {String} [protocol] Výchozí protokol, např. "http" nebo "ftp"
* @return {String} Vrací plnout URL adresu.
* @throw {ArgumentError} Parametr má neplatný typ nebo hodnotu.
* @throw {Error} URL nelze opravit.
* @tested
*/
vizus.url.fix = function(url, protocol)
{
	(new vizus.Argument(url, 'url')).type('String');
	protocol = (new vizus.Argument(protocol, 'protocol')).type(['String', 'Undefined', 'Null']).min(1).value('http');
	
	if (!url.match(/([a-z0-9]+:\/\/)?(([a-z0-9-]+\.){1,}[a-z]{2,})(\/?)([^ ]*)/i))
		throw new vizus.Error('URL nelze opravit');

	url = (RegExp.$1.length == 0 ? protocol + '://' : RegExp.$1) + RegExp.$2.toLowerCase() + '/' + RegExp.$5;
	
	if (url.indexOf('%') == -1)
		url = encodeURI(url);
	
	return url;
};

/**
* Přepisuje URL. Parametr component je objekt, který může mít následující vlastnosti:
* - protocol: string, výchozí je "", protokol, např. "http"
* - host: string, výchozí je "", hostitel, tedy doménové jmnéno, např. "www.vizus.cz"
* - port: string|number, výchozí je "", port, např. 8080
* - path: string, výchozí je "", cesta, např. "/index.php"
* - query: object, výchozí je {}, dataz, např. {pageId: 15, from: null}, hodnota může být typu string, number nebo null, která odstraní parametr
* - hash: string, výchozí je "", kotva, např. "top"
*
* Adresa je vrácena v zakódované podobě (%20 místo mezery).
*
* @function
* @param {String} url URL adresa, např. "http://www.vizus.cz/index.php?pageId=15&from=2#top"
* @param {Object} [components] Komponenty URL pro přepsání.
* @return {String} Vrací přepsanou URL adresu.
* @throw {ArgumentError} Parametr má neplatný typ nebo hodnotu.
* @tested
* @example
* var coponents = {protocol: "https", host: "www.vizus.cz", port: 8080, path: "/", query:{pageId: 30, from: null}, hash: ""};
* var url = vizus.url.replace("http://vizus.cz/index.php?pageId=15&from=20#top", components);
* url === "https://www.vizus.cz:8080/?pageId=30"
*/
vizus.url.replace = function(url, components)
{
	(new vizus.Argument(url, 'url')).type('String');
	components = (new vizus.Argument(components, 'components')).type(['Object', 'Undefined', 'Null']).value({});

	var parts = url.match(/^(?:(\w+):\/\/)?([\w\.-]+?)?(?::(\d+))?(\/.*?)?(?:\?(.*?))?(?:#(.*))?$/i) || [];
	var protocol = (new vizus.Argument(components.protocol, 'components.protocol')).type(['String', 'Undefined', 'Null']).value(parts[1] || '');
	var host = (new vizus.Argument(components.host, 'components.host')).type(['String', 'Undefined', 'Null']).value(parts[2] || '');
	var port = (new vizus.Argument(components.port, 'components.port')).type(['String', 'Number', 'Undefined', 'Null']).value(parts[3] || '').toString();
	var path = (new vizus.Argument(components.path, 'components.path')).type(['String', 'Undefined', 'Null']).value(decodeURI(parts[4] || ''));
	var query = decodeURI(parts[5] || '');
	var hash = (new vizus.Argument(components.hash, 'components.hash')).type(['String', 'Undefined', 'Null']).value(decodeURIComponent(parts[6] || ''));
	
	components.query = (new vizus.Argument(components.query, 'components.query')).type(['Object', 'Undefined', 'Null']).value({});

	var data = [];
	
	if (query != '')
	{
		query = query.split('&');
	
		for (var i = 0; i < query.length; i++)
		{
			var name_value = query[i].split('=');
			var name = decodeURIComponent(name_value[0]);
			var value = decodeURIComponent(name_value[1]);

			if (typeof(components.query[name]) == 'undefined')
				data.push(encodeURIComponent(name) + '=' + encodeURIComponent(value));
		}
	}

	for (var name in components.query)
	{
		if (components.query[name] !== null)
		{
			if (typeof(components.query[name]) != 'string' && typeof(components.query[name]) != 'number')
				throw new vizus.ArgumentError('Parametr components.query.' + name + ' musí být typu string, number nebo null');
			
			data.push(encodeURIComponent(name) + '=' + encodeURIComponent(components.query[name]));
		}
	}
	
	var url = '';
	
	if (protocol != '')
		url += protocol + '://';
	
	if (host != '')
		url += host;
	
	if (port != '' && port != '0')
		url += ':' + port;
	
	if (path != '')
		url += encodeURI(path);
	else if (host != '')
		url += '/';
	
	if (data.length > 0)
		url += '?' + data.join('&');
	
	if (hash != '')
		url += '#' + encodeURIComponent(hash);
	
	return url;
};

/**
* Vytváří URL. Parametr components je stejný, jako u funkce replace.
* Adresa je vrácena v zakódované podobě (%20 místo mezery).
*
* @function
* @param {Object} components Komponenty URL.
* @return {String} Vrací vytvořenou URL adresu.
* @throw {ArgumentError} Parametr má neplatný typ nebo hodnotu.
* @tested
*/
vizus.url.make = function(components)
{
	return vizus.url.replace('', components);
};

/**
* Sestaví URL.
* Adresa je vrácena v zakódované podobě (%20 místo mezery).
*
* @function
* @param {String} [protocol] protokol, např. "http"
* @param {String} [host] hostitel, tedy doménové jmnéno, např. "www.vizus.cz"
* @param {String|Number} [port] port, např. 8080
* @param {String} [path] cesta, např. "/index.php"
* @param {Object} [query] dataz, např. {pageId: 15, from: null}
* @param {String} [hash] kotva, např. "top"
* @return {String} Vrací sestavenou URL adresu.
* @throw {ArgumentError} Parametr má neplatný typ nebo hodnotu.
* @tested
*/
vizus.url.build = function(protocol, host, port, path, query, hash)
{
	return vizus.url.replace('', {protocol: protocol, host: host, port: port, path: path, query: query, hash: hash});
};

/**
* Vrací plnou URL z relativní.
*
* @function
* @param {String} url URL adresa, např. "/index.php"
* @param {Window} [context] Kontext URL, výchozí je objekt window.
* @return {String} Vrací plnou URL adresu.
* @throw {ArgumentError} Parametr má neplatný typ nebo hodnotu.
* @tested
*/
vizus.url.full = function(url, context)
{
	(new vizus.Argument(url, 'url')).type('String');
	context = (new vizus.Argument(context, 'context')).type(['Window', 'Undefined', 'Null']).value(window);

	var protocol = context.document.location.protocol;
	var host = context.document.location.host;
	var pathname = context.document.location.pathname;
	
	if (/^\w+:/.test(url))
		return url;
	else if (/^\/{2}/.test(url))
		return protocol + url;
	else if (/^\/{1}/.test(url))
		return protocol + '//' + host + url;
	else
		return protocol + '//' + host + pathname + url;
};

/**
* Texty
* @namespace
* =============================================================================
*/

if (vizus.text == undefined)
	vizus.text = {};

/**
* Konverzní mapa znaků s diakritikou na ASCI. Obsahuje znaky CS, SK, PL a DE.
*/
vizus.text.asciiMap =
[
	['A', /[\u00C1\u00C4\u0104]/g], // ÁÄĄ
	['C', /[\u010C\u0106]/g], // ČĆ
	['D', /[\u010E]/g], // Ď
	['E', /[\u00C9\u011A\u0118]/g], // ÉĚĘ
	['I', /[\u00CD]/g], // Í
	['L', /[\u0139\u013D\u0141]/g], // ĹĽŁ
	['N', /[\u0147\u0143]/g], // ŇŃ
	['O', /[\u00D3\u00D6]/g], // ÓÖ
	['R', /[\u0158]/g], // Ř
	['S', /[\u0160\u015A]/g], // ŠŚ
	['T', /[\u0164]/g], // Ť
	['U', /[\u00DA\u016E\u00DC]/g], // ÚŮÜ
	['Y', /[\u00DD]/g], // Ý
	['Z', /[\u017D\u0179\u017B]/g], // ŽŹŻ
	['a', /[\u00E1\u00E4\u0105]/g], // áäą
	['c', /[\u010D\u0107]/g], // čć
	['d', /[\u010F]/g], // ď
	['e', /[\u00E9\u011B\u0119]/g], // éěę
	['i', /[\u00ED]/g], // í
	['l', /[\u013A\u013E\u0142]/g], // ĺľł
	['n', /[\u0148\u0144]/g], // ňń
	['o', /[\u00F3\u00F6]/g], // óö
	['r', /[\u0159]/g], // ř
	['s', /[\u0161\u015B]/g], // šś
	['t', /[\u0165]/g], // ť
	['u', /[\u00FA\u016F\u00FC]/g], // úůü
	['y', /[\u00FD]/g], // ý
	['z', /[\u017E\u017A\u017C]/g] // žźż
];

/**
* Převede diakritické znaky na ne-diakritické. Převodní mapa podporuje latinku CS, SK, PL a DE.
*
* @function
* @param {String} text Text obsahující diaktiriku, např. "Žluťoučký kůň".
* @return {String} Vrací převedený text, např. "Zlutoucky kun".
* @throw {ArgumentError} Parametr má neplatný typ nebo hodnotu.
* @tested
*/
vizus.text.ascii = function(text)
{
	(new vizus.Argument(text, 'text')).type('String');
	var map = vizus.text.asciiMap;
	
	for (var i = 0; i < map.length; i++)
		text = text.replace(map[i][1], map[i][0]);
	
	return text;
};

/**
* Vrátí text case1 - case5 podle hodnoty čísla number podle českého skloňování.
*
* @function
* @param {Number} number Číslo pro skloňování
* @param {String} case1 Označení pro 1 položku
* @param {String} case2 Označení pro 2 - 4 položky
* @param {String} case5 Označení pro 5 a více položek nebo 0 položek
* @return {String} Vrací case1, case2 nebo case5.
* @tested
*/
vizus.text.plural = function(number, case1, case2, case5)
{
	if (number == 0)
		return case5;
	else if (number == 1)
		return case1;
	else if (number < 5)
		return case2;
	else
		return case5;
};

/**
* Formátuje text do podoby zprávy výměnou značek {1} za hodnoty z pole values.
* Hodnoty jsou číslovány od 0, tedy jako indexy pole values, a mohou být zpřeházeny.
*
* @function
* @param {String} text Text zprávy, např. "Nalezeno: {0} / {1}"
* @param {Array} values Hodnoty do zprávy, např. [25, 150]
* @return {String} Vrací formátovaný text, např. "Nalezeno: 25 / 150".
* @tested
*/
vizus.text.format = function(text, values)
{
	if (typeof text != 'string' || text == '')
		return '';
	
	if (typeof values != 'object' || !values)
		return text;

	var found = text.match(/\{(\d+)\}/g);
	
	if (found)
	{
		for (var i = 0; i < found.length; i++)
		{
			if (values[ found[i][1] ] != undefined)
				text = text.replace(new RegExp('\\{' + found[i][1] + '\\}', 'g'), values[ found[i][1] ]);
		}
	}
	
	return text;
};

/**
* Převede text na identifikátor.
*
* @function
* @param {String} text Text pro identifikátor, např. "Nadpis článku".
* @return {String} Vrací identifikátor, např. "nadpis-clanku".
* @throw {ArgumentError} Parametr má neplatný typ nebo hodnotu.
* @tested
*/
vizus.text.ident = function(text)
{
	return vizus.text.ascii(text).replace(/[^A-Za-z0-9]+/g, '-').replace(/^-|-$/g, '').replace(/-{2,}/g, '-').toLowerCase();
};

/**
* Vygeneruje heslo dle zadané síly strength:
* - 1 = 5 znaků, 1 číslo
* - 2 = 5 znaků, první velký, 3 čísla
* - 3 = 7 znaků, první velké, 4 čísla
*
* @function
* @param {Number} [strength] Síla hesla, 1 - 3, výchozí je 2.
* @return {String} Vygenerované heslo.
* @throw {ArgumentError} Parametr má neplatný typ nebo hodnotu.
* @tested
*/
vizus.text.password = function(strength)
{
	strength = (new vizus.Argument(strength, 'strength')).type(['Number', 'Undefined', 'Null']).valid([1, 2, 3, undefined, null]).value(2);
	
	var firstChars = 'BCDFGHJKLMNPQRSTVXZ';
	var oddChars = 'aeiou';
	var oddCharsMax = oddChars.length - 1;
	var evenChars = 'bcdfghjklmnpqrstvxz';
	var evenCharsMax = evenChars.length - 1;
	var letters = 1;
	var password = '';
	
	if (strength == 1)
		var prefix = 0, infix = 5, minNumber = 1, maxNumber = 9;
	else if (strength == 2)
		var prefix = 1, infix = 4, minNumber = 100, maxNumber = 999;
	else
		var prefix = 1, infix = 6, minNumber = 1000, maxNumber = 9999;
	
	if (prefix)
	{
		password = firstChars.substr(vizus.number.random(0, firstChars.length - 1), 1);
		letters = 2;
	}
	
	while (1)
	{
		if (letters <= prefix + infix)
		{
			if (letters % 2 == 0)
				password += oddChars.substr(vizus.number.random(0, oddCharsMax), 1);
			else
				password += evenChars.substr(vizus.number.random(0, evenCharsMax), 1);
		}
		else
		{
			password += vizus.number.random(minNumber, maxNumber).toString();
			break;
		}
		
		letters++;
	}
	
	return password;
};

/**
* Dešifruje text pomocí překladové tabulky a hesla.
*
* @function
* @param {String} text Zašifrovaný text.
* @param {String} [password] Heslo pro dešifrování o délce min. 5 znaků, výchozí je W8nkRZ57
* @return {String} Vrací dešifrovaný text.
* @throw {ArgumentError} Parametr má neplatný typ nebo hodnotu.
* @tested
*/
vizus.text.decrypt = function(text, password)
{
	(new vizus.Argument(text, 'text')).type('String');
	password = (new vizus.Argument(password, 'password')).type(['String', 'Undefined', 'Null']).min(5).value('W8nkRZ57');

	var pw = 0, ch, ix, i;
	var chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_.~%';
	var decrypted = '';
	
	for (i = 0; i < text.length; i++)
	{
		ch = text.charAt(i);
		ix = chars.indexOf(ch) - chars.indexOf(password.charAt(pw));
		
		if (++pw == password.length)
			pw = 0;
		
		if (ix < 0)
			ix += chars.length;
			
		decrypted += chars.charAt(ix);
	}		
	
	return decodeURIComponent(decrypted);
};

/**
* Doplní zadaný text vycpávkou padding na celkovou délku length. Pokud je length kladné číslo
* umístí vycpávku zleva, pokud záporné zprava.
*
* @function
* @param {String|Number} text Vstupní text.
* @param {Number} [length] Požadovaná celková délka textu včetně vycpávky.
* @param {String|Number} [padding] Vycpátka, pouze jeden znak.
* @return {String} Vrací text doplněný o vycpátku.
* @throw {ArgumentError} Parametr má neplatný typ nebo hodnotu.
* @tested
* @example
* vizus.text.pad(153, 5, 0) === "00153"
* vizus.text.pad(153, -5, 0) === "15300"
*/
vizus.text.pad = function(text, length, padding)
{
	text = (new vizus.Argument(text, 'text')).type(['String', 'Number']).value().toString();
	length = (new vizus.Argument(length, 'length')).type(['Number', 'Undefined', 'Null']).value(0);
	
	if (typeof padding == 'string')
		(new vizus.Argument(padding, 'padding')).type('String').min(1).max(1);
	else if (typeof padding == 'number')
		padding = (new vizus.Argument(padding, 'padding')).min(0).max(9).value().toString();
	else
		padding = ' ';
	
	var diff = Math.abs(length) - text.length;

	if (length == 0 || diff < 1)
		return text;
	else
	{
		var paddings = new Array(diff);
		
		for (var i = 0; i < diff; i++)
			paddings[i] = padding;
		
		if (length > 0)
			return paddings.join('') + text;
		else
			return text + paddings.join('');
	}
};

/**
* Čísla
* @namespace
* =============================================================================
*/

if (vizus.number == undefined)
	vizus.number = {};

/**
* Generuje náhodné číslo v rozsahu min - max, včetně.
*
* @function
* @param {Number} min Minimální hodnoda čísla, včetně.
* @param {Number} max Maximální hodnoda čísla, včetně.
* @return {Number} Vrací náhodné číslo.
* @throw {ArgumentError} Parametr má neplatný typ nebo hodnotu.
* @tested
*/
vizus.number.random = function(min, max)
{
	(new vizus.Argument(min, 'min')).type('Number').valid();
	(new vizus.Argument(max, 'max')).type('Number').valid().min(min);

	return Math.round(Math.random() * (max - min) + min);
};

/**
* Matematicky zaokrohlí číslo number na počet desetinných míst decimals.
*
* @function
* @param {Number} number Číslo k zaokrouhlení.
* @param {Number} [decimals] Počet desetinných míst, výchozí je 0.
* @return {Number} Vrací zaokrouhlené číslo.
* @throw {ArgumentError} Parametr má neplatný typ nebo hodnotu.
* @tested
*/
vizus.number.round = function(number, decimals)
{
	(new vizus.Argument(number, 'number')).type('Number').valid();
	decimals = (new vizus.Argument(decimals, 'decimals')).type(['Number', 'Undefined', 'Null']).valid().min(0).value(0);

	var pow = Math.pow(10, decimals);
	return Math.round(number * pow) / pow;
};

/**
* Formátuje číslo number na text s počtem desetinných míst decimals.
* Oddělovačem desetinné části je decimalPoint, oddělovačem tisíců thousandsSeparator.
*
* @function
* @param {Number} number Číslo ke zformátování.
* @param {Number} [decimals] Počet desetinných míst, výchozí je 0.
* @param {Number} [decimalPoint] Oddělovač desetinné části čísla, výchozí je čárka.
* @param {Number} [thousandsSeparator] Oddělovač tisíců čísla, výchozí je mezera.
* @return {String} Vrací zformátované číslo nebo prázdný řetězec, pokud parametr number není platné číslo.
* @throw {ArgumentError} Parametr má neplatný typ nebo hodnotu.
* @tested
*/
vizus.number.format = function(number, decimals, decimalPoint, thousandsSeparator)
{
	(new vizus.Argument(number, 'number')).type('Number').valid();
	decimals = (new vizus.Argument(decimals, 'decimals')).type(['Number', 'Undefined', 'Null']).valid().min(0).value(0);
	decimalPoint = (new vizus.Argument(decimalPoint, 'decimalPoint')).type(['String', 'Undefined', 'Null']).value(',');
	thousandsSeparator = (new vizus.Argument(thousandsSeparator, 'thousandsSeparator')).type(['String', 'Undefined', 'Null']).value(' ');

	var integerPart = '';
	var decimalPart = '';
	
	if (decimals > 0)
	{
		var pow = Math.pow(10, decimals);
		number = Math.round(number * pow) / pow;
		number = number.toString();
		var point = number.indexOf('.');
		
		if (point > -1)
		{
			integerPart = number.substr(0, point);
			decimalPart = number.substring(point + 1, point + 1 + decimals);
		}
		else
			integerPart = number;

		while (decimalPart.length < decimals)
			decimalPart += '0';
	}
	else
		integerPart = Math.round(number).toString();

	if (thousandsSeparator.length > 0 && integerPart.length > 3)
	{
		var groups = [];
		var mod = integerPart.length % 3;
		var max = Math.floor(integerPart.length / 3);
		
		if (mod > 0)
			groups[0] = integerPart.substr(0, mod);
		
		for (var i = 0; i < max; i++)
			groups.push(integerPart.substr(i * 3 + mod, 3));
		
		integerPart = groups.join(thousandsSeparator);
	}
	
	if (decimals > 0)
		return integerPart + decimalPoint + decimalPart;
	else
		return integerPart;
};

/**
* Testuje zda je zadané číslo validní dle určených pravidel.
*
* @function
* @param {String|Number} number Číslo ke kontrole nebo řetězec obsahující číslo.
* @param {Number} [decimals] Počet desetinných míst, výchozí je 0.
* @param {Boolean} [negative] Pokud je true, může být číslo záporné, jinak pouze kladné, výchozí je false.
* @param {Number} [min] Minimální povolená hodnota, vychozí je bez omezení.
* @param {Number} [max] Maximální povolená hodnota, vychozí je bez omezení.
* @param {Number} [multiplier] Násobitel, číslo musí být celočíselně delitelné násobitelem, výchozí je bez omezení.
* @return {Boolean} Vrací true, pokud je číslo validní dle pravidel.
* @throw {ArgumentError} Parametr má neplatný typ nebo hodnotu.
* @tested
*/
vizus.number.isValid = function(number, decimals, negative, min, max, multiplier)
{
	number = (new vizus.Argument(number, 'number')).type(['String', 'Number']).valid().value().toString();
	decimals = (new vizus.Argument(decimals, 'decimals')).type(['Number', 'Undefined', 'Null']).valid().min(0).value(0);
	negative = (new vizus.Argument(negative, 'negative')).type(['Boolean', 'Undefined', 'Null']).value(false);
	min = (new vizus.Argument(min, 'min')).type(['Number', 'Undefined', 'Null']).valid().value(null);
	max = (new vizus.Argument(max, 'max')).type(['Number', 'Undefined', 'Null']).valid().value(null);
	multiplier = (new vizus.Argument(multiplier, 'multiplier')).type(['Number', 'Undefined', 'Null']).invalid(0).value(null);
	
	var string = number.replace(/,/, '.').replace(/\s+/g, '');
	var regexp = new RegExp('^' + (negative ? '-?' : '') + '\\d+' + (decimals > 0 ? '(\\.\\d{1,' + decimals + '}|)' : '') + '$');

	if (!regexp.test(string))
		return false;

	number = parseFloat(string);

	if (!isFinite(number))
		return false;
	
	if (min !== null && number < min)
		return false;
	
	if (max !== null && number > max)
		return false;
	
	if (multiplier !== null && number % multiplier > 0)
		return false;

	return true;
};

/**
* Vrací celé číslo nebo výchozí hodnotu, pokud není number platným číslem.
* Odstraní všechny mezery.
*
* @function
* @param {String} number Celé číslo.
* @param {Number} [defaultValue] Výchozí hodnota, pokud number není číslo, výchozí je 0.
* @return {String} Vrací celé číslo nebo defaultValue.
* @throw {ArgumentError} Parametr má neplatný typ nebo hodnotu.
* @tested
*/
vizus.number.parseInt = function(number, defaultValue)
{
	(new vizus.Argument(number, 'number')).type('String');
	defaultValue = Math.round((new vizus.Argument(defaultValue, 'defaultValue')).type(['Number', 'Undefined', 'Null']).valid().value(0));

	number = number.replace(/^\s+|\s+$/g, '').replace(/ +/g, '');
	number = parseInt(number, 10);
	
	if (!isFinite(number))
		return defaultValue;
	else
		return number;
};

/**
* Vrací reálné číslo nebo výchozí hodnotu, pokud není number platným číslem.
* Odstraní všechny mezery a nahradí desetinnou čárku tečkou.
*
* @function
* @param {String} number Reálné číslo.
* @param {Number} [defaultValue] Výchozí hodnota, pokud number není číslo, výchozí je 0.0
* @return {String} Vrací reálné číslo nebo defaultValue.
* @throw {ArgumentError} Parametr má neplatný typ nebo hodnotu.
* @tested
*/
vizus.number.parseFloat = function(number, defaultValue)
{
	(new vizus.Argument(number, 'number')).type('String');
	defaultValue = (new vizus.Argument(defaultValue, 'defaultValue')).type(['Number', 'Undefined', 'Null']).valid().value(0.0);

	number = number.replace(/^\s+|\s+$/g, '').replace(/ +/g, '').replace(/,/, '.');
	number = parseFloat(number);
	
	if (!isFinite(number))
		return defaultValue;
	else
		return number;
};

/**
* Doplní zadané číslo nulami zleva na celkovou délku length.
*
* @function
* @param {Number|String} number Vstupní číslo.
* @param {Number} [length] Požadovaná celková délka čísla včetně nul.
* @return {String} Vrací číslo jako text doplněný o nuly.
* @throw {ArgumentError} Parametr má neplatný typ nebo hodnotu.
* @example
* vizus.number.pad(153, 5) === "00153"
*/
vizus.number.pad = function(number, length)
{
	number = (new vizus.Argument(number, 'number')).type(['Number', 'String']).valid().value().toString();
	length = (new vizus.Argument(length, 'length')).type(['Number', 'Undefined', 'Null']).value(0);
	
	var diff = length - number.length;

	if (length == 0 || diff < 1)
		return number;
	else
		return '00000000000000000000000000000000'.substr(0, diff) + number;
};

/**
* Události
* @namespace
* =============================================================================
*/

if (vizus.event == undefined)
	vizus.event = {};

/**
* Mapa kláves
*/
vizus.event.keys =
{
	keyEnter: 13,
	keyEsc: 27,
	keyPageUp: 33,
	keyPageDown: 34,
	keyInsert: 45,
	keyDelete: 46,
	keyHome: 36,
	keyEnd: 35,
	keyUp: 38,
	keyDown: 40,
	keyLeft: 37,
	keyRight: 39,
	keyBackspace: 8,
	keySpace: 32
};

/**
* Zastaví probublávání události ve všech prohlížečích.
* https://bugzilla.mozilla.org/show_bug.cgi?id=291082 - FFv21 stále chybuje
*
* @function
* @param {Event} [event] Událost z non-IE prohlížečů.
* @param {Window} [context] Kontext události, výchozí je objekt window.
* @tested
*/
vizus.event.stop = function(event, context)
{
	(new vizus.Argument(event, 'event')).type(/^(\w*Event|Undefined|Null)$/);
	context = (new vizus.Argument(context, 'context')).type(['Window', 'Undefined', 'Null']).value(window);

	if (event.cancelBubble != undefined)
		event.cancelBubble = true;
	
	if (event.cancel != undefined)
		event.cancel = true;

	if (typeof event.stopPropagation == 'function')
		event.stopPropagation();
	
	if (typeof event.stopImmediatePropagation == 'function')
		event.stopImmediatePropagation();
	
	if (typeof event.preventDefault == 'function')
		event.preventDefault();
	else if (context.event != undefined)
	{
		context.event.cancelBubble = true;
		context.event.returnValue = false;
	}
};

/**
* Vrací kód stisknuté klávesy po událostech keyup, keydown, keypress.
*
* @function
* @param {Event} [event] Událost z non-IE prohlížečů.
* @param {Window} [context] Kontext události, výchozí je objekt window.
* @return {Number} Vrací kód klávesy nebo 0.
* @tested
* @example
* // zavře okno při stiknutí klávesy Esc
* document.onkeydown = function(event) { if (vizus.event.keyCode(event) == vizus.event.keys.keyEsc) window.close(); };
*/
vizus.event.keyCode = function(event, context)
{
	(new vizus.Argument(event, 'event')).type(/^(\w*Event|Undefined|Null)$/);
	context = (new vizus.Argument(context, 'context')).type(['Window', 'Undefined', 'Null']).value(window);

	if (event != undefined && event.keyCode != undefined)
		return event.keyCode;
	else if (context.event != undefined && context.event.keyCode != undefined)
		return context.event.keyCode;
	else
		return 0;
};

/**
* Vrací znak stisknuté klávesy po události keypress.
*
* @function
* @param {Event} [event] Událost z non-IE prohlížečů.
* @param {Window} [context] Kontext události, výchozí je objekt window.
* @return {String} Vrací znak klávesy nebo ''.
* @tested
* @example
* // dovolí zadat pouze znaky A, B, C
* <input type="text" onkeypress="return ['A', 'B', 'C'].indexOf(vizus.event.keyChar(event)) < 0">
*/
vizus.event.keyChar = function(event, context)
{
	(new vizus.Argument(event, 'event')).type(/^(\w*Event|Undefined|Null)$/);
	context = (new vizus.Argument(context, 'context')).type(['Window', 'Undefined', 'Null']).value(window);

	if (event != undefined && event.which != undefined)
		return String.fromCharCode(event.which).toUpperCase();
	else if (event != undefined && event.charCode != undefined)
		return String.fromCharCode(event.charCode).toUpperCase();
	else if (context.event != undefined && context.event.keyCode != undefined)
		return String.fromCharCode(context.event.keyCode).toUpperCase();
	else
		return '';
};

/**
* Zastaví událost, pokud nejde o stisknutí znakové klávesy (onkeypress) a znak není vyjmenován v seznamu chars.
*
* @function
* @param {Event} event Událost z non-IE prohlížečů nebo null.
* @param {String} chars Seznam povolených znaků.
* @param {Window} [context] Kontext události, výchozí je objekt window.
* @tested
*/
vizus.event.onlyKeyChars = function(event, chars, context)
{
	(new vizus.Argument(chars, 'chars')).type('String').min(1);
	var ch = vizus.event.keyChar(event, context);
	
	if (ch.charCodeAt(0) > 0 && chars.indexOf(ch) < 0)
		vizus.event.stop(event, context);
};

/**
* Zastaví událost, pokud nejde o stisknutí znakové klávesy (onkeypress) a znak není čílo.
*
* @function
* @param {Event} event Událost z non-IE prohlížečů nebo null.
* @param {Window} [context] Kontext události, výchozí je objekt window.
*/
vizus.event.onlyKeyNumber = function(event, context)
{
	var ch = vizus.event.keyChar(event, context);
	
	if (ch.charCodeAt(0) > 0 && '0123456789'.indexOf(ch) < 0)
		vizus.event.stop(event, context);
};

/**
* Vrací obsah schránky uživatele při operaci copy/paste.
*
* @function
* @param {Event} [event] Událost z non-IE prohlížečů.
* @param {Window} [context] Kontext události, výchozí je objekt window.
* @return {String} Vrací obsah schránky nebo prázdný řetězec.
* @tested
*/
vizus.event.clipboard = function(event, context)
{
	(new vizus.Argument(event, 'event')).type(/^(\w*Event|Undefined|Null)$/);
	context = (new vizus.Argument(context, 'context')).type(['Window', 'Undefined', 'Null']).value(window);

	if (event != undefined && event.clipboardData != undefined && event.clipboardData.getData != undefined)
		return event.clipboardData.getData('text/plain');
	else if (context.clipboardData != undefined && context.clipboardData.getData != undefined)
		return context.clipboardData.getData('Text');
	else
		return '';
};

/**
* Okna
* @namespace
* =============================================================================
*/

if (vizus.window == undefined)
	vizus.window = {};

/**
* Vytvoří nové okno prohlížeče a vrátí jeho instanci. Pomocí width a height lze nastavit jeho rozměr.
* Parametr options může obsahovat dodatečná nastavení ve formě objektu:
* - left: number|null, výchozí je null, pozice okna zleva, null = vertikální vycentrování
* - top: number|null, výchozí je null, pozice okna zhora, null = horizontallní vycentrování
* - parent: object Window|null, výchozí je window, nadřazené okno pro centrování nebo null pro centrování dle monitoru
* - scrollbars: boolean|null, výchozí je true, true = okno má posuvníky (nepodporují všechny prohlížeče)
* - resizable: boolean|null, výchozí je true, true = okno může měnit rozměr (nepodporují všechny prohlížeče)
* - target: string, výchozí je _blank, cíl okna
*
* Přesný rozměr okna zvládne CH, OP a FF. IE má okno o 4px větší, SF vyšší.
*
* @function
* @param {String} [url] URL adresa okna.
* @param {Number} [width] Vnitřní šířka okna v pixelech, výchozí je 300 pixelů, minumum 100.
* @param {Number} [height] Vnitřní výška okna v pixelech, výchozí je 300 pixelů, minumum 100.
* @param {Object} [options] Dodatečná nastavení, výchozí je {left: null, top: null, parent: window, scrollbars: true, resizable: true, target: "_blank"}
* @param {Window} [context] Kontext, výchozí je objekt window.
* @return {String} Vrací instanci okna.
* @throw {ArgumentError} Parametr má neplatný typ nebo hodnotu.
* @tested
*/
vizus.window.create = function(url, width, height, options, context)
{
	url = (new vizus.Argument(url, 'url')).type(['String', 'Undefined', 'Null']).value('');
	width = (new vizus.Argument(width, 'width')).type(['Number', 'Undefined', 'Null']).min(100).value(300);
	height = (new vizus.Argument(height, 'height')).type(['Number', 'Undefined', 'Null']).min(100).value(300);
	context = (new vizus.Argument(context, 'context')).type(['Window', 'Undefined', 'Null']).value(window);
	
	if (options == undefined)
	{
		options =
		{
			left: Math.round(context.screen.availWidth / 2 - width / 2),
			top: Math.round(context.screen.availHeight / 2 - height / 2),
			parent: window,
			scrollbars: true,
			resizable: true,
			target: '_blank'
		};
	}
	else if (typeof options === 'object')
	{
		var viewport = {left: 0, top: 0, width: context.screen.availWidth, height: context.screen.availHeight};

		if (options.parent == undefined)
			options.parent = context;
		else
		{
			if (typeof options.parent !== 'object')
				throw new vizus.ArgumentError("Parametr 'options.parent' musí být typu object nebo undefined");
			
			if (options.parent.screenX != undefined && options.parent.screenY != undefined && options.parent.outerWidth != undefined && options.parent.outerHeight != undefined)
				viewport = {left: options.parent.screenX, top: options.parent.screenY, width: options.parent.outerWidth, height: options.parent.outerHeight};
		}

		options.left = (new vizus.Argument(options.left, 'options.left')).type(['Number', 'Undefined', 'Null']).min(0).value(Math.round(viewport.width / 2 - width / 2 + viewport.left));
		options.top = (new vizus.Argument(options.top, 'options.top')).type(['Number', 'Undefined', 'Null']).min(0).value(Math.round(viewport.height / 2 - height / 2 + viewport.top));
		options.scrollbars = (new vizus.Argument(options.scrollbars, 'options.scrollbars')).type(['Boolean', 'Undefined', 'Null']).value(true);
		options.resizable = (new vizus.Argument(options.resizable, 'options.resizable')).type(['Boolean', 'Undefined', 'Null']).value(true);
		options.target = (new vizus.Argument(options.target, 'options.target')).type(['String', 'Undefined', 'Null']).value('_blank');
	}
	else
		throw new vizus.ArgumentError("Parametr 'options' musí být typu object nebo undefined nebo null");
	
	var features = 'left=' + options.left + ', top=' + options.top + ', width=' + width + ', height=' + height + ', '
		+ 'channelmode=no, directories=no, fullscreen=no, menubar=no, resizable=' + (options.resizable ? 'yes' : 'no') + ', '
		+ 'scrollbars=' + (options.scrollbars ? 'yes' : 'no') + ', status=no, toolbar=no';
	
	var win = options.parent.open(url, options.target, features);
	
	if (!win)
	{
		alert('Vyskakovací okno bylo zablokováno prohlížečem.');
		return null;
	}
	
	// FF fix
	try
	{
		win.innerWidth = width;
		win.innerHeight = height;
	}
	catch (e)
	{
		// IE fix
	}

	return win;
};

/**
* Otevře nové okno prohlížeče. Parametry jsou stejné, jako u funkce create.
* Oproti funkci create funkce open nevrací instancí, tudíž lze použít v odkazech.
*
* @function
* @param {String} url URL adresa okna.
* @param {Number} [width] Vnitřní šířka okna v pixelech, výchozí je 300 pixelů, minumum 50.
* @param {Number} [height] Vnitřní výška okna v pixelech, výchozí je 300 pixelů, minumum 50.
* @param {Object} [options] Dodatečná nastavení, výchozí je {left: null, top: null, parent: window, scrollbars: true, resizable: true, target: "_blank"}
* @param {Window} [context] Kontext, výchozí je objekt window.
* @throw {ArgumentError} Parametr má neplatný typ nebo hodnotu.
* @tested
*/
vizus.window.open = function(url, width, height, options, context)
{
	vizus.window.create(url, width, height, options, context);
};

/**
* Změní pozici okna win na střed nadřazeného okna context nebo na střed plochy uživatele, pokud není context zadán.
*
* @function
* @param {Window} [win] Objekt okna.
* @param {Window} [context] Kontext, výchozí je objekt window.
* @return {Boolean} Vrací true v případě úspěchu, jinak false.
* @throw {ArgumentError} Parametr má neplatný typ nebo hodnotu.
* @tested
*/
vizus.window.centre = function(win, context)
{
	win = (new vizus.Argument(win, 'win')).type(['Window', 'Undefined', 'Null']).value(window);
	context = (new vizus.Argument(context, 'context')).type(['Window', 'Undefined', 'Null']).value(null);

	if (!(win.outerWidth != undefined && win.outerHeight != undefined && win.moveTo != undefined))
		return false;
	
	if (context != undefined && context.screenX != undefined && context.screenY != undefined && context.innerWidth != undefined && context.innerHeight != undefined)
	{
		var x = Math.round(context.screenX + context.innerWidth / 2 - win.outerWidth / 2);
		var y = Math.round(context.screenY + context.innerHeight / 2 - win.outerHeight / 2);
	}
	else
	{
		var x = Math.round(win.screen.availWidth / 2 - win.outerWidth / 2);
		var y = Math.round(win.screen.availHeight / 2 - win.outerHeight / 2);
	}
	
	win.moveTo(x, y);
	
	return true;
};

/**
* Stránky
* @namespace
* =============================================================================
*/

if (vizus.page == undefined)
	vizus.page = {};

/**
* Přesměruje aktuální stránku na zadanou URL. URL může být zadána jako řetězec nebo objekt pro funkci vizus.url.replace.
*
* @function
* @param {String|Object} url URL adresa nebo objekt pro vizus.url.replace
* @param {Window} [context] Kontext, výchozí je objekt window.
* @throw {ArgumentError} Parametr má neplatný typ nebo hodnotu.
* @tested
* @example
* // Změna query stringu aktuální URL
* vizus.page.redirect("?pageId=15");
*
* // Změna cesty a query stringu aktuální URL
* vizus.page.redirect("/index.php?pageId=15");
*
* // Nová URL
* vizus.page.redirect("http://www.vizus.cz/index.php?pageId=15");
*
* // Změna protokolu a query stringu
* vizus.page.redirect({protocol: "https", query: {pageId: 15, from: null}});
*/
vizus.page.redirect = function(url, context)
{
	(new vizus.Argument(url, 'url')).type(['String', 'Object']);
	context = (new vizus.Argument(context, 'context')).type(['Window', 'Undefined', 'Null']).value(window);
	
	if (typeof url !== 'string')
		url = vizus.url.replace(context.document.location.toString(), url);
	
	context.document.location = url;
};

/**
* Znovunačtení stránky.
*
* @function
* @param {Window} [context] Kontext, výchozí je objekt window.
* @throw {ArgumentError} Parametr má neplatný typ nebo hodnotu.
* @tested
*/
vizus.page.reload = function(context)
{
	context = (new vizus.Argument(context, 'context')).type(['Window', 'Undefined', 'Null']).value(window);
	context.document.location.reload();
};

/**
* Přidání volání po stavu DOMContentLoaded, podobně jako $(document).ready()
*
* @function
* @param {Function} callback Zpětné volání
* @param {Window} [context] Kontext, výchozí je objekt window.
* @throw {ArgumentError} Parametr má neplatný typ nebo hodnotu.
* @tested
* @example
* vizus.page.ready(function(){alert("Stránka je načtena")});
* vizus.page.ready(function(){alert("Stránka je opravdu načtena")});
*/
vizus.page.ready = function(callback, context)
{
	(new vizus.Argument(callback, 'callback')).type('Function');
	context = (new vizus.Argument(context, 'context')).type(['Window', 'Undefined', 'Null']).value(window);
	
	if (context.jQuery != undefined)
	{
		context.jQuery(context.document).ready(callback);
		return;
	}

	if (context.vizus == undefined)
		context.vizus = {page: {readyCallbacks: []}};
	else if (context.vizus.page == undefined)
		context.vizus.page = {readyCallbacks: []};
	else if (context.vizus.page.readyCallbacks == undefined)
		context.vizus.page.readyCallbacks = [];
	
	context.vizus.page.readyCallbacks.push(callback);

	if (context.vizus.page.readyCallbacks.length == 1)
	{
		var called = false;
	
		function onReady()
		{ 
			if (!called)
			{
				called = true;

				for (var i = 0; i < context.vizus.page.readyCallbacks.length; i++)
					context.vizus.page.readyCallbacks[i]();
			}
		}
	
		if (context.document.addEventListener != undefined)
			context.document.addEventListener('DOMContentLoaded', onReady, false);
		else if (context.document.attachEvent != undefined)
		{
			if (context.document.documentElement.doScroll != undefined && context.frameElement == undefined)
			{
				function scroll()
				{
					if (called)
						return;
					
					try
					{
						context.document.documentElement.doScroll('left');
						onReady();
					}
					catch(e)
					{
						context.setTimeout(scroll, 10);
					}
				}
				
				scroll();
			}
			
			context.document.attachEvent('onreadystatechange', function()
			{
				if (context.document.readyState === 'complete')
					onReady();
			});
		}
	
		if (context.addEventListener != undefined)
			context.addEventListener('load', onReady, false);
		else if (context.attachEvent != undefined)
			context.attachEvent('onload', onReady);
		else if (context.onload != null)
		{
			var onLoad = context.onload;
			context.onload = function()
			{
				onLoad();
				onReady();
			};
		}
		else
			context.onload = onReady;
	}
};

/**
* Zapíše do stránky chráněný odkaz. Adresu a název odkazu nejprve dešifruje.
*
* @function
* @param {String} href Zašifrovaná adresa.
* @param {String} name Název odkazu.
* @throw {ArgumentError} Parametr má neplatný typ nebo hodnotu.
* @example
*/
vizus.page.writeProtectedLink = function(href, name, context)
{
	context = (new vizus.Argument(context, 'context')).type(['Window', 'Undefined', 'Null']).value(window);
	context.document.write('<a href="' + vizus.text.decrypt(href) + '">' + vizus.text.decrypt(name) + '</a>');
};

/**
* Přidá do stránky další JS. Po načtení zavolá callback, pokud je zadán.
* Pokud je zadaná url již načtena, nenačítá se znovu.
*
* @function
* @param {String|Array} urls URL adresa nebo adresy JS souboru.
* @param {Function} [callback] Funkce zavolaná po načtení.
* @param {Window} [context] Kontext, výchozí je objekt window.
* @throw {ArgumentError} Parametr má neplatný typ nebo hodnotu.
* @tested
*/
vizus.page.addJs = function(urls, callback, context)
{
	(new vizus.Argument(urls, 'urls')).type(['String', 'Array']).min(1);
	(new vizus.Argument(callback, 'callback')).type(['Function', 'Undefined', 'Null']);
	context = (new vizus.Argument(context, 'context')).type(['Window', 'Undefined', 'Null']).value(window);
	
	if (typeof urls == 'string')
		urls = [urls];

	var scripts = context.document.getElementsByTagName('SCRIPT');
	var loaded = 0;
	var number = urls.length;
	
	function callbacks()
	{
		if (++loaded == number)
			callback();
	}

	function makeOnreadystatechange(script)
	{
		return function()
		{
			if (script.readyState == 'loaded' || script.readyState == 'complete')
			{
				script.onreadystatechange = null;
				script.vizusPageAddJsLoaded = true;
				callbacks();
			}
		}
	}
	
	function makeOnload(script)
	{
		return function()
		{
			script.vizusPageAddJsLoaded = true;
			callbacks();
		};
	}
	
	function makeOntimeout(script)
	{
		var handler = function()
		{
			if (script.vizusPageAddJsLoaded === false)
				context.setTimeout(handler, 50);
			else
				callbacks();
		};
		
		return handler;
	}

	forscripts:
	for (var u = 0; u < urls.length; u++)
	{
		var url = urls[u];
		var furl = vizus.url.full(url);
	
		for (var i = 0; i < scripts.length; i++)
		{
			if (scripts[i].src == furl)
			{
				if (callback)
				{
					if (scripts[i].vizusPageAddJsLoaded === false)
						context.setTimeout(makeOntimeout(scripts[i]), 50);
					else
						callbacks();
				}
					
				continue forscripts;
			}
		}
		
		var script = context.document.createElement('SCRIPT');
		script.type = 'text/javascript';
		script.vizusPageAddJsLoaded = false;
	
		if (callback)
		{
			if (script.readyState)
				script.onreadystatechange = makeOnreadystatechange(script);
			else
				script.onload = makeOnload(script);
		}
	
		script.src = url;
		context.document.body.appendChild(script);
	}
};

/**
* Přidá do stránky další CSS. Po načtení zavolá callback, pokud je zadán.
* Pokud je zadaná url již načtena, nenačítá se znovu.
*
* @function
* @param {String|Array} urls URL adresa nebo adresy CSS souboru.
* @param {Function} [callback] Funkce zavolaná po načtení.
* @param {Window} [context] Kontext, výchozí je objekt window.
* @throw {ArgumentError} Parametr má neplatný typ nebo hodnotu.
* @tested
*/
vizus.page.addCss = function(urls, callback, context)
{
	(new vizus.Argument(urls, 'urls')).type(['String', 'Array']).min(1);
	(new vizus.Argument(callback, 'callback')).type(['Function', 'Undefined', 'Null']);
	context = (new vizus.Argument(context, 'context')).type(['Window', 'Undefined', 'Null']).value(window);
	
	if (typeof urls == 'string')
		urls = [urls];
	
	var links = context.document.getElementsByTagName('LINK');
	var loaded = 0;
	var number = urls.length;
	
	function callbacks()
	{
		if (++loaded == number)
			callback();
	}

	function makeOnreadystatechange(link)
	{
		return function()
		{
			if (link.readyState == 'loaded' || link.readyState == 'complete')
			{
				link.onreadystatechange = null;
				link.vizusPageAddCssLoaded = true;
				callbacks();
			}
		}
	}
	
	function makeOnload(link)
	{
		return function()
		{
			link.vizusPageAddCssLoaded = true;
			callbacks();
		};
	}
	
	function makeOntimeout(link)
	{
		var handler = function()
		{
			if (link.vizusPageAddCssLoaded === false)
				context.setTimeout(handler, 50);
			else
				callbacks();
		};
		
		return handler;
	}
	
	forlinks:
	for (var u = 0; u < urls.length; u++)
	{
		var url = urls[u];
		var furl = vizus.url.full(url);
		
		for (var i = 0; i < links.length; i++)
		{
			if (links[i].href == furl)
			{
				if (callback)
				{
					if (links[i].vizusPageAddCssLoaded === false)
						context.setTimeout(makeOntimeout(links[i]), 50);
					else
						callbacks();
				}
					
				continue forlinks;
			}
		}
		
		var link = context.document.createElement('LINK');
		link.type = 'text/css';
		link.rel = 'stylesheet';
		link.vizusPageAddCssLoaded = false;
	
		if (callback)
		{
			if (link.readyState)
				link.onreadystatechange = makeOnreadystatechange(link);
			else
				link.onload = makeOnload(link);
		}
	
		link.href = url;
		context.document.head.appendChild(link);
	}
};

/**
* Vrací URL JS souboru ve stránce, tedy obsah src atributu, pokud se shoduje se zadaným regulárním výrazem.
* Pokud je zadán submach, je vrácena shoda dle zadaného indexu pod-shody.
*
* @function
* @param {RegExp} pattern Regulární výraz testující shodu s atributem src.
* @param {Number} [submatch] Index pod-shody, která má být vrácena.
* @return {String} Vrací obsah atributu src, zadanou pod-shodu nebo null.
*/
vizus.page.getJsSrc = function(pattern, submatch)
{
	(new vizus.Argument(pattern, 'pattern')).type('RegExp');
	submatch = (new vizus.Argument(submatch, 'submatch')).type(['Number', 'Undefined', 'Null']).min(0).max(99).value(null);

	var scripts = document.getElementsByTagName('script');
	
	for (var i = 0; i < scripts.length; i++)
	{
		var found = scripts[i].src.match(pattern);
		
		if (found)
		{
			if (submatch !== null && found[submatch] != undefined)
				return found[submatch];
			else
				return scripts[i].src;
		}
	}
	
	return null;
};

/*
* DOM
* @namespace
* =============================================================================
*/

if (vizus.dom == undefined)
	vizus.dom = {};

/**
* Vrací true, pokud je zadaný element objekt třídy HTMLElement, tedy HTML tag, případně i konkrétního typu type.
*
* @function
* @param {Object} element Testovaný element
* @param {String|Array|RegExp} type Typ tagu, např. "INPUT" nebo ["P", "DIV"] nebo /[U|O]L/
* @return {Boolean} Vrací true v případě úspěchu, jinak false
* @tested
*/
vizus.dom.isTag = function(element, type)
{
	var tag = Object.prototype.toString.call(element).match(/object HTML\w+Element/);
	
	if (!tag || element.tagName == undefined)
		return false;
	
	tag = element.tagName.toUpperCase();
	
	switch (Object.prototype.toString.call(type))
	{
		case '[object Undefined]':
		case '[object Null]':
			return true;
		case '[object String]':
			return type == tag;
		case '[object Array]':
			return type.indexOf(tag) != -1;
		case '[object RegExp]':
			return type.test(tag);
		default:
			return false;
	}
};

/**
* Vrací HTML element předaný jako objekt element nebo zadaný jako HTML id. Zkontroluje, zda je platným elementem,
* případně zda odpovída typ HTML tagu. Pokud není 
*
* @function
* @param {String|HTMLElement} element Objekt HTML elementu nebo HTML id.
* @param {String} [tag] Typ HTML tagu, např. "INPUT".
* @param {Window} [context] Kontext, výchozí je objekt window.
* @return {HTMLElement} Objekt HTML element.
* @throw {ArgumentError} Parametr má neplatný typ nebo hodnotu.
* @throw {ReferenceError} Element nebyl nalezen.
* @tested
* @example
* var input = vizus.dom.get("Name");
*/
vizus.dom.get = function(element, tag, context)
{
	(new vizus.Argument(element, 'element')).type(/^(String|HTML\w+Element)$/);
	(new vizus.Argument(tag, 'tag')).type(['String', 'Array', 'RegExp', 'Undefined', 'Null']);
	context = (new vizus.Argument(context, 'context')).type(['Window', 'Undefined', 'Null']).value(window);

	if (typeof element === 'string')
	{
		var elm = context.document.getElementById(element);

		if (!vizus.dom.isTag(elm, tag))
			throw new vizus.ReferenceError("Element s ID '" + element + "' nebyl nalezen");
		
		return elm;
	}
	else if (!vizus.dom.isTag(element, tag))
		throw new vizus.ReferenceError("Element není typu " + vizus.debug.dump(tag));

	return element;
};

/**
* Přidá HTML elementu CSS třídu name.
*
* @function
* @param {HTMLElement|String} element HTML element nebo jeho ID.
* @param {String} name Přidávaná CSS třída nebo třídy.
* @throw {ArgumentError} Parametr má neplatný typ nebo hodnotu.
* @throw {ReferenceError} Element nebyl nalezen.
* @tested
* @example
* vizus.dom.addClass("Amount", "error number");
*/
vizus.dom.addClass = function(element, name)
{
	element = vizus.dom.get(element);
	(new vizus.Argument(name, 'name')).type('String').min(1);
	
	if (typeof element.className !== 'string')
		return;
	
	var names = name.trim().split(/\s+/);
	
	if (element.className === '')
		element.className = names.join(' ');
	else
	{
		var current = element.className.trim().split(/\s+/);
		var add = [];
		
		for (var i = 0; i < names.length; i++)
		{
			if (current.indexOf(names[i]) < 0)
				add.push(names[i]);
		}
			
		if (add.length > 0)
			element.className = current.join(' ') + ' ' + add.join(' ');
	}
};

/**
* Odebere HTML elementu CSS třídu name.
*
* @function
* @param {HTMLElement|String} element HTML element nebo jeho ID.
* @param {String} name Odebíraná CSS třída nebo třídy.
* @throw {ArgumentError} Parametr má neplatný typ nebo hodnotu.
* @throw {ReferenceError} Element nebyl nalezen.
* @tested
*/
vizus.dom.removeClass = function(element, name)
{
	element = vizus.dom.get(element);
	(new vizus.Argument(name, 'name')).type('String').min(1);
	
	if (typeof element.className !== 'string' || element.className === '')
		return;
	
	var names = name.trim().split(/\s+/);
	var current = element.className.trim().split(/\s+/);
	var stay = [];
	
	for (var i = 0; i < current.length; i++)
	{
		if (names.indexOf(current[i]) < 0)
			stay.push(current[i]);
	}
		
	var className = stay.join(' ');
	
	if (className != element.className)
		element.className = className;
};

/**
* Skryje element.
* Pokud je nastaven disable režim, zakáže elementy INPUT, TEXTAREA a SELECT
* Pokud je nastaven režim unset, vyprázdní hodnotu elementů INPUT, TEXTAREA a SELECT.
* Pokud je nastaven recursive režim, skryje i podřízené elementy.
*
* @function
* @param {HTMLElement|String} element HTML element nebo jeho ID.
* @param {Boolean} [disable] Zakáže elementy formuláře, výchozí je false.
* @param {Boolean} [unset] Vyprázdní hodnoty elementů formuláře, výchozí je false.
* @param {Boolean} [recursive] Skryje podřízené elementy, výchozí je true.
* @throw {ArgumentError} Parametr má neplatný typ nebo hodnotu.
* @throw {ReferenceError} Element nebyl nalezen.
*/
vizus.dom.hide = function(element, disable, unset, recursive, inner)
{
	element = vizus.dom.get(element);
	disable = (new vizus.Argument(disable, 'disable')).type(['Boolean', 'Undefined', 'Null']).value(false);
	unset = (new vizus.Argument(unset, 'unset')).type(['Boolean', 'Undefined', 'Null']).value(false);
	recursive = (new vizus.Argument(recursive, 'recursive')).type(['Boolean', 'Undefined', 'Null']).value(true);
	inner = (new vizus.Argument(inner, 'inner')).type(['Boolean', 'Undefined', 'Null']).value(false);
	
	if (recursive && element.children != undefined && element.children.length > 0)
	{
		for (var i = 0; i < element.children.length; i++)
		{
			if (element.children[i].children)
				vizus.dom.hide(element.children[i], disable, unset, recursive, true);
		}
	}
	
	if (!inner && typeof element.style == 'object')
		element.style.display = 'none';
	
	if (element.tagName == 'INPUT' || element.tagName == 'TEXTAREA' || element.tagName == 'SELECT')
	{
		if (disable)
			element.disabled = true;
			
		if (unset)
		{
			element.vizusDomHideValue = element.value.toString();
			element.value = '';
		}
	}
};

/**
* Zobrazí element.
* Pokud je nastaven enable režim, povolí elementy INPUT, TEXTAREA a SELECT
* Pokud je nastaven restore režim, obnoví hodnoty elementů INPUT, TEXTAREA a SELECT
* Pokud je nastaven recursive režim, zobrazí i podřízené elementy.
*
* @function
* @param {HTMLElement|String} element HTML element nebo jeho ID.
* @param {Boolean} [enable] Povolí elementy formuláře, výchozí je false.
* @param {Boolean} [enable] Obnoví hodnotu elementů formuláře, výchozí je false.
* @param {Boolean} [recursive] Zobrazí podřízené elementy, výchozí je true.
* @throw {ArgumentError} Parametr má neplatný typ nebo hodnotu.
* @throw {ReferenceError} Element nebyl nalezen.
*/
vizus.dom.show = function(element, enable, restore, recursive, inner)
{
	element = vizus.dom.get(element);
	enable = (new vizus.Argument(enable, 'enable')).type(['Boolean', 'Undefined', 'Null']).value(false);
	restore = (new vizus.Argument(restore, 'restore')).type(['Boolean', 'Undefined', 'Null']).value(false);
	recursive = (new vizus.Argument(recursive, 'recursive')).type(['Boolean', 'Undefined', 'Null']).value(true);
	inner = (new vizus.Argument(inner, 'inner')).type(['Boolean', 'Undefined', 'Null']).value(false);
	
	if (recursive && element.children != undefined && element.children.length > 0)
	{
		for (var i = 0; i < element.children.length; i++)
		{
			if (element.children[i].children)
				vizus.dom.show(element.children[i], enable, restore, recursive, true);
		}
	}

	if (!inner && typeof element.style == 'object')
		element.style.display = '';
	
	if (element.tagName == 'INPUT' || element.tagName == 'TEXTAREA' || element.tagName == 'SELECT')
	{
		if (enable)
			element.disabled = false;
		
		if (restore && element.vizusDomHideValue != undefined)
		{
			element.value = element.vizusDomHideValue;
			element.vizusDomHideValue = undefined;
		}
	}
};

/**
* Přidá element do DOMu.
*
* @function
* @param {HTMLElement|String} element HTML element nebo jeho ID.
* @param {HTMLElement|String} parent HTML element nebo jeho ID.
* @return {HTMLElement} Vrací přidaný HTML element.
* @throw {ArgumentError} Parametr má neplatný typ nebo hodnotu.
* @throw {ReferenceError} Element nebyl nalezen.
* @tested
*/
vizus.dom.add = function(element, parent)
{
	element = vizus.dom.get(element);
	parent = vizus.dom.get(parent);
	parent.insertBefore(element, null);
	
	return element;
};

/**
* Odebere HTML element z DOMu.
*
* @function
* @param {HTMLElement|String} element HTML element nebo jeho ID.
* @return {HTMLElement} Vrací odebraný HTML element.
* @throw {ArgumentError} Parametr má neplatný typ nebo hodnotu.
* @throw {ReferenceError} Element nebyl nalezen.
* @tested
*/
vizus.dom.remove = function(element)
{
	element = vizus.dom.get(element);
	element.parentNode.removeChild(element);
	
	return element;
};

/**
* Přesune HTML element relativně v kolekci rodiče o shift pozic. Kladná čísla jsou dopředu, záporná dozadu.
* Funkce přeskakuje textové uzly a komentáře.
*
* @function
* @param {HTMLElement|String} element HTML element nebo jeho ID.
* @param {Numeric} shift Relativní posun v kolekci o N prvků.
* @return {HTMLElement} Vrací přesunutý HTML element.
* @throw {ArgumentError} Parametr má neplatný typ nebo hodnotu.
* @throw {ReferenceError} Element nebyl nalezen.
* @tested
*/
vizus.dom.moveBy = function(element, shift)
{
	element = vizus.dom.get(element);
	(new vizus.Argument(shift, 'shift')).type('Number');

	var parent = element.parentNode;
	var index = Array.prototype.indexOf.call(parent.childNodes, element);
	
	if (shift > 0)
	{
		shift++;
		
		var node = element;
		var counter = 0;
		
		while (counter < shift && (node = node.nextSibling))
		{
			if (node.nodeType == 1)
				counter++;
		}
		
		parent.insertBefore(element, node);
	}
	else if (shift < 0)
	{
		var node = element;
		var counter = 0;
		
		while (counter > shift && node.previousSibling)
		{
			node = node.previousSibling;
			
			if (node.nodeType == 1)
				counter--;
		}
		
		parent.insertBefore(element, node);
	}
	
	return element;
};

/**
* Přesune HTML element absolutně v kolekci ridiče na pozici position.
* První pozice má číslo 0. Záporná čísla jsou pozice od zadu, kdy -1 je poslední pozice, -2 předposlední.
* Funkce přeskakuje textové uzly a komentáře.
*
* @function
* @param {HTMLElement|String} element HTML element nebo jeho ID.
* @param {Numeric} position Absolutní pozice v kolekci počínaje 0 nebo záporné číslo pro pozici od zadu.
* @return {HTMLElement} Vrací přesunutý HTML element.
* @throw {ArgumentError} Parametr má neplatný typ nebo hodnotu.
* @throw {ReferenceError} Element nebyl nalezen.
* @tested
*/
vizus.dom.moveTo = function(element, position)
{
	element = vizus.dom.get(element);
	(new vizus.Argument(position, 'position')).type('Number');
	
	var parent = element.parentNode;
	var index = Array.prototype.indexOf.call(parent.childNodes, element);
	
	if (position >= parent.childNodes.length - 1)
		parent.insertBefore(element, null);
	else if (position == 0)
		parent.insertBefore(element, parent.firstChild);
	else if (position > 0)
	{
		var node = parent.firstChild;
		var counter = 0;
		
		while (node)
		{
			if (node !== element && node.nodeType == 1)
				counter++;
			
			if (counter == position + 1)
				break;
			
			node = node.nextSibling;
		}
		
		parent.insertBefore(element, node);
	}
	else
	{
		position = Math.abs(position) - 1;
		var node = parent.lastChild;
		var counter = 0;
		
		while (node && node.previousSibling)
		{
			if (node !== element && node.nodeType == 1)
				counter++;
			
			if (counter == position)
				break;

			node = node.previousSibling;
		}
		
		parent.insertBefore(element, node);
	}
	
	return element;
};

/**
* Nastavuje nebo vrací CSS vlastnosti. Pokud je hodnotou číslo, je převedeno na pixely.
* Názvy CSS vlastností mohou být s pomlčkamy nebo camelCase, tedy "padding-left" nebo "paddingLeft"
*
* @function
* @param {HTMLElement|String} element HTML element nebo jeho ID.
* @param {String|Object} name Název vlastnosti, např "padding-left" nebo objekt, např. {paddingLeft: 15}
* @param {String|Number} [value] Hodnota měněné vlastnosti.
* @throw {ArgumentError} Parametr má neplatný typ nebo hodnotu.
* @tested
* @example
* vizus.dom.css("elmId", "margin-top", "20px");
* vizus.dom.css(elmDiv, "marginTop", 20);
* var width = vizus.dom.css("elmId", "marginTop") === 20 // vrací int v případě px jinak string, např. "20em"
*/
vizus.dom.css = function(element, name, value)
{
	element = vizus.dom.get(element);
	(new vizus.Argument(name, 'name')).type(['String', 'Object']);
	(new vizus.Argument(value, 'value')).type(['String', 'Number', 'Undefined']);
	
	if (typeof name == 'string')
	{
		name = name.replace(/[A-Z]/, function(match) { return '-' + match[0].toLowerCase() });

		if (value == undefined)
		{
			if (element.currentStyle)
				value = element.currentStyle[name];
			else if (window.getComputedStyle)
				value = window.getComputedStyle(element, null).getPropertyValue(name);
			else
				value = null;
			
			if (/^\d+px$/.test(value))
				return parseInt(value, 10);
			else
				return value;
		}
		else
		{
			if (typeof value == 'number')
				value = value + 'px';
			
			element.style[name] = value;
		}
	}
	else
	{
		for (var prop in name)
		{
			prop = prop.replace(/[A-Z]/, function(match) { return '-' + match[0].toLowerCase() });
			value = typeof name[prop] == 'number' ? name[prop] + 'px' : name[prop];
			element.style[prop] = value;
		}
	}
};
	
/**
* Vybere elementy dle zadaného CSS selektoru query a zavolá callback s každým elementem.
*
* @function
* @param {String} query CSS selektor pro funkci document.querySelectorAll.
* @param {Function} callback Funkce volaná s každým nalezeným elementem.
* @throw {ArgumentError} Parametr má neplatný typ nebo hodnotu.
* @example
* vizus.dom.apply("a.test-link");
* vizus.dom.apply("a > img", function(el) {el.href = "";});
*/
vizus.dom.apply = function(query, callback)
{
	selector = (new vizus.Argument(query, 'query')).type('String');
	(new vizus.Argument(callback, 'callback')).type('Function');
	
	var elements = document.querySelectorAll(query);
	
	for (var i = 0; i < elements.length; i++)
		callback(elements[i]);
};

/**
* Vrací nebo nastavuje textový obsah uzlu.
*
* @function
* @param {HTMLElement|String} element HTML element nebo jeho ID.
* @param {String} [text] Text pro nastavení.
* @throw {ArgumentError} Parametr má neplatný typ nebo hodnotu.
* @example
* vizus.dom.text(link) == "odkaz";
* vizus.dom.text(link, "odkaz 2");
*/
vizus.dom.text = function(element, text)
{
	element = vizus.dom.get(element);
	(new vizus.Argument(text, 'text')).type(['String', 'Undefined', 'Null']);
	
	var property = '';
	
	if ('textContent' in element)
		property = 'textContent';
	else if ('innerText' in element)
		property = 'innerText';
	else
		property = null;
	
	if (typeof text == 'string')
	{
		if (property)
			element[property] = text;
	}
	else if (property)
		return element[property];
	else
		return null;
};

/*
* Vstupní pole INPUT a TEXTAREA
* @namespace
* =============================================================================
*/

if (vizus.input == undefined)
	vizus.input = {};

/**
* Aktivuje viditelný element formuláře typu text, password nebo textarea. Jako element se zadává pořadové číslo ve formuláři.
* Kladné číslo počítá elementy od žačátku formuláře, první je 1, záporné číslo od konce, poslední je -1. Parametr form udává
* pořadové číslo formuláře ve stránce. Kladné číslo počítá formuláře od žačátku stránky, první je 1, záporné číslo od konce,
* poslední je -1. Funkci se aktivuje sama až po načtení stránky.
*
* @function
* @param {Number} [element] HTML id, name nebo pořadové číslo elementu od 1 nebo od -1, výchozí je 1.
* @param {Number} [form] HTML id, name nebo pořadové číslo formuláře od 1 nebo od -1, výchozí je 1.
* @param {Boolean} [ready] Pokud je true, vykoná se okamžitě, jinak čeká na načtení stránky.
* @param {Window} [context] Kontext, výchozí je objekt window.
* @throw {ArgumentError} Parametr má neplatný typ nebo hodnotu.
* @tested
* @example
* vizus.input.focus(); // 1. viditelný element 1. formuláře
* vizus.input.focus(-1); // poslední element 1. formuláře
* vizus.input.focus(-2, 2); // 2. element od konce 2. formuláře
*/
vizus.input.focus = function(element, form, ready, context)
{
	element = (new vizus.Argument(element, 'element')).type(['Number', 'Undefined', 'Null']).invalid(0).value(1);
	form = (new vizus.Argument(form, 'form')).type(['Number', 'Undefined', 'Null']).invalid(0).value(1);
	ready = (new vizus.Argument(ready, 'ready')).type(['Boolean', 'Undefined', 'Null']).value(false);
	context = (new vizus.Argument(context, 'context')).type(['Window', 'Undefined', 'Null']).value(window);

	if (!ready)
	{
		vizus.page.ready(function() { vizus.input.focus(element, form, true, context); });
		return;
	}

	if (context.document.forms.length == 0 || context.document.forms.length < Math.abs(form))
		return false;
	
	if (form > 0)
		form = context.document.forms[form - 1];
	else
		form = context.document.forms[document.forms.length - form];
	
	var index = 0;
	var i = 0;
	
	function tryFocus()
	{
		var elm = form.elements[i];
		
		if (((elm.tagName == 'INPUT' && (elm.type == 'text' || elm.type == 'password')) || elm.tagName == 'TEXTAREA' || elm.tagName == 'SELECT') &&
			elm.style.display != 'none' && elm.style.visibility != 'hidden')
		{
			if (++index >= element)
			{
				try
				{
					elm.focus();
					
					if (context.document.activeElement != undefined && context.document.activeElement === elm)
						return true;
				}
				catch (e) {}
			}
		}
		
		return false;
	}

	if (element > 0)
	{
		for (i = 0; i < form.elements.length; i++)
		{
			if (tryFocus())
				return;
		}
	}
	else
	{
		element = Math.abs(element);
		
		for (i = form.elements.length - 1; i >= 0; i--)
		{
			if (tryFocus())
				return;
		}
	}
};

/**
* Vyplní vstupní pole, pokud je prázdné, hodnotou z jiného pole.
*
* @function
* @param {HTMLElement|String} input HTML elementu INPUT/TEXTAREA nebo jeho ID.
* @param {HTMLElement|String} source Zdrojový HTML elementu INPUT/TEXTAREA nebo jeho ID.
* @throw {ArgumentError} Parametr má neplatný typ nebo hodnotu.
* @throw {ReferenceError} Element nebyl nalezen.
*/
vizus.input.fill = function(input, source)
{
	input = vizus.dom.get(input, ['INPUT', 'TEXTAREA']);
	source = vizus.dom.get(source, ['INPUT', 'TEXTAREA']);
	
	if (input.value == '')
		input.value = source.value;
};

/**
* Nastaví nebo odebere CSS třídy vizus.config.inputClassOnInvalid a přidá vizus.config.inputClassOnValid, podle stavu isValid.
*
* @function
* @param {HTMLElement|String} input HTML elementu INPUT/TEXTAREA nebo jeho ID.
* @param {Boolean} isValid Pokud je true, odebere CSS třídu vizus.config.inputClassOnInvalid a přidá vizus.config.inputClassOnValid, jinak opačně.
* @throw {ArgumentError} Parametr má neplatný typ nebo hodnotu.
* @throw {ReferenceError} Element nebyl nalezen.
*/
vizus.input.setValidity = function(input, isValid)
{
	input = vizus.dom.get(input, ['INPUT', 'TEXTAREA']);
	
	if (isValid)
	{
		if (vizus.config.inputClassOnInvalid)
			vizus.dom.removeClass(input, vizus.config.inputClassOnInvalid);
		
		if (vizus.config.inputClassOnValid)
			vizus.dom.addClass(input, vizus.config.inputClassOnValid);
	}
	else
	{
		if (vizus.config.inputClassOnInvalid)
			vizus.dom.addClass(input, vizus.config.inputClassOnInvalid);
		
		if (vizus.config.inputClassOnValid)
			vizus.dom.removeClass(input, vizus.config.inputClassOnValid);
	}
};

/**
* Vstupní pole s textem
* @namespace
* =============================================================================
*/

if (vizus.input.text == undefined)
	vizus.input.text = {};

// validni text
vizus.input.text.validRegExp = /^(\S+|\S.+\S)$/;

// obarvuje validitu
// onkeyup="Validators.text.validate(this)"
vizus.input.text.validate = function(input, minLength, regexp)
{
	input = vizus.dom.get(input, ['INPUT', 'TEXTAREA']);
	vizus.input.setValidity(input, vizus.input.text.isValid(input, minLength, regexp));
};

// formatuje text
// onblur="Validators.text.finish(this)"
vizus.input.text.finish = function(input, minLength, regexp)
{
	input = vizus.dom.get(input, ['INPUT', 'TEXTAREA']);
	input.value = input.value.trim();
	vizus.input.text.validate(input, minLength, regexp);
};

// kontroluje validity textu
// if (!Validators.text.isValid(elm))
vizus.input.text.isValid = function(input, minLength, regexp)
{
	input = vizus.dom.get(input, ['INPUT', 'TEXTAREA']);
	minLength = (new vizus.Argument(minLength, 'minLength')).type(['Number', 'Undefined', 'Null']).min(0).value(0);
	regexp = (new vizus.Argument(regexp, 'regexp')).type(['RegExp', 'Undefined', 'Null']).value(vizus.input.text.validRegExp);
	
	return input.value.length >= minLength && (input.value.length == 0 || regexp.test(input.value));
};

/**
* Odstraní whitespace na začátku a konci obsahu vstupního pole input.
*
* @function
* @param {HTMLElement|String} Objekt HTML elementu INPUT/TEXTAREA nebo jeho ID.
* @throw {ArgumentError} Parametr má neplatný typ nebo hodnotu.
* @throw {ReferenceError} Element nebyl nalezen.
* @tested
*/
vizus.input.text.trim = function(input)
{
	input = vizus.dom.get(input, ['INPUT', 'TEXTAREA']);
	input.value = input.value.trim();
};

/**
* Vstupní pole s telefonem
* @namespace
* =============================================================================
*/

if (vizus.input.phone == undefined)
	vizus.input.phone = {};

// validni telefon, 1234 az 123456789, 123 456 789, +420 12345..., +420 123 456...
vizus.input.phone.validRegExp = /^\d{4,9}$|^\d{3} \d{3} \d{3}$|^\+[1-9]\d{0,2} \d+$|^\+[1-9]\d{0,2}( \d{3})+$/;

// obarvuje validitu
// onkeyup="Validators.phone.validate(this)"
vizus.input.phone.validate = function(input)
{
	vizus.input.setValidity(input, vizus.input.phone.isValid(input));
};

// formatuje telefon na +420 123 456 789
// onblur="Validators.phone.finish(this)"
vizus.input.phone.finish = function(input)
{
	input.value = input.value.toString().replace(/^(\+\d+)/, '$1_').replace(/\s+/g, '').replace(/(\d{3})/g, '$1_').replace(/_+/g, ' ').replace(/ +$/g, '').replace(/^(\d+)/, '+420 $1');
	vizus.input.phone.validate(input);
};

// kontroluje validity telefonu
// if (!Validators.phone.isValid(elm))
vizus.input.phone.isValid = function(input)
{
	return vizus.input.phone.validRegExp.test(input.value);
};

/**
* Vstupní pole s telefonem
* @namespace
* =============================================================================
*/

if (vizus.input.psc == undefined)
	vizus.input.psc = {};

// validni PSC
vizus.input.psc.validRegExp = /^\d{5}$|^\d{3} \d{2}$/;

// obarvuje validitu
// onkeyup="Validators.psc.validate(this)"
vizus.input.psc.validate = function(input)
{
	vizus.input.setValidity(input, this.isValid(input));
};

// formatuje PSC na 123 45
// onblur="Validators.psc.finish(this)"
vizus.input.psc.finish = function(input)
{
	input.value = input.value.toString().replace(/\s+/g, '').replace(/^(\d{3})(\d{2})$/, '$1 $2');
	vizus.input.psc.validate(input);
};

// kontroluje validity PSC
// if (!Validators.psc.isValid(elm))
vizus.input.psc.isValid = function(input)
{
	return vizus.input.psc.validRegExp.test(input.value);
};

/**
* Vstupní pole s IP
* @namespace
* =============================================================================
*/

if (vizus.input.ip == undefined)
	vizus.input.ip = {};

// validni IP
vizus.input.ip.validRegExp = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;

// obarvuje validitu
// onkeyup="Validators.ip.validate(this)"
vizus.input.ip.validate = function(input)
{
	vizus.input.setValidity(input, vizus.input.ip.isValid(input));
};

// formatuje IP
// onblur="Validators.ip.finish(this)"
vizus.input.ip.finish = function(input)
{
	input.value = input.value.toString().replace(/^\s+|\s+$/g, '');
	vizus.input.ip.validate(input);
};

// kontroluje validity IP
// if (!Validators.ip.isValid(elm))
vizus.input.ip.isValid = function(input)
{
	if (input.value.toString().match(vizus.input.ip.validRegExp) == null)
		return false;

	var a = parseInt(RegExp.$1);
	var b = parseInt(RegExp.$2);
	var c = parseInt(RegExp.$3);
	var d = parseInt(RegExp.$4);

	return a < 256 && b < 256 && c < 256 && d < 256;
};

/**
* Vstupní pole s domenou
* @namespace
* =============================================================================
*/

if (vizus.input.domain == undefined)
	vizus.input.domain = {};

// validni domena
vizus.input.domain.validRegExp = /^([a-z0-9-]+\.)+[a-z]{2,}$/;
vizus.input.domain.invalidRegExp = /^-|--|\.-|-\./;

// obarvuje validitu
// onkeyup="Validators.domain.validate(this)"
vizus.input.domain.validate = function(input)
{
	vizus.input.setValidity(input, vizus.input.domain.isValid(input));
};

// formatuje domenu
// onblur="Validators.domain.finish(this)"
vizus.input.domain.finish = function(input)
{
	input.value = input.value.toString().replace(/^\s+|\s+$/g, '');
	vizus.input.domain.validate(input);
};

// kontroluje validity domeny
// if (!Validators.domain.isValid(elm))
vizus.input.domain.isValid = function(input)
{
	var value = input.value.toString();
	return value.match(vizus.input.domain.validRegExp) != null && value.match(vizus.input.domain.invalidRegExp) == null;
};

/**
* Vstupní pole s číslem
* @namespace
* =============================================================================
*/

if (vizus.input.number == undefined)
	vizus.input.number = {};

// onkeyup="Validators.number.validate(this, 0, true)"
vizus.input.number.validate = function(input, decimals, negative, rangeFrom, rangeTo, multiplier)
{
	vizus.input.setValidity(input, vizus.input.number.isValid(input, decimals, negative, rangeFrom, rangeTo, multiplier));
};

// formatuje cislo
// onblur="Validators.number.finish(this)"
vizus.input.number.finish = function(input, decimals, negative, rangeFrom, rangeTo, multiplier)
{
	if (!vizus.input.number.isValid(input, decimals, negative, rangeFrom, rangeTo, multiplier))
		return;

	var number = parseFloat(input.value.toString().replace(/[^\d,\.-]/g, '').replace(/,/g, '.'));

	if (!isFinite(number))
		return;

	input.value = vizus.number.format(number, decimals, ',', ' ');
};

// vytvari cislo
// onfocus="Validators.number.prepare(this)"
vizus.input.number.prepare = function(input)
{
	var number = input.value.toString().replace(/[^\d,\.-]/g, '').replace(/\./g, ',');
	if (number != input.value.toString())
	{
		input.value = number;
		input.select();
	}
};

// kontroluje validitu cisla
// if (!Validators.number.isValid(elm, 1, true, -100, 100))
vizus.input.number.isValid = function(input, decimals, negative, rangeFrom, rangeTo, multiplier)
{
	var string = input.value.toString().replace(/,/g, '.').replace(/ /g, '');

	var regexp = '\\d+';
	if (isFinite(decimals) && decimals)
		regexp += '(\\.\\d{1,'+decimals+'}|)';
	if (negative)
		regexp = '-?'+regexp;

	regexp = new RegExp('^'+regexp+'$');

	if (string.match(regexp) == null)
		return false;

	var number = parseFloat(string);

	if (!isFinite(number))
		return false;
	if (isFinite(rangeFrom) && number < rangeFrom)
		return false;
	if (isFinite(rangeTo) && number > rangeTo)
		return false;
	if (isFinite(multiplier) && number % multiplier > 0)
		return false;

	return true;
};

/**
* Vstupní pole s e-mailem
* @namespace
* =============================================================================
*/

if (vizus.input.email == undefined)
	vizus.input.email = {};

// validni mail
vizus.input.email.validRegExp = /^[a-zA-Z0-9_\.-]{1,50}@([a-z0-9-]{1,63}\.){1,}[a-z]{2,}$/;

// obarvuje validitu
// onkeyup="Validators.email.validate(this)"
vizus.input.email.validate = function(input)
{
	vizus.input.setValidity(input, vizus.input.email.isValid(input));
};

// formatuje email
// onblur="Validators.email.finish(this)"
vizus.input.email.finish = function(input)
{
	input.value = input.value.toString().replace(/^\s+|\s+$/g, '');
	vizus.input.email.validate(input);
};

// kontroluje validity emailu
// if (!Validators.email.isValid(elm))
vizus.input.email.isValid = function(input)
{
	return vizus.input.email.validRegExp.test(input.value);
};

/**
* Vstupní pole s URL
* @namespace
* =============================================================================
*/

if (vizus.input.url == undefined)
	vizus.input.url = {};

// validni url
vizus.input.url.validRegExp = /^([a-z0-9]+):\/\/(([a-z0-9-]+\.)+[a-z]{2,})(\/|\/.+|)$/;
vizus.input.url.validSimpleRegExp = /^([a-z0-9-]+\.)+[a-z]{2,}(\/|\/.+|)$/;

// obarvuje validitu
// onkeyup="Validators.url.validate(this)"
vizus.input.url.validate = function(input, protocol)
{
	vizus.input.setValidity(input, vizus.input.url.isValid(input, protocol));
};

// formatuje url
// onblur="Validators.url.finish(this)"
vizus.input.url.finish = function(input, protocol)
{
	if (protocol == undefined)
		protocol = 'http';

	input.value = input.value.toString().replace(/^\s+|\s+$/g, '');

	if (input.value.toString().match(vizus.input.url.validSimpleRegExp) != null)
		input.value = protocol+'://'+input.value+(RegExp.$2.length == 0 ? '/' : '');

	vizus.input.url.validate(input, protocol);
};

// kontroluje validity url
// if (!Validators.url.isValid(elm))
vizus.input.url.isValid = function(input, protocol)
{
	if (protocol == undefined)
		protocol = ['http'];
	else if (!Array.isArray(protocol))
		protocol = [protocol];

	return (vizus.input.url.validRegExp.test(input.value) && protocol.indexOf(RegExp.$1) != -1) || input.value.toString().match(vizus.input.url.validSimpleRegExp) != null;
};

/**
* Opravuje URL vstupního pole funkcí vizus.url.fix.
*
* @function
* @param {HTMLElement} input HTML element input typu text.
* @param {String} [protocol] Výchozí protokol, např. "http" nebo "ftp"
* @throw {ArgumentError} Parametr má neplatný typ nebo hodnotu.
* @throw {ReferenceError} Element nebyl nalezen.
* @tested
*/
vizus.input.url.fix = function(input, protocol)
{
	input = vizus.dom.get(input, ['INPUT', 'TEXTAREA']);
	
	try
	{
		input.value = vizus.url.fix(input.value, protocol);
		vizus.input.setValidity(input, true);
	}
	catch (e)
	{
		vizus.input.setValidity(input, false);
	}
};

/**
* Vstupní pole s URL
* @namespace
* =============================================================================
*/

if (vizus.input.ident == undefined)
	vizus.input.ident = {};

// validni ident
vizus.input.ident.validRegExp = /^[a-z][a-z0-9-]*[a-z0-9]$/;

// obarvuje validitu
// onkeyup="Validators.ident.validate(this)"
vizus.input.ident.validate = function(input)
{
	vizus.input.setValidity(input, vizus.input.ident.isValid(input));
};

// formatuje ident
// onblur="Validators.ident.finish(this)"
vizus.input.ident.finish = function(input)
{
	input.value = input.value.toString().replace(/^\s+|\s+$/g, '');
	vizus.input.ident.validate(input);
};

// vytvari ident
// onfocus="Validators.ident.prepare(this, source)"
vizus.input.ident.prepare = function(input, source, suffix)
{
	if (input.value == '' && typeof(source) == 'object' && source.value != undefined && source.value != '')
	{
		input.value = vizus.text.ident(source.value.toString())+(suffix != undefined ? suffix : '');
		input.select();
	}

	vizus.input.ident.validate(input);
};

// kontroluje validity identu
// if (!Validators.ident.isValid(elm))
vizus.input.ident.isValid = function(input)
{
	return vizus.input.ident.validRegExp.test(input.value);
};

/**
* Vstupní pole s iniciálama
* @namespace
* =============================================================================
*/

if (vizus.input.initials == undefined)
	vizus.input.initials = {};

// validni inicialy
vizus.input.initials.validRegExp = /^[A-Z]+$/;

// obarvuje validitu
// onkeyup="Validators.initials.validate(this)"
vizus.input.initials.validate = function(input, number)
{
	vizus.input.setValidity(input, vizus.input.initials.isValid(input, number));
};

// formatuje inicialy
// onblur="Validators.initials.finish(this)"
vizus.input.initials.finish = function(input, number)
{
	input.value = input.value.toString().replace(/^\s+|\s+$/g, '');
	vizus.input.initials.validate(input, number);
};

// vytvari inicialy
// onfocus="Validators.initials.prepare(this, source, 2)"
vizus.input.initials.prepare = function(input, source, number)
{
	if (!isFinite(number))
		number = 2;

	if (input.value == '' && typeof(source) == 'object' && source.value != undefined)
	{
		var result = toAscii(source.value.toString().toUpperCase()).match(/\b[A-Z]/g);
		if (result != null)
		{
			var initials = new Array();
			for (var i = 0; i < number; i++)
			{
				if (result[i] != undefined)
					initials.push(result[i]);
			}
			input.value = initials.join('');
			input.select();
		}
	}

	this.validate(input, number);
};

// kontroluje validity inicial
// if (!Validators.initials.isValid(elm))
vizus.input.initials.isValid = function(input, number)
{
	if (!isFinite(number))
		number = 2;

	return vizus.input.initials.validRegExp.test(input.value) && input.value.length == number;
};

/**
* Vstupní pole s IČ
* @namespace
* =============================================================================
*/

if (vizus.input.ic == undefined)
	vizus.input.ic = {};

// validni IC
vizus.input.ic.validRegExp = /^\d{4,}$/;

// obarvuje validitu
// onkeyup="Validators.ic.validate(this)"
vizus.input.ic.validate = function(input)
{
	vizus.input.setValidity(input, vizus.input.ic.isValid(input));
};

// formatuje IC
// onblur="Validators.ic.finish(this)"
vizus.input.ic.finish = function(input)
{
	input.value = input.value.toString().replace(/^\s+|\s+$/g, '');
	vizus.input.ic.validate(input);
};

// kontroluje validity IC
// if (!Validators.ic.isValid(elm))
vizus.input.ic.isValid = function(input)
{
	return vizus.input.ic.validRegExp.test(input.value);
};

/**
* Vstupní pole s DIČ
* @namespace
* =============================================================================
*/

if (vizus.input.dic == undefined)
	vizus.input.dic = {};

// validni DIC
vizus.input.dic.validRegExp = /^[A-Z]{2}\d{4,}$/;

// obarvuje validitu
// onkeyup="Validators.dic.validate(this)"
vizus.input.dic.validate = function(input)
{
	vizus.input.setValidity(input, this.isValid(input));
};

// formatuje DIC
// onblur="Validators.dic.finish(this)"
vizus.input.dic.finish = function(input)
{
	input.value = input.value.toString().replace(/^\s+|\s+$/g, '');
	vizus.input.dic.validate(input);
};

// vytvari DIC
// onfocus="Validators.prepare(this, source)"
vizus.input.dic.prepare = function(input, source)
{
	if (input.value == '' && typeof(source) == 'object' && source.value != undefined && source.value != '')
	{
		input.value = 'CZ'+source.value;
		input.select();
	}

	vizus.input.dic.validate(input);
};

// kontroluje validity DIC
// if (!Validators.dic.isValid(elm))
vizus.input.dic.isValid = function(input)
{
	return vizus.input.dic.validRegExp.test(input.value);
};

/**
* Vstupní pole s loginem
* @namespace
* =============================================================================
*/

if (vizus.input.login == undefined)
	vizus.input.login = {};

// validni login
vizus.input.login.validRegExp = /^[a-zA-Z0-9\._@-]{3,}$/;

// obarvuje validitu
// onkeyup="Validators.login.validate(this)"
vizus.input.login.validate = function(input, regexp)
{
	vizus.input.setValidity(input, vizus.input.login.isValid(input, regexp));
};

// formatuje login
// onblur="Validators.login.finish(this)"
vizus.input.login.finish = function(input, regexp)
{
	input.value = input.value.toString().replace(/^\s+|\s+$/g, '');
	vizus.input.login.validate(input, regexp);
};

// kontroluje validity loginu
// if (!Validators.login.isValid(elm))
vizus.input.login.isValid = function(input, regexp)
{
	if (typeof(regexp) != 'object' || regexp.constructor != RegExp)
		regexp = vizus.input.login.validRegExp;

	return regexp.test(input.value);
};

/**
* Vstupní pole s heslem
* @namespace
* =============================================================================
*/

if (vizus.input.password == undefined)
	vizus.input.password = {};

// validni heslo
vizus.input.password.validRegExp = /^[a-zA-Z0-9!@#\$%\^&\*\(\)\.+\-]{3,}$/;

// obarvuje validitu
// onkeyup="Validators.password.validate(this)"
vizus.input.password.validate = function(input, regexp)
{
	vizus.input.setValidity(input, vizus.input.password.isValid(input, regexp));
};

// formatuje heslo
// onblur="Validators.password.finish(this)"
vizus.input.password.finish = function(input, regexp)
{
	input.value = input.value.toString().replace(/^\s+|\s+$/g, '');
	vizus.input.password.validate(input, regexp);
};

// vytvari heslo
// onfocus="Validators.password.generate(this)"
vizus.input.password.generate = function(input, easy)
{
	input.value = generatePassword(easy);
	input.select();

	vizus.input.password.validate(input);
};

// kontroluje validity hesla
// if (!Validators.password.isValid(elm))
vizus.input.password.isValid = function(input, regexp)
{
	if (typeof(regexp) != 'object' || regexp.constructor != RegExp)
		var regexp = vizus.input.password.validRegExp;

	return regexp.test(input.value);
};

/**
* Obrázky
* @namespace
* =============================================================================
*/

if (vizus.image == undefined)
	vizus.image = {};

/**
* Obnoví obrázek pomocí změny src a přidáním náhodného čísla.
*
* @function
* @param {HTMLElement} image HTML element obrázku.
* @tested
*/
vizus.image.reload = function(image)
{
	image = vizus.dom.get(image, 'IMG');
	image.src = vizus.url.replace(image.src, {query: {random: Math.round(Math.random() * 1000000)}});
};

/**
* Internacionalizace
* @namespace
* =============================================================================
*/

if (!vizus.i18n)
	vizus.i18n = {};

/**
* Seznam překladů.
*
* @variable
*/
vizus.i18n.texts = {};

/**
* Vrací text překladu nebo originál.
*
* @function
* @param {String} text Textový identifikátor překladu.
* @param {String} [language] Cílový jazyk překladu, např. "cs"
* @return {String} Vrací překlad nebo originál, tedy parametr text.
*/
vizus.i18n.text = function(text, language)
{
	if (language == undefined)
		language = vizus.config.language;
	
	return vizus.i18n.texts[language] != undefined && vizus.i18n.texts[language][text] != undefined ? vizus.i18n.texts[language][text] : text;
};

/**
* Přidá text překladu do seznamu.
*
* @function
* @param {String} language Cílový jazyk překladu, např. "cs".
* @param {Object} texts Objekt překladů, např {"Ano": "Yes", "Ne": "No"}
*/
vizus.i18n.addTexts = function(language, texts)
{
	for (var k in texts)
	{
		if (vizus.i18n.texts[language] == undefined)
			vizus.i18n.texts[language] = {};
		
		vizus.i18n.texts[language][k] = texts[k];
	}
};

/**
* Konfigurace
* @namespace
* =============================================================================
*/

if (vizus.config == undefined)
	vizus.config = {};

/**
* Prováděný kód
* =============================================================================
*/

if (typeof vizus.config.debug != 'boolean')
	vizus.config.debug = false;

if (typeof vizus.config.maxDebugDumpLength != 'number')
	vizus.config.maxDebugDumpLength = 10;

if (typeof vizus.config.maxDebugDumpDepth != 'number')
	vizus.config.maxDebugDumpDepth = 3;

if (typeof vizus.config.inputClassOnValid != 'string')
	vizus.config.inputClassOnValid = '';

if (typeof vizus.config.inputClassOnInvalid != 'string')
	vizus.config.inputClassOnInvalid = 'error';

if (typeof vizus.config.language != 'string')
	vizus.config.language = 'cs';

if (typeof vizus.config.baseUrl != 'string')
	vizus.config.baseUrl = vizus.page.getJsSrc(/^(.+?\/system\/1\.5\/)system(\.src)?\.js/, 1);
