//////////////////////////////////////////////////////////////////////////////////////////////
// Автор: Владимир Щербина <vns.scherbina@gmail.com>
// copyright 2017
// Версия: 1.0.0
// Модуль cak_tap.js реализует анимацию и логику диалогового взаимодействия для видеокадра cak_tap.
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

	setText('FVD_1_12C',getFltTag('FVD_1_12C').format(2,''));
	setText('FVD_1_13C',getFltTag('FVD_1_13C').format(2,''));
	setText('FVD_1_6C',getFltTag('FVD_1_6C').format(2,''));
	setText('FVD_1_2C',getFltTag('FVD_1_2C').format(2,''));
	setText('FVD_1_3C',getFltTag('FVD_1_3C').format(2,''));
	setText('FVD_1_5C',getFltTag('FVD_1_5C').format(2,''));
	setText('FVD_1_4C',getFltTag('FVD_1_4C').format(2,''));
	setText('FVD_5_28C',getFltTag('FVD_5_28C').format(2,''));
	setText('FVD_5_29C',getFltTag('FVD_5_29C').format(2,''));
	setText('FVD_5_20C',getFltTag('FVD_5_20C').format(2,''));
	setText('FVD_5_30C',getFltTag('FVD_5_30C').format(2,''));
	setText('FVD_5_23C',getFltTag('FVD_5_23C').format(2,''));
	setText('FVD_5_22C',getFltTag('FVD_5_22C').format(2,''));
	setText('FVD_5_21C',getFltTag('FVD_5_21C').format(2,''));
	setText('FVD_6_27C',getFltTag('FVD_6_27C').format(2,''));
	setText('FVD_6_28C',getFltTag('FVD_6_28C').format(2,''));
	setText('FVD_6_29C',getFltTag('FVD_6_29C').format(2,''));
	setText('FVD_6_30C',getFltTag('FVD_6_30C').format(2,''));

	setText('TVD_1_12C',getFltTag('TVD_1_12C').format(2,''));
	setText('TVD_1_13C',getFltTag('TVD_1_13C').format(2,''));
	setText('TVD_1_6C',getFltTag('TVD_1_6C').format(2,''));
	setText('TVD_1_2C',getFltTag('TVD_1_2C').format(2,''));
	setText('TVD_1_3C',getFltTag('TVD_1_3C').format(2,''));
	setText('TVD_1_5C',getFltTag('TVD_1_5C').format(2,''));
	setText('TVD_1_4C',getFltTag('TVD_1_4C').format(2,''));
	setText('TVD_5_28C',getFltTag('TVD_5_28C').format(2,''));
	setText('TVD_5_29C',getFltTag('TVD_5_29C').format(2,''));
	setText('TVD_5_20C',getFltTag('TVD_5_20C').format(2,''));
	setText('TVD_5_30C',getFltTag('TVD_5_30C').format(2,''));
	setText('TVD_5_23C',getFltTag('TVD_5_23C').format(2,''));
	setText('TVD_5_22C',getFltTag('TVD_5_22C').format(2,''));
	setText('TVD_5_21C',getFltTag('TVD_5_21C').format(2,''));
	setText('TVD_6_27C',getFltTag('TVD_6_27C').format(2,''));
	setText('TVD_6_28C',getFltTag('TVD_6_28C').format(2,''));
	setText('TVD_6_29C',getFltTag('TVD_6_29C').format(2,''));
	setText('TVD_6_30C',getFltTag('TVD_6_30C').format(2,''));
	setText('TVD_COL_1',getFltTag('TVD_COL_1').format(2,''));
	setText('TVD_COL_5',getFltTag('TVD_COL_5').format(2,''));
	setText('TVD_COL_6',getFltTag('TVD_COL_6').format(2,''));
	
	setText('TVD_HISTO_VALUE_1_12C',getFltTag('TVD_1_12C').format(2,''));
	setText('TVD_HISTO_VALUE_1_13C',getFltTag('TVD_1_13C').format(2,''));
	setText('TVD_HISTO_VALUE_1_6C',getFltTag('TVD_1_6C').format(2,''));
	setText('TVD_HISTO_VALUE_1_2C',getFltTag('TVD_1_2C').format(2,''));
	setText('TVD_HISTO_VALUE_1_3C',getFltTag('TVD_1_3C').format(2,''));
	setText('TVD_HISTO_VALUE_1_5C',getFltTag('TVD_1_5C').format(2,''));
	setText('TVD_HISTO_VALUE_1_4C',getFltTag('TVD_1_4C').format(2,''));
	setText('TVD_HISTO_VALUE_5_28C',getFltTag('TVD_5_28C').format(2,''));
	setText('TVD_HISTO_VALUE_5_29C',getFltTag('TVD_5_29C').format(2,''));
	setText('TVD_HISTO_VALUE_5_20C',getFltTag('TVD_5_20C').format(2,''));
	setText('TVD_HISTO_VALUE_5_30C',getFltTag('TVD_5_30C').format(2,''));
	setText('TVD_HISTO_VALUE_5_23C',getFltTag('TVD_5_23C').format(2,''));
	setText('TVD_HISTO_VALUE_5_22C',getFltTag('TVD_5_22C').format(2,''));
	setText('TVD_HISTO_VALUE_5_21C',getFltTag('TVD_5_21C').format(2,''));
	setText('TVD_HISTO_VALUE_6_27C',getFltTag('TVD_6_27C').format(2,''));
	setText('TVD_HISTO_VALUE_6_28C',getFltTag('TVD_6_28C').format(2,''));
	setText('TVD_HISTO_VALUE_6_29C',getFltTag('TVD_6_29C').format(2,''));
	setText('TVD_HISTO_VALUE_6_30C',getFltTag('TVD_6_30C').format(2,''));
	setText('TVD_COL_HISTO_VALUE_1',getFltTag('TVD_COL_1').format(2,''));
	setText('TVD_COL_HISTO_VALUE_5',getFltTag('TVD_COL_5').format(2,''));
	setText('TVD_COL_HISTO_VALUE_6',getFltTag('TVD_COL_6').format(2,''));

	setAttr('TVD_HISTO_1_12C','width',checkLimits(200*getFltTag('TVD_1_12C')/50));
	setAttr('TVD_HISTO_1_13C','width',checkLimits(200*getFltTag('TVD_1_13C')/50));
	setAttr('TVD_HISTO_1_6C','width',checkLimits(200*getFltTag('TVD_1_6C')/50));
	setAttr('TVD_HISTO_1_2C','width',checkLimits(200*getFltTag('TVD_1_2C')/50));
	setAttr('TVD_HISTO_1_3C','width',checkLimits(200*getFltTag('TVD_1_3C')/50));
	setAttr('TVD_HISTO_1_5C','width',checkLimits(200*getFltTag('TVD_1_5C')/50));
	setAttr('TVD_HISTO_1_4C','width',checkLimits(200*getFltTag('TVD_1_4C')/50));
	setAttr('TVD_HISTO_5_28C','width',checkLimits(200*getFltTag('TVD_5_28C')/50));
	setAttr('TVD_HISTO_5_29C','width',checkLimits(200*getFltTag('TVD_5_29C')/50));
	setAttr('TVD_HISTO_5_20C','width',checkLimits(200*getFltTag('TVD_5_20C')/50));
	setAttr('TVD_HISTO_5_30C','width',checkLimits(200*getFltTag('TVD_5_30C')/50));
	setAttr('TVD_HISTO_5_23C','width',checkLimits(200*getFltTag('TVD_5_23C')/50));
	setAttr('TVD_HISTO_5_22C','width',checkLimits(200*getFltTag('TVD_5_22C')/50));
	setAttr('TVD_HISTO_5_21C','width',checkLimits(200*getFltTag('TVD_5_21C')/50));
	setAttr('TVD_HISTO_6_27C','width',checkLimits(200*getFltTag('TVD_6_27C')/50));
	setAttr('TVD_HISTO_6_28C','width',checkLimits(200*getFltTag('TVD_6_28C')/50));
	setAttr('TVD_HISTO_6_29C','width',checkLimits(200*getFltTag('TVD_6_29C')/50));
	setAttr('TVD_HISTO_6_30C','width',checkLimits(200*getFltTag('TVD_6_30C')/50));
	setAttr('TVD_COL_HISTO_1','width',checkLimits(200*getFltTag('TVD_COL_1')/50));
	setAttr('TVD_COL_HISTO_5','width',checkLimits(200*getFltTag('TVD_COL_5')/50));
	setAttr('TVD_COL_HISTO_6','width',checkLimits(200*getFltTag('TVD_COL_6')/50));

	setText('FVD_HISTO_VALUE_1_12C',getFltTag('FVD_1_12C').format(2,''));
	setText('FVD_HISTO_VALUE_1_13C',getFltTag('FVD_1_13C').format(2,''));
	setText('FVD_HISTO_VALUE_1_6C',getFltTag('FVD_1_6C').format(2,''));
	setText('FVD_HISTO_VALUE_1_2C',getFltTag('FVD_1_2C').format(2,''));
	setText('FVD_HISTO_VALUE_1_3C',getFltTag('FVD_1_3C').format(2,''));
	setText('FVD_HISTO_VALUE_1_5C',getFltTag('FVD_1_5C').format(2,''));
	setText('FVD_HISTO_VALUE_1_4C',getFltTag('FVD_1_4C').format(2,''));
	setText('FVD_HISTO_VALUE_5_28C',getFltTag('FVD_5_28C').format(2,''));
	setText('FVD_HISTO_VALUE_5_29C',getFltTag('FVD_5_29C').format(2,''));
	setText('FVD_HISTO_VALUE_5_20C',getFltTag('FVD_5_20C').format(2,''));
	setText('FVD_HISTO_VALUE_5_30C',getFltTag('FVD_5_30C').format(2,''));
	setText('FVD_HISTO_VALUE_5_23C',getFltTag('FVD_5_23C').format(2,''));
	setText('FVD_HISTO_VALUE_5_22C',getFltTag('FVD_5_22C').format(2,''));
	setText('FVD_HISTO_VALUE_5_21C',getFltTag('FVD_5_21C').format(2,''));
	setText('FVD_HISTO_VALUE_6_27C',getFltTag('FVD_6_27C').format(2,''));
	setText('FVD_HISTO_VALUE_6_28C',getFltTag('FVD_6_28C').format(2,''));
	setText('FVD_HISTO_VALUE_6_29C',getFltTag('FVD_6_29C').format(2,''));
	setText('FVD_HISTO_VALUE_6_30C',getFltTag('FVD_6_30C').format(2,''));

	setAttr('FVD_HISTO_1_12C','width',checkLimits(200*(getFltTag('FVD_1_12C')-0.4)/14.6));
	setAttr('FVD_HISTO_1_13C','width',checkLimits(200*(getFltTag('FVD_1_13C')-0.4)/14.6));
	setAttr('FVD_HISTO_1_6C','width',checkLimits(200*(getFltTag('FVD_1_6C')-0.4)/14.6));
	setAttr('FVD_HISTO_1_2C','width',checkLimits(200*(getFltTag('FVD_1_2C')-0.4)/14.6));
	setAttr('FVD_HISTO_1_3C','width',checkLimits(200*(getFltTag('FVD_1_3C')-0.4)/14.6));
	setAttr('FVD_HISTO_1_5C','width',checkLimits(200*(getFltTag('FVD_1_5C')-0.4)/14.6));
	setAttr('FVD_HISTO_1_4C','width',checkLimits(200*(getFltTag('FVD_1_4C')-0.4)/14.6));
	setAttr('FVD_HISTO_5_28C','width',checkLimits(200*(getFltTag('FVD_5_28C')-0.4)/14.6));
	setAttr('FVD_HISTO_5_29C','width',checkLimits(200*(getFltTag('FVD_5_29C')-0.4)/14.6));
	setAttr('FVD_HISTO_5_20C','width',checkLimits(200*(getFltTag('FVD_5_20C')-0.4)/14.6));
	setAttr('FVD_HISTO_5_30C','width',checkLimits(200*(getFltTag('FVD_5_30C')-0.4)/14.6));
	setAttr('FVD_HISTO_5_23C','width',checkLimits(200*(getFltTag('FVD_5_23C')-0.4)/14.6));
	setAttr('FVD_HISTO_5_22C','width',checkLimits(200*(getFltTag('FVD_5_22C')-0.4)/14.6));
	setAttr('FVD_HISTO_5_21C','width',checkLimits(200*(getFltTag('FVD_5_21C')-0.4)/14.6));
	setAttr('FVD_HISTO_6_27C','width',checkLimits(200*(getFltTag('FVD_6_27C')-0.4)/14.6));
	setAttr('FVD_HISTO_6_28C','width',checkLimits(200*(getFltTag('FVD_6_28C')-0.4)/14.6));
	setAttr('FVD_HISTO_6_29C','width',checkLimits(200*(getFltTag('FVD_6_29C')-0.4)/14.6));
	setAttr('FVD_HISTO_6_30C','width',checkLimits(200*(getFltTag('FVD_6_30C')-0.4)/14.6));

	animateAlarmBackStroke('FVD_1_12C');
	animateAlarmBackStroke('FVD_1_13C');
	animateAlarmBackStroke('FVD_1_6C');
	animateAlarmBackStroke('FVD_1_2C');
	animateAlarmBackStroke('FVD_1_3C');
	animateAlarmBackStroke('FVD_1_5C');
	animateAlarmBackStroke('FVD_1_4C');
	animateAlarmBackStroke('FVD_5_28C');
	animateAlarmBackStroke('FVD_5_29C');
	animateAlarmBackStroke('FVD_5_20C');
	animateAlarmBackStroke('FVD_5_30C');
	animateAlarmBackStroke('FVD_5_23C');
	animateAlarmBackStroke('FVD_5_22C');
	animateAlarmBackStroke('FVD_5_21C');
	animateAlarmBackStroke('FVD_6_27C');
	animateAlarmBackStroke('FVD_6_28C');
	animateAlarmBackStroke('FVD_6_29C');
	animateAlarmBackStroke('FVD_6_30C');

	animateAlarmBackStroke('TVD_1_12C');
	animateAlarmBackStroke('TVD_1_13C');
	animateAlarmBackStroke('TVD_1_6C');
	animateAlarmBackStroke('TVD_1_2C');
	animateAlarmBackStroke('TVD_1_3C');
	animateAlarmBackStroke('TVD_1_5C');
	animateAlarmBackStroke('TVD_1_4C');
	animateAlarmBackStroke('TVD_5_28C');
	animateAlarmBackStroke('TVD_5_29C');
	animateAlarmBackStroke('TVD_5_20C');
	animateAlarmBackStroke('TVD_5_30C');
	animateAlarmBackStroke('TVD_5_23C');
	animateAlarmBackStroke('TVD_5_22C');
	animateAlarmBackStroke('TVD_5_21C');
	animateAlarmBackStroke('TVD_6_27C');
	animateAlarmBackStroke('TVD_6_28C');
	animateAlarmBackStroke('TVD_6_29C');
	animateAlarmBackStroke('TVD_6_30C');
	animateAlarmBackStroke('TVD_COL_1');
	animateAlarmBackStroke('TVD_COL_5');
	animateAlarmBackStroke('TVD_COL_6');

	animateAlarmFill('TVD_HISTO_1_12C','TVD_1_12C');
	animateAlarmFill('TVD_HISTO_1_13C','TVD_1_13C');
	animateAlarmFill('TVD_HISTO_1_6C','TVD_1_6C');
	animateAlarmFill('TVD_HISTO_1_2C','TVD_1_2C');
	animateAlarmFill('TVD_HISTO_1_3C','TVD_1_3C');
	animateAlarmFill('TVD_HISTO_1_5C','TVD_1_5C');
	animateAlarmFill('TVD_HISTO_1_4C','TVD_1_4C');
	animateAlarmFill('TVD_HISTO_5_28C','TVD_5_28C');
	animateAlarmFill('TVD_HISTO_5_29C','TVD_5_29C');
	animateAlarmFill('TVD_HISTO_5_20C','TVD_5_20C');
	animateAlarmFill('TVD_HISTO_5_30C','TVD_5_30C');
	animateAlarmFill('TVD_HISTO_5_23C','TVD_5_23C');
	animateAlarmFill('TVD_HISTO_5_22C','TVD_5_22C');
	animateAlarmFill('TVD_HISTO_5_21C','TVD_5_21C');
	animateAlarmFill('TVD_HISTO_6_27C','TVD_6_27C');
	animateAlarmFill('TVD_HISTO_6_28C','TVD_6_28C');
	animateAlarmFill('TVD_HISTO_6_29C','TVD_6_29C');
	animateAlarmFill('TVD_HISTO_6_30C','TVD_6_30C');
	animateAlarmFill('TVD_COL_HISTO_1','TVD_COL_1');
	animateAlarmFill('TVD_COL_HISTO_5','TVD_COL_5');
	animateAlarmFill('TVD_COL_HISTO_6','TVD_COL_6');

	animateAlarmFill('FVD_HISTO_1_12C','FVD_1_12C');
	animateAlarmFill('FVD_HISTO_1_13C','FVD_1_13C');
	animateAlarmFill('FVD_HISTO_1_6C','FVD_1_6C');
	animateAlarmFill('FVD_HISTO_1_2C','FVD_1_2C');
	animateAlarmFill('FVD_HISTO_1_3C','FVD_1_3C');
	animateAlarmFill('FVD_HISTO_1_5C','FVD_1_5C');
	animateAlarmFill('FVD_HISTO_1_4C','FVD_1_4C');
	animateAlarmFill('FVD_HISTO_5_28C','FVD_5_28C');
	animateAlarmFill('FVD_HISTO_5_29C','FVD_5_29C');
	animateAlarmFill('FVD_HISTO_5_20C','FVD_5_20C');
	animateAlarmFill('FVD_HISTO_5_30C','FVD_5_30C');
	animateAlarmFill('FVD_HISTO_5_23C','FVD_5_23C');
	animateAlarmFill('FVD_HISTO_5_22C','FVD_5_22C');
	animateAlarmFill('FVD_HISTO_5_21C','FVD_5_21C');
	animateAlarmFill('FVD_HISTO_6_27C','FVD_6_27C');
	animateAlarmFill('FVD_HISTO_6_28C','FVD_6_28C');
	animateAlarmFill('FVD_HISTO_6_29C','FVD_6_29C');
	animateAlarmFill('FVD_HISTO_6_30C','FVD_6_30C');

	animateFridge('2',1,12,4,20);
	animateFridgeVH('1',1,1,13,2,20);
	animateFridgeVH('32',1,4,6,2,20);
	animateFridgeVH('30',6,28,27,2,20);
	animateFridgeVH('29',5,23,20,2,20);
	animateFridge('31_R',5,29,4,20);
	animateFridge('31_L',5,28,4,20);
	animateFridge('28',5,22,4,20);

	animateFridge('2_OVER',1,2,4,20);
	animateFridge('1_OVER',1,3,4,20);
	animateFridge('32_OVER',1,5,4,20);
	animateFridge('31_OVER',5,30,4,20);
	animateFridge('30_OVER',6,29,4,20);
	animateFridge('29_OVER',6,30,4,20);
	animateFridge('28_OVER',5,21,4,20);

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


//////////////////////////////////////////////////////////////////////////////////////////////
// Формат вызова: animateFridge(elementID,pipe)
// Назначение: Анимация состояния холодильника.
// Параметры:
//             elementID 		- идентификатор объекта;
//             commonPipe 		- номер напорного трубопровода;
//             pipe 			- номер сливного трубопровода;
//             alarmDeltaT 		- аварийная уставка по перепаду темиператур;
//             alarmQ 			- аварийная уставка по тепловой нагрузке.
//////////////////////////////////////////////////////////////////////////////////////////////
function animateFridge(elementID,commonPipe,pipe,alarmDeltaT,alarmQ) {
	setText('FVD_'+elementID,getFltTag('FVD_'+commonPipe.format(0,'')+'_'+pipe.format(0,'')+'C').format(2,''));
	setText('TVD_'+elementID,getFltTag('TVD_'+commonPipe.format(0,'')+'_'+pipe.format(0,'')+'C').format(2,''));
	setText('TVD_DELTA_'+elementID,(getFltTag('TVD_'+commonPipe.format(0,'')+'_'+pipe.format(0,'')+'C')-getFltTag('TVD_COL_'+commonPipe.format(0,''))).format(2,''));
	setText('QVD_'+elementID,((getFltTag('TVD_'+commonPipe.format(0,'')+'_'+pipe.format(0,'')+'C')-getFltTag('TVD_COL_'+commonPipe.format(0,'')))*getFltTag('FVD_'+commonPipe.format(0,'')+'_'+pipe.format(0,'')+'C')).format(2,''));
	setStyle('TVD_DELTA_'+elementID+'_BACK','stroke',(getFltTag('TVD_'+commonPipe.format(0,'')+'_'+pipe.format(0,'')+'C')-getFltTag('TVD_COL_'+commonPipe.format(0,'')))>=alarmDeltaT ? 'rgb(255,0,0)' : 'rgb(224,224,224)');
	setStyle('TVD_DELTA_'+elementID+'_BACK','stroke-width',(getFltTag('TVD_'+commonPipe.format(0,'')+'_'+pipe.format(0,'')+'C')-getFltTag('TVD_COL_'+commonPipe.format(0,'')))>=alarmDeltaT ? '4px' : '1px');
	setStyle('QVD_'+elementID+'_BACK','stroke',((getFltTag('TVD_'+commonPipe.format(0,'')+'_'+pipe.format(0,'')+'C')-getFltTag('TVD_COL_'+commonPipe.format(0,'')))*getFltTag('FVD_'+commonPipe.format(0,'')+'_'+pipe.format(0,'')+'C'))>=alarmQ ? 'rgb(255,0,0)' : 'rgb(224,224,224)');
	setStyle('QVD_'+elementID+'_BACK','stroke-width',((getFltTag('TVD_'+commonPipe.format(0,'')+'_'+pipe.format(0,'')+'C')-getFltTag('TVD_COL_'+commonPipe.format(0,'')))*getFltTag('FVD_'+commonPipe.format(0,'')+'_'+pipe.format(0,'')+'C'))>=alarmQ ? '4px' : '1px');
}

//////////////////////////////////////////////////////////////////////////////////////////////
// Формат вызова: animateFridgeVH(elementID,pipe)
// Назначение: Анимация состояния холодильника.
// Параметры:
//             elementID 		- идентификатор объекта;
//             commonPipe 		- номер напорного трубопровода;
//             pipeV 			- номер сливного трубопровода внутреннего холодильника;
//             pipeH 			- номер сливного трубопровода наружного холодильника;
//             alarmDeltaT 		- аварийная уставка по перепаду темиператур;
//             alarmQ 			- аварийная уставка по тепловой нагрузке.
//////////////////////////////////////////////////////////////////////////////////////////////
function animateFridgeVH(elementID,commonPipe,pipeV,pipeH,alarmDeltaT,alarmQ) {
	setText('FVD_'+elementID+'_V',getFltTag('FVD_'+commonPipe.format(0,'')+'_'+pipeV.format(0,'')+'C').format(2,''));
	setText('TVD_'+elementID+'_V',getFltTag('TVD_'+commonPipe.format(0,'')+'_'+pipeV.format(0,'')+'C').format(2,''));
	setText('TVD_DELTA_'+elementID+'_V',(getFltTag('TVD_'+commonPipe.format(0,'')+'_'+pipeV.format(0,'')+'C')-getFltTag('TVD_COL_'+commonPipe.format(0,''))).format(2,''));
	setText('QVD_'+elementID+'_V',((getFltTag('TVD_'+commonPipe.format(0,'')+'_'+pipeV.format(0,'')+'C')-getFltTag('TVD_COL_'+commonPipe.format(0,'')))*getFltTag('FVD_'+commonPipe.format(0,'')+'_'+pipeV.format(0,'')+'C')).format(2,''));
	setStyle('TVD_DELTA_'+elementID+'_V'+'_BACK','stroke',(getFltTag('TVD_'+commonPipe.format(0,'')+'_'+pipeV.format(0,'')+'C')-getFltTag('TVD_COL_'+commonPipe.format(0,'')))>=alarmDeltaT ? 'rgb(255,0,0)' : 'rgb(224,224,224)');
	setStyle('TVD_DELTA_'+elementID+'_V'+'_BACK','stroke-width',(getFltTag('TVD_'+commonPipe.format(0,'')+'_'+pipeV.format(0,'')+'C')-getFltTag('TVD_COL_'+commonPipe.format(0,'')))>=alarmDeltaT ? '4px' : '1px');
	setText('FVD_'+elementID+'_H',getFltTag('FVD_'+commonPipe.format(0,'')+'_'+pipeH.format(0,'')+'C').format(2,''));
	setText('TVD_'+elementID+'_H',getFltTag('TVD_'+commonPipe.format(0,'')+'_'+pipeH.format(0,'')+'C').format(2,''));
	setText('TVD_DELTA_'+elementID+'_H',(getFltTag('TVD_'+commonPipe.format(0,'')+'_'+pipeH.format(0,'')+'C')-getFltTag('TVD_COL_'+commonPipe.format(0,''))).format(2,''));
	setText('QVD_'+elementID+'_H',((getFltTag('TVD_'+commonPipe.format(0,'')+'_'+pipeH.format(0,'')+'C')-getFltTag('TVD_COL_'+commonPipe.format(0,'')))*getFltTag('FVD_'+commonPipe.format(0,'')+'_'+pipeH.format(0,'')+'C')).format(2,''));
	setStyle('TVD_DELTA_'+elementID+'_H'+'_BACK','stroke',(getFltTag('TVD_'+commonPipe.format(0,'')+'_'+pipeH.format(0,'')+'C')-getFltTag('TVD_COL_'+commonPipe.format(0,'')))>=alarmDeltaT ? 'rgb(255,0,0)' : 'rgb(224,224,224)');
	setStyle('TVD_DELTA_'+elementID+'_H'+'_BACK','stroke-width',(getFltTag('TVD_'+commonPipe.format(0,'')+'_'+pipeH.format(0,'')+'C')-getFltTag('TVD_COL_'+commonPipe.format(0,'')))>=alarmDeltaT ? '4px' : '1px');
	setStyle('QVD_'+elementID+'_V'+'_BACK','stroke',(((getFltTag('TVD_'+commonPipe.format(0,'')+'_'+pipeV.format(0,'')+'C')-getFltTag('TVD_COL_'+commonPipe.format(0,'')))*getFltTag('FVD_'+commonPipe.format(0,'')+'_'+pipeV.format(0,'')+'C'))+((getFltTag('TVD_'+commonPipe.format(0,'')+'_'+pipeH.format(0,'')+'C')-getFltTag('TVD_COL_'+commonPipe.format(0,'')))*getFltTag('FVD_'+commonPipe.format(0,'')+'_'+pipeH.format(0,'')+'C')))>=alarmQ ? 'rgb(255,0,0)' : 'rgb(224,224,224)');
	setStyle('QVD_'+elementID+'_V'+'_BACK','stroke-width',(((getFltTag('TVD_'+commonPipe.format(0,'')+'_'+pipeV.format(0,'')+'C')-getFltTag('TVD_COL_'+commonPipe.format(0,'')))*getFltTag('FVD_'+commonPipe.format(0,'')+'_'+pipeV.format(0,'')+'C'))+((getFltTag('TVD_'+commonPipe.format(0,'')+'_'+pipeH.format(0,'')+'C')-getFltTag('TVD_COL_'+commonPipe.format(0,'')))*getFltTag('FVD_'+commonPipe.format(0,'')+'_'+pipeH.format(0,'')+'C')))>=alarmQ ? '4px' : '1px');
	setStyle('QVD_'+elementID+'_H'+'_BACK','stroke',(((getFltTag('TVD_'+commonPipe.format(0,'')+'_'+pipeV.format(0,'')+'C')-getFltTag('TVD_COL_'+commonPipe.format(0,'')))*getFltTag('FVD_'+commonPipe.format(0,'')+'_'+pipeV.format(0,'')+'C'))+((getFltTag('TVD_'+commonPipe.format(0,'')+'_'+pipeH.format(0,'')+'C')-getFltTag('TVD_COL_'+commonPipe.format(0,'')))*getFltTag('FVD_'+commonPipe.format(0,'')+'_'+pipeH.format(0,'')+'C')))>=alarmQ ? 'rgb(255,0,0)' : 'rgb(224,224,224)');
	setStyle('QVD_'+elementID+'_H'+'_BACK','stroke-width',(((getFltTag('TVD_'+commonPipe.format(0,'')+'_'+pipeV.format(0,'')+'C')-getFltTag('TVD_COL_'+commonPipe.format(0,'')))*getFltTag('FVD_'+commonPipe.format(0,'')+'_'+pipeV.format(0,'')+'C'))+((getFltTag('TVD_'+commonPipe.format(0,'')+'_'+pipeH.format(0,'')+'C')-getFltTag('TVD_COL_'+commonPipe.format(0,'')))*getFltTag('FVD_'+commonPipe.format(0,'')+'_'+pipeH.format(0,'')+'C')))>=alarmQ ? '4px' : '1px');
}