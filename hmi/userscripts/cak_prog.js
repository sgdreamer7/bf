//////////////////////////////////////////////////////////////////////////////////////////////
// Автор: Владимир Щербина <vns.scherbina@gmail.com>
// copyright 2017
// Версия: 1.0.0
// Модуль cak_prog.js реализует анимацию и логику диалогового взаимодействия для видеокадра cak_prog.
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
	setText('TVD_COL_1',getFltTag('TVD_COL_1').format(2,''));
	setText('TVD_COL_2',getFltTag('TVD_COL_2').format(2,''));
	setText('TVD_COL_3',getFltTag('TVD_COL_3').format(2,''));
	setText('TVD_COL_4',getFltTag('TVD_COL_4').format(2,''));
	setText('TVD_COL_5',getFltTag('TVD_COL_5').format(2,''));

	setText('TVD_1_8C',getFltTag('TVD_1_8C').format(2,''));
	setText('TVD_1_9C',getFltTag('TVD_1_9C').format(2,''));
	setText('TVD_1_10C',getFltTag('TVD_1_10C').format(2,''));
	setText('TVD_1_11C',getFltTag('TVD_1_11C').format(2,''));
	setText('TVD_1_14C',getFltTag('TVD_1_14C').format(2,''));
	setText('TVD_2_28C',getFltTag('TVD_2_28C').format(2,''));
	setText('TVD_2_29C',getFltTag('TVD_2_29C').format(2,''));
	setText('TVD_3_16C',getFltTag('TVD_3_16C').format(2,''));
	setText('TVD_3_17C',getFltTag('TVD_3_17C').format(2,''));
	setText('TVD_3_18C',getFltTag('TVD_3_18C').format(2,''));
	setText('TVD_4_16C',getFltTag('TVD_4_16C').format(2,''));
	setText('TVD_4_17C',getFltTag('TVD_4_17C').format(2,''));
	setText('TVD_4_18C',getFltTag('TVD_4_18C').format(2,''));
	setText('TVD_5_16C',getFltTag('TVD_5_16C').format(2,''));
	setText('TVD_5_17C',getFltTag('TVD_5_17C').format(2,''));
	setText('TVD_5_18C',getFltTag('TVD_5_18C').format(2,''));
	setText('TVD_5_19C',getFltTag('TVD_5_19C').format(2,''));
	setText('TVD_5_24C',getFltTag('TVD_5_24C').format(2,''));
	setText('TVD_5_25C',getFltTag('TVD_5_25C').format(2,''));
	setText('TVD_5_26C',getFltTag('TVD_5_26C').format(2,''));

	setText('PVD_7_3C',getFltTag('PVD_7_3C').format(4,''));
	setText('PVD_7_6C',getFltTag('PVD_7_6C').format(4,''));
	setText('PVD_7_8C',getFltTag('PVD_7_8C').format(4,''));
	setText('PVD_7_10C',getFltTag('PVD_7_10C').format(4,''));
	setText('PVD_7_12C',getFltTag('PVD_7_12C').format(4,''));
	setText('PVD_8_4C',getFltTag('PVD_8_4C').format(4,''));
	setText('PVD_8_8C',getFltTag('PVD_8_8C').format(4,''));
	setText('PVD_8_12C',getFltTag('PVD_8_12C').format(4,''));
	setText('PVD_8_16C',getFltTag('PVD_8_16C').format(4,''));
	setText('PVD_8_20C',getFltTag('PVD_8_20C').format(4,''));
	setText('PVD_9_4C',getFltTag('PVD_9_4C').format(4,''));
	setText('PVD_9_8C',getFltTag('PVD_9_8C').format(4,''));
	setText('PVD_9_12C',getFltTag('PVD_9_12C').format(4,''));
	setText('PVD_9_16C',getFltTag('PVD_9_16C').format(4,''));
	setText('PVD_9_20C',getFltTag('PVD_9_20C').format(4,''));
	setText('PVD_10_4C',getFltTag('PVD_10_4C').format(4,''));
	setText('PVD_10_8C',getFltTag('PVD_10_8C').format(4,''));
	setText('PVD_10_18C',getFltTag('PVD_10_18C').format(4,''));
	setText('PVD_10_20C',getFltTag('PVD_10_20C').format(4,''));
	setText('PVD_10_22C',getFltTag('PVD_10_22C').format(4,''));

	setText('TVD_HISTO_VALUE_1_8C',getFltTag('TVD_1_8C').format(2,''));
	setText('TVD_HISTO_VALUE_1_9C',getFltTag('TVD_1_9C').format(2,''));
	setText('TVD_HISTO_VALUE_1_10C',getFltTag('TVD_1_10C').format(2,''));
	setText('TVD_HISTO_VALUE_1_11C',getFltTag('TVD_1_11C').format(2,''));
	setText('TVD_HISTO_VALUE_1_14C',getFltTag('TVD_1_14C').format(2,''));
	setText('TVD_HISTO_VALUE_2_28C',getFltTag('TVD_2_28C').format(2,''));
	setText('TVD_HISTO_VALUE_2_29C',getFltTag('TVD_2_29C').format(2,''));
	setText('TVD_HISTO_VALUE_3_16C',getFltTag('TVD_3_16C').format(2,''));
	setText('TVD_HISTO_VALUE_3_17C',getFltTag('TVD_3_17C').format(2,''));
	setText('TVD_HISTO_VALUE_3_18C',getFltTag('TVD_3_18C').format(2,''));
	setText('TVD_HISTO_VALUE_4_16C',getFltTag('TVD_4_16C').format(2,''));
	setText('TVD_HISTO_VALUE_4_17C',getFltTag('TVD_4_17C').format(2,''));
	setText('TVD_HISTO_VALUE_4_18C',getFltTag('TVD_4_18C').format(2,''));
	setText('TVD_HISTO_VALUE_5_16C',getFltTag('TVD_5_16C').format(2,''));
	setText('TVD_HISTO_VALUE_5_17C',getFltTag('TVD_5_17C').format(2,''));
	setText('TVD_HISTO_VALUE_5_18C',getFltTag('TVD_5_18C').format(2,''));
	setText('TVD_HISTO_VALUE_5_19C',getFltTag('TVD_5_19C').format(2,''));
	setText('TVD_HISTO_VALUE_5_24C',getFltTag('TVD_5_24C').format(2,''));
	setText('TVD_HISTO_VALUE_5_25C',getFltTag('TVD_5_25C').format(2,''));
	setText('TVD_HISTO_VALUE_5_26C',getFltTag('TVD_5_26C').format(2,''));
	setText('TVD_COL_HISTO_VALUE_1',getFltTag('TVD_COL_1').format(2,''));
	setText('TVD_COL_HISTO_VALUE_2',getFltTag('TVD_COL_2').format(2,''));
	setText('TVD_COL_HISTO_VALUE_3',getFltTag('TVD_COL_3').format(2,''));
	setText('TVD_COL_HISTO_VALUE_4',getFltTag('TVD_COL_4').format(2,''));
	setText('TVD_COL_HISTO_VALUE_5',getFltTag('TVD_COL_5').format(2,''));

	setAttr('TVD_HISTO_1_8C','width',checkLimits(200*getFltTag('TVD_1_8C')/50));
	setAttr('TVD_HISTO_1_9C','width',checkLimits(200*getFltTag('TVD_1_9C')/50));
	setAttr('TVD_HISTO_1_10C','width',checkLimits(200*getFltTag('TVD_1_10C')/50));
	setAttr('TVD_HISTO_1_11C','width',checkLimits(200*getFltTag('TVD_1_11C')/50));
	setAttr('TVD_HISTO_1_14C','width',checkLimits(200*getFltTag('TVD_1_14C')/50));
	setAttr('TVD_HISTO_2_28C','width',checkLimits(200*getFltTag('TVD_2_28C')/50));
	setAttr('TVD_HISTO_2_29C','width',checkLimits(200*getFltTag('TVD_2_29C')/50));
	setAttr('TVD_HISTO_3_16C','width',checkLimits(200*getFltTag('TVD_3_16C')/50));
	setAttr('TVD_HISTO_3_17C','width',checkLimits(200*getFltTag('TVD_3_17C')/50));
	setAttr('TVD_HISTO_3_18C','width',checkLimits(200*getFltTag('TVD_3_18C')/50));
	setAttr('TVD_HISTO_4_16C','width',checkLimits(200*getFltTag('TVD_4_16C')/50));
	setAttr('TVD_HISTO_4_17C','width',checkLimits(200*getFltTag('TVD_4_17C')/50));
	setAttr('TVD_HISTO_4_18C','width',checkLimits(200*getFltTag('TVD_4_18C')/50));
	setAttr('TVD_HISTO_5_16C','width',checkLimits(200*getFltTag('TVD_5_16C')/50));
	setAttr('TVD_HISTO_5_17C','width',checkLimits(200*getFltTag('TVD_5_17C')/50));
	setAttr('TVD_HISTO_5_18C','width',checkLimits(200*getFltTag('TVD_5_18C')/50));
	setAttr('TVD_HISTO_5_19C','width',checkLimits(200*getFltTag('TVD_5_19C')/50));
	setAttr('TVD_HISTO_5_24C','width',checkLimits(200*getFltTag('TVD_5_24C')/50));
	setAttr('TVD_HISTO_5_25C','width',checkLimits(200*getFltTag('TVD_5_25C')/50));
	setAttr('TVD_HISTO_5_26C','width',checkLimits(200*getFltTag('TVD_5_26C')/50));
	setAttr('TVD_COL_HISTO_1','width',checkLimits(200*getFltTag('TVD_COL_1')/50));
	setAttr('TVD_COL_HISTO_2','width',checkLimits(200*getFltTag('TVD_COL_2')/50));
	setAttr('TVD_COL_HISTO_3','width',checkLimits(200*getFltTag('TVD_COL_3')/50));
	setAttr('TVD_COL_HISTO_4','width',checkLimits(200*getFltTag('TVD_COL_4')/50));
	setAttr('TVD_COL_HISTO_5','width',checkLimits(200*getFltTag('TVD_COL_5')/50));


	setText('PVD_HISTO_VALUE_7_3C',getFltTag('PVD_7_3C').format(4,''));
	setText('PVD_HISTO_VALUE_7_6C',getFltTag('PVD_7_6C').format(4,''));
	setText('PVD_HISTO_VALUE_7_8C',getFltTag('PVD_7_8C').format(4,''));
	setText('PVD_HISTO_VALUE_7_10C',getFltTag('PVD_7_10C').format(4,''));
	setText('PVD_HISTO_VALUE_7_12C',getFltTag('PVD_7_12C').format(4,''));
	setText('PVD_HISTO_VALUE_8_4C',getFltTag('PVD_8_4C').format(4,''));
	setText('PVD_HISTO_VALUE_8_8C',getFltTag('PVD_8_8C').format(4,''));
	setText('PVD_HISTO_VALUE_8_12C',getFltTag('PVD_8_12C').format(4,''));
	setText('PVD_HISTO_VALUE_8_16C',getFltTag('PVD_8_16C').format(4,''));
	setText('PVD_HISTO_VALUE_8_20C',getFltTag('PVD_8_20C').format(4,''));
	setText('PVD_HISTO_VALUE_9_4C',getFltTag('PVD_9_4C').format(4,''));
	setText('PVD_HISTO_VALUE_9_8C',getFltTag('PVD_9_8C').format(4,''));
	setText('PVD_HISTO_VALUE_9_12C',getFltTag('PVD_9_12C').format(4,''));
	setText('PVD_HISTO_VALUE_9_16C',getFltTag('PVD_9_16C').format(4,''));
	setText('PVD_HISTO_VALUE_9_20C',getFltTag('PVD_9_20C').format(4,''));
	setText('PVD_HISTO_VALUE_10_4C',getFltTag('PVD_10_4C').format(4,''));
	setText('PVD_HISTO_VALUE_10_8C',getFltTag('PVD_10_8C').format(4,''));
	setText('PVD_HISTO_VALUE_10_18C',getFltTag('PVD_10_18C').format(4,''));
	setText('PVD_HISTO_VALUE_10_20C',getFltTag('PVD_10_20C').format(4,''));
	setText('PVD_HISTO_VALUE_10_22C',getFltTag('PVD_10_22C').format(4,''));

	setAttr('PVD_HISTO_7_3C','width',checkLimits(200*getFltTag('PVD_7_3C')/0.025));
	setAttr('PVD_HISTO_7_6C','width',checkLimits(200*getFltTag('PVD_7_6C')/0.025));
	setAttr('PVD_HISTO_7_8C','width',checkLimits(200*getFltTag('PVD_7_8C')/0.025));
	setAttr('PVD_HISTO_7_10C','width',checkLimits(200*getFltTag('PVD_7_10C')/0.025));
	setAttr('PVD_HISTO_7_12C','width',checkLimits(200*getFltTag('PVD_7_12C')/0.025));
	setAttr('PVD_HISTO_8_4C','width',checkLimits(200*getFltTag('PVD_8_4C')/0.025));
	setAttr('PVD_HISTO_8_8C','width',checkLimits(200*getFltTag('PVD_8_8C')/0.025));
	setAttr('PVD_HISTO_8_12C','width',checkLimits(200*getFltTag('PVD_8_12C')/0.025));
	setAttr('PVD_HISTO_8_16C','width',checkLimits(200*getFltTag('PVD_8_16C')/0.025));
	setAttr('PVD_HISTO_8_20C','width',checkLimits(200*getFltTag('PVD_8_20C')/0.025));
	setAttr('PVD_HISTO_9_4C','width',checkLimits(200*getFltTag('PVD_9_4C')/0.025));
	setAttr('PVD_HISTO_9_8C','width',checkLimits(200*getFltTag('PVD_9_8C')/0.025));
	setAttr('PVD_HISTO_9_12C','width',checkLimits(200*getFltTag('PVD_9_12C')/0.025));
	setAttr('PVD_HISTO_9_16C','width',checkLimits(200*getFltTag('PVD_9_16C')/0.025));
	setAttr('PVD_HISTO_9_20C','width',checkLimits(200*getFltTag('PVD_9_20C')/0.025));
	setAttr('PVD_HISTO_10_4C','width',checkLimits(200*getFltTag('PVD_10_4C')/0.025));
	setAttr('PVD_HISTO_10_8C','width',checkLimits(200*getFltTag('PVD_10_8C')/0.025));
	setAttr('PVD_HISTO_10_18C','width',checkLimits(200*getFltTag('PVD_10_18C')/0.025));
	setAttr('PVD_HISTO_10_20C','width',checkLimits(200*getFltTag('PVD_10_20C')/0.025));
	setAttr('PVD_HISTO_10_22C','width',checkLimits(200*getFltTag('PVD_10_22C')/0.025));

	animateAlarmBackStroke('TVD_COL_1');
	animateAlarmBackStroke('TVD_COL_2');
	animateAlarmBackStroke('TVD_COL_3');
	animateAlarmBackStroke('TVD_COL_4');
	animateAlarmBackStroke('TVD_COL_5');

	animateAlarmBackStroke('TVD_1_8C');
	animateAlarmBackStroke('TVD_1_9C');
	animateAlarmBackStroke('TVD_1_10C');
	animateAlarmBackStroke('TVD_1_11C');
	animateAlarmBackStroke('TVD_1_14C');
	animateAlarmBackStroke('TVD_2_28C');
	animateAlarmBackStroke('TVD_2_29C');
	animateAlarmBackStroke('TVD_3_16C');
	animateAlarmBackStroke('TVD_3_17C');
	animateAlarmBackStroke('TVD_3_18C');
	animateAlarmBackStroke('TVD_4_16C');
	animateAlarmBackStroke('TVD_4_17C');
	animateAlarmBackStroke('TVD_4_18C');
	animateAlarmBackStroke('TVD_5_16C');
	animateAlarmBackStroke('TVD_5_17C');
	animateAlarmBackStroke('TVD_5_18C');
	animateAlarmBackStroke('TVD_5_19C');
	animateAlarmBackStroke('TVD_5_24C');
	animateAlarmBackStroke('TVD_5_25C');
	animateAlarmBackStroke('TVD_5_26C');

	animateAlarmBackStroke('PVD_7_3C');
	animateAlarmBackStroke('PVD_7_6C');
	animateAlarmBackStroke('PVD_7_8C');
	animateAlarmBackStroke('PVD_7_10C');
	animateAlarmBackStroke('PVD_7_12C');
	animateAlarmBackStroke('PVD_8_4C');
	animateAlarmBackStroke('PVD_8_8C');
	animateAlarmBackStroke('PVD_8_12C');
	animateAlarmBackStroke('PVD_8_16C');
	animateAlarmBackStroke('PVD_8_20C');
	animateAlarmBackStroke('PVD_9_4C');
	animateAlarmBackStroke('PVD_9_8C');
	animateAlarmBackStroke('PVD_9_12C');
	animateAlarmBackStroke('PVD_9_16C');
	animateAlarmBackStroke('PVD_9_20C');
	animateAlarmBackStroke('PVD_10_4C');
	animateAlarmBackStroke('PVD_10_8C');
	animateAlarmBackStroke('PVD_10_18C');
	animateAlarmBackStroke('PVD_10_20C');
	animateAlarmBackStroke('PVD_10_22C');

	animateAlarmFill('TVD_HISTO_1_8C','TVD_1_8C');
	animateAlarmFill('TVD_HISTO_1_9C','TVD_1_9C');
	animateAlarmFill('TVD_HISTO_1_10C','TVD_1_10C');
	animateAlarmFill('TVD_HISTO_1_11C','TVD_1_11C');
	animateAlarmFill('TVD_HISTO_1_14C','TVD_1_14C');
	animateAlarmFill('TVD_HISTO_2_28C','TVD_2_28C');
	animateAlarmFill('TVD_HISTO_2_29C','TVD_2_29C');
	animateAlarmFill('TVD_HISTO_3_16C','TVD_3_16C');
	animateAlarmFill('TVD_HISTO_3_17C','TVD_3_17C');
	animateAlarmFill('TVD_HISTO_3_18C','TVD_3_18C');
	animateAlarmFill('TVD_HISTO_4_16C','TVD_4_16C');
	animateAlarmFill('TVD_HISTO_4_17C','TVD_4_17C');
	animateAlarmFill('TVD_HISTO_4_18C','TVD_4_18C');
	animateAlarmFill('TVD_HISTO_5_16C','TVD_5_16C');
	animateAlarmFill('TVD_HISTO_5_17C','TVD_5_17C');
	animateAlarmFill('TVD_HISTO_5_18C','TVD_5_18C');
	animateAlarmFill('TVD_HISTO_5_19C','TVD_5_19C');
	animateAlarmFill('TVD_HISTO_5_24C','TVD_5_24C');
	animateAlarmFill('TVD_HISTO_5_25C','TVD_5_25C');
	animateAlarmFill('TVD_HISTO_5_26C','TVD_5_26C');
	animateAlarmFill('TVD_COL_HISTO_1','TVD_COL_1');
	animateAlarmFill('TVD_COL_HISTO_2','TVD_COL_2');
	animateAlarmFill('TVD_COL_HISTO_3','TVD_COL_3');
	animateAlarmFill('TVD_COL_HISTO_4','TVD_COL_4');
	animateAlarmFill('TVD_COL_HISTO_5','TVD_COL_5');

	animateAlarmFill('PVD_HISTO_7_3C','PVD_7_3C');
	animateAlarmFill('PVD_HISTO_7_6C','PVD_7_6C');
	animateAlarmFill('PVD_HISTO_7_8C','PVD_7_8C');
	animateAlarmFill('PVD_HISTO_7_10C','PVD_7_10C');
	animateAlarmFill('PVD_HISTO_7_12C','PVD_7_12C');
	animateAlarmFill('PVD_HISTO_8_4C','PVD_8_4C');
	animateAlarmFill('PVD_HISTO_8_8C','PVD_8_8C');
	animateAlarmFill('PVD_HISTO_8_12C','PVD_8_12C');
	animateAlarmFill('PVD_HISTO_8_16C','PVD_8_16C');
	animateAlarmFill('PVD_HISTO_8_20C','PVD_8_20C');
	animateAlarmFill('PVD_HISTO_9_4C','PVD_9_4C');
	animateAlarmFill('PVD_HISTO_9_8C','PVD_9_8C');
	animateAlarmFill('PVD_HISTO_9_12C','PVD_9_12C');
	animateAlarmFill('PVD_HISTO_9_16C','PVD_9_16C');
	animateAlarmFill('PVD_HISTO_9_20C','PVD_9_20C');
	animateAlarmFill('PVD_HISTO_10_4C','PVD_10_4C');
	animateAlarmFill('PVD_HISTO_10_8C','PVD_10_8C');
	animateAlarmFill('PVD_HISTO_10_18C','PVD_10_18C');
	animateAlarmFill('PVD_HISTO_10_20C','PVD_10_20C');
	animateAlarmFill('PVD_HISTO_10_22C','PVD_10_22C');

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
