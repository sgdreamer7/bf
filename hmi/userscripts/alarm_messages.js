//////////////////////////////////////////////////////////////////////////////////////////////
// Автор: Владимир Щербина <vns.scherbina@gmail.com>
// copyright 2017
// Версия: 1.0.0
// Модуль alarm_messages.js реализует анимацию и логику диалогового взаимодействия для списка аварийных сообщений.
//////////////////////////////////////////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////////////////////////////////////////
// Локальные переменные //
//////////////////////////
var UndefinedMessageColor='rgb(172,172,172)';
var MaxMessages=3;
var currentMessage=1;
var Messages=[];
var maxLen=55;
var emptyStr='';

init_alarm_messages();

//////////////////////////////////////////////////////////////////////////////////////////////
// public функции //
////////////////////

//////////////////////////////////////////////////////////////////////////////////////////////
// Формат вызова: init_alarm_messages()
// Назначение: Начальная инициализация кнопок вызова видеокадров.
// Параметры: -
//////////////////////////////////////////////////////////////////////////////////////////////
function init_alarm_messages() {
	var BackgroundStyle='fill:#ffffff;fill-opacity:1;stroke:#000000;stroke-width:1.0;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:4;stroke-opacity:1;stroke-dasharray:none';

	var Col1Width=120;
	var Col2Width=100;
	var Col3Width=1050;
	
	var Header1={width:Col1Width,background:BackgroundStyle,align:'middle',text:'Дата'};
	var Header2={width:Col2Width,background:BackgroundStyle,align:'middle',text:'Время'};
	var Header3={width:Col3Width,background:BackgroundStyle,align:'middle',text:'Сообщение'};

	var Col1={width:Col1Width,background:BackgroundStyle,align:'middle',text:''};
	var Col2={width:Col2Width,background:BackgroundStyle,align:'middle',text:''};
	var Col3={width:Col3Width,background:BackgroundStyle,align:'start',text:''};

	var Table=[];
	Table[0]=[Header1,Header2,Header3];
	for (var i=1; i<=MaxMessages; i++) {
		Table[i]=[Col1,Col2,Col3];
	}

	createTable('ALARM_TABLE',Table);
	for (Row=1; Row<MaxMessages+1; Row++) {
		setTableRowOnactivate('ALARM_TABLE',Row,'acknowledgeMessageInRow('+Row.format(0,'')+');');
	}

	createRunningMessage();
	window.setInterval(messageAnimator,50);
}


//////////////////////////////////////////////////////////////////////////////////////////////
// private функции //
/////////////////////

//////////////////////////////////////////////////////////////////////////////////////////////
// Формат вызова: animate_messages()
// Назначение: Анимация для отображения аварийных сообщений.
// Параметры: -
//////////////////////////////////////////////////////////////////////////////////////////////
function animate_messages() {
	var i=0;
	var runningAlarmMessage=getStrTag('RUNNING_ALARM_MESSAGE');
	setVisibility('RUNNING_MESSAGE_GROUP',getStrTag('RUNNING_ALARM_MESSAGE').length>0);
	if (runningAlarmMessage.length>0) {
		var runningMessageText='';
		runningMessageText=emptyStr+runningAlarmMessage+emptyStr;
		var currentTS=new Date();
		var strPos=Math.round(currentTS.getTime()/100) % (runningMessageText.length-maxLen);
		var runningMsg="";
		runningMsg=runningMessageText.substr(strPos,maxLen);
		setText('RUNNING_MESSAGE',runningMsg);
	}
	if (currentMessage==1) {
		var MsgsRes=[];
		MsgsRes[0]=Main.getAlarmMessages();
		var Msgs=process_messages(MsgsRes);
		var msgIndex=0;
		var selectedMsgs=[];
		for (msgIndex=0; msgIndex<MaxMessages; msgIndex++) {
			selectedMsgs[msgIndex]=Msgs[msgIndex];
		}
		Messages=selectedMsgs;
	}
	if (Messages!=null) {
		i=currentMessage;
		if (i<=Messages.length) {
			Alarm=Messages[i-1];
			if (Alarm!=undefined) {
				RowColor=Alarm.acknowledged=='true' ? 'rgb(255,255,255)' : Alarm.state=='OK' ? 'rgb(255,255,0)' : 'rgb(255,0,0)';
				TextColor=Alarm.acknowledged=='true' ? 'rgb(2555,0,0)' : 'rgb(0,0,0)';
				setTableText('ALARM_TABLE',i,0,Alarm.date);
				setTableText('ALARM_TABLE',i,1,Alarm.time);
				setTableText('ALARM_TABLE',i,2,(Alarm.description+': '+Alarm.value+' '+Alarm.units).substr(0,100));
				setTableBackColor('ALARM_TABLE',i,0,RowColor);
				setTableBackColor('ALARM_TABLE',i,1,RowColor);
				setTableBackColor('ALARM_TABLE',i,2,RowColor);
				setTableTextColor('ALARM_TABLE',i,0,TextColor);
				setTableTextColor('ALARM_TABLE',i,1,TextColor);
				setTableTextColor('ALARM_TABLE',i,2,TextColor);
			} else {
				setTableText('ALARM_TABLE',i,0,'');
				setTableText('ALARM_TABLE',i,1,'');
				setTableText('ALARM_TABLE',i,2,'');
				setTableBackColor('ALARM_TABLE',i,0,UndefinedMessageColor);
				setTableBackColor('ALARM_TABLE',i,1,UndefinedMessageColor);
				setTableBackColor('ALARM_TABLE',i,2,UndefinedMessageColor);
				setTableTextColor('ALARM_TABLE',i,0,'rgb(0,0,0)');
				setTableTextColor('ALARM_TABLE',i,1,'rgb(0,0,0)');
				setTableTextColor('ALARM_TABLE',i,2,'rgb(0,0,0)');		
			}
		} else {
			setTableText('ALARM_TABLE',i,0,'');
			setTableText('ALARM_TABLE',i,1,'');
			setTableText('ALARM_TABLE',i,2,'');
			setTableBackColor('ALARM_TABLE',i,0,UndefinedMessageColor);
			setTableBackColor('ALARM_TABLE',i,1,UndefinedMessageColor);
			setTableBackColor('ALARM_TABLE',i,2,UndefinedMessageColor);
			setTableTextColor('ALARM_TABLE',i,0,'rgb(0,0,0)');
			setTableTextColor('ALARM_TABLE',i,1,'rgb(0,0,0)');
			setTableTextColor('ALARM_TABLE',i,2,'rgb(0,0,0)');		
		}
		currentMessage=currentMessage==MaxMessages ? 1: currentMessage+1;
	} else {
		currentMessage=1;
	}
}

//////////////////////////////////////////////////////////////////////////////////////////////
// Формат вызова: acknowledgeMessageInRow(Row)
// Назначение: Квитирование сообщения заданного номером строки.
// Параметры:
//             Row 	- номер строки таблицы, в которой отображается квитируемое сообщение.
//////////////////////////////////////////////////////////////////////////////////////////////
function acknowledgeMessageInRow(Row) {
	if (Messages!=null) {
		if (Row<Messages.length) {
			var Alarm=Messages[Row-1];
			var ID=Alarm.id;
			acknowledgeMessage(ID);
		}
	}
}

//////////////////////////////////////////////////////////////////////////////////////////////
// Формат вызова: messageAnimator()
// Назначение: Цикл анимации аварийных сообщений.
// Параметры:
//////////////////////////////////////////////////////////////////////////////////////////////
function messageAnimator() {
	try {
		if (isVisibleFrame(document.documentURI)==true) {
			animate_messages();
		}
	} catch (e) {
		print(e);
	}
}

//////////////////////////////////////////////////////////////////////////////////////////////
// Формат вызова: createRunningMessage()
// Назначение: Создание "бегущей строки" аварийных сообщений.
// Параметры:
//////////////////////////////////////////////////////////////////////////////////////////////
function createRunningMessage() {
	for (i=0; i<maxLen; i++) {
		emptyStr=emptyStr+' ';
	}
	var NS='http://www.w3.org/2000/svg';
	var messageGroup=document.createElementNS(NS,'g');
	messageGroup.setAttributeNS(null,'x',460);
	messageGroup.setAttributeNS(null,'y',0);
	messageGroup.setAttributeNS(null,'width',1380);
	messageGroup.setAttributeNS(null,'height',60);
	messageGroup.setAttributeNS(null,'id','RUNNING_MESSAGE_GROUP');
	var rect=document.createElementNS(NS,'rect');
	rect.setAttributeNS(null,'x',400);
	rect.setAttributeNS(null,'y',0);
	rect.setAttributeNS(null,'width',1380);
	rect.setAttributeNS(null,'height',60);
	rect.setAttributeNS(null,'style','fill:rgb(255,0,0); stroke:rgb(0,0,0); stroke-width:2px;');
	messageGroup.appendChild(rect);
	var text=document.createElementNS(NS,'text');
	text.setAttributeNS(null,'x',460);
	text.setAttributeNS(null,'y',0);
	text.setAttributeNS(null,'width',1380);
	text.setAttributeNS(null,'height',60);
	text.setAttributeNS(null,'style','font-size:40px;font-style:normal;font-weight:normal;text-align:start;text-anchor:start;fill:rgb(255,255,0);fill-opacity:1;stroke:none;stroke-width:2px;font-family:Courier;');
	text.setAttributeNS("http://www.w3.org/XML/1998/namespace", "xml:space","preserve");
	var tspan=document.createElementNS(NS,'tspan');
	tspan.setAttributeNS(null,'x',400);
	tspan.setAttributeNS(null,'y',0+30+15+2);
	tspan.setAttributeNS(null,'id','RUNNING_MESSAGE');
	tspan.setAttributeNS(null,'style','font-size:40px;font-style:normal;font-weight:normal;text-align:start;text-anchor:start;fill:rgb(255,255,0);fill-opacity:1;stroke:none;font-family:Courier;');
	tspan.appendChild(document.createTextNode(''));
	text.appendChild(tspan);
	messageGroup.appendChild(text);
	var acknowledgeButton=document.createElementNS(NS,'g');
	acknowledgeButton.setAttributeNS(null,'x',340);
	acknowledgeButton.setAttributeNS(null,'y',0);
	acknowledgeButton.setAttributeNS(null,'width',60);
	acknowledgeButton.setAttributeNS(null,'height',60);
	acknowledgeButton.setAttributeNS(null,'id','ACKNOWLEDGE_BUTTON');
	var acknowledgeButtonBack=document.createElementNS(NS,'rect');
	acknowledgeButtonBack.setAttributeNS(null,'x',340);
	acknowledgeButtonBack.setAttributeNS(null,'y',0);
	acknowledgeButtonBack.setAttributeNS(null,'width',60);
	acknowledgeButtonBack.setAttributeNS(null,'height',60);
	acknowledgeButtonBack.setAttributeNS(null,'rx',5);
	acknowledgeButtonBack.setAttributeNS(null,'ry',5);
	acknowledgeButtonBack.setAttributeNS(null,'style','fill:#ffffe1;fill-opacity:1;stroke:#000000;stroke-width:3.43333316;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:4.0621047;stroke-opacity:1;stroke-dasharray:none');
	acknowledgeButton.appendChild(acknowledgeButtonBack);
	var acknowledgeButtonSymbol=document.createElementNS(NS,'path');
	acknowledgeButtonSymbol.setAttributeNS(null,'d','m 10.200008,1026.1621 15.999962,16.0001 24.000001,-32 0,-8 -7.999981,0 -16.00002,23.9999 -7.999981,-7.9999 -7.999981,0 z');
	acknowledgeButtonSymbol.setAttributeNS(null,'style','fill:#00ff00;fill-opacity:1;stroke:#000000;stroke-width:6.86666632;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-opacity:1;stroke-dasharray:none');
	acknowledgeButtonSymbol.setAttributeNS(null,'transform','translate(340,-992)');
	acknowledgeButton.appendChild(acknowledgeButtonSymbol);
	messageGroup.appendChild(acknowledgeButton);	
	document.rootElement.appendChild(messageGroup);
	setHighlightButton('ACKNOWLEDGE_BUTTON','setBoolTag(\'RUNNING_ALARM_MESSAGE_ACKNOWLEDGE\',true);');
}