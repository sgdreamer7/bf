//////////////////////////////////////////////////////////////////////////////////////////////
// Автор: Владимир Щербина <vns.scherbina@gmail.com>
// copyright 2017
// Версия: 1.0.0
// Модуль nassio.js реализует анимацию и логику диалогового взаимодействия для видеокадра nassio.
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
	var FVD_NAP_1=getFltTag('FVD_NAP_1');
	var FVD_NAP_2=getFltTag('FVD_NAP_2');
	var PVD_NAGN_1=getFltTag('PVD_NAGN_1');
	var PVD_NAGN_2=getFltTag('PVD_NAGN_2');
	var PVD_NAGN_3=getFltTag('PVD_NAGN_3');
	var PVD_NAGN_4=getFltTag('PVD_NAGN_4');
	var PVD_VSAS_1=getFltTag('PVD_VSAS_1');
	var PVD_VSAS_2=getFltTag('PVD_VSAS_2');
	var PVD_VSAS_3=getFltTag('PVD_VSAS_3');
	var PVD_VSAS_4=getFltTag('PVD_VSAS_4');
	var QCO_NAS_1=getFltTag('QCO_NAS_1');
	var QCO_NAS_2=getFltTag('QCO_NAS_2');

	setText('FVD_NAP_1',FVD_NAP_1.format(3,''));
	setText('FVD_NAP_2',FVD_NAP_2.format(3,''));
	setText('PVD_NAGN_1',PVD_NAGN_1.format(2,''));
	setText('PVD_NAGN_2',PVD_NAGN_2.format(2,''));
	setText('PVD_NAGN_3',PVD_NAGN_3.format(2,''));
	setText('PVD_NAGN_4',PVD_NAGN_4.format(2,''));
	setText('PVD_VSAS_1',PVD_VSAS_1.format(2,''));
	setText('PVD_VSAS_2',PVD_VSAS_2.format(2,''));
	setText('PVD_VSAS_3',PVD_VSAS_3.format(2,''));
	setText('PVD_VSAS_4',PVD_VSAS_4.format(2,''));
	setText('QCO_NAS_1',QCO_NAS_1.format(3,''));
	setText('QCO_NAS_2',QCO_NAS_2.format(3,''));
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
