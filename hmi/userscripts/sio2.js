//////////////////////////////////////////////////////////////////////////////////////////////
// Автор: Владимир Щербина <vns.scherbina@gmail.com>
// copyright 2017
// Версия: 1.0.0
// Модуль sio2.js реализует анимацию и логику диалогового взаимодействия для видеокадра sio2.
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
	
	setHighlightButton('ZDN_LVD_G','changeRefValue(\'ZDN_LVD_2\',-150,150,\'Задание уровня в барабане-сепараторе СИО печи №2\');');
	setHighlightButton('NASSIO_BUTTON','nassio_click();');
	setImmediateButton('LVD_MAN_MIN_BUTTON','setBoolTag(\'LVD_2_MAN_MIN\',true);','setBoolTag(\'LVD_2_MAN_MIN\',false);');
	setImmediateButton('LVD_MAN_MAX_BUTTON','setBoolTag(\'LVD_2_MAN_MAX\',true);','setBoolTag(\'LVD_2_MAN_MAX\',false);');
	setHighlightButton('PR_TRENDS_BUTTON','showTrendByID(\'SIO_2_TRENDS\');');
	setHighlightButton('VD_TRENDS_1_BUTTON','showTrendByID(\'SIO_2_TRENDS\');');
	setHighlightButton('VD_TRENDS_2_BUTTON','showTrendByID(\'SIO_2_TRENDS\');');
	setHighlightButton('LVD_REGR_BUTTON','clickModeButton(\'LVD_2\',\'уровнем в барабане-сепараторе СИО печи №2\');');

	
	
	
	
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
	var GVDPIT=getFltTag('GVDPIT_2');
	var FVD_PIT_1=getFltTag('FVD_PIT_1');
	var FVD_PIT_2=getFltTag('FVD_PIT_2');
	var PVD_PIT_1=getFltTag('PVD_PIT_1');
	var PVD_PIT_2=getFltTag('PVD_PIT_2');
	var LVD_1=getFltTag('LVD_1_2');
	var LVD_2=getFltTag('LVD_2_2');
	var PPR=getFltTag('PPR_2');
	var FPR_SIO=getFltTag('FPR_SIO_2');
	var PPR_SIO=getFltTag('PPR_SIO_2');
	var TPR_SIO=getFltTag('TPR_SIO_2');
	var FVD_1=getFltTag('FVD_2_1');
	var FVD_2=getFltTag('FVD_2_2');
	var FVD_3=getFltTag('FVD_2_3');
	var FVD_4=getFltTag('FVD_2_4');
	var PVD_1=getFltTag('PVD_2_1');
	var PVD_2=getFltTag('PVD_2_2');
	var PVD_3=getFltTag('PVD_2_3');
	var PVD_4=getFltTag('PVD_2_4');
	var TVD_1=getFltTag('TVD_2_1');
	var TVD_2=getFltTag('TVD_2_2');
	var TVD_3=getFltTag('TVD_2_3');
	var TVD_4=getFltTag('TVD_2_4');
	var PVD_NAGN_1=getFltTag('PVD_NAGN_1');
	var PVD_NAGN_2=getFltTag('PVD_NAGN_2');
	var PVD_NAGN_3=getFltTag('PVD_NAGN_3');
	var PVD_NAGN_4=getFltTag('PVD_NAGN_4');
	var PVD_VSAS_1=getFltTag('PVD_VSAS_1');
	var PVD_VSAS_2=getFltTag('PVD_VSAS_2');
	var PVD_VSAS_3=getFltTag('PVD_VSAS_3');
	var PVD_VSAS_4=getFltTag('PVD_VSAS_4');
	var PPR_1=getFltTag('PPR_2_1');
	var PPR_2=getFltTag('PPR_2_2');
	var PPR_3=getFltTag('PPR_2_3');
	var PPR_4=getFltTag('PPR_2_4');
	var TPR_1=getFltTag('TPR_2_1');
	var TPR_2=getFltTag('TPR_2_2');
	var TPR_3=getFltTag('TPR_2_3');
	var TPR_4=getFltTag('TPR_2_4');
	var PPR_0_1=getFltTag('PPR_1');
	var PPR_0_2=getFltTag('PPR_2');
	var QCO=getFltTag('QCO_2');
	var QCO_NAS_1=getFltTag('QCO_NAS_1');
	var QCO_NAS_2=getFltTag('QCO_NAS_2');
	var ZDN_LVD=getFltTag('ZDN_LVD_2');

	setText('LVD_REGR',getBoolTag('LVD_2_REGR') ? 'А' : 'Д' );
	setText('GVDPIT',GVDPIT.format(0,''));
	setText('FVD_PIT_1',FVD_PIT_1.format(2,''));
	setText('PVD_PIT_1',PVD_PIT_1.format(1,''));
	setText('FVD_PIT_2',FVD_PIT_2.format(2,''));
	setText('PVD_PIT_2',PVD_PIT_2.format(1,''));
	setText('LVD_1',LVD_1.format(0,''));
	setText('LVD_2',LVD_2.format(0,''));
 	setAttr('LVD_1_G','height',checkLimits(240*(LVD_1+315)/630));
 	setAttr('LVD_1_G','y',230+checkLimits(240*(1-(LVD_1+315)/630)));
 	setAttr('LVD_2_G','height',checkLimits(240*(LVD_2+315)/630));
 	setAttr('LVD_2_G','y',230+checkLimits(240*(1-(LVD_2+315)/630)));
	setText('PPR',PPR.format(2,''));
	setText('FPR_SIO',FPR_SIO.format(2,''));
	setText('PPR_SIO',PPR_SIO.format(2,''));
	setText('TPR_SIO',TPR_SIO.format(0,''));
	setText('FVD_1',FVD_1.format(1,''));
	setText('PVD_1',PVD_1.format(2,''));
	setText('TVD_1',TVD_1.format(0,''));
	setText('FVD_2',FVD_2.format(1,''));
	setText('PVD_2',PVD_2.format(2,''));
	setText('TVD_2',TVD_2.format(0,''));
	setText('FVD_3',FVD_3.format(1,''));
	setText('PVD_3',PVD_3.format(2,''));
	setText('TVD_3',TVD_3.format(0,''));
	setText('FVD_4',FVD_4.format(1,''));
	setText('PVD_4',PVD_4.format(2,''));
	setText('TVD_4',TVD_4.format(0,''));
	setText('PVD_NAGN_1',PVD_NAGN_1.format(2,''));
	setText('PVD_NAGN_2',PVD_NAGN_2.format(2,''));
	setText('PVD_NAGN_3',PVD_NAGN_3.format(2,''));
	setText('PVD_NAGN_4',PVD_NAGN_4.format(2,''));
	setText('PVD_VSAS_1',PVD_VSAS_1.format(2,''));
	setText('PVD_VSAS_2',PVD_VSAS_2.format(2,''));
	setText('PVD_VSAS_3',PVD_VSAS_3.format(2,''));
	setText('PVD_VSAS_4',PVD_VSAS_4.format(2,''));
	setText('PPR_1',PPR_1.format(2,''));
	setText('PPR_2',PPR_2.format(2,''));
	setText('PPR_3',PPR_3.format(2,''));
	setText('PPR_4',PPR_4.format(2,''));
	setText('TPR_1',TPR_1.format(0,''));
	setText('TPR_2',TPR_2.format(0,''));
	setText('TPR_3',TPR_3.format(0,''));
	setText('TPR_4',TPR_4.format(0,''));
	setText('PPR_0_1',PPR_0_1.format(2,''));
	setText('PPR_0_2',PPR_0_2.format(2,''));
	setText('QCO',QCO.format(3,''));
	setText('QCO_NAS_1',QCO_NAS_1.format(3,''));
	setText('QCO_NAS_2',QCO_NAS_2.format(3,''));
	setVisibility('LVD_PIT_MIDDLE',true);
	setVisibility('LVD_PIT_OPENED',false);
	setVisibility('LVD_PIT_CLOSED',false);
	setVisibility('LVD_FLUSH_MIDDLE',true);
	setVisibility('LVD_FLUSH_OPENED',false);
	setVisibility('LVD_FLUSH_CLOSED',false);
	setText('ZDN_LVD',ZDN_LVD.format(0,''));
	animateButton('LVD_MAN_MIN',getBoolTag('LVD_2_MAN_MIN'));
	animateButton('LVD_MAN_MAX',getBoolTag('LVD_2_MAN_MAX'));

	animateAlarmStroke('GVDPIT_BACK','GVDPIT_2');
	animateAlarmStroke('FVD_PIT_1_BACK','FVD_PIT_1');
	animateAlarmStroke('PVD_PIT_1_BACK','PVD_PIT_1');
	animateAlarmStroke('FVD_PIT_2_BACK','FVD_PIT_2');
	animateAlarmStroke('PVD_PIT_2_BACK','PVD_PIT_2');
	animateAlarmStroke('LVD_1_BACK','LVD_1_2');
	animateAlarmStroke('LVD_2_BACK','LVD_2_2');
	animateAlarmStroke('PPR_BACK','PPR_2');
	animateAlarmStroke('FPR_SIO_BACK','FPR_SIO_2');
	animateAlarmStroke('PPR_SIO_BACK','PPR_SIO_2');
	animateAlarmStroke('TPR_SIO_BACK','TPR_SIO_2');
	animateAlarmStroke('FVD_1_BACK','FVD_2_1');
	animateAlarmStroke('PVD_1_BACK','PVD_2_1');
	animateAlarmStroke('TVD_1_BACK','TVD_2_1');
	animateAlarmStroke('FVD_2_BACK','FVD_2_2');
	animateAlarmStroke('PVD_2_BACK','PVD_2_2');
	animateAlarmStroke('TVD_2_BACK','TVD_2_2');
	animateAlarmStroke('FVD_3_BACK','FVD_2_3');
	animateAlarmStroke('PVD_3_BACK','PVD_2_3');
	animateAlarmStroke('TVD_3_BACK','TVD_2_3');
	animateAlarmStroke('FVD_4_BACK','FVD_2_4');
	animateAlarmStroke('PVD_4_BACK','PVD_2_4');
	animateAlarmStroke('TVD_4_BACK','TVD_2_4');
	animateAlarmStroke('PVD_NAGN_1_BACK','PVD_NAGN_1');
	animateAlarmStroke('PVD_NAGN_2_BACK','PVD_NAGN_2');
	animateAlarmStroke('PVD_NAGN_3_BACK','PVD_NAGN_3');
	animateAlarmStroke('PVD_NAGN_4_BACK','PVD_NAGN_4');
	animateAlarmStroke('PVD_VSAS_1_BACK','PVD_VSAS_1');
	animateAlarmStroke('PVD_VSAS_2_BACK','PVD_VSAS_2');
	animateAlarmStroke('PVD_VSAS_3_BACK','PVD_VSAS_3');
	animateAlarmStroke('PVD_VSAS_4_BACK','PVD_VSAS_4');
	animateAlarmStroke('PPR_1_BACK','PPR_2_1');
	animateAlarmStroke('PPR_2_BACK','PPR_2_2');
	animateAlarmStroke('PPR_3_BACK','PPR_2_3');
	animateAlarmStroke('PPR_4_BACK','PPR_2_4');
	animateAlarmStroke('TPR_1_BACK','TPR_2_1');
	animateAlarmStroke('TPR_2_BACK','TPR_2_2');
	animateAlarmStroke('TPR_3_BACK','TPR_2_3');
	animateAlarmStroke('TPR_4_BACK','TPR_2_4');
	animateAlarmStroke('PPR_0_1_BACK','PPR_1');
	animateAlarmStroke('PPR_0_2_BACK','PPR_2');
	animateAlarmStroke('QCO_BACK','QCO_2');
	animateAlarmStroke('QCO_NAS_1_BACK','QCO_NAS_1');
	animateAlarmStroke('QCO_NAS_2_BACK','QCO_NAS_2');

	animateAlarmFill('LVD_1_G','LVD_1_2');
	animateAlarmFill('LVD_2_G','LVD_2_2');

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
// Формат вызова: nassio_click()
// Назначение: Обработчик нажатия на кнопку открытия видеокадра отображения параметров насосной СИО.
// Параметры: -
//////////////////////////////////////////////////////////////////////////////////////////////
function nassio_click() {
	openFrame('nassio.svg');
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
	} else if (V>240) {
		return 240;
	}
	return V;
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
