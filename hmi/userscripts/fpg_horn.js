//////////////////////////////////////////////////////////////////////////////////////////////
// Автор: Владимир Щербина <vns.scherbina@gmail.com>
// copyright 2017
// Версия: 1.0.0
// Модуль fpg_horn.js реализует анимацию и логику диалогового взаимодействия для видеокадра fpg_horn.
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
	var i;

	rt=Runtime.getRuntime();	

	addKeyAction(function() { exitApp(); },KeyEvent.VK_Q,KeyEvent.CTRL_MASK);
	init_basic_buttons_menu();
	setButton('EXIT_BUTTON','exit_click();');
	addKeyAction(exit_click,KeyEvent.VK_ESCAPE,0);
	
	for (i=1; i<=20; i++) {
		setImmediateButton('FPG_'+i.format(0,'')+'_MIN','clickMinButton('+i.format(0,'')+',true);','clickMinButton('+i.format(0,'')+',false);');
		setImmediateButton('FPG_'+i.format(0,'')+'_MAX','clickMaxButton('+i.format(0,'')+',true);','clickMaxButton('+i.format(0,'')+',false);');
		setHighlightButton('FURM_'+i.format(0,'')+'_STATE_BUTTON','changeFurmState('+i.format(0,'')+');');
	}
	setHighlightButton('PG_HD_TRENDS_BUTTON','showTrendByID(\'PG_HD_TRENDS\');');

	
	
	
	
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
	var i;

	var FPG_HD=getFltTag('FPG_HD');
	var PPG_HD=getFltTag('PPG_HD');
	var TPG_HD=getFltTag('TPG_HD');
	

	setText('FPG_HD',FPG_HD.format(0,''));
	setText('PPG_HD',PPG_HD.format(2,''));
	setText('TPG_HD',TPG_HD.format(0,''));
	animateAlarmBackStroke('FPG_HD');
	animateAlarmBackStroke('PPG_HD');
	animateAlarmBackStroke('TPG_HD');
	for (i=1; i<=20; i++) {
		setText('FPG_'+i.format(0,''),getFltTag('FPG_'+i.format(0,'')).format(0,''));
 		setAttr('FPG_'+i.format(0,'')+'_G','height',checkLimits(300*getFltTag('FPG_'+i.format(0,''))/1250));
 		setAttr('FPG_'+i.format(0,'')+'_G','width','5px');
		animateButton('FPG_'+i.format(0,'')+'_MIN',getBoolTag('FPG_'+i.format(0,'')+'_MIN'));
		animateButton('FPG_'+i.format(0,'')+'_MAX',getBoolTag('FPG_'+i.format(0,'')+'_MAX'));
		setText('GPG_'+i.format(0,''),getFltTag('GPG_'+i.format(0,'')).format(0,''));
		setStyle('FURM_'+i.format(0,'')+'_STATE','fill',getBoolTag('FURM_'+i.format(0,'')+'_STATE') ? 'rgb(255,255,0)' : 'rgb(128,128,128)');
		animateAlarmBackStroke('FPG_'+i.format(0,''));
		animateAlarmBackStroke('GPG_'+i.format(0,''));
	}
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
// Формат вызова: clickMinButton(pos,state)
// Назначение: Нажатие кнопки уменьшения расхода природного газа на фурму.
// Параметры:
//             pos 		- номер фурмы;
//             state 	- команда.
//////////////////////////////////////////////////////////////////////////////////////////////
function clickMinButton(pos,state) {
	setBoolTag('FPG_'+pos.format(0,'')+'_MIN',state);
}

//////////////////////////////////////////////////////////////////////////////////////////////
// Формат вызова: clickMaxButton(pos,state)
// Назначение: Нажатие кнопки увеличения расхода природного газа на фурму.
// Параметры:
//             pos 	- номер фурмы;
//             state 	- команда.
//////////////////////////////////////////////////////////////////////////////////////////////
function clickMaxButton(pos,state) {
	setBoolTag('FPG_'+pos.format(0,'')+'_MAX',state);
}

//////////////////////////////////////////////////////////////////////////////////////////////
// Формат вызова: changeFurmState(pos)
// Назначение: Нажатие кнопки изменения состояния фурмы.
// Параметры:
//             pos 	- номер фурмы.
//////////////////////////////////////////////////////////////////////////////////////////////
function changeFurmState(pos) {
	var furmState=getBoolTag('FURM_'+pos.format(0,'')+'_STATE');
	if (furmState==true) {
		if (confirm('Вы уверены что хотите установить признак \'не работает\' для фурмы №'+pos.format(0,'')+'?')==true) {
			setBoolTag('FURM_'+pos.format(0,'')+'_STATE',false);
		}
	} else {
		if (confirm('Вы уверены что хотите установить признак \'работает\' для фурмы №'+pos.format(0,'')+'?')==true) {
			setBoolTag('FURM_'+pos.format(0,'')+'_STATE',true);
		}
	}
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
	} else if (V>300) {
		return 300;
	}
	return V;
}
