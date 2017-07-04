//////////////////////////////////////////////////////////////////////////////////////////////
// Автор: Владимир Щербина <vns.scherbina@gmail.com>
// copyright 2017
// Версия: 1.0.0
// Модуль cak_pu4_pu5.js реализует анимацию и логику диалогового взаимодействия для видеокадра cak_pu4_pu5.
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
	setText('TVD_HORN_V_N_XP_16',getFltTag('TVD_HORN_V_N_XP_16').format(2,''));
	setText('TVD_HORN_V_N_XP_17',getFltTag('TVD_HORN_V_N_XP_17').format(2,''));
	setText('TVD_HORN_V_N_XP_18',getFltTag('TVD_HORN_V_N_XP_18').format(2,''));
	setText('TVD_HORN_V_N_XP_19',getFltTag('TVD_HORN_V_N_XP_19').format(2,''));
	setText('TVD_HORN_V_N_XP_20',getFltTag('TVD_HORN_V_N_XP_20').format(2,''));
	setText('TVD_HORN_V_N_XP_21',getFltTag('TVD_HORN_V_N_XP_21').format(2,''));
	setText('TVD_HORN_V_N_XP_22',getFltTag('TVD_HORN_V_N_XP_22').format(2,''));
	setText('TVD_HORN_V_N_XP_23',getFltTag('TVD_HORN_V_N_XP_23').format(2,''));
	setText('TVD_HORN_V_N_XP_24',getFltTag('TVD_HORN_V_N_XP_24').format(2,''));
	setText('TVD_HORN_V_N_XP_25',getFltTag('TVD_HORN_V_N_XP_25').format(2,''));
	setText('TVD_HORN_V_N_XP_26',getFltTag('TVD_HORN_V_N_XP_26').format(2,''));

	setText('TVD_HORN_N_LESH_V_XP_16',getFltTag('TVD_HORN_N_LESH_V_XP_16').format(2,''));
	setText('TVD_HORN_N_LESH_V_XP_17',getFltTag('TVD_HORN_N_LESH_V_XP_17').format(2,''));
	setText('TVD_HORN_N_LESH_V_XP_18',getFltTag('TVD_HORN_N_LESH_V_XP_18').format(2,''));
	setText('TVD_HORN_N_LESH_V_XP_19',getFltTag('TVD_HORN_N_LESH_V_XP_19').format(2,''));
	setText('TVD_HORN_N_LESH_V_XP_20',getFltTag('TVD_HORN_N_LESH_V_XP_20').format(2,''));
	setText('TVD_HORN_N_LESH_V_XP_21',getFltTag('TVD_HORN_N_LESH_V_XP_21').format(2,''));
	setText('TVD_HORN_N_LESH_V_XP_22',getFltTag('TVD_HORN_N_LESH_V_XP_22').format(2,''));
	setText('TVD_HORN_N_LESH_V_XP_23',getFltTag('TVD_HORN_N_LESH_V_XP_23').format(2,''));
	setText('TVD_HORN_N_LESH_V_XP_24',getFltTag('TVD_HORN_N_LESH_V_XP_24').format(2,''));
	setText('TVD_HORN_N_LESH_V_XP_25',getFltTag('TVD_HORN_N_LESH_V_XP_25').format(2,''));
	setText('TVD_HORN_N_LESH_V_XP_26',getFltTag('TVD_HORN_N_LESH_V_XP_26').format(2,''));

	setText('TVD_LESH_V_N_XP_16',getFltTag('TVD_LESH_V_N_XP_16').format(2,''));
	setText('TVD_LESH_V_N_XP_17',getFltTag('TVD_LESH_V_N_XP_17').format(2,''));
	setText('TVD_LESH_V_N_XP_18',getFltTag('TVD_LESH_V_N_XP_18').format(2,''));
	setText('TVD_LESH_V_N_XP_19',getFltTag('TVD_LESH_V_N_XP_19').format(2,''));
	setText('TVD_LESH_V_N_XP_20',getFltTag('TVD_LESH_V_N_XP_20').format(2,''));
	setText('TVD_LESH_V_N_XP_21',getFltTag('TVD_LESH_V_N_XP_21').format(2,''));
	setText('TVD_LESH_V_N_XP_22',getFltTag('TVD_LESH_V_N_XP_22').format(2,''));
	setText('TVD_LESH_V_N_XP_23',getFltTag('TVD_LESH_V_N_XP_23').format(2,''));
	setText('TVD_LESH_V_N_XP_24',getFltTag('TVD_LESH_V_N_XP_24').format(2,''));
	setText('TVD_LESH_V_N_XP_25',getFltTag('TVD_LESH_V_N_XP_25').format(2,''));
	setText('TVD_LESH_V_N_XP_26',getFltTag('TVD_LESH_V_N_XP_26').format(2,''));

	setText('FVD_5_13C',getFltTag('FVD_5_13C').format(2,''));
	setText('FVD_5_10C',getFltTag('FVD_5_10C').format(2,''));
	setText('FVD_5_7C',getFltTag('FVD_5_7C').format(2,''));
	setText('FVD_5_3C',getFltTag('FVD_5_3C').format(2,''));
	setText('FVD_4_30C',getFltTag('FVD_4_30C').format(2,''));
	setText('FVD_4_26C',getFltTag('FVD_4_26C').format(2,''));
	setText('FVD_4_23C',getFltTag('FVD_4_23C').format(2,''));
	setText('FVD_4_20C',getFltTag('FVD_4_20C').format(2,''));
	setText('FVD_4_10C',getFltTag('FVD_4_10C').format(2,''));
	setText('FVD_4_7C',getFltTag('FVD_4_7C').format(2,''));
	setText('FVD_4_3C',getFltTag('FVD_4_3C').format(2,''));
	
	setText('TVD_5_13C',getFltTag('TVD_5_13C').format(2,''));
	setText('TVD_5_10C',getFltTag('TVD_5_10C').format(2,''));
	setText('TVD_5_7C',getFltTag('TVD_5_7C').format(2,''));
	setText('TVD_5_3C',getFltTag('TVD_5_3C').format(2,''));
	setText('TVD_4_30C',getFltTag('TVD_4_30C').format(2,''));
	setText('TVD_4_26C',getFltTag('TVD_4_26C').format(2,''));
	setText('TVD_4_23C',getFltTag('TVD_4_23C').format(2,''));
	setText('TVD_4_20C',getFltTag('TVD_4_20C').format(2,''));
	setText('TVD_4_10C',getFltTag('TVD_4_10C').format(2,''));
	setText('TVD_4_7C',getFltTag('TVD_4_7C').format(2,''));
	setText('TVD_4_3C',getFltTag('TVD_4_3C').format(2,''));
	setText('TVD_COL_4',getFltTag('TVD_COL_4').format(2,''));
	setText('TVD_COL_5',getFltTag('TVD_COL_5').format(2,''));
	
	setText('TVD_HORN_V_N_XP_HISTO_VALUE_16',getFltTag('TVD_HORN_V_N_XP_16').format(2,''));
	setText('TVD_HORN_V_N_XP_HISTO_VALUE_17',getFltTag('TVD_HORN_V_N_XP_17').format(2,''));
	setText('TVD_HORN_V_N_XP_HISTO_VALUE_18',getFltTag('TVD_HORN_V_N_XP_18').format(2,''));
	setText('TVD_HORN_V_N_XP_HISTO_VALUE_19',getFltTag('TVD_HORN_V_N_XP_19').format(2,''));
	setText('TVD_HORN_V_N_XP_HISTO_VALUE_20',getFltTag('TVD_HORN_V_N_XP_20').format(2,''));
	setText('TVD_HORN_V_N_XP_HISTO_VALUE_21',getFltTag('TVD_HORN_V_N_XP_21').format(2,''));
	setText('TVD_HORN_V_N_XP_HISTO_VALUE_22',getFltTag('TVD_HORN_V_N_XP_22').format(2,''));
	setText('TVD_HORN_V_N_XP_HISTO_VALUE_23',getFltTag('TVD_HORN_V_N_XP_23').format(2,''));
	setText('TVD_HORN_V_N_XP_HISTO_VALUE_24',getFltTag('TVD_HORN_V_N_XP_24').format(2,''));
	setText('TVD_HORN_V_N_XP_HISTO_VALUE_25',getFltTag('TVD_HORN_V_N_XP_25').format(2,''));
	setText('TVD_HORN_V_N_XP_HISTO_VALUE_26',getFltTag('TVD_HORN_V_N_XP_26').format(2,''));

	setText('TVD_HORN_N_LESH_V_XP_HISTO_VALUE_16',getFltTag('TVD_HORN_N_LESH_V_XP_16').format(2,''));
	setText('TVD_HORN_N_LESH_V_XP_HISTO_VALUE_17',getFltTag('TVD_HORN_N_LESH_V_XP_17').format(2,''));
	setText('TVD_HORN_N_LESH_V_XP_HISTO_VALUE_18',getFltTag('TVD_HORN_N_LESH_V_XP_18').format(2,''));
	setText('TVD_HORN_N_LESH_V_XP_HISTO_VALUE_19',getFltTag('TVD_HORN_N_LESH_V_XP_19').format(2,''));
	setText('TVD_HORN_N_LESH_V_XP_HISTO_VALUE_20',getFltTag('TVD_HORN_N_LESH_V_XP_20').format(2,''));
	setText('TVD_HORN_N_LESH_V_XP_HISTO_VALUE_21',getFltTag('TVD_HORN_N_LESH_V_XP_21').format(2,''));
	setText('TVD_HORN_N_LESH_V_XP_HISTO_VALUE_22',getFltTag('TVD_HORN_N_LESH_V_XP_22').format(2,''));
	setText('TVD_HORN_N_LESH_V_XP_HISTO_VALUE_23',getFltTag('TVD_HORN_N_LESH_V_XP_23').format(2,''));
	setText('TVD_HORN_N_LESH_V_XP_HISTO_VALUE_24',getFltTag('TVD_HORN_N_LESH_V_XP_24').format(2,''));
	setText('TVD_HORN_N_LESH_V_XP_HISTO_VALUE_25',getFltTag('TVD_HORN_N_LESH_V_XP_25').format(2,''));
	setText('TVD_HORN_N_LESH_V_XP_HISTO_VALUE_26',getFltTag('TVD_HORN_N_LESH_V_XP_26').format(2,''));

	setText('TVD_LESH_V_N_XP_HISTO_VALUE_16',getFltTag('TVD_LESH_V_N_XP_16').format(2,''));
	setText('TVD_LESH_V_N_XP_HISTO_VALUE_17',getFltTag('TVD_LESH_V_N_XP_17').format(2,''));
	setText('TVD_LESH_V_N_XP_HISTO_VALUE_18',getFltTag('TVD_LESH_V_N_XP_18').format(2,''));
	setText('TVD_LESH_V_N_XP_HISTO_VALUE_19',getFltTag('TVD_LESH_V_N_XP_19').format(2,''));
	setText('TVD_LESH_V_N_XP_HISTO_VALUE_20',getFltTag('TVD_LESH_V_N_XP_20').format(2,''));
	setText('TVD_LESH_V_N_XP_HISTO_VALUE_21',getFltTag('TVD_LESH_V_N_XP_21').format(2,''));
	setText('TVD_LESH_V_N_XP_HISTO_VALUE_22',getFltTag('TVD_LESH_V_N_XP_22').format(2,''));
	setText('TVD_LESH_V_N_XP_HISTO_VALUE_23',getFltTag('TVD_LESH_V_N_XP_23').format(2,''));
	setText('TVD_LESH_V_N_XP_HISTO_VALUE_24',getFltTag('TVD_LESH_V_N_XP_24').format(2,''));
	setText('TVD_LESH_V_N_XP_HISTO_VALUE_25',getFltTag('TVD_LESH_V_N_XP_25').format(2,''));
	setText('TVD_LESH_V_N_XP_HISTO_VALUE_26',getFltTag('TVD_LESH_V_N_XP_26').format(2,''));

	setAttr('TVD_HORN_V_N_XP_HISTO_16','width',checkLimits(200*getFltTag('TVD_HORN_V_N_XP_16')/50));
	setAttr('TVD_HORN_V_N_XP_HISTO_17','width',checkLimits(200*getFltTag('TVD_HORN_V_N_XP_17')/50));
	setAttr('TVD_HORN_V_N_XP_HISTO_18','width',checkLimits(200*getFltTag('TVD_HORN_V_N_XP_18')/50));
	setAttr('TVD_HORN_V_N_XP_HISTO_19','width',checkLimits(200*getFltTag('TVD_HORN_V_N_XP_19')/50));
	setAttr('TVD_HORN_V_N_XP_HISTO_20','width',checkLimits(200*getFltTag('TVD_HORN_V_N_XP_20')/50));
	setAttr('TVD_HORN_V_N_XP_HISTO_21','width',checkLimits(200*getFltTag('TVD_HORN_V_N_XP_21')/50));
	setAttr('TVD_HORN_V_N_XP_HISTO_22','width',checkLimits(200*getFltTag('TVD_HORN_V_N_XP_22')/50));
	setAttr('TVD_HORN_V_N_XP_HISTO_23','width',checkLimits(200*getFltTag('TVD_HORN_V_N_XP_23')/50));
	setAttr('TVD_HORN_V_N_XP_HISTO_24','width',checkLimits(200*getFltTag('TVD_HORN_V_N_XP_24')/50));
	setAttr('TVD_HORN_V_N_XP_HISTO_25','width',checkLimits(200*getFltTag('TVD_HORN_V_N_XP_25')/50));
	setAttr('TVD_HORN_V_N_XP_HISTO_26','width',checkLimits(200*getFltTag('TVD_HORN_V_N_XP_26')/50));

	setAttr('TVD_HORN_N_LESH_V_XP_HISTO_16','width',checkLimits(200*getFltTag('TVD_HORN_N_LESH_V_XP_16')/50));
	setAttr('TVD_HORN_N_LESH_V_XP_HISTO_17','width',checkLimits(200*getFltTag('TVD_HORN_N_LESH_V_XP_17')/50));
	setAttr('TVD_HORN_N_LESH_V_XP_HISTO_18','width',checkLimits(200*getFltTag('TVD_HORN_N_LESH_V_XP_18')/50));
	setAttr('TVD_HORN_N_LESH_V_XP_HISTO_19','width',checkLimits(200*getFltTag('TVD_HORN_N_LESH_V_XP_19')/50));
	setAttr('TVD_HORN_N_LESH_V_XP_HISTO_20','width',checkLimits(200*getFltTag('TVD_HORN_N_LESH_V_XP_20')/50));
	setAttr('TVD_HORN_N_LESH_V_XP_HISTO_21','width',checkLimits(200*getFltTag('TVD_HORN_N_LESH_V_XP_21')/50));
	setAttr('TVD_HORN_N_LESH_V_XP_HISTO_22','width',checkLimits(200*getFltTag('TVD_HORN_N_LESH_V_XP_22')/50));
	setAttr('TVD_HORN_N_LESH_V_XP_HISTO_23','width',checkLimits(200*getFltTag('TVD_HORN_N_LESH_V_XP_23')/50));
	setAttr('TVD_HORN_N_LESH_V_XP_HISTO_24','width',checkLimits(200*getFltTag('TVD_HORN_N_LESH_V_XP_24')/50));
	setAttr('TVD_HORN_N_LESH_V_XP_HISTO_25','width',checkLimits(200*getFltTag('TVD_HORN_N_LESH_V_XP_25')/50));
	setAttr('TVD_HORN_N_LESH_V_XP_HISTO_26','width',checkLimits(200*getFltTag('TVD_HORN_N_LESH_V_XP_26')/50));

	setAttr('TVD_LESH_V_N_XP_HISTO_16','width',checkLimits(200*getFltTag('TVD_LESH_V_N_XP_16')/50));
	setAttr('TVD_LESH_V_N_XP_HISTO_17','width',checkLimits(200*getFltTag('TVD_LESH_V_N_XP_17')/50));
	setAttr('TVD_LESH_V_N_XP_HISTO_18','width',checkLimits(200*getFltTag('TVD_LESH_V_N_XP_18')/50));
	setAttr('TVD_LESH_V_N_XP_HISTO_19','width',checkLimits(200*getFltTag('TVD_LESH_V_N_XP_19')/50));
	setAttr('TVD_LESH_V_N_XP_HISTO_20','width',checkLimits(200*getFltTag('TVD_LESH_V_N_XP_20')/50));
	setAttr('TVD_LESH_V_N_XP_HISTO_21','width',checkLimits(200*getFltTag('TVD_LESH_V_N_XP_21')/50));
	setAttr('TVD_LESH_V_N_XP_HISTO_22','width',checkLimits(200*getFltTag('TVD_LESH_V_N_XP_22')/50));
	setAttr('TVD_LESH_V_N_XP_HISTO_23','width',checkLimits(200*getFltTag('TVD_LESH_V_N_XP_23')/50));
	setAttr('TVD_LESH_V_N_XP_HISTO_24','width',checkLimits(200*getFltTag('TVD_LESH_V_N_XP_24')/50));
	setAttr('TVD_LESH_V_N_XP_HISTO_25','width',checkLimits(200*getFltTag('TVD_LESH_V_N_XP_25')/50));
	setAttr('TVD_LESH_V_N_XP_HISTO_26','width',checkLimits(200*getFltTag('TVD_LESH_V_N_XP_26')/50));

	setText('TVD_HISTO_VALUE_5_13C',getFltTag('TVD_5_13C').format(2,''));
	setText('TVD_HISTO_VALUE_5_10C',getFltTag('TVD_5_10C').format(2,''));
	setText('TVD_HISTO_VALUE_5_7C',getFltTag('TVD_5_7C').format(2,''));
	setText('TVD_HISTO_VALUE_5_3C',getFltTag('TVD_5_3C').format(2,''));
	setText('TVD_HISTO_VALUE_4_30C',getFltTag('TVD_4_30C').format(2,''));
	setText('TVD_HISTO_VALUE_4_26C',getFltTag('TVD_4_26C').format(2,''));
	setText('TVD_HISTO_VALUE_4_23C',getFltTag('TVD_4_23C').format(2,''));
	setText('TVD_HISTO_VALUE_4_20C',getFltTag('TVD_4_20C').format(2,''));
	setText('TVD_HISTO_VALUE_4_10C',getFltTag('TVD_4_10C').format(2,''));
	setText('TVD_HISTO_VALUE_4_7C',getFltTag('TVD_4_7C').format(2,''));
	setText('TVD_HISTO_VALUE_4_3C',getFltTag('TVD_4_3C').format(2,''));
	setText('TVD_COL_HISTO_VALUE_4',getFltTag('TVD_COL_4').format(2,''));
	setText('TVD_COL_HISTO_VALUE_5',getFltTag('TVD_COL_5').format(2,''));

	setAttr('TVD_HISTO_5_13C','width',checkLimits(200*getFltTag('TVD_5_13C')/50));
	setAttr('TVD_HISTO_5_10C','width',checkLimits(200*getFltTag('TVD_5_10C')/50));
	setAttr('TVD_HISTO_5_7C','width',checkLimits(200*getFltTag('TVD_5_7C')/50));
	setAttr('TVD_HISTO_5_3C','width',checkLimits(200*getFltTag('TVD_5_3C')/50));
	setAttr('TVD_HISTO_4_30C','width',checkLimits(200*getFltTag('TVD_4_30C')/50));
	setAttr('TVD_HISTO_4_26C','width',checkLimits(200*getFltTag('TVD_4_26C')/50));
	setAttr('TVD_HISTO_4_23C','width',checkLimits(200*getFltTag('TVD_4_23C')/50));
	setAttr('TVD_HISTO_4_20C','width',checkLimits(200*getFltTag('TVD_4_20C')/50));
	setAttr('TVD_HISTO_4_10C','width',checkLimits(200*getFltTag('TVD_4_10C')/50));
	setAttr('TVD_HISTO_4_7C','width',checkLimits(200*getFltTag('TVD_4_7C')/50));
	setAttr('TVD_HISTO_4_3C','width',checkLimits(200*getFltTag('TVD_4_3C')/50));
	setAttr('TVD_COL_HISTO_4','width',checkLimits(200*getFltTag('TVD_COL_4')/50));
	setAttr('TVD_COL_HISTO_5','width',checkLimits(200*getFltTag('TVD_COL_5')/50));

	setText('FVD_HISTO_VALUE_5_13C',getFltTag('FVD_5_13C').format(2,''));
	setText('FVD_HISTO_VALUE_5_10C',getFltTag('FVD_5_10C').format(2,''));
	setText('FVD_HISTO_VALUE_5_7C',getFltTag('FVD_5_7C').format(2,''));
	setText('FVD_HISTO_VALUE_5_3C',getFltTag('FVD_5_3C').format(2,''));
	setText('FVD_HISTO_VALUE_4_30C',getFltTag('FVD_4_30C').format(2,''));
	setText('FVD_HISTO_VALUE_4_26C',getFltTag('FVD_4_26C').format(2,''));
	setText('FVD_HISTO_VALUE_4_23C',getFltTag('FVD_4_23C').format(2,''));
	setText('FVD_HISTO_VALUE_4_20C',getFltTag('FVD_4_20C').format(2,''));
	setText('FVD_HISTO_VALUE_4_10C',getFltTag('FVD_4_10C').format(2,''));
	setText('FVD_HISTO_VALUE_4_7C',getFltTag('FVD_4_7C').format(2,''));
	setText('FVD_HISTO_VALUE_4_3C',getFltTag('FVD_4_3C').format(2,''));

	setAttr('FVD_HISTO_5_13C','width',checkLimits(200*(getFltTag('FVD_5_13C')-0.4)/14.6));
	setAttr('FVD_HISTO_5_10C','width',checkLimits(200*(getFltTag('FVD_5_10C')-0.4)/14.6));
	setAttr('FVD_HISTO_5_7C','width',checkLimits(200*(getFltTag('FVD_5_7C')-0.4)/14.6));
	setAttr('FVD_HISTO_5_3C','width',checkLimits(200*(getFltTag('FVD_5_3C')-0.4)/14.6));
	setAttr('FVD_HISTO_4_30C','width',checkLimits(200*(getFltTag('FVD_4_30C')-0.4)/14.6));
	setAttr('FVD_HISTO_4_26C','width',checkLimits(200*(getFltTag('FVD_4_26C')-0.4)/14.6));
	setAttr('FVD_HISTO_4_23C','width',checkLimits(200*(getFltTag('FVD_4_23C')-0.4)/14.6));
	setAttr('FVD_HISTO_4_20C','width',checkLimits(200*(getFltTag('FVD_4_20C')-0.4)/14.6));
	setAttr('FVD_HISTO_4_10C','width',checkLimits(200*(getFltTag('FVD_4_10C')-0.4)/14.6));
	setAttr('FVD_HISTO_4_7C','width',checkLimits(200*(getFltTag('FVD_4_7C')-0.4)/14.6));
	setAttr('FVD_HISTO_4_3C','width',checkLimits(200*(getFltTag('FVD_4_3C')-0.4)/14.6));


	animateAlarmBackStroke('TVD_HORN_V_N_XP_16');
	animateAlarmBackStroke('TVD_HORN_V_N_XP_17');
	animateAlarmBackStroke('TVD_HORN_V_N_XP_18');
	animateAlarmBackStroke('TVD_HORN_V_N_XP_19');
	animateAlarmBackStroke('TVD_HORN_V_N_XP_20');
	animateAlarmBackStroke('TVD_HORN_V_N_XP_21');
	animateAlarmBackStroke('TVD_HORN_V_N_XP_22');
	animateAlarmBackStroke('TVD_HORN_V_N_XP_23');
	animateAlarmBackStroke('TVD_HORN_V_N_XP_24');
	animateAlarmBackStroke('TVD_HORN_V_N_XP_25');
	animateAlarmBackStroke('TVD_HORN_V_N_XP_26');

	animateAlarmBackStroke('TVD_HORN_N_LESH_V_XP_16');
	animateAlarmBackStroke('TVD_HORN_N_LESH_V_XP_17');
	animateAlarmBackStroke('TVD_HORN_N_LESH_V_XP_18');
	animateAlarmBackStroke('TVD_HORN_N_LESH_V_XP_19');
	animateAlarmBackStroke('TVD_HORN_N_LESH_V_XP_20');
	animateAlarmBackStroke('TVD_HORN_N_LESH_V_XP_21');
	animateAlarmBackStroke('TVD_HORN_N_LESH_V_XP_22');
	animateAlarmBackStroke('TVD_HORN_N_LESH_V_XP_23');
	animateAlarmBackStroke('TVD_HORN_N_LESH_V_XP_24');
	animateAlarmBackStroke('TVD_HORN_N_LESH_V_XP_25');
	animateAlarmBackStroke('TVD_HORN_N_LESH_V_XP_26');

	animateAlarmBackStroke('TVD_LESH_V_N_XP_16');
	animateAlarmBackStroke('TVD_LESH_V_N_XP_17');
	animateAlarmBackStroke('TVD_LESH_V_N_XP_18');
	animateAlarmBackStroke('TVD_LESH_V_N_XP_19');
	animateAlarmBackStroke('TVD_LESH_V_N_XP_20');
	animateAlarmBackStroke('TVD_LESH_V_N_XP_21');
	animateAlarmBackStroke('TVD_LESH_V_N_XP_22');
	animateAlarmBackStroke('TVD_LESH_V_N_XP_23');
	animateAlarmBackStroke('TVD_LESH_V_N_XP_24');
	animateAlarmBackStroke('TVD_LESH_V_N_XP_25');
	animateAlarmBackStroke('TVD_LESH_V_N_XP_26');

	animateAlarmBackStroke('FVD_5_13C');
	animateAlarmBackStroke('FVD_5_10C');
	animateAlarmBackStroke('FVD_5_7C');
	animateAlarmBackStroke('FVD_5_3C');
	animateAlarmBackStroke('FVD_4_30C');
	animateAlarmBackStroke('FVD_4_26C');
	animateAlarmBackStroke('FVD_4_23C');
	animateAlarmBackStroke('FVD_4_20C');
	animateAlarmBackStroke('FVD_4_10C');
	animateAlarmBackStroke('FVD_4_7C');
	animateAlarmBackStroke('FVD_4_3C');
	
	animateAlarmBackStroke('TVD_5_13C');
	animateAlarmBackStroke('TVD_5_10C');
	animateAlarmBackStroke('TVD_5_7C');
	animateAlarmBackStroke('TVD_5_3C');
	animateAlarmBackStroke('TVD_4_30C');
	animateAlarmBackStroke('TVD_4_26C');
	animateAlarmBackStroke('TVD_4_23C');
	animateAlarmBackStroke('TVD_4_20C');
	animateAlarmBackStroke('TVD_4_10C');
	animateAlarmBackStroke('TVD_4_7C');
	animateAlarmBackStroke('TVD_4_3C');
	animateAlarmBackStroke('TVD_COL_4');
	animateAlarmBackStroke('TVD_COL_5');

	animateAlarmFill('TVD_HORN_V_N_XP_HISTO_16','TVD_HORN_V_N_XP_16');
	animateAlarmFill('TVD_HORN_V_N_XP_HISTO_17','TVD_HORN_V_N_XP_17');
	animateAlarmFill('TVD_HORN_V_N_XP_HISTO_18','TVD_HORN_V_N_XP_18');
	animateAlarmFill('TVD_HORN_V_N_XP_HISTO_19','TVD_HORN_V_N_XP_19');
	animateAlarmFill('TVD_HORN_V_N_XP_HISTO_20','TVD_HORN_V_N_XP_20');
	animateAlarmFill('TVD_HORN_V_N_XP_HISTO_21','TVD_HORN_V_N_XP_21');
	animateAlarmFill('TVD_HORN_V_N_XP_HISTO_22','TVD_HORN_V_N_XP_22');
	animateAlarmFill('TVD_HORN_V_N_XP_HISTO_23','TVD_HORN_V_N_XP_23');
	animateAlarmFill('TVD_HORN_V_N_XP_HISTO_24','TVD_HORN_V_N_XP_24');
	animateAlarmFill('TVD_HORN_V_N_XP_HISTO_25','TVD_HORN_V_N_XP_25');
	animateAlarmFill('TVD_HORN_V_N_XP_HISTO_26','TVD_HORN_V_N_XP_26');

	animateAlarmFill('TVD_HORN_N_LESH_V_XP_HISTO_16','TVD_HORN_N_LESH_V_XP_16');
	animateAlarmFill('TVD_HORN_N_LESH_V_XP_HISTO_17','TVD_HORN_N_LESH_V_XP_17');
	animateAlarmFill('TVD_HORN_N_LESH_V_XP_HISTO_18','TVD_HORN_N_LESH_V_XP_18');
	animateAlarmFill('TVD_HORN_N_LESH_V_XP_HISTO_19','TVD_HORN_N_LESH_V_XP_19');
	animateAlarmFill('TVD_HORN_N_LESH_V_XP_HISTO_20','TVD_HORN_N_LESH_V_XP_20');
	animateAlarmFill('TVD_HORN_N_LESH_V_XP_HISTO_21','TVD_HORN_N_LESH_V_XP_21');
	animateAlarmFill('TVD_HORN_N_LESH_V_XP_HISTO_22','TVD_HORN_N_LESH_V_XP_22');
	animateAlarmFill('TVD_HORN_N_LESH_V_XP_HISTO_23','TVD_HORN_N_LESH_V_XP_23');
	animateAlarmFill('TVD_HORN_N_LESH_V_XP_HISTO_24','TVD_HORN_N_LESH_V_XP_24');
	animateAlarmFill('TVD_HORN_N_LESH_V_XP_HISTO_25','TVD_HORN_N_LESH_V_XP_25');
	animateAlarmFill('TVD_HORN_N_LESH_V_XP_HISTO_26','TVD_HORN_N_LESH_V_XP_26');

	animateAlarmFill('TVD_LESH_V_N_XP_HISTO_16','TVD_LESH_V_N_XP_16');
	animateAlarmFill('TVD_LESH_V_N_XP_HISTO_17','TVD_LESH_V_N_XP_17');
	animateAlarmFill('TVD_LESH_V_N_XP_HISTO_18','TVD_LESH_V_N_XP_18');
	animateAlarmFill('TVD_LESH_V_N_XP_HISTO_19','TVD_LESH_V_N_XP_19');
	animateAlarmFill('TVD_LESH_V_N_XP_HISTO_20','TVD_LESH_V_N_XP_20');
	animateAlarmFill('TVD_LESH_V_N_XP_HISTO_21','TVD_LESH_V_N_XP_21');
	animateAlarmFill('TVD_LESH_V_N_XP_HISTO_22','TVD_LESH_V_N_XP_22');
	animateAlarmFill('TVD_LESH_V_N_XP_HISTO_23','TVD_LESH_V_N_XP_23');
	animateAlarmFill('TVD_LESH_V_N_XP_HISTO_24','TVD_LESH_V_N_XP_24');
	animateAlarmFill('TVD_LESH_V_N_XP_HISTO_25','TVD_LESH_V_N_XP_25');
	animateAlarmFill('TVD_LESH_V_N_XP_HISTO_26','TVD_LESH_V_N_XP_26');

	animateAlarmFill('TVD_HISTO_5_13C','TVD_5_13C');
	animateAlarmFill('TVD_HISTO_5_10C','TVD_5_10C');
	animateAlarmFill('TVD_HISTO_5_7C','TVD_5_7C');
	animateAlarmFill('TVD_HISTO_5_3C','TVD_5_3C');
	animateAlarmFill('TVD_HISTO_4_30C','TVD_4_30C');
	animateAlarmFill('TVD_HISTO_4_26C','TVD_4_26C');
	animateAlarmFill('TVD_HISTO_4_23C','TVD_4_23C');
	animateAlarmFill('TVD_HISTO_4_20C','TVD_4_20C');
	animateAlarmFill('TVD_HISTO_4_10C','TVD_4_10C');
	animateAlarmFill('TVD_HISTO_4_7C','TVD_4_7C');
	animateAlarmFill('TVD_HISTO_4_3C','TVD_4_3C');
	animateAlarmFill('TVD_COL_HISTO_4','TVD_COL_4');
	animateAlarmFill('TVD_COL_HISTO_5','TVD_COL_5');

	animateAlarmFill('FVD_HISTO_5_13C','FVD_5_13C');
	animateAlarmFill('FVD_HISTO_5_10C','FVD_5_10C');
	animateAlarmFill('FVD_HISTO_5_7C','FVD_5_7C');
	animateAlarmFill('FVD_HISTO_5_3C','FVD_5_3C');
	animateAlarmFill('FVD_HISTO_4_30C','FVD_4_30C');
	animateAlarmFill('FVD_HISTO_4_26C','FVD_4_26C');
	animateAlarmFill('FVD_HISTO_4_23C','FVD_4_23C');
	animateAlarmFill('FVD_HISTO_4_20C','FVD_4_20C');
	animateAlarmFill('FVD_HISTO_4_10C','FVD_4_10C');
	animateAlarmFill('FVD_HISTO_4_7C','FVD_4_7C');
	animateAlarmFill('FVD_HISTO_4_3C','FVD_4_3C');

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
