//////////////////////////////////////////////////////////////////////////////////////////////
// Автор: Владимир Щербина <vns.scherbina@gmail.com>
// copyright 2017
// Версия: 1.0.0
// Модуль pids.js реализует анимацию и логику диалогового взаимодействия для видеокадра pids.
//////////////////////////////////////////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////////////////////////////////////////
// Локальные переменные //
//////////////////////////
var NormalColor='rgb(0,255,0)';
var InactiveColor='rgb(255,0,0)';
var UndefinedColor='rgb(255,255,255)';
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
var MessagesQuantity;
var avgDiff=new FIFO(30);
var foundTag='';
var selector=0;
var tagsConfig=[
	{
		name:"Регулятор давления смешанного газа",
		tagsList:['DU_7','KNI_7','KP_7','TI_7','TD_7','KD_7','PERIOD_7','TIMEMIN_7','INMAX_7'],
		tagsListViewOnly:['FREM_7','FAUT_7','MORE_7','LESS_7','OUTB_7','OUTM_7','SIGNR_7_1','SIGNR_7_2','SIGNR_7_3','SIGNR_7_4','SIGNR_7_5','SIGNR_7_6']
	},
	{
		name:"Регулятор расхода природного газа на ГСС",
		tagsList:['DU_8','KNI_8','KP_8','TI_8','TD_8','KD_8','PERIOD_8','TIMEMIN_8','INMAX_8'],
		tagsListViewOnly:['FREM_8','FAUT_8_1','FAUT_8_2','MORE_8','LESS_8','OUTB_8','OUTM_8','SIGNR_8_1','SIGNR_8_2','SIGNR_8_3','SIGNR_8_4_1','SIGNR_8_4_2','SIGNR_8_5_1','SIGNR_8_5_1','SIGNR_8_6']
	},
	{
		name:"Регулятор температуры горячего дутья",
		tagsList:['DU_5','KNI_5','KP_5','TI_5','TD_5','KD_5','PERIOD_5','TIMEMIN_5','INMAX_5'],
		tagsListViewOnly:['FREM_5','FAUT_5','MORE_5','LESS_5','OUTB_5','OUTM_5','SIGNR_5_1','SIGNR_5_2','SIGNR_5_3','SIGNR_5_4','SIGNR_5_5','SIGNR_5_6']
	},
	{
		name:"Регулятор давления колошникового газа",
		tagsList:['DU_6','KNI_6','KP_6','TI_6','TD_6','KD_6','PERIOD_6','TIMEMIN_6','INMAX_6'],
		tagsListViewOnly:['FREM_6','FAUT_6','MORE_6','LESS_6','OUTB_6','OUTM_6','SIGNR_6_1','SIGNR_6_2','SIGNR_6_3','SIGNR_6_4','SIGNR_6_5','SIGNR_6_6']
	},
	{
		name:"Регулятор уровня в барабане-сепараторе СИО печи №1",
		tagsList:['DU_1','KNI_1','KP_1','TI_1','TD_1','KD_1','PERIOD_1','TIMEMIN_1','INMAX_1'],
		tagsListViewOnly:[]
	},
	{
		name:"Регулятор уровня в барабане-сепараторе СИО печи №2",
		tagsList:['DU_2','KNI_2','KP_2','TI_2','TD_2','KD_2','PERIOD_2','TIMEMIN_2','INMAX_2'],
		tagsListViewOnly:[]
	},
	{
		name:"Регулятор уровня в барабане-сепараторе СИО воздухонагревателей",
		tagsList:['DU_10','KNI_10','KP_10','TI_10','TD_10','KD_10','PERIOD_10','TIMEMIN_10','INMAX_10'],
		tagsListViewOnly:[]
	},
	{
		name:"Регулятор расхода пара на увлажнение дутья",
		tagsList:['DU_3','KNI_3','KP_3','TI_3','TD_3','KD_3','PERIOD_3','TIMEMIN_3','INMAX_3'],
		tagsListViewOnly:[]
	},
	{
		name:"Регулятор расхода природного газа в дутье",
		tagsList:['DU_4','KNI_4','KP_4','TI_4','TD_4','KD_4','PERIOD_4','TIMEMIN_4','INMAX_4'],
		tagsListViewOnly:[]
	}
];

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
	var i;
	var j;


	setButton('EXIT_BUTTON','exit_click();');
	setButton('TRENDS_BUTTON','popupMenu(getTrendsMenu(),trends_menu_click);');
	setButton('REPORTS_BUTTON','popupMenu(ReportsMenu,reports_menu_click);');
	setButton('ALARM_BUTTON','alarm_click();');
	setButton('LOGIN_BUTTON','login_click();');
	
	var BackgroundStyle='fill:#ffffff;fill-opacity:1;stroke:#000000;stroke-width:1.0;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:4;stroke-opacity:1;stroke-dasharray:none';

	var Col1Width=50;
	var Col2Width=300;
	var Col3Width=1290;
	var Col4Width=240;
	
	
	var Header1={width:Col1Width,background:BackgroundStyle,align:'middle',text:'№ п/п'};
	var Header2={width:Col2Width,background:BackgroundStyle,align:'middle',text:'Тег'};
	var Header3={width:Col3Width,background:BackgroundStyle,align:'middle',text:'Наименование'};
	var Header4={width:Col4Width,background:BackgroundStyle,align:'middle',text:'Значение'};
	
	var Col1={width:Col1Width,background:BackgroundStyle,align:'middle',text:''};
	var Col2={width:Col2Width,background:BackgroundStyle,align:'start',text:''};
	var Col3={width:Col3Width,background:BackgroundStyle,align:'start',text:''};
	var Col4={width:Col4Width,background:BackgroundStyle,align:'start',text:''};
	
	var RowData=[Col1,Col2,Col3,Col4];

	var Table=[
		[Header1,Header2,Header3,Header4]
	];
	for (i=1; i<TableRows; i++) {
		Table[i]=RowData;
	}

	createTable('TAGS_TABLE',Table);
	
	for (i=1; i<TableRows; i++) {
		setTableRowOnactivate('TAGS_TABLE',i,'editTagField('+i.format(0,'')+');');
	}


	addKeyAction(exit_click,KeyEvent.VK_ESCAPE,0);
	addKeyAction(alarm_click,KeyEvent.VK_A,KeyEvent.CTRL_MASK);
	addKeyAction(function() { popupMenu(getTrendsMenu(),trends_menu_click); },KeyEvent.VK_T,KeyEvent.CTRL_MASK);
	addKeyAction(function() { popupMenu(ReportsMenu,reports_menu_click); },KeyEvent.VK_P,KeyEvent.CTRL_MASK);
	addKeyAction(function() { exitApp(); },KeyEvent.VK_Q,KeyEvent.CTRL_MASK);
	addKeyAction(function() { right_page_click(); },KeyEvent.VK_RIGHT,0);
	addKeyAction(function() { left_page_click(); },KeyEvent.VK_LEFT,0);

	setHighlightButton('RIGHTPAGE_BUTTON','right_page_click();');
	setHighlightButton('LEFTPAGE_BUTTON','left_page_click();');

}

//////////////////////////////////////////////////////////////////////////////////////////////
// Формат вызова: animate_loop()
// Назначение: Основной цикл анимации.
// Параметры: -
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
	animate_tags();
}

//////////////////////////////////////////////////////////////////////////////////////////////
// Формат вызова: animate_datetime()
// Назначение: Анимация для отображения даты и времени.
// Параметры: -
//////////////////////////////////////////////////////////////////////////////////////////////
function animate_datetime() {
	var avgDiffValue=avgDiff.avg();
	if (avgDiffValue==0) {
		setText('CurrentDateTime',getStrTag('DATETIME.F_CV'));
	} else {
		setText('CurrentDateTime',getStrTag('DATETIME.F_CV')+(DEBUG_TIME==false ? '' : ' ('+avgDiffValue.format(0,'ms')+', '+(1000/avgDiffValue).format(1,'fps')+')'));		
	}
}

//////////////////////////////////////////////////////////////////////////////////////////////
// Формат вызова: animate_tags()
// Назначение: Анимация для отображения значений тегов.
// Параметры: -
//////////////////////////////////////////////////////////////////////////////////////////////
function animate_tags() {
	var TagName='';
	setText('PIDTitle',tagsConfig[selector].name);
	if (currentMessage==1) {
		MessagesQuantity=tagsConfig[selector].tagsList.length+tagsConfig[selector].tagsListViewOnly.length;
		PagesQuantity=Math.floor(MessagesQuantity/(TableRows-1))+1;
		if (PageNumber>PagesQuantity) {
			PageNumber=PagesQuantity;
		}
	}
	var i=currentMessage;
	var Index=(PageNumber-1)*(TableRows-1)+i-1;
	var RowColor;
	if (Index<MessagesQuantity) {
		if (Index<tagsConfig[selector].tagsList.length) {
			TagName=tagsConfig[selector].tagsList[Index];
		} else {
			TagName=tagsConfig[selector].tagsListViewOnly[Index-tagsConfig[selector].tagsList.length];
		}
		RowColor='rgb(255,255,255)';
		setTableText('TAGS_TABLE',i,0,(Index+1).format(0,''));
		setTableText('TAGS_TABLE',i,1,TagName);
		setTableText('TAGS_TABLE',i,2,getStrTag(TagName+'.A_DESC'));
		setTableText('TAGS_TABLE',i,3,getStrTag(TagName+'.A_CV').substr(0,48));
	} else {
		RowColor=UndefinedColor;
		setTableText('TAGS_TABLE',i,0,'');
		setTableText('TAGS_TABLE',i,1,'');
		setTableText('TAGS_TABLE',i,2,'');
		setTableText('TAGS_TABLE',i,3,'');
	}
	setTableBackColor('TAGS_TABLE',i,0,RowColor);
	setTableBackColor('TAGS_TABLE',i,1,RowColor);
	setTableBackColor('TAGS_TABLE',i,2,RowColor);
	setTableBackColor('TAGS_TABLE',i,3,RowColor);
	currentMessage=currentMessage==(TableRows-1) ? 1: currentMessage+1;
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
// private функции //
/////////////////////

//////////////////////////////////////////////////////////////////////////////////////////////
// Формат вызова: login_click()
// Назначение: Обработчик нажатия на кнопку блокировки/деблокировки пользовательского интерфейса.
// Параметры: -
//////////////////////////////////////////////////////////////////////////////////////////////
function  login_click() {
	lock_unlock();
}

//////////////////////////////////////////////////////////////////////////////////////////////
// Формат вызова: alarm_click()
// Назначение: Обработчик нажатия на кнопку вызова видеокадра отображения аварийных сообщений.
// Параметры: -
//////////////////////////////////////////////////////////////////////////////////////////////
function  alarm_click() {
	openFrame('alarm.svg');
}

//////////////////////////////////////////////////////////////////////////////////////////////
// Формат вызова: exitApp()
// Назначение: Завершение работы клитентского приложения.
// Параметры: -
//////////////////////////////////////////////////////////////////////////////////////////////
function exitApp() {
	Packages.com.cmas.hmi.Main.exitApp();
}

function editTagField(Row) {
	var res;
	var editedTagName=tagsConfig[selector].tagsList[(PageNumber-1)*(TableRows-1)+Row-1];
	if ((PageNumber-1)*(TableRows-1)+Row-1<tagsConfig[selector].tagsList.length) {
		changeRefValue(editedTagName,0,1000000,editedTagName);
	}
}

//////////////////////////////////////////////////////////////////////////////////////////////
// Формат вызова: left_page_click()
// Назначение: Обработчик нажатия на кнопку перехода на предыдущую страницу.
// Параметры: -
//////////////////////////////////////////////////////////////////////////////////////////////
function left_page_click() {
	if (selector>0) {
		selector=selector-1;
	} else {
		selector=tagsConfig.length-1;
	}
	
}

//////////////////////////////////////////////////////////////////////////////////////////////
// Формат вызова: right_page_click()
// Назначение: Обработчик нажатия на кнопку перехода на следующую страницу.
// Параметры: -
//////////////////////////////////////////////////////////////////////////////////////////////
function right_page_click() {
	if (selector<(tagsConfig.length-1)) {
		selector=selector+1;
	} else {
		selector=0;
	}
	
}
