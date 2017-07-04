//////////////////////////////////////////////////////////////////////////////////////////////
// Автор: Владимир Щербина <vns.scherbina@gmail.com>
// copyright 2017
// Версия: 1.0.0
// Модуль comm.js реализует коммуникационный интерфейс с серверной частью по протоколу HTTP.
//////////////////////////////////////////////////////////////////////////////////////////////


//////////////////////////////////////////////////////////////////////////////////////////////
// Локальные переменные //
//////////////////////////
var DEBUG_TIME=false;
var commID=document.documentURI;
var lastTrendsScript="";
var lastReportsScript="";

//////////////////////////////////////////////////////////////////////////////////////////////
// Инициализация при запуске модуля //
//////////////////////////////////////

window.setInterval(memoryLoop,1000);
window.setInterval(animator,10);
// window.setInterval(trendsUpdater,5000);
// window.setInterval(reportsUpdater,5000);

//////////////////////////////////////////////////////////////////////////////////////////////
// public функции //
////////////////////

//////////////////////////////////////////////////////////////////////////////////////////////
// Формат вызова: getTag(tagName)
// Назначение: Чтение значение тега с типом по умолчанию (тип по умолчанию - float)
// Параметры:
//             tagName - имя тега.
//////////////////////////////////////////////////////////////////////////////////////////////
function getTag(tagName) {
	return getFltTag(tagName);
}


//////////////////////////////////////////////////////////////////////////////////////////////
// Формат вызова: getBoolTag(tagName)
// Назначение: Чтение значение тега с типом boolean
// Параметры:
//             tagName - имя тега.
//////////////////////////////////////////////////////////////////////////////////////////////
function getBoolTag(tagName) {
	return Main.getBoolTag(new java.lang.String(tagName),new java.lang.String(commID));
}

//////////////////////////////////////////////////////////////////////////////////////////////
// Формат вызова: getFltTag(tagName)
// Назначение: Чтение значение тега с типом float
// Параметры:
//             tagName - имя тега.
//////////////////////////////////////////////////////////////////////////////////////////////
function getFltTag(tagName) {
	return Main.getFltTag(new java.lang.String(tagName),new java.lang.String(commID));
}

//////////////////////////////////////////////////////////////////////////////////////////////
// Формат вызова: getStrTag(tagName)
// Назначение: Чтение значение тега с типом string
// Параметры:
//             tagName - имя тега.
//////////////////////////////////////////////////////////////////////////////////////////////
function getStrTag(tagName) {
	return Main.getStrTag(new java.lang.String(tagName),new java.lang.String(commID));
}

//////////////////////////////////////////////////////////////////////////////////////////////
// Формат вызова: setTag(tagName,tagValue)
// Назначение: Запись значения тега с типом по умолчанию (тип по умолчанию - float)
// Параметры:
//             tagName - имя тега;
//             tagValue - значение тега.
//////////////////////////////////////////////////////////////////////////////////////////////
function setTag(tagName,tagValue) {
	setFltTag(tagName,tagValue);
}

//////////////////////////////////////////////////////////////////////////////////////////////
// Формат вызова: setBoolTag(tagName,tagValue)
// Назначение: Запись значения тега с типом boolean
// Параметры:
//             tagName - имя тега;
//             tagValue - значение тега.
//////////////////////////////////////////////////////////////////////////////////////////////
function setBoolTag(tagName,tagValue) {
	var tgValue=false;
	if ((tagValue==true) || (tagValue==1) || (tagValue==1.0)) {
		tgValue=true;
	}
	setTypedTag('bool',tagName,tgValue);
}

//////////////////////////////////////////////////////////////////////////////////////////////
// Формат вызова: setFltTag(tagName,tagValue)
// Назначение: Запись значения тега с типом float
// Параметры:
//             tagName - имя тега;
//             tagValue - значение тега.
//////////////////////////////////////////////////////////////////////////////////////////////
function setFltTag(tagName,tagValue) {
	setTypedTag('flt',tagName,tagValue);
}

//////////////////////////////////////////////////////////////////////////////////////////////
// Формат вызова: setIntTag(tagName,tagValue)
// Назначение: Запись значения тега с типом integer
// Параметры:
//             tagName - имя тега;
//             tagValue - значение тега.
//////////////////////////////////////////////////////////////////////////////////////////////
function setIntTag(tagName,tagValue) {
	setTypedTag('int',tagName,tagValue);
}

//////////////////////////////////////////////////////////////////////////////////////////////
// Формат вызова: setStrTag(tagName,tagValue)
// Назначение: Запись значения тега с типом string
// Параметры:
//             tagName - имя тега;
//             tagValue - значение тега.
//////////////////////////////////////////////////////////////////////////////////////////////
function setStrTag(tagName,tagValue) {
	setTypedTag('str',tagName,tagValue);
}

//////////////////////////////////////////////////////////////////////////////////////////////
// Формат вызова: acknowledgeMessage(messageID)
// Назначение: Квитирование аварийного сообщения.
// Параметры:
//             messageID - идентификатор сообщения.
//////////////////////////////////////////////////////////////////////////////////////////////
function acknowledgeMessage(messageID) {
	Main.execute_async_js2(new java.lang.String('acknowledge_message'),{id:messageID},null);
}

//////////////////////////////////////////////////////////////////////////////////////////////
// Формат вызова: acknowledgeMessages(messagesIDs)
// Назначение: Квитирование списка аварийных сообщений.
// Параметры:
//             messagesIDs - массив идентификаторов сообщений.
//////////////////////////////////////////////////////////////////////////////////////////////
function acknowledgeMessages(messagesIDs) {
	Main.execute_async_js2(new java.lang.String('acknowledge_messages'),{ids:messagesIDs},null);
}

function process_messages(Res) {
	var checkRes=false;
	if (Res!=null) {
		if (Res[0]!="") {
			checkRes=true;
		}
	}
	if (checkRes==true) {
		return [].concat(JSON.parse(Res[0]));
	} else {
		var Msgs=[];
		var ts=new Date();
		var Alarm={
			id:'',
			date:ts.dateFormat('Y-m-d',true),
			time:ts.dateFormat('H:i:s',true),
			description:'Нет связи с сервером',
			priority:1,
			value:Main.lastBackend,
			units:'',
			state:'OK',
			acknowledged:true
		};
		Msgs[0]=Alarm;
		return [].concat(Msgs);
	}
}

//////////////////////////////////////////////////////////////////////////////////////////////
// Формат вызова: changeRefValue(tagName,minValue,maxValue,title)
// Назначение: Ввод и изменение значения вещественного параметра.
// Параметры:
//             tagName 	- имя тега;
//             minValue - минимальное значение параметра;
//             maxValue - максимальное значение параметра;
//             title	- заголовок диалогового окна.
//////////////////////////////////////////////////////////////////////////////////////////////
function changeRefValue(tagName,minValue,maxValue,title) {
	var refValue=getFltTag(tagName);
	var res=prompt('Введите значение параметра \''+title+'\' (от '+minValue.format(-1,'')+' до '+maxValue.format(-1,'')+')', refValue);
	if (!(res==null)) {
		try {
			var answer=new java.lang.Double(res);
			if (!((answer.doubleValue()>=minValue) && (answer.doubleValue()<=maxValue))) {
			    alert('Введенное значение находится вне допустимых пределов');
			} else {
				setFltTag(tagName,answer.doubleValue());
			}
		} catch (e) {
			alert('Введенное значение не является числом');
		}
	}
}

//////////////////////////////////////////////////////////////////////////////////////////////
// private функции //
/////////////////////

function setTypedTag(tagType,tagName,tagValue) {
	Main.execute_async_js3(new java.lang.String('set_tag'),{type:tagType,name:tagName,value:tagValue},null);
}

function process_tags_list(Res) {
	var checkRes=false;
	if (Res!=null) {
		if (Res[0]!="") {
			checkRes=true;
		}
	}
	if (checkRes==true) {
		var Data=JSON.parse(Res[0]);
		var Tgs=[];
		for (var Key in Data) {
			if (typeof Data[Key] == 'string') {
				Tgs[Key]=Data[Key];
			}
		}
		return [].concat(Tgs);
	}
	return null;
}

function showURL(url) {
	BrowserFrame.showURL(url);
}

function memoryLoop() {
	try {
		if (isVisibleFrame(commID)==true) {
			var HostName=Packages.com.cmas.hmi.Main.localhostname.replace(new RegExp('-','g'),'_');
			var rt=Runtime.getRuntime();
			var clientN=Packages.com.cmas.hmi.Main.screen.format(0,'');
			var MemoryTagName=HostName+'_'+'MEMORY_CLIENT_USED_'+clientN;
			setFltTag(MemoryTagName,rt.totalMemory()-rt.freeMemory());
			var mem=Packages.com.cmas.hmi.Main.getMemoryUsage();
			setFltTag(HostName+'_'+'CLIENT_MEMORY_CODE_CACHE_USED_'+clientN,mem[0]);
			setFltTag(HostName+'_'+'CLIENT_MEMORY_CODE_CACHE_RESERVED_'+clientN,mem[1]);
			setFltTag(HostName+'_'+'CLIENT_MEMORY_EDEN_SPACE_USED_'+clientN,mem[2]);
			setFltTag(HostName+'_'+'CLIENT_MEMORY_EDEN_SPACE_RESERVED_'+clientN,mem[3]);
			setFltTag(HostName+'_'+'CLIENT_MEMORY_SURVIVOR_SPACE_USED_'+clientN,mem[4]);
			setFltTag(HostName+'_'+'CLIENT_MEMORY_SURVIVOR_SPACE_RESERVED_'+clientN,mem[5]);
			setFltTag(HostName+'_'+'CLIENT_MEMORY_OLD_GEN_USED_'+clientN,mem[6]);
			setFltTag(HostName+'_'+'CLIENT_MEMORY_OLD_GEN_RESERVED_'+clientN,mem[7]);
			setFltTag(HostName+'_'+'CLIENT_MEMORY_PERM_GEN_USED_'+clientN,mem[8]);
			setFltTag(HostName+'_'+'CLIENT_MEMORY_PERM_GEN_RESERVED_'+clientN,mem[9]);
		}
	} catch (e) {

	}
}

function animator() {
	try {
		if (isVisibleFrame(commID)==true) {
			try {
				animate();
			} catch (e2) {
				print(e2);
			}
		}
	} catch (e) {
		print(e);
	}
}

function trendsUpdater() {
	try {
		if (isVisibleFrame(commID)==true) {
			updateTrends();
		}
	} catch (e) {
		print(e);
	}
}

function reportsUpdater() {
	try {
		if (isVisibleFrame(commID)==true) {
			updateReports();
		}
	} catch (e) {
		print(e);
	}
}