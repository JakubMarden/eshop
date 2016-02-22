if(vizus==undefined){throw new Error("Chybí system.js")}if(vizus.cms==undefined){throw new Error("Chybí cms.js")}if(vizus.cms.form==undefined){vizus.cms.form={}}if(vizus.cms.form.calendar==undefined){vizus.cms.form.calendar={instances:[]}}vizus.cms.form.calendar.Calendar=function(c,b,a,d){this.showWeekNumber=true;this.showDayName=true;this.showGoToday=true;this.activeMode=false;this.timeColorMode=0;this.monthWeeks=6;this.historyWeeks=1;this.futureWeeks=1;this.color="";this.bgColor="white";this.border="1px solid #244366";this.dayColor="black";this.dayBgColor="";this.dayBorder="1px solid #c2d8f2";this.weekendDayColor="black";this.weekendDayBgColor="#e0eeff";this.holidayColor="#dc2500";this.holidayBgColor="#e0eeff";this.outerDayColor="#c2d8f2";this.outerDayBgColor="";this.todayBorder="1px solid #dc2500";this.activeDayColor="white";this.activeDayBgColor="#2e77e5";this.historyDayColor="#c2d8f2";this.historyDayBgColor="";this.futureDayColor="#c2d8f2";this.futureDayBgColor="";this.weekNumberColor="#244366";this.weekNumberBgColor="";this.dayNameColor="#244366";this.dayNameBgColor="";this.weekendDayNameColor="#244366";this.weekendDayNameBgColor="";this.headerColor="white";this.headerBgColor="#244366";this.headerBorder="1px solid #244366";this.dayListBorder="1px solid #244366";this.goBackwardTitle="předchozí měsíc";this.goForwardTitle="další měsíc";this.goTodayTitle="přejít na dnešek";this.dropDownAlign="left";this.dropDownSpace=1;this.dropDownType="DATETIME";this.dayNames=new Array("Po","Út","St","Čt","Pá","So","Ne");this.monthNames=new Array("Leden","Únor","Březen","Duben","Květen","Červen","Červenec","Srpen","Září","Říjen","Listopad","Prosinec");this.holidays="1.1, 1.5, 8.5, 5.7, 6.7, 28.9, 28.10, 17.11, 24.12, 25.12, 26.12";this.strongDays="";this.variableHolidays=new Array();this.variableHolidays[2001]="16.4";this.variableHolidays[2002]="1.4";this.variableHolidays[2003]="21.4";this.variableHolidays[2004]="12.4";this.variableHolidays[2005]="28.3";this.variableHolidays[2006]="17.4";this.variableHolidays[2007]="9.4";this.variableHolidays[2008]="24.3";this.variableHolidays[2009]="13.4";this.variableHolidays[2010]="5.4";this.variableHolidays[2011]="25.4";this.variableHolidays[2012]="9.4";this.variableHolidays[2013]="1.4";this.variableHolidays[2014]="21.4";this.variableHolidays[2015]="6.4";this.variableHolidays[2016]="28.3";this.variableHolidays[2017]="17.4";this.variableHolidays[2018]="2.4";this.variableHolidays[2019]="22.4";this.variableHolidays[2020]="12.4";this.monthToQuarter=new Array(0,1,1,1,2,2,2,3,3,3,4,4,4);this.onchange=null;this.viewDate=null;this.activeDate=null;this._tb=null;this._dt=a?a:new Date();this._dt=new Date(this._dt.getFullYear(),this._dt.getMonth(),this._dt.getDate(),0,0,0);this._win=c?c:window;this._obj=b?b:null;this._id=d?"calendar_"+d:"calendar_"+Math.floor((Math.random()*1000));this._actDay=null;this._actDayVal=null;this._drDw=false;this._drDwInp=null;this._drDwDck=null;this._drDwCall=null;this._drDwTime="00:00";vizus.cms.form.calendar.instances[this._id]=this;this.render=function(){this.viewDate=this._dt;this._dtVal=this._dt.valueOf();this._tb=this._win.document.createElement("TABLE");this._tb.border=0;this._tb.cellSpacing=0;this._tb.cellPadding=0;this._tb.className="form-calendar";var m=this._tb.style;m.color=this.color;m.backgroundColor=this.bgColor;m.border=this.border;var i=this._tb.insertRow(-1);i.className="header";var r=i.style;r.color=this.headerColor;r.backgroundColor=this.headerBgColor;if(this.showGoToday){var s=this._win.document.createElement("TD");s.className="go-today";s.id=this._id;s.onclick=this.goToday;s.title=this.goTodayTitle;s.style.borderBottom=this.headerBorder;i.appendChild(s)}var s=this._win.document.createElement("TD");s.className="go-backward";s.id=this._id;s.onclick=this.goBackward;s.title=this.goBackwardTitle;s.style.borderBottom=this.headerBorder;i.appendChild(s);s=this._win.document.createElement("TD");s.className="title";s.colSpan=this.showWeekNumber?(this.showGoToday?5:6):(this.showGoToday?4:5);s.style.color=this.headerColor;s.style.borderBottom=this.headerBorder;s.appendChild(this._win.document.createTextNode(this.monthNames[this._dt.getMonth()]+" "+this._dt.getFullYear().toString()));i.appendChild(s);s=this._win.document.createElement("TD");s.className="go-forward";s.id=this._id;s.onclick=this.goForward;s.title=this.goForwardTitle;s.style.borderBottom=this.headerBorder;i.appendChild(s);if(this.showDayName){i=this._tb.insertRow(-1);if(this.showWeekNumber){s=this._win.document.createElement("TD");s.appendChild(this._win.document.createTextNode(" "));i.appendChild(s)}for(var p=0;p<7;p++){s=this._win.document.createElement("TD");s.align="center";s.vAlign="bottom";s.className="day-name";var l=s.style;l.color=this.dayNameColor;l.backgroundColor=this.dayNameBgColor;if(p>4){l.color=this.weekendDayNameColor;l.backgroundColor=this.weekendDayNameBgColor}s.appendChild(this._win.document.createTextNode(this.dayNames[p]));i.appendChild(s)}}this._mtBeg=new Date(this._dt.getFullYear(),this._dt.getMonth(),1,0,0,0);this._mtBegVal=this._mtBeg.valueOf();this._mtEnd=new Date(this._dt.getFullYear(),this._dt.getMonth(),1,0,0,0);this._mtEnd.setMonth(this._mtBeg.getMonth()+1);this._mtEnd.setDate(0);this._mtEndVal=this._mtEnd.valueOf();this._dtBeg=new Date(this._mtBeg.valueOf());this._dtBeg.setDate(-(7*this.historyWeeks-1)-(this._dtBeg.getDay()?this._dtBeg.getDay()-1:6));this._dtEnd=new Date(this._mtEnd.valueOf());this._dtEnd.setDate(this._dtEnd.getDate()+(7*this.futureWeeks-1)+(this._dtEnd.getDay()?6-this._dtEnd.getDay():0));this._dtEndVal=this._dtEnd.valueOf();if(this.monthWeeks){var o=0;if(this._mtBeg.getDay()!=1){o++;var t=new Date(this._mtBegVal);t.setDate(t.getDate()+(t.getDay()?8-t.getDay():1));var j=t.valueOf()}else{var t=new Date(this._mtBegVal);var j=this._mtBegVal}if(this._mtEnd.getDay()){o++;var n=new Date(this._mtEndVal);n.setDate(n.getDate()-n.getDay())}else{var n=new Date(this._mtEndVal)}n.setDate(n.getDate()+1);mtEndVal=n.valueOf();o+=Math.round((mtEndVal-j)/(1000*3600*24*7));if(o>this.monthWeeks||o<this.monthWeeks){var e=this.futureWeeks+(o>this.monthWeeks?-1:1);this._dtEnd=new Date(this._mtEnd.valueOf());this._dtEnd.setDate(this._dtEnd.getDate()+(7*e-1)+(this._dtEnd.getDay()?6-this._dtEnd.getDay():0));this._dtEndVal=this._dtEnd.valueOf()}}var h=new Date(this._dtBeg.valueOf());var k=h.valueOf();var q=h.toString();var g=this.showDayName?2+this.historyWeeks:1+this.historyWeeks;while(k<=this._dtEndVal){i=this._tb.insertRow(-1);if(this.showWeekNumber){s=this._win.document.createElement("TD");s.align="right";s.vAlign="bottom";s.className="week-number";l=s.style;l.color=this.weekNumberColor;l.backgroundColor=this.weekNumberBgColor;l.borderRight=this.dayListBorder;s.appendChild(this._win.document.createTextNode(this._getWeekNumber(h)));i.appendChild(s)}for(var p=1;p<=7;p++){s=this._win.document.createElement("TD");s.id=this._id;s.onclick=this.goDay;s.dt=q;s.className="day";var l=s.style;if(k<this._mtBegVal||k>this._mtEndVal){l.color=this.outerDayColor;l.backgroundColor=this.outerDayBgColor}else{if(k==this._dtVal){l.color=this.activeDayColor;l.backgroundColor=this.activeDayBgColor;this._actDay=s;this._actDayVal=k;this.activeDate=new Date(k)}else{if(this._isHoliday(h)){l.color=this.holidayColor;l.backgroundColor=this.holidayBgColor}else{if(p>5){l.color=this.weekendDayColor;l.backgroundColor=this.weekendDayBgColor}else{l.color=this.dayColor;l.backgroundColor=this.dayBgColor}}}}if(this._isStrongDay(h)){l.fontWeight="bold"}if(this.timeColorMode==1&&this._actDay!=s){if(k<this._todayVal){l.color=this.historyDayColor;l.backgroundColor=this.historyBgColor}else{if(k>this._mtEndVal){l.color=this.futureDayColor;l.backgroundColor=this.futureBgColor}}}if(p>1){l.borderLeft=this.dayBorder}if(this._tb.rows.length==g&&this.showDayName){l.borderTop=this.dayListBorder}else{if(this._tb.rows.length>g){l.borderTop=this.dayBorder}}if(k==this._todayVal){var f=this._win.document.createElement("DIV");f.id=this._id;f.className="today";f.style.border=this.todayBorder;f.appendChild(this._win.document.createTextNode(h.getDate()));l.padding=0;s.appendChild(f)}else{s.appendChild(this._win.document.createTextNode(h.getDate()))}i.appendChild(s);h.setDate(h.getDate()+1);k=h.valueOf();q=h.toString()}}if(!this._obj){return}if(this._obj.childNodes.length){this._obj.replaceChild(this._tb,this._obj.childNodes[0])}else{this._obj.appendChild(this._tb)}if(this.onchange&&this.activeMode){this.onchange(this._dt)}};this.goBackward=function(j,k){var f=window.event?window.event:j;var i=f.target||f.srcElement;if(k&&vizus.cms.form.calendar.instances[k]){var h=vizus.cms.form.calendar.instances[k]}else{if(f&&i.id.indexOf("calendar_")==0&&vizus.cms.form.calendar.instances[i.id]){var h=vizus.cms.form.calendar.instances[i.id]}else{return}}var g=new Date(h._dtVal);g.setDate(1);g.setMonth(g.getMonth()-1);if(h._getMonthDays(g)<h._dt.getDate()){h._dt.setDate(h._getMonthDays(g));h._dt.setMonth(h._dt.getMonth()-1)}else{h._dt.setMonth(h._dt.getMonth()-1)}h.today();h.render();if(h.onchange&&h.activeMode){h.onchange(h._dt)}h._stopEvent(f)};this.goForward=function(j,k){var f=window.event?window.event:j;var i=f.target||f.srcElement;if(k&&vizus.cms.form.calendar.instances[k]){var h=vizus.cms.form.calendar.instances[k]}else{if(f&&i.id.indexOf("calendar_")==0&&vizus.cms.form.calendar.instances[i.id]){var h=vizus.cms.form.calendar.instances[i.id]}else{var h=this}}var g=new Date(h._dtVal);g.setDate(1);g.setMonth(g.getMonth()+1);if(h._getMonthDays(g)<h._dt.getDate()){h._dt.setDate(h._getMonthDays(g));h._dt.setMonth(h._dt.getMonth()+1)}else{h._dt.setMonth(h._dt.getMonth()+1)}h.today();h.render();if(h.onchange&&h.activeMode){h.onchange(h._dt)}h._stopEvent(f)};this.goToday=function(i,j){var f=window.event?window.event:i;var h=f.target||f.srcElement;if(j&&vizus.cms.form.calendar.instances[j]){var g=vizus.cms.form.calendar.instances[j]}else{if(f&&h.id.indexOf("calendar_")==0&&vizus.cms.form.calendar.instances[h.id]){var g=vizus.cms.form.calendar.instances[h.id]}else{var g=this}}g.today();g._dt=new Date(g._today.valueOf());g.render();if(g.onchange&&g.activeMode){g.onchange(g._dt)}g._stopEvent(f)};this.goDay=function(s,h,j){var o=window.event?window.event:s;var q=o.target||o.srcElement;if(o&&q.id.indexOf("calendar_")==0&&vizus.cms.form.calendar.instances[q.id]){h=q.id;var f=q;var v=f.tagName=="DIV"?f.parentNode:f;var g=vizus.cms.form.calendar.instances[v.id];var j=new Date(Date.parse(v.dt));var n=j.valueOf();if(n<g._mtBegVal||n>g._mtEndVal){g._dt=new Date(j.valueOf());g.render()}else{if(g._actDay){var l=new Date(g._dtVal);var r=g._actDay.style;var i=l.getDay();if(g._isHoliday(l)){r.color=g.holidayColor;r.backgroundColor=g.holidayBgColor}else{if(i==6||i==0){r.color=g.weekendDayColor;r.backgroundColor=g.weekendDayBgColor}else{r.color=g.dayColor;r.backgroundColor=g.dayBgColor}}r.cursor=""}var p=v.style;p.color=g.activeDayColor;p.backgroundColor=g.activeDayBgColor;p.cursor="default";g._dt=new Date(n);g._dtVal=n;g._actDay=v;g._actDayVal=n;g.activeDate=new Date(n)}if(g._win.event){g._win.event.cancelBubble=true;g._win.event.returnValue=false}}else{var g=(h&&vizus.cms.form.calendar.instances[h]&&j)?vizus.cms.form.calendar.instances[h]:this;g._dt=j;g.render()}if(g.onchange){g.onchange(g._dt)}if(g._drDw){var t=g._dt.getDate();var k=g._dt.getMonth()+1;var u=g._dt.getFullYear();if(g.dropDownType=="DATETIME"){g._drDwInp.value=t+"."+k+"."+u+(g._drDwTime.length?", "+g._drDwTime:"")}else{if(g.dropDownType=="DATE_TIME"||g.dropDownType=="DATE"){g._drDwInp.value=t+"."+k+"."+u}else{if(g.dropDownType=="DDMMYY"||g.dropDownType=="DDMMYYY"){g._drDwInp.value=g._zeroPad(t)+g._zeroPad(k)+u.toString().substr(2,2)}else{if(g.dropDownType=="DDMMYYYY"){g._drDwInp.value=g._zeroPad(t)+g._zeroPad(k)+u}}}}if(g._drDwInp.fireEvent){g._drDwInp.fireEvent("onchange")}g._win.setTimeout('vizus.cms.form.calendar.instances["'+h+'"]._dropUp()',200)}};this.setQuickDate=function(l,f){var h=document.getElementById(l+"Date");if(!h){h=document.getElementById(l+"Str")}if(!h){h=document.getElementById(l)}if(!h){return}if(this._drDw){return}for(var l in vizus.cms.form.calendar.instances){if(vizus.cms.form.calendar.instances[l]._drDw){vizus.cms.form.calendar.instances[l]._dropUp();break}}switch(f){case"TODAY":var g=new Date();var i=g.getDate();var e=g.getMonth()+1;var k=g.getFullYear();var j=g.getMinutes();if(j<10){j="0"+j.toString()}if(this.dropDownType=="DATETIME"){h.value=i+"."+e+"."+k+", "+g.getHours()+":"+j}else{if(this.dropDownType=="DATE_TIME"||this.dropDownType=="DATE"){h.value=i+"."+e+"."+k}else{if(this.dropDownType=="DDMMYY"||this.dropDownType=="DDMMYYY"){h.value=this._zeroPad(i)+this._zeroPad(e)+k.toString().substr(2,2)}else{if(this.dropDownType=="DDMMYYYY"){h.value=this._zeroPad(i)+this._zeroPad(e)+k}}}}break;case"FIRST_QUARTER_DAY":var g=new Date();var i=1;var e=(Math.ceil((g.getMonth()+1)/3)-1)*3+1;var k=g.getFullYear();if(this.dropDownType=="DATETIME"){h.value=i+"."+e+"."+k+", 00:00"}else{if(this.dropDownType=="DATE_TIME"||this.dropDownType=="DATE"){h.value=i+"."+e+"."+k}else{if(this.dropDownType=="DDMMYY"||this.dropDownType=="DDMMYYY"){h.value=this._zeroPad(i)+this._zeroPad(e)+k.toString().substr(2,2)}else{if(this.dropDownType=="DDMMYYYY"){h.value=this._zeroPad(i)+this._zeroPad(e)+k}}}}break;case"LAST_QUARTER_DAY":var g=new Date();var i=0;var e=Math.ceil((g.getMonth()+1)/3)*3;var k=g.getFullYear();g.setMonth(e-1);i=this._getMonthDays(g);if(this.dropDownType=="DATETIME"){h.value=i+"."+e+"."+k+", 23:59"}else{if(this.dropDownType=="DATE_TIME"||this.dropDownType=="DATE"){h.value=i+"."+e+"."+k}else{if(this.dropDownType=="DDMMYY"||this.dropDownType=="DDMMYYY"){h.value=this._zeroPad(i)+this._zeroPad(e)+k.toString().substr(2,2)}else{if(this.dropDownType=="DDMMYYYY"){h.value=this._zeroPad(i)+this._zeroPad(e)+k}}}}break;default:h.value=f;break}};this.dropDown=function(p){var k=document.getElementById(p+"Ico");var f=document.getElementById(p+"Date");if(!f){f=document.getElementById(p+"Str")}if(!f){f=document.getElementById(p)}if(!(f&&k)){return}if(this._drDw){return}for(var p in vizus.cms.form.calendar.instances){if(vizus.cms.form.calendar.instances[p]._drDw){vizus.cms.form.calendar.instances[p]._dropUp();break}}if(this.dropDownType=="DATETIME"){this._drDwTime=f.value.match(/(\d{1,2}:\d{1,2})/)?RegExp.$1:"00:00"}else{this._drDwTime=""}if(f.value.match(/(\d+)\.(\d+)\.(\d+)/)){var u=RegExp.$1;var q=parseInt(RegExp.$2,10);var j=parseInt(RegExp.$3,10);if(j<100){j+=(j<38)?2000:1900}var o=new Date(j,q-1,u,0,0,0)}else{var o=new Date()}if(this._drDwDck){var r=this._drDwDck}else{this._drDwDck=this._win.document.createElement("DIV");var r=this._drDwDck;this._win.document.body.appendChild(r)}k.style.position="relative";var i=r.style;i.zIndex=11;i.position="absolute";i.display="";this._drDwInp=f;this._drDw=true;this._dt=this.activeDate=o;this._obj=r;this.render();var x=this.dropDownAlign;var n=this.dropDownSpace;var l=this._tb.offsetWidth;var t=this._tb.offsetHeight;var A=k.getBoundingClientRect?k.getBoundingClientRect():{top:k.offsetTop,left:k.offsetLeft};var e=k.offsetLeft;var z=k.offsetTop;var v=k.offsetWidth;var g=k.offsetHeight;i.width=l;i.height=t;if(i.pixelTop!==undefined){i.pixelTop=(A.top+g+n+t>this._win.document.body.clientHeight)?z-n-t:z+g+n}else{i.top=((A.top+g+n+t>this._win.document.body.clientHeight)?z-n-t:z+g+n)+"px"}if(i.pixelTop!==undefined){if(this.dropDownAlign.toLowerCase()=="left"){i.pixelLeft=(A.left+l>this._win.document.body.clientWidth)?e+v-l:e}else{if(this.dropDownAlign.toLowerCase()=="right"){i.pixelLeft=(A.left+v-l<0)?e:e+v-l}else{i.pixelLeft=Math.floor(e+v/2-l/2)}}}else{if(this.dropDownAlign.toLowerCase()=="left"){i.left=((e+l>this._win.document.body.clientWidth)?e+v-l:e)+"px"}else{if(this.dropDownAlign.toLowerCase()=="right"){i.left=((e+v-l<0)?e:e+v-l)+"px"}else{i.left=(Math.floor(e+v/2-l/2))+"px"}}}if(this._win.event){this._win.event.cancelBubble=true;this._win.event.returnValue=false}if(this._win.document.onclick){this._drDwCall=this._win.document.onclick}this._win.document.onclick=this._dropUp};this.today=function(){this._today=new Date(new Date().getFullYear(),new Date().getMonth(),new Date().getDate(),0,0,0);this._todayVal=this._today.valueOf()};this.move=function(q,l,r){var g=document.getElementById(q+"Date");if(!g){g=document.getElementById(q+"Str")}if(!g){g=document.getElementById(q)}if(!g){return}if(this._drDw){return}for(var q in vizus.cms.form.calendar.instances){if(vizus.cms.form.calendar.instances[q]._drDw){vizus.cms.form.calendar.instances[q]._dropUp();break}}var f=new Date();var w=f.getDate();var t=f.getMonth();var k=f.getFullYear();var u=f.getHours();var s=f.getMinutes();var i="";if(g.value.match(/^(\d{1,2})\.(\d{1,2})\.(\d{2,4})(, *(\d{1,2}):(\d{2})){0,1}/)){var z=RegExp.$1;var v=RegExp.$2;var p=RegExp.$3;if(RegExp.$4){i=RegExp.$4;var j=RegExp.$5;var e=RegExp.$6;u=parseInt(j.replace(/^0/,""),10);s=parseInt(e.replace(/^0/,""),10)}w=parseInt(z.replace(/^0/,""),10);t=parseInt(v.replace(/^0/,""),10)-1;k=parseInt(p.replace(/^0/,""),10)}else{if(g.value.match(/^(\d{2})(\d{2})(\d{2,4})/)){var z=RegExp.$1;var v=RegExp.$2;var p=RegExp.$3;w=parseInt(z.replace(/^0/,""),10);t=parseInt(v.replace(/^0/,""),10)-1;k=parseInt(p.replace(/^0/,""),10);u=0;s=0}}switch(l){case"YEAR":k+=r;break;case"MONTH":var x=new Date(k,t+r,1,u,s,0);var A=this._getMonthDays(x);if(A<w){w=A}t+=r;break;default:case"DAY":w+=r;break}var o=new Date(k,t,w,u,s,0);w=o.getDate();t=o.getMonth()+1;k=o.getFullYear();if(this.dropDownType=="DATETIME"){g.value=w+"."+t+"."+k+(i?i:", 00:00")}else{if(this.dropDownType=="DATE_TIME"||this.dropDownType=="DATE"){g.value=w+"."+t+"."+k}else{if(this.dropDownType=="DDMMYY"){g.value=this._zeroPad(w)+this._zeroPad(t)+k.toString().substr(2,2)}else{if(this.dropDownType=="DDMMYYYY"){g.value=this._zeroPad(w)+this._zeroPad(t)+k}}}}};this._dropUp=function(){for(var f in vizus.cms.form.calendar.instances){if(vizus.cms.form.calendar.instances[f]._drDw){var e=vizus.cms.form.calendar.instances[f];break}}if(!e){return true}e._drDw=false;e._drDwDck.style.display="none";if(e._drDwCall){e._drDwCall();e._win.document.onclick=e._drDwCall}};this._isHoliday=function(g){var i=g.getFullYear();var e=g.getMonth()+1;var h=g.getDate();var f=new RegExp("\\b"+h+"\\."+e+"\\b");if(this.holidays.match(f)!==null){return true}else{if(this.variableHolidays[i]!=null&&this.variableHolidays[i].match(f)!==null){return true}else{return false}}};this._isStrongDay=function(g){if(!this.strongDays){return false}var i=g.getFullYear();var e=g.getMonth()+1;var h=g.getDate();var f=new RegExp("\\b"+h+"\\."+e+"\\."+i+"\\b");if(this.strongDays.match(f)!==null){return true}else{return false}};this._getMonthDays=function(f){var e=new Date(f.getFullYear(),f.getMonth(),1,0,0,0);e.setMonth(e.getMonth()+1);e.setDate(0);return e.getDate()};this._getWeekNumber=function(f){var n=f?f:new Date();var k=this._takeYear(n);var g=n.getMonth();var j=n.getDate();var e=Date.UTC(k,g,j+1,0,0,0);var l=new Date();l.setYear(k);l.setMonth(0);l.setDate(1);var h=Date.UTC(k,0,1,0,0,0);var i=l.getDay();if(i>3){i-=4}else{i+=3}return Math.round((((e-h)/86400000)+i)/7)};this._takeYear=function(f){var e=f.getFullYear();var g=e%100;g+=(g<38)?2000:1900;return g};this._stopEvent=function(f){if(f.cancelBubble!=null){f.cancelBubble=true}if(f.stopPropagation){f.stopPropagation()}if(f.preventDefault){f.preventDefault()}if(window.event){f.returnValue=false}if(f.cancel!=null){f.cancel=true}};this._zeroPad=function(f,e){if(!e){e=2}f=f.toString();return"00000000000000000000000000000000".substr(0,e-f.length)+f};this.today()};