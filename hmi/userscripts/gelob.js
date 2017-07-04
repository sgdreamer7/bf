//////////////////////////////////////////////////////////////////////////////////////////////
// Автор: Владимир Щербина <vns.scherbina@gmail.com>
// copyright 2017
// Версия: 1.0.0
// Модуль gelob.js реализует анимацию и логику диалогового взаимодействия для видеокадра gelob.
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

	setButton('GELOB_1_TREND_BUTTON','showTrendByID(\'GELOB_1_TRENDS\');');
	setButton('GELOB_2_TREND_BUTTON','showTrendByID(\'GELOB_2_TRENDS\');');

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

	setText('TGELFUT_1_1',getFltTag('TGELFUT_1_1').format(0,''));
	setText('TGELFUT_1_2',getFltTag('TGELFUT_1_2').format(0,''));
	setText('TGELFUT_1_3',getFltTag('TGELFUT_1_3').format(0,''));
	setText('TGELFUT_1_4',getFltTag('TGELFUT_1_4').format(0,''));
	setText('TGELFUT_1_5',getFltTag('TGELFUT_1_5').format(0,''));
	
	setText('TGELKOG_1_1',getFltTag('TGELKOG_1_1').format(0,''));
	setText('TGELKOG_1_2',getFltTag('TGELKOG_1_2').format(0,''));
	setText('TGELKOG_1_3',getFltTag('TGELKOG_1_3').format(0,''));
	setText('TGELKOG_1_4',getFltTag('TGELKOG_1_4').format(0,''));
	setText('TGELKOG_1_5',getFltTag('TGELKOG_1_5').format(0,''));
	setText('TGELKOG_1_6',getFltTag('TGELKOG_1_6').format(0,''));

	setText('TGELFUT_2_1',getFltTag('TGELFUT_2_1').format(0,''));
	setText('TGELFUT_2_2',getFltTag('TGELFUT_2_2').format(0,''));
	setText('TGELFUT_2_3',getFltTag('TGELFUT_2_3').format(0,''));
	setText('TGELFUT_2_4',getFltTag('TGELFUT_2_4').format(0,''));
	setText('TGELFUT_2_5',getFltTag('TGELFUT_2_5').format(0,''));
	
	setText('TGELKOG_2_1',getFltTag('TGELKOG_2_1').format(0,''));
	setText('TGELKOG_2_2',getFltTag('TGELKOG_2_2').format(0,''));
	setText('TGELKOG_2_3',getFltTag('TGELKOG_2_3').format(0,''));
	setText('TGELKOG_2_4',getFltTag('TGELKOG_2_4').format(0,''));
	setText('TGELKOG_2_5',getFltTag('TGELKOG_2_5').format(0,''));
	setText('TGELKOG_2_6',getFltTag('TGELKOG_2_6').format(0,''));

	animateAlarmBackStroke('TGELFUT_1_1');
	animateAlarmBackStroke('TGELFUT_1_2');
	animateAlarmBackStroke('TGELFUT_1_3');
	animateAlarmBackStroke('TGELFUT_1_4');
	animateAlarmBackStroke('TGELFUT_1_5');
	
	animateAlarmBackStroke('TGELKOG_1_1');
	animateAlarmBackStroke('TGELKOG_1_2');
	animateAlarmBackStroke('TGELKOG_1_3');
	animateAlarmBackStroke('TGELKOG_1_4');
	animateAlarmBackStroke('TGELKOG_1_5');
	animateAlarmBackStroke('TGELKOG_1_6');

	animateAlarmBackStroke('TGELFUT_2_1');
	animateAlarmBackStroke('TGELFUT_2_2');
	animateAlarmBackStroke('TGELFUT_2_3');
	animateAlarmBackStroke('TGELFUT_2_4');
	animateAlarmBackStroke('TGELFUT_2_5');
	
	animateAlarmBackStroke('TGELKOG_2_1');
	animateAlarmBackStroke('TGELKOG_2_2');
	animateAlarmBackStroke('TGELKOG_2_3');
	animateAlarmBackStroke('TGELKOG_2_4');
	animateAlarmBackStroke('TGELKOG_2_5');
	animateAlarmBackStroke('TGELKOG_2_6');

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