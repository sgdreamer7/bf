//////////////////////////////////////////////////////////////////////////////////////////////
// Автор: Владимир Щербина <vns.scherbina@gmail.com>
// copyright 2017
// Версия: 1.0.0
// Модуль cak_pu2_pu3.js реализует анимацию и логику диалогового взаимодействия для видеокадра cak_pu2_pu3.
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
	setText('TVD_HORN_V_N_XP_3',getFltTag('TVD_HORN_V_N_XP_3').format(2,''));
	setText('TVD_HORN_V_N_XP_4',getFltTag('TVD_HORN_V_N_XP_4').format(2,''));
	setText('TVD_HORN_V_N_XP_5',getFltTag('TVD_HORN_V_N_XP_5').format(2,''));
	setText('TVD_HORN_V_N_XP_6',getFltTag('TVD_HORN_V_N_XP_6').format(2,''));
	setText('TVD_HORN_V_N_XP_7',getFltTag('TVD_HORN_V_N_XP_7').format(2,''));
	setText('TVD_HORN_V_N_XP_8',getFltTag('TVD_HORN_V_N_XP_8').format(2,''));
	setText('TVD_HORN_V_N_XP_9',getFltTag('TVD_HORN_V_N_XP_9').format(2,''));
	setText('TVD_HORN_V_N_XP_10',getFltTag('TVD_HORN_V_N_XP_10').format(2,''));
	setText('TVD_HORN_V_N_XP_11',getFltTag('TVD_HORN_V_N_XP_11').format(2,''));
	setText('TVD_HORN_V_N_XP_12',getFltTag('TVD_HORN_V_N_XP_12').format(2,''));
	setText('TVD_HORN_V_N_XP_13',getFltTag('TVD_HORN_V_N_XP_13').format(2,''));
	setText('TVD_HORN_V_N_XP_14',getFltTag('TVD_HORN_V_N_XP_14').format(2,''));
	setText('TVD_HORN_V_N_XP_15',getFltTag('TVD_HORN_V_N_XP_15').format(2,''));

	setText('TVD_HORN_N_LESH_V_XP_3',getFltTag('TVD_HORN_N_LESH_V_XP_3').format(2,''));
	setText('TVD_HORN_N_LESH_V_XP_4',getFltTag('TVD_HORN_N_LESH_V_XP_4').format(2,''));
	setText('TVD_HORN_N_LESH_V_XP_5',getFltTag('TVD_HORN_N_LESH_V_XP_5').format(2,''));
	setText('TVD_HORN_N_LESH_V_XP_6',getFltTag('TVD_HORN_N_LESH_V_XP_6').format(2,''));
	setText('TVD_HORN_N_LESH_V_XP_7',getFltTag('TVD_HORN_N_LESH_V_XP_7').format(2,''));
	setText('TVD_HORN_N_LESH_V_XP_8',getFltTag('TVD_HORN_N_LESH_V_XP_8').format(2,''));
	setText('TVD_HORN_N_LESH_V_XP_9',getFltTag('TVD_HORN_N_LESH_V_XP_9').format(2,''));
	setText('TVD_HORN_N_LESH_V_XP_10',getFltTag('TVD_HORN_N_LESH_V_XP_10').format(2,''));
	setText('TVD_HORN_N_LESH_V_XP_11',getFltTag('TVD_HORN_N_LESH_V_XP_11').format(2,''));
	setText('TVD_HORN_N_LESH_V_XP_12',getFltTag('TVD_HORN_N_LESH_V_XP_12').format(2,''));
	setText('TVD_HORN_N_LESH_V_XP_13',getFltTag('TVD_HORN_N_LESH_V_XP_13').format(2,''));
	setText('TVD_HORN_N_LESH_V_XP_14',getFltTag('TVD_HORN_N_LESH_V_XP_14').format(2,''));
	setText('TVD_HORN_N_LESH_V_XP_15',getFltTag('TVD_HORN_N_LESH_V_XP_15').format(2,''));

	setText('TVD_LESH_V_N_XP_3',getFltTag('TVD_LESH_V_N_XP_3').format(2,''));
	setText('TVD_LESH_V_N_XP_4',getFltTag('TVD_LESH_V_N_XP_4').format(2,''));
	setText('TVD_LESH_V_N_XP_5',getFltTag('TVD_LESH_V_N_XP_5').format(2,''));
	setText('TVD_LESH_V_N_XP_6',getFltTag('TVD_LESH_V_N_XP_6').format(2,''));
	setText('TVD_LESH_V_N_XP_7',getFltTag('TVD_LESH_V_N_XP_7').format(2,''));
	setText('TVD_LESH_V_N_XP_8',getFltTag('TVD_LESH_V_N_XP_8').format(2,''));
	setText('TVD_LESH_V_N_XP_9',getFltTag('TVD_LESH_V_N_XP_9').format(2,''));
	setText('TVD_LESH_V_N_XP_10',getFltTag('TVD_LESH_V_N_XP_10').format(2,''));
	setText('TVD_LESH_V_N_XP_11',getFltTag('TVD_LESH_V_N_XP_11').format(2,''));
	setText('TVD_LESH_V_N_XP_12',getFltTag('TVD_LESH_V_N_XP_12').format(2,''));
	setText('TVD_LESH_V_N_XP_13',getFltTag('TVD_LESH_V_N_XP_13').format(2,''));
	setText('TVD_LESH_V_N_XP_14',getFltTag('TVD_LESH_V_N_XP_14').format(2,''));
	setText('TVD_LESH_V_N_XP_15',getFltTag('TVD_LESH_V_N_XP_15').format(2,''));

	setText('FVD_3_29C',getFltTag('FVD_3_29C').format(2,''));
	setText('FVD_3_25C',getFltTag('FVD_3_25C').format(2,''));
	setText('FVD_3_21C',getFltTag('FVD_3_21C').format(2,''));
	setText('FVD_3_7C',getFltTag('FVD_3_7C').format(2,''));
	setText('FVD_3_2C',getFltTag('FVD_3_2C').format(2,''));
	setText('FVD_2_23C',getFltTag('FVD_2_23C').format(2,''));
	setText('FVD_2_17C',getFltTag('FVD_2_17C').format(2,''));
	setText('FVD_2_12C',getFltTag('FVD_2_12C').format(2,''));
	setText('FVD_2_9C',getFltTag('FVD_2_9C').format(2,''));
	setText('FVD_2_8C',getFltTag('FVD_2_8C').format(2,''));
	setText('FVD_2_18C',getFltTag('FVD_2_18C').format(2,''));
	setText('FVD_2_25C',getFltTag('FVD_2_25C').format(2,''));
	setText('FVD_2_3C',getFltTag('FVD_2_3C').format(2,''));
	
	setText('TVD_3_29C',getFltTag('TVD_3_29C').format(2,''));
	setText('TVD_3_25C',getFltTag('TVD_3_25C').format(2,''));
	setText('TVD_3_21C',getFltTag('TVD_3_21C').format(2,''));
	setText('TVD_3_7C',getFltTag('TVD_3_7C').format(2,''));
	setText('TVD_3_2C',getFltTag('TVD_3_2C').format(2,''));
	setText('TVD_2_23C',getFltTag('TVD_2_23C').format(2,''));
	setText('TVD_2_17C',getFltTag('TVD_2_17C').format(2,''));
	setText('TVD_2_12C',getFltTag('TVD_2_12C').format(2,''));
	setText('TVD_2_9C',getFltTag('TVD_2_9C').format(2,''));
	setText('TVD_2_8C',getFltTag('TVD_2_8C').format(2,''));
	setText('TVD_2_18C',getFltTag('TVD_2_18C').format(2,''));
	setText('TVD_2_25C',getFltTag('TVD_2_25C').format(2,''));
	setText('TVD_2_3C',getFltTag('TVD_2_3C').format(2,''));
	setText('TVD_COL_2',getFltTag('TVD_COL_2').format(2,''));
	setText('TVD_COL_3',getFltTag('TVD_COL_3').format(2,''));

	setText('TVD_HORN_V_N_XP_HISTO_VALUE_3',getFltTag('TVD_HORN_V_N_XP_3').format(2,''));
	setText('TVD_HORN_V_N_XP_HISTO_VALUE_4',getFltTag('TVD_HORN_V_N_XP_4').format(2,''));
	setText('TVD_HORN_V_N_XP_HISTO_VALUE_5',getFltTag('TVD_HORN_V_N_XP_5').format(2,''));
	setText('TVD_HORN_V_N_XP_HISTO_VALUE_6',getFltTag('TVD_HORN_V_N_XP_6').format(2,''));
	setText('TVD_HORN_V_N_XP_HISTO_VALUE_7',getFltTag('TVD_HORN_V_N_XP_7').format(2,''));
	setText('TVD_HORN_V_N_XP_HISTO_VALUE_8',getFltTag('TVD_HORN_V_N_XP_8').format(2,''));
	setText('TVD_HORN_V_N_XP_HISTO_VALUE_9',getFltTag('TVD_HORN_V_N_XP_9').format(2,''));
	setText('TVD_HORN_V_N_XP_HISTO_VALUE_10',getFltTag('TVD_HORN_V_N_XP_10').format(2,''));
	setText('TVD_HORN_V_N_XP_HISTO_VALUE_11',getFltTag('TVD_HORN_V_N_XP_11').format(2,''));
	setText('TVD_HORN_V_N_XP_HISTO_VALUE_12',getFltTag('TVD_HORN_V_N_XP_12').format(2,''));
	setText('TVD_HORN_V_N_XP_HISTO_VALUE_13',getFltTag('TVD_HORN_V_N_XP_13').format(2,''));
	setText('TVD_HORN_V_N_XP_HISTO_VALUE_14',getFltTag('TVD_HORN_V_N_XP_14').format(2,''));
	setText('TVD_HORN_V_N_XP_HISTO_VALUE_15',getFltTag('TVD_HORN_V_N_XP_15').format(2,''));

	setText('TVD_HORN_N_LESH_V_XP_HISTO_VALUE_3',getFltTag('TVD_HORN_N_LESH_V_XP_3').format(2,''));
	setText('TVD_HORN_N_LESH_V_XP_HISTO_VALUE_4',getFltTag('TVD_HORN_N_LESH_V_XP_4').format(2,''));
	setText('TVD_HORN_N_LESH_V_XP_HISTO_VALUE_5',getFltTag('TVD_HORN_N_LESH_V_XP_5').format(2,''));
	setText('TVD_HORN_N_LESH_V_XP_HISTO_VALUE_6',getFltTag('TVD_HORN_N_LESH_V_XP_6').format(2,''));
	setText('TVD_HORN_N_LESH_V_XP_HISTO_VALUE_7',getFltTag('TVD_HORN_N_LESH_V_XP_7').format(2,''));
	setText('TVD_HORN_N_LESH_V_XP_HISTO_VALUE_8',getFltTag('TVD_HORN_N_LESH_V_XP_8').format(2,''));
	setText('TVD_HORN_N_LESH_V_XP_HISTO_VALUE_9',getFltTag('TVD_HORN_N_LESH_V_XP_9').format(2,''));
	setText('TVD_HORN_N_LESH_V_XP_HISTO_VALUE_10',getFltTag('TVD_HORN_N_LESH_V_XP_10').format(2,''));
	setText('TVD_HORN_N_LESH_V_XP_HISTO_VALUE_11',getFltTag('TVD_HORN_N_LESH_V_XP_11').format(2,''));
	setText('TVD_HORN_N_LESH_V_XP_HISTO_VALUE_12',getFltTag('TVD_HORN_N_LESH_V_XP_12').format(2,''));
	setText('TVD_HORN_N_LESH_V_XP_HISTO_VALUE_13',getFltTag('TVD_HORN_N_LESH_V_XP_13').format(2,''));
	setText('TVD_HORN_N_LESH_V_XP_HISTO_VALUE_14',getFltTag('TVD_HORN_N_LESH_V_XP_14').format(2,''));
	setText('TVD_HORN_N_LESH_V_XP_HISTO_VALUE_15',getFltTag('TVD_HORN_N_LESH_V_XP_15').format(2,''));

	setText('TVD_LESH_V_N_XP_HISTO_VALUE_3',getFltTag('TVD_LESH_V_N_XP_3').format(2,''));
	setText('TVD_LESH_V_N_XP_HISTO_VALUE_4',getFltTag('TVD_LESH_V_N_XP_4').format(2,''));
	setText('TVD_LESH_V_N_XP_HISTO_VALUE_5',getFltTag('TVD_LESH_V_N_XP_5').format(2,''));
	setText('TVD_LESH_V_N_XP_HISTO_VALUE_6',getFltTag('TVD_LESH_V_N_XP_6').format(2,''));
	setText('TVD_LESH_V_N_XP_HISTO_VALUE_7',getFltTag('TVD_LESH_V_N_XP_7').format(2,''));
	setText('TVD_LESH_V_N_XP_HISTO_VALUE_8',getFltTag('TVD_LESH_V_N_XP_8').format(2,''));
	setText('TVD_LESH_V_N_XP_HISTO_VALUE_9',getFltTag('TVD_LESH_V_N_XP_9').format(2,''));
	setText('TVD_LESH_V_N_XP_HISTO_VALUE_10',getFltTag('TVD_LESH_V_N_XP_10').format(2,''));
	setText('TVD_LESH_V_N_XP_HISTO_VALUE_11',getFltTag('TVD_LESH_V_N_XP_11').format(2,''));
	setText('TVD_LESH_V_N_XP_HISTO_VALUE_12',getFltTag('TVD_LESH_V_N_XP_12').format(2,''));
	setText('TVD_LESH_V_N_XP_HISTO_VALUE_13',getFltTag('TVD_LESH_V_N_XP_13').format(2,''));
	setText('TVD_LESH_V_N_XP_HISTO_VALUE_14',getFltTag('TVD_LESH_V_N_XP_14').format(2,''));
	setText('TVD_LESH_V_N_XP_HISTO_VALUE_15',getFltTag('TVD_LESH_V_N_XP_15').format(2,''));

	setAttr('TVD_HORN_V_N_XP_HISTO_3','width',checkLimits(200*getFltTag('TVD_HORN_V_N_XP_3')/50));
	setAttr('TVD_HORN_V_N_XP_HISTO_4','width',checkLimits(200*getFltTag('TVD_HORN_V_N_XP_4')/50));
	setAttr('TVD_HORN_V_N_XP_HISTO_5','width',checkLimits(200*getFltTag('TVD_HORN_V_N_XP_5')/50));
	setAttr('TVD_HORN_V_N_XP_HISTO_6','width',checkLimits(200*getFltTag('TVD_HORN_V_N_XP_6')/50));
	setAttr('TVD_HORN_V_N_XP_HISTO_7','width',checkLimits(200*getFltTag('TVD_HORN_V_N_XP_7')/50));
	setAttr('TVD_HORN_V_N_XP_HISTO_8','width',checkLimits(200*getFltTag('TVD_HORN_V_N_XP_8')/50));
	setAttr('TVD_HORN_V_N_XP_HISTO_9','width',checkLimits(200*getFltTag('TVD_HORN_V_N_XP_9')/50));
	setAttr('TVD_HORN_V_N_XP_HISTO_10','width',checkLimits(200*getFltTag('TVD_HORN_V_N_XP_10')/50));
	setAttr('TVD_HORN_V_N_XP_HISTO_11','width',checkLimits(200*getFltTag('TVD_HORN_V_N_XP_11')/50));
	setAttr('TVD_HORN_V_N_XP_HISTO_12','width',checkLimits(200*getFltTag('TVD_HORN_V_N_XP_12')/50));
	setAttr('TVD_HORN_V_N_XP_HISTO_13','width',checkLimits(200*getFltTag('TVD_HORN_V_N_XP_13')/50));
	setAttr('TVD_HORN_V_N_XP_HISTO_14','width',checkLimits(200*getFltTag('TVD_HORN_V_N_XP_14')/50));
	setAttr('TVD_HORN_V_N_XP_HISTO_15','width',checkLimits(200*getFltTag('TVD_HORN_V_N_XP_15')/50));


	setAttr('TVD_HORN_N_LESH_V_XP_HISTO_3','width',checkLimits(200*getFltTag('TVD_HORN_N_LESH_V_XP_3')/50));
	setAttr('TVD_HORN_N_LESH_V_XP_HISTO_4','width',checkLimits(200*getFltTag('TVD_HORN_N_LESH_V_XP_4')/50));
	setAttr('TVD_HORN_N_LESH_V_XP_HISTO_5','width',checkLimits(200*getFltTag('TVD_HORN_N_LESH_V_XP_5')/50));
	setAttr('TVD_HORN_N_LESH_V_XP_HISTO_6','width',checkLimits(200*getFltTag('TVD_HORN_N_LESH_V_XP_6')/50));
	setAttr('TVD_HORN_N_LESH_V_XP_HISTO_7','width',checkLimits(200*getFltTag('TVD_HORN_N_LESH_V_XP_7')/50));
	setAttr('TVD_HORN_N_LESH_V_XP_HISTO_8','width',checkLimits(200*getFltTag('TVD_HORN_N_LESH_V_XP_8')/50));
	setAttr('TVD_HORN_N_LESH_V_XP_HISTO_9','width',checkLimits(200*getFltTag('TVD_HORN_N_LESH_V_XP_9')/50));
	setAttr('TVD_HORN_N_LESH_V_XP_HISTO_10','width',checkLimits(200*getFltTag('TVD_HORN_N_LESH_V_XP_10')/50));
	setAttr('TVD_HORN_N_LESH_V_XP_HISTO_11','width',checkLimits(200*getFltTag('TVD_HORN_N_LESH_V_XP_11')/50));
	setAttr('TVD_HORN_N_LESH_V_XP_HISTO_12','width',checkLimits(200*getFltTag('TVD_HORN_N_LESH_V_XP_12')/50));
	setAttr('TVD_HORN_N_LESH_V_XP_HISTO_13','width',checkLimits(200*getFltTag('TVD_HORN_N_LESH_V_XP_13')/50));
	setAttr('TVD_HORN_N_LESH_V_XP_HISTO_14','width',checkLimits(200*getFltTag('TVD_HORN_N_LESH_V_XP_14')/50));
	setAttr('TVD_HORN_N_LESH_V_XP_HISTO_15','width',checkLimits(200*getFltTag('TVD_HORN_N_LESH_V_XP_15')/50));

	setAttr('TVD_LESH_V_N_XP_HISTO_3','width',checkLimits(200*getFltTag('TVD_LESH_V_N_XP_3')/50));
	setAttr('TVD_LESH_V_N_XP_HISTO_4','width',checkLimits(200*getFltTag('TVD_LESH_V_N_XP_4')/50));
	setAttr('TVD_LESH_V_N_XP_HISTO_5','width',checkLimits(200*getFltTag('TVD_LESH_V_N_XP_5')/50));
	setAttr('TVD_LESH_V_N_XP_HISTO_6','width',checkLimits(200*getFltTag('TVD_LESH_V_N_XP_6')/50));
	setAttr('TVD_LESH_V_N_XP_HISTO_7','width',checkLimits(200*getFltTag('TVD_LESH_V_N_XP_7')/50));
	setAttr('TVD_LESH_V_N_XP_HISTO_8','width',checkLimits(200*getFltTag('TVD_LESH_V_N_XP_8')/50));
	setAttr('TVD_LESH_V_N_XP_HISTO_9','width',checkLimits(200*getFltTag('TVD_LESH_V_N_XP_9')/50));
	setAttr('TVD_LESH_V_N_XP_HISTO_10','width',checkLimits(200*getFltTag('TVD_LESH_V_N_XP_10')/50));
	setAttr('TVD_LESH_V_N_XP_HISTO_11','width',checkLimits(200*getFltTag('TVD_LESH_V_N_XP_11')/50));
	setAttr('TVD_LESH_V_N_XP_HISTO_12','width',checkLimits(200*getFltTag('TVD_LESH_V_N_XP_12')/50));
	setAttr('TVD_LESH_V_N_XP_HISTO_13','width',checkLimits(200*getFltTag('TVD_LESH_V_N_XP_13')/50));
	setAttr('TVD_LESH_V_N_XP_HISTO_14','width',checkLimits(200*getFltTag('TVD_LESH_V_N_XP_14')/50));
	setAttr('TVD_LESH_V_N_XP_HISTO_15','width',checkLimits(200*getFltTag('TVD_LESH_V_N_XP_15')/50));

	setText('TVD_HISTO_VALUE_3_29C',getFltTag('TVD_3_29C').format(2,''));
	setText('TVD_HISTO_VALUE_3_25C',getFltTag('TVD_3_25C').format(2,''));
	setText('TVD_HISTO_VALUE_3_21C',getFltTag('TVD_3_21C').format(2,''));
	setText('TVD_HISTO_VALUE_3_7C',getFltTag('TVD_3_7C').format(2,''));
	setText('TVD_HISTO_VALUE_3_2C',getFltTag('TVD_3_2C').format(2,''));
	setText('TVD_HISTO_VALUE_2_23C',getFltTag('TVD_2_23C').format(2,''));
	setText('TVD_HISTO_VALUE_2_17C',getFltTag('TVD_2_17C').format(2,''));
	setText('TVD_HISTO_VALUE_2_12C',getFltTag('TVD_2_12C').format(2,''));
	setText('TVD_HISTO_VALUE_2_9C',getFltTag('TVD_2_9C').format(2,''));
	setText('TVD_HISTO_VALUE_2_8C',getFltTag('TVD_2_8C').format(2,''));
	setText('TVD_HISTO_VALUE_2_18C',getFltTag('TVD_2_18C').format(2,''));
	setText('TVD_HISTO_VALUE_2_25C',getFltTag('TVD_2_25C').format(2,''));
	setText('TVD_HISTO_VALUE_2_3C',getFltTag('TVD_2_3C').format(2,''));
	setText('TVD_COL_HISTO_VALUE_2',getFltTag('TVD_COL_2').format(2,''));
	setText('TVD_COL_HISTO_VALUE_3',getFltTag('TVD_COL_3').format(2,''));

	setAttr('TVD_HISTO_3_29C','width',checkLimits(200*getFltTag('TVD_3_29C')/50));
	setAttr('TVD_HISTO_3_25C','width',checkLimits(200*getFltTag('TVD_3_25C')/50));
	setAttr('TVD_HISTO_3_21C','width',checkLimits(200*getFltTag('TVD_3_21C')/50));
	setAttr('TVD_HISTO_3_7C','width',checkLimits(200*getFltTag('TVD_3_7C')/50));
	setAttr('TVD_HISTO_3_2C','width',checkLimits(200*getFltTag('TVD_3_2C')/50));
	setAttr('TVD_HISTO_2_23C','width',checkLimits(200*getFltTag('TVD_2_23C')/50));
	setAttr('TVD_HISTO_2_17C','width',checkLimits(200*getFltTag('TVD_2_17C')/50));
	setAttr('TVD_HISTO_2_12C','width',checkLimits(200*getFltTag('TVD_2_12C')/50));
	setAttr('TVD_HISTO_2_9C','width',checkLimits(200*getFltTag('TVD_2_9C')/50));
	setAttr('TVD_HISTO_2_8C','width',checkLimits(200*getFltTag('TVD_2_8C')/50));
	setAttr('TVD_HISTO_2_18C','width',checkLimits(200*getFltTag('TVD_2_18C')/50));
	setAttr('TVD_HISTO_2_25C','width',checkLimits(200*getFltTag('TVD_2_25C')/50));
	setAttr('TVD_HISTO_2_3C','width',checkLimits(200*getFltTag('TVD_2_3C')/50));
	setAttr('TVD_COL_HISTO_2','width',checkLimits(200*getFltTag('TVD_COL_2')/50));
	setAttr('TVD_COL_HISTO_3','width',checkLimits(200*getFltTag('TVD_COL_3')/50));

	setText('FVD_HISTO_VALUE_3_29C',getFltTag('FVD_3_29C').format(2,''));
	setText('FVD_HISTO_VALUE_3_25C',getFltTag('FVD_3_25C').format(2,''));
	setText('FVD_HISTO_VALUE_3_21C',getFltTag('FVD_3_21C').format(2,''));
	setText('FVD_HISTO_VALUE_3_7C',getFltTag('FVD_3_7C').format(2,''));
	setText('FVD_HISTO_VALUE_3_2C',getFltTag('FVD_3_2C').format(2,''));
	setText('FVD_HISTO_VALUE_2_23C',getFltTag('FVD_2_23C').format(2,''));
	setText('FVD_HISTO_VALUE_2_17C',getFltTag('FVD_2_17C').format(2,''));
	setText('FVD_HISTO_VALUE_2_12C',getFltTag('FVD_2_12C').format(2,''));
	setText('FVD_HISTO_VALUE_2_9C',getFltTag('FVD_2_9C').format(2,''));
	setText('FVD_HISTO_VALUE_2_8C',getFltTag('FVD_2_8C').format(2,''));
	setText('FVD_HISTO_VALUE_2_18C',getFltTag('FVD_2_18C').format(2,''));
	setText('FVD_HISTO_VALUE_2_25C',getFltTag('FVD_2_25C').format(2,''));
	setText('FVD_HISTO_VALUE_2_3C',getFltTag('FVD_2_3C').format(2,''));

	setAttr('FVD_HISTO_3_29C','width',checkLimits(200*(getFltTag('FVD_3_29C')-0.4)/14.6));
	setAttr('FVD_HISTO_3_25C','width',checkLimits(200*(getFltTag('FVD_3_25C')-0.4)/14.6));
	setAttr('FVD_HISTO_3_21C','width',checkLimits(200*(getFltTag('FVD_3_21C')-0.4)/14.6));
	setAttr('FVD_HISTO_3_7C','width',checkLimits(200*(getFltTag('FVD_3_7C')-0.4)/14.6));
	setAttr('FVD_HISTO_3_2C','width',checkLimits(200*(getFltTag('FVD_3_2C')-0.4)/14.6));
	setAttr('FVD_HISTO_2_23C','width',checkLimits(200*(getFltTag('FVD_2_23C')-0.4)/14.6));
	setAttr('FVD_HISTO_2_17C','width',checkLimits(200*(getFltTag('FVD_2_17C')-0.4)/14.6));
	setAttr('FVD_HISTO_2_12C','width',checkLimits(200*(getFltTag('FVD_2_12C')-0.4)/14.6));
	setAttr('FVD_HISTO_2_9C','width',checkLimits(200*(getFltTag('FVD_2_9C')-0.4)/14.6));
	setAttr('FVD_HISTO_2_8C','width',checkLimits(200*(getFltTag('FVD_2_8C')-0.4)/14.6));
	setAttr('FVD_HISTO_2_18C','width',checkLimits(200*(getFltTag('FVD_2_18C')-0.4)/14.6));
	setAttr('FVD_HISTO_2_25C','width',checkLimits(200*(getFltTag('FVD_2_25C')-0.4)/14.6));
	setAttr('FVD_HISTO_2_3C','width',checkLimits(200*(getFltTag('FVD_2_3C')-0.4)/14.6));


	animateAlarmBackStroke('TVD_HORN_V_N_XP_3');
	animateAlarmBackStroke('TVD_HORN_V_N_XP_4');
	animateAlarmBackStroke('TVD_HORN_V_N_XP_5');
	animateAlarmBackStroke('TVD_HORN_V_N_XP_6');
	animateAlarmBackStroke('TVD_HORN_V_N_XP_7');
	animateAlarmBackStroke('TVD_HORN_V_N_XP_8');
	animateAlarmBackStroke('TVD_HORN_V_N_XP_9');
	animateAlarmBackStroke('TVD_HORN_V_N_XP_10');
	animateAlarmBackStroke('TVD_HORN_V_N_XP_11');
	animateAlarmBackStroke('TVD_HORN_V_N_XP_12');
	animateAlarmBackStroke('TVD_HORN_V_N_XP_13');
	animateAlarmBackStroke('TVD_HORN_V_N_XP_14');
	animateAlarmBackStroke('TVD_HORN_V_N_XP_15');

	animateAlarmBackStroke('TVD_HORN_N_LESH_V_XP_3');
	animateAlarmBackStroke('TVD_HORN_N_LESH_V_XP_4');
	animateAlarmBackStroke('TVD_HORN_N_LESH_V_XP_5');
	animateAlarmBackStroke('TVD_HORN_N_LESH_V_XP_6');
	animateAlarmBackStroke('TVD_HORN_N_LESH_V_XP_7');
	animateAlarmBackStroke('TVD_HORN_N_LESH_V_XP_8');
	animateAlarmBackStroke('TVD_HORN_N_LESH_V_XP_9');
	animateAlarmBackStroke('TVD_HORN_N_LESH_V_XP_10');
	animateAlarmBackStroke('TVD_HORN_N_LESH_V_XP_11');
	animateAlarmBackStroke('TVD_HORN_N_LESH_V_XP_12');
	animateAlarmBackStroke('TVD_HORN_N_LESH_V_XP_13');
	animateAlarmBackStroke('TVD_HORN_N_LESH_V_XP_14');
	animateAlarmBackStroke('TVD_HORN_N_LESH_V_XP_15');

	animateAlarmBackStroke('TVD_LESH_V_N_XP_3');
	animateAlarmBackStroke('TVD_LESH_V_N_XP_4');
	animateAlarmBackStroke('TVD_LESH_V_N_XP_5');
	animateAlarmBackStroke('TVD_LESH_V_N_XP_6');
	animateAlarmBackStroke('TVD_LESH_V_N_XP_7');
	animateAlarmBackStroke('TVD_LESH_V_N_XP_8');
	animateAlarmBackStroke('TVD_LESH_V_N_XP_9');
	animateAlarmBackStroke('TVD_LESH_V_N_XP_10');
	animateAlarmBackStroke('TVD_LESH_V_N_XP_11');
	animateAlarmBackStroke('TVD_LESH_V_N_XP_12');
	animateAlarmBackStroke('TVD_LESH_V_N_XP_13');
	animateAlarmBackStroke('TVD_LESH_V_N_XP_14');
	animateAlarmBackStroke('TVD_LESH_V_N_XP_15');

	animateAlarmBackStroke('FVD_3_29C');
	animateAlarmBackStroke('FVD_3_25C');
	animateAlarmBackStroke('FVD_3_21C');
	animateAlarmBackStroke('FVD_3_7C');
	animateAlarmBackStroke('FVD_3_2C');
	animateAlarmBackStroke('FVD_2_23C');
	animateAlarmBackStroke('FVD_2_17C');
	animateAlarmBackStroke('FVD_2_12C');
	animateAlarmBackStroke('FVD_2_9C');
	animateAlarmBackStroke('FVD_2_8C');
	animateAlarmBackStroke('FVD_2_18C');
	animateAlarmBackStroke('FVD_2_25C');
	animateAlarmBackStroke('FVD_2_3C');
	
	animateAlarmBackStroke('TVD_3_29C');
	animateAlarmBackStroke('TVD_3_25C');
	animateAlarmBackStroke('TVD_3_21C');
	animateAlarmBackStroke('TVD_3_7C');
	animateAlarmBackStroke('TVD_3_2C');
	animateAlarmBackStroke('TVD_2_23C');
	animateAlarmBackStroke('TVD_2_17C');
	animateAlarmBackStroke('TVD_2_12C');
	animateAlarmBackStroke('TVD_2_9C');
	animateAlarmBackStroke('TVD_2_8C');
	animateAlarmBackStroke('TVD_2_18C');
	animateAlarmBackStroke('TVD_2_25C');
	animateAlarmBackStroke('TVD_2_3C');
	animateAlarmBackStroke('TVD_COL_2');
	animateAlarmBackStroke('TVD_COL_3');

	animateAlarmFill('TVD_HORN_V_N_XP_HISTO_3','TVD_HORN_V_N_XP_3');
	animateAlarmFill('TVD_HORN_V_N_XP_HISTO_4','TVD_HORN_V_N_XP_4');
	animateAlarmFill('TVD_HORN_V_N_XP_HISTO_5','TVD_HORN_V_N_XP_5');
	animateAlarmFill('TVD_HORN_V_N_XP_HISTO_6','TVD_HORN_V_N_XP_6');
	animateAlarmFill('TVD_HORN_V_N_XP_HISTO_7','TVD_HORN_V_N_XP_7');
	animateAlarmFill('TVD_HORN_V_N_XP_HISTO_8','TVD_HORN_V_N_XP_8');
	animateAlarmFill('TVD_HORN_V_N_XP_HISTO_9','TVD_HORN_V_N_XP_9');
	animateAlarmFill('TVD_HORN_V_N_XP_HISTO_10','TVD_HORN_V_N_XP_10');
	animateAlarmFill('TVD_HORN_V_N_XP_HISTO_11','TVD_HORN_V_N_XP_11');
	animateAlarmFill('TVD_HORN_V_N_XP_HISTO_12','TVD_HORN_V_N_XP_12');
	animateAlarmFill('TVD_HORN_V_N_XP_HISTO_13','TVD_HORN_V_N_XP_13');
	animateAlarmFill('TVD_HORN_V_N_XP_HISTO_14','TVD_HORN_V_N_XP_14');
	animateAlarmFill('TVD_HORN_V_N_XP_HISTO_15','TVD_HORN_V_N_XP_15');


	animateAlarmFill('TVD_HORN_N_LESH_V_XP_HISTO_3','TVD_HORN_N_LESH_V_XP_3');
	animateAlarmFill('TVD_HORN_N_LESH_V_XP_HISTO_4','TVD_HORN_N_LESH_V_XP_4');
	animateAlarmFill('TVD_HORN_N_LESH_V_XP_HISTO_5','TVD_HORN_N_LESH_V_XP_5');
	animateAlarmFill('TVD_HORN_N_LESH_V_XP_HISTO_6','TVD_HORN_N_LESH_V_XP_6');
	animateAlarmFill('TVD_HORN_N_LESH_V_XP_HISTO_7','TVD_HORN_N_LESH_V_XP_7');
	animateAlarmFill('TVD_HORN_N_LESH_V_XP_HISTO_8','TVD_HORN_N_LESH_V_XP_8');
	animateAlarmFill('TVD_HORN_N_LESH_V_XP_HISTO_9','TVD_HORN_N_LESH_V_XP_9');
	animateAlarmFill('TVD_HORN_N_LESH_V_XP_HISTO_10','TVD_HORN_N_LESH_V_XP_10');
	animateAlarmFill('TVD_HORN_N_LESH_V_XP_HISTO_11','TVD_HORN_N_LESH_V_XP_11');
	animateAlarmFill('TVD_HORN_N_LESH_V_XP_HISTO_12','TVD_HORN_N_LESH_V_XP_12');
	animateAlarmFill('TVD_HORN_N_LESH_V_XP_HISTO_13','TVD_HORN_N_LESH_V_XP_13');
	animateAlarmFill('TVD_HORN_N_LESH_V_XP_HISTO_14','TVD_HORN_N_LESH_V_XP_14');
	animateAlarmFill('TVD_HORN_N_LESH_V_XP_HISTO_15','TVD_HORN_N_LESH_V_XP_15');

	animateAlarmFill('TVD_LESH_V_N_XP_HISTO_3','TVD_LESH_V_N_XP_3');
	animateAlarmFill('TVD_LESH_V_N_XP_HISTO_4','TVD_LESH_V_N_XP_4');
	animateAlarmFill('TVD_LESH_V_N_XP_HISTO_5','TVD_LESH_V_N_XP_5');
	animateAlarmFill('TVD_LESH_V_N_XP_HISTO_6','TVD_LESH_V_N_XP_6');
	animateAlarmFill('TVD_LESH_V_N_XP_HISTO_7','TVD_LESH_V_N_XP_7');
	animateAlarmFill('TVD_LESH_V_N_XP_HISTO_8','TVD_LESH_V_N_XP_8');
	animateAlarmFill('TVD_LESH_V_N_XP_HISTO_9','TVD_LESH_V_N_XP_9');
	animateAlarmFill('TVD_LESH_V_N_XP_HISTO_10','TVD_LESH_V_N_XP_10');
	animateAlarmFill('TVD_LESH_V_N_XP_HISTO_11','TVD_LESH_V_N_XP_11');
	animateAlarmFill('TVD_LESH_V_N_XP_HISTO_12','TVD_LESH_V_N_XP_12');
	animateAlarmFill('TVD_LESH_V_N_XP_HISTO_13','TVD_LESH_V_N_XP_13');
	animateAlarmFill('TVD_LESH_V_N_XP_HISTO_14','TVD_LESH_V_N_XP_14');
	animateAlarmFill('TVD_LESH_V_N_XP_HISTO_15','TVD_LESH_V_N_XP_15');

	animateAlarmFill('TVD_HISTO_3_29C','TVD_3_29C');
	animateAlarmFill('TVD_HISTO_3_25C','TVD_3_25C');
	animateAlarmFill('TVD_HISTO_3_21C','TVD_3_21C');
	animateAlarmFill('TVD_HISTO_3_7C','TVD_3_7C');
	animateAlarmFill('TVD_HISTO_3_2C','TVD_3_2C');
	animateAlarmFill('TVD_HISTO_2_23C','TVD_2_23C');
	animateAlarmFill('TVD_HISTO_2_17C','TVD_2_17C');
	animateAlarmFill('TVD_HISTO_2_12C','TVD_2_12C');
	animateAlarmFill('TVD_HISTO_2_9C','TVD_2_9C');
	animateAlarmFill('TVD_HISTO_2_8C','TVD_2_8C');
	animateAlarmFill('TVD_HISTO_2_18C','TVD_2_18C');
	animateAlarmFill('TVD_HISTO_2_25C','TVD_2_25C');
	animateAlarmFill('TVD_HISTO_2_3C','TVD_2_3C');
	animateAlarmFill('TVD_COL_HISTO_2','TVD_COL_2');
	animateAlarmFill('TVD_COL_HISTO_3','TVD_COL_3');

	animateAlarmFill('FVD_HISTO_3_29C','FVD_3_29C');
	animateAlarmFill('FVD_HISTO_3_25C','FVD_3_25C');
	animateAlarmFill('FVD_HISTO_3_21C','FVD_3_21C');
	animateAlarmFill('FVD_HISTO_3_7C','FVD_3_7C');
	animateAlarmFill('FVD_HISTO_3_2C','FVD_3_2C');
	animateAlarmFill('FVD_HISTO_2_23C','FVD_2_23C');
	animateAlarmFill('FVD_HISTO_2_17C','FVD_2_17C');
	animateAlarmFill('FVD_HISTO_2_12C','FVD_2_12C');
	animateAlarmFill('FVD_HISTO_2_9C','FVD_2_9C');
	animateAlarmFill('FVD_HISTO_2_8C','FVD_2_8C');
	animateAlarmFill('FVD_HISTO_2_18C','FVD_2_18C');
	animateAlarmFill('FVD_HISTO_2_25C','FVD_2_25C');
	animateAlarmFill('FVD_HISTO_2_3C','FVD_2_3C');

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
