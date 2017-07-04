//////////////////////////////////////////////////////////////////////////////////////////////
// Автор: Владимир Щербина <vns.scherbina@gmail.com>
// copyright 2017
// Версия: 1.0.0
// Модуль thpl.js реализует анимацию и логику диалогового взаимодействия для видеокадра thpl.
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
	
	setHighlightButton('THPL_BUTTON_1','selector=1;');
	setHighlightButton('THPL_BUTTON_2','selector=2;');
	setHighlightButton('THPL_BUTTON_3','selector=3;');
	setHighlightButton('THPL_BUTTON_4','selector=4;');
	setHighlightButton('THPL_BUTTON_5','selector=5;');
	setHighlightButton('THPL_BUTTON_6','selector=6;');

	
	
	
	
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
	switch (selector) {
		case 0:
			animateButton('THPL_I_1',true);
			animateButton('THPL_I_2',false);
			animateButton('THPL_I_3',false);
			animateButton('THPL_I_4',false);
			animateButton('THPL_I_5',false);
			animateButton('THPL_I_6',false);
			var THPL_1=getFltTag('THPL_1_1');
			var THPL_2=getFltTag('THPL_1_2');
			var THPL_3=getFltTag('THPL_1_3');
			var THPL_4=getFltTag('THPL_1_4');
			var THPL_5=getFltTag('THPL_1_5');
			var THPL_6=getFltTag('THPL_1_6');
			setText('THPL_1',THPL_1.format(0,''));
			setText('THPL_2',THPL_2.format(0,''));
			setText('THPL_3',THPL_3.format(0,''));
			setText('THPL_4',THPL_4.format(0,''));
			setText('THPL_5',THPL_5.format(0,''));
			setText('THPL_6',THPL_6.format(0,''));
			setAttr('THPL_HIST_1','height',checkLimits(THPL_1));
			setAttr('THPL_HIST_2','height',checkLimits(THPL_2));
			setAttr('THPL_HIST_3','height',checkLimits(THPL_3));
			setAttr('THPL_HIST_4','height',checkLimits(THPL_4));
			setAttr('THPL_HIST_5','height',checkLimits(THPL_5));
			setAttr('THPL_HIST_6','height',checkLimits(THPL_6));
			setAttr('THPL_HIST_1','y',340+checkLimits(600-THPL_1));
			setAttr('THPL_HIST_2','y',340+checkLimits(600-THPL_2));
			setAttr('THPL_HIST_3','y',340+checkLimits(600-THPL_3));
			setAttr('THPL_HIST_4','y',340+checkLimits(600-THPL_4));
			setAttr('THPL_HIST_5','y',340+checkLimits(600-THPL_5));
			setAttr('THPL_HIST_6','y',340+checkLimits(600-THPL_6));
			setText('LABEL_1','ТХП1');
			setText('LABEL_2','ТХП2');
			setText('LABEL_3','ТХП3');
			setText('LABEL_4','ТХП4');
			setText('LABEL_5','ТХП5');
			setText('LABEL_6','ТХП6');
			animateAlarmStroke('THPL_1_BACK','THPL_1_1');
			animateAlarmStroke('THPL_2_BACK','THPL_1_2');
			animateAlarmStroke('THPL_3_BACK','THPL_1_3');
			animateAlarmStroke('THPL_4_BACK','THPL_1_4');
			animateAlarmStroke('THPL_5_BACK','THPL_1_5');
			animateAlarmStroke('THPL_6_BACK','THPL_1_6');
			animateAlarmFill('THPL_HIST_1','THPL_1_1');
			animateAlarmFill('THPL_HIST_2','THPL_1_2');
			animateAlarmFill('THPL_HIST_3','THPL_1_3');
			animateAlarmFill('THPL_HIST_4','THPL_1_4');
			animateAlarmFill('THPL_HIST_5','THPL_1_5');
			animateAlarmFill('THPL_HIST_6','THPL_1_6');
			break;
		case 1:
			animateButton('THPL_I_1',true);
			animateButton('THPL_I_2',false);
			animateButton('THPL_I_3',false);
			animateButton('THPL_I_4',false);
			animateButton('THPL_I_5',false);
			animateButton('THPL_I_6',false);
			var THPL_1=getFltTag('THPL_1_1');
			var THPL_2=getFltTag('THPL_1_2');
			var THPL_3=getFltTag('THPL_1_3');
			var THPL_4=getFltTag('THPL_1_4');
			var THPL_5=getFltTag('THPL_1_5');
			var THPL_6=getFltTag('THPL_1_6');
			setText('THPL_1',THPL_1.format(0,''));
			setText('THPL_2',THPL_2.format(0,''));
			setText('THPL_3',THPL_3.format(0,''));
			setText('THPL_4',THPL_4.format(0,''));
			setText('THPL_5',THPL_5.format(0,''));
			setText('THPL_6',THPL_6.format(0,''));
			setAttr('THPL_HIST_1','height',checkLimits(THPL_1));
			setAttr('THPL_HIST_2','height',checkLimits(THPL_2));
			setAttr('THPL_HIST_3','height',checkLimits(THPL_3));
			setAttr('THPL_HIST_4','height',checkLimits(THPL_4));
			setAttr('THPL_HIST_5','height',checkLimits(THPL_5));
			setAttr('THPL_HIST_6','height',checkLimits(THPL_6));
			setAttr('THPL_HIST_1','y',340+checkLimits(600-THPL_1));
			setAttr('THPL_HIST_2','y',340+checkLimits(600-THPL_2));
			setAttr('THPL_HIST_3','y',340+checkLimits(600-THPL_3));
			setAttr('THPL_HIST_4','y',340+checkLimits(600-THPL_4));
			setAttr('THPL_HIST_5','y',340+checkLimits(600-THPL_5));
			setAttr('THPL_HIST_6','y',340+checkLimits(600-THPL_6));
			setText('LABEL_2','ТХП2');
			setText('LABEL_3','ТХП3');
			setText('LABEL_4','ТХП4');
			setText('LABEL_5','ТХП5');
			setText('LABEL_6','ТХП6');
			animateAlarmStroke('THPL_1_BACK','THPL_1_1');
			animateAlarmStroke('THPL_2_BACK','THPL_1_2');
			animateAlarmStroke('THPL_3_BACK','THPL_1_3');
			animateAlarmStroke('THPL_4_BACK','THPL_1_4');
			animateAlarmStroke('THPL_5_BACK','THPL_1_5');
			animateAlarmStroke('THPL_6_BACK','THPL_1_6');
			animateAlarmFill('THPL_HIST_1','THPL_1_1');
			animateAlarmFill('THPL_HIST_2','THPL_1_2');
			animateAlarmFill('THPL_HIST_3','THPL_1_3');
			animateAlarmFill('THPL_HIST_4','THPL_1_4');
			animateAlarmFill('THPL_HIST_5','THPL_1_5');
			animateAlarmFill('THPL_HIST_6','THPL_1_6');
			break;
		case 2:
			animateButton('THPL_I_1',false);
			animateButton('THPL_I_2',true);
			animateButton('THPL_I_3',false);
			animateButton('THPL_I_4',false);
			animateButton('THPL_I_5',false);
			animateButton('THPL_I_6',false);
			var THPL_1=getFltTag('THPL_2_1');
			var THPL_2=getFltTag('THPL_2_2');
			var THPL_3=getFltTag('THPL_2_3');
			var THPL_4=getFltTag('THPL_2_4');
			var THPL_5=getFltTag('THPL_2_5');
			var THPL_6=getFltTag('THPL_2_6');
			setText('THPL_1',THPL_1.format(0,''));
			setText('THPL_2',THPL_2.format(0,''));
			setText('THPL_3',THPL_3.format(0,''));
			setText('THPL_4',THPL_4.format(0,''));
			setText('THPL_5',THPL_5.format(0,''));
			setText('THPL_6',THPL_6.format(0,''));
			setAttr('THPL_HIST_1','height',checkLimits(THPL_1));
			setAttr('THPL_HIST_2','height',checkLimits(THPL_2));
			setAttr('THPL_HIST_3','height',checkLimits(THPL_3));
			setAttr('THPL_HIST_4','height',checkLimits(THPL_4));
			setAttr('THPL_HIST_5','height',checkLimits(THPL_5));
			setAttr('THPL_HIST_6','height',checkLimits(THPL_6));
			setAttr('THPL_HIST_1','y',340+checkLimits(600-THPL_1));
			setAttr('THPL_HIST_2','y',340+checkLimits(600-THPL_2));
			setAttr('THPL_HIST_3','y',340+checkLimits(600-THPL_3));
			setAttr('THPL_HIST_4','y',340+checkLimits(600-THPL_4));
			setAttr('THPL_HIST_5','y',340+checkLimits(600-THPL_5));
			setAttr('THPL_HIST_6','y',340+checkLimits(600-THPL_6));
			setText('LABEL_1','ТХП7');
			setText('LABEL_2','ТХП8');
			setText('LABEL_3','ТХП9');
			setText('LABEL_4','ТХП10');
			setText('LABEL_5','ТХП11');
			setText('LABEL_6','ТХП12');
			animateAlarmStroke('THPL_1_BACK','THPL_2_1');
			animateAlarmStroke('THPL_2_BACK','THPL_2_2');
			animateAlarmStroke('THPL_3_BACK','THPL_2_3');
			animateAlarmStroke('THPL_4_BACK','THPL_2_4');
			animateAlarmStroke('THPL_5_BACK','THPL_2_5');
			animateAlarmStroke('THPL_6_BACK','THPL_2_6');
			animateAlarmFill('THPL_HIST_1','THPL_2_1');
			animateAlarmFill('THPL_HIST_2','THPL_2_2');
			animateAlarmFill('THPL_HIST_3','THPL_2_3');
			animateAlarmFill('THPL_HIST_4','THPL_2_4');
			animateAlarmFill('THPL_HIST_5','THPL_2_5');
			animateAlarmFill('THPL_HIST_6','THPL_2_6');
			break;
		case 3:
			animateButton('THPL_I_1',false);
			animateButton('THPL_I_2',false);
			animateButton('THPL_I_3',true);
			animateButton('THPL_I_4',false);
			animateButton('THPL_I_5',false);
			animateButton('THPL_I_6',false);
			var THPL_1=getFltTag('THPL_3_1');
			var THPL_2=getFltTag('THPL_3_2');
			var THPL_3=getFltTag('THPL_3_3');
			var THPL_4=getFltTag('THPL_3_4');
			var THPL_5=getFltTag('THPL_3_5');
			var THPL_6=getFltTag('THPL_3_6');
			setText('THPL_1',THPL_1.format(0,''));
			setText('THPL_2',THPL_2.format(0,''));
			setText('THPL_3',THPL_3.format(0,''));
			setText('THPL_4',THPL_4.format(0,''));
			setText('THPL_5',THPL_5.format(0,''));
			setText('THPL_6',THPL_6.format(0,''));
			setAttr('THPL_HIST_1','height',checkLimits(THPL_1));
			setAttr('THPL_HIST_2','height',checkLimits(THPL_2));
			setAttr('THPL_HIST_3','height',checkLimits(THPL_3));
			setAttr('THPL_HIST_4','height',checkLimits(THPL_4));
			setAttr('THPL_HIST_5','height',checkLimits(THPL_5));
			setAttr('THPL_HIST_6','height',checkLimits(THPL_6));
			setAttr('THPL_HIST_1','y',340+checkLimits(600-THPL_1));
			setAttr('THPL_HIST_2','y',340+checkLimits(600-THPL_2));
			setAttr('THPL_HIST_3','y',340+checkLimits(600-THPL_3));
			setAttr('THPL_HIST_4','y',340+checkLimits(600-THPL_4));
			setAttr('THPL_HIST_5','y',340+checkLimits(600-THPL_5));
			setAttr('THPL_HIST_6','y',340+checkLimits(600-THPL_6));
			setText('LABEL_1','ТХП631');
			setText('LABEL_2','ТХП632');
			setText('LABEL_3','ТХП633');
			setText('LABEL_4','ТХП634');
			setText('LABEL_5','ТХП635');
			setText('LABEL_6','ТХП636');
			animateAlarmStroke('THPL_1_BACK','THPL_3_1');
			animateAlarmStroke('THPL_2_BACK','THPL_3_2');
			animateAlarmStroke('THPL_3_BACK','THPL_3_3');
			animateAlarmStroke('THPL_4_BACK','THPL_3_4');
			animateAlarmStroke('THPL_5_BACK','THPL_3_5');
			animateAlarmStroke('THPL_6_BACK','THPL_3_6');
			animateAlarmFill('THPL_HIST_1','THPL_3_1');
			animateAlarmFill('THPL_HIST_2','THPL_3_2');
			animateAlarmFill('THPL_HIST_3','THPL_3_3');
			animateAlarmFill('THPL_HIST_4','THPL_3_4');
			animateAlarmFill('THPL_HIST_5','THPL_3_5');
			animateAlarmFill('THPL_HIST_6','THPL_3_6');
			break;
		case 4:
			animateButton('THPL_I_1',false);
			animateButton('THPL_I_2',false);
			animateButton('THPL_I_3',false);
			animateButton('THPL_I_4',true);
			animateButton('THPL_I_5',false);
			animateButton('THPL_I_6',false);
			var THPL_1=getFltTag('THPL_4_1');
			var THPL_2=getFltTag('THPL_4_2');
			var THPL_3=getFltTag('THPL_4_3');
			var THPL_4=getFltTag('THPL_4_4');
			var THPL_5=getFltTag('THPL_4_5');
			var THPL_6=getFltTag('THPL_4_6');
			setText('THPL_1',THPL_1.format(0,''));
			setText('THPL_2',THPL_2.format(0,''));
			setText('THPL_3',THPL_3.format(0,''));
			setText('THPL_4',THPL_4.format(0,''));
			setText('THPL_5',THPL_5.format(0,''));
			setText('THPL_6',THPL_6.format(0,''));
			setAttr('THPL_HIST_1','height',checkLimits(THPL_1));
			setAttr('THPL_HIST_2','height',checkLimits(THPL_2));
			setAttr('THPL_HIST_3','height',checkLimits(THPL_3));
			setAttr('THPL_HIST_4','height',checkLimits(THPL_4));
			setAttr('THPL_HIST_5','height',checkLimits(THPL_5));
			setAttr('THPL_HIST_6','height',checkLimits(THPL_6));
			setAttr('THPL_HIST_1','y',340+checkLimits(600-THPL_1));
			setAttr('THPL_HIST_2','y',340+checkLimits(600-THPL_2));
			setAttr('THPL_HIST_3','y',340+checkLimits(600-THPL_3));
			setAttr('THPL_HIST_4','y',340+checkLimits(600-THPL_4));
			setAttr('THPL_HIST_5','y',340+checkLimits(600-THPL_5));
			setAttr('THPL_HIST_6','y',340+checkLimits(600-THPL_6));
			setText('LABEL_1','ТХП641');
			setText('LABEL_2','ТХП642');
			setText('LABEL_3','ТХП643');
			setText('LABEL_4','ТХП644');
			setText('LABEL_5','ТХП645');
			setText('LABEL_6','ТХП646');
			animateAlarmStroke('THPL_1_BACK','THPL_4_1');
			animateAlarmStroke('THPL_2_BACK','THPL_4_2');
			animateAlarmStroke('THPL_3_BACK','THPL_4_3');
			animateAlarmStroke('THPL_4_BACK','THPL_4_4');
			animateAlarmStroke('THPL_5_BACK','THPL_4_5');
			animateAlarmStroke('THPL_6_BACK','THPL_4_6');
			animateAlarmFill('THPL_HIST_1','THPL_4_1');
			animateAlarmFill('THPL_HIST_2','THPL_4_2');
			animateAlarmFill('THPL_HIST_3','THPL_4_3');
			animateAlarmFill('THPL_HIST_4','THPL_4_4');
			animateAlarmFill('THPL_HIST_5','THPL_4_5');
			animateAlarmFill('THPL_HIST_6','THPL_4_6');
			break;
		case 5:
			animateButton('THPL_I_1',false);
			animateButton('THPL_I_2',false);
			animateButton('THPL_I_3',false);
			animateButton('THPL_I_4',false);
			animateButton('THPL_I_5',true);
			animateButton('THPL_I_6',false);
			var THPL_1=getFltTag('THPL_5_1');
			var THPL_2=getFltTag('THPL_5_2');
			var THPL_3=getFltTag('THPL_5_3');
			var THPL_4=getFltTag('THPL_5_4');
			var THPL_5=getFltTag('THPL_5_5');
			var THPL_6=getFltTag('THPL_5_6');
			setText('THPL_1',THPL_1.format(0,''));
			setText('THPL_2',THPL_2.format(0,''));
			setText('THPL_3',THPL_3.format(0,''));
			setText('THPL_4',THPL_4.format(0,''));
			setText('THPL_5',THPL_5.format(0,''));
			setText('THPL_6',THPL_6.format(0,''));
			setAttr('THPL_HIST_1','height',checkLimits(THPL_1));
			setAttr('THPL_HIST_2','height',checkLimits(THPL_2));
			setAttr('THPL_HIST_3','height',checkLimits(THPL_3));
			setAttr('THPL_HIST_4','height',checkLimits(THPL_4));
			setAttr('THPL_HIST_5','height',checkLimits(THPL_5));
			setAttr('THPL_HIST_6','height',checkLimits(THPL_6));
			setAttr('THPL_HIST_1','y',340+checkLimits(600-THPL_1));
			setAttr('THPL_HIST_2','y',340+checkLimits(600-THPL_2));
			setAttr('THPL_HIST_3','y',340+checkLimits(600-THPL_3));
			setAttr('THPL_HIST_4','y',340+checkLimits(600-THPL_4));
			setAttr('THPL_HIST_5','y',340+checkLimits(600-THPL_5));
			setAttr('THPL_HIST_6','y',340+checkLimits(600-THPL_6));
			setText('LABEL_1','ТХП651');
			setText('LABEL_2','ТХП652');
			setText('LABEL_3','ТХП653');
			setText('LABEL_4','ТХП654');
			setText('LABEL_5','ТХП655');
			setText('LABEL_6','ТХП656');
			animateAlarmStroke('THPL_1_BACK','THPL_5_1');
			animateAlarmStroke('THPL_2_BACK','THPL_5_2');
			animateAlarmStroke('THPL_3_BACK','THPL_5_3');
			animateAlarmStroke('THPL_4_BACK','THPL_5_4');
			animateAlarmStroke('THPL_5_BACK','THPL_5_5');
			animateAlarmStroke('THPL_6_BACK','THPL_5_6');
			animateAlarmFill('THPL_HIST_1','THPL_5_1');
			animateAlarmFill('THPL_HIST_2','THPL_5_2');
			animateAlarmFill('THPL_HIST_3','THPL_5_3');
			animateAlarmFill('THPL_HIST_4','THPL_5_4');
			animateAlarmFill('THPL_HIST_5','THPL_5_5');
			animateAlarmFill('THPL_HIST_6','THPL_5_6');
			break;
		case 6:
			animateButton('THPL_I_1',false);
			animateButton('THPL_I_2',false);
			animateButton('THPL_I_3',false);
			animateButton('THPL_I_4',false);
			animateButton('THPL_I_5',false);
			animateButton('THPL_I_6',true);
			var THPL_1=getFltTag('THPL_6_1');
			var THPL_2=getFltTag('THPL_6_2');
			var THPL_3=getFltTag('THPL_6_3');
			var THPL_4=getFltTag('THPL_6_4');
			var THPL_5=getFltTag('THPL_6_5');
			var THPL_6=getFltTag('THPL_6_6');
			setText('THPL_1',THPL_1.format(0,''));
			setText('THPL_2',THPL_2.format(0,''));
			setText('THPL_3',THPL_3.format(0,''));
			setText('THPL_4',THPL_4.format(0,''));
			setText('THPL_5',THPL_5.format(0,''));
			setText('THPL_6',THPL_6.format(0,''));
			setAttr('THPL_HIST_1','height',checkLimits(THPL_1));
			setAttr('THPL_HIST_2','height',checkLimits(THPL_2));
			setAttr('THPL_HIST_3','height',checkLimits(THPL_3));
			setAttr('THPL_HIST_4','height',checkLimits(THPL_4));
			setAttr('THPL_HIST_5','height',checkLimits(THPL_5));
			setAttr('THPL_HIST_6','height',checkLimits(THPL_6));
			setAttr('THPL_HIST_1','y',340+checkLimits(600-THPL_1));
			setAttr('THPL_HIST_2','y',340+checkLimits(600-THPL_2));
			setAttr('THPL_HIST_3','y',340+checkLimits(600-THPL_3));
			setAttr('THPL_HIST_4','y',340+checkLimits(600-THPL_4));
			setAttr('THPL_HIST_5','y',340+checkLimits(600-THPL_5));
			setAttr('THPL_HIST_6','y',340+checkLimits(600-THPL_6));
			setText('LABEL_1','ТХП661');
			setText('LABEL_2','ТХП662');
			setText('LABEL_3','ТХП663');
			setText('LABEL_4','ТХП664');
			setText('LABEL_5','ТХП665');
			setText('LABEL_6','ТХП666');
			animateAlarmStroke('THPL_1_BACK','THPL_6_1');
			animateAlarmStroke('THPL_2_BACK','THPL_6_2');
			animateAlarmStroke('THPL_3_BACK','THPL_6_3');
			animateAlarmStroke('THPL_4_BACK','THPL_6_4');
			animateAlarmStroke('THPL_5_BACK','THPL_6_5');
			animateAlarmStroke('THPL_6_BACK','THPL_6_6');
			animateAlarmFill('THPL_HIST_1','THPL_6_1');
			animateAlarmFill('THPL_HIST_2','THPL_6_2');
			animateAlarmFill('THPL_HIST_3','THPL_6_3');
			animateAlarmFill('THPL_HIST_4','THPL_6_4');
			animateAlarmFill('THPL_HIST_5','THPL_6_5');
			animateAlarmFill('THPL_HIST_6','THPL_6_6');
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

//////////////////////////////////////////////////////////////////////////////////////////////
// Формат вызова: checkLimits(V)
// Назначение: Проверка значения на допустимый диапазон.
// Параметры:
//             V 		- проверяемое значение.
//////////////////////////////////////////////////////////////////////////////////////////////
function checkLimits(V) {
	if (V<0) {
		return 0;
	} else if (V>600) {
		return 600;
	}
	return V;
}
