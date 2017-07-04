//////////////////////////////////////////////////////////////////////////////////////////////
// Автор: Владимир Щербина <vns.scherbina@gmail.com>
// copyright 2017
// Версия: 1.0.0
// Модуль charge_modes.js реализует анимацию и логику диалогового взаимодействия для видеокадра charge_modes.
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

	setHighlightButton('UK_MODE1_BUTTON','changeUKMode(1);');
	setHighlightButton('UK_MODE2_BUTTON','changeUKMode(2);');
	setHighlightButton('UK_MODE3_BUTTON','changeUKMode(3);');
	setHighlightButton('SKIP_SKIPMODE1_BUTTON','changeSkipSkipMode(1);');
	setHighlightButton('SKIP_SKIPMODE2_BUTTON','changeSkipSkipMode(2);');
	setHighlightButton('SKIP_SKIPMODE3_BUTTON','changeSkipSkipMode(3);');
	setHighlightButton('SKIP_SKIPMODE4_BUTTON','changeSkipSkipMode(4);');
	setHighlightButton('SKIP_ADDITIONAL0_BUTTON','changeSkipAdditional(0);');
	setHighlightButton('SKIP_ADDITIONAL1_BUTTON','changeSkipAdditional(1);');
	setHighlightButton('SKIP_ADDITIONAL2_BUTTON','changeSkipAdditional(2);');
	setHighlightButton('VR_MODE1_BUTTON','changeVRMode(1);');
	setHighlightButton('VR_MODE2_BUTTON','changeVRMode(2);');
	setHighlightButton('VR_MODE3_BUTTON','changeVRMode(3);');
	
	var i=0;
	for (i=1; i<=5; i++) {
		setHighlightButton('VR_MODE'+i.format(0,'')+'_L_BUTTON','changeVRSideMode('+i.format(0,'')+',\'L\');');
		setHighlightButton('VR_MODE'+i.format(0,'')+'_R_BUTTON','changeVRSideMode('+i.format(0,'')+',\'R\');');
	}

	
	
	
	
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
	setStyle('UK_MODE1_BACK','fill', ((getBoolTag('UK_MODE1')==true) && (getBoolTag('UK_MODE3')==false)) ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setStyle('UK_MODE2_BACK','fill', ((getBoolTag('UK_MODE2')==true) && (getBoolTag('UK_MODE3')==false)) ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setStyle('UK_MODE3_BACK','fill', getBoolTag('UK_MODE3') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setStyle('SKIP_SKIPMODE1_BACK','fill', getBoolTag('SKIP_SKIPMODE1') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setStyle('SKIP_SKIPMODE2_BACK','fill', getBoolTag('SKIP_SKIPMODE2') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setStyle('SKIP_SKIPMODE3_BACK','fill', getBoolTag('SKIP_SKIPMODE3') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setStyle('SKIP_SKIPMODE4_BACK','fill', getBoolTag('SKIP_SKIPMODE4') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setStyle('SKIP_ADDITIONAL0_BACK','fill', ((getBoolTag('SKIP_ADDITIONAL1')==false) && (getBoolTag('SKIP_ADDITIONAL2')==false)) ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setStyle('SKIP_ADDITIONAL1_BACK','fill', getBoolTag('SKIP_ADDITIONAL1') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setStyle('SKIP_ADDITIONAL2_BACK','fill', getBoolTag('SKIP_ADDITIONAL2') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setStyle('VR_MODE1_BACK','fill', getBoolTag('VR_MODE1') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setStyle('VR_MODE2_BACK','fill', getBoolTag('VR_MODE2') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setStyle('VR_MODE3_BACK','fill', getBoolTag('VR_MODE3') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setStyle('VR_MODE1_L_BACK','fill', getBoolTag('VR_MODE1_L') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setStyle('VR_MODE2_L_BACK','fill', getBoolTag('VR_MODE2_L') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setStyle('VR_MODE3_L_BACK','fill', getBoolTag('VR_MODE3_L') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setStyle('VR_MODE4_L_BACK','fill', getBoolTag('VR_MODE4_L') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setStyle('VR_MODE5_L_BACK','fill', getBoolTag('VR_MODE5_L') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setStyle('VR_MODE1_R_BACK','fill', getBoolTag('VR_MODE1_R') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setStyle('VR_MODE2_R_BACK','fill', getBoolTag('VR_MODE2_R') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setStyle('VR_MODE3_R_BACK','fill', getBoolTag('VR_MODE3_R') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setStyle('VR_MODE4_R_BACK','fill', getBoolTag('VR_MODE4_R') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setStyle('VR_MODE5_R_BACK','fill', getBoolTag('VR_MODE5_R') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
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
// Формат вызова: changeUKMode(mode)
// Назначение: Изменение режима работы уравнительных клапанов.
// Параметры:
//             mode - режим.
//////////////////////////////////////////////////////////////////////////////////////////////
function changeUKMode(mode) {
	setBoolTag('UK_MODE1',mode==1);
	setBoolTag('UK_MODE2',mode==2);
	setBoolTag('UK_MODE3',mode==3);
}

//////////////////////////////////////////////////////////////////////////////////////////////
// Формат вызова: changeSkipSkipMode(mode)
// Назначение: Изменение режима перегона скипов.
// Параметры:
//             mode - режим.
//////////////////////////////////////////////////////////////////////////////////////////////
function changeSkipSkipMode(mode) {
	setBoolTag('SKIP_SKIPMODE1',mode==1);
	setBoolTag('SKIP_SKIPMODE2',mode==2);
	setBoolTag('SKIP_SKIPMODE3',mode==3);
	setBoolTag('SKIP_SKIPMODE4',mode==4);
}

//////////////////////////////////////////////////////////////////////////////////////////////
// Формат вызова: changeSkipAdditional(mode)
// Назначение: Изменение режима заказа дополнительного скипа.
// Параметры:
//             mode - режим.
//////////////////////////////////////////////////////////////////////////////////////////////
function changeSkipAdditional(mode) {
	if (mode==1) {
		setBoolTag('SKIP_ADDITIONAL1',true);
	}
	if (mode==2) {
		setBoolTag('SKIP_ADDITIONAL2',true);
	}
	if (mode==0) {
		setBoolTag('SKIP_ADDITIONAL1',false);
		setBoolTag('SKIP_ADDITIONAL2',false);
	}
	
}

//////////////////////////////////////////////////////////////////////////////////////////////
// Формат вызова: changeVRMode(mode)
// Назначение: Изменение режима работы ВРШ.
// Параметры:
//             mode - режим.
//////////////////////////////////////////////////////////////////////////////////////////////
function changeVRMode(mode) {
	setBoolTag('VR_MODE1',mode==1);
	setBoolTag('VR_MODE2',mode==2);
	setBoolTag('VR_MODE3',mode==3);
}

//////////////////////////////////////////////////////////////////////////////////////////////
// Формат вызова: changeVRSideMode(mode,side)
// Назначение: Изменение выбора стороны вращения ВРШ.
// Параметры:
//             mode 	- режим;
//             side 	- сторона.
//////////////////////////////////////////////////////////////////////////////////////////////
function changeVRSideMode(mode,side) {
	var i=0;
	for (i=1; i<=5; i++) {
		setBoolTag('VR_MODE'+i.format(0,'')+'_'+side,i==mode);
	}
}