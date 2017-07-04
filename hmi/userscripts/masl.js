//////////////////////////////////////////////////////////////////////////////////////////////
// Автор: Владимир Щербина <vns.scherbina@gmail.com>
// copyright 2017
// Версия: 1.0.0
// Модуль masl.js реализует анимацию и логику диалогового взаимодействия для видеокадра masl.
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

	rt=Runtime.getRuntime();	

	addKeyAction(function() { exitApp(); },KeyEvent.VK_Q,KeyEvent.CTRL_MASK);
	init_basic_buttons_menu();
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
	for (i=1; i<=6; i++) {
		setStyle('G'+i.format(0,'')+'_READY','fill',getBoolTag('G'+i.format(0,'')+'_READY') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
		setStyle('G'+i.format(0,'')+'_AUTOMATIC','fill',getBoolTag('G'+i.format(0,'')+'_AUTOMATIC') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
		setStyle('G'+i.format(0,'')+'_LOCAL_1','fill',getBoolTag('G'+i.format(0,'')+'_LOCAL_1') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
		setStyle('G'+i.format(0,'')+'_LOCAL_2','fill',getBoolTag('G'+i.format(0,'')+'_LOCAL_2') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
		setStyle('G'+i.format(0,'')+'_WORK_1','fill',getBoolTag('G'+i.format(0,'')+'_WORK_1') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
		setStyle('G'+i.format(0,'')+'_WORK_2','fill',getBoolTag('G'+i.format(0,'')+'_WORK_2') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
		setStyle('G'+i.format(0,'')+'_PUMP_ON','fill',getBoolTag('G'+i.format(0,'')+'_PUMP_ON') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
		setStyle('G'+i.format(0,'')+'_WORK_DELAYED','fill',getBoolTag('G'+i.format(0,'')+'_WORK_DELAYED') ? 'rgb(255,0,0)' : 'rgb(224,224,224)');
		setStyle('G'+i.format(0,'')+'_PAUSE_DELAYED','fill',getBoolTag('G'+i.format(0,'')+'_PAUSE_DELAYED') ? 'rgb(255,0,0)' : 'rgb(224,224,224)');
		setStyle('G'+i.format(0,'')+'_LEVEL_EMPTY','fill',getBoolTag('G'+i.format(0,'')+'_LEVEL_EMPTY') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
		setStyle('G'+i.format(0,'')+'_LEVEL_FULL','fill',getBoolTag('G'+i.format(0,'')+'_LEVEL_FULL') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
		setText('G'+i.format(0,'')+'_PRESSURE_1',getFltTag('G'+i.format(0,'')+'_PRESSURE_1').format(2,''));
		setText('G'+i.format(0,'')+'_PRESSURE_2',getFltTag('G'+i.format(0,'')+'_PRESSURE_2').format(2,''));
		animateAlarmBackStroke('G'+i.format(0,'')+'_PRESSURE_1');
		animateAlarmBackStroke('G'+i.format(0,'')+'_PRESSURE_2');
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
