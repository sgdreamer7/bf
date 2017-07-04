//////////////////////////////////////////////////////////////////////////////////////////////
// Автор: Владимир Щербина <vns.scherbina@gmail.com>
// copyright 2017
// Версия: 1.0.0
// Модуль alarms.js реализует анимацию и логику диалогового взаимодействия для видеокадра alarms.
//////////////////////////////////////////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////////////////////////////////////////
// Локальные переменные //
//////////////////////////
var AlarmMessageColor='rgb(255,0,0)';
var PreAlarmMessageColor='rgb(255,255,0)';
var NormalMessageColor='rgb(100,255,100)';
var UndefinedMessageColor='rgb(172,172,172)';
var AcknowledgedMessageColor='rgb(255,255,255)';
var TableRows=50;
var MultiPages=5;
var PageNumber=1;
var PagesQuantity=0;
var tsStart=new Date();
var tsFinish=new Date();
var tsDiff=0;
var lastCommCounter=0;
var currentMessage=1;
var Messages=[];
var MessagesQuantity=0;
var avgDiff=new FIFO(30);
var selector=0;

////////////////////////////////////////////////////////////////////////////////
// Инициализация
////////////////////////////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////////////////////////////////////////
// public функции //
////////////////////

//////////////////////////////////////////////////////////////////////////////////////////////
// Формат вызова: init()
// Назначение: Начальная инициализация видеокадра. Настройка анимации и диалоговых элементов.
// Параметры: -
//////////////////////////////////////////////////////////////////////////////////////////////
function init() {
	var BackgroundStyle='fill:#ffffff;fill-opacity:1;stroke:#000000;stroke-width:1.0;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:4;stroke-opacity:1;stroke-dasharray:none';

	var Col1Width=150;
	var Col2Width=130;
	var Col3Width=1610;
	
	var Header1={width:Col1Width,background:BackgroundStyle,align:'middle',text:'Дата'};
	var Header2={width:Col2Width,background:BackgroundStyle,align:'middle',text:'Время'};
	var Header3={width:Col3Width,background:BackgroundStyle,align:'middle',text:'Сообщение'};

	var Col1={width:Col1Width,background:BackgroundStyle,align:'middle',text:''};
	var Col2={width:Col2Width,background:BackgroundStyle,align:'middle',text:''};
	var Col3={width:Col3Width,background:BackgroundStyle,align:'start',text:''};

	var RowData=[Col1,Col2,Col3];

	var Table=[
		[Header1,Header2,Header3]
	];
	for (i=1; i<TableRows; i++) {
		Table[i]=RowData
	}

	createTable('ALARM_TABLE',Table);
	
	for (Row=1; Row<TableRows; Row++) {
		setTableRowOnactivate('ALARM_TABLE',Row,'acknowledgeMessageInRow('+Row.format(0,'')+');');
	}

	setButton('EXIT_BUTTON','exit_click();');
	setButton('TRENDS_BUTTON','popupMenu(getTrendsMenu(),trends_menu_click);');
	setButton('REPORTS_BUTTON','popupMenu(ReportsMenu,reports_menu_click);');
	setButton('LOGIN_BUTTON','login_click();');
	setHighlightButton('RIGHTPAGES_BUTTON','right_pages_click();');
	setHighlightButton('RIGHTPAGE_BUTTON','right_page_click();');
	setHighlightButton('LEFTPAGE_BUTTON','left_page_click();');
	setHighlightButton('LEFTPAGES_BUTTON','left_pages_click();');
	setHighlightButton('ACKNOWLEDGE_BUTTON','acknowledge_list_click();');
	setHighlightButton('ALL_MESSAGES_BUTTON','selector=0;');
	setHighlightButton('CHARGE_MESSAGES_BUTTON','selector=10;');
	
	addKeyAction(exit_click,KeyEvent.VK_ESCAPE,0);
	addKeyAction(function() { popupMenu(getTrendsMenu(),trends_menu_click); },KeyEvent.VK_T,KeyEvent.CTRL_MASK);
	addKeyAction(function() { popupMenu(ReportsMenu,reports_menu_click); },KeyEvent.VK_P,KeyEvent.CTRL_MASK);
	addKeyAction(function() { right_pages_click(); },KeyEvent.VK_RIGHT,KeyEvent.CTRL_MASK);
	addKeyAction(function() { right_page_click(); },KeyEvent.VK_RIGHT,0);
	addKeyAction(function() { left_page_click(); },KeyEvent.VK_LEFT,0);
	addKeyAction(function() { left_pages_click(); },KeyEvent.VK_LEFT,KeyEvent.CTRL_MASK);
	addKeyAction(function() { acknowledge_list_click(); },KeyEvent.VK_SPACE,KeyEvent.CTRL_MASK);
	addKeyAction(function() { exitApp(); },KeyEvent.VK_Q,KeyEvent.CTRL_MASK);

}

//////////////////////////////////////////////////////////////////////////////////////////////
// Формат вызова: animate()
// Назначение: Анимация видеокадра.
// Параметры: -
//////////////////////////////////////////////////////////////////////////////////////////////
function animate() {
	tsFinish=new Date();
	tsDiff=tsFinish.valueOf()-tsStart.valueOf();
	avgDiff.push(tsDiff);
	tsStart=tsFinish;
	animate_datetime();
	animate_messages();
}

//////////////////////////////////////////////////////////////////////////////////////////////
// Формат вызова: animate_datetime()
// Назначение: Анимация для отображения даты и времени.
// Параметры: -
//////////////////////////////////////////////////////////////////////////////////////////////
function animate_datetime() {
	var avgDiffValue=avgDiff.avg();
	if (avgDiffValue==0) {
		setText('CurrentDateTime',getStrTag("DATETIME.F_CV"));
	} else {
		setText('CurrentDateTime',getStrTag("DATETIME.F_CV")+(DEBUG_TIME==false ? '' : ' ('+avgDiffValue.format(0,'ms')+', '+(1000/avgDiffValue).format(1,'fps')+')'));		
	}
}

//////////////////////////////////////////////////////////////////////////////////////////////
// Формат вызова: animate_messages()
// Назначение: Анимация для отображения аварийных сообщений.
// Параметры: -
//////////////////////////////////////////////////////////////////////////////////////////////
function animate_messages() {
	if (currentMessage==1) {
		var MsgsRes=[];
		MsgsRes[0]=Main.getAlarmMessages();
		var Msgs2=process_messages(MsgsRes);
		var Msgs;
		if (selector==0) {
			Msgs=Msgs2;
		} else {
			var msgsIndex=0;
			Msgs=[];
			var j=0;
			for (j=0; j<Msgs2.length; j++) {
				Alarm=Msgs2[j];
				if (Alarm.priority==selector) {
					Msgs[msgsIndex]=Alarm;
					msgsIndex++;
				}
			}
		}
		MessagesQuantity=Msgs.length;
		PagesQuantity=Math.floor(MessagesQuantity/(TableRows-1))+1;
		if (PageNumber>PagesQuantity) {
			PageNumber=PagesQuantity;
		}
		var StartMessage=(PageNumber-1)*(TableRows-1)+1;
		var FinishMessage=StartMessage+(TableRows-1)-1;
		if (FinishMessage>MessagesQuantity) {
			FinishMessage=MessagesQuantity;	
		}
		var msgIndex=0;
		var selectedMsgs=[];
		for (msgIndex=StartMessage-1; msgIndex<FinishMessage; msgIndex++) {
			selectedMsgs[msgIndex-(StartMessage-1)]=Msgs[msgIndex];
		}
		Messages=selectedMsgs;
	}
	setText('PageNumber',PageNumber.format(0,''));
	setText('PagesQuantity',PagesQuantity.format(0,''));
	setStyle('ALL_MESSAGES_BACK','fill',selector==0 ? 'rgb(0,255,0)' : 'rgb(255,255,255)');
	setStyle('CHARGE_MESSAGES_BACK','fill',selector==10 ? 'rgb(0,255,0)' : 'rgb(255,255,255)');
	if (Messages!=null) {
		var L=Messages.length;
		var i=currentMessage;
		if (i<=L) {
			Alarm=Messages[i-1];
			if (Alarm!=undefined) {
				RowColor=Alarm.acknowledged=='true' ? 'rgb(255,255,255)' : Alarm.state=='OK' ? 'rgb(255,255,0)' : 'rgb(255,0,0)';
				TextColor=Alarm.acknowledged=='true' ? 'rgb(255,0,0)' : 'rgb(0,0,0)';
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
		currentMessage=currentMessage==(TableRows-1) ? 1: currentMessage+1;
	} else {
		currentMessage=1;
	}
}

//////////////////////////////////////////////////////////////////////////////////////////////
// Формат вызова: exit_click()
// Назначение: Обработчик нажатия на кнопку закрытия видеокадра.
// Параметры: -
//////////////////////////////////////////////////////////////////////////////////////////////
function  exit_click() {
	close();
}

//////////////////////////////////////////////////////////////////////////////////////////////
// Формат вызова: left_pages_click()
// Назначение: Обработчик нажатия на кнопку перехода на первую страницу.
// Параметры: -
//////////////////////////////////////////////////////////////////////////////////////////////
function left_pages_click() {
	var NewPageNumber=PageNumber-MultiPages;
	if (NewPageNumber<1) {
		NewPageNumber=1;
	}
	PageNumber=NewPageNumber;
}

//////////////////////////////////////////////////////////////////////////////////////////////
// Формат вызова: left_page_click()
// Назначение: Обработчик нажатия на кнопку перехода на предыдущую страницу.
// Параметры: -
//////////////////////////////////////////////////////////////////////////////////////////////
function left_page_click() {
	var NewPageNumber=PageNumber-1;
	if (NewPageNumber<1) {
		NewPageNumber=1;
	}
	PageNumber=NewPageNumber;
}

//////////////////////////////////////////////////////////////////////////////////////////////
// Формат вызова: right_page_click()
// Назначение: Обработчик нажатия на кнопку перехода на следующую страницу.
// Параметры: -
//////////////////////////////////////////////////////////////////////////////////////////////
function right_page_click() {
	var NewPageNumber=PageNumber+1;
	if (NewPageNumber>PagesQuantity) {
		NewPageNumber=PagesQuantity;
	}
	PageNumber=NewPageNumber;
}

//////////////////////////////////////////////////////////////////////////////////////////////
// Формат вызова: right_pages_click()
// Назначение: Обработчик нажатия на кнопку перехода на последнюю страницу.
// Параметры: -
//////////////////////////////////////////////////////////////////////////////////////////////
function right_pages_click() {
	var NewPageNumber=PageNumber+MultiPages;
	if (NewPageNumber>PagesQuantity) {
		NewPageNumber=PagesQuantity;
	}
	PageNumber=NewPageNumber;
}

//////////////////////////////////////////////////////////////////////////////////////////////
// Формат вызова: acknowledge_list_click()
// Назначение: Обработчик нажатия на кнопку квитирования списка аварий.
// Параметры: -
//////////////////////////////////////////////////////////////////////////////////////////////
function acknowledge_list_click() {
	var messagesIDs=[];
	for (i=0; i<Messages.length; i++) {
		messagesIDs[i]=Messages[i].id;
	}
	acknowledgeMessages(messagesIDs);
}

//////////////////////////////////////////////////////////////////////////////////////////////
// Формат вызова: login_click()
// Назначение: Обработчик нажатия на кнопку блокировки/деблокировки пользовательского интерфейса.
// Параметры: -
//////////////////////////////////////////////////////////////////////////////////////////////
function  login_click() {
	lock_unlock();
}

//////////////////////////////////////////////////////////////////////////////////////////////
// Формат вызова: exitApp()
// Назначение: Завершение работы клитентского приложения.
// Параметры: -
//////////////////////////////////////////////////////////////////////////////////////////////
function exitApp() {
	Packages.com.cmas.hmi.Main.exitApp();
}


//////////////////////////////////////////////////////////////////////////////////////////////
// private функции //
/////////////////////

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
