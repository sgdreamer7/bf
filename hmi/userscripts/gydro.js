//////////////////////////////////////////////////////////////////////////////////////////////
// Автор: Владимир Щербина <vns.scherbina@gmail.com>
// copyright 2017
// Версия: 1.0.0
// Модуль gydro.js реализует анимацию и логику диалогового взаимодействия для видеокадра gydro.
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

	setHighlightButton('ZDN_TMASL_1_MAX_G','changeRefValue(\'ZDN_TMASL_1_MAX\',0,80,\'Задание максимальной температуры масла в маслобаке 1\');');
	setHighlightButton('ZDN_TMASL_2_MAX_G','changeRefValue(\'ZDN_TMASL_2_MAX\',0,80,\'Задание максимальной температуры масла в маслобаке 2\');');
	setHighlightButton('ZDN_TMASL_1_MIN_G','changeRefValue(\'ZDN_TMASL_1_MIN\',0,80,\'Задание минимальной температуры масла в маслобаке 1\');');
	setHighlightButton('ZDN_TMASL_2_MIN_G','changeRefValue(\'ZDN_TMASL_2_MIN\',0,80,\'Задание минимальной температуры масла в маслобаке 2\');');

	setHighlightButton('MASL_TRENDS_1_BUTTON','showTrendByID(\'MASL_1_TRENDS\');');
	setHighlightButton('MASL_TRENDS_2_BUTTON','showTrendByID(\'MASL_1_TRENDS\');');
	setHighlightButton('MASL_TRENDS_3_BUTTON','showTrendByID(\'MASL_2_TRENDS\');');
	setHighlightButton('MASL_TRENDS_4_BUTTON','showTrendByID(\'MASL_2_TRENDS\');');
	setHighlightButton('MASL_TRENDS_5_BUTTON','showTrendByID(\'MASL_1_TRENDS\');');
	setHighlightButton('MASL_TRENDS_6_BUTTON','showTrendByID(\'MASL_2_TRENDS\');');

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
	setText('MEMORY_CLIENT_USED',Main.lastBackend); // setText('MEMORY_CLIENT_USED',(avgMemory.avg()).format2(0,'байт',' '));
}

//////////////////////////////////////////////////////////////////////////////////////////////
// Формат вызова: animate_fields()
// Назначение: Анимация для отображения значений полей данных.
// Параметры: -
//////////////////////////////////////////////////////////////////////////////////////////////
function animate_fields() {

	setText('VMK_OIL_PRESSURE_1',getFltTag('VMK_OIL_PRESSURE_1').format(2,''));
	setText('VMK_OIL_PRESSURE_2',getFltTag('VMK_OIL_PRESSURE_2').format(2,''));
	setText('VMK_POSITION',getFltTag('VMK_POSITION').format(0,''));
	setText('NMK_OIL_PRESSURE_1',getFltTag('NMK_OIL_PRESSURE_1').format(2,''));
	setText('NMK_OIL_PRESSURE_2',getFltTag('NMK_OIL_PRESSURE_2').format(2,''));
	setText('NMK_POSITION',getFltTag('NMK_POSITION').format(0,''));
	setText('BK_OIL_PRESSURE_1',getFltTag('BK_OIL_PRESSURE_1').format(2,''));
	setText('BK_OIL_PRESSURE_2',getFltTag('BK_OIL_PRESSURE_2').format(2,''));
	setText('BK_POSITION',getFltTag('BK_POSITION').format(0,''));
	setText('OIL_LEVEL_1',getFltTag('OIL_LEVEL_1').format(1,''));
	setText('OIL_LEVEL_2',getFltTag('OIL_LEVEL_2').format(1,''));
	setText('OIL_LEVEL_1_2',getFltTag('LMASL_1').format(1,''));
	setText('OIL_LEVEL_2_2',getFltTag('LMASL_2').format(1,''));
	setText('TMASL_1',getFltTag('TMASL_1').format(1,''));
	setText('TMASL_2',getFltTag('TMASL_2').format(1,''));
	setText('TVZ_GYD_1',getFltTag('TVZ_GYD_1').format(1,''));
	setText('TVZ_GYD_2',getFltTag('TVZ_GYD_2').format(1,''));
	setText('TVZ_GYD_3',getFltTag('TVZ_GYD_3').format(1,''));
	setText('TVZ_GYD_4',getFltTag('TVZ_GYD_4').format(1,''));
	setText('ZDN_TMASL_1_MAX',getFltTag('ZDN_TMASL_1_MAX').format(1,''));
	setText('ZDN_TMASL_2_MAX',getFltTag('ZDN_TMASL_2_MAX').format(1,''));
	setText('ZDN_TMASL_1_MIN',getFltTag('ZDN_TMASL_1_MIN').format(1,''));
	setText('ZDN_TMASL_2_MIN',getFltTag('ZDN_TMASL_2_MIN').format(1,''));

	setStyle('GK_SELECTED_1','fill',getBoolTag('GK_SELECTED_1')  ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setStyle('GK_SELECTED_2','fill',getBoolTag('GK_SELECTED_2')  ? 'rgb(0,255,0)' : 'rgb(224,224,224)');

	animateAlarmBackStroke('VMK_OIL_PRESSURE_1');
	animateAlarmBackStroke('VMK_OIL_PRESSURE_2');
	animateAlarmBackStroke('VMK_POSITION');
	animateAlarmBackStroke('NMK_OIL_PRESSURE_1');
	animateAlarmBackStroke('NMK_OIL_PRESSURE_2');
	animateAlarmBackStroke('NMK_POSITION');
	animateAlarmBackStroke('BK_OIL_PRESSURE_1');
	animateAlarmBackStroke('BK_OIL_PRESSURE_2');
	animateAlarmBackStroke('BK_POSITION');
	animateAlarmBackStroke('OIL_LEVEL_1');
	animateAlarmBackStroke('OIL_LEVEL_2');
	animateAlarmStroke('OIL_LEVEL_1_2_BACK','LMASL_1');
	animateAlarmStroke('OIL_LEVEL_2_2_BACK','LMASL_2');
	animateAlarmBackStroke('TMASL_1');
	animateAlarmBackStroke('TMASL_2');
	animateAlarmBackStroke('TVZ_GYD_1');
	animateAlarmBackStroke('TVZ_GYD_2');
	animateAlarmBackStroke('TVZ_GYD_3');
	animateAlarmBackStroke('TVZ_GYD_4');
	
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
