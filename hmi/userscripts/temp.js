//////////////////////////////////////////////////////////////////////////////////////////////
// Автор: Владимир Щербина <vns.scherbina@gmail.com>
// copyright 2017
// Версия: 1.0.0
// Модуль temp.js реализует анимацию и логику диалогового взаимодействия для видеокадра temp.
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
var selector=0;

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
	
	setHighlightButton('TKG_BUTTON','selector=0;');
	setHighlightButton('TPP_BUTTON','selector=1;');
	setHighlightButton('THPL_BUTTON_1','selector=2;');
	setHighlightButton('THPL_BUTTON_2','selector=3;');
	setHighlightButton('THPL_BUTTON_3','selector=4;');
	setHighlightButton('THPL_BUTTON_4','selector=5;');
	setHighlightButton('THPL_BUTTON_5','selector=6;');
	setHighlightButton('THPL_BUTTON_6','selector=7;');
	setHighlightButton('TSHA_BUTTON_1','selector=8;');
	setHighlightButton('TSHA_BUTTON_2','selector=9;');
	setHighlightButton('TSHA_BUTTON_3','selector=10;');
	setHighlightButton('TSHA_BUTTON_4','selector=11;');
	setHighlightButton('TSHA_BUTTON_5','selector=12;');
	setHighlightButton('TBOT_BUTTON_1','selector=13;');
	setHighlightButton('TBOT_BUTTON_2','selector=14;');
	setHighlightButton('TBOT_BUTTON_3','selector=15;');
	setHighlightButton('TBOT_BUTTON_4','selector=16;');
	setHighlightButton('TBOT_BUTTON_5','selector=17;');
	setHighlightButton('TBOT_BUTTON_6','selector=18;');
	setHighlightButton('TBOT_BUTTON_7','selector=19;');

	
	
	
	
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
	animateButton('TKG_I',selector==0);
	animateButton('TPP_I',selector==1);
	animateButton('THPL_I_1',selector==2);
	animateButton('THPL_I_2',selector==3);
	animateButton('THPL_I_3',selector==4);
	animateButton('THPL_I_4',selector==5);
	animateButton('THPL_I_5',selector==6);
	animateButton('THPL_I_6',selector==7);
	animateButton('TSHA_I_1',selector==8);
	animateButton('TSHA_I_2',selector==9);
	animateButton('TSHA_I_3',selector==10);
	animateButton('TSHA_I_4',selector==11);
	animateButton('TSHA_I_5',selector==12);
	animateButton('TBOT_I_1',selector==13);
	animateButton('TBOT_I_2',selector==14);
	animateButton('TBOT_I_3',selector==15);
	animateButton('TBOT_I_4',selector==16);
	animateButton('TBOT_I_5',selector==17);
	animateButton('TBOT_I_6',selector==18);
	animateButton('TBOT_I_7',selector==19);
	setVisibility('TKG_G',selector==0);
	setVisibility('TPP_G',selector==1);
	setVisibility('THPL_G_1',(selector>=2) && (selector<=7));
	setVisibility('TSHA_G_1',(selector>=8) && (selector<=12));
	setVisibility('TBOT_G_1',selector==13);
	setVisibility('TBOT_G_2',selector==14);
	setVisibility('TBOT_G_3',selector==15);
	setVisibility('TBOT_G_4',(selector>=16) && (selector<=19));

	switch (selector) {
		case 0:
			TKG_1=getFltTag('TKG_1');
			TKG_2=getFltTag('TKG_2');
			TKG_3=getFltTag('TKG_3');
			TKG_4=getFltTag('TKG_4');
			setText('TKG_1',TKG_1.format(0,''));
			setText('TKG_2',TKG_2.format(0,''));
			setText('TKG_3',TKG_3.format(0,''));
			setText('TKG_4',TKG_4.format(0,''));
			animateAlarmBackStroke('TKG_1');
			animateAlarmBackStroke('TKG_2');
			animateAlarmBackStroke('TKG_3');
			animateAlarmBackStroke('TKG_4');
			break;
		case 1:
			TPP_1=getFltTag('TPP_1');
			TPP_2=getFltTag('TPP_2');
			TPP_3=getFltTag('TPP_3');
			TPP_4=getFltTag('TPP_4');
			TPP_5=getFltTag('TPP_5');
			TPP_6=getFltTag('TPP_6');
			TPP_7=getFltTag('TPP_7');
			TPP_8=getFltTag('TPP_8');
			TPP_9=getFltTag('TPP_9');
			TPP_10=getFltTag('TPP_10');
			TPP_11=getFltTag('TPP_11');
			TPP_12=getFltTag('TPP_12');
			TPP_13=getFltTag('TPP_13');
			TPP_14=getFltTag('TPP_14');
			TPP_15=getFltTag('TPP_15');
			TPP_16=getFltTag('TPP_16');
			setText('TPP_1',TPP_1.format(0,''));
			setText('TPP_2',TPP_2.format(0,''));
			setText('TPP_3',TPP_3.format(0,''));
			setText('TPP_4',TPP_4.format(0,''));
			setText('TPP_5',TPP_5.format(0,''));
			setText('TPP_6',TPP_6.format(0,''));
			setText('TPP_7',TPP_7.format(0,''));
			setText('TPP_8',TPP_8.format(0,''));
			setText('TPP_9',TPP_9.format(0,''));
			setText('TPP_10',TPP_10.format(0,''));
			setText('TPP_11',TPP_11.format(0,''));
			setText('TPP_12',TPP_12.format(0,''));
			setText('TPP_13',TPP_13.format(0,''));
			setText('TPP_14',TPP_14.format(0,''));
			setText('TPP_15',TPP_15.format(0,''));
			setText('TPP_16',TPP_16.format(0,''));
			animateAlarmBackStroke('TPP_1');
			animateAlarmBackStroke('TPP_2');
			animateAlarmBackStroke('TPP_3');
			animateAlarmBackStroke('TPP_4');
			animateAlarmBackStroke('TPP_5');
			animateAlarmBackStroke('TPP_6');
			animateAlarmBackStroke('TPP_7');
			animateAlarmBackStroke('TPP_8');
			animateAlarmBackStroke('TPP_9');
			animateAlarmBackStroke('TPP_10');
			animateAlarmBackStroke('TPP_11');
			animateAlarmBackStroke('TPP_12');
			animateAlarmBackStroke('TPP_13');
			animateAlarmBackStroke('TPP_14');
			animateAlarmBackStroke('TPP_15');
			animateAlarmBackStroke('TPP_16');
			break;
		case 2:
			var THPL_1=getFltTag('THPL_1_1');
			var THPL_2=getFltTag('THPL_1_2');
			var THPL_3=getFltTag('THPL_1_3');
			var THPL_4=getFltTag('THPL_1_4');
			var THPL_5=getFltTag('THPL_1_5');
			var THPL_6=getFltTag('THPL_1_6');
			setText('THPL_1_1',THPL_1.format(0,''));
			setText('THPL_1_2',THPL_2.format(0,''));
			setText('THPL_1_3',THPL_3.format(0,''));
			setText('THPL_1_4',THPL_4.format(0,''));
			setText('THPL_1_5',THPL_5.format(0,''));
			setText('THPL_1_6',THPL_6.format(0,''));
			animateAlarmStroke('THPL_1_1_BACK','THPL_1_1');
			animateAlarmStroke('THPL_1_2_BACK','THPL_1_2');
			animateAlarmStroke('THPL_1_3_BACK','THPL_1_3');
			animateAlarmStroke('THPL_1_4_BACK','THPL_1_4');
			animateAlarmStroke('THPL_1_5_BACK','THPL_1_5');
			animateAlarmStroke('THPL_1_6_BACK','THPL_1_6');
			break;
		case 3:
			var THPL_1=getFltTag('THPL_2_1');
			var THPL_2=getFltTag('THPL_2_2');
			var THPL_3=getFltTag('THPL_2_3');
			var THPL_4=getFltTag('THPL_2_4');
			var THPL_5=getFltTag('THPL_2_5');
			var THPL_6=getFltTag('THPL_2_6');
			setText('THPL_1_1',THPL_1.format(0,''));
			setText('THPL_1_2',THPL_2.format(0,''));
			setText('THPL_1_3',THPL_3.format(0,''));
			setText('THPL_1_4',THPL_4.format(0,''));
			setText('THPL_1_5',THPL_5.format(0,''));
			setText('THPL_1_6',THPL_6.format(0,''));
			animateAlarmStroke('THPL_1_1_BACK','THPL_2_1');
			animateAlarmStroke('THPL_1_2_BACK','THPL_2_2');
			animateAlarmStroke('THPL_1_3_BACK','THPL_2_3');
			animateAlarmStroke('THPL_1_4_BACK','THPL_2_4');
			animateAlarmStroke('THPL_1_5_BACK','THPL_2_5');
			animateAlarmStroke('THPL_1_6_BACK','THPL_2_6');
			break;
		case 4:
			var THPL_1=getFltTag('THPL_3_1');
			var THPL_2=getFltTag('THPL_3_2');
			var THPL_3=getFltTag('THPL_3_3');
			var THPL_4=getFltTag('THPL_3_4');
			var THPL_5=getFltTag('THPL_3_5');
			var THPL_6=getFltTag('THPL_3_6');
			setText('THPL_1_1',THPL_1.format(0,''));
			setText('THPL_1_2',THPL_2.format(0,''));
			setText('THPL_1_3',THPL_3.format(0,''));
			setText('THPL_1_4',THPL_4.format(0,''));
			setText('THPL_1_5',THPL_5.format(0,''));
			setText('THPL_1_6',THPL_6.format(0,''));
			animateAlarmStroke('THPL_1_1_BACK','THPL_3_1');
			animateAlarmStroke('THPL_1_2_BACK','THPL_3_2');
			animateAlarmStroke('THPL_1_3_BACK','THPL_3_3');
			animateAlarmStroke('THPL_1_4_BACK','THPL_3_4');
			animateAlarmStroke('THPL_1_5_BACK','THPL_3_5');
			animateAlarmStroke('THPL_1_6_BACK','THPL_3_6');
			break;
		case 5:
			var THPL_1=getFltTag('THPL_4_1');
			var THPL_2=getFltTag('THPL_4_2');
			var THPL_3=getFltTag('THPL_4_3');
			var THPL_4=getFltTag('THPL_4_4');
			var THPL_5=getFltTag('THPL_4_5');
			var THPL_6=getFltTag('THPL_4_6');
			setText('THPL_1_1',THPL_1.format(0,''));
			setText('THPL_1_2',THPL_2.format(0,''));
			setText('THPL_1_3',THPL_3.format(0,''));
			setText('THPL_1_4',THPL_4.format(0,''));
			setText('THPL_1_5',THPL_5.format(0,''));
			setText('THPL_1_6',THPL_6.format(0,''));
			animateAlarmStroke('THPL_1_1_BACK','THPL_4_1');
			animateAlarmStroke('THPL_1_2_BACK','THPL_4_2');
			animateAlarmStroke('THPL_1_3_BACK','THPL_4_3');
			animateAlarmStroke('THPL_1_4_BACK','THPL_4_4');
			animateAlarmStroke('THPL_1_5_BACK','THPL_4_5');
			animateAlarmStroke('THPL_1_6_BACK','THPL_4_6');
			break;
		case 6:
			var THPL_1=getFltTag('THPL_5_1');
			var THPL_2=getFltTag('THPL_5_2');
			var THPL_3=getFltTag('THPL_5_3');
			var THPL_4=getFltTag('THPL_5_4');
			var THPL_5=getFltTag('THPL_5_5');
			var THPL_6=getFltTag('THPL_5_6');
			setText('THPL_1_1',THPL_1.format(0,''));
			setText('THPL_1_2',THPL_2.format(0,''));
			setText('THPL_1_3',THPL_3.format(0,''));
			setText('THPL_1_4',THPL_4.format(0,''));
			setText('THPL_1_5',THPL_5.format(0,''));
			setText('THPL_1_6',THPL_6.format(0,''));
			animateAlarmStroke('THPL_1_1_BACK','THPL_5_1');
			animateAlarmStroke('THPL_1_2_BACK','THPL_5_2');
			animateAlarmStroke('THPL_1_3_BACK','THPL_5_3');
			animateAlarmStroke('THPL_1_4_BACK','THPL_5_4');
			animateAlarmStroke('THPL_1_5_BACK','THPL_5_5');
			animateAlarmStroke('THPL_1_6_BACK','THPL_5_6');
			break;
		case 7:
			var THPL_1=getFltTag('THPL_6_1');
			var THPL_2=getFltTag('THPL_6_2');
			var THPL_3=getFltTag('THPL_6_3');
			var THPL_4=getFltTag('THPL_6_4');
			var THPL_5=getFltTag('THPL_6_5');
			var THPL_6=getFltTag('THPL_6_6');
			setText('THPL_1_1',THPL_1.format(0,''));
			setText('THPL_1_2',THPL_2.format(0,''));
			setText('THPL_1_3',THPL_3.format(0,''));
			setText('THPL_1_4',THPL_4.format(0,''));
			setText('THPL_1_5',THPL_5.format(0,''));
			setText('THPL_1_6',THPL_6.format(0,''));
			animateAlarmStroke('THPL_1_1_BACK','THPL_6_1');
			animateAlarmStroke('THPL_1_2_BACK','THPL_6_2');
			animateAlarmStroke('THPL_1_3_BACK','THPL_6_3');
			animateAlarmStroke('THPL_1_4_BACK','THPL_6_4');
			animateAlarmStroke('THPL_1_5_BACK','THPL_6_5');
			animateAlarmStroke('THPL_1_6_BACK','THPL_6_6');
			break;
		case 8:
			var TSHA_1=getFltTag('TSHA_1_1');
			var TSHA_2=getFltTag('TSHA_1_2');
			var TSHA_3=getFltTag('TSHA_1_3');
			var TSHA_4=getFltTag('TSHA_1_4');
			var TSHA_5=getFltTag('TSHA_1_5');
			var TSHA_6=getFltTag('TSHA_1_6');
			var TSHA_7=getFltTag('TSHA_1_7');
			var TSHA_8=getFltTag('TSHA_1_8');
			var TSHA_9=getFltTag('TSHA_1_9');
			var TSHA_10=getFltTag('TSHA_1_10');
			var TSHA_11=getFltTag('TSHA_1_11');
			var TSHA_12=getFltTag('TSHA_1_12');
			var TSHA_13=getFltTag('TSHA_1_13');
			var TSHA_14=getFltTag('TSHA_1_14');
			var TSHA_15=getFltTag('TSHA_1_15');
			var TSHA_16=getFltTag('TSHA_1_16');
			var TSHA_17=getFltTag('TSHA_1_17');
			var TSHA_18=getFltTag('TSHA_1_18');
			setText('TSHA_1_1',TSHA_1.format(0,''));
			setText('TSHA_1_2',TSHA_2.format(0,''));
			setText('TSHA_1_3',TSHA_3.format(0,''));
			setText('TSHA_1_4',TSHA_4.format(0,''));
			setText('TSHA_1_5',TSHA_5.format(0,''));
			setText('TSHA_1_6',TSHA_6.format(0,''));
			setText('TSHA_1_7',TSHA_7.format(0,''));
			setText('TSHA_1_8',TSHA_8.format(0,''));
			setText('TSHA_1_9',TSHA_9.format(0,''));
			setText('TSHA_1_10',TSHA_10.format(0,''));
			setText('TSHA_1_11',TSHA_11.format(0,''));
			setText('TSHA_1_12',TSHA_12.format(0,''));
			setText('TSHA_1_13',TSHA_13.format(0,''));
			setText('TSHA_1_14',TSHA_14.format(0,''));
			setText('TSHA_1_15',TSHA_15.format(0,''));
			setText('TSHA_1_16',TSHA_16.format(0,''));
			setText('TSHA_1_17',TSHA_17.format(0,''));
			setText('TSHA_1_18',TSHA_18.format(0,''));
			animateAlarmStroke('TSHA_1_1_BACK','TSHA_1_1');
			animateAlarmStroke('TSHA_1_2_BACK','TSHA_1_2');
			animateAlarmStroke('TSHA_1_3_BACK','TSHA_1_3');
			animateAlarmStroke('TSHA_1_4_BACK','TSHA_1_4');
			animateAlarmStroke('TSHA_1_5_BACK','TSHA_1_5');
			animateAlarmStroke('TSHA_1_6_BACK','TSHA_1_6');
			animateAlarmStroke('TSHA_1_7_BACK','TSHA_1_7');
			animateAlarmStroke('TSHA_1_8_BACK','TSHA_1_8');
			animateAlarmStroke('TSHA_1_9_BACK','TSHA_1_9');
			animateAlarmStroke('TSHA_1_10_BACK','TSHA_1_10');
			animateAlarmStroke('TSHA_1_11_BACK','TSHA_1_11');
			animateAlarmStroke('TSHA_1_12_BACK','TSHA_1_12');
			animateAlarmStroke('TSHA_1_13_BACK','TSHA_1_13');
			animateAlarmStroke('TSHA_1_14_BACK','TSHA_1_14');
			animateAlarmStroke('TSHA_1_15_BACK','TSHA_1_15');
			animateAlarmStroke('TSHA_1_16_BACK','TSHA_1_16');
			animateAlarmStroke('TSHA_1_17_BACK','TSHA_1_17');
			animateAlarmStroke('TSHA_1_18_BACK','TSHA_1_18');
			break;
		case 9:
			var TSHA_1=getFltTag('TSHA_2_1');
			var TSHA_2=getFltTag('TSHA_2_2');
			var TSHA_3=getFltTag('TSHA_2_3');
			var TSHA_4=getFltTag('TSHA_2_4');
			var TSHA_5=getFltTag('TSHA_2_5');
			var TSHA_6=getFltTag('TSHA_2_6');
			var TSHA_7=getFltTag('TSHA_2_7');
			var TSHA_8=getFltTag('TSHA_2_8');
			var TSHA_9=getFltTag('TSHA_2_9');
			var TSHA_10=getFltTag('TSHA_2_10');
			var TSHA_11=getFltTag('TSHA_2_11');
			var TSHA_12=getFltTag('TSHA_2_12');
			var TSHA_13=getFltTag('TSHA_2_13');
			var TSHA_14=getFltTag('TSHA_2_14');
			var TSHA_15=getFltTag('TSHA_2_15');
			var TSHA_16=getFltTag('TSHA_2_16');
			var TSHA_17=getFltTag('TSHA_2_17');
			var TSHA_18=getFltTag('TSHA_2_18');
			setText('TSHA_1_1',TSHA_1.format(0,''));
			setText('TSHA_1_2',TSHA_2.format(0,''));
			setText('TSHA_1_3',TSHA_3.format(0,''));
			setText('TSHA_1_4',TSHA_4.format(0,''));
			setText('TSHA_1_5',TSHA_5.format(0,''));
			setText('TSHA_1_6',TSHA_6.format(0,''));
			setText('TSHA_1_7',TSHA_7.format(0,''));
			setText('TSHA_1_8',TSHA_8.format(0,''));
			setText('TSHA_1_9',TSHA_9.format(0,''));
			setText('TSHA_1_10',TSHA_10.format(0,''));
			setText('TSHA_1_11',TSHA_11.format(0,''));
			setText('TSHA_1_12',TSHA_12.format(0,''));
			setText('TSHA_1_13',TSHA_13.format(0,''));
			setText('TSHA_1_14',TSHA_14.format(0,''));
			setText('TSHA_1_15',TSHA_15.format(0,''));
			setText('TSHA_1_16',TSHA_16.format(0,''));
			setText('TSHA_1_17',TSHA_17.format(0,''));
			setText('TSHA_1_18',TSHA_18.format(0,''));
			animateAlarmStroke('TSHA_1_1_BACK','TSHA_2_1');
			animateAlarmStroke('TSHA_1_2_BACK','TSHA_2_2');
			animateAlarmStroke('TSHA_1_3_BACK','TSHA_2_3');
			animateAlarmStroke('TSHA_1_4_BACK','TSHA_2_4');
			animateAlarmStroke('TSHA_1_5_BACK','TSHA_2_5');
			animateAlarmStroke('TSHA_1_6_BACK','TSHA_2_6');
			animateAlarmStroke('TSHA_1_7_BACK','TSHA_2_7');
			animateAlarmStroke('TSHA_1_8_BACK','TSHA_2_8');
			animateAlarmStroke('TSHA_1_9_BACK','TSHA_2_9');
			animateAlarmStroke('TSHA_1_10_BACK','TSHA_2_10');
			animateAlarmStroke('TSHA_1_11_BACK','TSHA_2_11');
			animateAlarmStroke('TSHA_1_12_BACK','TSHA_2_12');
			animateAlarmStroke('TSHA_1_13_BACK','TSHA_2_13');
			animateAlarmStroke('TSHA_1_14_BACK','TSHA_2_14');
			animateAlarmStroke('TSHA_1_15_BACK','TSHA_2_15');
			animateAlarmStroke('TSHA_1_16_BACK','TSHA_2_16');
			animateAlarmStroke('TSHA_1_17_BACK','TSHA_2_17');
			animateAlarmStroke('TSHA_1_18_BACK','TSHA_2_18');
			break;
		case 10:
			var TSHA_1=getFltTag('TSHA_3_1');
			var TSHA_2=getFltTag('TSHA_3_2');
			var TSHA_3=getFltTag('TSHA_3_3');
			var TSHA_4=getFltTag('TSHA_3_4');
			var TSHA_5=getFltTag('TSHA_3_5');
			var TSHA_6=getFltTag('TSHA_3_6');
			var TSHA_7=getFltTag('TSHA_3_7');
			var TSHA_8=getFltTag('TSHA_3_8');
			var TSHA_9=getFltTag('TSHA_3_9');
			var TSHA_10=getFltTag('TSHA_3_10');
			var TSHA_11=getFltTag('TSHA_3_11');
			var TSHA_12=getFltTag('TSHA_3_12');
			var TSHA_13=getFltTag('TSHA_3_13');
			var TSHA_14=getFltTag('TSHA_3_14');
			var TSHA_15=getFltTag('TSHA_3_15');
			var TSHA_16=getFltTag('TSHA_3_16');
			var TSHA_17=getFltTag('TSHA_3_17');
			var TSHA_18=getFltTag('TSHA_3_18');
			setText('TSHA_1_1',TSHA_1.format(0,''));
			setText('TSHA_1_2',TSHA_2.format(0,''));
			setText('TSHA_1_3',TSHA_3.format(0,''));
			setText('TSHA_1_4',TSHA_4.format(0,''));
			setText('TSHA_1_5',TSHA_5.format(0,''));
			setText('TSHA_1_6',TSHA_6.format(0,''));
			setText('TSHA_1_7',TSHA_7.format(0,''));
			setText('TSHA_1_8',TSHA_8.format(0,''));
			setText('TSHA_1_9',TSHA_9.format(0,''));
			setText('TSHA_1_10',TSHA_10.format(0,''));
			setText('TSHA_1_11',TSHA_11.format(0,''));
			setText('TSHA_1_12',TSHA_12.format(0,''));
			setText('TSHA_1_13',TSHA_13.format(0,''));
			setText('TSHA_1_14',TSHA_14.format(0,''));
			setText('TSHA_1_15',TSHA_15.format(0,''));
			setText('TSHA_1_16',TSHA_16.format(0,''));
			setText('TSHA_1_17',TSHA_17.format(0,''));
			setText('TSHA_1_18',TSHA_18.format(0,''));
			animateAlarmStroke('TSHA_1_1_BACK','TSHA_3_1');
			animateAlarmStroke('TSHA_1_2_BACK','TSHA_3_2');
			animateAlarmStroke('TSHA_1_3_BACK','TSHA_3_3');
			animateAlarmStroke('TSHA_1_4_BACK','TSHA_3_4');
			animateAlarmStroke('TSHA_1_5_BACK','TSHA_3_5');
			animateAlarmStroke('TSHA_1_6_BACK','TSHA_3_6');
			animateAlarmStroke('TSHA_1_7_BACK','TSHA_3_7');
			animateAlarmStroke('TSHA_1_8_BACK','TSHA_3_8');
			animateAlarmStroke('TSHA_1_9_BACK','TSHA_3_9');
			animateAlarmStroke('TSHA_1_10_BACK','TSHA_3_10');
			animateAlarmStroke('TSHA_1_11_BACK','TSHA_3_11');
			animateAlarmStroke('TSHA_1_12_BACK','TSHA_3_12');
			animateAlarmStroke('TSHA_1_13_BACK','TSHA_3_13');
			animateAlarmStroke('TSHA_1_14_BACK','TSHA_3_14');
			animateAlarmStroke('TSHA_1_15_BACK','TSHA_3_15');
			animateAlarmStroke('TSHA_1_16_BACK','TSHA_3_16');
			animateAlarmStroke('TSHA_1_17_BACK','TSHA_3_17');
			animateAlarmStroke('TSHA_1_18_BACK','TSHA_3_18');
			break;
		case 11:
			var TSHA_1=getFltTag('TSHA_4_1');
			var TSHA_2=getFltTag('TSHA_4_2');
			var TSHA_3=getFltTag('TSHA_4_3');
			var TSHA_4=getFltTag('TSHA_4_4');
			var TSHA_5=getFltTag('TSHA_4_5');
			var TSHA_6=getFltTag('TSHA_4_6');
			var TSHA_7=getFltTag('TSHA_4_7');
			var TSHA_8=getFltTag('TSHA_4_8');
			var TSHA_9=getFltTag('TSHA_4_9');
			var TSHA_10=getFltTag('TSHA_4_10');
			var TSHA_11=getFltTag('TSHA_4_11');
			var TSHA_12=getFltTag('TSHA_4_12');
			var TSHA_13=getFltTag('TSHA_4_13');
			var TSHA_14=getFltTag('TSHA_4_14');
			var TSHA_15=getFltTag('TSHA_4_15');
			var TSHA_16=getFltTag('TSHA_4_16');
			var TSHA_17=getFltTag('TSHA_4_17');
			var TSHA_18=getFltTag('TSHA_4_18');
			setText('TSHA_1_1',TSHA_1.format(0,''));
			setText('TSHA_1_2',TSHA_2.format(0,''));
			setText('TSHA_1_3',TSHA_3.format(0,''));
			setText('TSHA_1_4',TSHA_4.format(0,''));
			setText('TSHA_1_5',TSHA_5.format(0,''));
			setText('TSHA_1_6',TSHA_6.format(0,''));
			setText('TSHA_1_7',TSHA_7.format(0,''));
			setText('TSHA_1_8',TSHA_8.format(0,''));
			setText('TSHA_1_9',TSHA_9.format(0,''));
			setText('TSHA_1_10',TSHA_10.format(0,''));
			setText('TSHA_1_11',TSHA_11.format(0,''));
			setText('TSHA_1_12',TSHA_12.format(0,''));
			setText('TSHA_1_13',TSHA_13.format(0,''));
			setText('TSHA_1_14',TSHA_14.format(0,''));
			setText('TSHA_1_15',TSHA_15.format(0,''));
			setText('TSHA_1_16',TSHA_16.format(0,''));
			setText('TSHA_1_17',TSHA_17.format(0,''));
			setText('TSHA_1_18',TSHA_18.format(0,''));
			animateAlarmStroke('TSHA_1_1_BACK','TSHA_4_1');
			animateAlarmStroke('TSHA_1_2_BACK','TSHA_4_2');
			animateAlarmStroke('TSHA_1_3_BACK','TSHA_4_3');
			animateAlarmStroke('TSHA_1_4_BACK','TSHA_4_4');
			animateAlarmStroke('TSHA_1_5_BACK','TSHA_4_5');
			animateAlarmStroke('TSHA_1_6_BACK','TSHA_4_6');
			animateAlarmStroke('TSHA_1_7_BACK','TSHA_4_7');
			animateAlarmStroke('TSHA_1_8_BACK','TSHA_4_8');
			animateAlarmStroke('TSHA_1_9_BACK','TSHA_4_9');
			animateAlarmStroke('TSHA_1_10_BACK','TSHA_4_10');
			animateAlarmStroke('TSHA_1_11_BACK','TSHA_4_11');
			animateAlarmStroke('TSHA_1_12_BACK','TSHA_4_12');
			animateAlarmStroke('TSHA_1_13_BACK','TSHA_4_13');
			animateAlarmStroke('TSHA_1_14_BACK','TSHA_4_14');
			animateAlarmStroke('TSHA_1_15_BACK','TSHA_4_15');
			animateAlarmStroke('TSHA_1_16_BACK','TSHA_4_16');
			animateAlarmStroke('TSHA_1_17_BACK','TSHA_4_17');
			animateAlarmStroke('TSHA_1_18_BACK','TSHA_4_18');
			break;
		case 12:
			var TSHA_1=getFltTag('TSHA_5_1');
			var TSHA_2=getFltTag('TSHA_5_2');
			var TSHA_3=getFltTag('TSHA_5_3');
			var TSHA_4=getFltTag('TSHA_5_4');
			var TSHA_5=getFltTag('TSHA_5_5');
			var TSHA_6=getFltTag('TSHA_5_6');
			var TSHA_7=getFltTag('TSHA_5_7');
			var TSHA_8=getFltTag('TSHA_5_8');
			var TSHA_9=getFltTag('TSHA_5_9');
			var TSHA_10=getFltTag('TSHA_5_10');
			var TSHA_11=getFltTag('TSHA_5_11');
			var TSHA_12=getFltTag('TSHA_5_12');
			var TSHA_13=getFltTag('TSHA_5_13');
			var TSHA_14=getFltTag('TSHA_5_14');
			var TSHA_15=getFltTag('TSHA_5_15');
			var TSHA_16=getFltTag('TSHA_5_16');
			var TSHA_17=getFltTag('TSHA_5_17');
			var TSHA_18=getFltTag('TSHA_5_18');
			setText('TSHA_1_1',TSHA_1.format(0,''));
			setText('TSHA_1_2',TSHA_2.format(0,''));
			setText('TSHA_1_3',TSHA_3.format(0,''));
			setText('TSHA_1_4',TSHA_4.format(0,''));
			setText('TSHA_1_5',TSHA_5.format(0,''));
			setText('TSHA_1_6',TSHA_6.format(0,''));
			setText('TSHA_1_7',TSHA_7.format(0,''));
			setText('TSHA_1_8',TSHA_8.format(0,''));
			setText('TSHA_1_9',TSHA_9.format(0,''));
			setText('TSHA_1_10',TSHA_10.format(0,''));
			setText('TSHA_1_11',TSHA_11.format(0,''));
			setText('TSHA_1_12',TSHA_12.format(0,''));
			setText('TSHA_1_13',TSHA_13.format(0,''));
			setText('TSHA_1_14',TSHA_14.format(0,''));
			setText('TSHA_1_15',TSHA_15.format(0,''));
			setText('TSHA_1_16',TSHA_16.format(0,''));
			setText('TSHA_1_17',TSHA_17.format(0,''));
			setText('TSHA_1_18',TSHA_18.format(0,''));
			animateAlarmStroke('TSHA_1_1_BACK','TSHA_5_1');
			animateAlarmStroke('TSHA_1_2_BACK','TSHA_5_2');
			animateAlarmStroke('TSHA_1_3_BACK','TSHA_5_3');
			animateAlarmStroke('TSHA_1_4_BACK','TSHA_5_4');
			animateAlarmStroke('TSHA_1_5_BACK','TSHA_5_5');
			animateAlarmStroke('TSHA_1_6_BACK','TSHA_5_6');
			animateAlarmStroke('TSHA_1_7_BACK','TSHA_5_7');
			animateAlarmStroke('TSHA_1_8_BACK','TSHA_5_8');
			animateAlarmStroke('TSHA_1_9_BACK','TSHA_5_9');
			animateAlarmStroke('TSHA_1_10_BACK','TSHA_5_10');
			animateAlarmStroke('TSHA_1_11_BACK','TSHA_5_11');
			animateAlarmStroke('TSHA_1_12_BACK','TSHA_5_12');
			animateAlarmStroke('TSHA_1_13_BACK','TSHA_5_13');
			animateAlarmStroke('TSHA_1_14_BACK','TSHA_5_14');
			animateAlarmStroke('TSHA_1_15_BACK','TSHA_5_15');
			animateAlarmStroke('TSHA_1_16_BACK','TSHA_5_16');
			animateAlarmStroke('TSHA_1_17_BACK','TSHA_5_17');
			animateAlarmStroke('TSHA_1_18_BACK','TSHA_5_18');
			break;
		case 13:
			var TBOT_1=getFltTag('TBOT_1_1');
			var TBOT_2=getFltTag('TBOT_1_2');
			var TBOT_3=getFltTag('TBOT_1_3');
			var TBOT_4=getFltTag('TBOT_1_4');
			var TBOT_5=getFltTag('TBOT_1_5');
			var TBOT_6=getFltTag('TBOT_1_6');
			setText('TBOT_1_1',TBOT_1.format(0,''));
			setText('TBOT_1_2',TBOT_2.format(0,''));
			setText('TBOT_1_3',TBOT_3.format(0,''));
			setText('TBOT_1_4',TBOT_4.format(0,''));
			setText('TBOT_1_5',TBOT_5.format(0,''));
			setText('TBOT_1_6',TBOT_6.format(0,''));
			animateAlarmStroke('TBOT_1_1_BACK','TBOT_1_1');
			animateAlarmStroke('TBOT_1_2_BACK','TBOT_1_2');
			animateAlarmStroke('TBOT_1_3_BACK','TBOT_1_3');
			animateAlarmStroke('TBOT_1_4_BACK','TBOT_1_4');
			animateAlarmStroke('TBOT_1_5_BACK','TBOT_1_5');
			animateAlarmStroke('TBOT_1_6_BACK','TBOT_1_6');
			break;
		case 14:
			var TBOT_1=getFltTag('TBOT_2_1');
			var TBOT_2=getFltTag('TBOT_2_2');
			var TBOT_3=getFltTag('TBOT_2_3');
			var TBOT_4=getFltTag('TBOT_2_4');
			var TBOT_5=getFltTag('TBOT_2_5');
			var TBOT_6=getFltTag('TBOT_2_6');
			var TBOT_7=getFltTag('TBOT_2_7');
			var TBOT_8=getFltTag('TBOT_2_8');
			var TBOT_9=getFltTag('TBOT_2_9');
			var TBOT_10=getFltTag('TBOT_2_10');
			setText('TBOT_2_1',TBOT_1.format(0,''));
			setText('TBOT_2_2',TBOT_2.format(0,''));
			setText('TBOT_2_3',TBOT_3.format(0,''));
			setText('TBOT_2_4',TBOT_4.format(0,''));
			setText('TBOT_2_5',TBOT_5.format(0,''));
			setText('TBOT_2_6',TBOT_6.format(0,''));
			setText('TBOT_2_7',TBOT_7.format(0,''));
			setText('TBOT_2_8',TBOT_8.format(0,''));
			setText('TBOT_2_9',TBOT_9.format(0,''));
			setText('TBOT_2_10',TBOT_10.format(0,''));
			animateAlarmStroke('TBOT_2_1_BACK','TBOT_2_1');
			animateAlarmStroke('TBOT_2_2_BACK','TBOT_2_2');
			animateAlarmStroke('TBOT_2_3_BACK','TBOT_2_3');
			animateAlarmStroke('TBOT_2_4_BACK','TBOT_2_4');
			animateAlarmStroke('TBOT_2_5_BACK','TBOT_2_5');
			animateAlarmStroke('TBOT_2_6_BACK','TBOT_2_6');
			animateAlarmStroke('TBOT_2_7_BACK','TBOT_2_7');
			animateAlarmStroke('TBOT_2_8_BACK','TBOT_2_8');
			animateAlarmStroke('TBOT_2_9_BACK','TBOT_2_9');
			animateAlarmStroke('TBOT_2_10_BACK','TBOT_2_10');
			break;
		case 15:
			var TBOT_1=getFltTag('TBOT_3_1');
			var TBOT_2=getFltTag('TBOT_3_2');
			var TBOT_3=getFltTag('TBOT_3_3');
			var TBOT_4=getFltTag('TBOT_3_4');
			var TBOT_5=getFltTag('TBOT_3_5');
			var TBOT_6=getFltTag('TBOT_3_6');
			var TBOT_7=getFltTag('TBOT_3_7');
			var TBOT_8=getFltTag('TBOT_3_8');
			var TBOT_9=getFltTag('TBOT_3_9');
			var TBOT_10=getFltTag('TBOT_3_10');
			var TBOT_11=getFltTag('TBOT_3_11');
			var TBOT_12=getFltTag('TBOT_3_12');
			var TBOT_13=getFltTag('TBOT_3_13');
			var TBOT_14=getFltTag('TBOT_3_14');
			var TBOT_15=getFltTag('TBOT_3_15');
			var TBOT_16=getFltTag('TBOT_3_16');
			var TBOT_17=getFltTag('TBOT_3_17');
			var TBOT_18=getFltTag('TBOT_3_18');
			var TBOT_19=getFltTag('TBOT_3_19');
			var TBOT_20=getFltTag('TBOT_3_20');
			var TBOT_21=getFltTag('TBOT_3_21');
			var TBOT_22=getFltTag('TBOT_3_22');
			var TBOT_23=getFltTag('TBOT_3_23');
			var TBOT_24=getFltTag('TBOT_3_24');
			setText('TBOT_3_1',TBOT_1.format(0,''));
			setText('TBOT_3_2',TBOT_2.format(0,''));
			setText('TBOT_3_3',TBOT_3.format(0,''));
			setText('TBOT_3_4',TBOT_4.format(0,''));
			setText('TBOT_3_5',TBOT_5.format(0,''));
			setText('TBOT_3_6',TBOT_6.format(0,''));
			setText('TBOT_3_7',TBOT_7.format(0,''));
			setText('TBOT_3_8',TBOT_8.format(0,''));
			setText('TBOT_3_9',TBOT_9.format(0,''));
			setText('TBOT_3_10',TBOT_10.format(0,''));
			setText('TBOT_3_11',TBOT_11.format(0,''));
			setText('TBOT_3_12',TBOT_12.format(0,''));
			setText('TBOT_3_13',TBOT_13.format(0,''));
			setText('TBOT_3_14',TBOT_14.format(0,''));
			setText('TBOT_3_15',TBOT_15.format(0,''));
			setText('TBOT_3_16',TBOT_16.format(0,''));
			setText('TBOT_3_17',TBOT_17.format(0,''));
			setText('TBOT_3_18',TBOT_18.format(0,''));
			setText('TBOT_3_19',TBOT_19.format(0,''));
			setText('TBOT_3_20',TBOT_20.format(0,''));
			setText('TBOT_3_21',TBOT_21.format(0,''));
			setText('TBOT_3_22',TBOT_22.format(0,''));
			setText('TBOT_3_23',TBOT_23.format(0,''));
			setText('TBOT_3_24',TBOT_24.format(0,''));
			animateAlarmStroke('TBOT_3_1_BACK','TBOT_3_1');
			animateAlarmStroke('TBOT_3_2_BACK','TBOT_3_2');
			animateAlarmStroke('TBOT_3_3_BACK','TBOT_3_3');
			animateAlarmStroke('TBOT_3_4_BACK','TBOT_3_4');
			animateAlarmStroke('TBOT_3_5_BACK','TBOT_3_5');
			animateAlarmStroke('TBOT_3_6_BACK','TBOT_3_6');
			animateAlarmStroke('TBOT_3_7_BACK','TBOT_3_7');
			animateAlarmStroke('TBOT_3_8_BACK','TBOT_3_8');
			animateAlarmStroke('TBOT_3_9_BACK','TBOT_3_9');
			animateAlarmStroke('TBOT_3_10_BACK','TBOT_3_10');
			animateAlarmStroke('TBOT_3_11_BACK','TBOT_3_11');
			animateAlarmStroke('TBOT_3_12_BACK','TBOT_3_12');
			animateAlarmStroke('TBOT_3_13_BACK','TBOT_3_13');
			animateAlarmStroke('TBOT_3_14_BACK','TBOT_3_14');
			animateAlarmStroke('TBOT_3_15_BACK','TBOT_3_15');
			animateAlarmStroke('TBOT_3_16_BACK','TBOT_3_16');
			animateAlarmStroke('TBOT_3_17_BACK','TBOT_3_17');
			animateAlarmStroke('TBOT_3_18_BACK','TBOT_3_18');
			animateAlarmStroke('TBOT_3_19_BACK','TBOT_3_19');
			animateAlarmStroke('TBOT_3_20_BACK','TBOT_3_20');
			animateAlarmStroke('TBOT_3_21_BACK','TBOT_3_21');
			animateAlarmStroke('TBOT_3_22_BACK','TBOT_3_22');
			animateAlarmStroke('TBOT_3_23_BACK','TBOT_3_23');
			animateAlarmStroke('TBOT_3_24_BACK','TBOT_3_24');
			break;
		case 16:
			var TBOT_1=getFltTag('TBOT_4_1');
			var TBOT_2=getFltTag('TBOT_4_2');
			var TBOT_3=getFltTag('TBOT_4_3');
			var TBOT_4=getFltTag('TBOT_4_4');
			var TBOT_5=getFltTag('TBOT_4_5');
			var TBOT_6=getFltTag('TBOT_4_6');
			var TBOT_7=getFltTag('TBOT_4_7');
			var TBOT_8=getFltTag('TBOT_4_8');
			var TBOT_9=getFltTag('TBOT_4_9');
			var TBOT_10=getFltTag('TBOT_4_10');
			var TBOT_11=getFltTag('TBOT_4_11');
			var TBOT_12=getFltTag('TBOT_4_12');
			var TBOT_13=getFltTag('TBOT_4_13');
			var TBOT_14=getFltTag('TBOT_4_14');
			setText('TBOT_4_1',TBOT_1.format(0,''));
			setText('TBOT_4_2',TBOT_2.format(0,''));
			setText('TBOT_4_3',TBOT_3.format(0,''));
			setText('TBOT_4_4',TBOT_4.format(0,''));
			setText('TBOT_4_5',TBOT_5.format(0,''));
			setText('TBOT_4_6',TBOT_6.format(0,''));
			setText('TBOT_4_7',TBOT_7.format(0,''));
			setText('TBOT_4_8',TBOT_8.format(0,''));
			setText('TBOT_4_9',TBOT_9.format(0,''));
			setText('TBOT_4_10',TBOT_10.format(0,''));
			setText('TBOT_4_11',TBOT_11.format(0,''));
			setText('TBOT_4_12',TBOT_12.format(0,''));
			setText('TBOT_4_13',TBOT_13.format(0,''));
			setText('TBOT_4_14',TBOT_14.format(0,''));
			animateAlarmStroke('TBOT_4_1_BACK','TBOT_4_1');
			animateAlarmStroke('TBOT_4_2_BACK','TBOT_4_2');
			animateAlarmStroke('TBOT_4_3_BACK','TBOT_4_3');
			animateAlarmStroke('TBOT_4_4_BACK','TBOT_4_4');
			animateAlarmStroke('TBOT_4_5_BACK','TBOT_4_5');
			animateAlarmStroke('TBOT_4_6_BACK','TBOT_4_6');
			animateAlarmStroke('TBOT_4_7_BACK','TBOT_4_7');
			animateAlarmStroke('TBOT_4_8_BACK','TBOT_4_8');
			animateAlarmStroke('TBOT_4_9_BACK','TBOT_4_9');
			animateAlarmStroke('TBOT_4_10_BACK','TBOT_4_10');
			animateAlarmStroke('TBOT_4_11_BACK','TBOT_4_11');
			animateAlarmStroke('TBOT_4_12_BACK','TBOT_4_12');
			animateAlarmStroke('TBOT_4_13_BACK','TBOT_4_13');
			animateAlarmStroke('TBOT_4_14_BACK','TBOT_4_14');
			break;
		case 17:
			var TBOT_1=getFltTag('TBOT_5_1');
			var TBOT_2=getFltTag('TBOT_5_2');
			var TBOT_3=getFltTag('TBOT_5_3');
			var TBOT_4=getFltTag('TBOT_5_4');
			var TBOT_5=getFltTag('TBOT_5_5');
			var TBOT_6=getFltTag('TBOT_5_6');
			var TBOT_7=getFltTag('TBOT_5_7');
			var TBOT_8=getFltTag('TBOT_5_8');
			var TBOT_9=getFltTag('TBOT_5_9');
			var TBOT_10=getFltTag('TBOT_5_10');
			var TBOT_11=getFltTag('TBOT_5_11');
			var TBOT_12=getFltTag('TBOT_5_12');
			var TBOT_13=getFltTag('TBOT_5_13');
			var TBOT_14=getFltTag('TBOT_5_14');
			setText('TBOT_4_1',TBOT_1.format(0,''));
			setText('TBOT_4_2',TBOT_2.format(0,''));
			setText('TBOT_4_3',TBOT_3.format(0,''));
			setText('TBOT_4_4',TBOT_4.format(0,''));
			setText('TBOT_4_5',TBOT_5.format(0,''));
			setText('TBOT_4_6',TBOT_6.format(0,''));
			setText('TBOT_4_7',TBOT_7.format(0,''));
			setText('TBOT_4_8',TBOT_8.format(0,''));
			setText('TBOT_4_9',TBOT_9.format(0,''));
			setText('TBOT_4_10',TBOT_10.format(0,''));
			setText('TBOT_4_11',TBOT_11.format(0,''));
			setText('TBOT_4_12',TBOT_12.format(0,''));
			setText('TBOT_4_13',TBOT_13.format(0,''));
			setText('TBOT_4_14',TBOT_14.format(0,''));
			animateAlarmStroke('TBOT_4_1_BACK','TBOT_5_1');
			animateAlarmStroke('TBOT_4_2_BACK','TBOT_5_2');
			animateAlarmStroke('TBOT_4_3_BACK','TBOT_5_3');
			animateAlarmStroke('TBOT_4_4_BACK','TBOT_5_4');
			animateAlarmStroke('TBOT_4_5_BACK','TBOT_5_5');
			animateAlarmStroke('TBOT_4_6_BACK','TBOT_5_6');
			animateAlarmStroke('TBOT_4_7_BACK','TBOT_5_7');
			animateAlarmStroke('TBOT_4_8_BACK','TBOT_5_8');
			animateAlarmStroke('TBOT_4_9_BACK','TBOT_5_9');
			animateAlarmStroke('TBOT_4_10_BACK','TBOT_5_10');
			animateAlarmStroke('TBOT_4_11_BACK','TBOT_5_11');
			animateAlarmStroke('TBOT_4_12_BACK','TBOT_5_12');
			animateAlarmStroke('TBOT_4_13_BACK','TBOT_5_13');
			animateAlarmStroke('TBOT_4_14_BACK','TBOT_5_14');
			break;
		case 18:
			var TBOT_1=getFltTag('TBOT_6_1');
			var TBOT_2=getFltTag('TBOT_6_2');
			var TBOT_3=getFltTag('TBOT_6_3');
			var TBOT_4=getFltTag('TBOT_6_4');
			var TBOT_5=getFltTag('TBOT_6_5');
			var TBOT_6=getFltTag('TBOT_6_6');
			var TBOT_7=getFltTag('TBOT_6_7');
			var TBOT_8=getFltTag('TBOT_6_8');
			var TBOT_9=getFltTag('TBOT_6_9');
			var TBOT_10=getFltTag('TBOT_6_10');
			var TBOT_11=getFltTag('TBOT_6_11');
			var TBOT_12=getFltTag('TBOT_6_12');
			var TBOT_13=getFltTag('TBOT_6_13');
			var TBOT_14=getFltTag('TBOT_6_14');
			setText('TBOT_4_1',TBOT_1.format(0,''));
			setText('TBOT_4_2',TBOT_2.format(0,''));
			setText('TBOT_4_3',TBOT_3.format(0,''));
			setText('TBOT_4_4',TBOT_4.format(0,''));
			setText('TBOT_4_5',TBOT_5.format(0,''));
			setText('TBOT_4_6',TBOT_6.format(0,''));
			setText('TBOT_4_7',TBOT_7.format(0,''));
			setText('TBOT_4_8',TBOT_8.format(0,''));
			setText('TBOT_4_9',TBOT_9.format(0,''));
			setText('TBOT_4_10',TBOT_10.format(0,''));
			setText('TBOT_4_11',TBOT_11.format(0,''));
			setText('TBOT_4_12',TBOT_12.format(0,''));
			setText('TBOT_4_13',TBOT_13.format(0,''));
			setText('TBOT_4_14',TBOT_14.format(0,''));
			animateAlarmStroke('TBOT_4_1_BACK','TBOT_6_1');
			animateAlarmStroke('TBOT_4_2_BACK','TBOT_6_2');
			animateAlarmStroke('TBOT_4_3_BACK','TBOT_6_3');
			animateAlarmStroke('TBOT_4_4_BACK','TBOT_6_4');
			animateAlarmStroke('TBOT_4_5_BACK','TBOT_6_5');
			animateAlarmStroke('TBOT_4_6_BACK','TBOT_6_6');
			animateAlarmStroke('TBOT_4_7_BACK','TBOT_6_7');
			animateAlarmStroke('TBOT_4_8_BACK','TBOT_6_8');
			animateAlarmStroke('TBOT_4_9_BACK','TBOT_6_9');
			animateAlarmStroke('TBOT_4_10_BACK','TBOT_6_10');
			animateAlarmStroke('TBOT_4_11_BACK','TBOT_6_11');
			animateAlarmStroke('TBOT_4_12_BACK','TBOT_6_12');
			animateAlarmStroke('TBOT_4_13_BACK','TBOT_6_13');
			animateAlarmStroke('TBOT_4_14_BACK','TBOT_6_14');
			break;
		case 19:
			var TBOT_1=getFltTag('TBOT_7_1');
			var TBOT_2=getFltTag('TBOT_7_2');
			var TBOT_3=getFltTag('TBOT_7_3');
			var TBOT_4=getFltTag('TBOT_7_4');
			var TBOT_5=getFltTag('TBOT_7_5');
			var TBOT_6=getFltTag('TBOT_7_6');
			var TBOT_7=getFltTag('TBOT_7_7');
			var TBOT_8=getFltTag('TBOT_7_8');
			var TBOT_9=getFltTag('TBOT_7_9');
			var TBOT_10=getFltTag('TBOT_7_10');
			var TBOT_11=getFltTag('TBOT_7_11');
			var TBOT_12=getFltTag('TBOT_7_12');
			var TBOT_13=getFltTag('TBOT_7_13');
			var TBOT_14=getFltTag('TBOT_7_14');
			setText('TBOT_4_1',TBOT_1.format(0,''));
			setText('TBOT_4_2',TBOT_2.format(0,''));
			setText('TBOT_4_3',TBOT_3.format(0,''));
			setText('TBOT_4_4',TBOT_4.format(0,''));
			setText('TBOT_4_5',TBOT_5.format(0,''));
			setText('TBOT_4_6',TBOT_6.format(0,''));
			setText('TBOT_4_7',TBOT_7.format(0,''));
			setText('TBOT_4_8',TBOT_8.format(0,''));
			setText('TBOT_4_9',TBOT_9.format(0,''));
			setText('TBOT_4_10',TBOT_10.format(0,''));
			setText('TBOT_4_11',TBOT_11.format(0,''));
			setText('TBOT_4_12',TBOT_12.format(0,''));
			setText('TBOT_4_13',TBOT_13.format(0,''));
			setText('TBOT_4_14',TBOT_14.format(0,''));
			animateAlarmStroke('TBOT_4_1_BACK','TBOT_7_1');
			animateAlarmStroke('TBOT_4_2_BACK','TBOT_7_2');
			animateAlarmStroke('TBOT_4_3_BACK','TBOT_7_3');
			animateAlarmStroke('TBOT_4_4_BACK','TBOT_7_4');
			animateAlarmStroke('TBOT_4_5_BACK','TBOT_7_5');
			animateAlarmStroke('TBOT_4_6_BACK','TBOT_7_6');
			animateAlarmStroke('TBOT_4_7_BACK','TBOT_7_7');
			animateAlarmStroke('TBOT_4_8_BACK','TBOT_7_8');
			animateAlarmStroke('TBOT_4_9_BACK','TBOT_7_9');
			animateAlarmStroke('TBOT_4_10_BACK','TBOT_7_10');
			animateAlarmStroke('TBOT_4_11_BACK','TBOT_7_11');
			animateAlarmStroke('TBOT_4_12_BACK','TBOT_7_12');
			animateAlarmStroke('TBOT_4_13_BACK','TBOT_7_13');
			animateAlarmStroke('TBOT_4_14_BACK','TBOT_7_14');
			break;
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
// Формат вызова: animateButton(elementID,buttonPressed)
// Назначение: Анимация состояния кнопки.
// Параметры:
//             elementID 		- идентификатор объекта;
//             buttonPressed 	- признак нажатого состояния кнопки.
//////////////////////////////////////////////////////////////////////////////////////////////
function animateButton(elementID,buttonPressed) {
	setStyle(elementID,'fill',buttonPressed ? ButtonPressedColor : ButtonUnpressedColor);
}