//////////////////////////////////////////////////////////////////////////////////////////////
// Автор: Владимир Щербина <vns.scherbina@gmail.com>
// copyright 2017
// Версия: 1.0.0
// Модуль fisher_diag.js реализует анимацию и логику диалогового взаимодействия для видеокадра fisher_diag.
//////////////////////////////////////////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////////////////////////////////////////
// Локальные переменные //
//////////////////////////
var rt;
var tsStart=new Date();
var tsFinish=new Date();
var tsDiff=0;
var lastCommCounter=0;
var avgDiff=new FIFO(30);
var avgMemory=new FIFO(30);
var ButtonPressedColor='rgb(0,255,0)';
var ButtonUnpressedColor='rgb(255,255,255)';
var Titles=[
	'Холодное дутье',
	'Пар на общем подводе',
	'Природный газ на печь',
	'Азот на общем подводе',
	'Доменный газ на входе ГСС',
	'Природный газ на входе ГСС',
	'Пар СИО печи №1',
	'Пар СИО печи №2',
	'Природный газ на собств. нужды',
	'Кислород на собственные нужды',
	'Сжатый воздух на печь',
	'Пар на увлажнение дутья',
	'Азот в ВМК',
	'Азот в НМК',
	'Азот на БК',
	'Азот на загрузку (общий)',
	'Пар СИО воздухонагревателей',
	'Азот на пылеподавление',
	'-',
	'-'
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
	var i=0;

	var BackgroundStyle='fill:#ffffff;fill-opacity:1;stroke:#000000;stroke-width:1.0;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:4;stroke-opacity:1;stroke-dasharray:none';

	var Col1Width=150;
	var Col2Width=370;
	var Col3Width=170;
	
	var Headers=[
		{width:Col1Width,background:BackgroundStyle,align:'middle',text:'Мост/Порт'},
		{width:Col2Width,background:BackgroundStyle,align:'middle',text:'Наименование'},
		{width:Col3Width,background:BackgroundStyle,align:'middle',text:'Давление'},
		{width:Col3Width,background:BackgroundStyle,align:'middle',text:'Температура'},
		{width:Col3Width,background:BackgroundStyle,align:'middle',text:'Расход'},
		{width:Col3Width,background:BackgroundStyle,align:'middle',text:'Состояние'},
		{width:Col3Width,background:BackgroundStyle,align:'middle',text:'SPn'},
		{width:Col3Width,background:BackgroundStyle,align:'middle',text:'PTn'},
		{width:Col3Width,background:BackgroundStyle,align:'middle',text:'Fmax'},
		{width:Col3Width,background:BackgroundStyle,align:'middle',text:'DPmax'}
	];

	var Table=[
		Headers
	];

	for (i=1; i<=20; i++) {
		var Bridge=(Math.floor((i-1)/4)+3).format('',0);
		var Port=(((i-1) % 4)+1).format('',0);
		var RowData=[
			{width:Col1Width,background:BackgroundStyle,align:'middle',text:'MM. '+Bridge+'/'+'Порт '+Port},
			{width:Col2Width,background:BackgroundStyle,align:'middle',text:Titles[i-1]},
			{width:Col3Width,background:BackgroundStyle,align:'middle',text:'XXXXXX.XXX'},
			{width:Col3Width,background:BackgroundStyle,align:'middle',text:'XXXXXX.XXX'},
			{width:Col3Width,background:BackgroundStyle,align:'middle',text:'XXXXXX.XXX'},
			{width:Col3Width,background:BackgroundStyle,align:'middle',text:'Норма'},
			{width:Col3Width,background:BackgroundStyle,align:'middle',text:'XXXXXX.XXX'},
			{width:Col3Width,background:BackgroundStyle,align:'middle',text:'XXXXXX.XXX'},
			{width:Col3Width,background:BackgroundStyle,align:'middle',text:'XXXXXX.XXX'},
			{width:Col3Width,background:BackgroundStyle,align:'middle',text:'XXXXXX.XXX'}
		];
		Table[i]=RowData;
	}

	createTable('FISHER_TABLE',Table);

	for (i=1; i<=20; i++) {
		var Bridge=(Math.floor((i-1)/4)+3).format('',0);
		var Port=(((i-1) % 4)+1).format('',0);
		var tagName="MM"+Bridge.format(0,'')+'SPN_'+Port.format(0,'');
		setTableCellOnactivate('FISHER_TABLE',i,6,'changeRef('+Bridge.format(0,'')+','+Port.format(0,'')+',\'SPN\')');
		setTableCellOnactivate('FISHER_TABLE',i,7,'changeRef('+Bridge.format(0,'')+','+Port.format(0,'')+',\'PTN\')');
		setTableCellOnactivate('FISHER_TABLE',i,8,'changeRef('+Bridge.format(0,'')+','+Port.format(0,'')+',\'FMAX\')');
		setTableCellOnactivate('FISHER_TABLE',i,9,'changeRef('+Bridge.format(0,'')+','+Port.format(0,'')+',\'DPMAX\')');
	}

	

	rt=Runtime.getRuntime();	

	addKeyAction(function() { exitApp(); },KeyEvent.VK_Q,KeyEvent.CTRL_MASK);
	init_basic_without_diags_buttons_menu();
	setButton('EXIT_BUTTON','exit_click();');
	addKeyAction(exit_click,KeyEvent.VK_ESCAPE,0);

	
	
	
	
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
	animate_fields();
	var MemoryTagName=HostName+'_'+'MEMORY_CLIENT_USED_'+Packages.com.cmas.hmi.Main.screen.format(0,'');
	avgMemory.push(getFltTag(MemoryTagName));
	setText('MEMORY_CLIENT_USED',(avgMemory.avg()).format2(0,'байт',' '));
}

//////////////////////////////////////////////////////////////////////////////////////////////
// Формат вызова: animate_fields()
// Назначение: Анимация для отображения значений полей данных.
// Параметры: -
//////////////////////////////////////////////////////////////////////////////////////////////
function animate_fields() {
	var i=0;
	for (i=1; i<=20; i++) {
		var Bridge=(Math.floor((i-1)/4)+3).format('',0);
		var Port=(((i-1) % 4)+1).format('',0);
		var ChannelState=getBoolTag('MM'+Bridge+'_FISHER_CHANNEL_STATE_'+Port);
		if (ChannelState==true) {
			setTableBackColor('FISHER_TABLE',i,0,'rgb(0,255,0)');
			setTableBackColor('FISHER_TABLE',i,1,'rgb(0,255,0)');
			setTableBackColor('FISHER_TABLE',i,2,'rgb(0,255,0)');
			setTableBackColor('FISHER_TABLE',i,3,'rgb(0,255,0)');
			setTableBackColor('FISHER_TABLE',i,4,'rgb(0,255,0)');
			setTableBackColor('FISHER_TABLE',i,5,'rgb(0,255,0)');
			setTableBackColor('FISHER_TABLE',i,6,'rgb(0,255,0)');
			setTableBackColor('FISHER_TABLE',i,7,'rgb(0,255,0)');
			setTableBackColor('FISHER_TABLE',i,8,'rgb(0,255,0)');
			setTableBackColor('FISHER_TABLE',i,9,'rgb(0,255,0)');
			setTableText('FISHER_TABLE',i,5,'норма');
		} else {
			setTableBackColor('FISHER_TABLE',i,0,'rgb(255,0,0)');
			setTableBackColor('FISHER_TABLE',i,1,'rgb(255,0,0)');
			setTableBackColor('FISHER_TABLE',i,2,'rgb(255,0,0)');
			setTableBackColor('FISHER_TABLE',i,3,'rgb(255,0,0)');
			setTableBackColor('FISHER_TABLE',i,4,'rgb(255,0,0)');
			setTableBackColor('FISHER_TABLE',i,5,'rgb(255,0,0)');
			setTableBackColor('FISHER_TABLE',i,6,'rgb(255,0,0)');
			setTableBackColor('FISHER_TABLE',i,7,'rgb(255,0,0)');
			setTableBackColor('FISHER_TABLE',i,8,'rgb(255,0,0)');
			setTableBackColor('FISHER_TABLE',i,9,'rgb(255,0,0)');
			setTableText('FISHER_TABLE',i,5,'неисправность');
		}
		setTableText('FISHER_TABLE',i,2,getFltTag('MM'+Bridge+'_P_VALUE_'+Port.format(0,'')).format(3,''));
		setTableText('FISHER_TABLE',i,3,getFltTag('MM'+Bridge+'_T_VALUE_'+Port.format(0,'')).format(3,''));
		setTableText('FISHER_TABLE',i,4,getFltTag('MM'+Bridge+'_F_VALUE_'+Port.format(0,'')).format(3,''));
		setTableText('FISHER_TABLE',i,6,getFltTag('MM'+Bridge+'_SPN_'+Port.format(0,'')+'.F_CV').format(3,''));
		setTableText('FISHER_TABLE',i,7,getFltTag('MM'+Bridge+'_PTN_'+Port.format(0,'')+'.F_CV').format(3,''));
		setTableText('FISHER_TABLE',i,8,getFltTag('MM'+Bridge+'_FMAX_'+Port.format(0,'')+'.F_CV').format(3,''));
		setTableText('FISHER_TABLE',i,9,getFltTag('MM'+Bridge+'_DPMAX_'+Port.format(0,'')+'.F_CV').format(3,''));
	}
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
// Формат вызова: exitApp()
// Назначение: Завершение работы клитентского приложения.
// Параметры: -
//////////////////////////////////////////////////////////////////////////////////////////////
function exitApp() {
	Packages.com.cmas.hmi.Main.exitApp();
}

//////////////////////////////////////////////////////////////////////////////////////////////
// Формат вызова: animateButton(elementID,buttonPressed)
// Назначение: Анимация состояния кнопки.
// Параметры:
//             elementID 		- идентификатор объекта;
//             buttonPressed 	- признак нажатого состояния кнопки.
//////////////////////////////////////////////////////////////////////////////////////////////
function animateButton(elementID,buttonPressed) {
	setStyle(elementID,'fill',buttonPressed ? ButtonPressedColor : ButtonUnpressedColor);
}

//////////////////////////////////////////////////////////////////////////////////////////////
// Формат вызова: changeRef(Bridge,Port,Ref)
// Назначение: Изменение значения параметра.
// Параметры:
//             Bridge 		- номер моста-мультиплексора;
//             Port 		- номер порта моста-мультиплексора;
//             Ref 			- изменяемый параметр.
//////////////////////////////////////////////////////////////////////////////////////////////
function changeRef(Bridge,Port,Ref) {
	var tagName='MM'+Bridge.format(0,'')+'_'+Ref+'_'+Port.format(0,'');
	changeRefValue(tagName,getFltTag(tagName+'.F_LOLO'),getFltTag(tagName+'.F_HIHI'),'Введите новое значение для параметра \''+getStrTag(tagName+'.A_DESC')+'\':');
}