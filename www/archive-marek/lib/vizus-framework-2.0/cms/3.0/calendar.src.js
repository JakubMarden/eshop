/*=============================================================================
 Kalendar
 Updated: 8.5.2014 19:00:59
-------------------------------------------------------------------------------
 Copyright (c) 2000 - 2014 VIZUS.CZ s.r.o., All Rights Reserved.
=============================================================================*/

if (vizus == undefined)
	throw new Error('Chybí system.js');

if (vizus.cms == undefined)
	throw new Error('Chybí cms.js');

// Namespace
if (vizus.cms.form == undefined)
	vizus.cms.form = {};

// Namespace
if (vizus.cms.form.calendar == undefined)
	vizus.cms.form.calendar = {instances: []};
	
// Trida kalendare
vizus.cms.form.calendar.Calendar = function (win, obj, dt, id)
{
	// nastaveni
	this.showWeekNumber			= true;
	this.showDayName				= true;
	this.showGoToday				= true;
	this.activeMode				= false;
	this.timeColorMode			= 0; // 0 = soucasnost, 1 = minulost, soucasnost a budoucnost
	this.monthWeeks				= 6; // 0 = auto, 5 = 5 tydnu na mesic, 6 = 6 tydnu na mesic
	this.historyWeeks				= 1;
	this.futureWeeks				= 1;

	// barvy a oramovani
	// zakladni
	this.color						= '';
	this.bgColor					= 'white';
	this.border						= '1px solid #244366';
	// normalni den
	this.dayColor					= 'black';
	this.dayBgColor				= '';
	this.dayBorder					= '1px solid #c2d8f2';
	// vikend
	this.weekendDayColor			= 'black';
	this.weekendDayBgColor		= '#e0eeff';
	// svatek
	this.holidayColor				= '#dc2500';
	this.holidayBgColor			= '#e0eeff';
	// dny mimo aktualni mesic
	this.outerDayColor			= '#c2d8f2';
	this.outerDayBgColor			= '';
	// dnesek
	this.todayBorder				= '1px solid #dc2500';
	// aktivni den
	this.activeDayColor			= 'white';
	this.activeDayBgColor		= '#2e77e5';
	// den v historii
	this.historyDayColor			= '#c2d8f2';
	this.historyDayBgColor		= '';
	// den v budoucnosti
	this.futureDayColor			= '#c2d8f2';
	this.futureDayBgColor		= '';
	// cisla tydnu
	this.weekNumberColor			= '#244366';
	this.weekNumberBgColor		= '';
	// jmena dnu
	this.dayNameColor				= '#244366';
	this.dayNameBgColor			= '';
	// jmena dnu - vikend
	this.weekendDayNameColor	= '#244366';
	this.weekendDayNameBgColor	= '';
	// zahlavi
	this.headerColor				= 'white';
	this.headerBgColor			= '#244366';
	this.headerBorder				= '1px solid #244366';
	// seznam dnu
	this.dayListBorder			= '1px solid #244366';

	// prejit na predchozi mesic
	this.goBackwardTitle			= 'předchozí měsíc';
	// prejit na dalsi mesic
	this.goForwardTitle			= 'další měsíc';
	// prejit na dnesni den
	this.goTodayTitle				= 'přejít na dnešek';

	// datepicker
	this.dropDownAlign			= 'left';
	this.dropDownSpace			= 1;
	this.dropDownType				= 'DATETIME';

	// dny v tydnu
	this.dayNames = new Array('Po', 'Út', 'St', 'Čt', 'Pá', 'So', 'Ne');
	// mesice v roce
	this.monthNames = new Array('Leden', 'Únor', 'Březen', 'Duben', 'Květen', 'Červen', 'Červenec', 'Srpen', 'Září', 'Říjen', 'Listopad', 'Prosinec');
	// kazdorocni svatky
	this.holidays = '1.1, 1.5, 8.5, 5.7, 6.7, 28.9, 28.10, 17.11, 24.12, 25.12, 26.12';
	this.strongDays = '';

	// pohyblive svatky (velikonoce)
	this.variableHolidays = new Array();
	this.variableHolidays[2001] = '16.4';
	this.variableHolidays[2002] = '1.4';
	this.variableHolidays[2003] = '21.4';
	this.variableHolidays[2004] = '12.4';
	this.variableHolidays[2005] = '28.3';
	this.variableHolidays[2006] = '17.4';
	this.variableHolidays[2007] = '9.4';
	this.variableHolidays[2008] = '24.3';
	this.variableHolidays[2009] = '13.4';
	this.variableHolidays[2010] = '5.4';
	this.variableHolidays[2011] = '25.4';
	this.variableHolidays[2012] = '9.4';
	this.variableHolidays[2013] = '1.4';
	this.variableHolidays[2014] = '21.4';
	this.variableHolidays[2015] = '6.4';
	this.variableHolidays[2016] = '28.3';
	this.variableHolidays[2017] = '17.4';
	this.variableHolidays[2018] = '2.4';
	this.variableHolidays[2019] = '22.4';
	this.variableHolidays[2020] = '12.4';
	this.monthToQuarter = new Array(0, 1, 1, 1, 2, 2, 2, 3, 3, 3, 4, 4, 4);

	// externi handler zmeny
	this.onchange = null;
	this.viewDate = null;
	this.activeDate = null;

	// privatni promenne
	this._tb = null;
	this._dt = dt ? dt : new Date();
	this._dt = new Date(this._dt.getFullYear(), this._dt.getMonth(), this._dt.getDate(), 0, 0, 0);
	this._win = win ? win : window;
	this._obj = obj ? obj : null;
	this._id = id ? 'calendar_'+id : 'calendar_'+Math.floor((Math.random()*1000));
	this._actDay = null;
	this._actDayVal = null;
	this._drDw = false;
	this._drDwInp = null;
	this._drDwDck = null;
	this._drDwCall = null;
	this._drDwTime = '00:00';

	// zarazeni do kolekce
	vizus.cms.form.calendar.instances[this._id] = this;

	// prekresleni kalendare
	this.render = function()
	{
		this.viewDate = this._dt;
		this._dtVal = this._dt.valueOf();
		this._tb = this._win.document.createElement('TABLE');
		this._tb.border = 0;
		this._tb.cellSpacing = 0;
		this._tb.cellPadding = 0;
		this._tb.className = 'form-calendar';
		var tbS = this._tb.style;
		tbS.color = this.color;
		tbS.backgroundColor = this.bgColor;
		tbS.border = this.border;

		var rw = this._tb.insertRow(-1);
		rw.className = 'header';
		var rwS = rw.style;
		rwS.color = this.headerColor;
		rwS.backgroundColor = this.headerBgColor;

		// skok na dnesni den
		if (this.showGoToday)
		{
			var cl = this._win.document.createElement('TD');
			cl.className = 'go-today';
			cl.id = this._id;
			cl.onclick = this.goToday;
			cl.title = this.goTodayTitle;
			cl.style.borderBottom = this.headerBorder;
			rw.appendChild(cl);
		}

		// predchozi mesic
		var cl = this._win.document.createElement('TD');
		cl.className = 'go-backward';
		cl.id = this._id;
		cl.onclick = this.goBackward;
		cl.title = this.goBackwardTitle;
		cl.style.borderBottom = this.headerBorder;
		rw.appendChild(cl);

		// mesic rok
		cl = this._win.document.createElement('TD');
		cl.className = 'title';
		cl.colSpan = this.showWeekNumber ? (this.showGoToday ? 5 : 6) : (this.showGoToday ? 4 : 5);
		cl.style.color = this.headerColor;
		cl.style.borderBottom = this.headerBorder;
		cl.appendChild(this._win.document.createTextNode(this.monthNames[this._dt.getMonth()]+' '+this._dt.getFullYear().toString()));
		rw.appendChild(cl);

		// dalsi mesic
		cl = this._win.document.createElement('TD');
		cl.className = 'go-forward';
		cl.id = this._id;
		cl.onclick = this.goForward;
		cl.title = this.goForwardTitle;
		cl.style.borderBottom = this.headerBorder;
		rw.appendChild(cl);

		// nazvy dnu
		if (this.showDayName)
		{
			rw = this._tb.insertRow(-1);
			if (this.showWeekNumber)
			{
				cl = this._win.document.createElement('TD');
				cl.appendChild(this._win.document.createTextNode(' '));
				rw.appendChild(cl);
			}
			for (var day = 0; day < 7; day++)
			{
				cl = this._win.document.createElement('TD');
				cl.align = 'center';
				cl.vAlign = 'bottom';
				cl.className = 'day-name';
				var clS = cl.style;
				clS.color = this.dayNameColor;
				clS.backgroundColor = this.dayNameBgColor;
				if (day > 4)
				{
					clS.color = this.weekendDayNameColor;
					clS.backgroundColor = this.weekendDayNameBgColor;
				}
				cl.appendChild(this._win.document.createTextNode(this.dayNames[day]));
				rw.appendChild(cl);
			}
		}

		// casovy ramec
		this._mtBeg = new Date(this._dt.getFullYear(), this._dt.getMonth(), 1, 0, 0, 0);
		this._mtBegVal = this._mtBeg.valueOf();
		this._mtEnd = new Date(this._dt.getFullYear(), this._dt.getMonth(), 1, 0, 0, 0);
		this._mtEnd.setMonth(this._mtBeg.getMonth() + 1)
		this._mtEnd.setDate(0);
		this._mtEndVal = this._mtEnd.valueOf();
		this._dtBeg = new Date(this._mtBeg.valueOf());
		this._dtBeg.setDate(-(7 * this.historyWeeks - 1) - (this._dtBeg.getDay() ? this._dtBeg.getDay() - 1 : 6));
		this._dtEnd = new Date(this._mtEnd.valueOf());
		this._dtEnd.setDate(this._dtEnd.getDate() + (7 * this.futureWeeks - 1) + (this._dtEnd.getDay() ? 6 - this._dtEnd.getDay() : 0));
		this._dtEndVal = this._dtEnd.valueOf();
		if (this.monthWeeks)
		{
			var wks = 0;
			if (this._mtBeg.getDay() != 1)
			{
				wks++;
				var mtBeg = new Date(this._mtBegVal);
				mtBeg.setDate(mtBeg.getDate() + (mtBeg.getDay() ? 8 - mtBeg.getDay() : 1));
				var mtBegVal = mtBeg.valueOf();
			}
			else
			{
				var mtBeg = new Date(this._mtBegVal);
				var mtBegVal = this._mtBegVal;
			}
			if (this._mtEnd.getDay())
			{
				wks++;
				var mtEnd = new Date(this._mtEndVal);
				mtEnd.setDate(mtEnd.getDate() - mtEnd.getDay());
			}
			else
				var mtEnd = new Date(this._mtEndVal);

			mtEnd.setDate(mtEnd.getDate() + 1);
			mtEndVal = mtEnd.valueOf();

			wks += Math.round((mtEndVal - mtBegVal) / (1000 * 3600 * 24 * 7));
			if (wks > this.monthWeeks || wks < this.monthWeeks)
			{
				var fwks = this.futureWeeks + (wks > this.monthWeeks ? -1 : 1);
				this._dtEnd = new Date(this._mtEnd.valueOf());
				this._dtEnd.setDate(this._dtEnd.getDate() + (7 * fwks - 1) + (this._dtEnd.getDay() ? 6 - this._dtEnd.getDay() : 0));
				this._dtEndVal = this._dtEnd.valueOf();
			}
		}
		var dt = new Date(this._dtBeg.valueOf());
		var dtVal = dt.valueOf();
		var dtStr = dt.toString();

		// kalendar
		var stBrd = this.showDayName ? 2 + this.historyWeeks : 1 + this.historyWeeks;
		while (dtVal <= this._dtEndVal)
		{
			rw = this._tb.insertRow(-1);
			// cisla tydnu
			if (this.showWeekNumber)
			{
				cl = this._win.document.createElement('TD');
				cl.align = 'right';
				cl.vAlign = 'bottom';
				cl.className = 'week-number';
				clS = cl.style;
				clS.color = this.weekNumberColor;
				clS.backgroundColor = this.weekNumberBgColor;
				clS.borderRight = this.dayListBorder;
				cl.appendChild(this._win.document.createTextNode(this._getWeekNumber(dt)));
				rw.appendChild(cl);
			}
			// jednotlive dny tydne
			for (var day = 1; day <= 7; day++)
			{
				cl = this._win.document.createElement('TD');
				cl.id = this._id;
				cl.onclick = this.goDay;
				cl.dt = dtStr;
				cl.className = 'day';
				var clS = cl.style;

				// barva popredi/pozadi dle typu dne
				if (dtVal < this._mtBegVal || dtVal > this._mtEndVal)
				{
					clS.color = this.outerDayColor;
					clS.backgroundColor = this.outerDayBgColor;
				}
				else if (dtVal == this._dtVal)
				{
					clS.color = this.activeDayColor;
					clS.backgroundColor = this.activeDayBgColor;
					//clS.cursor = 'default';
					this._actDay = cl;
					this._actDayVal = dtVal;
					this.activeDate = new Date(dtVal);
				}
				else if (this._isHoliday(dt))
				{
					clS.color = this.holidayColor;
					clS.backgroundColor = this.holidayBgColor;
				}
				else if (day > 5)
				{
					clS.color = this.weekendDayColor;
					clS.backgroundColor = this.weekendDayBgColor;
				}
				else
				{
					clS.color = this.dayColor;
					clS.backgroundColor = this.dayBgColor;
				}

				if (this._isStrongDay(dt))
					clS.fontWeight = 'bold';

				// dobarveni dle rezimu
				if (this.timeColorMode == 1 && this._actDay != cl)
				{
					if (dtVal < this._todayVal)
					{
						clS.color = this.historyDayColor;
						clS.backgroundColor = this.historyBgColor;
					}
					else if (dtVal > this._mtEndVal)
					{
						clS.color = this.futureDayColor;
						clS.backgroundColor = this.futureBgColor;
					}
				}

				// oramovani
				if (day > 1)
					clS.borderLeft = this.dayBorder;

				if (this._tb.rows.length == stBrd && this.showDayName)
					clS.borderTop = this.dayListBorder;
				else if (this._tb.rows.length > stBrd)
					clS.borderTop = this.dayBorder;

				// dnesni den
				if (dtVal == this._todayVal)
				{
					var div = this._win.document.createElement('DIV');
					div.id = this._id;
					div.className = 'today';
					div.style.border = this.todayBorder;
					div.appendChild(this._win.document.createTextNode(dt.getDate()));
					clS.padding = 0;
					cl.appendChild(div);
				}
				else
					cl.appendChild(this._win.document.createTextNode(dt.getDate()));

				rw.appendChild(cl);

				// posun v case
				dt.setDate(dt.getDate() + 1);
				dtVal = dt.valueOf();
				dtStr = dt.toString();
			}
		}
		if (!this._obj)
			return;

		if (this._obj.childNodes.length)
			this._obj.replaceChild(this._tb, this._obj.childNodes[0]);
		else
			this._obj.appendChild(this._tb);

		if (this.onchange && this.activeMode)
			this.onchange(this._dt);
	};

	// presun dozadu
	this.goBackward = function(e, id)
	{
		var eventObject = window.event ? window.event : e;
		var eventSrcElement = eventObject.target || eventObject.srcElement;
		
		if (id && vizus.cms.form.calendar.instances[id])
			var cal = vizus.cms.form.calendar.instances[id];
		else if (eventObject && eventSrcElement.id.indexOf('calendar_') == 0 && vizus.cms.form.calendar.instances[eventSrcElement.id])
			var cal = vizus.cms.form.calendar.instances[eventSrcElement.id];
		else
			return;

		var dt = new Date(cal._dtVal);
		dt.setDate(1);
		dt.setMonth(dt.getMonth() - 1);
		if (cal._getMonthDays(dt) < cal._dt.getDate())
		{
			cal._dt.setDate(cal._getMonthDays(dt));
			cal._dt.setMonth(cal._dt.getMonth() - 1);
		}
		else
			cal._dt.setMonth(cal._dt.getMonth() - 1);

		cal.today();
		cal.render();
		if (cal.onchange && cal.activeMode)
			cal.onchange(cal._dt);
		
		cal._stopEvent(eventObject);
	};

	// presun dopredu
	this.goForward = function(e, id)
	{
		var eventObject = window.event ? window.event : e;
		var eventSrcElement = eventObject.target || eventObject.srcElement;
		
		if (id && vizus.cms.form.calendar.instances[id])
			var cal = vizus.cms.form.calendar.instances[id];
		else if (eventObject && eventSrcElement.id.indexOf('calendar_') == 0 && vizus.cms.form.calendar.instances[eventSrcElement.id])
			var cal = vizus.cms.form.calendar.instances[eventSrcElement.id];
		else
			var cal = this;

		var dt = new Date(cal._dtVal);
		dt.setDate(1);
		dt.setMonth(dt.getMonth() + 1);
		if (cal._getMonthDays(dt) < cal._dt.getDate())
		{
			cal._dt.setDate(cal._getMonthDays(dt));
			cal._dt.setMonth(cal._dt.getMonth() + 1);
		}
		else
			cal._dt.setMonth(cal._dt.getMonth() + 1);

		cal.today();
		cal.render();
		if (cal.onchange && cal.activeMode)
			cal.onchange(cal._dt);
		
		cal._stopEvent(eventObject);
	};

	// presun na dnesek
	this.goToday = function(e, id)
	{
		var eventObject = window.event ? window.event : e;
		var eventSrcElement = eventObject.target || eventObject.srcElement;
		
		if (id && vizus.cms.form.calendar.instances[id])
			var cal = vizus.cms.form.calendar.instances[id];
		else if (eventObject && eventSrcElement.id.indexOf('calendar_') == 0 && vizus.cms.form.calendar.instances[eventSrcElement.id])
			var cal = vizus.cms.form.calendar.instances[eventSrcElement.id];
		else
			var cal = this;

		cal.today();
		cal._dt = new Date(cal._today.valueOf());
		cal.render();
		if (cal.onchange && cal.activeMode)
			cal.onchange(cal._dt);
		
		cal._stopEvent(eventObject);
	};

	// presun na den
	this.goDay = function(e, id, dt)
	{
		var eventObject = window.event ? window.event : e;
		var eventSrcElement = eventObject.target || eventObject.srcElement;
		
		if (eventObject && eventSrcElement.id.indexOf('calendar_') == 0 && vizus.cms.form.calendar.instances[eventSrcElement.id])
		{
			id = eventSrcElement.id;
			var src = eventSrcElement;
			var cl = src.tagName == 'DIV' ? src.parentNode : src;
			var cal = vizus.cms.form.calendar.instances[cl.id];
			var dt = new Date(Date.parse(cl.dt));
			var dtVal = dt.valueOf();

/*			if (cl === cal._actDay)
				return;
			else */
			if (dtVal < cal._mtBegVal || dtVal > cal._mtEndVal)
			{
				cal._dt = new Date(dt.valueOf());
				cal.render();
			}
			else
			{
				if (cal._actDay)
				{
					var dtOld = new Date(cal._dtVal);
					var clSOld = cal._actDay.style;
					var dOld = dtOld.getDay();

					// barva popredi/pozadi dle typu dne
					if (cal._isHoliday(dtOld))
					{
						clSOld.color = cal.holidayColor;
						clSOld.backgroundColor = cal.holidayBgColor;
					}
					else if (dOld == 6 || dOld == 0)
					{
						clSOld.color = cal.weekendDayColor;
						clSOld.backgroundColor = cal.weekendDayBgColor;
					}
					else
					{
						clSOld.color = cal.dayColor;
						clSOld.backgroundColor = cal.dayBgColor;
					}
					clSOld.cursor = '';
				}
				var clS = cl.style;
				clS.color = cal.activeDayColor;
				clS.backgroundColor = cal.activeDayBgColor;
				clS.cursor = 'default';
				cal._dt = new Date(dtVal);
				cal._dtVal = dtVal;
				cal._actDay = cl;
				cal._actDayVal = dtVal;
				cal.activeDate = new Date(dtVal);
			}
			if (cal._win.event)
			{
				cal._win.event.cancelBubble = true;
				cal._win.event.returnValue = false;
			}
		}
		else
		{
			var cal = (id && vizus.cms.form.calendar.instances[id] && dt) ? vizus.cms.form.calendar.instances[id] : this;
			cal._dt = dt;
			cal.render();
		}

		if (cal.onchange)
			cal.onchange(cal._dt);

		if (cal._drDw)
		{
			var d = cal._dt.getDate();
			var m = cal._dt.getMonth() + 1;
			var y = cal._dt.getFullYear();
			
			if (cal.dropDownType == 'DATETIME')
				cal._drDwInp.value = d+'.'+m+'.'+y+(cal._drDwTime.length ? ', '+cal._drDwTime : '');
			else if (cal.dropDownType == 'DATE_TIME' || cal.dropDownType == 'DATE')
				cal._drDwInp.value = d+'.'+m+'.'+y;
			else if (cal.dropDownType == 'DDMMYY' || cal.dropDownType == 'DDMMYYY')
				cal._drDwInp.value = cal._zeroPad(d)+cal._zeroPad(m)+y.toString().substr(2, 2);
			else if (cal.dropDownType == 'DDMMYYYY')
				cal._drDwInp.value = cal._zeroPad(d)+cal._zeroPad(m)+y;
			
			if (cal._drDwInp.fireEvent)
				cal._drDwInp.fireEvent('onchange');
			
			cal._win.setTimeout('vizus.cms.form.calendar.instances["'+id+'"]._dropUp()', 200);
		}
	};

	// nastaveni predvolby
	this.setQuickDate = function(id, template)
	{
		var inp = document.getElementById(id+'Date');
		if (!inp)
			inp = document.getElementById(id+'Str');
		if (!inp)
			inp = document.getElementById(id);

		if (!inp)
			return;

		if (this._drDw)
			return;

		for (var id in vizus.cms.form.calendar.instances)
		{
			if (vizus.cms.form.calendar.instances[id]._drDw)
			{
				vizus.cms.form.calendar.instances[id]._dropUp();
				break;
			}
		}

		switch (template)
		{
			case 'TODAY':
			{
				var dt = new Date();
				var d = dt.getDate();
				var m = dt.getMonth() + 1;
				var y = dt.getFullYear();
				var n = dt.getMinutes();
				if (n < 10)
					n = '0'+n.toString();
				if (this.dropDownType == 'DATETIME')
					inp.value = d+'.'+m+'.'+y+', '+dt.getHours()+':'+n;
				else if (this.dropDownType == 'DATE_TIME' || this.dropDownType == 'DATE')
					inp.value = d+'.'+m+'.'+y;
				else if (this.dropDownType == 'DDMMYY' || this.dropDownType == 'DDMMYYY')
					inp.value = this._zeroPad(d)+this._zeroPad(m)+y.toString().substr(2, 2);
				else if (this.dropDownType == 'DDMMYYYY')
					inp.value = this._zeroPad(d)+this._zeroPad(m)+y;
				break;
			}
			case 'FIRST_QUARTER_DAY':
			{
				var dt = new Date();
				var d = 1;
				var m = (Math.ceil((dt.getMonth() + 1) / 3) - 1) * 3 + 1;
				var y = dt.getFullYear();
				if (this.dropDownType == 'DATETIME')
					inp.value = d+'.'+m+'.'+y+', 00:00';
				else if (this.dropDownType == 'DATE_TIME' || this.dropDownType == 'DATE')
					inp.value = d+'.'+m+'.'+y;
				else if (this.dropDownType == 'DDMMYY' || this.dropDownType == 'DDMMYYY')
					inp.value = this._zeroPad(d)+this._zeroPad(m)+y.toString().substr(2, 2);
				else if (this.dropDownType == 'DDMMYYYY')
					inp.value = this._zeroPad(d)+this._zeroPad(m)+y;
				break;
			}
			case 'LAST_QUARTER_DAY':
			{
				var dt = new Date();
				var d = 0;
				var m = Math.ceil((dt.getMonth() + 1) / 3) * 3;
				var y = dt.getFullYear();
				dt.setMonth(m - 1);
				d = this._getMonthDays(dt);
				if (this.dropDownType == 'DATETIME')
					inp.value = d+'.'+m+'.'+y+', 23:59';
				else if (this.dropDownType == 'DATE_TIME' || this.dropDownType == 'DATE')
					inp.value = d+'.'+m+'.'+y;
				else if (this.dropDownType == 'DDMMYY' || this.dropDownType == 'DDMMYYY')
					inp.value = this._zeroPad(d)+this._zeroPad(m)+y.toString().substr(2, 2);
				else if (this.dropDownType == 'DDMMYYYY')
					inp.value = this._zeroPad(d)+this._zeroPad(m)+y;
				break;
			}
			default:
			{
				inp.value = template;
				break;
			}
		}
	}

	// zobrazeni jako datepicker
	this.dropDown = function(id)
	{
		var ico = document.getElementById(id+'Ico');
		var inp = document.getElementById(id+'Date');
		if (!inp)
			inp = document.getElementById(id+'Str');
		if (!inp)
			inp = document.getElementById(id);

		if (!(inp && ico))
			return;

		if (this._drDw)
			return;

		for (var id in vizus.cms.form.calendar.instances)
		{
			if (vizus.cms.form.calendar.instances[id]._drDw)
			{
				vizus.cms.form.calendar.instances[id]._dropUp();
				break;
			}
		}

		if (this.dropDownType == 'DATETIME')
			this._drDwTime = inp.value.match(/(\d{1,2}:\d{1,2})/) ? RegExp.$1 : '00:00';
		else
			this._drDwTime = '';

		if (inp.value.match(/(\d+)\.(\d+)\.(\d+)/))
		{
			var d = RegExp.$1;
			var m = parseInt(RegExp.$2, 10);
			var y = parseInt(RegExp.$3, 10);
			if (y < 100)
				y += (y < 38) ? 2000 : 1900;
			var dt = new Date(y, m - 1, d, 0, 0, 0);
		}
		else
			var dt = new Date();

		if (this._drDwDck)
			var dck = this._drDwDck;
		else
		{
			this._drDwDck = this._win.document.createElement('DIV');
			var dck = this._drDwDck;
			this._win.document.body.appendChild(dck);
		}
		ico.style.position = 'relative';
		var dckS = dck.style;
		dckS.zIndex = 11;
		dckS.position = 'absolute';
		dckS.display = '';
		this._drDwInp = inp;
		this._drDw = true;
		this._dt = this.activeDate = dt;
		this._obj = dck;
		this.render();
		var a = this.dropDownAlign;
		var s = this.dropDownSpace;
		var w = this._tb.offsetWidth;
		var h = this._tb.offsetHeight;
		var iR = ico.getBoundingClientRect ? ico.getBoundingClientRect() : {top: ico.offsetTop, left: ico.offsetLeft};
		var iL = ico.offsetLeft;
		var iT = ico.offsetTop;
		var iW = ico.offsetWidth;
		var iH = ico.offsetHeight;
		dckS.width = w;
		dckS.height = h;
		
		if (dckS.pixelTop !== undefined)
			dckS.pixelTop = (iR.top + iH + s + h > this._win.document.body.clientHeight) ? iT - s - h : iT + iH + s;
		else
			dckS.top = ((iR.top + iH + s + h > this._win.document.body.clientHeight) ? iT - s - h : iT + iH + s) + 'px';
		
		if (dckS.pixelTop !== undefined)
		{
			if (this.dropDownAlign.toLowerCase() == 'left')
				dckS.pixelLeft = (iR.left + w > this._win.document.body.clientWidth) ? iL + iW - w: iL;
			else if (this.dropDownAlign.toLowerCase() == 'right')
				dckS.pixelLeft = (iR.left + iW - w < 0) ? iL : iL + iW - w;
			else
				dckS.pixelLeft = Math.floor(iL + iW / 2 - w / 2);
		}
		else
		{
			if (this.dropDownAlign.toLowerCase() == 'left')
				dckS.left = ((iL + w > this._win.document.body.clientWidth) ? iL + iW - w: iL) + 'px';
			else if (this.dropDownAlign.toLowerCase() == 'right')
				dckS.left = ((iL + iW - w < 0) ? iL : iL + iW - w) + 'px';
			else
				dckS.left = (Math.floor(iL + iW / 2 - w / 2)) + 'px';
		}

		if (this._win.event)
		{
			this._win.event.cancelBubble = true;
			this._win.event.returnValue = false;
		}

		if (this._win.document.onclick)
			this._drDwCall = this._win.document.onclick;
		this._win.document.onclick = this._dropUp;
	};

	// aktualizace casu
	this.today = function()
	{
		this._today = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 0, 0, 0);
		this._todayVal = this._today.valueOf();
	};

	// posun v case
	this.move = function(id, un, dir)
	{
		var inp = document.getElementById(id+'Date');
		if (!inp)
			inp = document.getElementById(id+'Str');
		if (!inp)
			inp = document.getElementById(id);

		if (!inp)
			return;

		if (this._drDw)
			return;

		for (var id in vizus.cms.form.calendar.instances)
		{
			if (vizus.cms.form.calendar.instances[id]._drDw)
			{
				vizus.cms.form.calendar.instances[id]._dropUp();
				break;
			}
		}

		var now = new Date();
		var d = now.getDate();
		var m = now.getMonth();
		var y = now.getFullYear();
		var h = now.getHours();
		var n = now.getMinutes();
		var tm = '';

		if (inp.value.match(/^(\d{1,2})\.(\d{1,2})\.(\d{2,4})(, *(\d{1,2}):(\d{2})){0,1}/))
		{
			var dd = RegExp.$1;
			var mm = RegExp.$2;
			var yy = RegExp.$3;

			if (RegExp.$4)
			{
				tm = RegExp.$4;
				var hh = RegExp.$5;
				var nn = RegExp.$6;

				h = parseInt(hh.replace(/^0/, ''), 10);
				n = parseInt(nn.replace(/^0/, ''), 10);
			}
			
			d = parseInt(dd.replace(/^0/, ''), 10);
			m = parseInt(mm.replace(/^0/, ''), 10) - 1;
			y = parseInt(yy.replace(/^0/, ''), 10);
		}
		else if (inp.value.match(/^(\d{2})(\d{2})(\d{2,4})/))
		{
			var dd = RegExp.$1;
			var mm = RegExp.$2;
			var yy = RegExp.$3;
			d = parseInt(dd.replace(/^0/, ''), 10);
			m = parseInt(mm.replace(/^0/, ''), 10) - 1;
			y = parseInt(yy.replace(/^0/, ''), 10);
			h = 0;
			n = 0;
		}

		switch (un)
		{
			case 'YEAR':
				y += dir;
				break;
			case 'MONTH':
			{
				var tmp = new Date(y, m + dir, 1, h, n, 0);
				var md = this._getMonthDays(tmp);
				if (md < d)
					d = md

				m += dir;
				break;
			}
			default:
			case 'DAY':
				d += dir;
				break;
		}

		var dt = new Date(y, m, d, h, n, 0);

		d = dt.getDate();
		m = dt.getMonth() + 1;
		y = dt.getFullYear();

		if (this.dropDownType == 'DATETIME')
			inp.value = d+'.'+m+'.'+y+(tm ? tm : ', 00:00');
		else if (this.dropDownType == 'DATE_TIME' || this.dropDownType == 'DATE')
			inp.value = d+'.'+m+'.'+y;
		else if (this.dropDownType == 'DDMMYY')
			inp.value = this._zeroPad(d)+this._zeroPad(m)+y.toString().substr(2, 2);
		else if (this.dropDownType == 'DDMMYYYY')
			inp.value = this._zeroPad(d)+this._zeroPad(m)+y;

	}

	// privatni metody
	// zrusi datepicker
	this._dropUp = function()
	{
		for (var id in vizus.cms.form.calendar.instances)
		{
			if (vizus.cms.form.calendar.instances[id]._drDw)
			{
				var cal = vizus.cms.form.calendar.instances[id];
				break;
			}
		}
		if (!cal)
			return true;
		
		cal._drDw = false;
		cal._drDwDck.style.display = 'none';
		if (cal._drDwCall)
		{
			cal._drDwCall();
			cal._win.document.onclick = cal._drDwCall;
		}
	};

	// vraci tru pokud je datum nejaky svatek
	this._isHoliday = function(dt)
	{
		var y = dt.getFullYear();
		var m = dt.getMonth() + 1;
		var d = dt.getDate();
		var re = new RegExp('\\b'+d+'\\.'+m+'\\b');

		if (this.holidays.match(re) !== null)
			return true;
		else if (this.variableHolidays[y] != null && this.variableHolidays[y].match(re) !== null)
			return true;
		else
			return false;
	};

	this._isStrongDay = function(dt)
	{
		if (!this.strongDays)
			return false;

		var y = dt.getFullYear();
		var m = dt.getMonth() + 1;
		var d = dt.getDate();
		var re = new RegExp('\\b'+d+'\\.'+m+'\\.'+y+'\\b');

		if (this.strongDays.match(re) !== null)
			return true;
		else
			return false;
	};

	// vraci pocet dni v mesici
	this._getMonthDays = function(dt)
	{
		var t = new Date(dt.getFullYear(), dt.getMonth(), 1, 0, 0, 0);
		t.setMonth(t.getMonth() + 1);
		t.setDate(0);
		return t.getDate();
	}

	// vraci cislo tydne
	this._getWeekNumber = function(dt)
	{
		var t = dt ? dt : new Date();
		var y = this._takeYear(t);
		var m = t.getMonth();
		var d = t.getDate();
		var now = Date.UTC(y, m, d + 1, 0, 0, 0);
		var fsDay = new Date();
		fsDay.setYear(y);
		fsDay.setMonth(0);
		fsDay.setDate(1);
		var then = Date.UTC(y, 0, 1, 0, 0, 0);
		var comp = fsDay.getDay();
		if (comp > 3)
			comp -= 4;
		else
			comp += 3;
		return Math.round((((now - then) / 86400000) + comp) / 7);
	};

	this._takeYear = function(dt)
	{
		var x = dt.getFullYear();
		var y = x % 100;
		y += (y < 38) ? 2000 : 1900;
		return y;
	};
	
	// zastavi event ve vsech prohlizecich
	this._stopEvent = function(e)
	{
		if (e.cancelBubble != null)
			e.cancelBubble = true;
		if (e.stopPropagation)
			e.stopPropagation();
		if (e.preventDefault)
			e.preventDefault();
		if (window.event)
			e.returnValue = false;
		if (e.cancel != null)
			e.cancel = true;
	};
	
	// zarovnani nulama
	this._zeroPad = function(str, num)
	{
		if (!num)
			num = 2;
		
		str = str.toString();
		return '00000000000000000000000000000000'.substr(0, num - str.length)+str;
	};
	
	// nastaveni dnesniho data
	this.today();
};
