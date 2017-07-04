//////////////////////////////////////////////////////////////////////////////////////////////
// Автор: Владимир Щербина <vns.scherbina@gmail.com>
// copyright 2017
// Версия: 1.0.0
// Модуль icp_diag.js реализует анимацию и логику диалогового взаимодействия для видеокадра icp_diag.
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
var selector=1;

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
	var BackgroundStyle1='fill:#a0a0a0;fill-opacity:1;stroke:#000000;stroke-width:1.0;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:4;stroke-opacity:1;stroke-dasharray:none';
	var BackgroundStyle2='fill:#ffffff;fill-opacity:1;stroke:#000000;stroke-width:1.0;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:4;stroke-opacity:1;stroke-dasharray:none';

	var Col1Width=200;
	var Col2Width=164;
	
	var Headers=[
		{width:Col1Width,background:BackgroundStyle,align:'middle',text:'Порт/Модуль'},
		{width:Col2Width,background:BackgroundStyle,align:'middle',text:'Вход 1'},
		{width:Col2Width,background:BackgroundStyle,align:'middle',text:'Вход 2'},
		{width:Col2Width,background:BackgroundStyle,align:'middle',text:'Вход 3'},
		{width:Col2Width,background:BackgroundStyle,align:'middle',text:'Вход 4'},
		{width:Col2Width,background:BackgroundStyle,align:'middle',text:'Вход 5'},
		{width:Col2Width,background:BackgroundStyle,align:'middle',text:'Вход 6'},
		{width:Col2Width,background:BackgroundStyle,align:'middle',text:'Вход 7'},
		{width:Col2Width,background:BackgroundStyle,align:'middle',text:'Вход 8'},
		{width:Col2Width,background:BackgroundStyle,align:'middle',text:'Вход CJC'},
		{width:Col1Width,background:BackgroundStyle,align:'middle',text:'Порт/Модуль'}
	];

	var Table=[
		Headers
	];

	for (i=1; i<=36; i++) {
		var Port=(Math.floor((i-1)/9)+1).format('',0);
		var Module=(((i-1) % 9)+1).format('',0);
		if ((Port % 2)==0) {
			BackgroundStyle=BackgroundStyle2;
		} else {
			BackgroundStyle=BackgroundStyle1;
		}
		var RowData=[
			{width:Col1Width,background:BackgroundStyle,align:'middle',text:'Порт '+Port+'/'+'Модуль '+Module},
			{width:Col2Width,background:BackgroundStyle,align:'middle',text:'XXXX.X'},
			{width:Col2Width,background:BackgroundStyle,align:'middle',text:'XXXX.X'},
			{width:Col2Width,background:BackgroundStyle,align:'middle',text:'XXXX.X'},
			{width:Col2Width,background:BackgroundStyle,align:'middle',text:'XXXX.X'},
			{width:Col2Width,background:BackgroundStyle,align:'middle',text:'XXXX.X'},
			{width:Col2Width,background:BackgroundStyle,align:'middle',text:'XXXX.X'},
			{width:Col2Width,background:BackgroundStyle,align:'middle',text:'XXXX.X'},
			{width:Col2Width,background:BackgroundStyle,align:'middle',text:'XXXX.X'},
			{width:Col2Width,background:BackgroundStyle,align:'middle',text:'XXXX.X'},
			{width:Col1Width,background:BackgroundStyle,align:'middle',text:'Порт '+Port+'/'+'Модуль '+Module}
		];
		Table[i]=RowData
	}

	createTable('ICP_TABLE',Table);

	rt=Runtime.getRuntime();	

	addKeyAction(function() { exitApp(); },KeyEvent.VK_Q,KeyEvent.CTRL_MASK);
	init_basic_without_diags_buttons_menu();
	setButton('EXIT_BUTTON','exit_click();');
	addKeyAction(exit_click,KeyEvent.VK_ESCAPE,0);

	setHighlightButton('M1_1_BUTTON','selector=1;');
	setHighlightButton('M1_2_BUTTON','selector=2;');

	
	
	
	
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
	animateButton('M1_1_I',selector==1);
	animateButton('M1_2_I',selector==2);


	var i=0;
	var j=0;
	for (i=1; i<=36; i++) {
		var Bridge=selector.format('',0);
		var Port=(Math.floor((i-1)/9)+1).format('',0);
		var Module=(((i-1) % 9)+1).format('',0);
		for (j=1; j<=9; j++) {
			Temperature=getFltTag('MM'+Bridge+'_ICP_CHANNEL_VALUE_'+Port+'_'+Module+'_'+j.format('',0)).format(1,'');
			if (Temperature=='-3276.8') {
				setTableText('ICP_TABLE',i,j,'-');
				setTableBackColor('ICP_TABLE',i,j,'rgb(255,255,255)');
			} else if (Temperature=='3276.7') {
				setTableText('ICP_TABLE',i,j,'MAX');
				setTableBackColor('ICP_TABLE',i,j,'rgb(255,255,0)');				
			} else if (Temperature=='9999.9') {
				setTableText('ICP_TABLE',i,j,'вне шкалы');
				setTableBackColor('ICP_TABLE',i,j,'rgb(255,0,0)');				
			} else {
				setTableText('ICP_TABLE',i,j,Temperature+' '+String.fromCharCode(176)+'C');
				setTableBackColor('ICP_TABLE',i,j,'rgb(0,255,0)');				
			}	

		}
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