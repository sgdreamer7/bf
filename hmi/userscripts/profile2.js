//////////////////////////////////////////////////////////////////////////////////////////////
// Автор: Владимир Щербина <vns.scherbina@gmail.com>
// copyright 2017
// Версия: 1.0.0
// Модуль profile1.js реализует анимацию и логику диалогового взаимодействия для видеокадра profile1.
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

	animateTemperature('TPP_10',false);
	animateTemperature('TSHA_1_5',false);
	animateTemperature('TSHA_1_11',false);
	animateTemperature('TSHA_1_17',false);
	animateTemperature('TSHA_2_5',false);
	animateTemperature('TSHA_2_11',false);
	animateTemperature('TSHA_2_17',false);
	animateTemperature('TSHA_3_5',false);
	animateTemperature('TSHA_3_11',false);
	animateTemperature('TSHA_3_17',false);
	animateTemperature('TSHA_4_5',false);
	animateTemperature('TSHA_4_11',false);
	animateTemperature('TSHA_4_17',false);
	animateTemperature('TSHA_5_5',false);
	animateTemperature('TSHA_5_11',false);
	animateTemperature('TSHA_5_17',false);
	
	animateTemperature('TPP_2',true);
	animateTemperature('TSHA_1_1',true);
	animateTemperature('TSHA_1_7',true);
	animateTemperature('TSHA_1_13',true);
	animateTemperature('TSHA_2_1',true);
	animateTemperature('TSHA_2_7',true);
	animateTemperature('TSHA_2_13',true);
	animateTemperature('TSHA_3_1',true);
	animateTemperature('TSHA_3_7',true);
	animateTemperature('TSHA_3_13',true);
	animateTemperature('TSHA_4_1',true);
	animateTemperature('TSHA_4_7',true);
	animateTemperature('TSHA_4_13',true);
	animateTemperature('TSHA_5_1',true);
	animateTemperature('TSHA_5_7',true);
	animateTemperature('TSHA_5_13',true);

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
	} else if (V>600) {
		return 600;
	}
	return V;
}

//////////////////////////////////////////////////////////////////////////////////////////////
// Формат вызова: animateTemperature(ID,Inverted)
// Назначение: Анимация температуры.
// Параметры:
//             ID 			- идентификатор объекта;
//             Inverted 	- признак обратной гистограммы.
//////////////////////////////////////////////////////////////////////////////////////////////
function animateTemperature(ID,Inverted) {
	setText(ID,getFltTag(ID).format(0,''));
	setAttr(ID+'_HISTO','width',checkLimits(600*getFltTag(ID)/1000));
	if (Inverted==true) {
		setAttr(ID+'_HISTO','x',960+checkLimits(600*(1-getFltTag(ID)/1000))); 
	}
	animateAlarmBackStroke(ID);
	animateAlarmFill(ID+'_HISTO',ID);	
}