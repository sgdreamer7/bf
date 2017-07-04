//////////////////////////////////////////////////////////////////////////////////////////////
// Автор: Владимир Щербина <vns.scherbina@gmail.com>
// copyright 2017
// Версия: 1.0.0
// Модуль stoves.js реализует анимацию и логику диалогового взаимодействия для видеокадра stoves.
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
var	StovesFramesMenu=[
		{text:'Параметры СИО воздухонагревателей',id:'siovn.svg'},
		{text:'Параметры ГСС',id:'gss.svg'}
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
	
	setButton('STOVES_BUTTON','local_stoves_click();');
	setButton('GSS_BUTTON','gss_click();');
	
	setImmediateButton('FVZ_VN_1_MIN_BUTTON','clickMinButton(1,true);','clickMinButton(1,false);');
	setImmediateButton('FVZ_VN_2_MIN_BUTTON','clickMinButton(2,true);','clickMinButton(2,false);');
	setImmediateButton('FVZ_VN_3_MIN_BUTTON','clickMinButton(3,true);','clickMinButton(3,false);');
	setImmediateButton('FVZ_VN_4_MIN_BUTTON','clickMinButton(4,true);','clickMinButton(4,false);');
	
	setImmediateButton('FVZ_VN_1_MAX_BUTTON','clickMaxButton(1,true);','clickMaxButton(1,false);');
	setImmediateButton('FVZ_VN_2_MAX_BUTTON','clickMaxButton(2,true);','clickMaxButton(2,false);');
	setImmediateButton('FVZ_VN_3_MAX_BUTTON','clickMaxButton(3,true);','clickMaxButton(3,false);');
	setImmediateButton('FVZ_VN_4_MAX_BUTTON','clickMaxButton(4,true);','clickMaxButton(4,false);');

	setHighlightButton('FVZ_VN_1_MODE_BUTTON','clickModeButton(1);');
	setHighlightButton('FVZ_VN_2_MODE_BUTTON','clickModeButton(2);');
	setHighlightButton('FVZ_VN_3_MODE_BUTTON','clickModeButton(3);');
	setHighlightButton('FVZ_VN_4_MODE_BUTTON','clickModeButton(4);');

	setHighlightButton('ZDN_TPP_VN_1_BUTTON','clickZDNTPPButton(1);');
	setHighlightButton('ZDN_TPP_VN_2_BUTTON','clickZDNTPPButton(2);');
	setHighlightButton('ZDN_TPP_VN_3_BUTTON','clickZDNTPPButton(3);');
	setHighlightButton('ZDN_TPP_VN_4_BUTTON','clickZDNTPPButton(4);');
	
	setButton('VN_1_BUTTON','vnTrend(1);');
	setButton('VN_2_BUTTON','vnTrend(2);');
	setButton('VN_3_BUTTON','vnTrend(3);');
	setButton('VN_4_BUTTON','vnTrend(4);');
	setButton('VN_1_2_BUTTON','vnTrend(1);');
	setButton('VN_2_2_BUTTON','vnTrend(2);');
	setButton('VN_3_2_BUTTON','vnTrend(3);');
	setButton('VN_4_2_BUTTON','vnTrend(4);');

	setHighlightButton('VN_1_MODE_BUTTON','changeVNMode(1);');
	setHighlightButton('VN_2_MODE_BUTTON','changeVNMode(2);');
	setHighlightButton('VN_3_MODE_BUTTON','changeVNMode(3);');
	setHighlightButton('VN_4_MODE_BUTTON','changeVNMode(4);');
	
	setHighlightButton('DG_BUTTON','showTrendByID(\'GSS_TRENDS\');');
	setHighlightButton('PG_BUTTON','showTrendByID(\'GSS_TRENDS\');');
	setHighlightButton('SG_BUTTON','showTrendByID(\'GSS_TRENDS\');');
	setHighlightButton('TGD_BUTTON','showTrendByID(\'GD_HD_TRENDS\');');
	
	addKeyAction(local_stoves_click,KeyEvent.VK_F3,0);
	
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
	var i=0;
	for (i=1; i<=4; i++) {
		setText('TPP_VN_'+i.format(0,''),getFltTag('TPP_VN_'+i.format(0,'')).format(0,''));
		setText('TKG_VN_'+i.format(0,''),getFltTag('TKG_VN_'+i.format(0,'')).format(0,''));
		setText('TD_VN_'+i.format(0,''),getFltTag('TD_VN_'+i.format(0,'')).format(0,''));
		setText('TSTYK_VN_'+i.format(0,''),getFltTag('TSTYK_VN_'+i.format(0,'')).format(0,''));
		setText('FSG_VN_'+i.format(0,''),getFltTag('FSG_VN_'+i.format(0,'')).format(0,''));
		setText('GNA_VN_'+i.format(0,''),getFltTag('GNA_VN_'+i.format(0,'')).format(0,''));
		setStyle('PVZ_VN_'+i.format(0,'')+'_MIN','fill',getBoolTag('PVZ_VN_'+i.format(0,'')+'_MIN') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
		setStyle('NA_VN_'+i.format(0,'')+'_OTK','fill',getBoolTag('NA_VN_'+i.format(0,'')+'_OTK') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
		setStyle('NA_VN_'+i.format(0,'')+'_TYG','fill',getBoolTag('NA_VN_'+i.format(0,'')+'_TYG') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
		setStyle('NA_VN_'+i.format(0,'')+'_ISH','fill',getBoolTag('NA_VN_'+i.format(0,'')+'_ISH') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
		setStyle('NA_VN_'+i.format(0,'')+'_PRD','fill',getBoolTag('NA_VN_'+i.format(0,'')+'_PRD') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
		setText('FVZ_VN_'+i.format(0,'')+'_MODE',getBoolTag('FVZ_VN_'+i.format(0,'')+'_AUTO') ? 'А' : 'Р');
		setText('VN_'+i.format(0,'')+'_2_MODE',getModeText(getFltTag('VN_'+i.format(0,'')+'_MODE')));
		setStyle('VN_'+i.format(0,'')+'_MODE','fill',getModeColor(getFltTag('VN_'+i.format(0,'')+'_MODE')));
		animateButton('FVZ_VN_'+i.format(0,'')+'_MIN',getBoolTag('FVZ_VN_'+i.format(0,'')+'_MAN_MIN'));
		animateButton('FVZ_VN_'+i.format(0,'')+'_MAX',getBoolTag('FVZ_VN_'+i.format(0,'')+'_MAN_MAX'));
		setText('ZDN_TPP_VN_'+i.format(0,''),getFltTag('ZDN_TPP_VN_'+i.format(0,'')).format(0,''));
		// setVisibility('VZ_VN_'+i.format(0,'')+'_MIDDLE',false);
		// setVisibility('VZ_VN_'+i.format(0,'')+'_OPENED',false);
		// setVisibility('VZ_VN_'+i.format(0,'')+'_CLOSED',true);
		// setVisibility('SG_VN_'+i.format(0,'')+'_MIDDLE',false);
		// setVisibility('SG_VN_'+i.format(0,'')+'_OPENED',false);
		// setVisibility('SG_VN_'+i.format(0,'')+'_CLOSED',true);
		// setVisibility('HD_VN_'+i.format(0,'')+'_MIDDLE',false);
		// setVisibility('HD_VN_'+i.format(0,'')+'_OPENED',false);
		// setVisibility('HD_VN_'+i.format(0,'')+'_CLOSED',true);
		// setVisibility('GD_VN_'+i.format(0,'')+'_MIDDLE',false);
		// setVisibility('GD_VN_'+i.format(0,'')+'_OPENED',false);
		// setVisibility('GD_VN_'+i.format(0,'')+'_CLOSED',true);
		// setVisibility('DM_VN_'+i.format(0,'')+'_MIDDLE',false);
		// setVisibility('DM_VN_'+i.format(0,'')+'_OPENED',false);
		// setVisibility('DM_VN_'+i.format(0,'')+'_CLOSED',true);
		setText('VN_'+i.format(0,'')+'_START',getStrTag('VN_'+i.format(0,'')+'_MODE.A_TIME'));
		var modeDuration=getFltTag('TIMESTAMP')-getFltTag('VN_'+i.format(0,'')+'_MODE.F_TS');
		setText('VN_'+i.format(0,'')+'_DUR',formatDigits(Math.floor(modeDuration/3600))+':'+formatDigits(Math.floor(modeDuration/60) % 60)+':'+formatDigits(modeDuration % 60));

		animateAlarmBackStroke('TPP_VN_'+i.format(0,''));
		animateAlarmBackStroke('TKG_VN_'+i.format(0,''));
		animateAlarmBackStroke('TD_VN_'+i.format(0,''));
		animateAlarmBackStroke('TSTYK_VN_'+i.format(0,''));
		animateAlarmBackStroke('FSG_VN_'+i.format(0,''));
		animateAlarmBackStroke('GNA_VN_'+i.format(0,''));
		
	}
	setText('TGD',getFltTag('TGD').format(0,''));
	setText('PGD',getFltTag('PGD').format(2,''));
	setText('PSG',getFltTag('PSG').format(2,''));
	setText('FDG_GSS',getFltTag('FDG_GSS').format(0,''));
	setText('FPG_GSS',getFltTag('FPG_GSS').format(0,''));

	animateAlarmBackStroke('TGD');
	animateAlarmBackStroke('PGD');
	animateAlarmBackStroke('PSG');
	animateAlarmBackStroke('FDG_GSS');
	animateAlarmBackStroke('FPG_GSS');
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
// Формат вызова: local_stoves_click()
// Назначение: Обработчик нажатия на кнопку вызова дополнительных видеокадров по блоку ВН.
// Параметры: -
//////////////////////////////////////////////////////////////////////////////////////////////
function local_stoves_click() {
	popupMenu(StovesFramesMenu,frames_menu_click);
}

//////////////////////////////////////////////////////////////////////////////////////////////
// Формат вызова: gss_click()
// Назначение: Обработчик нажатия на кнопку вызова видеокадра отображения параметров ГСС.
// Параметры: -
//////////////////////////////////////////////////////////////////////////////////////////////
function gss_click() {
	openFrame('gss.svg');
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
// Формат вызова: clickMinButton(pos,state)
// Назначение: Нажатие кнопки уменьшения соотношения расхода СГ/ВГ для воздухонагревателя.
// Параметры:
//             pos 	- номер воздухонагревателя;
//             state 	- команда.
//////////////////////////////////////////////////////////////////////////////////////////////
function clickMinButton(pos,state) {
	setBoolTag('FVZ_VN_'+pos.format(0,'')+'_MAN_MIN',state);
}

//////////////////////////////////////////////////////////////////////////////////////////////
// Формат вызова: clickMaxButton(pos,state)
// Назначение: Нажатие кнопки увеличения соотношения расхода СГ/ВГ для воздухонагревателя.
// Параметры:
//             pos 	- номер воздухонагревателя;
//             state 	- команда.
//////////////////////////////////////////////////////////////////////////////////////////////
function clickMaxButton(pos,state) {
	setBoolTag('FVZ_VN_'+pos.format(0,'')+'_MAN_MAX',state);
}

//////////////////////////////////////////////////////////////////////////////////////////////
// Формат вызова: clickModeButton(pos)
// Назначение: Нажатие кнопки изменения режима управления для воздухонагревателя.
// Параметры:
//             pos 	- номер воздухонагревателя.
//////////////////////////////////////////////////////////////////////////////////////////////
function clickModeButton(pos) {
	var VN_MODE=getBoolTag('FVZ_VN_'+pos.format(0,'')+'_AUTO');
	var VN_ID='-';
	if (pos==1) {
		VN_ID='12';
	} else if (pos==2) {
		VN_ID='13';
	} else if (pos==3) {
		VN_ID='14';
	} else if (pos==4) {
		VN_ID='19';
	}
	if (VN_MODE==true) {
		if (confirm('Вы уверены, что хотите перевести в дистанционный режим управления расходом воздуха горения на воздухонагревателе №'+VN_ID+'?')==true) {
			setBoolTag('FVZ_VN_'+pos.format(0,'')+'_AUTO',false);
		}
	} else {
		if (confirm('Вы уверены, что хотите перевести в автоматический режим управления расходом воздуха горения на воздухонагревателе №'+VN_ID+'?')==true) {
			setBoolTag('FVZ_VN_'+pos.format(0,'')+'_AUTO',true);
		}
	}
}

//////////////////////////////////////////////////////////////////////////////////////////////
// Формат вызова: clickZDNTPPButton(pos)
// Назначение: Нажатие кнопки изменения задания температуры купола для воздухонагревателя.
// Параметры:
//             pos 	- номер воздухонагревателя.
//////////////////////////////////////////////////////////////////////////////////////////////
function clickZDNTPPButton(pos) {
	var VN_ID='-';
	if (pos==1) {
		VN_ID='12';
	} else if (pos==2) {
		VN_ID='13';
	} else if (pos==3) {
		VN_ID='14';
	} else if (pos==4) {
		VN_ID='19';
	}
	changeRefValue('ZDN_TPP_VN_'+pos.format(0,''),900,1450,'Задание температуры купола для воздухонагревателя №'+VN_ID);
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
// Формат вызова: vnTrend(pos)
// Назначение: Нажатие кнопки вызова трендов для воздухонагревателя.
// Параметры:
//             pos 	- номер воздухонагревателя.
//////////////////////////////////////////////////////////////////////////////////////////////
function vnTrend(pos) {
	showTrendByID('VN_'+pos.format(0,'')+'_TRENDS');
}

//////////////////////////////////////////////////////////////////////////////////////////////
// Формат вызова: getModeColor(mode)
// Назначение: Вычисление цвета анимации для режима воздухонагревателя.
// Параметры:
//             mode 	- номер режима воздухонагревателя.
//////////////////////////////////////////////////////////////////////////////////////////////
function getModeColor(mode) {
	if (mode==1.0) {
		return 'rgb(255,102,0)';
	} else if (mode==2.0) {
		return 'rgb(255,255,255)';
	} else if (mode==3.0) {
		return 'rgb(0,0,255)';
	} else if (mode==4.0) {
		return 'rgb(255,255,0)';
	}
	return 'rgb(192,192,192)';
}

//////////////////////////////////////////////////////////////////////////////////////////////
// Формат вызова: getModeText(mode)
// Назначение: Вычисление текста анимации для режима воздухонагревателя.
// Параметры:
//             mode 	- номер режима воздухонагревателя.
//////////////////////////////////////////////////////////////////////////////////////////////
function getModeText(mode) {
	if ((mode==1.0) || (mode==1)) {
		return 'НАГРЕВ';
	} else if ((mode==2.0) || (mode==2)) {
		return 'ОТДЕЛЕНИЕ';
	} else if ((mode==3.0) || (mode==3)) {
		return 'ДУТЬЕ';
	} else if ((mode==4.0) || (mode==4)) {
		return 'ТЯГА';
	}
	return '-';
}

//////////////////////////////////////////////////////////////////////////////////////////////
// Формат вызова: formatDigits(V)
// Назначение: Форматирование числа с дополнением символа '0' для чисел меньше 10.
// Параметры:
//             V 	- форматируемое число.
//////////////////////////////////////////////////////////////////////////////////////////////
function formatDigits(V) {
	if (V<10) {
		return '0'+V.format(0,'');
	} else {
		return V.format(0,'');
	}
}

//////////////////////////////////////////////////////////////////////////////////////////////
// Формат вызова: changeVNMode(pos)
// Назначение: Нажатие кнопки изменение режима воздухонагревателя.
// Параметры:
//             pos 	- номер воздухонагревателя.
//////////////////////////////////////////////////////////////////////////////////////////////
function changeVNMode(pos) {
	var VNModeMenu=[
		{text:'НАГРЕВ',id:(10+pos).format(0,'')},
		{text:'ОТДЕЛЕНИЕ',id:(20+pos).format(0,'')},
		{text:'ДУТЬЕ',id:(30+pos).format(0,'')},
		{text:'ТЯГА',id:(40+pos).format(0,'')}
	];
	popupMenu(VNModeMenu,setVNMode);
}

//////////////////////////////////////////////////////////////////////////////////////////////
// Формат вызова: setVNMode(pos)
// Назначение: Изменение режима воздухонагревателя.
// Параметры:
//             if 	- номер воздухонагревателя и его режима работы.
//////////////////////////////////////////////////////////////////////////////////////////////
function setVNMode(result) {
	var id=parseFloat(result.key);
	var idValue=Math.floor(id);
	var vnMode=Math.floor(idValue/10);
	var pos=idValue % 10;
	var VN_ID='-';
	if (pos==1) {
		VN_ID='12';
	} else if (pos==2) {
		VN_ID='13';
	} else if (pos==3) {
		VN_ID='14';
	} else if (pos==4) {
		VN_ID='19';
	}
	if (confirm('Вы уверены что хотите включить режим \''+getModeText(vnMode)+'\' для воздухонагревателя №'+VN_ID.format(0,'')+'?')==true) {
		setFltTag('VN_'+pos.format(0,'')+'_MODE',vnMode);
	}
}