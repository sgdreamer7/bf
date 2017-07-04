//////////////////////////////////////////////////////////////////////////////////////////////
// Автор: Владимир Щербина <vns.scherbina@gmail.com>
// copyright 2017
// Версия: 1.0.0
// Модуль ups_diag.js реализует анимацию и логику диалогового взаимодействия для видеокадра ups_diag.
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
var selector=1;
var UpsParameters=[
	"upsBasicBatteryStatus",
	"upsBasicBatteryTimeOnBattery",
	"upsAdvBatteryCapacity",
	"upsAdvBatteryTemperature",
	"upsAdvBatteryRunTimeRemaining",
	"upsAdvBatteryReplaceIndicator", 
	"upsAdvBatteryNominalVoltage", 
	"upsAdvBatteryActualVoltage", 
	"upsAdvBatteryCurrent", 
	"upsAdvTotalDCCurrent", 
	"upsAdvBatteryFullCapacity", 
	"upsHighPrecBatteryCapacity", 
	"upsHighPrecBatteryTemperature", 
	"upsHighPrecBatteryNominalVoltage", 
	"upsHighPrecBatteryActualVoltage", 
	"upsHighPrecBatteryCurrent", 
	"upsHighPrecTotalDCCurrent",
	"upsBasicInputPhase",
	"upsAdvInputLineVoltage",
	"upsAdvInputMaxLineVoltage", 
	"upsAdvInputMinLineVoltage", 
	"upsAdvInputFrequency", 
	"upsAdvInputLineFailCause",
	"upsAdvInputNominalFrequency",
	"upsAdvInputNominalVoltage",
	"upsAdvInputBypassNominalFrequency",
	"upsAdvInputBypassNominalVoltage",
	"upsHighPrecInputLineVoltage",
	"upsHighPrecInputMaxLineVoltage",
	"upsHighPrecInputMinLineVoltage",
	"upsHighPrecInputFrequency",
	"upsBasicOutputStatus",
	"upsBasicOutputPhase",
	"upsBasicSystemStatus",
	"upsBasicSystemInternalTemperature",
	"upsAdvOutputVoltage",
	"upsAdvOutputFrequency",
	"upsAdvOutputLoad",
	"upsAdvOutputCurrent",
	"upsAdvOutputKVACapacity",
	"upsAdvOutputNominalFrequency",
	"upsHighPrecOutputVoltage",
	"upsHighPrecOutputFrequency",
	"upsHighPrecOutputLoad",
	"upsHighPrecOutputCurrent",
	"upsHighPrecOutputEfficiency",
	"upsHighPrecOutputEnergyUsage"
];

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

	var BackgroundStyle='fill:#ffffff;fill-opacity:1;stroke:#000000;stroke-width:1.0;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:4;stroke-opacity:1;stroke-dasharray:none';

	var Col1Width=1460;
	var Col2Width=420;

	var Header1={width:Col1Width,background:BackgroundStyle,align:'middle',text:'Параметр'};
	var Header2={width:Col2Width,background:BackgroundStyle,align:'middle',text:'Значение'};

	var Col1={width:Col1Width,background:BackgroundStyle,align:'middle',text:''};
	var Col2={width:Col2Width,background:BackgroundStyle,align:'middle',text:''};


	var Table=[
		[Header1,Header2]
	];

	for (i=0; i<UpsParameters.length; i++) {
		TagName="UPS_"+selector.format(0,"")+"_"+UpsParameters[i];
		RowData=[
			{width:Col1Width,background:BackgroundStyle,align:'start',text:getStrTag(TagName+".A_DESC")},
			{width:Col2Width,background:BackgroundStyle,align:'start',text:getFltTag(TagName+".F_CV")}
		];
		Table[i+1]=RowData
	}
	createTable('UPS_TABLE',Table);


	rt=Runtime.getRuntime();	

	addKeyAction(function() { exitApp(); },KeyEvent.VK_Q,KeyEvent.CTRL_MASK);
	init_basic_without_diags_buttons_menu();
	setButton('EXIT_BUTTON','exit_click();');
	addKeyAction(exit_click,KeyEvent.VK_ESCAPE,0);

	setHighlightButton('UPS_1_BUTTON','selector=1;');
	setHighlightButton('UPS_2_BUTTON','selector=2;');
	setHighlightButton('UPS_3_BUTTON','selector=3;');
	setHighlightButton('UPS_4_BUTTON','selector=4;');
	setHighlightButton('UPS_5_BUTTON','selector=5;');
	setHighlightButton('UPS_6_BUTTON','selector=6;');
	setHighlightButton('UPS_7_BUTTON','selector=7;');

	
	
	
	
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
	animateButton('UPS_1_I',selector==1);
	animateButton('UPS_2_I',selector==2);
	animateButton('UPS_3_I',selector==3);
	animateButton('UPS_4_I',selector==4);
	animateButton('UPS_5_I',selector==5);
	animateButton('UPS_6_I',selector==6);
	animateButton('UPS_7_I',selector==7);

	setText('UPS_1_CAPACITY',getFltTag('UPS_1_upsAdvBatteryCapacity')==100.0 ? '100' : getFltTag('UPS_1_upsAdvBatteryCapacity').format(1,'%'));
	setText('UPS_2_CAPACITY',getFltTag('UPS_2_upsAdvBatteryCapacity')==100.0 ? '100' : getFltTag('UPS_2_upsAdvBatteryCapacity').format(1,'%'));
	setText('UPS_3_CAPACITY',getFltTag('UPS_3_upsAdvBatteryCapacity')==100.0 ? '100' : getFltTag('UPS_3_upsAdvBatteryCapacity').format(1,'%'));
	setText('UPS_4_CAPACITY',getFltTag('UPS_4_upsAdvBatteryCapacity')==100.0 ? '100' : getFltTag('UPS_4_upsAdvBatteryCapacity').format(1,'%'));
	setText('UPS_5_CAPACITY',getFltTag('UPS_5_upsAdvBatteryCapacity')==100.0 ? '100' : getFltTag('UPS_5_upsAdvBatteryCapacity').format(1,'%'));
	setText('UPS_6_CAPACITY',getFltTag('UPS_6_upsAdvBatteryCapacity')==100.0 ? '100' : getFltTag('UPS_6_upsAdvBatteryCapacity').format(1,'%'));
	setText('UPS_7_CAPACITY',getFltTag('UPS_7_upsAdvBatteryCapacity')==100.0 ? '100' : getFltTag('UPS_7_upsAdvBatteryCapacity').format(1,'%'));

	var i=0;
	for (i=0; i<UpsParameters.length; i++) {
		var TagName="UPS_"+selector.format(0,"")+"_"+UpsParameters[i];
		setTableText('UPS_TABLE',i+1,0," "+getStrTag(TagName+".A_DESC"));
		setTableText('UPS_TABLE',i+1,1," "+getStrTag(TagName+".A_CV")+" "+getStrTag(TagName+".A_EGUDESC"));
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