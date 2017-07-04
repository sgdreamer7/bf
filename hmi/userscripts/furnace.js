//////////////////////////////////////////////////////////////////////////////////////////////
// Автор: Владимир Щербина <vns.scherbina@gmail.com>
// copyright 2017
// Версия: 1.0.0
// Модуль furnace.js реализует анимацию и логику диалогового взаимодействия для видеокадра furnace.
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
var	FurnaceFramesMenu=[
		{text:'Аспирация',id:'AS',submenu:[
			{text:'Аспирация литейного двора',id:'asld.svg'},
			{text:'Аспирация бункерной эстакады',id:'asbe.svg'}
		]},
		{text:'САК разгара кладки шахты, горна и лещади печи',id:'CAK',submenu:[
			{text:'Диаграммы температур воды перемычках повязки холодильников ПУ-1, ПУ-6',id:'cak_pu1_pu6.svg'},
			{text:'Диаграммы температур воды перемычках повязки холодильников ПУ-2, ПУ-3',id:'cak_pu2_pu3.svg'},
			{text:'Диаграммы температур воды перемычках повязки холодильников ПУ-4, ПУ-5',id:'cak_pu4_pu5.svg'},
			{text:'Диаграммы температур воды охлаждения фурменной зоны',id:'cak_prog.svg'},
			{text:'Диаграммы температур воды в индивидуальных трубопроводах охлаждения холодильников чугунных леток',id:'cak_tap.svg'},
			{text:'Диаграммы температур воды в индивидуальных трубопроводах охлаждения холодильников донышка',id:'cak_bottom.svg'},
			{text:'Диаграммы температур тела холодильных плит по горизонтам',id:'thpl.svg'},
			{text:'Контроль температур по высоте печи',id:'temp.svg'},
			{text:'Температура периферийных газов, футеровки и гарнисажа шахты. Поперечный разрез ДП-4 (по оси наклонного моста).',id:'profile1.svg'},
			{text:'Температура периферийных газов, футеровки и гарнисажа шахты. Продольный разрез ДП-4 (по оси литейного двора).',id:'profile2.svg'}
		]},
		{text:'Температуры сушки и кожуха главных желобов',id:'gelob.svg'},
		{text:'Параметры СИО печи №1',id:'sio1.svg'},
		{text:'Параметры СИО печи №2',id:'sio2.svg'},
		{text:'Контроль подачи и распределения по фурмам природного газа, состояние фурм',id:'fpg_horn.svg'},
		{text:'Контроль прогара фурм',id:'prog.svg'},
		{text:'Параметры энергоносителей',id:'energo.svg'}
	];




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
	init_buttons_menu();
	setButton('FURNACE_BUTTON','local_furnace_click();');
	
	setHighlightButton('ZDN_PKG_BUTTON','changeRefValue(\'ZDN_PKG\',0.5,2.0,\'Задание давления колошникового газа\');');
	setImmediateButton('PKG_MAN_MIN_BUTTON','setBoolTag(\'PKG_MAN_MIN\',true);','setBoolTag(\'PKG_MAN_MIN\',false);');
	setImmediateButton('PKG_MAN_MAX_BUTTON','setBoolTag(\'PKG_MAN_MAX\',true);','setBoolTag(\'PKG_MAN_MAX\',false);');
	setHighlightButton('PKG_REGR_BUTTON','clickModeButton(\'PKG\',\'давлением КГ\');');
	setHighlightButton('ZDN_TGD_BUTTON','changeRefValue(\'ZDN_TGD\',700.0,1300.0,\'Задание температуры горячего дутья\');');
	setImmediateButton('TGD_MAN_MIN_BUTTON','setBoolTag(\'TGD_MAN_MIN\',true);','setBoolTag(\'TGD_MAN_MIN\',false);');
	setImmediateButton('TGD_MAN_MAX_BUTTON','setBoolTag(\'TGD_MAN_MAX\',true);','setBoolTag(\'TGD_MAN_MAX\',false);');
	setHighlightButton('TGD_REGR_BUTTON','clickModeButton(\'TGD\',\'температурой ГД\');');
	setHighlightButton('ZDN_FPR_HD_BUTTON','changeRefValue(\'ZDN_FPR_HD\',0.500,3.500,\'Задание расхода пара на увлажнение дутья\');');
	setHighlightButton('ZDN_MHD_BUTTON','changeRefValue(\'ZDN_MHD\',5.0,35.0,\'Задание влажности холодного дутья\');');
	setImmediateButton('MHD_MAN_MIN_BUTTON','setBoolTag(\'MHD_MAN_MIN\',true);','setBoolTag(\'MHD_MAN_MIN\',false);');
	setImmediateButton('MHD_MAN_MAX_BUTTON','setBoolTag(\'MHD_MAN_MAX\',true);','setBoolTag(\'MHD_MAN_MAX\',false);');
	setHighlightButton('MHD_REGR_BUTTON','clickModeButton2(1);');
	setHighlightButton('MHD_REGR_2_BUTTON','clickModeButton2(2);');
	setHighlightButton('MHD_REGR_3_BUTTON','clickModeButton2(0);');
	setHighlightButton('ZDN_PG_HD_BUTTON','changeRefValue(\'ZDN_PG_HD\',0.0,15.0,\'Задание соотношения расхода природного газа и расхода золодного дутья\');');
	setHighlightButton('ZDN_FPG_HD_BUTTON','changeRefValue(\'ZDN_FPG_HD\',0.0,20000.0,\'Задание расхода природного газа на печь\');');
	setHighlightButton('FPG_HD_REGR_BUTTON','clickModeButton3(1);');
	setHighlightButton('FPG_HD_REGR_2_BUTTON','clickModeButton3(2);');
	setHighlightButton('FPG_HD_REGR_3_BUTTON','clickModeButton3(0);');
	setImmediateButton('FPG_HD_MAN_MIN_BUTTON','setBoolTag(\'FPG_HD_MAN_MIN\',true);','setBoolTag(\'FPG_HD_MAN_MIN\',false);');
	setImmediateButton('FPG_HD_MAN_MAX_BUTTON','setBoolTag(\'FPG_HD_MAN_MAX\',true);','setBoolTag(\'FPG_HD_MAN_MAX\',false);');
	

	setHighlightButton('PR_TRENDS_BUTTON','showTrendByID(\'PR_TRENDS\');');
	setHighlightButton('AZ_TRENDS_BUTTON','showTrendByID(\'AZ_TRENDS\');');
	setHighlightButton('TPP_TRENDS_BUTTONS','showTrendByID(\'TPP_TRENDS\');');
	setHighlightButton('TKG_TRENDS_BUTTON','showTrendByID(\'TKG_TRENDS\');');
	setHighlightButton('GELOB_1_TRENDS_BUTTON','showTrendByID(\'GELOB_1_TRENDS\');');
	setHighlightButton('GELOB_2_TRENDS_BUTTON','showTrendByID(\'GELOB_2_TRENDS\');');
	setHighlightButton('PKG_TRENDS_BUTTON','showTrendByID(\'PKG_TRENDS\');');
	setHighlightButton('PKG_ZAG_TRENDS_BUTTON','showTrendByID(\'PKG_ZAG_TRENDS\');');
	setHighlightButton('PD_TRENDS_BUTTON','showTrendByID(\'PD_TRENDS\');');
	setHighlightButton('CHARGE_LEVEL_L_TRENDS_BUTTON','showTrendByID(\'CHARGE_LEVEL_L_TRENDS\');');
	setHighlightButton('CHARGE_LEVEL_R_TRENDS_BUTTON','showTrendByID(\'CHARGE_LEVEL_R_TRENDS\');');
	setHighlightButton('CHARGE_LEVEL_SPEED_L_TRENDS','showTrendByID(\'CHARGE_LEVEL_SPEED_L_TRENDS\');');
	setHighlightButton('CHARGE_LEVEL_SPEED_R_TRENDS','showTrendByID(\'CHARGE_LEVEL_SPEED_R_TRENDS\');');
	setHighlightButton('TCHUG_TRENDS_BUTTON','showTrendByID(\'TCHUG_TRENDS\');');
	setHighlightButton('PG_HD_TRENDS_BUTTON','showTrendByID(\'PG_HD_TRENDS\');');
	setHighlightButton('DG_TRENDS_BUTTON','showTrendByID(\'DG_TRENDS\');');
	setHighlightButton('PR_HD_TRENDS_BUTTON','showTrendByID(\'PR_HD_TRENDS\');');
	setHighlightButton('GD_HD_TRENDS_1_BUTTON','showTrendByID(\'GD_HD_TRENDS\');');
	setHighlightButton('GD_HD_TRENDS_2_BUTTON','showTrendByID(\'GD_HD_TRENDS\');');
	setHighlightButton('VD_TRENDS_BUTTON','showTrendByID(\'VD_TRENDS\');');
	setHighlightButton('VD_TRENDS_BUTTON','showTrendByID(\'VD_TRENDS\');');
	setHighlightButton('CHARGE_LEVEL_L_TRENDS_BUTTON','showTrendByID(\'CHARGE_LEVEL_L_TRENDS\');');
	setHighlightButton('CHARGE_LEVEL_R_TRENDS_BUTTON','showTrendByID(\'CHARGE_LEVEL_R_TRENDS\');');
	setHighlightButton('CHARGE_LEVEL_SPEED_L_TRENDS','showTrendByID(\'CHARGE_LEVEL_SPEED_L_TRENDS\');');
	setHighlightButton('CHARGE_LEVEL_SPEED_R_TRENDS','showTrendByID(\'CHARGE_LEVEL_SPEED_R_TRENDS\');');

	setHighlightButton('PROFILE1_BUTTON','openFrame(\'profile1.svg\');');
	setHighlightButton('PROFILE2_BUTTON','openFrame(\'profile2.svg\');');
	setHighlightButton('THPL_1_BUTTON','openFrameWithParameters(\'thpl.svg\',\'selector=1;\');');
	setHighlightButton('THPL_2_BUTTON','openFrameWithParameters(\'thpl.svg\',\'selector=2;\');');
	setHighlightButton('THPL_3_BUTTON','openFrameWithParameters(\'thpl.svg\',\'selector=3;\');');
	setHighlightButton('THPL_4_BUTTON','openFrameWithParameters(\'thpl.svg\',\'selector=4;\');');
	setHighlightButton('THPL_5_BUTTON','openFrameWithParameters(\'thpl.svg\',\'selector=5;\');');
	setHighlightButton('THPL_6_BUTTON','openFrameWithParameters(\'thpl.svg\',\'selector=6;\');');
	setHighlightButton('GELOB_BUTTON','openFrame(\'gelob.svg\');');
	setHighlightButton('CAK_PROG_BUTTON','openFrame(\'cak_prog.svg\');');
	setHighlightButton('CAK_TAP_BUTTON','openFrame(\'cak_tap.svg\');');
	setHighlightButton('CAK_BOTTOM_BUTTON','openFrame(\'cak_bottom.svg\');');
	setHighlightButton('CAK_PU1_PU6_BUTTON','openFrame(\'cak_pu1_pu6.svg\');');
	setHighlightButton('CAK_PU2_PU3_BUTTON','openFrame(\'cak_pu2_pu3.svg\');');
	setHighlightButton('CAK_PU4_PU5_BUTTON','openFrame(\'cak_pu4_pu5.svg\');');
	setHighlightButton('TSHA_1_BUTTON','openFrameWithParameters(\'temp.svg\',\'selector=8;\');');
	setHighlightButton('TSHA_2_BUTTON','openFrameWithParameters(\'temp.svg\',\'selector=9;\');');
	setHighlightButton('TSHA_3_BUTTON','openFrameWithParameters(\'temp.svg\',\'selector=10;\');');
	setHighlightButton('TSHA_4_BUTTON','openFrameWithParameters(\'temp.svg\',\'selector=11;\');');
	setHighlightButton('TSHA_5_BUTTON','openFrameWithParameters(\'temp.svg\',\'selector=12;\');');
	setHighlightButton('TBOT_1_BUTTON','openFrameWithParameters(\'temp.svg\',\'selector=13;\');');
	setHighlightButton('TBOT_2_BUTTON','openFrameWithParameters(\'temp.svg\',\'selector=14;\');');
	setHighlightButton('TBOT_3_BUTTON','openFrameWithParameters(\'temp.svg\',\'selector=15;\');');
	setHighlightButton('TBOT_4_BUTTON','openFrameWithParameters(\'temp.svg\',\'selector=16;\');');
	setHighlightButton('TBOT_5_BUTTON','openFrameWithParameters(\'temp.svg\',\'selector=17;\');');
	setHighlightButton('TBOT_6_BUTTON','openFrameWithParameters(\'temp.svg\',\'selector=18;\');');
	setHighlightButton('TBOT_7_BUTTON','openFrameWithParameters(\'temp.svg\',\'selector=19;\');');

	setHighlightButton('THPL_TRENDS_BUTTON','showTHPLTrendsMenu();');
	setHighlightButton('TSHA_TRENDS_BUTTON','showTSHATrendsMenu();');
	
	setHighlightButton('FPG_HORN_BUTTON','openFrame(\'fpg_horn.svg\');');
	
	setHighlightButton('IRON_TAP_BUTTON','showIronTapReport();');
	
	addKeyAction(local_furnace_click,KeyEvent.VK_F2,0);

	
	
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
	var FPR=getFltTag('FPR');
	var PPR=getFltTag('PPR');
	var TPR=getFltTag('TPR');
	var FAZ=getFltTag('FAZ');
	var PAZ=getFltTag('PAZ');
	var TAZ=getFltTag('TAZ');
	var QO2AZ=getFltTag('QO2AZ');
	var PKG_VMK=getFltTag('PKG_VMK');
	var PKG_NMK=getFltTag('PKG_NMK');
	var PKG_PK=getFltTag('PKG_PK');
	var PKG_V=getFltTag('PKG_V');
	var PKG_N=getFltTag('PKG_N');
	var PKG_O=getFltTag('PKG_O');
	var PDV=getFltTag('PDV');
	var PDO=getFltTag('PDO');
	var PDN=getFltTag('PDN');
	var TCHUG_1=getFltTag('TCHUG_1');
	var TCHUG_2=getFltTag('TCHUG_2');
	var TKG_1=getFltTag('TKG_1');
	var TKG_2=getFltTag('TKG_2');
	var TKG_3=getFltTag('TKG_3');
	var TKG_4=getFltTag('TKG_4');

	var TPP_MAX=getFltTag('TPP_1');
	var TPP_MIN=TPP_MAX;
	var TPP_AVG=TPP_MAX;
	var TPP_Q=1;
	var i=0;
	for (i=2; i<=16; i++) {
		var TPP_CUR=getFltTag('TPP_'+i.format(0,''));
		if (TPP_CUR>TPP_MAX) {
			TPP_MAX=TPP_CUR;
		}
		if (TPP_CUR<TPP_MIN) {
			TPP_MIN=TPP_CUR;
		}
		TPP_AVG=(TPP_AVG*TPP_Q+TPP_CUR)/(TPP_Q+1);
		TPP_Q++;
	}
	var TPP_DIF=TPP_MAX-TPP_MIN;

	// var TGELFUT_1_MAX=getFltTag('TGELFUT_1_1');
	// var TGELFUT_1_MIN=TGELFUT_1_MAX;
	// var TGELFUT_1_AVG=TGELFUT_1_MAX;
	// var TGELFUT_1_Q=1;
	// for (i=2; i<=5; i++) {
	// 	var TGELFUT_1_CUR=getFltTag('TGELFUT_1_'+i.format(0,''));
	// 	if (TGELFUT_1_CUR>TGELFUT_1_MAX) {
	// 		TGELFUT_1_MAX=TGELFUT_1_CUR;
	// 	}
	// 	if (TGELFUT_1_CUR<TGELFUT_1_MIN) {
	// 		TGELFUT_1_MIN=TGELFUT_1_CUR;
	// 	}
	// 	TGELFUT_1_AVG=(TGELFUT_1_AVG*TGELFUT_1_Q+TGELFUT_1_CUR)/(TGELFUT_1_Q+1);
	// 	TGELFUT_1_Q++;
	// }
	var TGELFUT_1_MAX=getFltTag('TGELKOG_1_4');
	var TGELFUT_1_MIN=TGELFUT_1_MAX;
	var TGELFUT_1_AVG=TGELFUT_1_MAX;
	var TGELFUT_1_Q=1;
	for (i=5; i<=6; i++) {
		var TGELFUT_1_CUR=getFltTag('TGELKOG_1_'+i.format(0,''));
		if (TGELFUT_1_CUR>TGELFUT_1_MAX) {
			TGELFUT_1_MAX=TGELFUT_1_CUR;
		}
		if (TGELFUT_1_CUR<TGELFUT_1_MIN) {
			TGELFUT_1_MIN=TGELFUT_1_CUR;
		}
		TGELFUT_1_AVG=(TGELFUT_1_AVG*TGELFUT_1_Q+TGELFUT_1_CUR)/(TGELFUT_1_Q+1);
		TGELFUT_1_Q++;
	}

	var TGELFUT_1_DIF=TGELFUT_1_MAX-TGELFUT_1_MIN;

	// var TGELFUT_2_MAX=getFltTag('TGELFUT_2_1');
	// var TGELFUT_2_MIN=TGELFUT_2_MAX;
	// var TGELFUT_2_AVG=TGELFUT_2_MAX;
	// var TGELFUT_2_Q=1;
	// for (i=2; i<=5; i++) {
	// 	var TGELFUT_2_CUR=getFltTag('TGELFUT_2_'+i.format(0,''));
	// 	if (TGELFUT_2_CUR>TGELFUT_2_MAX) {
	// 		TGELFUT_2_MAX=TGELFUT_2_CUR;
	// 	}
	// 	if (TGELFUT_2_CUR<TGELFUT_2_MIN) {
	// 		TGELFUT_2_MIN=TGELFUT_2_CUR;
	// 	}
	// 	TGELFUT_2_AVG=(TGELFUT_2_AVG*TGELFUT_2_Q+TGELFUT_2_CUR)/(TGELFUT_2_Q+1);
	// 	TGELFUT_2_Q++;
	// }
	var TGELFUT_2_MAX=getFltTag('TGELKOG_2_4');
	var TGELFUT_2_MIN=TGELFUT_2_MAX;
	var TGELFUT_2_AVG=TGELFUT_2_MAX;
	var TGELFUT_2_Q=1;
	for (i=5; i<=6; i++) {
		var TGELFUT_2_CUR=getFltTag('TGELKOG_2_'+i.format(0,''));
		if (TGELFUT_2_CUR>TGELFUT_2_MAX) {
			TGELFUT_2_MAX=TGELFUT_2_CUR;
		}
		if (TGELFUT_2_CUR<TGELFUT_2_MIN) {
			TGELFUT_2_MIN=TGELFUT_2_CUR;
		}
		TGELFUT_2_AVG=(TGELFUT_2_AVG*TGELFUT_2_Q+TGELFUT_2_CUR)/(TGELFUT_2_Q+1);
		TGELFUT_2_Q++;
	}

	var TGELFUT_2_DIF=TGELFUT_2_MAX-TGELFUT_2_MIN;
	
	var FPR_HD=getFltTag('FPR_HD');
	var PPR_HD=getFltTag('PPR_HD');
	var TPR_HD=getFltTag('TPR_HD');
	var FHD=getFltTag('FHD');
	var PHD=getFltTag('PHD');
	var THD=getFltTag('THD');
	var QO2HD=getFltTag('QO2HD');
	var MHD=getFltTag('MHD');
	var PGD=getFltTag('PGD');
	var TGD=getFltTag('TGD');
	var FPG_HD=getFltTag('FPG_HD');
	var PPG_HD=getFltTag('PPG_HD');
	var TPG_HD=getFltTag('TPG_HD');
	var GKG=getFltTag('GKG');
	var GPG=getFltTag('GPG_HD');
	var GMHD=getFltTag('GMHD');
	var GGD=getFltTag('GGD');
	var FVD_1=getFltTag('FVD_1');
	var FVD_2=getFltTag('FVD_2');
	var PVD_1=getFltTag('PVD_1');
	var PVD_2=getFltTag('PVD_2');


	setStyle('PKG_AUTO_BACK','fill',getBoolTag('PKG_AUTO') ? 'rgb(0,255,0)' : 'rgb(127,127,127)');
	setStyle('PKG_MAN_BACK','fill',getBoolTag('PKG_MAN') ? 'rgb(0,255,0)' : 'rgb(127,127,127)');
	setText('PKG_REGR',getBoolTag('PKG_REGR') ? 'А' : 'Д' );

	setStyle('TGD_AUTO_BACK','fill',getBoolTag('TGD_AUTO') ? 'rgb(0,255,0)' : 'rgb(127,127,127)');
	setStyle('TGD_MAN_BACK','fill',getBoolTag('TGD_MAN') ? 'rgb(0,255,0)' : 'rgb(127,127,127)');
	setText('TGD_REGR',getBoolTag('TGD_REGR') ? 'А' : 'Д' );


	setText('CHARGE_LEVEL_L',getFltTag('CHARGE_LEVEL_L').format(2,''));
	setText('CHARGE_LEVEL_R',getFltTag('CHARGE_LEVEL_R').format(2,''));
	setText('CHARGE_LEVEL_SPEED_L',getFltTag('CHARGE_LEVEL_SPEED_L').format(1,''));
	setText('CHARGE_LEVEL_SPEED_R',getFltTag('CHARGE_LEVEL_SPEED_R').format(1,''));
	setText('FPR',FPR.format(1,''));
	setText('PPR',PPR.format(2,''));
	setText('TPR',TPR.format(0,''));
	setText('FAZ',FAZ.format(0,''));
	setText('PAZ',PAZ.format(1,''));
	setText('TAZ',TAZ.format(0,''));
	setText('QO2AZ',QO2AZ.format(1,''));
	setText('PKG_VMK',PKG_VMK.format(2,''));
	setText('PKG_NMK',PKG_NMK.format(2,''));
	setText('PKG_PK',PKG_PK.format(2,''));
	setText('PKG_V',PKG_V.format(2,''));
	setText('PKG_N',PKG_N.format(0,''));
	setText('PKG_O',PKG_O.format(1,''));
	setText('PDV',PDV.format(2,''));
	setText('PDO',PDO.format(2,''));
	setText('PDN',PDN.format(2,''));
	setText('TCHUG_1',TCHUG_1.format(0,''));
	setText('TCHUG_2',TCHUG_2.format(0,''));
	setText('TKG_1',TKG_1.format(0,''));
	setText('TKG_2',TKG_2.format(0,''));
	setText('TKG_3',TKG_3.format(0,''));
	setText('TKG_4',TKG_4.format(0,''));
	setText('TPP_MAX',TPP_MAX.format(0,''));
	setText('TPP_MIN',TPP_MIN.format(0,''));
	setText('TPP_DIF',TPP_DIF.format(0,''));
	setText('TPP_AVG',TPP_AVG.format(0,''));
	setText('TGELFUT_1_MAX',TGELFUT_1_MAX.format(0,''));
	setText('TGELFUT_1_MIN',TGELFUT_1_MIN.format(0,''));
	setText('TGELFUT_1_DIF',TGELFUT_1_DIF.format(0,''));
	setText('TGELFUT_1_AVG',TGELFUT_1_AVG.format(0,''));
	setText('TGELFUT_2_MAX',TGELFUT_2_MAX.format(0,''));
	setText('TGELFUT_2_MIN',TGELFUT_2_MIN.format(0,''));
	setText('TGELFUT_2_DIF',TGELFUT_2_DIF.format(0,''));
	setText('TGELFUT_2_AVG',TGELFUT_2_AVG.format(0,''));
	setText('FPR_HD',FPR_HD.format(2,''));
	setText('PPR_HD',PPR_HD.format(2,''));
	setText('TPR_HD',TPR_HD.format(0,''));
	setText('FHD',FHD.format(0,''));
	setText('PHD',PHD.format(2,''));
	setText('THD',THD.format(0,''));
	setText('QO2HD',QO2HD.format(1,''));
	setText('MHD',MHD.format(2,''));
	setText('PGD',PGD.format(2,''));
	setText('TGD',TGD.format(0,''));
	setText('GKG',GKG.format(0,''));
	setText('GMHD',GMHD.format(0,''));
	setText('GGD',GGD.format(0,''));
	setStyle('MHD_REGR_BACK','fill',getBoolTag('FPR_HD_REGR') ? 'rgb(0,255,0)' : 'rgb(127,127,127)');
	setStyle('MHD_REGR_2_BACK','fill',getBoolTag('FPR_HD_REGR_2') ? 'rgb(0,255,0)' : 'rgb(127,127,127)');
	setStyle('MHD_REGR_3_BACK','fill',((getBoolTag('FPR_HD_REGR')==0) && (getBoolTag('FPR_HD_REGR_2')==0)) ? 'rgb(0,255,0)' : 'rgb(127,127,127)');
	setText('FPG_HD',FPG_HD.format(0,''));
	setText('PPG_HD',PPG_HD.format(2,''));
	setText('TPG_HD',TPG_HD.format(0,''));
	setText('GPG',GPG.format(0,''));
	setStyle('FPG_HD_REGR_BACK','fill',getBoolTag('FPG_HD_REGR') ? 'rgb(0,255,0)' : 'rgb(127,127,127)');
	setStyle('FPG_HD_REGR_2_BACK','fill',getBoolTag('FPG_HD_REGR_2') ? 'rgb(0,255,0)' : 'rgb(127,127,127)');
	setStyle('FPG_HD_REGR_3_BACK','fill',((getBoolTag('FPG_HD_REGR')==0) && (getBoolTag('FPG_HD_REGR_2')==0)) ? 'rgb(0,255,0)' : 'rgb(127,127,127)');
	setStyle('FPG_HD_AUTO_BACK','fill',getBoolTag('FPG_HD_AUTO') ? 'rgb(0,255,0)' : 'rgb(127,127,127)');
	setStyle('FPG_HD_MAN_BACK','fill',getBoolTag('FPG_HD_MAN') ? 'rgb(0,255,0)' : 'rgb(127,127,127)');
	setText('FVD_1',FVD_1.format(0,''));
	setText('FVD_2',FVD_2.format(0,''));
	setText('PVD_1',PVD_1.format(1,''));
	setText('PVD_2',PVD_2.format(1,''));

	animateButton('PKG_MAN_MIN',getBoolTag('PKG_MAN_MIN'));
	animateButton('PKG_MAN_MAX',getBoolTag('PKG_MAN_MAX'));
	animateButton('TGD_MAN_MIN',getBoolTag('TGD_MAN_MIN'));
	animateButton('TGD_MAN_MAX',getBoolTag('TGD_MAN_MAX'));
	animateButton('FPG_HD_MAN_MIN',getBoolTag('FPG_HD_MAN_MIN'));
	animateButton('FPG_HD_MAN_MAX',getBoolTag('FPG_HD_MAN_MAX'));
	animateButton('MHD_MAN_MIN',getBoolTag('MHD_MAN_MIN'));
	animateButton('MHD_MAN_MAX',getBoolTag('MHD_MAN_MAX'));

	setText('ZDN_PKG',getFltTag('ZDN_PKG').format(2,''));
	setText('ZDN_TGD',getFltTag('ZDN_TGD').format(0,''));
	setText('ZDN_FPG_HD',getFltTag('ZDN_FPG_HD').format(0,''));
	setText('ZDN_PG_HD',getFltTag('ZDN_PG_HD').format(2,''));
	setText('ZDN_MHD',getFltTag('ZDN_MHD').format(0,''));
	setText('ZDN_FPR_HD',getFltTag('ZDN_FPR_HD').format(2,''));

	setText('FDG',getFltTag('FDG').format(0,''));
	setText('PDG',getFltTag('PDG').format(2,''));
	setText('TDG',getFltTag('TDG').format(0,''));
	
	animateAlarmBackStroke('CHARGE_LEVEL_L');
	animateAlarmBackStroke('CHARGE_LEVEL_R');
	animateAlarmBackStroke('CHARGE_LEVEL_SPEED_L');
	animateAlarmBackStroke('CHARGE_LEVEL_SPEED_R');
	animateAlarmBackStroke('FPR');
	animateAlarmBackStroke('PPR');
	animateAlarmBackStroke('TPR');
	animateAlarmBackStroke('FAZ');
	animateAlarmBackStroke('PAZ');
	animateAlarmBackStroke('TAZ');
	animateAlarmBackStroke('QO2AZ');
	animateAlarmBackStroke('PKG_VMK');
	animateAlarmBackStroke('PKG_NMK');
	animateAlarmBackStroke('PKG_PK');
	animateAlarmBackStroke('PKG_V');
	animateAlarmBackStroke('PKG_N');
	animateAlarmBackStroke('PKG_O');
	animateAlarmBackStroke('PDV');
	animateAlarmBackStroke('PDO');
	animateAlarmBackStroke('PDN');
	animateAlarmBackStroke('TCHUG_1');
	animateAlarmBackStroke('TCHUG_2');
	animateAlarmBackStroke('TKG_1');
	animateAlarmBackStroke('TKG_2');
	animateAlarmBackStroke('TKG_3');
	animateAlarmBackStroke('TKG_4');
	animateAlarmBackStroke('FPR_HD');
	animateAlarmBackStroke('PPR_HD');
	animateAlarmBackStroke('TPR_HD');
	animateAlarmBackStroke('FHD');
	animateAlarmBackStroke('PHD');
	animateAlarmBackStroke('THD');
	animateAlarmBackStroke('QO2HD');
	animateAlarmBackStroke('MHD');
	animateAlarmBackStroke('PGD');
	animateAlarmBackStroke('TGD');
	animateAlarmBackStroke('FPG_HD');
	animateAlarmBackStroke('PPG_HD');
	animateAlarmBackStroke('TPG_HD');
	animateAlarmBackStroke('GKG');
	animateAlarmStroke('GPG_BACK','GPG_HD');
	animateAlarmBackStroke('GMHD');
	animateAlarmBackStroke('GGD');
	animateAlarmBackStroke('FVD_1');
	animateAlarmBackStroke('FVD_2');
	animateAlarmBackStroke('PVD_1');
	animateAlarmBackStroke('PVD_2');
	animateAlarmBackStroke('FDG');
	animateAlarmBackStroke('PDG');
	animateAlarmBackStroke('TDG');

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
// Формат вызова: local_furnace_click()
// Назначение: Обработчик нажатия на кнопку вызова дополнительных видеокадров по доменной печи.
// Параметры: -
//////////////////////////////////////////////////////////////////////////////////////////////
function local_furnace_click() {
	popupMenu(FurnaceFramesMenu,frames_menu_click);
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
// Формат вызова: showTHPLTrendsMenu()
// Назначение: Вызов меню трендов по температурам тела холодильных плит.
// Параметры: -
//////////////////////////////////////////////////////////////////////////////////////////////
function showTHPLTrendsMenu() {
	var THPLTrendsMenu=[
		trendItem('THPL_6_TRENDS'),
		trendItem('THPL_5_TRENDS'),
		trendItem('THPL_4_TRENDS'),
		trendItem('THPL_3_TRENDS'),
		trendItem('THPL_2_TRENDS'),
		trendItem('THPL_1_TRENDS')
	];
	popupMenu(THPLTrendsMenu,trends_menu_click);
}

//////////////////////////////////////////////////////////////////////////////////////////////
// Формат вызова: showTSHATrendsMenu()
// Назначение: Вызов меню трендов по температурам футеровки шахты печи.
// Параметры: -
//////////////////////////////////////////////////////////////////////////////////////////////
function showTSHATrendsMenu() {
	var TSHATrendsMenu=[
		trendItem('TSHA_5_TRENDS'),
		trendItem('TSHA_4_TRENDS'),
		trendItem('TSHA_3_TRENDS'),
		trendItem('TSHA_2_TRENDS'),
		trendItem('TSHA_1_TRENDS')
	];
	popupMenu(TSHATrendsMenu,trends_menu_click);
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
		if (confirm('Вы уверены, что хотите перевести в дистанционный режим управления расхода пара в холодное дутье?')==true) {
			setBoolTag('FPR_HD_REGR',false);
			setBoolTag('FPR_HD_REGR_2',false);
		}
	} else if (mode==1) {
		if (confirm('Вы уверены, что хотите перевести в автоматический режим управления влажностью холодного дутья?')==true) {
			setBoolTag('FPR_HD_REGR',true);
			setBoolTag('FPR_HD_REGR_2',false);
		}
	} else if (mode==2) {
		if (confirm('Вы уверены, что хотите перевести в автоматический режим управления расхода пара в холодное дутье?')==true) {
			setBoolTag('FPR_HD_REGR',false);
			setBoolTag('FPR_HD_REGR_2',true);
		}
	}
}

//////////////////////////////////////////////////////////////////////////////////////////////
// Формат вызова:clickModeButton3(mode)
// Назначение: Нажатие кнопки изменения режима управления.
// Параметры:
//             mode - режим.
//////////////////////////////////////////////////////////////////////////////////////////////
function clickModeButton3(mode) {
	if (mode==0) {
		if (confirm('Вы уверены, что хотите перевести в дистанционный режим управления расхода природного газа в холодное дутье?')==true) {
			setBoolTag('FPG_HD_REGR',false);
			setBoolTag('FPG_HD_REGR_2',false);
		}
	} else if (mode==1) {
		if (confirm('Вы уверены, что хотите перевести в автоматический режим управления соотношения расхода ПГ/ХД?')==true) {
			setBoolTag('FPG_HD_REGR',true);
			setBoolTag('FPG_HD_REGR_2',false);
		}
	} else if (mode==2) {
		if (confirm('Вы уверены, что хотите перевести в автоматический режим управления расхода природного газа в холодное дутье?')==true) {
			setBoolTag('FPG_HD_REGR',false);
			setBoolTag('FPG_HD_REGR_2',true);
		}
	}
}

//////////////////////////////////////////////////////////////////////////////////////////////
// Формат вызова:showIronTapReport()
// Назначение: Нажатие кнопки отображения данных по выпуску чугуна.
//////////////////////////////////////////////////////////////////////////////////////////////
function showIronTapReport() {
	var ts=new Date();
	var Args={
		'report_date':{
			'year':ts.getFullYear(),
			'month':ts.getMonth()+1,
			'day':ts.getDate(),
			'hour':ts.getHours(),
			'minute':ts.getMinutes(),
			'second':ts.getSeconds()
		}
	};
	showReport('journal3','journal3',Args);
}
