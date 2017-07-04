//////////////////////////////////////////////////////////////////////////////////////////////
// Автор: Владимир Щербина <vns.scherbina@gmail.com>
// copyright 2017
// Версия: 1.0.0
// Модуль gss.js реализует анимацию и логику диалогового взаимодействия для видеокадра gss.
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
	
	setImmediateButton('PSG_MAN_MIN_BUTTON','setBoolTag(\'PSG_MAN_MIN\',true);','setBoolTag(\'PSG_MAN_MIN\',false);');
	setImmediateButton('PSG_MAN_MAX_BUTTON','setBoolTag(\'PSG_MAN_MAX\',true);','setBoolTag(\'PSG_MAN_MAX\',false);');
	setImmediateButton('FPG_GSS_MAN_MIN_BUTTON','setBoolTag(\'FPG_GSS_MAN_MIN\',true);','setBoolTag(\'FPG_GSS_MAN_MIN\',false);');
	setImmediateButton('FPG_GSS_MAN_MAX_BUTTON','setBoolTag(\'FPG_GSS_MAN_MAX\',true);','setBoolTag(\'FPG_GSS_MAN_MAX\',false);');
	setHighlightButton('DG_BUTTON','showTrendByID(\'GSS_TRENDS\');');
	setHighlightButton('PG_BUTTON','showTrendByID(\'GSS_TRENDS\');');
	setHighlightButton('SG_BUTTON','showTrendByID(\'GSS_TRENDS\');');
	setHighlightButton('ZDN_FPG_GSS_BUTTON','changeRefValue(\'ZDN_FPG_GSS\',0,1000,\'Задание расхода природного газа на ГСС\');');
	setHighlightButton('ZDN_PSG_BUTTON','changeRefValue(\'ZDN_PSG\',300,1000,\'Задание давления смешанного газа на ГСС\');');
	setHighlightButton('ZDN_PG_DG_BUTTON','changeRefValue(\'ZDN_PG_DG\',0.0,1.0,\'Задание коэффициента соотношения ПГ/ДГ на ГСС\');');
	setHighlightButton('PSG_REGR_BUTTON','clickModeButton(\'PSG\',\'давлением смешанного газа для ГСС\');');
	setHighlightButton('FPG_GSS_REGR_BUTTON','clickModeButton2(1);');
	setHighlightButton('FPG_GSS_REGR_2_BUTTON','clickModeButton2(2);');
	setHighlightButton('FPG_GSS_REGR_3_BUTTON','clickModeButton2(0);');

	
	
	
	
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
	setText('FDG_GSS',getFltTag('FDG_GSS').format(0,''));
	setText('PDG_GSS',(10000*getFltTag('PDG_GSS')).format(2,''));
	setText('TDG_GSS',getFltTag('TDG_GSS').format(0,''));
	setText('ZDN_FPG_GSS',getFltTag('ZDN_FPG_GSS').format(0,''));
	setText('FPG_GSS',getFltTag('FPG_GSS').format(0,''));
	setText('PPG_GSS',(10000*getFltTag('PPG_GSS')).format(2,''));
	setText('TPG_GSS',getFltTag('TPG_GSS').format(0,''));
	setText('ZDN_PSG',getFltTag('ZDN_PSG').format(2,''));
	setText('PSG',getFltTag('PSG').format(2,''));	
	setText('GDG_GSS',getFltTag('GDG_GSS').format(0,''));			
	setText('ZDN_PG_DG',getFltTag('ZDN_PG_DG').format(5,''));			
	setText('GPG_GSS',getFltTag('GPG_GSS').format(0,''));
	setStyle('PSG_AUTO_BACK','fill',getBoolTag('PSG_AUTO') ? 'rgb(0,255,0)' : 'rgb(127,127,127)');
	setStyle('PSG_MAN_BACK','fill',getBoolTag('PSG_MAN') ? 'rgb(0,255,0)' : 'rgb(127,127,127)');
	setText('PSG_REGR',getBoolTag('PSG_REGR') ? 'А' : 'Д' );
	setStyle('FPG_GSS_REGR_BACK','fill',getBoolTag('FPG_GSS_REGR') ? 'rgb(0,255,0)' : 'rgb(127,127,127)');
	setStyle('FPG_GSS_REGR_2_BACK','fill',getBoolTag('FPG_GSS_REGR_2') ? 'rgb(0,255,0)' : 'rgb(127,127,127)');
	setStyle('FPG_GSS_REGR_3_BACK','fill',((getBoolTag('FPG_GSS_REGR')==0) && (getBoolTag('FPG_GSS_REGR_2')==0)) ? 'rgb(0,255,0)' : 'rgb(127,127,127)');

	animateButton('PSG_MAN_MIN',getBoolTag('PSG_MAN_MIN'));
	animateButton('PSG_MAN_MAX',getBoolTag('PSG_MAN_MAX'));
	animateButton('FPG_GSS_MAN_MIN',getBoolTag('FPG_GSS_MAN_MIN'));
	animateButton('FPG_GSS_MAN_MAX',getBoolTag('FPG_GSS_MAN_MAX'));
	
	animateAlarmBackStroke('FDG_GSS');
	animateAlarmBackStroke('PDG_GSS');
	animateAlarmBackStroke('TDG_GSS');
	animateAlarmBackStroke('FPG_GSS');
	animateAlarmBackStroke('PPG_GSS');
	animateAlarmBackStroke('TPG_GSS');
	animateAlarmBackStroke('PSG');
	animateAlarmBackStroke('GDG_GSS');
	animateAlarmBackStroke('GPG_GSS');
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
// Формат вызова:clickModeButton(id,what)
// Назначение: Нажатие кнопки изменения режима управления.
// Параметры:
//             id 	- регулируемый параметр;
//             what - текстовое описание регулируемого параметра.
//////////////////////////////////////////////////////////////////////////////////////////////
function clickModeButton(id,what) {
	var REGR=getBoolTag(id+'_REGR');
	if (REGR==true) {
		if (confirm('Вы уверены, что хотите перевести в дистанционный режим управления '+what+'?')==true) {
			setBoolTag(id+'_REGR',false);
		}
	} else {
		if (confirm('Вы уверены, что хотите перевести в автоматический режим управления '+what+'?')==true) {
			setBoolTag(id+'_REGR',true);
		}
	}
}

//////////////////////////////////////////////////////////////////////////////////////////////
// Формат вызова:clickModeButton2(mode)
// Назначение: Нажатие кнопки изменения режима управления.
// Параметры:
//             mode - режим.
//////////////////////////////////////////////////////////////////////////////////////////////
function clickModeButton2(mode) {
	if (mode==0) {
		if (confirm('Вы уверены, что хотите перевести в дистанционный режим управления природным газом для ГСС?')==true) {
			setBoolTag('FPG_GSS_REGR',false);
			setBoolTag('FPG_GSS_REGR_2',false);
		}
	} else if (mode==1) {
		if (confirm('Вы уверены, что хотите перевести в автоматический режим управления соотношения ПГ/ДГ для ГСС?')==true) {
			setBoolTag('FPG_GSS_REGR',true);
			setBoolTag('FPG_GSS_REGR_2',false);
		}
	} else if (mode==2) {
		if (confirm('Вы уверены, что хотите перевести в автоматический режим управления расхода природного газа для ГСС?')==true) {
			setBoolTag('FPG_GSS_REGR',false);
			setBoolTag('FPG_GSS_REGR_2',true);
		}
	}
}