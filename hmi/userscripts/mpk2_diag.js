//////////////////////////////////////////////////////////////////////////////////////////////
// Автор: Владимир Щербина <vns.scherbina@gmail.com>
// copyright 2017
// Версия: 1.0.0
// Модуль mpk2_diag.js реализует анимацию и логику диалогового взаимодействия для видеокадра mpk2_diag.
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

	setStyle('OUTPUT1','fill',getBoolTag('QUANTUM_DDO_VALUE_97') ? 'rgb(0,255,0)' : 'rgb(255,0,0)');
	setStyle('OUTPUT2','fill',getBoolTag('QUANTUM_DDO_VALUE_98') ? 'rgb(0,255,0)' : 'rgb(255,0,0)');
	setStyle('OUTPUT3','fill',getBoolTag('QUANTUM_DDO_VALUE_99') ? 'rgb(0,255,0)' : 'rgb(255,0,0)');
	setStyle('OUTPUT4','fill',getBoolTag('QUANTUM_DDO_VALUE_100') ? 'rgb(0,255,0)' : 'rgb(255,0,0)');
	setStyle('OUTPUT5','fill',getBoolTag('QUANTUM_DDO_VALUE_101') ? 'rgb(0,255,0)' : 'rgb(255,0,0)');
	setStyle('OUTPUT6','fill',getBoolTag('QUANTUM_DDO_VALUE_102') ? 'rgb(0,255,0)' : 'rgb(255,0,0)');
	setStyle('OUTPUT7','fill',getBoolTag('QUANTUM_DDO_VALUE_103') ? 'rgb(0,255,0)' : 'rgb(255,0,0)');
	setStyle('OUTPUT8','fill',getBoolTag('QUANTUM_DDO_VALUE_104') ? 'rgb(0,255,0)' : 'rgb(255,0,0)');
	setStyle('OUTPUT9','fill',getBoolTag('QUANTUM_DDO_VALUE_105') ? 'rgb(0,255,0)' : 'rgb(255,0,0)');
	setStyle('OUTPUT10','fill',getBoolTag('QUANTUM_DDO_VALUE_106') ? 'rgb(0,255,0)' : 'rgb(255,0,0)');
	setStyle('OUTPUT11','fill',getBoolTag('QUANTUM_DDO_VALUE_107') ? 'rgb(0,255,0)' : 'rgb(255,0,0)');
	setStyle('OUTPUT12','fill',getBoolTag('QUANTUM_DDO_VALUE_108') ? 'rgb(0,255,0)' : 'rgb(255,0,0)');
	setStyle('OUTPUT13','fill',getBoolTag('QUANTUM_DDO_VALUE_109') ? 'rgb(0,255,0)' : 'rgb(255,0,0)');
	setStyle('OUTPUT14','fill',getBoolTag('QUANTUM_DDO_VALUE_110') ? 'rgb(0,255,0)' : 'rgb(255,0,0)');
	setStyle('OUTPUT15','fill',getBoolTag('QUANTUM_DDO_VALUE_111') ? 'rgb(0,255,0)' : 'rgb(255,0,0)');
	setStyle('OUTPUT16','fill',getBoolTag('QUANTUM_DDO_VALUE_112') ? 'rgb(0,255,0)' : 'rgb(255,0,0)');
	setStyle('OUTPUT17','fill',getBoolTag('QUANTUM_DDO_VALUE_113') ? 'rgb(0,255,0)' : 'rgb(255,0,0)');
	setStyle('OUTPUT18','fill',getBoolTag('QUANTUM_DDO_VALUE_114') ? 'rgb(0,255,0)' : 'rgb(255,0,0)');
	setStyle('OUTPUT19','fill',getBoolTag('QUANTUM_DDO_VALUE_115') ? 'rgb(0,255,0)' : 'rgb(255,0,0)');
	setStyle('OUTPUT20','fill',getBoolTag('QUANTUM_DDO_VALUE_116') ? 'rgb(0,255,0)' : 'rgb(255,0,0)');
	setStyle('OUTPUT21','fill',getBoolTag('QUANTUM_DDO_VALUE_117') ? 'rgb(0,255,0)' : 'rgb(255,0,0)');
	setStyle('OUTPUT22','fill',getBoolTag('QUANTUM_DDO_VALUE_118') ? 'rgb(0,255,0)' : 'rgb(255,0,0)');
	setStyle('OUTPUT23','fill',getBoolTag('QUANTUM_DDO_VALUE_119') ? 'rgb(0,255,0)' : 'rgb(255,0,0)');
	setStyle('OUTPUT24','fill',getBoolTag('QUANTUM_DDO_VALUE_120') ? 'rgb(0,255,0)' : 'rgb(255,0,0)');
	setStyle('OUTPUT25','fill',getBoolTag('QUANTUM_DDO_VALUE_121') ? 'rgb(0,255,0)' : 'rgb(255,0,0)');
	setStyle('OUTPUT26','fill',getBoolTag('QUANTUM_DDO_VALUE_122') ? 'rgb(0,255,0)' : 'rgb(255,0,0)');
	setStyle('OUTPUT27','fill',getBoolTag('QUANTUM_DDO_VALUE_123') ? 'rgb(0,255,0)' : 'rgb(255,0,0)');
	setStyle('OUTPUT28','fill',getBoolTag('QUANTUM_DDO_VALUE_124') ? 'rgb(0,255,0)' : 'rgb(255,0,0)');
	setStyle('OUTPUT29','fill',getBoolTag('QUANTUM_DDO_VALUE_125') ? 'rgb(0,255,0)' : 'rgb(255,0,0)');
	setStyle('OUTPUT30','fill',getBoolTag('QUANTUM_DDO_VALUE_126') ? 'rgb(0,255,0)' : 'rgb(255,0,0)');
	setStyle('OUTPUT31','fill',getBoolTag('QUANTUM_DDO_VALUE_127') ? 'rgb(0,255,0)' : 'rgb(255,0,0)');
	setStyle('OUTPUT32','fill',getBoolTag('QUANTUM_DDO_VALUE_128') ? 'rgb(0,255,0)' : 'rgb(255,0,0)');
	
	setText('MPK2_COUNTER',getFltTag('MPK2_COUNTER').format(3,''));
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