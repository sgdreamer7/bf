//////////////////////////////////////////////////////////////////////////////////////////////
// Автор: Владимир Щербина <vns.scherbina@gmail.com>
// copyright 2017
// Версия: 1.0.0
// Модуль all_reports.js реализует меню для вызова протоколов и рапортов.
//////////////////////////////////////////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////////////////////////////////////////
// Локальные переменные //
//////////////////////////

////////////////////////////////////////////////////////////////////////////////
// Инициализация
////////////////////////////////////////////////////////////////////////////////
Number.prototype.format = function(digits,units) {
    if (digits==-1) {
            return this.toString();
    } else {
        if (units=="") {
                return this.toFixed(digits);
        } else {
            return "{0} {1}".format(this.toFixed(digits),units);
        }
    }
};

var ts=new Date();
document.write('<h1>МК \"Завод\", Доменная печь.</h1><hr/><h1>АСУТП ДП:</h1><hr/><p><h2>Протоколы и рапорта</h2></p>');
document.write('<p><h3>Дата и время начала периода:</h3></p>');
document.write('<p><h4>Год:'+buildSelectInput('year1',ts.getFullYear(),2014,2033)+', Месяц:'+buildSelectInput('month1',ts.getMonth()+1,1,12)+', День:'+buildSelectInput('day1',ts.getDate(),1,31)+', Час:'+buildSelectInput('hour1',0,0,23)+', Минута:'+buildSelectInput('minute1',0,0,59)+', Секунда:'+buildSelectInput('second1',0,0,59)+'</h4></p><hr/>');
document.write('<p><h3>Дата и время окончания периода:</h3></p>');
document.write('<p><h4>Год:'+buildSelectInput('year2',ts.getFullYear(),2014,2033)+', Месяц:'+buildSelectInput('month2',ts.getMonth()+1,1,12)+', День:'+buildSelectInput('day2',ts.getDate(),1,31)+', Час:'+buildSelectInput('hour2',0,0,23)+', Минута:'+buildSelectInput('minute2',0,0,59)+', Секунда:'+buildSelectInput('second2',0,0,59)+'</h4></p><hr/>');
buildReportsMenuHtml(ReportsMenu);


function buildReportsMenuHtml(reps) {
	var i=0;
	var repHtml='';
	for (i=0; i<reps.length; i++) {
		var repText=reps[i].text;
		var repID=reps[i].id;
		var repSubMenu=reps[i].submenu;
		if (repSubMenu==undefined) {
			repHtml='<li><a href=\'/rest/reports'+get_report_params(repID)+'\'>'+repText+'</a>';
			document.write(repHtml);
		} else {
			repHtml='<li>'+repText+'</li><ul>';
			document.write(repHtml);
			buildReportsMenuHtml(repSubMenu);
			repHtml='</ul>';
			document.write(repHtml);
		}
	}
}

function get_report_params(ID) {
	var Params=ReportsParams[ID];
	var res='';
	res='/'+Params.template+'/'+Params.datasource;
	if ((ID=='ID_PROGS') || (ID=='ID_CYCLES')) {
		res=res+'/report_date/'+getSelectValue('year1')+'-'+getSelectValue('month1')+'-'+getSelectValue('day1')+'-'+getSelectValue('hour1')+'-'+getSelectValue('minute1')+'-'+getSelectValue('second1')+'/report_date2/'+getSelectValue('year2')+'-'+getSelectValue('month2')+'-'+getSelectValue('day2')+'-'+getSelectValue('hour2')+'-'+getSelectValue('minute2')+'-'+getSelectValue('second2');
	} else if (
		(ID=='ID_DOWNLOADS_BY_DAY') || 
		(ID=='ID_DOZING') ||
		(ID=='ID_TER') ||
		(ID=='ID_MONTHLY_FUEL_ENERGY') ||
		(ID=='ID_JOURNAL_1') ||
		(ID=='ID_JOURNAL_2') ||
		(ID=='ID_JOURNAL_3') ||
		(ID=='ID_JOURNAL_4') ||
		(ID=='ID_JOURNAL_5') ||
		(ID=='ID_JOURNAL_6') ||
		(ID=='ID_JOURNAL_7') ||
		(ID=='ID_JOURNAL_8') ||
		(ID=='ID_JOURNAL_10') ||
		(ID=='ID_JOURNAL_11') ||
		(ID=='ID_JOURNAL_12') ||
		(ID=='ID_JOURNAL_13')
		) {
		res=res+'/report_date/'+getSelectValue('year1')+'-'+getSelectValue('month1')+'-'+getSelectValue('day1')+'-'+getSelectValue('hour1')+'-'+getSelectValue('minute1')+'-'+getSelectValue('second1');
	} else if (ID=='ID_MOMENTARY_VALUES') {
		res=res+'/report_date/0-0-0-0-0-0';
	} else {
		res=res+'/report_date/'+getSelectValue('year1')+'-'+getSelectValue('month1')+'-'+getSelectValue('day1')+'-'+getSelectValue('hour1')+'-'+getSelectValue('minute1')+'-'+getSelectValue('second1')+'/shift/'+(Params.shift).format(0,'');
	}
	return res;
}

function getSelectValue(id) {
	return document.getElementById(id).options[document.getElementById(id).selectedIndex].value;
}


function buildSelectInput(id,value,from,to) {
	var str='<select id=\''+id+'\' size=\'1\'>';
	var i=0;
	for (i=from; i<=to; i++) {
		str=str+'<option value=\''+i.format(0,'')+'\''+(i==value ? ' selected>' : '>')+i.format(0,'')+'</option>';
	}
	str=str+'</select>';
	return str;
}
