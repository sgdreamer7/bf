//////////////////////////////////////////////////////////////////////////////////////////////
// Автор: Владимир Щербина <vns.scherbina@gmail.com>
// copyright 2017
// Версия: 1.0.0
// Модуль charge_refs.js реализует анимацию и логику диалогового взаимодействия для видеокадра charge_refs.
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
var selectedProgram=0;
var selectedSkipProgram='';
var selectedSkip=0;
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

	setHighlightButton('PA_NMK_BUTTON','changeNMK(\'A\');');
	setHighlightButton('PB_NMK_BUTTON','changeNMK(\'B\');');
	setHighlightButton('PC_NMK_BUTTON','changeNMK(\'C\');');
	setHighlightButton('PD_NMK_BUTTON','changeNMK(\'D\');');
	setHighlightButton('PE_NMK_BUTTON','changeNMK(\'E\');');
	setVisibility('PROGRAM_SELECT_GROUP',true);
	setHighlightButton('PROGRAM_A_SELECTOR','selectProgram(\'A\');');
	setHighlightButton('PROGRAM_B_SELECTOR','selectProgram(\'B\');');
	setHighlightButton('PROGRAM_C_SELECTOR','selectProgram(\'C\');');
	setHighlightButton('PROGRAM_D_SELECTOR','selectProgram(\'D\');');
	setHighlightButton('PROGRAM_E_SELECTOR','selectProgram(\'E\');');
	setHighlightButton('PROGRAM_NONE_SELECTOR','selectProgram(\'-\');');
	setHighlightButton('PROGRAM_CANCEL_SELECTOR','selectProgram(\'\');');
	setVisibility('PROGRAM_SELECT_GROUP',false);
	setVisibility('SKIP_SELECT_GROUP',true);
	setHighlightButton('SKIP_COKE_SELECTOR','selectSkip(\'К\');');
	setHighlightButton('SKIP_SINTER_SELECTOR','selectSkip(\'Р\');');
	setHighlightButton('SKIP_EMPTY_SELECTOR','selectSkip(\'П\');');
	setHighlightButton('SKIP_CANCEL_SELECTOR','selectSkip(\'\');');
	setVisibility('SKIP_SELECT_GROUP',false);

	var i=0;
	for (i=1; i<=6; i++) {
		setHighlightButton('PA_'+i.format(0,'')+'_BUTTON','changeSkip(\'A\','+i.format(0,'')+');');
		setHighlightButton('PB_'+i.format(0,'')+'_BUTTON','changeSkip(\'B\','+i.format(0,'')+');');
		setHighlightButton('PC_'+i.format(0,'')+'_BUTTON','changeSkip(\'C\','+i.format(0,'')+');');
		setHighlightButton('PD_'+i.format(0,'')+'_BUTTON','changeSkip(\'D\','+i.format(0,'')+');');
		setHighlightButton('PE_'+i.format(0,'')+'_BUTTON','changeSkip(\'E\','+i.format(0,'')+');');
		if ((i>1) && (i<6)) {
			setHighlightButton('PA_'+i.format(0,'')+'_BK_BUTTON','changeBK(\'A\','+i.format(0,'')+');');
			setHighlightButton('PB_'+i.format(0,'')+'_BK_BUTTON','changeBK(\'B\','+i.format(0,'')+');');
			setHighlightButton('PC_'+i.format(0,'')+'_BK_BUTTON','changeBK(\'C\','+i.format(0,'')+');');
			setHighlightButton('PD_'+i.format(0,'')+'_BK_BUTTON','changeBK(\'D\','+i.format(0,'')+');');
			setHighlightButton('PE_'+i.format(0,'')+'_BK_BUTTON','changeBK(\'E\','+i.format(0,'')+');');
		}
	}
	for (i=1; i<=20; i++) {
		setHighlightButton('P'+i.format(0,'')+'_BUTTON','changeProgram('+i.format(0,'')+');');
	}
	for (i=1; i<=16; i++) {
		setHighlightButton('VR'+i.format(0,'')+'_L_BUTTON','changeVR('+i.format(0,'')+',\'L\');');
		setHighlightButton('VR'+i.format(0,'')+'_R_BUTTON','changeVR('+i.format(0,'')+',\'R\');');
	}
	for (i=1; i<=10; i++) {
		setHighlightButton('PROBE'+i.format(0,'')+'_L_BUTTON','changeProbe('+i.format(0,'')+',\'L\');');
		setHighlightButton('PROBE'+i.format(0,'')+'_R_BUTTON','changeProbe('+i.format(0,'')+',\'R\');');
	}
	

	
	
	
	
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

	setStyle('PA_PROCESSED_BACK','fill',getBoolTag('PA_PROCESSED') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setStyle('PB_PROCESSED_BACK','fill',getBoolTag('PB_PROCESSED') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setStyle('PC_PROCESSED_BACK','fill',getBoolTag('PC_PROCESSED') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setStyle('PD_PROCESSED_BACK','fill',getBoolTag('PD_PROCESSED') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setStyle('PE_PROCESSED_BACK','fill',getBoolTag('PE_PROCESSED') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');

	setText('PA_NMK',getBoolTag('PA_NMK') ? '1' : getBoolTag('PA_NMK2') ? '2' : '-');
	setText('PB_NMK',getBoolTag('PB_NMK') ? '1' : getBoolTag('PB_NMK2') ? '2' : '-');
	setText('PC_NMK',getBoolTag('PC_NMK') ? '1' : getBoolTag('PC_NMK2') ? '2' : '-');
	setText('PD_NMK',getBoolTag('PD_NMK') ? '1' : getBoolTag('PD_NMK2') ? '2' : '-');
	setText('PE_NMK',getBoolTag('PE_NMK') ? '1' : getBoolTag('PE_NMK2') ? '2' : '-');

	var allP=[];
	allP['-']=[];
	allP['А']=[];
	allP['Б']=[];
	allP['В']=[];
	allP['Г']=[];
	allP['Д']=[];

	for (i=1; i<=6; i++) {
		allP['-'][i]='-';
		allP['А'][i]=
			getBoolTag('PA_'+i.format(0,'')+'_COKE') ? 'К' :
				getBoolTag('PA_'+i.format(0,'')+'_SINTER') ? 'Р' :
					getBoolTag('PA_'+i.format(0,'')+'_EMPTY') ? 'П' :
						getBoolTag('PA_'+i.format(0,'')+'_SKIP') ? '-' : 'X';
		allP['Б'][i]=
			getBoolTag('PB_'+i.format(0,'')+'_COKE') ? 'К' :
				getBoolTag('PB_'+i.format(0,'')+'_SINTER') ? 'Р' :
					getBoolTag('PB_'+i.format(0,'')+'_EMPTY') ? 'П' :
						getBoolTag('PB_'+i.format(0,'')+'_SKIP') ? '-' : 'X';
		allP['В'][i]=
			getBoolTag('PC_'+i.format(0,'')+'_COKE') ? 'К' :
				getBoolTag('PC_'+i.format(0,'')+'_SINTER') ? 'Р' :
					getBoolTag('PC_'+i.format(0,'')+'_EMPTY') ? 'П' :
						getBoolTag('PC_'+i.format(0,'')+'_SKIP') ? '-' : 'X';
		allP['Г'][i]=
			getBoolTag('PD_'+i.format(0,'')+'_COKE') ? 'К' :
				getBoolTag('PD_'+i.format(0,'')+'_SINTER') ? 'Р' :
					getBoolTag('PD_'+i.format(0,'')+'_EMPTY') ? 'П' :
						getBoolTag('PD_'+i.format(0,'')+'_SKIP') ? '-' : 'X';
		allP['Д'][i]=
			getBoolTag('PE_'+i.format(0,'')+'_COKE') ? 'К' :
				getBoolTag('PE_'+i.format(0,'')+'_SINTER') ? 'Р' :
					getBoolTag('PE_'+i.format(0,'')+'_EMPTY') ? 'П' :
						getBoolTag('PE_'+i.format(0,'')+'_SKIP') ? '-' : 'X';

		setText('PA_'+i.format(0,''),allP['А'][i]);
		setText('PB_'+i.format(0,''),allP['Б'][i]);
		setText('PC_'+i.format(0,''),allP['В'][i]);
		setText('PD_'+i.format(0,''),allP['Г'][i]);
		setText('PE_'+i.format(0,''),allP['Д'][i]);
		setStyle('PA_'+i.format(0,'')+'_BACK','fill',getBackColor(allP['А'][i]));
		setStyle('PB_'+i.format(0,'')+'_BACK','fill',getBackColor(allP['Б'][i]));
		setStyle('PC_'+i.format(0,'')+'_BACK','fill',getBackColor(allP['В'][i]));
		setStyle('PD_'+i.format(0,'')+'_BACK','fill',getBackColor(allP['Г'][i]));
		setStyle('PE_'+i.format(0,'')+'_BACK','fill',getBackColor(allP['Д'][i]));		
		if ((i>1) && (i<6)) {
			setStyle('PA_'+i.format(0,'')+'_BK_BACK','fill',getBoolTag('PA_'+i.format(0,'')+'_BK') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
			setStyle('PB_'+i.format(0,'')+'_BK_BACK','fill',getBoolTag('PB_'+i.format(0,'')+'_BK') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
			setStyle('PC_'+i.format(0,'')+'_BK_BACK','fill',getBoolTag('PC_'+i.format(0,'')+'_BK') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
			setStyle('PD_'+i.format(0,'')+'_BK_BACK','fill',getBoolTag('PD_'+i.format(0,'')+'_BK') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
			setStyle('PE_'+i.format(0,'')+'_BK_BACK','fill',getBoolTag('PE_'+i.format(0,'')+'_BK') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
		}
		setStyle('SKIP'+i.format(0,'')+'_BACK','fill',getBoolTag('SKIP'+i.format(0,'')+'_PROCESSED') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	}

	var cyclePos=0;
	for (i=1; i<=20; i++) {
		if (getBoolTag('P'+i.format(0,'')+'_PROCESSED')==true) {
			cyclePos=i;
		}
	}
	for (i=1; i<=20; i++) {
		var tagName='P'+i.format(0,'');
		var selP=
			getBoolTag(tagName+'_A') ? 'А' :
				getBoolTag(tagName+'_B') ? 'Б' :
					getBoolTag(tagName+'_C') ? 'В' :
						getBoolTag(tagName+'_D') ? 'Г' :
							getBoolTag(tagName+'_E') ? 'Д' : '-';
		setText(tagName,selP);

		setStyle(tagName+'_BACK','fill',
			i<cyclePos ? 'rgb(224,224,224)' :
				i==cyclePos ? 'rgb(0,255,0)' : 'rgb(255,255,0)');

		var j=0;
		for (j=1; j<=6; j++) {
			setText(tagName+'_'+j.format(0,''),allP[selP][j]);
		}
	}
	for (i=1; i<=16; i++) {
		var tagName='VR'+i.format(0,'')+'_L';
		var tagNameRef='VR_REF'+i.format(0,'')+'_L';
		
		setStyle(tagName+'_BACK','fill',
			getBoolTag(tagName) ? 'rgb(255,255,0)' : 
				getBoolTag(tagNameRef) ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
		
		tagName='VR'+i.format(0,'')+'_R';
		tagNameRef='VR_REF'+i.format(0,'')+'_R';
		
		setStyle(tagName+'_BACK','fill',
			getBoolTag(tagName) ? 'rgb(255,255,0)' : 
				getBoolTag(tagNameRef) ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	}
	for (i=1; i<=10; i++) {
		var tagName='PROBE'+i.format(0,'')+'_L';
		var tagNameRef='PROBE_REF'+i.format(0,'')+'_L';
		
		setStyle(tagName+'_BACK','fill', 	getBoolTag(tagNameRef) ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
		
		tagName='PROBE'+i.format(0,'')+'_R';
		tagNameRef='PROBE_REF'+i.format(0,'')+'_R';
		
		setStyle(tagName+'_BACK','fill', 	getBoolTag(tagNameRef) ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
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
// Формат вызова: getBackColor(skip)
// Назначение: Получение цвета фона для заданного типа скипа.
// Параметры:
//             skip 	- тип скипа.
//////////////////////////////////////////////////////////////////////////////////////////////
function getBackColor(skip) {
	var backColor=
		skip=='К' ? 'rgb(127,127,127)' :
			skip=='Р' ? 'rgb(127,0,0)' :
				skip=='П' ? 'rgb(255,255,255)' :
					skip=='-' ? 'rgb(224,224,224)' : 'rgb(255,0,0)';
	return backColor;
}

//////////////////////////////////////////////////////////////////////////////////////////////
// Формат вызова: changeNMK(program)
// Назначение: Изменение задания количества скипов на НМК.
// Параметры:
//             program 	- программа.
//////////////////////////////////////////////////////////////////////////////////////////////
function changeNMK(program) {
	var skipFlag=getBoolTag('P'+program+'_NMK');
	var skipFlag2=getBoolTag('P'+program+'_NMK2');
	if (getBoolTag('P'+program+'_PROCESSED')==false) {
		if (skipFlag==true) {
			setBoolTag('P'+program+'_NMK',false);
			setBoolTag('P'+program+'_NMK2',true);
		} else if (skipFlag2==true) {
			setBoolTag('P'+program+'_NMK',true);
			setBoolTag('P'+program+'_NMK2',false);
		} else {
			setBoolTag('P'+program+'_NMK',true);
			setBoolTag('P'+program+'_NMK2',false);
		}
	}
}

//////////////////////////////////////////////////////////////////////////////////////////////
// Формат вызова: changeBK(program,skip)
// Назначение: Изменение задания признака дополнительного опускания большого конуса.
// Параметры:
//             program 	- программа;
//             skip 	- номер скипа.
//////////////////////////////////////////////////////////////////////////////////////////////
function changeBK(program,skip) {
	var bkFlag=getBoolTag('P'+program+'_'+skip.format(0,'')+'_BK');
	if (getBoolTag('P'+program+'_PROCESSED')==false) {
		setBoolTag('P'+program+'_'+skip.format(0,'')+'_BK',!bkFlag);
	}
}

//////////////////////////////////////////////////////////////////////////////////////////////
// Формат вызова: changeSkip(program,skip)
// Назначение: Изменение задания типа скипа.
// Параметры:
//             program 	- программа;
//             skip 	- номер скипа.
//////////////////////////////////////////////////////////////////////////////////////////////
function changeSkip(program,skip) {
	var skipCoke=getBoolTag('P'+program+'_'+skip.format(0,'')+'_COKE');
	var skipSinter=getBoolTag('P'+program+'_'+skip.format(0,'')+'_SINTER');
	var skipEmpty=getBoolTag('P'+program+'_'+skip.format(0,'')+'_EMPTY');
	var skipSkip=getBoolTag('P'+program+'_'+skip.format(0,'')+'_SKIP');
	if (getBoolTag('P'+program+'_PROCESSED')==false) {
		selectedSkipProgram=program;
		selectedSkip=skip;
		var programPos=0;
		if (program=='A') {
			programPos=1;
		} else if (program=='B') {
			programPos=2;
		} else if (program=='C') {
			programPos=3;
		} else if (program=='D') {
			programPos=4;
		} else if (program=='E') {
			programPos=5;
		}
		setTranslation('SKIP_SELECT_GROUP',60+(programPos-1)*260,-170+(skip-1)*50);
		setVisibility('SKIP_SELECT_GROUP',true);
	}
}

//////////////////////////////////////////////////////////////////////////////////////////////
// Формат вызова: selectSkip(skip)
// Назначение: Выбор задания типа скипа.
// Параметры:
//             skip 	- выбранный скип.
//////////////////////////////////////////////////////////////////////////////////////////////
function selectSkip(skip) {
	var skipCoke=getBoolTag('P'+selectedSkipProgram+'_'+selectedSkip.format(0,'')+'_COKE');
	var skipSinter=getBoolTag('P'+selectedSkipProgram+'_'+selectedSkip.format(0,'')+'_SINTER');
	var skipEmpty=getBoolTag('P'+selectedSkipProgram+'_'+selectedSkip.format(0,'')+'_EMPTY');
	var skipSkip=getBoolTag('P'+selectedSkipProgram+'_'+selectedSkip.format(0,'')+'_SKIP');
	var programPos='-';
	if (selectedSkipProgram=='A') {
		programPos='А';
	} else if (selectedSkipProgram=='B') {
		programPos='Б';
	} else if (selectedSkipProgram=='C') {
		programPos='В';
	} else if (selectedSkipProgram=='D') {
		programPos='Г';
	} else if (selectedSkipProgram=='E') {
		programPos='Д';
	}
	if (getBoolTag('P'+selectedSkipProgram+'_PROCESSED')==false) {
		if (skip=='К') {
			if (confirm('Подтвердите выбор коксового скипа №'+selectedSkip.format(0,'')+' для программы \''+programPos+'\'')==true) {
				if (getBoolTag('P'+selectedSkipProgram.format(0,'')+'_PROCESSED')==false) {
					setBoolTag('P'+selectedSkipProgram+'_'+selectedSkip.format(0,'')+'_SINTER',false);
					setBoolTag('P'+selectedSkipProgram+'_'+selectedSkip.format(0,'')+'_EMPTY',false);
					setBoolTag('P'+selectedSkipProgram+'_'+selectedSkip.format(0,'')+'_SKIP',false);
					setBoolTag('P'+selectedSkipProgram+'_'+selectedSkip.format(0,'')+'_COKE',true);
				}
			}
		} else if (skip=='Р') {
			if (confirm('Подтвердите выбор рудного скипа №'+selectedSkip.format(0,'')+' для программы \''+programPos+'\'')==true) {
				if (getBoolTag('P'+selectedSkipProgram.format(0,'')+'_PROCESSED')==false) {
					setBoolTag('P'+selectedSkipProgram+'_'+selectedSkip.format(0,'')+'_COKE',false);
					setBoolTag('P'+selectedSkipProgram+'_'+selectedSkip.format(0,'')+'_EMPTY',false);
					setBoolTag('P'+selectedSkipProgram+'_'+selectedSkip.format(0,'')+'_SKIP',false);
					setBoolTag('P'+selectedSkipProgram+'_'+selectedSkip.format(0,'')+'_SINTER',true);
				}
			}
		} else if (skip=='П') {
			if (confirm('Подтвердите выбор программного перегона скипа №'+selectedSkip.format(0,'')+' для программы \''+programPos+'\'')==true) {
				if (getBoolTag('P'+selectedSkipProgram.format(0,'')+'_PROCESSED')==false) {
					if (selectedSkip!=1) {
						setBoolTag('P'+selectedSkipProgram+'_'+selectedSkip.format(0,'')+'_COKE',false);
						setBoolTag('P'+selectedSkipProgram+'_'+selectedSkip.format(0,'')+'_SINTER',false);
						setBoolTag('P'+selectedSkipProgram+'_'+selectedSkip.format(0,'')+'_SKIP',false);
						setBoolTag('P'+selectedSkipProgram+'_'+selectedSkip.format(0,'')+'_EMPTY',true);
					}
				}
			}
		} else if (skip=='-') {
			if (confirm('Подтвердите выбор пропуска положения скипа №'+selectedSkip.format(0,'')+' для программы \''+programPos+'\'')==true) {
				if (getBoolTag('P'+selectedSkipProgram.format(0,'')+'_PROCESSED')==false) {
					if (selectedSkip!=1) {
						setBoolTag('P'+selectedSkipProgram+'_'+selectedSkip.format(0,'')+'_COKE',false);
						setBoolTag('P'+selectedSkipProgram+'_'+selectedSkip.format(0,'')+'_SINTER',false);
						setBoolTag('P'+selectedSkipProgram+'_'+selectedSkip.format(0,'')+'_EMPTY',false);
						setBoolTag('P'+selectedSkipProgram+'_'+selectedSkip.format(0,'')+'_SKIP',true);
					}
				}
			}
		}
	}
	setVisibility('SKIP_SELECT_GROUP',false);
}

//////////////////////////////////////////////////////////////////////////////////////////////
// Формат вызова: changeProgram(cycle)
// Назначение: Изменение задания программы цикла.
// Параметры:
//             cycle 	- номер цикла.
//////////////////////////////////////////////////////////////////////////////////////////////
function changeProgram(cycle) {
	var programAFlag=getBoolTag('P'+cycle.format(0,'')+'_A');
	var programBFlag=getBoolTag('P'+cycle.format(0,'')+'_B');
	var programCFlag=getBoolTag('P'+cycle.format(0,'')+'_C');
	var programDFlag=getBoolTag('P'+cycle.format(0,'')+'_D');
	var programEFlag=getBoolTag('P'+cycle.format(0,'')+'_E');
	if (getBoolTag('P'+cycle.format(0,'')+'_PROCESSED')==false) {
		selectedProgram=cycle;
		setTranslation('PROGRAM_SELECT_GROUP',80+(cycle-1)*50,140);
		setVisibility('PROGRAM_SELECT_GROUP',true);
	}
}

//////////////////////////////////////////////////////////////////////////////////////////////
// Формат вызова: selectProgram(prg)
// Назначение: Выбор задания программы цикла.
// Параметры:
//             prg 	- выбранная программа.
//////////////////////////////////////////////////////////////////////////////////////////////
function selectProgram(prg) {
	if (getBoolTag('P'+selectedProgram.format(0,'')+'_PROCESSED')==false) {
		if (prg=='A') {
			if (confirm('Подтвердите выбор программы \'А\' для цикла '+selectedProgram.format(0,''))==true) {
				if (getBoolTag('P'+selectedProgram.format(0,'')+'_PROCESSED')==false) {
					setBoolTag('P'+selectedProgram.format(0,'')+'_B',false);
					setBoolTag('P'+selectedProgram.format(0,'')+'_C',false);
					setBoolTag('P'+selectedProgram.format(0,'')+'_D',false);
					setBoolTag('P'+selectedProgram.format(0,'')+'_E',false);
					setBoolTag('P'+selectedProgram.format(0,'')+'_A',true);
				}
			}
		} else if (prg=='B') {
			if (confirm('Подтвердите выбор программы \'Б\' для цикла '+selectedProgram.format(0,''))==true) {
				if (getBoolTag('P'+selectedProgram.format(0,'')+'_PROCESSED')==false) {
					setBoolTag('P'+selectedProgram.format(0,'')+'_A',false);
					setBoolTag('P'+selectedProgram.format(0,'')+'_C',false);
					setBoolTag('P'+selectedProgram.format(0,'')+'_D',false);
					setBoolTag('P'+selectedProgram.format(0,'')+'_E',false);
					setBoolTag('P'+selectedProgram.format(0,'')+'_B',true);
				}
			}
		} else if (prg=='C') {
			if (confirm('Подтвердите выбор программы \'В\' для цикла '+selectedProgram.format(0,''))==true) {
				if (getBoolTag('P'+selectedProgram.format(0,'')+'_PROCESSED')==false) {
					setBoolTag('P'+selectedProgram.format(0,'')+'_A',false);
					setBoolTag('P'+selectedProgram.format(0,'')+'_B',false);
					setBoolTag('P'+selectedProgram.format(0,'')+'_D',false);
					setBoolTag('P'+selectedProgram.format(0,'')+'_E',false);
					setBoolTag('P'+selectedProgram.format(0,'')+'_C',true);
				}
			}
		} else if (prg=='D') {
			if (confirm('Подтвердите выбор программы \'Г\' для цикла '+selectedProgram.format(0,''))==true) {
				if (getBoolTag('P'+selectedProgram.format(0,'')+'_PROCESSED')==false) {
					setBoolTag('P'+selectedProgram.format(0,'')+'_A',false);
					setBoolTag('P'+selectedProgram.format(0,'')+'_B',false);
					setBoolTag('P'+selectedProgram.format(0,'')+'_C',false);
					setBoolTag('P'+selectedProgram.format(0,'')+'_E',false);
					setBoolTag('P'+selectedProgram.format(0,'')+'_D',true);
				}
			}
		} else if (prg=='E') {
			if (confirm('Подтвердите выбор программы \'Д\' для цикла '+selectedProgram.format(0,''))==true) {
				if (getBoolTag('P'+selectedProgram.format(0,'')+'_PROCESSED')==false) {
					setBoolTag('P'+selectedProgram.format(0,'')+'_A',false);
					setBoolTag('P'+selectedProgram.format(0,'')+'_B',false);
					setBoolTag('P'+selectedProgram.format(0,'')+'_C',false);
					setBoolTag('P'+selectedProgram.format(0,'')+'_D',false);
					setBoolTag('P'+selectedProgram.format(0,'')+'_E',true);
				}
			}
		} else if (prg=='-') {
			if (confirm('Подтвердите выбор пропуска положения для цикла '+selectedProgram.format(0,''))==true) {
				if (getBoolTag('P'+selectedProgram.format(0,'')+'_PROCESSED')==false) {
					setBoolTag('P'+selectedProgram.format(0,'')+'_A',false);
					setBoolTag('P'+selectedProgram.format(0,'')+'_B',false);
					setBoolTag('P'+selectedProgram.format(0,'')+'_C',false);
					setBoolTag('P'+selectedProgram.format(0,'')+'_D',false);
					setBoolTag('P'+selectedProgram.format(0,'')+'_E',false);
				}
			}
		}
	}
	setVisibility('PROGRAM_SELECT_GROUP',false);
}

//////////////////////////////////////////////////////////////////////////////////////////////
// Формат вызова: changeVR(angle,side)
// Назначение: Изменение задания углов ВРШ.
// Параметры:
//             angle 	- станция ВР;
//             side 	- сторона.
//////////////////////////////////////////////////////////////////////////////////////////////
function changeVR(angle,side) {
	var vrProcessing=getBoolTag('VR'+angle.format(0,'')+'_'+side);
	var vrRef=getBoolTag('VR_REF'+angle.format(0,'')+'_'+side);
	if (vrProcessing==false) {
		setBoolTag('VR_REF'+angle.format(0,'')+'_'+side,!vrRef);
	}
}

//////////////////////////////////////////////////////////////////////////////////////////////
// Формат вызова: changeProbe(level,side)
// Назначение: Изменение задания уровня засыпи шихты.
// Параметры:
//             level 	- положение зонда;
//             side 	- сторона.
//////////////////////////////////////////////////////////////////////////////////////////////
function changeProbe(level,side) {
	var i=0;
	if (confirm('Подтвердите измеения задания уровни шихты')) {
		for (i=1; i<=10; i++) {
			setBoolTag('PROBE_REF'+i.format(0,'')+'_'+side,i==level);
		}
	}
}
