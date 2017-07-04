//////////////////////////////////////////////////////////////////////////////////////////////
// Автор: Владимир Щербина <vns.scherbina@gmail.com>
// copyright 2017
// Версия: 1.0.0
// Модуль asld.js реализует анимацию и логику диалогового взаимодействия для видеокадра asld.
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
	setHighlightButton('ASLD_MODE_0_BUTTON','changeMode(0);');
	setHighlightButton('ASLD_MODE_1_BUTTON','changeMode(1);');
	setHighlightButton('ASLD_MODE_2_BUTTON','changeMode(2);');
	setHighlightButton('ASLD_MODE_3_BUTTON','changeMode(3);');
	setHighlightButton('ASLD_MODE_4_BUTTON','changeMode(4);');
	setHighlightButton('ASLD_MODE_5_BUTTON','changeMode(5);');
	setHighlightButton('ASLD_MODE_6_BUTTON','changeMode(6);');
	setHighlightButton('ASLD_MODE_7_BUTTON','changeMode(7);');
	setHighlightButton('ASLD_MODE_8_BUTTON','changeMode(8);');
	setHighlightButton('ASLD_B1_B6_REGENERATE_START_BUTTON','changeStartStop(\'ASLD_B1_B6_REGENERATE\',true);');
	setHighlightButton('ASLD_B1_B6_REGENERATE_STOP_BUTTON','changeStartStop(\'ASLD_B1_B6_REGENERATE\',false);');
	setHighlightButton('ASLD_B7_B12_REGENERATE_START_BUTTON','changeStartStop(\'ASLD_B7_B12_REGENERATE\',true);');
	setHighlightButton('ASLD_B7_B12_REGENERATE_STOP_BUTTON','changeStartStop(\'ASLD_B7_B12_REGENERATE\',false);');
	setHighlightButton('ASLD_B1_B12_REGENERATE_START_BUTTON','changeStartStop(\'ASLD_B1_B12_REGENERATE\',true);');
	setHighlightButton('ASLD_B1_B12_REGENERATE_STOP_BUTTON','changeStartStop(\'ASLD_B1_B12_REGENERATE\',false);');
	setHighlightButton('ASLD_DENY_AUTO_TRANSPORT_START_BUTTON','changeStartStop(\'ASLD_DENY_AUTO_TRANSPORT\',true);');
	setHighlightButton('ASLD_DENY_AUTO_TRANSPORT_STOP_BUTTON','changeStartStop(\'ASLD_DENY_AUTO_TRANSPORT\',false);');
	setHighlightButton('M803_START_BUTTON','changeStartStop(\'M803\',true);');
	setHighlightButton('M803_STOP_BUTTON','changeStartStop(\'M803\',false);');
	setHighlightButton('M804_START_BUTTON','changeStartStop(\'M804\',true);');
	setHighlightButton('M804_STOP_BUTTON','changeStartStop(\'M804\',false);');
	setHighlightButton('M805_START_BUTTON','changeStartStop(\'M805\',true);');
	setHighlightButton('M805_STOP_BUTTON','changeStartStop(\'M805\',false);');
	setHighlightButton('M806_START_BUTTON','changeStartStop(\'M806\',true);');
	setHighlightButton('M806_STOP_BUTTON','changeStartStop(\'M806\',false);');
	setHighlightButton('M807_START_BUTTON','changeStartStop(\'M807\',true);');
	setHighlightButton('M807_STOP_BUTTON','changeStartStop(\'M807\',false);');
	setHighlightButton('M808_START_BUTTON','changeStartStop(\'M808\',true);');
	setHighlightButton('M808_STOP_BUTTON','changeStartStop(\'M808\',false);');
	setHighlightButton('M809_START_BUTTON','changeStartStop(\'M809\',true);');
	setHighlightButton('M809_STOP_BUTTON','changeStartStop(\'M809\',false);');
	setHighlightButton('M810_START_BUTTON','changeStartStop(\'M810\',true);');
	setHighlightButton('M810_STOP_BUTTON','changeStartStop(\'M810\',false);');
	setHighlightButton('M811_START_BUTTON','changeStartStop(\'M811\',true);');
	setHighlightButton('M811_STOP_BUTTON','changeStartStop(\'M811\',false);');
	setHighlightButton('M812_START_BUTTON','changeStartStop(\'M812\',true);');
	setHighlightButton('M812_STOP_BUTTON','changeStartStop(\'M812\',false);');
	setHighlightButton('M813_START_BUTTON','changeStartStop(\'M813\',true);');
	setHighlightButton('M813_STOP_BUTTON','changeStartStop(\'M813\',false);');
	setHighlightButton('M814_START_BUTTON','changeStartStop(\'M814\',true);');
	setHighlightButton('M814_STOP_BUTTON','changeStartStop(\'M814\',false);');
	setHighlightButton('M833_START_BUTTON','changeStartStop(\'M833\',true);');
	setHighlightButton('M833_STOP_BUTTON','changeStartStop(\'M833\',false);');
	setHighlightButton('M834_START_BUTTON','changeStartStop(\'M834\',true);');
	setHighlightButton('M834_STOP_BUTTON','changeStartStop(\'M834\',false);');
	setHighlightButton('M835_START_BUTTON','changeStartStop(\'M835\',true);');
	setHighlightButton('M835_STOP_BUTTON','changeStartStop(\'M835\',false);');
	setHighlightButton('M836_START_BUTTON','changeStartStop(\'M836\',true);');
	setHighlightButton('M836_STOP_BUTTON','changeStartStop(\'M836\',false);');
	setHighlightButton('M837_START_BUTTON','changeStartStop(\'M837\',true);');
	setHighlightButton('M837_STOP_BUTTON','changeStartStop(\'M837\',false);');
	setHighlightButton('M838_START_BUTTON','changeStartStop(\'M838\',true);');
	setHighlightButton('M838_STOP_BUTTON','changeStartStop(\'M838\',false);');
	setHighlightButton('M839_START_BUTTON','changeStartStop(\'M839\',true);');
	setHighlightButton('M839_STOP_BUTTON','changeStartStop(\'M839\',false);');
	setHighlightButton('M840_START_BUTTON','changeStartStop(\'M840\',true);');
	setHighlightButton('M840_STOP_BUTTON','changeStartStop(\'M840\',false);');
	setHighlightButton('M841_START_BUTTON','changeStartStop(\'M841\',true);');
	setHighlightButton('M841_STOP_BUTTON','changeStartStop(\'M841\',false);');
	setHighlightButton('M842_START_BUTTON','changeStartStop(\'M842\',true);');
	setHighlightButton('M842_STOP_BUTTON','changeStartStop(\'M842\',false);');
	setHighlightButton('M843_START_BUTTON','changeStartStop(\'M843\',true);');
	setHighlightButton('M843_STOP_BUTTON','changeStartStop(\'M843\',false);');
	setHighlightButton('M844_START_BUTTON','changeStartStop(\'M844\',true);');
	setHighlightButton('M844_STOP_BUTTON','changeStartStop(\'M844\',false);');
	setHighlightButton('M815_START_BUTTON','changeStartStop(\'M815\',true);');
	setHighlightButton('M815_STOP_BUTTON','changeStartStop(\'M815\',false);');
	setHighlightButton('M816_START_BUTTON','changeStartStop(\'M816\',true);');
	setHighlightButton('M816_STOP_BUTTON','changeStartStop(\'M816\',false);');
	setHighlightButton('M817_START_BUTTON','changeStartStop(\'M817\',true);');
	setHighlightButton('M817_STOP_BUTTON','changeStartStop(\'M817\',false);');
	setHighlightButton('M818_START_BUTTON','changeStartStop(\'M818\',true);');
	setHighlightButton('M818_STOP_BUTTON','changeStartStop(\'M818\',false);');
	setHighlightButton('M851_START_BUTTON','changeStartStop(\'M851\',true);');
	setHighlightButton('M851_STOP_BUTTON','changeStartStop(\'M851\',false);');
	setHighlightButton('M801_START_BUTTON','changeStartStop(\'M801\',true);');
	setHighlightButton('M801_STOP_BUTTON','changeStartStop(\'M801\',false);');
	setHighlightButton('M802_OPEN_BUTTON','setBoolTag(\'M802_OPEN\',true); setBoolTag(\'M802_CLOSE\',false); setBoolTag(\'M802_STOP\',false);');
	setHighlightButton('M802_CLOSE_BUTTON','setBoolTag(\'M802_OPEN\',false); setBoolTag(\'M802_CLOSE\',true); setBoolTag(\'M802_STOP\',false);');
	setHighlightButton('M802_STOP_BUTTON','setBoolTag(\'M802_OPEN\',false); setBoolTag(\'M802_CLOSE\',false); setBoolTag(\'M802_STOP\',true);');
	setHighlightButton('M818_UP_BUTTON','setBoolTag(\'M818_UP\',true); setBoolTag(\'M818_DOWN\',false);');
	setHighlightButton('M818_DOWN_BUTTON','setBoolTag(\'M818_UP\',false); setBoolTag(\'M818_DOWN\',true);');
	setHighlightButton('M845_ON_1_BUTTON','setBoolTag(\'M845_ON_1\',!getBoolTag(\'M845_ON_1\'));');
	setHighlightButton('M845_ON_2_BUTTON','setBoolTag(\'M845_ON_2\',!getBoolTag(\'M845_ON_2\'));');
	setHighlightButton('M801_M_BUTTON','changeManDist(\'M801\',true);');
	setHighlightButton('M801_D_BUTTON','changeManDist(\'M801\',false);');
	setHighlightButton('M802_M_BUTTON','changeManDist(\'M802\',true);');
	setHighlightButton('M802_D_BUTTON','changeManDist(\'M802\',false);');
	setHighlightButton('M803_M_BUTTON','changeManDist(\'M803\',true);');
	setHighlightButton('M803_D_BUTTON','changeManDist(\'M803\',false);');
	setHighlightButton('M804_M_BUTTON','changeManDist(\'M804\',true);');
	setHighlightButton('M804_D_BUTTON','changeManDist(\'M804\',false);');
	setHighlightButton('M805_M_BUTTON','changeManDist(\'M805\',true);');
	setHighlightButton('M805_D_BUTTON','changeManDist(\'M805\',false);');
	setHighlightButton('M806_M_BUTTON','changeManDist(\'M806\',true);');
	setHighlightButton('M806_D_BUTTON','changeManDist(\'M806\',false);');
	setHighlightButton('M807_M_BUTTON','changeManDist(\'M807\',true);');
	setHighlightButton('M807_D_BUTTON','changeManDist(\'M807\',false);');
	setHighlightButton('M808_M_BUTTON','changeManDist(\'M808\',true);');
	setHighlightButton('M808_D_BUTTON','changeManDist(\'M808\',false);');
	setHighlightButton('M809_M_BUTTON','changeManDist(\'M809\',true);');
	setHighlightButton('M809_D_BUTTON','changeManDist(\'M809\',false);');
	setHighlightButton('M810_M_BUTTON','changeManDist(\'M810\',true);');
	setHighlightButton('M810_D_BUTTON','changeManDist(\'M810\',false);');
	setHighlightButton('M811_M_BUTTON','changeManDist(\'M811\',true);');
	setHighlightButton('M811_D_BUTTON','changeManDist(\'M811\',false);');
	setHighlightButton('M812_M_BUTTON','changeManDist(\'M812\',true);');
	setHighlightButton('M812_D_BUTTON','changeManDist(\'M812\',false);');
	setHighlightButton('M813_M_BUTTON','changeManDist(\'M813\',true);');
	setHighlightButton('M813_D_BUTTON','changeManDist(\'M813\',false);');
	setHighlightButton('M814_M_BUTTON','changeManDist(\'M814\',true);');
	setHighlightButton('M814_D_BUTTON','changeManDist(\'M814\',false);');
	setHighlightButton('M815_M_BUTTON','changeManDist(\'M815\',true);');
	setHighlightButton('M815_D_BUTTON','changeManDist(\'M815\',false);');
	setHighlightButton('M816_M_BUTTON','changeManDist(\'M816\',true);');
	setHighlightButton('M816_D_BUTTON','changeManDist(\'M816\',false);');
	setHighlightButton('M817_M_BUTTON','changeManDist(\'M817\',true);');
	setHighlightButton('M817_D_BUTTON','changeManDist(\'M817\',false);');
	setHighlightButton('M818_M_BUTTON','changeManDist(\'M818\',true);');
	setHighlightButton('M818_D_BUTTON','changeManDist(\'M818\',false);');
	setHighlightButton('M851_M_BUTTON','changeManDist(\'M851\',true);');
	setHighlightButton('M851_D_BUTTON','changeManDist(\'M851\',false);');

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
	setText('ASLD_IN_TEMPERATURE',getFltTag('ASLD_IN_TEMPERATURE').format(1,''));
	setText('ASLD_IN_PRESSURE',getFltTag('ASLD_IN_PRESSURE').format(3,''));
	setText('ASLD_VZ_DELTA_PRESSURE',getFltTag('ASLD_VZ_DELTA_PRESSURE').format(3,''));
	setText('ASLD_VZ_PRESSURE',getFltTag('ASLD_VZ_PRESSURE').format(3,''));
	setText('ASLD_OUT_PRESSURE',getFltTag('ASLD_OUT_PRESSURE').format(3,''));
	setText('ASLD_OUT_ASH',getFltTag('ASLD_OUT_ASH').format(2,''));
	setText('M801_COIL_TEMPERATURE_1',getFltTag('M801_COIL_TEMPERATURE_1').format(1,''));
	setText('M801_COIL_TEMPERATURE_2',getFltTag('M801_COIL_TEMPERATURE_2').format(1,''));
	setText('M801_COIL_TEMPERATURE_3',getFltTag('M801_COIL_TEMPERATURE_3').format(1,''));
	setText('M801_COIL_TEMPERATURE_4',getFltTag('M801_COIL_TEMPERATURE_4').format(1,''));
	setText('M801_COIL_TEMPERATURE_5',getFltTag('M801_COIL_TEMPERATURE_5').format(1,''));
	setText('M801_COIL_TEMPERATURE_6',getFltTag('M801_COIL_TEMPERATURE_6').format(1,''));
	setText('M801_SPEED',getFltTag('M801_SPEED').format(1,''));
	setText('M801_GEAR_TEMPERATURE_1',getFltTag('M801_GEAR_TEMPERATURE_1').format(1,''));
	setText('M801_GEAR_TEMPERATURE_2',getFltTag('M801_GEAR_TEMPERATURE_2').format(1,''));

	setVisibility('M651_OPENED',getBoolTag('M651_OPENED'));
	setVisibility('M651_CLOSED',getBoolTag('M651_CLOSED'));
	setVisibility('M651_MIDDLE',!(getBoolTag('M651_OPENED') || getBoolTag('M651_CLOSED')));
	setVisibility('M652_OPENED',getBoolTag('M652_OPENED'));
	setVisibility('M652_CLOSED',getBoolTag('M652_CLOSED'));
	setVisibility('M652_MIDDLE',!(getBoolTag('M652_OPENED') || getBoolTag('M652_CLOSED')));
	setVisibility('M653_OPENED',getBoolTag('M653_OPENED'));
	setVisibility('M653_CLOSED',getBoolTag('M653_CLOSED'));
	setVisibility('M653_MIDDLE',!(getBoolTag('M653_OPENED') || getBoolTag('M653_CLOSED')));
	setVisibility('M654_OPENED',getBoolTag('M654_OPENED'));
	setVisibility('M654_CLOSED',getBoolTag('M654_CLOSED'));
	setVisibility('M654_MIDDLE',!(getBoolTag('M654_OPENED') || getBoolTag('M654_CLOSED')));
	setVisibility('M655_OPENED',getBoolTag('M655_OPENED'));
	setVisibility('M655_CLOSED',getBoolTag('M655_CLOSED'));
	setVisibility('M655_MIDDLE',!(getBoolTag('M655_OPENED') || getBoolTag('M655_CLOSED')));
	setVisibility('M656_OPENED',getBoolTag('M656_OPENED'));
	setVisibility('M656_CLOSED',getBoolTag('M656_CLOSED'));
	setVisibility('M656_MIDDLE',!(getBoolTag('M656_OPENED') || getBoolTag('M656_CLOSED')));
	setVisibility('M657_OPENED',getBoolTag('M657_OPENED'));
	setVisibility('M657_CLOSED',getBoolTag('M657_CLOSED'));
	setVisibility('M657_MIDDLE',!(getBoolTag('M657_OPENED') || getBoolTag('M657_CLOSED')));
	setVisibility('M658_OPENED',getBoolTag('M658_OPENED'));
	setVisibility('M658_CLOSED',getBoolTag('M658_CLOSED'));
	setVisibility('M658_MIDDLE',!(getBoolTag('M658_OPENED') || getBoolTag('M658_CLOSED')));

	setVisibility('ASLD_MODE_1',getBoolTag('ASLD_MODE_1'));
	setVisibility('ASLD_MODE_2',getBoolTag('ASLD_MODE_2'));
	setVisibility('ASLD_MODE_3',getBoolTag('ASLD_MODE_3'));
	setVisibility('ASLD_MODE_4',getBoolTag('ASLD_MODE_4'));
	setVisibility('ASLD_MODE_5',getBoolTag('ASLD_MODE_5'));
	setVisibility('ASLD_MODE_6',getBoolTag('ASLD_MODE_6'));
	setVisibility('ASLD_MODE_7',getBoolTag('ASLD_MODE_7'));
	setVisibility('ASLD_MODE_8',getBoolTag('ASLD_MODE_8'));

	setVisibility('ASLD_IN_TEMPERATURE_ALARM',getBoolTag('ASLD_IN_TEMPERATURE_ALARM'));
	setVisibility('ASLD_VZ_DELTA_PRESSURE_ALARM',getBoolTag('ASLD_VZ_DELTA_PRESSURE_ALARM'));
	setVisibility('M801_COIL_TEMPERATURE_1_ALARM',getBoolTag('M801_COIL_TEMPERATURE_1_ALARM'));
	setVisibility('M801_COIL_TEMPERATURE_2_ALARM',getBoolTag('M801_COIL_TEMPERATURE_2_ALARM'));
	setVisibility('M801_COIL_TEMPERATURE_3_ALARM',getBoolTag('M801_COIL_TEMPERATURE_3_ALARM'));
	setVisibility('M801_COIL_TEMPERATURE_4_ALARM',getBoolTag('M801_COIL_TEMPERATURE_4_ALARM'));
	setVisibility('M801_COIL_TEMPERATURE_5_ALARM',getBoolTag('M801_COIL_TEMPERATURE_5_ALARM'));
	setVisibility('M801_COIL_TEMPERATURE_6_ALARM',getBoolTag('M801_COIL_TEMPERATURE_6_ALARM'));
	setVisibility('M801_GEAR_TEMPERATURE_1_ALARM',getBoolTag('M801_GEAR_TEMPERATURE_1_ALARM'));
	setVisibility('M801_GEAR_TEMPERATURE_2_ALARM',getBoolTag('M801_GEAR_TEMPERATURE_2_ALARM'));
	setVisibility('ASLD_INTERMEDIATE_BUNKER_LEVEL_ALARM',getBoolTag('ASLD_INTERMEDIATE_BUNKER_LEVEL_ALARM'));
	setVisibility('ASLD_INTERMEDIATE_BUNKER_LEVEL_WARN',getBoolTag('ASLD_INTERMEDIATE_BUNKER_LEVEL_WARN'));
	setVisibility('ASLD_INTERMEDIATE_BUNKER_LEVEL_OK',getBoolTag('ASLD_INTERMEDIATE_BUNKER_LEVEL_OK'));
	setVisibility('ASLD_OUT_BUNKER_LEVEL_ALARM',getBoolTag('ASLD_OUT_BUNKER_LEVEL_ALARM'));
	setVisibility('ASLD_OUT_BUNKER_LEVEL_WARN',getBoolTag('ASLD_OUT_BUNKER_LEVEL_WARN'));
	setVisibility('ASLD_OUT_BUNKER_LEVEL_OK',getBoolTag('ASLD_OUT_BUNKER_LEVEL_OK'));
	setVisibility('ASLD_BUNKER_1_LEVEL_ALARM',getBoolTag('ASLD_BUNKER_1_LEVEL_ALARM'));
	setVisibility('ASLD_BUNKER_1_LEVEL_WARN',getBoolTag('ASLD_BUNKER_1_LEVEL_WARN'));
	setVisibility('ASLD_BUNKER_1_LEVEL_OK',getBoolTag('ASLD_BUNKER_1_LEVEL_OK'));
	setVisibility('ASLD_BUNKER_2_LEVEL_ALARM',getBoolTag('ASLD_BUNKER_2_LEVEL_ALARM'));
	setVisibility('ASLD_BUNKER_2_LEVEL_WARN',getBoolTag('ASLD_BUNKER_2_LEVEL_WARN'));
	setVisibility('ASLD_BUNKER_2_LEVEL_OK',getBoolTag('ASLD_BUNKER_2_LEVEL_OK'));
	setVisibility('ASLD_BUNKER_3_LEVEL_ALARM',getBoolTag('ASLD_BUNKER_3_LEVEL_ALARM'));
	setVisibility('ASLD_BUNKER_3_LEVEL_WARN',getBoolTag('ASLD_BUNKER_3_LEVEL_WARN'));
	setVisibility('ASLD_BUNKER_3_LEVEL_OK',getBoolTag('ASLD_BUNKER_3_LEVEL_OK'));
	setVisibility('ASLD_BUNKER_4_LEVEL_ALARM',getBoolTag('ASLD_BUNKER_4_LEVEL_ALARM'));
	setVisibility('ASLD_BUNKER_4_LEVEL_WARN',getBoolTag('ASLD_BUNKER_4_LEVEL_WARN'));
	setVisibility('ASLD_BUNKER_4_LEVEL_OK',getBoolTag('ASLD_BUNKER_4_LEVEL_OK'));
	setVisibility('ASLD_BUNKER_5_LEVEL_ALARM',getBoolTag('ASLD_BUNKER_5_LEVEL_ALARM'));
	setVisibility('ASLD_BUNKER_5_LEVEL_WARN',getBoolTag('ASLD_BUNKER_5_LEVEL_WARN'));
	setVisibility('ASLD_BUNKER_5_LEVEL_OK',getBoolTag('ASLD_BUNKER_5_LEVEL_OK'));
	setVisibility('ASLD_BUNKER_6_LEVEL_ALARM',getBoolTag('ASLD_BUNKER_6_LEVEL_ALARM'));
	setVisibility('ASLD_BUNKER_6_LEVEL_WARN',getBoolTag('ASLD_BUNKER_6_LEVEL_WARN'));
	setVisibility('ASLD_BUNKER_6_LEVEL_OK',getBoolTag('ASLD_BUNKER_6_LEVEL_OK'));
	setVisibility('ASLD_BUNKER_7_LEVEL_ALARM',getBoolTag('ASLD_BUNKER_7_LEVEL_ALARM'));
	setVisibility('ASLD_BUNKER_7_LEVEL_WARN',getBoolTag('ASLD_BUNKER_7_LEVEL_WARN'));
	setVisibility('ASLD_BUNKER_7_LEVEL_OK',getBoolTag('ASLD_BUNKER_7_LEVEL_OK'));
	setVisibility('ASLD_BUNKER_8_LEVEL_ALARM',getBoolTag('ASLD_BUNKER_8_LEVEL_ALARM'));
	setVisibility('ASLD_BUNKER_8_LEVEL_WARN',getBoolTag('ASLD_BUNKER_8_LEVEL_WARN'));
	setVisibility('ASLD_BUNKER_8_LEVEL_OK',getBoolTag('ASLD_BUNKER_8_LEVEL_OK'));
	setVisibility('ASLD_BUNKER_9_LEVEL_ALARM',getBoolTag('ASLD_BUNKER_9_LEVEL_ALARM'));
	setVisibility('ASLD_BUNKER_9_LEVEL_WARN',getBoolTag('ASLD_BUNKER_9_LEVEL_WARN'));
	setVisibility('ASLD_BUNKER_9_LEVEL_OK',getBoolTag('ASLD_BUNKER_9_LEVEL_OK'));
	setVisibility('ASLD_BUNKER_10_LEVEL_ALARM',getBoolTag('ASLD_BUNKER_10_LEVEL_ALARM'));
	setVisibility('ASLD_BUNKER_10_LEVEL_WARN',getBoolTag('ASLD_BUNKER_10_LEVEL_WARN'));
	setVisibility('ASLD_BUNKER_10_LEVEL_OK',getBoolTag('ASLD_BUNKER_10_LEVEL_OK'));
	setVisibility('ASLD_BUNKER_11_LEVEL_ALARM',getBoolTag('ASLD_BUNKER_11_LEVEL_ALARM'));
	setVisibility('ASLD_BUNKER_11_LEVEL_WARN',getBoolTag('ASLD_BUNKER_11_LEVEL_WARN'));
	setVisibility('ASLD_BUNKER_11_LEVEL_OK',getBoolTag('ASLD_BUNKER_11_LEVEL_OK'));
	setVisibility('ASLD_BUNKER_12_LEVEL_ALARM',getBoolTag('ASLD_BUNKER_12_LEVEL_ALARM'));
	setVisibility('ASLD_BUNKER_12_LEVEL_WARN',getBoolTag('ASLD_BUNKER_12_LEVEL_WARN'));
	setVisibility('ASLD_BUNKER_12_LEVEL_OK',getBoolTag('ASLD_BUNKER_12_LEVEL_OK'));

	setVisibility('M801_ON',getBoolTag('M801_ON'));
	setVisibility('M802_ON',getBoolTag('M802_ON'));
	setVisibility('M803_ON',getBoolTag('M803_ON'));
	setVisibility('M804_ON',getBoolTag('M804_ON'));
	setVisibility('M805_ON',getBoolTag('M805_ON'));
	setVisibility('M806_ON',getBoolTag('M806_ON'));
	setVisibility('M807_ON',getBoolTag('M807_ON'));
	setVisibility('M808_ON',getBoolTag('M808_ON'));
	setVisibility('M809_ON',getBoolTag('M809_ON'));
	setVisibility('M810_ON',getBoolTag('M810_ON'));
	setVisibility('M811_ON',getBoolTag('M811_ON'));
	setVisibility('M812_ON',getBoolTag('M812_ON'));
	setVisibility('M813_ON',getBoolTag('M813_ON'));
	setVisibility('M814_ON',getBoolTag('M814_ON'));
	setVisibility('M815_ON',getBoolTag('M815_ON'));
	setVisibility('M816_ON',getBoolTag('M816_ON'));
	setVisibility('M817_ON',getBoolTag('M817_ON'));
	setVisibility('M833_ON',getBoolTag('M833_ON'));
	setVisibility('M834_ON',getBoolTag('M834_ON'));
	setVisibility('M835_ON',getBoolTag('M835_ON'));
	setVisibility('M836_ON',getBoolTag('M836_ON'));
	setVisibility('M837_ON',getBoolTag('M837_ON'));
	setVisibility('M838_ON',getBoolTag('M838_ON'));
	setVisibility('M839_ON',getBoolTag('M839_ON'));
	setVisibility('M840_ON',getBoolTag('M840_ON'));
	setVisibility('M841_ON',getBoolTag('M841_ON'));
	setVisibility('M842_ON',getBoolTag('M842_ON'));
	setVisibility('M843_ON',getBoolTag('M843_ON'));
	setVisibility('M844_ON',getBoolTag('M844_ON'));
	setVisibility('M851_ON',getBoolTag('M851_ON'));

	setStyle('M845_READY','fill',getBoolTag('M845_READY') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setStyle('M845_WORK','fill',getBoolTag('M845_WORK') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setStyle('M845_ON_1','fill',getBoolTag('M845_ON_1') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setStyle('M845_ON_2','fill',getBoolTag('M845_ON_2') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');

	setStyle('M801_M','fill',getBoolTag('M801_M') ? 'rgb(255,255,0)' : 'rgb(224,224,224)');
	setStyle('M802_M','fill',getBoolTag('M802_M') ? 'rgb(255,255,0)' : 'rgb(224,224,224)');
	setStyle('M803_M','fill',getBoolTag('M803_M') ? 'rgb(255,255,0)' : 'rgb(224,224,224)');
	setStyle('M804_M','fill',getBoolTag('M804_M') ? 'rgb(255,255,0)' : 'rgb(224,224,224)');
	setStyle('M805_M','fill',getBoolTag('M805_M') ? 'rgb(255,255,0)' : 'rgb(224,224,224)');
	setStyle('M806_M','fill',getBoolTag('M806_M') ? 'rgb(255,255,0)' : 'rgb(224,224,224)');
	setStyle('M807_M','fill',getBoolTag('M807_M') ? 'rgb(255,255,0)' : 'rgb(224,224,224)');
	setStyle('M808_M','fill',getBoolTag('M808_M') ? 'rgb(255,255,0)' : 'rgb(224,224,224)');
	setStyle('M809_M','fill',getBoolTag('M809_M') ? 'rgb(255,255,0)' : 'rgb(224,224,224)');
	setStyle('M810_M','fill',getBoolTag('M810_M') ? 'rgb(255,255,0)' : 'rgb(224,224,224)');
	setStyle('M811_M','fill',getBoolTag('M811_M') ? 'rgb(255,255,0)' : 'rgb(224,224,224)');
	setStyle('M812_M','fill',getBoolTag('M812_M') ? 'rgb(255,255,0)' : 'rgb(224,224,224)');
	setStyle('M813_M','fill',getBoolTag('M813_M') ? 'rgb(255,255,0)' : 'rgb(224,224,224)');
	setStyle('M814_M','fill',getBoolTag('M814_M') ? 'rgb(255,255,0)' : 'rgb(224,224,224)');
	setStyle('M815_M','fill',getBoolTag('M815_M') ? 'rgb(255,255,0)' : 'rgb(224,224,224)');
	setStyle('M816_M','fill',getBoolTag('M816_M') ? 'rgb(255,255,0)' : 'rgb(224,224,224)');
	setStyle('M817_M','fill',getBoolTag('M817_M') ? 'rgb(255,255,0)' : 'rgb(224,224,224)');
	setStyle('M818_M','fill',getBoolTag('M818_M') ? 'rgb(255,255,0)' : 'rgb(224,224,224)');
	setStyle('M851_M','fill',getBoolTag('M851_M') ? 'rgb(255,255,0)' : 'rgb(224,224,224)');

	setStyle('M801_D','fill',getBoolTag('M801_D') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setStyle('M802_D','fill',getBoolTag('M802_D') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setStyle('M803_D','fill',getBoolTag('M803_D') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setStyle('M804_D','fill',getBoolTag('M804_D') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setStyle('M805_D','fill',getBoolTag('M805_D') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setStyle('M806_D','fill',getBoolTag('M806_D') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setStyle('M807_D','fill',getBoolTag('M807_D') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setStyle('M808_D','fill',getBoolTag('M808_D') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setStyle('M809_D','fill',getBoolTag('M809_D') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setStyle('M810_D','fill',getBoolTag('M810_D') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setStyle('M811_D','fill',getBoolTag('M811_D') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setStyle('M812_D','fill',getBoolTag('M812_D') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setStyle('M813_D','fill',getBoolTag('M813_D') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setStyle('M814_D','fill',getBoolTag('M814_D') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setStyle('M815_D','fill',getBoolTag('M815_D') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setStyle('M816_D','fill',getBoolTag('M816_D') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setStyle('M817_D','fill',getBoolTag('M817_D') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setStyle('M818_D','fill',getBoolTag('M818_D') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setStyle('M851_D','fill',getBoolTag('M851_D') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	
	setStyle('M818_UP','fill',getBoolTag('M818_UP') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setStyle('M818_DOWN','fill',getBoolTag('M818_DOWN') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setStyle('M818_START','fill',getBoolTag('M818_START') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setStyle('M818_STOP','fill',getBoolTag('M818_STOP') ? 'rgb(255,128,64)' : 'rgb(224,224,224)');

	setStyle('M801_START','fill',getBoolTag('M801_START') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setStyle('M801_STOP','fill',getBoolTag('M801_STOP') ? 'rgb(255,128,64)' : 'rgb(224,224,224)');

	setStyle('M802_OPEN','fill',getBoolTag('M802_OPEN') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setStyle('M802_CLOSE','fill',getBoolTag('M802_CLOSE') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setStyle('M802_STOP','fill',getBoolTag('M802_STOP') ? 'rgb(255,128,64)' : 'rgb(224,224,224)');

	setStyle('M803_START','fill',getBoolTag('M803_START') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setStyle('M803_STOP','fill',getBoolTag('M803_STOP') ? 'rgb(255,128,64)' : 'rgb(224,224,224)');
	setStyle('M804_START','fill',getBoolTag('M804_START') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setStyle('M804_STOP','fill',getBoolTag('M804_STOP') ? 'rgb(255,128,64)' : 'rgb(224,224,224)');
	setStyle('M805_START','fill',getBoolTag('M805_START') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setStyle('M805_STOP','fill',getBoolTag('M805_STOP') ? 'rgb(255,128,64)' : 'rgb(224,224,224)');
	setStyle('M806_START','fill',getBoolTag('M806_START') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setStyle('M806_STOP','fill',getBoolTag('M806_STOP') ? 'rgb(255,128,64)' : 'rgb(224,224,224)');
	setStyle('M807_START','fill',getBoolTag('M807_START') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setStyle('M807_STOP','fill',getBoolTag('M807_STOP') ? 'rgb(255,128,64)' : 'rgb(224,224,224)');
	setStyle('M808_START','fill',getBoolTag('M808_START') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setStyle('M808_STOP','fill',getBoolTag('M808_STOP') ? 'rgb(255,128,64)' : 'rgb(224,224,224)');
	setStyle('M809_START','fill',getBoolTag('M809_START') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setStyle('M809_STOP','fill',getBoolTag('M809_STOP') ? 'rgb(255,128,64)' : 'rgb(224,224,224)');
	setStyle('M810_START','fill',getBoolTag('M810_START') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setStyle('M810_STOP','fill',getBoolTag('M810_STOP') ? 'rgb(255,128,64)' : 'rgb(224,224,224)');
	setStyle('M811_START','fill',getBoolTag('M811_START') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setStyle('M811_STOP','fill',getBoolTag('M811_STOP') ? 'rgb(255,128,64)' : 'rgb(224,224,224)');
	setStyle('M812_START','fill',getBoolTag('M812_START') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setStyle('M812_STOP','fill',getBoolTag('M812_STOP') ? 'rgb(255,128,64)' : 'rgb(224,224,224)');
	setStyle('M813_START','fill',getBoolTag('M813_START') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setStyle('M813_STOP','fill',getBoolTag('M813_STOP') ? 'rgb(255,128,64)' : 'rgb(224,224,224)');
	setStyle('M814_START','fill',getBoolTag('M814_START') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setStyle('M814_STOP','fill',getBoolTag('M814_STOP') ? 'rgb(255,128,64)' : 'rgb(224,224,224)');
	setStyle('M815_START','fill',getBoolTag('M815_START') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setStyle('M815_STOP','fill',getBoolTag('M815_STOP') ? 'rgb(255,128,64)' : 'rgb(224,224,224)');
	setStyle('M816_START','fill',getBoolTag('M816_START') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setStyle('M816_STOP','fill',getBoolTag('M816_STOP') ? 'rgb(255,128,64)' : 'rgb(224,224,224)');
	setStyle('M817_START','fill',getBoolTag('M817_START') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setStyle('M817_STOP','fill',getBoolTag('M817_STOP') ? 'rgb(255,128,64)' : 'rgb(224,224,224)');

	setStyle('M833_START','fill',getBoolTag('M833_START') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setStyle('M833_STOP','fill',getBoolTag('M833_STOP') ? 'rgb(255,128,64)' : 'rgb(224,224,224)');
	setStyle('M834_START','fill',getBoolTag('M834_START') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setStyle('M834_STOP','fill',getBoolTag('M834_STOP') ? 'rgb(255,128,64)' : 'rgb(224,224,224)');
	setStyle('M835_START','fill',getBoolTag('M835_START') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setStyle('M835_STOP','fill',getBoolTag('M835_STOP') ? 'rgb(255,128,64)' : 'rgb(224,224,224)');
	setStyle('M836_START','fill',getBoolTag('M836_START') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setStyle('M836_STOP','fill',getBoolTag('M836_STOP') ? 'rgb(255,128,64)' : 'rgb(224,224,224)');
	setStyle('M837_START','fill',getBoolTag('M837_START') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setStyle('M837_STOP','fill',getBoolTag('M837_STOP') ? 'rgb(255,128,64)' : 'rgb(224,224,224)');
	setStyle('M838_START','fill',getBoolTag('M838_START') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setStyle('M838_STOP','fill',getBoolTag('M838_STOP') ? 'rgb(255,128,64)' : 'rgb(224,224,224)');
	setStyle('M839_START','fill',getBoolTag('M839_START') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setStyle('M839_STOP','fill',getBoolTag('M839_STOP') ? 'rgb(255,128,64)' : 'rgb(224,224,224)');
	setStyle('M840_START','fill',getBoolTag('M840_START') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setStyle('M840_STOP','fill',getBoolTag('M840_STOP') ? 'rgb(255,128,64)' : 'rgb(224,224,224)');
	setStyle('M841_START','fill',getBoolTag('M841_START') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setStyle('M841_STOP','fill',getBoolTag('M841_STOP') ? 'rgb(255,128,64)' : 'rgb(224,224,224)');
	setStyle('M842_START','fill',getBoolTag('M842_START') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setStyle('M842_STOP','fill',getBoolTag('M842_STOP') ? 'rgb(255,128,64)' : 'rgb(224,224,224)');
	setStyle('M843_START','fill',getBoolTag('M843_START') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setStyle('M843_STOP','fill',getBoolTag('M843_STOP') ? 'rgb(255,128,64)' : 'rgb(224,224,224)');
	setStyle('M844_START','fill',getBoolTag('M844_START') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setStyle('M844_STOP','fill',getBoolTag('M844_STOP') ? 'rgb(255,128,64)' : 'rgb(224,224,224)');

	setStyle('M851_START','fill',getBoolTag('M851_START') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setStyle('M851_STOP','fill',getBoolTag('M851_STOP') ? 'rgb(255,128,64)' : 'rgb(224,224,224)');

	setStyle('ASLD_B1_B6_REGENERATE_START','fill',getBoolTag('ASLD_B1_B6_REGENERATE_START') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setStyle('ASLD_B1_B6_REGENERATE_STOP','fill',getBoolTag('ASLD_B1_B6_REGENERATE_STOP') ? 'rgb(255,128,64)' : 'rgb(224,224,224)');
	setStyle('ASLD_B7_B12_REGENERATE_START','fill',getBoolTag('ASLD_B7_B12_REGENERATE_START') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setStyle('ASLD_B7_B12_REGENERATE_STOP','fill',getBoolTag('ASLD_B7_B12_REGENERATE_STOP') ? 'rgb(255,128,64)' : 'rgb(224,224,224)');
	setStyle('ASLD_B1_B12_REGENERATE_START','fill',getBoolTag('ASLD_B1_B12_REGENERATE_START') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setStyle('ASLD_B1_B12_REGENERATE_STOP','fill',getBoolTag('ASLD_B1_B12_REGENERATE_STOP') ? 'rgb(255,128,64)' : 'rgb(224,224,224)');
	setStyle('ASLD_DENY_AUTO_TRANSPORT_START','fill',getBoolTag('ASLD_DENY_AUTO_TRANSPORT_START') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setStyle('ASLD_DENY_AUTO_TRANSPORT_STOP','fill',getBoolTag('ASLD_DENY_AUTO_TRANSPORT_STOP') ? 'rgb(255,128,64)' : 'rgb(224,224,224)');
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
// Формат вызова: changeMode(mode)
// Назначение: Изменение режима работы клапанов.
// Параметры:
//             mode 	- режим.
//////////////////////////////////////////////////////////////////////////////////////////////
function changeMode(mode) {
	var i=0;
	for (i=1; i<=8; i++) {
		setBoolTag('ASLD_MODE_'+i.format(0,''),false);
	}
	if ((mode>=1) && (mode<=8)) {
		setBoolTag('ASLD_MODE_'+mode.format(0,''),true);
	}
}

//////////////////////////////////////////////////////////////////////////////////////////////
// Формат вызова: changeStartStop(prefix,mode)
// Назначение: Включение/выключение механизма/режима.
// Параметры:
//             prefix 	- префикс тегов;
//             mode 	- команда включения/выключения.
//////////////////////////////////////////////////////////////////////////////////////////////
function changeStartStop(prefix,mode) {
	setBoolTag(prefix+'_START',mode);
	setBoolTag(prefix+'_STOP',!mode);
}

//////////////////////////////////////////////////////////////////////////////////////////////
// Формат вызова: changeManDist(prefix,mode)
// Назначение: Изменение режима управления.
// Параметры:
//             prefix 	- префикс тегов;
//             mode 	- команда режима.
//////////////////////////////////////////////////////////////////////////////////////////////
function changeManDist(prefix,mode) {
	setBoolTag(prefix+'_M',mode);
	setBoolTag(prefix+'_D',!mode);
}