//////////////////////////////////////////////////////////////////////////////////////////////
// Автор: Владимир Щербина <vns.scherbina@gmail.com>
// copyright 2017
// Версия: 1.0.0
// Модуль energo.js реализует анимацию и логику диалогового взаимодействия для видеокадра energo.
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
	
	setHighlightButton('PR_TRENDS_BUTTON','showTrendByID(\'PR_TRENDS\');');
	setHighlightButton('AZ_VZ_ZAG_TRENDS_BUTTON','showTrendByID(\'AZ_VZ_ZAG_TRENDS\');');
	setHighlightButton('PG_HD_TRENDS_BUTTON','showTrendByID(\'PG_HD_TRENDS\');');
	setHighlightButton('PR_HD_TRENDS_BUTTON','showTrendByID(\'PR_HD_TRENDS\');');
	setHighlightButton('AZ_TRENDS_BUTTON','showTrendByID(\'AZ_TRENDS\');');
	setHighlightButton('AZ_ZAG_TRENDS_BUTTON','showTrendByID(\'AZ_ZAG_TRENDS\');');
	setHighlightButton('AZ_ZA_TRENDS_1_BUTTON','showTrendByID(\'AZ_ZA_TRENDS\');');
	setHighlightButton('AZ_ZA_TRENDS_3_BUTTON','showTrendByID(\'AZ_ZA_TRENDS\');');
	setHighlightButton('AZ_ZA_TRENDS_4_BUTTON','showTrendByID(\'AZ_ZA_TRENDS\');');
	setHighlightButton('AZ_ZA_TRENDS_5_BUTTON','showTrendByID(\'AZ_ZA_TRENDS\');');
	setHighlightButton('PR_ZA_TRENDS_1_BUTTON','showTrendByID(\'PR_ZA_TRENDS\');');
	setHighlightButton('PR_ZA_TRENDS_2_BUTTON','showTrendByID(\'PR_ZA_TRENDS\');');
	setHighlightButton('PR_ZA_TRENDS_3_BUTTON','showTrendByID(\'PR_ZA_TRENDS\');');
	setHighlightButton('PR_ZA_TRENDS_4_BUTTON','showTrendByID(\'PR_ZA_TRENDS\');');
	setHighlightButton('PR_ZA_TRENDS_5_BUTTON','showTrendByID(\'PR_ZA_TRENDS\');');
	setHighlightButton('VD_TRENDS_BUTTON','showTrendByID(\'VD_TRENDS\');');
	setHighlightButton('VD_MASL_TRENDS_BUTTON','showTrendByID(\'VD_MASL_TRENDS\');');
	setHighlightButton('VZ_TRENDS_BUTTON','showTrendByID(\'VZ_TRENDS\');');
	setHighlightButton('O2_TRENDS_BUTTON','showTrendByID(\'O2_TRENDS\');');
	setHighlightButton('PG_TRENDS_BUTTON','showTrendByID(\'PG_TRENDS\');');
	setHighlightButton('GSS_TRENDS_BUTTON','showTrendByID(\'GSS_TRENDS\');');
	setHighlightButton('VZ_OS_TRENDS_BUTTON','showTrendByID(\'VZ_OS_TRENDS\');');

	
	
	
	
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
	var PAZ_MIN=getBoolTag('PAZ_MIN');
	var PAZ_VMK_MIN=getBoolTag('PAZ_VMK_MIN');
	var PAZ_NMK_MIN=getBoolTag('PAZ_NMK_MIN');
	var PAZ_BK_MIN=getBoolTag('PAZ_BK_MIN');
	var PPR_SK_MIN=getBoolTag('PPR_SK_MIN');
	var PPR_PYL_MIN=getBoolTag('PPR_PYL_MIN');
	var PPR_VMK_MIN=getBoolTag('PPR_VMK_MIN');
	var PPR_NMK_MIN=getBoolTag('PPR_NMK_MIN');
	var PPR_BK_MIN=getBoolTag('PPR_BK_MIN');

	var FAZ=getFltTag('FAZ');
	var PAZ=getFltTag('PAZ');
	var TAZ=getFltTag('TAZ');
	var QO2AZ=getFltTag('QO2AZ');
	var FAZ_ZAG=getFltTag('FAZ_ZAG');
	var PAZ_ZAG=getFltTag('PAZ_ZAG');
	var TAZ_ZAG=getFltTag('TAZ_ZAG');
	var FAZ_PYL=getFltTag('FAZ_PYL');
	var PAZ_PYL=getFltTag('PAZ_PYL');
	var TAZ_PYL=getFltTag('TAZ_PYL');
	var FAZ_SK=getFltTag('FAZ_SK');
	var FAZ_VMK=getFltTag('FAZ_VMK');
	var FAZ_NMK=getFltTag('FAZ_NMK');
	var FAZ_BK=getFltTag('FAZ_BK');

	var FPR=getFltTag('FPR');
	var PPR=getFltTag('PPR');
	var TPR=getFltTag('TPR');
	var FPR_HD=getFltTag('FPR_HD');
	var PPR_HD=getFltTag('PPR_HD');
	var TPR_HD=getFltTag('TPR_HD');
	var FPR_SK=getFltTag('FPR_SK');
	var FPR_PYL=getFltTag('FPR_PYL');
	var FPR_VMK=getFltTag('FPR_VMK');
	var FPR_NMK=getFltTag('FPR_NMK');
	var FPR_BK=getFltTag('FPR_BK');

	var FVZ=getFltTag('FVZ');
	var PVZ=getFltTag('PVZ');
	var TVZ=getFltTag('TVZ');
	var FO2=getFltTag('FO2');
	var PO2=getFltTag('PO2');
	var TO2=getFltTag('TO2');

	var FVD_1=getFltTag('FVD_1');
	var FVD_2=getFltTag('FVD_2');
	var PVD_1=getFltTag('PVD_1');
	var PVD_2=getFltTag('PVD_2');
	var TVD_1=getFltTag('TVD_1');
	var TVD_2=getFltTag('TVD_2');
	var PVD_MASL=getFltTag('PVD_MASL');
	var FVD_MASL=getFltTag('FVD_MASL');

	var FPG_HD=getFltTag('FPG_HD');
	var PPG_HD=getFltTag('PPG_HD');
	var TPG_HD=getFltTag('TPG_HD');
	var FPG_GSS=getFltTag('FPG_GSS');
	var PPG_GSS=getFltTag('PPG_GSS');
	var TPG_GSS=getFltTag('TPG_GSS');
	var FPG_GEL=getFltTag('FPG_GEL');
	var PPG_GEL=getFltTag('PPG_GEL');
	var TPG_GEL=getFltTag('TPG_GEL');

    if (PAZ_MIN==true) {
        setStyle('PAZ_MIN_G','fill','rgb(255,0,0)');
    } else {
        setStyle('PAZ_MIN_G','fill','rgb(0,255,0)');
    }
    if (PAZ_MIN==true)  {
        setText('PAZ_MIN','падение');
    } else {
        setText('PAZ_MIN','норма');
    }
	setAlarmText('PAZ_VMK_MIN',PAZ_VMK_MIN);
	setAlarmText('PAZ_NMK_MIN',PAZ_NMK_MIN);
	setAlarmText('PAZ_BK_MIN',PAZ_BK_MIN);
	setAlarmColor('PAZ_VMK_MIN_G',PAZ_VMK_MIN);
	setAlarmColor('PAZ_NMK_MIN_G',PAZ_NMK_MIN);
	setAlarmColor('PAZ_BK_MIN_G',PAZ_BK_MIN);
	setAlarmText('PPR_SK_MIN',PPR_SK_MIN);
	setAlarmText('PPR_PYL_MIN',PPR_PYL_MIN);
	setAlarmText('PPR_VMK_MIN',PPR_VMK_MIN);
	setAlarmText('PPR_NMK_MIN',PPR_NMK_MIN);
	setAlarmText('PPR_BK_MIN',PPR_BK_MIN);
	setAlarmColor('PPR_SK_MIN_G',PPR_SK_MIN);
	setAlarmColor('PPR_PYL_MIN_G',PPR_PYL_MIN);
	setAlarmColor('PPR_VMK_MIN_G',PPR_VMK_MIN);
	setAlarmColor('PPR_NMK_MIN_G',PPR_NMK_MIN);
	setAlarmColor('PPR_BK_MIN_G',PPR_BK_MIN);

	setText('FAZ',FAZ.format(0,''));
	setText('PAZ',PAZ.format(2,''));
	setText('TAZ',TAZ.format(0,''));
	setText('QO2AZ',QO2AZ.format(1,''));
	setText('FAZ_ZAG',FAZ_ZAG.format(0,''));
	setText('PAZ_ZAG',PAZ_ZAG.format(2,''));
	setText('TAZ_ZAG',TAZ_ZAG.format(0,''));
	setText('FAZ_PYL',FAZ_PYL.format(0,''));
	setText('PAZ_PYL',PAZ_PYL.format(2,''));
	setText('TAZ_PYL',TAZ_PYL.format(0,''));
	setText('FAZ_SK',FAZ_SK.format(0,''));
	setText('FAZ_VMK',FAZ_VMK.format(0,''));
	setText('FAZ_NMK',FAZ_NMK.format(0,''));
	setText('FAZ_BK',FAZ_BK.format(0,''));

	setText('FPR',FPR.format(2,''));
	setText('PPR',PPR.format(2,''));
	setText('TPR',TPR.format(0,''));
	setText('FPR_HD',FPR_HD.format(2,''));
	setText('PPR_HD',PPR_HD.format(2,''));
	setText('TPR_HD',TPR_HD.format(0,''));
	setText('FPR_SK',FPR_SK.format(2,''));
	setText('FPR_PYL',FPR_PYL.format(2,''));
	setText('FPR_VMK',FPR_VMK.format(2,''));
	setText('FPR_NMK',FPR_NMK.format(2,''));
	setText('FPR_BK',FPR_BK.format(2,''));

	setText('FVZ',FVZ.format(0,''));
	setText('PVZ',PVZ.format(2,''));
	setText('TVZ',TVZ.format(0,''));
	setText('FO2',FO2.format(0,''));
	setText('PO2',PO2.format(1,''));
	setText('TO2',TO2.format(0,''));

	setText('FVD_1',FVD_1.format(0,''));
	setText('FVD_2',FVD_2.format(0,''));
	setText('PVD_1',PVD_1.format(1,''));
	setText('PVD_2',PVD_2.format(1,''));
	setText('TVD_1',TVD_1.format(0,''));
	setText('TVD_2',TVD_2.format(0,''));
 	setText('PVD_MASL',PVD_MASL.format(1,''));
 	setText('FVD_MASL',FVD_MASL.format(0,''));

	setText('PPG_DR',getFltTag('PPG_DR').format(2,''));
	setText('PPG',getFltTag('PPG').format(2,''));
	setText('TPG',getFltTag('TPG').format(0,''));
	setText('FPG_HD',FPG_HD.format(0,''));
	setText('PPG_HD',PPG_HD.format(2,''));
	setText('TPG_HD',TPG_HD.format(0,''));
	setText('FPG_GSS',FPG_GSS.format(0,''));
	setText('PPG_GSS',PPG_GSS.format(2,''));
	setText('TPG_GSS',TPG_GSS.format(0,''));
	setText('FPG_GEL',FPG_GEL.format(0,''));
	setText('PPG_GEL',PPG_GEL.format(2,''));
	setText('TPG_GEL',TPG_GEL.format(0,''));

	setText('FVZ_OS',getFltTag('FVZ_OS').format(0,''));
	setText('PVZ_OS',getFltTag('PVZ_OS').format(2,''));
	setText('TVZ_OS',getFltTag('TVZ_OS').format(0,''));

	setText('FVZ_AS',getFltTag('FVZ_AS').format(0,''));
	setText('PVZ_AS',getFltTag('PVZ_AS').format(2,''));
	setText('TVZ_AS',getFltTag('TVZ_AS').format(0,''));


	animateAlarmBackStroke('FAZ');
	animateAlarmBackStroke('PAZ');
	animateAlarmBackStroke('TAZ');
	animateAlarmBackStroke('QO2AZ');
	animateAlarmBackStroke('FAZ_ZAG');
	animateAlarmBackStroke('PAZ_ZAG');
	animateAlarmBackStroke('TAZ_ZAG');
	animateAlarmBackStroke('FAZ_PYL');
	animateAlarmBackStroke('PAZ_PYL');
	animateAlarmBackStroke('TAZ_PYL');
	animateAlarmBackStroke('FAZ_SK');
	animateAlarmBackStroke('FAZ_VMK');
	animateAlarmBackStroke('FAZ_NMK');
	animateAlarmBackStroke('FAZ_BK');

	animateAlarmBackStroke('FPR');
	animateAlarmBackStroke('PPR');
	animateAlarmBackStroke('TPR');
	animateAlarmBackStroke('FPR_HD');
	animateAlarmBackStroke('PPR_HD');
	animateAlarmBackStroke('TPR_HD');
	animateAlarmBackStroke('FPR_SK');
	animateAlarmBackStroke('FPR_PYL');
	animateAlarmBackStroke('FPR_VMK');
	animateAlarmBackStroke('FPR_NMK');
	animateAlarmBackStroke('FPR_BK');

	animateAlarmBackStroke('FVZ');
	animateAlarmBackStroke('PVZ');
	animateAlarmBackStroke('TVZ');
	animateAlarmBackStroke('FO2');
	animateAlarmBackStroke('PO2');
	animateAlarmBackStroke('TO2');

	animateAlarmBackStroke('FVD_1');
	animateAlarmBackStroke('FVD_2');
	animateAlarmBackStroke('PVD_1');
	animateAlarmBackStroke('PVD_2');
	animateAlarmBackStroke('TVD_1');
	animateAlarmBackStroke('TVD_2');
 	animateAlarmBackStroke('PVD_MASL');
 	animateAlarmBackStroke('FVD_MASL');

	animateAlarmBackStroke('PPG_DR');
	animateAlarmBackStroke('PPG');
	animateAlarmBackStroke('TPG');
	animateAlarmBackStroke('FPG_HD');
	animateAlarmBackStroke('PPG_HD');
	animateAlarmBackStroke('TPG_HD');
	animateAlarmBackStroke('FPG_GSS');
	animateAlarmBackStroke('PPG_GSS');
	animateAlarmBackStroke('TPG_GSS');
	animateAlarmBackStroke('FPG_GEL');
	animateAlarmBackStroke('PPG_GEL');
	animateAlarmBackStroke('TPG_GEL');

	animateAlarmBackStroke('FVZ_OS');
	animateAlarmBackStroke('PVZ_OS');
	animateAlarmBackStroke('TVZ_OS');

	animateAlarmBackStroke('FVZ_AS');
	animateAlarmBackStroke('PVZ_AS');
	animateAlarmBackStroke('TVZ_AS');

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
// Формат вызова: setAlarmColor(elementID,state)
// Назначение: Анимация цвета аварии.
// Параметры:
//             elementID 		- идентификатор объекта;
//             state 			- признак аварии.
//////////////////////////////////////////////////////////////////////////////////////////////
function setAlarmColor(elementID,state) {
    setStyle(elementID,'fill',state ? 'rgb(0,255,0)' : 'rgb(255,0,0)');
}

//////////////////////////////////////////////////////////////////////////////////////////////
// Формат вызова: setAlarmText(elementID,state)
// Назначение: Анимация текста аварии.
// Параметры:
//             elementID 		- идентификатор объекта;
//             state 			- признак аварии.
//////////////////////////////////////////////////////////////////////////////////////////////
function setAlarmText(elementID,state) {
    setText(elementID,state ? 'норма' : 'падение');
}