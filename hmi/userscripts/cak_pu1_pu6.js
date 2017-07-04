//////////////////////////////////////////////////////////////////////////////////////////////
// Автор: Владимир Щербина <vns.scherbina@gmail.com>
// copyright 2017
// Версия: 1.0.0
// Модуль cak_pu1_pu6.js реализует анимацию и логику диалогового взаимодействия для видеокадра cak_pu1_pu6.
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
	setText('TVD_HORN_V_N_XP_27',getFltTag('TVD_HORN_V_N_XP_27').format(2,''));

	setText('TVD_HORN_N_LESH_V_XP_27',getFltTag('TVD_HORN_N_LESH_V_XP_27').format(2,''));

	setText('TVD_LESH_V_N_XP_27',getFltTag('TVD_LESH_V_N_XP_27').format(2,''));

	setText('FVD_1_27C',getFltTag('FVD_1_27C').format(2,''));
	setText('FVD_1_23C',getFltTag('FVD_1_23C').format(2,''));
	setText('FVD_1_19C',getFltTag('FVD_1_19C').format(2,''));
	setText('FVD_1_16C',getFltTag('FVD_1_16C').format(2,''));
	setText('FVD_6_10C',getFltTag('FVD_6_10C').format(2,''));
	setText('FVD_6_7C',getFltTag('FVD_6_7C').format(2,''));
	setText('FVD_6_4C',getFltTag('FVD_6_4C').format(2,''));
	setText('FVD_6_1C',getFltTag('FVD_6_1C').format(2,''));
	
	setText('TVD_1_27C',getFltTag('TVD_1_27C').format(2,''));
	setText('TVD_1_23C',getFltTag('TVD_1_23C').format(2,''));
	setText('TVD_1_19C',getFltTag('TVD_1_19C').format(2,''));
	setText('TVD_1_16C',getFltTag('TVD_1_16C').format(2,''));
	setText('TVD_6_10C',getFltTag('TVD_6_10C').format(2,''));
	setText('TVD_6_7C',getFltTag('TVD_6_7C').format(2,''));
	setText('TVD_6_4C',getFltTag('TVD_6_4C').format(2,''));
	setText('TVD_6_1C',getFltTag('TVD_6_1C').format(2,''));
	setText('TVD_COL_1',getFltTag('TVD_COL_1').format(2,''));
	setText('TVD_COL_6',getFltTag('TVD_COL_6').format(2,''));
	
	setText('TVD_HORN_V_N_XP_HISTO_VALUE_27',getFltTag('TVD_HORN_V_N_XP_27').format(2,''));

	setText('TVD_HORN_N_LESH_V_XP_HISTO_VALUE_27',getFltTag('TVD_HORN_N_LESH_V_XP_27').format(2,''));

	setText('TVD_LESH_V_N_XP_HISTO_VALUE_27',getFltTag('TVD_LESH_V_N_XP_27').format(2,''));

	setAttr('TVD_HORN_V_N_XP_HISTO_27','width',checkLimits(200*getFltTag('TVD_HORN_V_N_XP_27')/50));

	setAttr('TVD_HORN_N_LESH_V_XP_HISTO_27','width',checkLimits(200*getFltTag('TVD_HORN_N_LESH_V_XP_27')/50));

	setAttr('TVD_LESH_V_N_XP_HISTO_27','width',checkLimits(200*getFltTag('TVD_LESH_V_N_XP_27')/50));

	setText('TVD_HISTO_VALUE_1_27C',getFltTag('TVD_1_27C').format(2,''));
	setText('TVD_HISTO_VALUE_1_23C',getFltTag('TVD_1_23C').format(2,''));
	setText('TVD_HISTO_VALUE_1_19C',getFltTag('TVD_1_19C').format(2,''));
	setText('TVD_HISTO_VALUE_1_16C',getFltTag('TVD_1_16C').format(2,''));
	setText('TVD_HISTO_VALUE_6_10C',getFltTag('TVD_6_10C').format(2,''));
	setText('TVD_HISTO_VALUE_6_7C',getFltTag('TVD_6_7C').format(2,''));
	setText('TVD_HISTO_VALUE_6_4C',getFltTag('TVD_6_4C').format(2,''));
	setText('TVD_HISTO_VALUE_6_1C',getFltTag('TVD_6_1C').format(2,''));
	setText('TVD_COL_HISTO_VALUE_1',getFltTag('TVD_COL_1').format(2,''));
	setText('TVD_COL_HISTO_VALUE_6',getFltTag('TVD_COL_6').format(2,''));

	setAttr('TVD_HISTO_1_27C','width',checkLimits(200*getFltTag('TVD_1_27C')/50));
	setAttr('TVD_HISTO_1_23C','width',checkLimits(200*getFltTag('TVD_1_23C')/50));
	setAttr('TVD_HISTO_1_19C','width',checkLimits(200*getFltTag('TVD_1_19C')/50));
	setAttr('TVD_HISTO_1_16C','width',checkLimits(200*getFltTag('TVD_1_16C')/50));
	setAttr('TVD_HISTO_6_10C','width',checkLimits(200*getFltTag('TVD_6_10C')/50));
	setAttr('TVD_HISTO_6_7C','width',checkLimits(200*getFltTag('TVD_6_7C')/50));
	setAttr('TVD_HISTO_6_4C','width',checkLimits(200*getFltTag('TVD_6_4C')/50));
	setAttr('TVD_HISTO_6_1C','width',checkLimits(200*getFltTag('TVD_6_1C')/50));
	setAttr('TVD_COL_HISTO_1','width',checkLimits(200*getFltTag('TVD_COL_1')/50));
	setAttr('TVD_COL_HISTO_6','width',checkLimits(200*getFltTag('TVD_COL_6')/50));

	setText('FVD_HISTO_VALUE_1_27C',getFltTag('FVD_1_27C').format(2,''));
	setText('FVD_HISTO_VALUE_1_23C',getFltTag('FVD_1_23C').format(2,''));
	setText('FVD_HISTO_VALUE_1_19C',getFltTag('FVD_1_19C').format(2,''));
	setText('FVD_HISTO_VALUE_1_16C',getFltTag('FVD_1_16C').format(2,''));
	setText('FVD_HISTO_VALUE_6_10C',getFltTag('FVD_6_10C').format(2,''));
	setText('FVD_HISTO_VALUE_6_7C',getFltTag('FVD_6_7C').format(2,''));
	setText('FVD_HISTO_VALUE_6_4C',getFltTag('FVD_6_4C').format(2,''));
	setText('FVD_HISTO_VALUE_6_1C',getFltTag('FVD_6_1C').format(2,''));

	setAttr('FVD_HISTO_1_27C','width',checkLimits(200*(getFltTag('FVD_1_27C')-0.4)/14.6));
	setAttr('FVD_HISTO_1_23C','width',checkLimits(200*(getFltTag('FVD_1_23C')-0.4)/14.6));
	setAttr('FVD_HISTO_1_19C','width',checkLimits(200*(getFltTag('FVD_1_19C')-0.4)/14.6));
	setAttr('FVD_HISTO_1_16C','width',checkLimits(200*(getFltTag('FVD_1_16C')-0.4)/14.6));
	setAttr('FVD_HISTO_6_10C','width',checkLimits(200*(getFltTag('FVD_6_10C')-0.4)/14.6));
	setAttr('FVD_HISTO_6_7C','width',checkLimits(200*(getFltTag('FVD_6_7C')-0.4)/14.6));
	setAttr('FVD_HISTO_6_4C','width',checkLimits(200*(getFltTag('FVD_6_4C')-0.4)/14.6));
	setAttr('FVD_HISTO_6_1C','width',checkLimits(200*(getFltTag('FVD_6_1C')-0.4)/14.6));

	animateAlarmBackStroke('TVD_HORN_V_N_XP_27');

	animateAlarmBackStroke('TVD_HORN_N_LESH_V_XP_27');

	animateAlarmBackStroke('TVD_LESH_V_N_XP_27');

	animateAlarmBackStroke('FVD_1_27C');
	animateAlarmBackStroke('FVD_1_23C');
	animateAlarmBackStroke('FVD_1_19C');
	animateAlarmBackStroke('FVD_1_16C');
	animateAlarmBackStroke('FVD_6_10C');
	animateAlarmBackStroke('FVD_6_7C');
	animateAlarmBackStroke('FVD_6_4C');
	animateAlarmBackStroke('FVD_6_1C');
	
	animateAlarmBackStroke('TVD_1_27C');
	animateAlarmBackStroke('TVD_1_23C');
	animateAlarmBackStroke('TVD_1_19C');
	animateAlarmBackStroke('TVD_1_16C');
	animateAlarmBackStroke('TVD_6_10C');
	animateAlarmBackStroke('TVD_6_7C');
	animateAlarmBackStroke('TVD_6_4C');
	animateAlarmBackStroke('TVD_6_1C');
	animateAlarmBackStroke('TVD_COL_1');
	animateAlarmBackStroke('TVD_COL_6');

	animateAlarmFill('TVD_HORN_V_N_XP_HISTO_27','TVD_HORN_V_N_XP_27');

	animateAlarmFill('TVD_HORN_N_LESH_V_XP_HISTO_27','TVD_HORN_N_LESH_V_XP_27');

	animateAlarmFill('TVD_LESH_V_N_XP_HISTO_27','TVD_LESH_V_N_XP_27');

	animateAlarmFill('TVD_HISTO_1_27C','TVD_1_27C');
	animateAlarmFill('TVD_HISTO_1_23C','TVD_1_23C');
	animateAlarmFill('TVD_HISTO_1_19C','TVD_1_19C');
	animateAlarmFill('TVD_HISTO_1_16C','TVD_1_16C');
	animateAlarmFill('TVD_HISTO_6_10C','TVD_6_10C');
	animateAlarmFill('TVD_HISTO_6_7C','TVD_6_7C');
	animateAlarmFill('TVD_HISTO_6_4C','TVD_6_4C');
	animateAlarmFill('TVD_HISTO_6_1C','TVD_6_1C');
	animateAlarmFill('TVD_COL_HISTO_1','TVD_COL_1');
	animateAlarmFill('TVD_COL_HISTO_6','TVD_COL_6');

	animateAlarmFill('FVD_HISTO_1_27C','FVD_1_27C');
	animateAlarmFill('FVD_HISTO_1_23C','FVD_1_23C');
	animateAlarmFill('FVD_HISTO_1_19C','FVD_1_19C');
	animateAlarmFill('FVD_HISTO_1_16C','FVD_1_16C');
	animateAlarmFill('FVD_HISTO_6_10C','FVD_6_10C');
	animateAlarmFill('FVD_HISTO_6_7C','FVD_6_7C');
	animateAlarmFill('FVD_HISTO_6_4C','FVD_6_4C');
	animateAlarmFill('FVD_HISTO_6_1C','FVD_6_1C');

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
