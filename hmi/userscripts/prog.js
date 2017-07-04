//////////////////////////////////////////////////////////////////////////////////////////////
// Автор: Владимир Щербина <vns.scherbina@gmail.com>
// copyright 2017
// Версия: 1.0.0
// Модуль prog.js реализует анимацию и логику диалогового взаимодействия для видеокадра prog.
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
	var PPROG_1=Math.round(10000*(getFltTag('PVD_7_6C')));
	var PPROG_2=Math.round(10000*(getFltTag('PVD_7_8C')));
	var PPROG_3=Math.round(10000*(getFltTag('PVD_7_10C')));
	var PPROG_4=Math.round(10000*(getFltTag('PVD_7_12C')));
	var PPROG_5=Math.round(10000*(getFltTag('PVD_8_4C')));
	var PPROG_6=Math.round(10000*(getFltTag('PVD_8_8C')));
	var PPROG_7=Math.round(10000*(getFltTag('PVD_8_12C')));
	var PPROG_8=Math.round(10000*(getFltTag('PVD_8_16C')));
	var PPROG_9=Math.round(10000*(getFltTag('PVD_8_20C')));
	var PPROG_10=Math.round(10000*(getFltTag('PVD_9_4C')));
	var PPROG_11=Math.round(10000*(getFltTag('PVD_9_8C')));
	var PPROG_12=Math.round(10000*(getFltTag('PVD_9_12C')));
	var PPROG_13=Math.round(10000*(getFltTag('PVD_9_16C')));
	var PPROG_14=Math.round(10000*(getFltTag('PVD_9_20C')));
	var PPROG_15=Math.round(10000*(getFltTag('PVD_10_4C')));
	var PPROG_16=Math.round(10000*(getFltTag('PVD_10_8C')));
	var PPROG_17=Math.round(10000*(getFltTag('PVD_10_18C')));
	var PPROG_18=Math.round(10000*(getFltTag('PVD_10_20C')));
	var PPROG_19=Math.round(10000*(getFltTag('PVD_10_22C')));
	var PPROG_20=Math.round(10000*(getFltTag('PVD_7_3C')));
	
	setText('PPROG_1',PPROG_1.format(0,''));
	setText('PPROG_2',PPROG_2.format(0,''));
	setText('PPROG_3',PPROG_3.format(0,''));
	setText('PPROG_4',PPROG_4.format(0,''));
	setText('PPROG_5',PPROG_5.format(0,''));
	setText('PPROG_6',PPROG_6.format(0,''));
	setText('PPROG_7',PPROG_7.format(0,''));
	setText('PPROG_8',PPROG_8.format(0,''));
	setText('PPROG_9',PPROG_9.format(0,''));
	setText('PPROG_10',PPROG_10.format(0,''));
	setText('PPROG_11',PPROG_11.format(0,''));
	setText('PPROG_12',PPROG_12.format(0,''));
	setText('PPROG_13',PPROG_13.format(0,''));
	setText('PPROG_14',PPROG_14.format(0,''));
	setText('PPROG_15',PPROG_15.format(0,''));
	setText('PPROG_16',PPROG_16.format(0,''));
	setText('PPROG_17',PPROG_17.format(0,''));
	setText('PPROG_18',PPROG_18.format(0,''));
	setText('PPROG_19',PPROG_19.format(0,''));
	setText('PPROG_20',PPROG_20.format(0,''));
 	setAttr('PPROG_1_G','height',checkLimits(200*(PPROG_1+125)/250));
 	setAttr('PPROG_1_G','y',154.97693+checkLimits(200*(1-(PPROG_1+125)/250)));
 	setAttr('PPROG_2_G','height',checkLimits(200*(PPROG_2+125)/250));
 	setAttr('PPROG_2_G','y',154.97693+checkLimits(200*(1-(PPROG_2+125)/250)));
 	setAttr('PPROG_3_G','height',checkLimits(200*(PPROG_3+125)/250));
 	setAttr('PPROG_3_G','y',154.97693+checkLimits(200*(1-(PPROG_3+125)/250)));
 	setAttr('PPROG_4_G','height',checkLimits(200*(PPROG_4+125)/250));
 	setAttr('PPROG_4_G','y',154.97693+checkLimits(200*(1-(PPROG_4+125)/250)));
 	setAttr('PPROG_5_G','height',checkLimits(200*(PPROG_5+125)/250));
 	setAttr('PPROG_5_G','y',154.97693+checkLimits(200*(1-(PPROG_5+125)/250)));
 	setAttr('PPROG_6_G','height',checkLimits(200*(PPROG_6+125)/250));
 	setAttr('PPROG_6_G','y',154.97693+checkLimits(200*(1-(PPROG_6+125)/250)));
 	setAttr('PPROG_7_G','height',checkLimits(200*(PPROG_7+125)/250));
 	setAttr('PPROG_7_G','y',154.97693+checkLimits(200*(1-(PPROG_7+125)/250)));
 	setAttr('PPROG_8_G','height',checkLimits(200*(PPROG_8+125)/250));
 	setAttr('PPROG_8_G','y',154.97693+checkLimits(200*(1-(PPROG_8+125)/250)));
 	setAttr('PPROG_9_G','height',checkLimits(200*(PPROG_9+125)/250));
 	setAttr('PPROG_9_G','y',154.97693+checkLimits(200*(1-(PPROG_9+125)/250)));
 	setAttr('PPROG_10_G','height',checkLimits(200*(PPROG_10+125)/250));
 	setAttr('PPROG_10_G','y',154.97693+checkLimits(200*(1-(PPROG_10+125)/250)));
 	setAttr('PPROG_11_G','height',checkLimits(200*(PPROG_11+125)/250));
 	setAttr('PPROG_11_G','y',154.97693+checkLimits(200*(1-(PPROG_11+125)/250)));
 	setAttr('PPROG_12_G','height',checkLimits(200*(PPROG_12+125)/250));
 	setAttr('PPROG_12_G','y',154.97693+checkLimits(200*(1-(PPROG_12+125)/250)));
 	setAttr('PPROG_13_G','height',checkLimits(200*(PPROG_13+125)/250));
 	setAttr('PPROG_13_G','y',154.97693+checkLimits(200*(1-(PPROG_13+125)/250)));
 	setAttr('PPROG_14_G','height',checkLimits(200*(PPROG_14+125)/250));
 	setAttr('PPROG_14_G','y',154.97693+checkLimits(200*(1-(PPROG_14+125)/250)));
 	setAttr('PPROG_15_G','height',checkLimits(200*(PPROG_15+125)/250));
 	setAttr('PPROG_15_G','y',154.97693+checkLimits(200*(1-(PPROG_15+125)/250)));
 	setAttr('PPROG_16_G','height',checkLimits(200*(PPROG_16+125)/250));
 	setAttr('PPROG_16_G','y',154.97693+checkLimits(200*(1-(PPROG_16+125)/250)));
 	setAttr('PPROG_17_G','height',checkLimits(200*(PPROG_17+125)/250));
 	setAttr('PPROG_17_G','y',154.97693+checkLimits(200*(1-(PPROG_17+125)/250)));
 	setAttr('PPROG_18_G','height',checkLimits(200*(PPROG_18+125)/250));
 	setAttr('PPROG_18_G','y',154.97693+checkLimits(200*(1-(PPROG_18+125)/250)));
 	setAttr('PPROG_19_G','height',checkLimits(200*(PPROG_19+125)/250));
 	setAttr('PPROG_19_G','y',154.97693+checkLimits(200*(1-(PPROG_19+125)/250)));
 	setAttr('PPROG_20_G','height',checkLimits(200*(PPROG_20+125)/250));
 	setAttr('PPROG_20_G','y',154.97693+checkLimits(200*(1-(PPROG_20+125)/250)));
	animatePressure('PPROG_1_G',PPROG_1);
	animatePressure('PPROG_2_G',PPROG_2);
	animatePressure('PPROG_3_G',PPROG_3);
	animatePressure('PPROG_4_G',PPROG_4);
	animatePressure('PPROG_5_G',PPROG_5);
	animatePressure('PPROG_6_G',PPROG_6);
	animatePressure('PPROG_7_G',PPROG_7);
	animatePressure('PPROG_8_G',PPROG_8);
	animatePressure('PPROG_9_G',PPROG_9);
	animatePressure('PPROG_10_G',PPROG_10);
	animatePressure('PPROG_11_G',PPROG_11);
	animatePressure('PPROG_12_G',PPROG_12);
	animatePressure('PPROG_13_G',PPROG_13);
	animatePressure('PPROG_14_G',PPROG_14);
	animatePressure('PPROG_15_G',PPROG_15);
	animatePressure('PPROG_16_G',PPROG_16);
	animatePressure('PPROG_17_G',PPROG_17);
	animatePressure('PPROG_18_G',PPROG_18);
	animatePressure('PPROG_19_G',PPROG_19);
	animatePressure('PPROG_20_G',PPROG_20);
	animateAlarmStroke('PPROG_1_BACK','PVD_7_6C');
	animateAlarmStroke('PPROG_2_BACK','PVD_7_8C');
	animateAlarmStroke('PPROG_3_BACK','PVD_7_10C');
	animateAlarmStroke('PPROG_4_BACK','PVD_7_12C');
	animateAlarmStroke('PPROG_5_BACK','PVD_8_4C');
	animateAlarmStroke('PPROG_6_BACK','PVD_8_8C');
	animateAlarmStroke('PPROG_7_BACK','PVD_8_12C');
	animateAlarmStroke('PPROG_8_BACK','PVD_8_16C');
	animateAlarmStroke('PPROG_9_BACK','PVD_8_20C');
	animateAlarmStroke('PPROG_10_BACK','PVD_9_4C');
	animateAlarmStroke('PPROG_11_BACK','PVD_9_8C');
	animateAlarmStroke('PPROG_12_BACK','PVD_9_12C');
	animateAlarmStroke('PPROG_13_BACK','PVD_9_16C');
	animateAlarmStroke('PPROG_14_BACK','PVD_9_20C');
	animateAlarmStroke('PPROG_15_BACK','PVD_10_4C');
	animateAlarmStroke('PPROG_16_BACK','PVD_10_8C');
	animateAlarmStroke('PPROG_17_BACK','PVD_10_18C');
	animateAlarmStroke('PPROG_18_BACK','PVD_10_20C');
	animateAlarmStroke('PPROG_19_BACK','PVD_10_22C');
	animateAlarmStroke('PPROG_20_BACK','PVD_7_3C');
	
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
// Формат вызова: animatePressure(elementID,value)
// Назначение: Анимация значения давления.
// Параметры:
//             elementID 	- идентификатор объекта;
//             value 		- значение давления.
//////////////////////////////////////////////////////////////////////////////////////////////
function animatePressure(elementID,value) {
	if (value<=-20.0) {
		setStyle(elementID,'fill','rgb(0,255,0)');
    } else if (value<-5.0) {
		setStyle(elementID,'fill','rgb(255,255,0)');
	} else {
		setStyle(elementID,'fill','rgb(255,0,0)');
    }
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
