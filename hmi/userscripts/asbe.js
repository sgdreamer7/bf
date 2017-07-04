//////////////////////////////////////////////////////////////////////////////////////////////
// Автор: Владимир Щербина <vns.scherbina@gmail.com>
// copyright 2017
// Версия: 1.0.0
// Модуль asbe.js реализует анимацию и логику диалогового взаимодействия для видеокадра asbe.
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
	setHighlightButton('ASBE_B1_B5_REGENERATE_START_BUTTON','changeStartStop(\'ASBE_B1_B5_REGENERATE\',true);');
	setHighlightButton('ASBE_B1_B5_REGENERATE_STOP_BUTTON','changeStartStop(\'ASBE_B1_B5_REGENERATE\',false);');
	setHighlightButton('ASBE_B6_B10_REGENERATE_START_BUTTON','changeStartStop(\'ASBE_B6_B10_REGENERATE\',true);');
	setHighlightButton('ASBE_B6_B10_REGENERATE_STOP_BUTTON','changeStartStop(\'ASBE_B6_B10_REGENERATE\',false);');
	setHighlightButton('ASBE_B1_B10_REGENERATE_START_BUTTON','changeStartStop(\'ASBE_B1_B10_REGENERATE\',true);');
	setHighlightButton('ASBE_B1_B10_REGENERATE_STOP_BUTTON','changeStartStop(\'ASBE_B1_B10_REGENERATE\',false);');
	setHighlightButton('ASBE_DENY_AUTO_TRANSPORT_START_BUTTON','changeStartStop(\'ASBE_DENY_AUTO_TRANSPORT\',true);');
	setHighlightButton('ASBE_DENY_AUTO_TRANSPORT_STOP_BUTTON','changeStartStop(\'ASBE_DENY_AUTO_TRANSPORT\',false);');
	setHighlightButton('M903_START_BUTTON','changeStartStop(\'M903\',true);');
	setHighlightButton('M903_STOP_BUTTON','changeStartStop(\'M903\',false);');
	setHighlightButton('M904_START_BUTTON','changeStartStop(\'M904\',true);');
	setHighlightButton('M904_STOP_BUTTON','changeStartStop(\'M904\',false);');
	setHighlightButton('M905_START_BUTTON','changeStartStop(\'M905\',true);');
	setHighlightButton('M905_STOP_BUTTON','changeStartStop(\'M905\',false);');
	setHighlightButton('M906_START_BUTTON','changeStartStop(\'M906\',true);');
	setHighlightButton('M906_STOP_BUTTON','changeStartStop(\'M906\',false);');
	setHighlightButton('M907_START_BUTTON','changeStartStop(\'M907\',true);');
	setHighlightButton('M907_STOP_BUTTON','changeStartStop(\'M907\',false);');
	setHighlightButton('M908_START_BUTTON','changeStartStop(\'M908\',true);');
	setHighlightButton('M908_STOP_BUTTON','changeStartStop(\'M908\',false);');
	setHighlightButton('M909_START_BUTTON','changeStartStop(\'M909\',true);');
	setHighlightButton('M909_STOP_BUTTON','changeStartStop(\'M909\',false);');
	setHighlightButton('M910_START_BUTTON','changeStartStop(\'M910\',true);');
	setHighlightButton('M910_STOP_BUTTON','changeStartStop(\'M910\',false);');
	setHighlightButton('M911_START_BUTTON','changeStartStop(\'M911\',true);');
	setHighlightButton('M911_STOP_BUTTON','changeStartStop(\'M911\',false);');
	setHighlightButton('M912_START_BUTTON','changeStartStop(\'M912\',true);');
	setHighlightButton('M912_STOP_BUTTON','changeStartStop(\'M912\',false);');
	setHighlightButton('M933_START_BUTTON','changeStartStop(\'M933\',true);');
	setHighlightButton('M933_STOP_BUTTON','changeStartStop(\'M933\',false);');
	setHighlightButton('M934_START_BUTTON','changeStartStop(\'M934\',true);');
	setHighlightButton('M934_STOP_BUTTON','changeStartStop(\'M934\',false);');
	setHighlightButton('M935_START_BUTTON','changeStartStop(\'M935\',true);');
	setHighlightButton('M935_STOP_BUTTON','changeStartStop(\'M935\',false);');
	setHighlightButton('M936_START_BUTTON','changeStartStop(\'M936\',true);');
	setHighlightButton('M936_STOP_BUTTON','changeStartStop(\'M936\',false);');
	setHighlightButton('M937_START_BUTTON','changeStartStop(\'M937\',true);');
	setHighlightButton('M937_STOP_BUTTON','changeStartStop(\'M937\',false);');
	setHighlightButton('M938_START_BUTTON','changeStartStop(\'M938\',true);');
	setHighlightButton('M938_STOP_BUTTON','changeStartStop(\'M938\',false);');
	setHighlightButton('M939_START_BUTTON','changeStartStop(\'M939\',true);');
	setHighlightButton('M939_STOP_BUTTON','changeStartStop(\'M939\',false);');
	setHighlightButton('M940_START_BUTTON','changeStartStop(\'M940\',true);');
	setHighlightButton('M940_STOP_BUTTON','changeStartStop(\'M940\',false);');
	setHighlightButton('M941_START_BUTTON','changeStartStop(\'M941\',true);');
	setHighlightButton('M941_STOP_BUTTON','changeStartStop(\'M941\',false);');
	setHighlightButton('M942_START_BUTTON','changeStartStop(\'M942\',true);');
	setHighlightButton('M942_STOP_BUTTON','changeStartStop(\'M942\',false);');
	setHighlightButton('M913_START_BUTTON','changeStartStop(\'M913\',true);');
	setHighlightButton('M913_STOP_BUTTON','changeStartStop(\'M913\',false);');
	setHighlightButton('M914_START_BUTTON','changeStartStop(\'M914\',true);');
	setHighlightButton('M914_STOP_BUTTON','changeStartStop(\'M914\',false);');
	setHighlightButton('M915_START_BUTTON','changeStartStop(\'M915\',true);');
	setHighlightButton('M915_STOP_BUTTON','changeStartStop(\'M915\',false);');
	setHighlightButton('M916_START_BUTTON','changeStartStop(\'M916\',true);');
	setHighlightButton('M916_STOP_BUTTON','changeStartStop(\'M916\',false);');
	setHighlightButton('M918_START_BUTTON','changeStartStop(\'M918\',true);');
	setHighlightButton('M918_STOP_BUTTON','changeStartStop(\'M918\',false);');
	setHighlightButton('M901_START_BUTTON','changeStartStop(\'M901\',true);');
	setHighlightButton('M901_STOP_BUTTON','changeStartStop(\'M901\',false);');
	setHighlightButton('M902_OPEN_BUTTON','setBoolTag(\'M902_OPEN\',true); setBoolTag(\'M902_CLOSE\',false); setBoolTag(\'M902_STOP\',false);');
	setHighlightButton('M902_CLOSE_BUTTON','setBoolTag(\'M902_OPEN\',false); setBoolTag(\'M902_CLOSE\',true); setBoolTag(\'M902_STOP\',false);');
	setHighlightButton('M902_STOP_BUTTON','setBoolTag(\'M902_OPEN\',false); setBoolTag(\'M902_CLOSE\',false); setBoolTag(\'M902_STOP\',true);');
	setHighlightButton('M918_UP_BUTTON','setBoolTag(\'M918_UP\',true); setBoolTag(\'M918_DOWN\',false);');
	setHighlightButton('M918_DOWN_BUTTON','setBoolTag(\'M918_UP\',false); setBoolTag(\'M918_DOWN\',true);');
	setHighlightButton('M943_ON_1_BUTTON','setBoolTag(\'M943_ON_1\',!getBoolTag(\'M943_ON_1\'));');
	setHighlightButton('M943_ON_2_BUTTON','setBoolTag(\'M943_ON_2\',!getBoolTag(\'M943_ON_2\'));');
	setHighlightButton('M901_M_BUTTON','changeManDist(\'M901\',true);');
	setHighlightButton('M901_D_BUTTON','changeManDist(\'M901\',false);');
	setHighlightButton('M902_M_BUTTON','changeManDist(\'M902\',true);');
	setHighlightButton('M902_D_BUTTON','changeManDist(\'M902\',false);');
	setHighlightButton('M903_M_BUTTON','changeManDist(\'M903\',true);');
	setHighlightButton('M903_D_BUTTON','changeManDist(\'M903\',false);');
	setHighlightButton('M904_M_BUTTON','changeManDist(\'M904\',true);');
	setHighlightButton('M904_D_BUTTON','changeManDist(\'M904\',false);');
	setHighlightButton('M905_M_BUTTON','changeManDist(\'M905\',true);');
	setHighlightButton('M905_D_BUTTON','changeManDist(\'M905\',false);');
	setHighlightButton('M906_M_BUTTON','changeManDist(\'M906\',true);');
	setHighlightButton('M906_D_BUTTON','changeManDist(\'M906\',false);');
	setHighlightButton('M907_M_BUTTON','changeManDist(\'M907\',true);');
	setHighlightButton('M907_D_BUTTON','changeManDist(\'M907\',false);');
	setHighlightButton('M908_M_BUTTON','changeManDist(\'M908\',true);');
	setHighlightButton('M908_D_BUTTON','changeManDist(\'M908\',false);');
	setHighlightButton('M909_M_BUTTON','changeManDist(\'M909\',true);');
	setHighlightButton('M909_D_BUTTON','changeManDist(\'M909\',false);');
	setHighlightButton('M910_M_BUTTON','changeManDist(\'M910\',true);');
	setHighlightButton('M910_D_BUTTON','changeManDist(\'M910\',false);');
	setHighlightButton('M911_M_BUTTON','changeManDist(\'M911\',true);');
	setHighlightButton('M911_D_BUTTON','changeManDist(\'M911\',false);');
	setHighlightButton('M912_M_BUTTON','changeManDist(\'M912\',true);');
	setHighlightButton('M912_D_BUTTON','changeManDist(\'M912\',false);');
	setHighlightButton('M913_M_BUTTON','changeManDist(\'M913\',true);');
	setHighlightButton('M913_D_BUTTON','changeManDist(\'M913\',false);');
	setHighlightButton('M914_M_BUTTON','changeManDist(\'M914\',true);');
	setHighlightButton('M914_D_BUTTON','changeManDist(\'M914\',false);');
	setHighlightButton('M915_M_BUTTON','changeManDist(\'M915\',true);');
	setHighlightButton('M915_D_BUTTON','changeManDist(\'M915\',false);');
	setHighlightButton('M916_M_BUTTON','changeManDist(\'M916\',true);');
	setHighlightButton('M916_D_BUTTON','changeManDist(\'M916\',false);');
	setHighlightButton('M918_M_BUTTON','changeManDist(\'M918\',true);');
	setHighlightButton('M918_D_BUTTON','changeManDist(\'M918\',false);');

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
	setText('ASBE_IN_TEMPERATURE',getFltTag('ASBE_IN_TEMPERATURE').format(1,''));
	setText('ASBE_IN_PRESSURE',getFltTag('ASBE_IN_PRESSURE').format(3,''));
	setText('ASBE_VZ_DELTA_PRESSURE',getFltTag('ASBE_VZ_DELTA_PRESSURE').format(3,''));
	setText('ASBE_VZ_PRESSURE',getFltTag('ASBE_VZ_PRESSURE').format(3,''));
	setText('ASBE_OUT_PRESSURE',getFltTag('ASBE_OUT_PRESSURE').format(3,''));
	setText('ASBE_OUT_ASH',getFltTag('ASBE_OUT_ASH').format(2,''));
	setText('M901_COIL_TEMPERATURE_1',getFltTag('M901_COIL_TEMPERATURE_1').format(1,''));
	setText('M901_COIL_TEMPERATURE_2',getFltTag('M901_COIL_TEMPERATURE_2').format(1,''));
	setText('M901_COIL_TEMPERATURE_3',getFltTag('M901_COIL_TEMPERATURE_3').format(1,''));
	setText('M901_COIL_TEMPERATURE_4',getFltTag('M901_COIL_TEMPERATURE_4').format(1,''));
	setText('M901_COIL_TEMPERATURE_5',getFltTag('M901_COIL_TEMPERATURE_5').format(1,''));
	setText('M901_COIL_TEMPERATURE_6',getFltTag('M901_COIL_TEMPERATURE_6').format(1,''));
	setText('M901_SPEED',getFltTag('M901_SPEED').format(1,''));
	setText('M901_GEAR_TEMPERATURE_1',getFltTag('M901_GEAR_TEMPERATURE_1').format(1,''));
	setText('M901_GEAR_TEMPERATURE_2',getFltTag('M901_GEAR_TEMPERATURE_2').format(1,''));

	setVisibility('ASBE_IN_TEMPERATURE_ALARM',getBoolTag('ASBE_IN_TEMPERATURE_ALARM'));
	setVisibility('ASBE_VZ_DELTA_PRESSURE_ALARM',getBoolTag('ASBE_VZ_DELTA_PRESSURE_ALARM'));
	setVisibility('ASBE_WAY_ALARM',getBoolTag('ASBE_WAY_ALARM'));
	setVisibility('M901_COIL_TEMPERATURE_1_ALARM',getBoolTag('M901_COIL_TEMPERATURE_1_ALARM'));
	setVisibility('M901_COIL_TEMPERATURE_2_ALARM',getBoolTag('M901_COIL_TEMPERATURE_2_ALARM'));
	setVisibility('M901_COIL_TEMPERATURE_3_ALARM',getBoolTag('M901_COIL_TEMPERATURE_3_ALARM'));
	setVisibility('M901_COIL_TEMPERATURE_4_ALARM',getBoolTag('M901_COIL_TEMPERATURE_4_ALARM'));
	setVisibility('M901_COIL_TEMPERATURE_5_ALARM',getBoolTag('M901_COIL_TEMPERATURE_5_ALARM'));
	setVisibility('M901_COIL_TEMPERATURE_6_ALARM',getBoolTag('M901_COIL_TEMPERATURE_6_ALARM'));
	setVisibility('M901_GEAR_TEMPERATURE_1_ALARM',getBoolTag('M901_GEAR_TEMPERATURE_1_ALARM'));
	setVisibility('M901_GEAR_TEMPERATURE_2_ALARM',getBoolTag('M901_GEAR_TEMPERATURE_2_ALARM'));
	setVisibility('ASBE_OUT_BUNKER_LEVEL_ALARM',getBoolTag('ASBE_OUT_BUNKER_LEVEL_ALARM'));
	setVisibility('ASBE_OUT_BUNKER_LEVEL_WARN',getBoolTag('ASBE_OUT_BUNKER_LEVEL_WARN'));
	setVisibility('ASBE_OUT_BUNKER_LEVEL_OK',getBoolTag('ASBE_OUT_BUNKER_LEVEL_OK'));
	setVisibility('ASBE_BUNKER_1_LEVEL_ALARM',getBoolTag('ASBE_BUNKER_1_LEVEL_ALARM'));
	setVisibility('ASBE_BUNKER_1_LEVEL_WARN',getBoolTag('ASBE_BUNKER_1_LEVEL_WARN'));
	setVisibility('ASBE_BUNKER_1_LEVEL_OK',getBoolTag('ASBE_BUNKER_1_LEVEL_OK'));
	setVisibility('ASBE_BUNKER_2_LEVEL_ALARM',getBoolTag('ASBE_BUNKER_2_LEVEL_ALARM'));
	setVisibility('ASBE_BUNKER_2_LEVEL_WARN',getBoolTag('ASBE_BUNKER_2_LEVEL_WARN'));
	setVisibility('ASBE_BUNKER_2_LEVEL_OK',getBoolTag('ASBE_BUNKER_2_LEVEL_OK'));
	setVisibility('ASBE_BUNKER_3_LEVEL_ALARM',getBoolTag('ASBE_BUNKER_3_LEVEL_ALARM'));
	setVisibility('ASBE_BUNKER_3_LEVEL_WARN',getBoolTag('ASBE_BUNKER_3_LEVEL_WARN'));
	setVisibility('ASBE_BUNKER_3_LEVEL_OK',getBoolTag('ASBE_BUNKER_3_LEVEL_OK'));
	setVisibility('ASBE_BUNKER_4_LEVEL_ALARM',getBoolTag('ASBE_BUNKER_4_LEVEL_ALARM'));
	setVisibility('ASBE_BUNKER_4_LEVEL_WARN',getBoolTag('ASBE_BUNKER_4_LEVEL_WARN'));
	setVisibility('ASBE_BUNKER_4_LEVEL_OK',getBoolTag('ASBE_BUNKER_4_LEVEL_OK'));
	setVisibility('ASBE_BUNKER_5_LEVEL_ALARM',getBoolTag('ASBE_BUNKER_5_LEVEL_ALARM'));
	setVisibility('ASBE_BUNKER_5_LEVEL_WARN',getBoolTag('ASBE_BUNKER_5_LEVEL_WARN'));
	setVisibility('ASBE_BUNKER_5_LEVEL_OK',getBoolTag('ASBE_BUNKER_5_LEVEL_OK'));
	setVisibility('ASBE_BUNKER_6_LEVEL_ALARM',getBoolTag('ASBE_BUNKER_6_LEVEL_ALARM'));
	setVisibility('ASBE_BUNKER_6_LEVEL_WARN',getBoolTag('ASBE_BUNKER_6_LEVEL_WARN'));
	setVisibility('ASBE_BUNKER_6_LEVEL_OK',getBoolTag('ASBE_BUNKER_6_LEVEL_OK'));
	setVisibility('ASBE_BUNKER_7_LEVEL_ALARM',getBoolTag('ASBE_BUNKER_7_LEVEL_ALARM'));
	setVisibility('ASBE_BUNKER_7_LEVEL_WARN',getBoolTag('ASBE_BUNKER_7_LEVEL_WARN'));
	setVisibility('ASBE_BUNKER_7_LEVEL_OK',getBoolTag('ASBE_BUNKER_7_LEVEL_OK'));
	setVisibility('ASBE_BUNKER_8_LEVEL_ALARM',getBoolTag('ASBE_BUNKER_8_LEVEL_ALARM'));
	setVisibility('ASBE_BUNKER_8_LEVEL_WARN',getBoolTag('ASBE_BUNKER_8_LEVEL_WARN'));
	setVisibility('ASBE_BUNKER_8_LEVEL_OK',getBoolTag('ASBE_BUNKER_8_LEVEL_OK'));
	setVisibility('ASBE_BUNKER_9_LEVEL_ALARM',getBoolTag('ASBE_BUNKER_9_LEVEL_ALARM'));
	setVisibility('ASBE_BUNKER_9_LEVEL_WARN',getBoolTag('ASBE_BUNKER_9_LEVEL_WARN'));
	setVisibility('ASBE_BUNKER_9_LEVEL_OK',getBoolTag('ASBE_BUNKER_9_LEVEL_OK'));
	setVisibility('ASBE_BUNKER_10_LEVEL_ALARM',getBoolTag('ASBE_BUNKER_10_LEVEL_ALARM'));
	setVisibility('ASBE_BUNKER_10_LEVEL_WARN',getBoolTag('ASBE_BUNKER_10_LEVEL_WARN'));
	setVisibility('ASBE_BUNKER_10_LEVEL_OK',getBoolTag('ASBE_BUNKER_10_LEVEL_OK'));

	setVisibility('M901_ON',getBoolTag('M901_ON'));
	setVisibility('M902_ON',getBoolTag('M902_ON'));
	setVisibility('M903_ON',getBoolTag('M903_ON'));
	setVisibility('M904_ON',getBoolTag('M904_ON'));
	setVisibility('M905_ON',getBoolTag('M905_ON'));
	setVisibility('M906_ON',getBoolTag('M906_ON'));
	setVisibility('M907_ON',getBoolTag('M907_ON'));
	setVisibility('M908_ON',getBoolTag('M908_ON'));
	setVisibility('M909_ON',getBoolTag('M909_ON'));
	setVisibility('M910_ON',getBoolTag('M910_ON'));
	setVisibility('M911_ON',getBoolTag('M911_ON'));
	setVisibility('M912_ON',getBoolTag('M912_ON'));
	setVisibility('M913_ON',getBoolTag('M913_ON'));
	setVisibility('M914_ON',getBoolTag('M914_ON'));
	setVisibility('M915_ON',getBoolTag('M915_ON'));
	setVisibility('M916_ON',getBoolTag('M916_ON'));
	setVisibility('M933_ON',getBoolTag('M933_ON'));
	setVisibility('M934_ON',getBoolTag('M934_ON'));
	setVisibility('M935_ON',getBoolTag('M935_ON'));
	setVisibility('M936_ON',getBoolTag('M936_ON'));
	setVisibility('M937_ON',getBoolTag('M937_ON'));
	setVisibility('M938_ON',getBoolTag('M938_ON'));
	setVisibility('M939_ON',getBoolTag('M939_ON'));
	setVisibility('M940_ON',getBoolTag('M940_ON'));
	setVisibility('M941_ON',getBoolTag('M941_ON'));
	setVisibility('M942_ON',getBoolTag('M942_ON'));

	setStyle('M943_READY','fill',getBoolTag('M943_READY') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setStyle('M943_WORK','fill',getBoolTag('M943_WORK') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setStyle('M943_ON_1','fill',getBoolTag('M943_ON_1') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setStyle('M943_ON_2','fill',getBoolTag('M943_ON_2') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');

	setStyle('M901_M','fill',getBoolTag('M901_M') ? 'rgb(255,255,0)' : 'rgb(224,224,224)');
	setStyle('M902_M','fill',getBoolTag('M902_M') ? 'rgb(255,255,0)' : 'rgb(224,224,224)');
	setStyle('M903_M','fill',getBoolTag('M903_M') ? 'rgb(255,255,0)' : 'rgb(224,224,224)');
	setStyle('M904_M','fill',getBoolTag('M904_M') ? 'rgb(255,255,0)' : 'rgb(224,224,224)');
	setStyle('M905_M','fill',getBoolTag('M905_M') ? 'rgb(255,255,0)' : 'rgb(224,224,224)');
	setStyle('M906_M','fill',getBoolTag('M906_M') ? 'rgb(255,255,0)' : 'rgb(224,224,224)');
	setStyle('M907_M','fill',getBoolTag('M907_M') ? 'rgb(255,255,0)' : 'rgb(224,224,224)');
	setStyle('M908_M','fill',getBoolTag('M908_M') ? 'rgb(255,255,0)' : 'rgb(224,224,224)');
	setStyle('M909_M','fill',getBoolTag('M909_M') ? 'rgb(255,255,0)' : 'rgb(224,224,224)');
	setStyle('M910_M','fill',getBoolTag('M910_M') ? 'rgb(255,255,0)' : 'rgb(224,224,224)');
	setStyle('M911_M','fill',getBoolTag('M911_M') ? 'rgb(255,255,0)' : 'rgb(224,224,224)');
	setStyle('M912_M','fill',getBoolTag('M912_M') ? 'rgb(255,255,0)' : 'rgb(224,224,224)');
	setStyle('M913_M','fill',getBoolTag('M913_M') ? 'rgb(255,255,0)' : 'rgb(224,224,224)');
	setStyle('M914_M','fill',getBoolTag('M914_M') ? 'rgb(255,255,0)' : 'rgb(224,224,224)');
	setStyle('M915_M','fill',getBoolTag('M915_M') ? 'rgb(255,255,0)' : 'rgb(224,224,224)');
	setStyle('M916_M','fill',getBoolTag('M916_M') ? 'rgb(255,255,0)' : 'rgb(224,224,224)');
	setStyle('M918_M','fill',getBoolTag('M918_M') ? 'rgb(255,255,0)' : 'rgb(224,224,224)');

	setStyle('M901_D','fill',getBoolTag('M901_D') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setStyle('M902_D','fill',getBoolTag('M902_D') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setStyle('M903_D','fill',getBoolTag('M903_D') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setStyle('M904_D','fill',getBoolTag('M904_D') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setStyle('M905_D','fill',getBoolTag('M905_D') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setStyle('M906_D','fill',getBoolTag('M906_D') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setStyle('M907_D','fill',getBoolTag('M907_D') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setStyle('M908_D','fill',getBoolTag('M908_D') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setStyle('M909_D','fill',getBoolTag('M909_D') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setStyle('M910_D','fill',getBoolTag('M910_D') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setStyle('M911_D','fill',getBoolTag('M911_D') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setStyle('M912_D','fill',getBoolTag('M912_D') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setStyle('M913_D','fill',getBoolTag('M913_D') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setStyle('M914_D','fill',getBoolTag('M914_D') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setStyle('M915_D','fill',getBoolTag('M915_D') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setStyle('M916_D','fill',getBoolTag('M916_D') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setStyle('M918_D','fill',getBoolTag('M918_D') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	
	setStyle('M918_UP','fill',getBoolTag('M918_UP') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setStyle('M918_DOWN','fill',getBoolTag('M918_DOWN') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setStyle('M918_START','fill',getBoolTag('M918_START') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setStyle('M918_STOP','fill',getBoolTag('M918_STOP') ? 'rgb(255,128,64)' : 'rgb(224,224,224)');

	setStyle('M901_START','fill',getBoolTag('M901_START') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setStyle('M901_STOP','fill',getBoolTag('M901_STOP') ? 'rgb(255,128,64)' : 'rgb(224,224,224)');

	setStyle('M902_OPEN','fill',getBoolTag('M902_OPEN') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setStyle('M902_CLOSE','fill',getBoolTag('M902_CLOSE') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setStyle('M902_STOP','fill',getBoolTag('M902_STOP') ? 'rgb(255,128,64)' : 'rgb(224,224,224)');

	setStyle('M903_START','fill',getBoolTag('M903_START') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setStyle('M903_STOP','fill',getBoolTag('M903_STOP') ? 'rgb(255,128,64)' : 'rgb(224,224,224)');
	setStyle('M904_START','fill',getBoolTag('M904_START') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setStyle('M904_STOP','fill',getBoolTag('M904_STOP') ? 'rgb(255,128,64)' : 'rgb(224,224,224)');
	setStyle('M905_START','fill',getBoolTag('M905_START') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setStyle('M905_STOP','fill',getBoolTag('M905_STOP') ? 'rgb(255,128,64)' : 'rgb(224,224,224)');
	setStyle('M906_START','fill',getBoolTag('M906_START') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setStyle('M906_STOP','fill',getBoolTag('M906_STOP') ? 'rgb(255,128,64)' : 'rgb(224,224,224)');
	setStyle('M907_START','fill',getBoolTag('M907_START') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setStyle('M907_STOP','fill',getBoolTag('M907_STOP') ? 'rgb(255,128,64)' : 'rgb(224,224,224)');
	setStyle('M908_START','fill',getBoolTag('M908_START') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setStyle('M908_STOP','fill',getBoolTag('M908_STOP') ? 'rgb(255,128,64)' : 'rgb(224,224,224)');
	setStyle('M909_START','fill',getBoolTag('M909_START') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setStyle('M909_STOP','fill',getBoolTag('M909_STOP') ? 'rgb(255,128,64)' : 'rgb(224,224,224)');
	setStyle('M910_START','fill',getBoolTag('M910_START') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setStyle('M910_STOP','fill',getBoolTag('M910_STOP') ? 'rgb(255,128,64)' : 'rgb(224,224,224)');
	setStyle('M911_START','fill',getBoolTag('M911_START') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setStyle('M911_STOP','fill',getBoolTag('M911_STOP') ? 'rgb(255,128,64)' : 'rgb(224,224,224)');
	setStyle('M912_START','fill',getBoolTag('M912_START') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setStyle('M912_STOP','fill',getBoolTag('M912_STOP') ? 'rgb(255,128,64)' : 'rgb(224,224,224)');
	setStyle('M913_START','fill',getBoolTag('M913_START') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setStyle('M913_STOP','fill',getBoolTag('M913_STOP') ? 'rgb(255,128,64)' : 'rgb(224,224,224)');
	setStyle('M914_START','fill',getBoolTag('M914_START') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setStyle('M914_STOP','fill',getBoolTag('M914_STOP') ? 'rgb(255,128,64)' : 'rgb(224,224,224)');
	setStyle('M915_START','fill',getBoolTag('M915_START') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setStyle('M915_STOP','fill',getBoolTag('M915_STOP') ? 'rgb(255,128,64)' : 'rgb(224,224,224)');
	setStyle('M916_START','fill',getBoolTag('M916_START') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setStyle('M916_STOP','fill',getBoolTag('M916_STOP') ? 'rgb(255,128,64)' : 'rgb(224,224,224)');

	setStyle('M933_START','fill',getBoolTag('M933_START') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setStyle('M933_STOP','fill',getBoolTag('M933_STOP') ? 'rgb(255,128,64)' : 'rgb(224,224,224)');
	setStyle('M934_START','fill',getBoolTag('M934_START') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setStyle('M934_STOP','fill',getBoolTag('M934_STOP') ? 'rgb(255,128,64)' : 'rgb(224,224,224)');
	setStyle('M935_START','fill',getBoolTag('M935_START') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setStyle('M935_STOP','fill',getBoolTag('M935_STOP') ? 'rgb(255,128,64)' : 'rgb(224,224,224)');
	setStyle('M936_START','fill',getBoolTag('M936_START') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setStyle('M936_STOP','fill',getBoolTag('M936_STOP') ? 'rgb(255,128,64)' : 'rgb(224,224,224)');
	setStyle('M937_START','fill',getBoolTag('M937_START') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setStyle('M937_STOP','fill',getBoolTag('M937_STOP') ? 'rgb(255,128,64)' : 'rgb(224,224,224)');
	setStyle('M938_START','fill',getBoolTag('M938_START') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setStyle('M938_STOP','fill',getBoolTag('M938_STOP') ? 'rgb(255,128,64)' : 'rgb(224,224,224)');
	setStyle('M939_START','fill',getBoolTag('M939_START') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setStyle('M939_STOP','fill',getBoolTag('M939_STOP') ? 'rgb(255,128,64)' : 'rgb(224,224,224)');
	setStyle('M940_START','fill',getBoolTag('M940_START') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setStyle('M940_STOP','fill',getBoolTag('M940_STOP') ? 'rgb(255,128,64)' : 'rgb(224,224,224)');
	setStyle('M941_START','fill',getBoolTag('M941_START') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setStyle('M941_STOP','fill',getBoolTag('M941_STOP') ? 'rgb(255,128,64)' : 'rgb(224,224,224)');
	setStyle('M942_START','fill',getBoolTag('M942_START') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setStyle('M942_STOP','fill',getBoolTag('M942_STOP') ? 'rgb(255,128,64)' : 'rgb(224,224,224)');

	setStyle('ASBE_B1_B5_REGENERATE_START','fill',getBoolTag('ASBE_B1_B5_REGENERATE_START') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setStyle('ASBE_B1_B5_REGENERATE_STOP','fill',getBoolTag('ASBE_B1_B5_REGENERATE_STOP') ? 'rgb(255,128,64)' : 'rgb(224,224,224)');
	setStyle('ASBE_B6_B10_REGENERATE_START','fill',getBoolTag('ASBE_B6_B10_REGENERATE_START') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setStyle('ASBE_B6_B10_REGENERATE_STOP','fill',getBoolTag('ASBE_B6_B10_REGENERATE_STOP') ? 'rgb(255,128,64)' : 'rgb(224,224,224)');
	setStyle('ASBE_B1_B10_REGENERATE_START','fill',getBoolTag('ASBE_B1_B10_REGENERATE_START') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setStyle('ASBE_B1_B10_REGENERATE_STOP','fill',getBoolTag('ASBE_B1_B10_REGENERATE_STOP') ? 'rgb(255,128,64)' : 'rgb(224,224,224)');
	setStyle('ASBE_DENY_AUTO_TRANSPORT_START','fill',getBoolTag('ASBE_DENY_AUTO_TRANSPORT_START') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setStyle('ASBE_DENY_AUTO_TRANSPORT_STOP','fill',getBoolTag('ASBE_DENY_AUTO_TRANSPORT_STOP') ? 'rgb(255,128,64)' : 'rgb(224,224,224)');
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