/**
* Vizus CMS Javascript Library, podpora webu
* (c) 2014 VIZUS.CZ s.r.o.
*/

if (!vizus)
	throw new Error('Chybí system.js');

/**
* Vizus CMS
* @namespace
* =============================================================================
*/

if (!vizus.cms)
	vizus.cms = {};

/**
* Konfigurace
* @namespace
* =============================================================================
*/

if (!vizus.cms.config)
	vizus.cms.config = {};

// fičury CMS
if (typeof vizus.cms.config.features != 'object')
{
	vizus.cms.config.features =
	{
		imageViewer: 'a.cms-editor-link-image',
		videoPlayer: 'video.cms-player',
		audioPlayer: 'audio.cms-player',
		linkDecoder: 'a[data-vizus-cms-link-protected="1"]'
	};
}

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
		var base = vizus.page.getJsUrl(/^(.+?\/cms\/3\.0\/)(web|cms)(\.src)?\.js/, 1) + 'player/';
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
* Zobrazovač obrázků, jednoduchá náhrada za thickbox/fancybox.
*
* @function
* @param {HTMLAnchorElement} link Element tagu A, který obsahuje obrázek.
* @tested
*/
vizus.cms.viewer = function(link)
{
	if (!vizus.isClassOf(link, 'HTMLAnchorElement') || link.href == '')
		return;
	
	if (link.children.length != 1 || !vizus.isClassOf(link.children[0], 'HTMLImageElement'))
		return;
	
	link.onclick = function()
	{
		var frame = document.createElement('iframe');
		var overlay = document.createElement('div');
		var wait = document.createElement('div');
		var image = null;
		var timer = null;
		var angle = 0;
		var view = {};
		var box = {left: 0, top: 0, width: 0, height: 0,
			margin: {top: 0, right: 0, bottom: 0, left: 0},
			border: {top: 0, right: 0, bottom: 0, left: 0},
			image: {width: 0, height: 0},
			wait: {width: 0, height: 0}};
		
		// aktualizuje pohled
		var getView = function()
		{
			view.width = typeof window.innerWidth == 'number' ? window.innerWidth : window.availWidth;
			view.height = typeof window.innerHeight == 'number' ? window.innerHeight : window.availHeight;
		};
		
		// centruje box
		var center = function(width, height)
		{
			box.width = width;
			box.height = height;
			box.left = Math.round((view.width - (box.width + box.border.left + box.border.right)) / 2 - box.margin.left);
			box.top = Math.round((view.height - (box.height + box.border.top + box.border.bottom)) / 2 - box.margin.top);
			
			vizus.dom.css(frame, {width: box.width, height: box.height, left: box.left, top: box.top});

			if (image)
				vizus.dom.css(image, {width: box.width, height: box.height});
			
			if (wait)
				vizus.dom.css(wait, {left: Math.round((view.width - box.wait.width) / 2), top: Math.round((view.height - box.wait.height) / 2)});
		};
	
		// zvetsuje box a zmensuje fotku
		var resize = function()
		{
			getView();
			
			var width = box.image.width;
			var height = box.image.height;
			var wplus = box.margin.left + box.margin.right + box.border.left + box.border.right;
			var hplus = box.margin.top + box.margin.bottom + box.border.top + box.border.bottom;
			
			if (width + wplus > view.width)
			{
				var maxWidth = view.width - wplus;
				height = Math.round(height / (width / maxWidth));
				width = maxWidth;
			}
					
			if (height + hplus > view.height)
			{
				var maxHeight = view.height - hplus;
				width = Math.round(width / (height / maxHeight));
				height = maxHeight;
			}
			
			center(width, height);
		};

		// zavira box
		var close = function()
		{
			frame.parentNode.removeChild(frame);
			overlay.parentNode.removeChild(overlay);
			wait.parentNode.removeChild(wait);
		};

		// nacita box
		var loaded = function()
		{
			if (!frame.src)
				return;
			
			var body = frame.contentWindow.document.body;
			vizus.dom.css(body, {margin: 0, padding: 0});
			vizus.dom.hide(wait);
			window.clearInterval(timer);
			
			if (body.children.length == 1 && vizus.isClassOf(body.children[0], 'HTMLImageElement'))
			{
				image = body.children[0];
				image.title = link.children[0].alt || link.children[0].title;
				image.onclick = close;
				
				var cache = new Image();
				cache.src = image.src;
				
				box.image.width = image.naturalWidth || cache.width;
				box.image.height = image.naturalHeight || cache.height;
				
				resize();
				
				if (window.onresize)
					var resizeHandler = window.onresize;

				window.onresize = function()
				{
					resize();
					resizeHandler && resizeHandler();
				};
			}
		};
		
		// rotace cekani
		var rotate = function()
		{
			angle = angle + 10 > 360 ? 0 : angle + 10;
			var rotate = 'rotate(' + angle + 'deg)';
			vizus.dom.css(wait, {'-webkit-transform': rotate, '-moz-transform': rotate, '-o-transform': rotate, '-ms-transform': rotate, transform: rotate});
		};
		
		if (frame.readyState)
		{
			frame.onreadystatechange = function()
			{
				if (frame.readyState == 'loaded' || frame.readyState == 'complete')
				{
					frame.onreadystatechange = null;
					loaded();
				}
			};
		}
		else
			frame.onload = loaded;
	
		document.body.appendChild(overlay);
		overlay.className = 'cms-viewer-overlay';
		overlay.onclick = close;

		document.body.appendChild(frame);
		frame.className = 'cms-viewer';
		frame.src = link.href;
		
		document.body.appendChild(wait);
		wait.className = 'cms-viewer-wait';
		timer = window.setInterval(rotate, 27);

		box.margin.top = vizus.dom.css(frame, 'margin-top');
		box.margin.right = vizus.dom.css(frame, 'margin-right');
		box.margin.bottom = vizus.dom.css(frame, 'margin-bottom');
		box.margin.left = vizus.dom.css(frame, 'margin-left');
		
		box.border.top = vizus.dom.css(frame, 'border-top-width');
		box.border.right = vizus.dom.css(frame, 'border-right-width');
		box.border.bottom = vizus.dom.css(frame, 'border-bottom-width');
		box.border.left = vizus.dom.css(frame, 'border-left-width');
		
		box.wait.width = vizus.dom.css(wait, 'width');
		box.wait.height = vizus.dom.css(wait, 'height');

		getView();
		center(320, 240);
		
		if (document.onkeydown)
			var keyHandler = document.onkeydown;
		
		document.onkeydown = function(event)
		{
			if (vizus.event.keyCode(event) == vizus.event.keys.keyEsc)
				close();
			
			keyHandler && keyHandler();
		};
		
		return false;
	};
};

/**
* Dekóduje šifrovanou adresu a název odkazu.
*
* @function
* @param {String} href Zašifrovaná adresa.
* @param {String} name Název odkazu.
* @throw {ArgumentError} Parametr má neplatný typ nebo hodnotu.
* @example
*/
vizus.cms.decoder = function(link)
{
	if (!vizus.isClassOf(link, 'HTMLAnchorElement') || link.href == '' || link.getAttribute('data-vizus-cms-link-protected') != 1)
		return;
	
	link.href = vizus.text.decrypt(link.getAttribute('href'));
	vizus.dom.text(link, vizus.text.decrypt(vizus.dom.text(link)));
};

// aplikování fičur po načtení stránky
if (vizus.cms.config.features)
{
	var features = vizus.cms.config.features;

	vizus.page.ready(function()
	{
		features.imageViewer && vizus.dom.apply(features.imageViewer, vizus.cms.viewer);
		features.videoPlayer && vizus.dom.apply(features.videoPlayer, vizus.cms.player);
		features.audioPlayer && vizus.dom.apply(features.audioPlayer, vizus.cms.player);
		features.linkDecoder && vizus.dom.apply(features.linkDecoder, vizus.cms.decoder);
	});
}
