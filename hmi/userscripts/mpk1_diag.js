//////////////////////////////////////////////////////////////////////////////////////////////
// Автор: Владимир Щербина <vns.scherbina@gmail.com>
// copyright 2017
// Версия: 1.0.0
// Модуль mpk1_diag.js реализует анимацию и логику диалогового взаимодействия для видеокадра mpk1_diag.
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
	init_basic_without_diags_buttons_menu();
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


	setText('CURRENT1',getFltTag('QUANTUM_ACI_CURRENT_1_1').format(3,''));
	setText('CURRENT2',getFltTag('QUANTUM_ACI_CURRENT_1_2').format(3,''));
	setText('CURRENT3',getFltTag('QUANTUM_ACI_CURRENT_1_3').format(3,''));
	setText('CURRENT4',getFltTag('QUANTUM_ACI_CURRENT_1_4').format(3,''));
	setText('CURRENT5',getFltTag('QUANTUM_ACI_CURRENT_1_5').format(3,''));
	setText('CURRENT6',getFltTag('QUANTUM_ACI_CURRENT_1_6').format(3,''));
	setText('CURRENT7',getFltTag('QUANTUM_ACI_CURRENT_1_7').format(3,''));
	setText('CURRENT8',getFltTag('QUANTUM_ACI_CURRENT_1_8').format(3,''));
	setText('CURRENT9',getFltTag('QUANTUM_ACI_CURRENT_1_9').format(3,''));
	setText('CURRENT10',getFltTag('QUANTUM_ACI_CURRENT_1_10').format(3,''));
	setText('CURRENT11',getFltTag('QUANTUM_ACI_CURRENT_1_11').format(3,''));
	setText('CURRENT12',getFltTag('QUANTUM_ACI_CURRENT_1_12').format(3,''));
	setText('CURRENT13',getFltTag('QUANTUM_ACI_CURRENT_1_13').format(3,''));
	setText('CURRENT14',getFltTag('QUANTUM_ACI_CURRENT_1_14').format(3,''));
	setText('CURRENT15',getFltTag('QUANTUM_ACI_CURRENT_1_15').format(3,''));
	setText('CURRENT16',getFltTag('QUANTUM_ACI_CURRENT_1_16').format(3,''));

	setText('CURRENT17',getFltTag('QUANTUM_ACI_CURRENT_2_1').format(3,''));
	setText('CURRENT18',getFltTag('QUANTUM_ACI_CURRENT_2_2').format(3,''));
	setText('CURRENT19',getFltTag('QUANTUM_ACI_CURRENT_2_3').format(3,''));
	setText('CURRENT20',getFltTag('QUANTUM_ACI_CURRENT_2_4').format(3,''));
	setText('CURRENT21',getFltTag('QUANTUM_ACI_CURRENT_2_5').format(3,''));
	setText('CURRENT22',getFltTag('QUANTUM_ACI_CURRENT_2_6').format(3,''));
	setText('CURRENT23',getFltTag('QUANTUM_ACI_CURRENT_2_7').format(3,''));
	setText('CURRENT24',getFltTag('QUANTUM_ACI_CURRENT_2_8').format(3,''));
	setText('CURRENT25',getFltTag('QUANTUM_ACI_CURRENT_2_9').format(3,''));
	setText('CURRENT26',getFltTag('QUANTUM_ACI_CURRENT_2_10').format(3,''));
	setText('CURRENT27',getFltTag('QUANTUM_ACI_CURRENT_2_11').format(3,''));
	setText('CURRENT28',getFltTag('QUANTUM_ACI_CURRENT_2_12').format(3,''));
	setText('CURRENT29',getFltTag('QUANTUM_ACI_CURRENT_2_13').format(3,''));
	setText('CURRENT30',getFltTag('QUANTUM_ACI_CURRENT_2_14').format(3,''));
	setText('CURRENT31',getFltTag('QUANTUM_ACI_CURRENT_2_15').format(3,''));
	setText('CURRENT32',getFltTag('QUANTUM_ACI_CURRENT_2_16').format(3,''));

	setText('CURRENT33',getFltTag('QUANTUM_ACI_CURRENT_3_1').format(3,''));
	setText('CURRENT34',getFltTag('QUANTUM_ACI_CURRENT_3_2').format(3,''));
	setText('CURRENT35',getFltTag('QUANTUM_ACI_CURRENT_3_3').format(3,''));
	setText('CURRENT36',getFltTag('QUANTUM_ACI_CURRENT_3_4').format(3,''));
	setText('CURRENT37',getFltTag('QUANTUM_ACI_CURRENT_3_5').format(3,''));
	setText('CURRENT38',getFltTag('QUANTUM_ACI_CURRENT_3_6').format(3,''));
	setText('CURRENT39',getFltTag('QUANTUM_ACI_CURRENT_3_7').format(3,''));
	setText('CURRENT40',getFltTag('QUANTUM_ACI_CURRENT_3_8').format(3,''));
	setText('CURRENT41',getFltTag('QUANTUM_ACI_CURRENT_3_9').format(3,''));
	setText('CURRENT42',getFltTag('QUANTUM_ACI_CURRENT_3_10').format(3,''));
	setText('CURRENT43',getFltTag('QUANTUM_ACI_CURRENT_3_11').format(3,''));
	setText('CURRENT44',getFltTag('QUANTUM_ACI_CURRENT_3_12').format(3,''));
	setText('CURRENT45',getFltTag('QUANTUM_ACI_CURRENT_3_13').format(3,''));
	setText('CURRENT46',getFltTag('QUANTUM_ACI_CURRENT_3_14').format(3,''));
	setText('CURRENT47',getFltTag('QUANTUM_ACI_CURRENT_3_15').format(3,''));
	setText('CURRENT48',getFltTag('QUANTUM_ACI_CURRENT_3_16').format(3,''));

	setText('CURRENT49',getFltTag('QUANTUM_ACO_CURRENT_1').format(3,''));
	setText('CURRENT50',getFltTag('QUANTUM_ACO_CURRENT_2').format(3,''));
	setText('CURRENT51',getFltTag('QUANTUM_ACO_CURRENT_3').format(3,''));
	setText('CURRENT52',getFltTag('QUANTUM_ACO_CURRENT_4').format(3,''));
	setText('CURRENT53',getFltTag('QUANTUM_ACO_CURRENT_5').format(3,''));
	setText('CURRENT54',getFltTag('QUANTUM_ACO_CURRENT_6').format(3,''));
	setText('CURRENT55',getFltTag('QUANTUM_ACO_CURRENT_7').format(3,''));
	setText('CURRENT56',getFltTag('QUANTUM_ACO_CURRENT_8').format(3,''));	

	setText('VALUE1',getFltTag('QUANTUM_ACI_VALUE_1_1').format(3,''));
	setText('VALUE2',getFltTag('QUANTUM_ACI_VALUE_1_2').format(3,''));
	setText('VALUE3',getFltTag('QUANTUM_ACI_VALUE_1_3').format(3,''));
	setText('VALUE4',getFltTag('QUANTUM_ACI_VALUE_1_4').format(3,''));
	setText('VALUE5',getFltTag('QUANTUM_ACI_VALUE_1_5').format(3,''));
	setText('VALUE6',getFltTag('QUANTUM_ACI_VALUE_1_6').format(3,''));
	setText('VALUE7',getFltTag('QUANTUM_ACI_VALUE_1_7').format(3,''));
	setText('VALUE8',getFltTag('QUANTUM_ACI_VALUE_1_8').format(3,''));
	setText('VALUE9',getFltTag('QUANTUM_ACI_VALUE_1_9').format(3,''));
	setText('VALUE10',getFltTag('QUANTUM_ACI_VALUE_1_10').format(3,''));
	setText('VALUE11',getFltTag('QUANTUM_ACI_VALUE_1_11').format(3,''));
	setText('VALUE12',getFltTag('QUANTUM_ACI_VALUE_1_12').format(3,''));
	setText('VALUE13',getFltTag('QUANTUM_ACI_VALUE_1_13').format(3,''));
	setText('VALUE14',getFltTag('QUANTUM_ACI_VALUE_1_14').format(3,''));
	setText('VALUE15',getFltTag('QUANTUM_ACI_VALUE_1_15').format(3,''));
	setText('VALUE16',getFltTag('QUANTUM_ACI_VALUE_1_16').format(3,''));

	setText('VALUE17',getFltTag('QUANTUM_ACI_VALUE_2_1').format(3,''));
	setText('VALUE18',getFltTag('QUANTUM_ACI_VALUE_2_2').format(3,''));
	setText('VALUE19',getFltTag('QUANTUM_ACI_VALUE_2_3').format(3,''));
	setText('VALUE20',getFltTag('QUANTUM_ACI_VALUE_2_4').format(3,''));
	setText('VALUE21',getFltTag('QUANTUM_ACI_VALUE_2_5').format(3,''));
	setText('VALUE22',getFltTag('QUANTUM_ACI_VALUE_2_6').format(3,''));
	setText('VALUE23',getFltTag('QUANTUM_ACI_VALUE_2_7').format(3,''));
	setText('VALUE24',getFltTag('QUANTUM_ACI_VALUE_2_8').format(3,''));
	setText('VALUE25',getFltTag('QUANTUM_ACI_VALUE_2_9').format(3,''));
	setText('VALUE26',getFltTag('QUANTUM_ACI_VALUE_2_10').format(3,''));
	setText('VALUE27',getFltTag('QUANTUM_ACI_VALUE_2_11').format(3,''));
	setText('VALUE28',getFltTag('QUANTUM_ACI_VALUE_2_12').format(3,''));
	setText('VALUE29',getFltTag('QUANTUM_ACI_VALUE_2_13').format(3,''));
	setText('VALUE30',getFltTag('QUANTUM_ACI_VALUE_2_14').format(3,''));
	setText('VALUE31',getFltTag('QUANTUM_ACI_VALUE_2_15').format(3,''));
	setText('VALUE32',getFltTag('QUANTUM_ACI_VALUE_2_16').format(3,''));

	setText('VALUE33',getFltTag('QUANTUM_ACI_VALUE_3_1').format(3,''));
	setText('VALUE34',getFltTag('QUANTUM_ACI_VALUE_3_2').format(3,''));
	setText('VALUE35',getFltTag('QUANTUM_ACI_VALUE_3_3').format(3,''));
	setText('VALUE36',getFltTag('QUANTUM_ACI_VALUE_3_4').format(3,''));
	setText('VALUE37',getFltTag('QUANTUM_ACI_VALUE_3_5').format(3,''));
	setText('VALUE38',getFltTag('QUANTUM_ACI_VALUE_3_6').format(3,''));
	setText('VALUE39',getFltTag('QUANTUM_ACI_VALUE_3_7').format(3,''));
	setText('VALUE40',getFltTag('QUANTUM_ACI_VALUE_3_8').format(3,''));
	setText('VALUE41',getFltTag('QUANTUM_ACI_VALUE_3_9').format(3,''));
	setText('VALUE42',getFltTag('QUANTUM_ACI_VALUE_3_10').format(3,''));
	setText('VALUE43',getFltTag('QUANTUM_ACI_VALUE_3_11').format(3,''));
	setText('VALUE44',getFltTag('QUANTUM_ACI_VALUE_3_12').format(3,''));
	setText('VALUE45',getFltTag('QUANTUM_ACI_VALUE_3_13').format(3,''));
	setText('VALUE46',getFltTag('QUANTUM_ACI_VALUE_3_14').format(3,''));
	setText('VALUE47',getFltTag('QUANTUM_ACI_VALUE_3_15').format(3,''));
	setText('VALUE48',getFltTag('QUANTUM_ACI_VALUE_3_16').format(3,''));

	setText('VALUE49',getFltTag('QUANTUM_ACO_VALUE_1').format(3,''));
	setText('VALUE50',getFltTag('QUANTUM_ACO_VALUE_2').format(3,''));
	setText('VALUE51',getFltTag('QUANTUM_ACO_VALUE_3').format(3,''));
	setText('VALUE52',getFltTag('QUANTUM_ACO_VALUE_4').format(3,''));
	setText('VALUE53',getFltTag('QUANTUM_ACO_VALUE_5').format(3,''));
	setText('VALUE54',getFltTag('QUANTUM_ACO_VALUE_6').format(3,''));
	setText('VALUE55',getFltTag('QUANTUM_ACO_VALUE_7').format(3,''));
	setText('VALUE56',getFltTag('QUANTUM_ACO_VALUE_8').format(3,''));

	setStyle('CURRENT_LOOP1','fill',getBoolTag('QUANTUM_ACI_LOOP_STATE_1_1') ? 'rgb(255,0,0)' : 'rgb(0,255,0)');
	setStyle('CURRENT_LOOP2','fill',getBoolTag('QUANTUM_ACI_LOOP_STATE_1_2') ? 'rgb(255,0,0)' : 'rgb(0,255,0)');
	setStyle('CURRENT_LOOP3','fill',getBoolTag('QUANTUM_ACI_LOOP_STATE_1_3') ? 'rgb(255,0,0)' : 'rgb(0,255,0)');
	setStyle('CURRENT_LOOP4','fill',getBoolTag('QUANTUM_ACI_LOOP_STATE_1_4') ? 'rgb(255,0,0)' : 'rgb(0,255,0)');
	setStyle('CURRENT_LOOP5','fill',getBoolTag('QUANTUM_ACI_LOOP_STATE_1_5') ? 'rgb(255,0,0)' : 'rgb(0,255,0)');
	setStyle('CURRENT_LOOP6','fill',getBoolTag('QUANTUM_ACI_LOOP_STATE_1_6') ? 'rgb(255,0,0)' : 'rgb(0,255,0)');
	setStyle('CURRENT_LOOP7','fill',getBoolTag('QUANTUM_ACI_LOOP_STATE_1_7') ? 'rgb(255,0,0)' : 'rgb(0,255,0)');
	setStyle('CURRENT_LOOP8','fill',getBoolTag('QUANTUM_ACI_LOOP_STATE_1_8') ? 'rgb(255,0,0)' : 'rgb(0,255,0)');
	setStyle('CURRENT_LOOP9','fill',getBoolTag('QUANTUM_ACI_LOOP_STATE_1_9') ? 'rgb(255,0,0)' : 'rgb(0,255,0)');
	setStyle('CURRENT_LOOP10','fill',getBoolTag('QUANTUM_ACI_LOOP_STATE_1_10') ? 'rgb(255,0,0)' : 'rgb(0,255,0)');
	setStyle('CURRENT_LOOP11','fill',getBoolTag('QUANTUM_ACI_LOOP_STATE_1_11') ? 'rgb(255,0,0)' : 'rgb(0,255,0)');
	setStyle('CURRENT_LOOP12','fill',getBoolTag('QUANTUM_ACI_LOOP_STATE_1_12') ? 'rgb(255,0,0)' : 'rgb(0,255,0)');
	setStyle('CURRENT_LOOP13','fill',getBoolTag('QUANTUM_ACI_LOOP_STATE_1_13') ? 'rgb(255,0,0)' : 'rgb(0,255,0)');
	setStyle('CURRENT_LOOP14','fill',getBoolTag('QUANTUM_ACI_LOOP_STATE_1_14') ? 'rgb(255,0,0)' : 'rgb(0,255,0)');
	setStyle('CURRENT_LOOP15','fill',getBoolTag('QUANTUM_ACI_LOOP_STATE_1_15') ? 'rgb(255,0,0)' : 'rgb(0,255,0)');
	setStyle('CURRENT_LOOP16','fill',getBoolTag('QUANTUM_ACI_LOOP_STATE_1_16') ? 'rgb(255,0,0)' : 'rgb(0,255,0)');

	setStyle('CURRENT_LOOP17','fill',getBoolTag('QUANTUM_ACI_LOOP_STATE_2_1') ? 'rgb(255,0,0)' : 'rgb(0,255,0)');
	setStyle('CURRENT_LOOP18','fill',getBoolTag('QUANTUM_ACI_LOOP_STATE_2_2') ? 'rgb(255,0,0)' : 'rgb(0,255,0)');
	setStyle('CURRENT_LOOP19','fill',getBoolTag('QUANTUM_ACI_LOOP_STATE_2_3') ? 'rgb(255,0,0)' : 'rgb(0,255,0)');
	setStyle('CURRENT_LOOP20','fill',getBoolTag('QUANTUM_ACI_LOOP_STATE_2_4') ? 'rgb(255,0,0)' : 'rgb(0,255,0)');
	setStyle('CURRENT_LOOP21','fill',getBoolTag('QUANTUM_ACI_LOOP_STATE_2_5') ? 'rgb(255,0,0)' : 'rgb(0,255,0)');
	setStyle('CURRENT_LOOP22','fill',getBoolTag('QUANTUM_ACI_LOOP_STATE_2_6') ? 'rgb(255,0,0)' : 'rgb(0,255,0)');
	setStyle('CURRENT_LOOP23','fill',getBoolTag('QUANTUM_ACI_LOOP_STATE_2_7') ? 'rgb(255,0,0)' : 'rgb(0,255,0)');
	setStyle('CURRENT_LOOP24','fill',getBoolTag('QUANTUM_ACI_LOOP_STATE_2_8') ? 'rgb(255,0,0)' : 'rgb(0,255,0)');
	setStyle('CURRENT_LOOP25','fill',getBoolTag('QUANTUM_ACI_LOOP_STATE_2_9') ? 'rgb(255,0,0)' : 'rgb(0,255,0)');
	setStyle('CURRENT_LOOP26','fill',getBoolTag('QUANTUM_ACI_LOOP_STATE_2_10') ? 'rgb(255,0,0)' : 'rgb(0,255,0)');
	setStyle('CURRENT_LOOP27','fill',getBoolTag('QUANTUM_ACI_LOOP_STATE_2_11') ? 'rgb(255,0,0)' : 'rgb(0,255,0)');
	setStyle('CURRENT_LOOP28','fill',getBoolTag('QUANTUM_ACI_LOOP_STATE_2_12') ? 'rgb(255,0,0)' : 'rgb(0,255,0)');
	setStyle('CURRENT_LOOP29','fill',getBoolTag('QUANTUM_ACI_LOOP_STATE_2_13') ? 'rgb(255,0,0)' : 'rgb(0,255,0)');
	setStyle('CURRENT_LOOP30','fill',getBoolTag('QUANTUM_ACI_LOOP_STATE_2_14') ? 'rgb(255,0,0)' : 'rgb(0,255,0)');
	setStyle('CURRENT_LOOP31','fill',getBoolTag('QUANTUM_ACI_LOOP_STATE_2_15') ? 'rgb(255,0,0)' : 'rgb(0,255,0)');
	setStyle('CURRENT_LOOP32','fill',getBoolTag('QUANTUM_ACI_LOOP_STATE_2_16') ? 'rgb(255,0,0)' : 'rgb(0,255,0)');

	setStyle('CURRENT_LOOP33','fill',getBoolTag('QUANTUM_ACI_LOOP_STATE_3_1') ? 'rgb(255,0,0)' : 'rgb(0,255,0)');
	setStyle('CURRENT_LOOP34','fill',getBoolTag('QUANTUM_ACI_LOOP_STATE_3_2') ? 'rgb(255,0,0)' : 'rgb(0,255,0)');
	setStyle('CURRENT_LOOP35','fill',getBoolTag('QUANTUM_ACI_LOOP_STATE_3_3') ? 'rgb(255,0,0)' : 'rgb(0,255,0)');
	setStyle('CURRENT_LOOP36','fill',getBoolTag('QUANTUM_ACI_LOOP_STATE_3_4') ? 'rgb(255,0,0)' : 'rgb(0,255,0)');
	setStyle('CURRENT_LOOP37','fill',getBoolTag('QUANTUM_ACI_LOOP_STATE_3_5') ? 'rgb(255,0,0)' : 'rgb(0,255,0)');
	setStyle('CURRENT_LOOP38','fill',getBoolTag('QUANTUM_ACI_LOOP_STATE_3_6') ? 'rgb(255,0,0)' : 'rgb(0,255,0)');
	setStyle('CURRENT_LOOP39','fill',getBoolTag('QUANTUM_ACI_LOOP_STATE_3_7') ? 'rgb(255,0,0)' : 'rgb(0,255,0)');
	setStyle('CURRENT_LOOP40','fill',getBoolTag('QUANTUM_ACI_LOOP_STATE_3_8') ? 'rgb(255,0,0)' : 'rgb(0,255,0)');
	setStyle('CURRENT_LOOP41','fill',getBoolTag('QUANTUM_ACI_LOOP_STATE_3_9') ? 'rgb(255,0,0)' : 'rgb(0,255,0)');
	setStyle('CURRENT_LOOP42','fill',getBoolTag('QUANTUM_ACI_LOOP_STATE_3_10') ? 'rgb(255,0,0)' : 'rgb(0,255,0)');
	setStyle('CURRENT_LOOP43','fill',getBoolTag('QUANTUM_ACI_LOOP_STATE_3_11') ? 'rgb(255,0,0)' : 'rgb(0,255,0)');
	setStyle('CURRENT_LOOP44','fill',getBoolTag('QUANTUM_ACI_LOOP_STATE_3_12') ? 'rgb(255,0,0)' : 'rgb(0,255,0)');
	setStyle('CURRENT_LOOP45','fill',getBoolTag('QUANTUM_ACI_LOOP_STATE_3_13') ? 'rgb(255,0,0)' : 'rgb(0,255,0)');
	setStyle('CURRENT_LOOP46','fill',getBoolTag('QUANTUM_ACI_LOOP_STATE_3_14') ? 'rgb(255,0,0)' : 'rgb(0,255,0)');
	setStyle('CURRENT_LOOP47','fill',getBoolTag('QUANTUM_ACI_LOOP_STATE_3_15') ? 'rgb(255,0,0)' : 'rgb(0,255,0)');
	setStyle('CURRENT_LOOP48','fill',getBoolTag('QUANTUM_ACI_LOOP_STATE_3_16') ? 'rgb(255,0,0)' : 'rgb(0,255,0)');

	setStyle('OUTPUT1','fill',getBoolTag('QUANTUM_DDO_VALUE_1') ? 'rgb(0,255,0)' : 'rgb(255,0,0)');
	setStyle('OUTPUT2','fill',getBoolTag('QUANTUM_DDO_VALUE_2') ? 'rgb(0,255,0)' : 'rgb(255,0,0)');
	setStyle('OUTPUT3','fill',getBoolTag('QUANTUM_DDO_VALUE_3') ? 'rgb(0,255,0)' : 'rgb(255,0,0)');
	setStyle('OUTPUT4','fill',getBoolTag('QUANTUM_DDO_VALUE_4') ? 'rgb(0,255,0)' : 'rgb(255,0,0)');
	setStyle('OUTPUT5','fill',getBoolTag('QUANTUM_DDO_VALUE_5') ? 'rgb(0,255,0)' : 'rgb(255,0,0)');
	setStyle('OUTPUT6','fill',getBoolTag('QUANTUM_DDO_VALUE_6') ? 'rgb(0,255,0)' : 'rgb(255,0,0)');
	setStyle('OUTPUT7','fill',getBoolTag('QUANTUM_DDO_VALUE_7') ? 'rgb(0,255,0)' : 'rgb(255,0,0)');
	setStyle('OUTPUT8','fill',getBoolTag('QUANTUM_DDO_VALUE_8') ? 'rgb(0,255,0)' : 'rgb(255,0,0)');
	setStyle('OUTPUT9','fill',getBoolTag('QUANTUM_DDO_VALUE_9') ? 'rgb(0,255,0)' : 'rgb(255,0,0)');
	setStyle('OUTPUT10','fill',getBoolTag('QUANTUM_DDO_VALUE_10') ? 'rgb(0,255,0)' : 'rgb(255,0,0)');
	setStyle('OUTPUT11','fill',getBoolTag('QUANTUM_DDO_VALUE_11') ? 'rgb(0,255,0)' : 'rgb(255,0,0)');
	setStyle('OUTPUT12','fill',getBoolTag('QUANTUM_DDO_VALUE_12') ? 'rgb(0,255,0)' : 'rgb(255,0,0)');
	setStyle('OUTPUT13','fill',getBoolTag('QUANTUM_DDO_VALUE_13') ? 'rgb(0,255,0)' : 'rgb(255,0,0)');
	setStyle('OUTPUT14','fill',getBoolTag('QUANTUM_DDO_VALUE_14') ? 'rgb(0,255,0)' : 'rgb(255,0,0)');
	setStyle('OUTPUT15','fill',getBoolTag('QUANTUM_DDO_VALUE_15') ? 'rgb(0,255,0)' : 'rgb(255,0,0)');
	setStyle('OUTPUT16','fill',getBoolTag('QUANTUM_DDO_VALUE_16') ? 'rgb(0,255,0)' : 'rgb(255,0,0)');
	setStyle('OUTPUT17','fill',getBoolTag('QUANTUM_DDO_VALUE_17') ? 'rgb(0,255,0)' : 'rgb(255,0,0)');
	setStyle('OUTPUT18','fill',getBoolTag('QUANTUM_DDO_VALUE_18') ? 'rgb(0,255,0)' : 'rgb(255,0,0)');
	setStyle('OUTPUT19','fill',getBoolTag('QUANTUM_DDO_VALUE_19') ? 'rgb(0,255,0)' : 'rgb(255,0,0)');
	setStyle('OUTPUT20','fill',getBoolTag('QUANTUM_DDO_VALUE_20') ? 'rgb(0,255,0)' : 'rgb(255,0,0)');
	setStyle('OUTPUT21','fill',getBoolTag('QUANTUM_DDO_VALUE_21') ? 'rgb(0,255,0)' : 'rgb(255,0,0)');
	setStyle('OUTPUT22','fill',getBoolTag('QUANTUM_DDO_VALUE_22') ? 'rgb(0,255,0)' : 'rgb(255,0,0)');
	setStyle('OUTPUT23','fill',getBoolTag('QUANTUM_DDO_VALUE_23') ? 'rgb(0,255,0)' : 'rgb(255,0,0)');
	setStyle('OUTPUT24','fill',getBoolTag('QUANTUM_DDO_VALUE_24') ? 'rgb(0,255,0)' : 'rgb(255,0,0)');
	setStyle('OUTPUT25','fill',getBoolTag('QUANTUM_DDO_VALUE_25') ? 'rgb(0,255,0)' : 'rgb(255,0,0)');
	setStyle('OUTPUT26','fill',getBoolTag('QUANTUM_DDO_VALUE_26') ? 'rgb(0,255,0)' : 'rgb(255,0,0)');
	setStyle('OUTPUT27','fill',getBoolTag('QUANTUM_DDO_VALUE_27') ? 'rgb(0,255,0)' : 'rgb(255,0,0)');
	setStyle('OUTPUT28','fill',getBoolTag('QUANTUM_DDO_VALUE_28') ? 'rgb(0,255,0)' : 'rgb(255,0,0)');
	setStyle('OUTPUT29','fill',getBoolTag('QUANTUM_DDO_VALUE_29') ? 'rgb(0,255,0)' : 'rgb(255,0,0)');
	setStyle('OUTPUT30','fill',getBoolTag('QUANTUM_DDO_VALUE_30') ? 'rgb(0,255,0)' : 'rgb(255,0,0)');
	setStyle('OUTPUT31','fill',getBoolTag('QUANTUM_DDO_VALUE_31') ? 'rgb(0,255,0)' : 'rgb(255,0,0)');
	setStyle('OUTPUT32','fill',getBoolTag('QUANTUM_DDO_VALUE_32') ? 'rgb(0,255,0)' : 'rgb(255,0,0)');
	setStyle('OUTPUT33','fill',getBoolTag('QUANTUM_DDO_VALUE_33') ? 'rgb(0,255,0)' : 'rgb(255,0,0)');
	setStyle('OUTPUT34','fill',getBoolTag('QUANTUM_DDO_VALUE_34') ? 'rgb(0,255,0)' : 'rgb(255,0,0)');
	setStyle('OUTPUT35','fill',getBoolTag('QUANTUM_DDO_VALUE_35') ? 'rgb(0,255,0)' : 'rgb(255,0,0)');
	setStyle('OUTPUT36','fill',getBoolTag('QUANTUM_DDO_VALUE_36') ? 'rgb(0,255,0)' : 'rgb(255,0,0)');
	setStyle('OUTPUT37','fill',getBoolTag('QUANTUM_DDO_VALUE_37') ? 'rgb(0,255,0)' : 'rgb(255,0,0)');
	setStyle('OUTPUT38','fill',getBoolTag('QUANTUM_DDO_VALUE_38') ? 'rgb(0,255,0)' : 'rgb(255,0,0)');
	setStyle('OUTPUT39','fill',getBoolTag('QUANTUM_DDO_VALUE_39') ? 'rgb(0,255,0)' : 'rgb(255,0,0)');
	setStyle('OUTPUT40','fill',getBoolTag('QUANTUM_DDO_VALUE_40') ? 'rgb(0,255,0)' : 'rgb(255,0,0)');
	setStyle('OUTPUT41','fill',getBoolTag('QUANTUM_DDO_VALUE_41') ? 'rgb(0,255,0)' : 'rgb(255,0,0)');
	setStyle('OUTPUT42','fill',getBoolTag('QUANTUM_DDO_VALUE_42') ? 'rgb(0,255,0)' : 'rgb(255,0,0)');
	setStyle('OUTPUT43','fill',getBoolTag('QUANTUM_DDO_VALUE_43') ? 'rgb(0,255,0)' : 'rgb(255,0,0)');
	setStyle('OUTPUT44','fill',getBoolTag('QUANTUM_DDO_VALUE_44') ? 'rgb(0,255,0)' : 'rgb(255,0,0)');
	setStyle('OUTPUT45','fill',getBoolTag('QUANTUM_DDO_VALUE_45') ? 'rgb(0,255,0)' : 'rgb(255,0,0)');
	setStyle('OUTPUT46','fill',getBoolTag('QUANTUM_DDO_VALUE_46') ? 'rgb(0,255,0)' : 'rgb(255,0,0)');
	setStyle('OUTPUT47','fill',getBoolTag('QUANTUM_DDO_VALUE_47') ? 'rgb(0,255,0)' : 'rgb(255,0,0)');
	setStyle('OUTPUT48','fill',getBoolTag('QUANTUM_DDO_VALUE_48') ? 'rgb(0,255,0)' : 'rgb(255,0,0)');
	setStyle('OUTPUT49','fill',getBoolTag('QUANTUM_DDO_VALUE_49') ? 'rgb(0,255,0)' : 'rgb(255,0,0)');
	setStyle('OUTPUT50','fill',getBoolTag('QUANTUM_DDO_VALUE_50') ? 'rgb(0,255,0)' : 'rgb(255,0,0)');
	setStyle('OUTPUT51','fill',getBoolTag('QUANTUM_DDO_VALUE_51') ? 'rgb(0,255,0)' : 'rgb(255,0,0)');
	setStyle('OUTPUT52','fill',getBoolTag('QUANTUM_DDO_VALUE_52') ? 'rgb(0,255,0)' : 'rgb(255,0,0)');
	setStyle('OUTPUT53','fill',getBoolTag('QUANTUM_DDO_VALUE_53') ? 'rgb(0,255,0)' : 'rgb(255,0,0)');
	setStyle('OUTPUT54','fill',getBoolTag('QUANTUM_DDO_VALUE_54') ? 'rgb(0,255,0)' : 'rgb(255,0,0)');
	setStyle('OUTPUT55','fill',getBoolTag('QUANTUM_DDO_VALUE_55') ? 'rgb(0,255,0)' : 'rgb(255,0,0)');
	setStyle('OUTPUT56','fill',getBoolTag('QUANTUM_DDO_VALUE_56') ? 'rgb(0,255,0)' : 'rgb(255,0,0)');
	setStyle('OUTPUT57','fill',getBoolTag('QUANTUM_DDO_VALUE_57') ? 'rgb(0,255,0)' : 'rgb(255,0,0)');
	setStyle('OUTPUT58','fill',getBoolTag('QUANTUM_DDO_VALUE_58') ? 'rgb(0,255,0)' : 'rgb(255,0,0)');
	setStyle('OUTPUT59','fill',getBoolTag('QUANTUM_DDO_VALUE_59') ? 'rgb(0,255,0)' : 'rgb(255,0,0)');
	setStyle('OUTPUT60','fill',getBoolTag('QUANTUM_DDO_VALUE_60') ? 'rgb(0,255,0)' : 'rgb(255,0,0)');
	setStyle('OUTPUT61','fill',getBoolTag('QUANTUM_DDO_VALUE_61') ? 'rgb(0,255,0)' : 'rgb(255,0,0)');
	setStyle('OUTPUT62','fill',getBoolTag('QUANTUM_DDO_VALUE_62') ? 'rgb(0,255,0)' : 'rgb(255,0,0)');
	setStyle('OUTPUT63','fill',getBoolTag('QUANTUM_DDO_VALUE_63') ? 'rgb(0,255,0)' : 'rgb(255,0,0)');
	setStyle('OUTPUT64','fill',getBoolTag('QUANTUM_DDO_VALUE_64') ? 'rgb(0,255,0)' : 'rgb(255,0,0)');
	setStyle('OUTPUT65','fill',getBoolTag('QUANTUM_DDO_VALUE_65') ? 'rgb(0,255,0)' : 'rgb(255,0,0)');
	setStyle('OUTPUT66','fill',getBoolTag('QUANTUM_DDO_VALUE_66') ? 'rgb(0,255,0)' : 'rgb(255,0,0)');
	setStyle('OUTPUT67','fill',getBoolTag('QUANTUM_DDO_VALUE_67') ? 'rgb(0,255,0)' : 'rgb(255,0,0)');
	setStyle('OUTPUT68','fill',getBoolTag('QUANTUM_DDO_VALUE_68') ? 'rgb(0,255,0)' : 'rgb(255,0,0)');
	setStyle('OUTPUT69','fill',getBoolTag('QUANTUM_DDO_VALUE_69') ? 'rgb(0,255,0)' : 'rgb(255,0,0)');
	setStyle('OUTPUT70','fill',getBoolTag('QUANTUM_DDO_VALUE_70') ? 'rgb(0,255,0)' : 'rgb(255,0,0)');
	setStyle('OUTPUT71','fill',getBoolTag('QUANTUM_DDO_VALUE_71') ? 'rgb(0,255,0)' : 'rgb(255,0,0)');
	setStyle('OUTPUT72','fill',getBoolTag('QUANTUM_DDO_VALUE_72') ? 'rgb(0,255,0)' : 'rgb(255,0,0)');
	setStyle('OUTPUT73','fill',getBoolTag('QUANTUM_DDO_VALUE_73') ? 'rgb(0,255,0)' : 'rgb(255,0,0)');
	setStyle('OUTPUT74','fill',getBoolTag('QUANTUM_DDO_VALUE_74') ? 'rgb(0,255,0)' : 'rgb(255,0,0)');
	setStyle('OUTPUT75','fill',getBoolTag('QUANTUM_DDO_VALUE_75') ? 'rgb(0,255,0)' : 'rgb(255,0,0)');
	setStyle('OUTPUT76','fill',getBoolTag('QUANTUM_DDO_VALUE_76') ? 'rgb(0,255,0)' : 'rgb(255,0,0)');
	setStyle('OUTPUT77','fill',getBoolTag('QUANTUM_DDO_VALUE_77') ? 'rgb(0,255,0)' : 'rgb(255,0,0)');
	setStyle('OUTPUT78','fill',getBoolTag('QUANTUM_DDO_VALUE_78') ? 'rgb(0,255,0)' : 'rgb(255,0,0)');
	setStyle('OUTPUT79','fill',getBoolTag('QUANTUM_DDO_VALUE_79') ? 'rgb(0,255,0)' : 'rgb(255,0,0)');
	setStyle('OUTPUT80','fill',getBoolTag('QUANTUM_DDO_VALUE_80') ? 'rgb(0,255,0)' : 'rgb(255,0,0)');
	setStyle('OUTPUT81','fill',getBoolTag('QUANTUM_DDO_VALUE_81') ? 'rgb(0,255,0)' : 'rgb(255,0,0)');
	setStyle('OUTPUT82','fill',getBoolTag('QUANTUM_DDO_VALUE_82') ? 'rgb(0,255,0)' : 'rgb(255,0,0)');
	setStyle('OUTPUT83','fill',getBoolTag('QUANTUM_DDO_VALUE_83') ? 'rgb(0,255,0)' : 'rgb(255,0,0)');
	setStyle('OUTPUT84','fill',getBoolTag('QUANTUM_DDO_VALUE_84') ? 'rgb(0,255,0)' : 'rgb(255,0,0)');
	setStyle('OUTPUT85','fill',getBoolTag('QUANTUM_DDO_VALUE_85') ? 'rgb(0,255,0)' : 'rgb(255,0,0)');
	setStyle('OUTPUT86','fill',getBoolTag('QUANTUM_DDO_VALUE_86') ? 'rgb(0,255,0)' : 'rgb(255,0,0)');
	setStyle('OUTPUT87','fill',getBoolTag('QUANTUM_DDO_VALUE_87') ? 'rgb(0,255,0)' : 'rgb(255,0,0)');
	setStyle('OUTPUT88','fill',getBoolTag('QUANTUM_DDO_VALUE_88') ? 'rgb(0,255,0)' : 'rgb(255,0,0)');
	setStyle('OUTPUT89','fill',getBoolTag('QUANTUM_DDO_VALUE_89') ? 'rgb(0,255,0)' : 'rgb(255,0,0)');
	setStyle('OUTPUT90','fill',getBoolTag('QUANTUM_DDO_VALUE_90') ? 'rgb(0,255,0)' : 'rgb(255,0,0)');
	setStyle('OUTPUT91','fill',getBoolTag('QUANTUM_DDO_VALUE_91') ? 'rgb(0,255,0)' : 'rgb(255,0,0)');
	setStyle('OUTPUT92','fill',getBoolTag('QUANTUM_DDO_VALUE_92') ? 'rgb(0,255,0)' : 'rgb(255,0,0)');
	setStyle('OUTPUT93','fill',getBoolTag('QUANTUM_DDO_VALUE_93') ? 'rgb(0,255,0)' : 'rgb(255,0,0)');
	setStyle('OUTPUT94','fill',getBoolTag('QUANTUM_DDO_VALUE_94') ? 'rgb(0,255,0)' : 'rgb(255,0,0)');
	setStyle('OUTPUT95','fill',getBoolTag('QUANTUM_DDO_VALUE_95') ? 'rgb(0,255,0)' : 'rgb(255,0,0)');
	setStyle('OUTPUT96','fill',getBoolTag('QUANTUM_DDO_VALUE_96') ? 'rgb(0,255,0)' : 'rgb(255,0,0)');

	setText('MPK1_COUNTER',getFltTag('MPK1_COUNTER').format(3,''));
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