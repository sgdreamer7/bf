//////////////////////////////////////////////////////////////////////////////////////////////
// Автор: Владимир Щербина <vns.scherbina@gmail.com>
// copyright 2017
// Версия: 1.0.0
// Модуль cak_bottom.js реализует анимацию и логику диалогового взаимодействия для видеокадра cak_bottom.
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

	setText('FVD_6_26C',getFltTag('FVD_6_26C').format(2,''));
	setText('FVD_6_25C',getFltTag('FVD_6_25C').format(2,''));
	setText('FVD_6_24C',getFltTag('FVD_6_24C').format(2,''));
	setText('FVD_6_23C',getFltTag('FVD_6_23C').format(2,''));
	setText('FVD_6_22C',getFltTag('FVD_6_22C').format(2,''));
	setText('FVD_6_21C',getFltTag('FVD_6_21C').format(2,''));
	setText('FVD_6_20C',getFltTag('FVD_6_20C').format(2,''));
	setText('FVD_4_15C',getFltTag('FVD_4_15C').format(2,''));
	setText('FVD_4_14C',getFltTag('FVD_4_14C').format(2,''));
	setText('FVD_4_13C',getFltTag('FVD_4_13C').format(2,''));

	setText('TVD_6_26C',getFltTag('TVD_6_26C').format(2,''));
	setText('TVD_6_25C',getFltTag('TVD_6_25C').format(2,''));
	setText('TVD_6_24C',getFltTag('TVD_6_24C').format(2,''));
	setText('TVD_6_23C',getFltTag('TVD_6_23C').format(2,''));
	setText('TVD_6_22C',getFltTag('TVD_6_22C').format(2,''));
	setText('TVD_6_21C',getFltTag('TVD_6_21C').format(2,''));
	setText('TVD_6_20C',getFltTag('TVD_6_20C').format(2,''));
	setText('TVD_4_15C',getFltTag('TVD_4_15C').format(2,''));
	setText('TVD_4_14C',getFltTag('TVD_4_14C').format(2,''));
	setText('TVD_4_13C',getFltTag('TVD_4_13C').format(2,''));
	setText('TVD_COL_4',getFltTag('TVD_COL_4').format(2,''));
	setText('TVD_COL_6',getFltTag('TVD_COL_6').format(2,''));
	
	setText('TVD_HISTO_VALUE_6_26C',getFltTag('TVD_6_26C').format(2,''));
	setText('TVD_HISTO_VALUE_6_25C',getFltTag('TVD_6_25C').format(2,''));
	setText('TVD_HISTO_VALUE_6_24C',getFltTag('TVD_6_24C').format(2,''));
	setText('TVD_HISTO_VALUE_6_23C',getFltTag('TVD_6_23C').format(2,''));
	setText('TVD_HISTO_VALUE_6_22C',getFltTag('TVD_6_22C').format(2,''));
	setText('TVD_HISTO_VALUE_6_21C',getFltTag('TVD_6_21C').format(2,''));
	setText('TVD_HISTO_VALUE_6_20C',getFltTag('TVD_6_20C').format(2,''));
	setText('TVD_HISTO_VALUE_4_15C',getFltTag('TVD_4_15C').format(2,''));
	setText('TVD_HISTO_VALUE_4_14C',getFltTag('TVD_4_14C').format(2,''));
	setText('TVD_HISTO_VALUE_4_13C',getFltTag('TVD_4_13C').format(2,''));
	setText('TVD_COL_HISTO_VALUE_4',getFltTag('TVD_COL_4').format(2,''));
	setText('TVD_COL_HISTO_VALUE_6',getFltTag('TVD_COL_6').format(2,''));

	setAttr('TVD_HISTO_6_26C','width',checkLimits(200*getFltTag('TVD_6_26C')/50));
	setAttr('TVD_HISTO_6_25C','width',checkLimits(200*getFltTag('TVD_6_25C')/50));
	setAttr('TVD_HISTO_6_24C','width',checkLimits(200*getFltTag('TVD_6_24C')/50));
	setAttr('TVD_HISTO_6_23C','width',checkLimits(200*getFltTag('TVD_6_23C')/50));
	setAttr('TVD_HISTO_6_22C','width',checkLimits(200*getFltTag('TVD_6_22C')/50));
	setAttr('TVD_HISTO_6_21C','width',checkLimits(200*getFltTag('TVD_6_21C')/50));
	setAttr('TVD_HISTO_6_20C','width',checkLimits(200*getFltTag('TVD_6_20C')/50));
	setAttr('TVD_HISTO_4_15C','width',checkLimits(200*getFltTag('TVD_4_15C')/50));
	setAttr('TVD_HISTO_4_14C','width',checkLimits(200*getFltTag('TVD_4_14C')/50));
	setAttr('TVD_HISTO_4_13C','width',checkLimits(200*getFltTag('TVD_4_13C')/50));
	setAttr('TVD_COL_HISTO_4','width',checkLimits(200*getFltTag('TVD_COL_4')/50));
	setAttr('TVD_COL_HISTO_6','width',checkLimits(200*getFltTag('TVD_COL_6')/50));

	setText('FVD_HISTO_VALUE_6_26C',getFltTag('FVD_6_26C').format(2,''));
	setText('FVD_HISTO_VALUE_6_25C',getFltTag('FVD_6_25C').format(2,''));
	setText('FVD_HISTO_VALUE_6_24C',getFltTag('FVD_6_24C').format(2,''));
	setText('FVD_HISTO_VALUE_6_23C',getFltTag('FVD_6_23C').format(2,''));
	setText('FVD_HISTO_VALUE_6_22C',getFltTag('FVD_6_22C').format(2,''));
	setText('FVD_HISTO_VALUE_6_21C',getFltTag('FVD_6_21C').format(2,''));
	setText('FVD_HISTO_VALUE_6_20C',getFltTag('FVD_6_20C').format(2,''));
	setText('FVD_HISTO_VALUE_4_15C',getFltTag('FVD_4_15C').format(2,''));
	setText('FVD_HISTO_VALUE_4_14C',getFltTag('FVD_4_14C').format(2,''));
	setText('FVD_HISTO_VALUE_4_13C',getFltTag('FVD_4_13C').format(2,''));

	setAttr('FVD_HISTO_6_26C','width',checkLimits(200*(getFltTag('FVD_6_26C')-0.4)/14.6));
	setAttr('FVD_HISTO_6_25C','width',checkLimits(200*(getFltTag('FVD_6_25C')-0.4)/14.6));
	setAttr('FVD_HISTO_6_24C','width',checkLimits(200*(getFltTag('FVD_6_24C')-0.4)/14.6));
	setAttr('FVD_HISTO_6_23C','width',checkLimits(200*(getFltTag('FVD_6_23C')-0.4)/14.6));
	setAttr('FVD_HISTO_6_22C','width',checkLimits(200*(getFltTag('FVD_6_22C')-0.4)/14.6));
	setAttr('FVD_HISTO_6_21C','width',checkLimits(200*(getFltTag('FVD_6_21C')-0.4)/14.6));
	setAttr('FVD_HISTO_6_20C','width',checkLimits(200*(getFltTag('FVD_6_20C')-0.4)/14.6));
	setAttr('FVD_HISTO_4_15C','width',checkLimits(200*(getFltTag('FVD_4_15C')-0.4)/14.6));
	setAttr('FVD_HISTO_4_14C','width',checkLimits(200*(getFltTag('FVD_4_14C')-0.4)/14.6));
	setAttr('FVD_HISTO_4_13C','width',checkLimits(200*(getFltTag('FVD_4_13C')-0.4)/14.6));
	
	animateAlarmBackStroke('FVD_6_26C');
	animateAlarmBackStroke('FVD_6_25C');
	animateAlarmBackStroke('FVD_6_24C');
	animateAlarmBackStroke('FVD_6_23C');
	animateAlarmBackStroke('FVD_6_22C');
	animateAlarmBackStroke('FVD_6_21C');
	animateAlarmBackStroke('FVD_6_20C');
	animateAlarmBackStroke('FVD_4_15C');
	animateAlarmBackStroke('FVD_4_14C');
	animateAlarmBackStroke('FVD_4_13C');

	animateAlarmBackStroke('TVD_6_26C');
	animateAlarmBackStroke('TVD_6_25C');
	animateAlarmBackStroke('TVD_6_24C');
	animateAlarmBackStroke('TVD_6_23C');
	animateAlarmBackStroke('TVD_6_22C');
	animateAlarmBackStroke('TVD_6_21C');
	animateAlarmBackStroke('TVD_6_20C');
	animateAlarmBackStroke('TVD_4_15C');
	animateAlarmBackStroke('TVD_4_14C');
	animateAlarmBackStroke('TVD_4_13C');
	animateAlarmBackStroke('TVD_COL_4');
	animateAlarmBackStroke('TVD_COL_6');

	animateAlarmFill('TVD_HISTO_6_26C','TVD_6_26C');
	animateAlarmFill('TVD_HISTO_6_25C','TVD_6_25C');
	animateAlarmFill('TVD_HISTO_6_24C','TVD_6_24C');
	animateAlarmFill('TVD_HISTO_6_23C','TVD_6_23C');
	animateAlarmFill('TVD_HISTO_6_22C','TVD_6_22C');
	animateAlarmFill('TVD_HISTO_6_21C','TVD_6_21C');
	animateAlarmFill('TVD_HISTO_6_20C','TVD_6_20C');
	animateAlarmFill('TVD_HISTO_4_15C','TVD_4_15C');
	animateAlarmFill('TVD_HISTO_4_14C','TVD_4_14C');
	animateAlarmFill('TVD_HISTO_4_13C','TVD_4_13C');
	animateAlarmFill('TVD_COL_HISTO_4','TVD_COL_4');
	animateAlarmFill('TVD_COL_HISTO_6','TVD_COL_6');

	animateAlarmFill('FVD_HISTO_6_26C','FVD_6_26C');
	animateAlarmFill('FVD_HISTO_6_25C','FVD_6_25C');
	animateAlarmFill('FVD_HISTO_6_24C','FVD_6_24C');
	animateAlarmFill('FVD_HISTO_6_23C','FVD_6_23C');
	animateAlarmFill('FVD_HISTO_6_22C','FVD_6_22C');
	animateAlarmFill('FVD_HISTO_6_21C','FVD_6_21C');
	animateAlarmFill('FVD_HISTO_6_20C','FVD_6_20C');
	animateAlarmFill('FVD_HISTO_4_15C','FVD_4_15C');
	animateAlarmFill('FVD_HISTO_4_14C','FVD_4_14C');
	animateAlarmFill('FVD_HISTO_4_13C','FVD_4_13C');
	
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
// Формат вызова: checkLimits(V)
// Назначение: Проверка значения на допустимый диапазон.
// Параметры:
//             V 		- проверяемое значение.
//////////////////////////////////////////////////////////////////////////////////////////////
function checkLimits(V) {
	if (V<0) {
		return 0;
	} else if (V>200) {
		return 200;
	}
	return V;
}
