//////////////////////////////////////////////////////////////////////////////////////////////
// Автор: Владимир Щербина <vns.scherbina@gmail.com>
// copyright 2017
// Версия: 1.0.0
// Модуль charge.js реализует анимацию и логику диалогового взаимодействия для видеокадра charge.
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
var LeftLastLevel=-2;
var RightLastLevel=-2;
var VRState=false;
var CHARGE_LEVEL_L_REF=0.0;
var CHARGE_LEVEL_R_REF=0.0;
var LEVEL_REFS=[0.0,0.5,0.75,1.0,1.25,1.5,1.75,2.0,2.5,3.0,4.0];

////////////////////////////////////////////////////////////////////////////////
// Инициализация
////////////////////////////////////////////////////////////////////////////////
var	ChargeFramesMenu=[
		{text:'Программа подач и циклов',id:'charge_refs.svg'},
		{text:'Гидросистема конусов',id:'gydro.svg'},
		{text:'Густые смазки',id:'masl.svg'},
		{text:'Режимы работы',id:'charge_modes.svg'}
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
	setHighlightButton('CHARGE_REFS_BUTTON','charge_refs_click();');
	setHighlightButton('CHARGE_MODES_BUTTON','charge_modes_click();');
	setHighlightButton('GYDRO_BUTTON','gydro_click();');
	setHighlightButton('MASL_BUTTON','masl_click();');
	setHighlightButton('AZ_VZ_ZAG_TRENDS_1_BUTTON','showTrendByID(\'AZ_VZ_ZAG_TRENDS\');');
	setHighlightButton('AZ_VZ_ZAG_TRENDS_2_BUTTON','showTrendByID(\'AZ_VZ_ZAG_TRENDS\');');
	setHighlightButton('CHARGE_LEVEL_L_TRENDS_BUTTON','showTrendByID(\'CHARGE_LEVEL_L_TRENDS\');');
	setHighlightButton('CHARGE_LEVEL_R_TRENDS_BUTTON','showTrendByID(\'CHARGE_LEVEL_R_TRENDS\');');
	setHighlightButton('PKG_ZAG_TRENDS_1_BUTTON','showTrendByID(\'PKG_ZAG_TRENDS\');');
	setHighlightButton('PKG_ZAG_TRENDS_2_BUTTON','showTrendByID(\'PKG_ZAG_TRENDS\');');
	setHighlightButton('PKG_ZAG_TRENDS_3_BUTTON','showTrendByID(\'PKG_ZAG_TRENDS\');');
	setHighlightButton('VR_ANGLE_TRENDS_BUTTON','showTrendByID(\'VR_ANGLE_TRENDS\');');
	setHighlightButton('K_POSITION_TRENDS_1_BUTTON','showTrendByID(\'K_POSITION_TRENDS\');');
	setHighlightButton('K_POSITION_TRENDS_2_BUTTON','showTrendByID(\'K_POSITION_TRENDS\');');
	setHighlightButton('K_POSITION_TRENDS_3_BUTTON','showTrendByID(\'K_POSITION_TRENDS\');');
	setHighlightButton('SKIP_TRENDS_1_BUTTON','showTrendByID(\'SKIP_TRENDS\');');
	setHighlightButton('SKIP_TRENDS_2_BUTTON','showTrendByID(\'SKIP_TRENDS\');');
	setHighlightButton('SKIP_TRENDS_3_BUTTON','showTrendByID(\'SKIP_TRENDS\');');
	setButton('CHARGE_BUTTON','local_charge_click();');
	setHighlightButton('CHARGE_MESSAGES_BUTTON','openFrameWithParameters(\'alarm.svg\',\'selector=10;\');');

	addKeyAction(local_charge_click,KeyEvent.VK_F1,0);

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
	setHighlightButton('SKIP_SKIP_SELECTOR','selectSkip(\'-\');');
	setHighlightButton('SKIP_CANCEL_SELECTOR','selectSkip(\'\');');
	setVisibility('SKIP_SELECT_GROUP',false);
	var i=0;
	for (i=1; i<=6; i++) {
		setHighlightButton('PA_'+i.format(0,'')+'_BUTTON','changeSkip(\'A\','+i.format(0,'')+');');
		setHighlightButton('PB_'+i.format(0,'')+'_BUTTON','changeSkip(\'B\','+i.format(0,'')+');');
		setHighlightButton('PC_'+i.format(0,'')+'_BUTTON','changeSkip(\'C\','+i.format(0,'')+');');
		setHighlightButton('PD_'+i.format(0,'')+'_BUTTON','changeSkip(\'D\','+i.format(0,'')+');');
		setHighlightButton('PE_'+i.format(0,'')+'_BUTTON','changeSkip(\'E\','+i.format(0,'')+');');
	}
	for (i=1; i<=20; i++) {
		setHighlightButton('P'+i.format(0,'')+'_BUTTON','changeProgram('+i.format(0,'')+');');
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
		setStyle('PA_'+i.format(0,'')+'_BACK','fill',(getBoolTag('SKIP'+i.format(0,'')+'_PROCESSED')==true) && (getBoolTag('PA_PROCESSED')==true) ? 'rgb(0,255,0)' : getBackColor(allP['А'][i]));
		setStyle('PB_'+i.format(0,'')+'_BACK','fill',(getBoolTag('SKIP'+i.format(0,'')+'_PROCESSED')==true) && (getBoolTag('PB_PROCESSED')==true) ? 'rgb(0,255,0)' : getBackColor(allP['Б'][i]));
		setStyle('PC_'+i.format(0,'')+'_BACK','fill',(getBoolTag('SKIP'+i.format(0,'')+'_PROCESSED')==true) && (getBoolTag('PC_PROCESSED')==true) ? 'rgb(0,255,0)' : getBackColor(allP['В'][i]));
		setStyle('PD_'+i.format(0,'')+'_BACK','fill',(getBoolTag('SKIP'+i.format(0,'')+'_PROCESSED')==true) && (getBoolTag('PD_PROCESSED')==true) ? 'rgb(0,255,0)' : getBackColor(allP['Г'][i]));
		setStyle('PE_'+i.format(0,'')+'_BACK','fill',(getBoolTag('SKIP'+i.format(0,'')+'_PROCESSED')==true) && (getBoolTag('PE_PROCESSED')==true) ? 'rgb(0,255,0)' : getBackColor(allP['Д'][i]));
		setStyle('SKIP'+i.format(0,'')+'_BACK','fill',getBoolTag('SKIP'+i.format(0,'')+'_PROCESSED') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	}

	var cyclePos=0;
	for (i=1; i<=20; i++) {
		if (getBoolTag('P'+i.format(0,'')+'_PROCESSED')==true) {
			cyclePos=i;
		}
	}
	if ((cyclePos>=1) && (cyclePos<=20)) {
		var tagName2='P'+cyclePos.format(0,'');
		var selP2=
			getBoolTag(tagName+'_A') ? 'A' :
				getBoolTag(tagName+'_B') ? 'B' :
					getBoolTag(tagName+'_C') ? 'C' :
						getBoolTag(tagName+'_D') ? 'D' :
							getBoolTag(tagName+'_E') ? 'E' : '-';
		setStyle('BK_2_BACK','fill',getBoolTag('P'+selP2+'_2_BACK') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
		setStyle('BK_3_BACK','fill',getBoolTag('P'+selP2+'_3_BACK') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
		setStyle('BK_4_BACK','fill',getBoolTag('P'+selP2+'_4_BACK') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
		setStyle('BK_5_BACK','fill',getBoolTag('P'+selP2+'_5_BACK') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
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
	}


	setStyle('GP_READY','fill',getBoolTag('GP_READY') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setVisibility('GP_SKIP_R_DOWN_FIXED',getBoolTag('GP_SKIP_R_DOWN_FIXED'));
	setVisibility('GP_SKIP_L_DOWN_FIXED',getBoolTag('GP_SKIP_L_DOWN_FIXED'));
	setVisibility('GP_SKIP_R_DOWN_MOVING_1',getBoolTag('GP_SKIP_R_DOWN_MOVING'));
	setVisibility('GP_SKIP_R_DOWN_MOVING_2',getBoolTag('GP_SKIP_R_DOWN_MOVING'));
	setVisibility('GP_SKIP_L_DOWN_MOVING_1',getBoolTag('GP_SKIP_L_DOWN_MOVING'));
	setVisibility('GP_SKIP_L_DOWN_MOVING_2',getBoolTag('GP_SKIP_L_DOWN_MOVING'));
	setStyle('GP_AUTOMATIC','fill',getBoolTag('GP_AUTOMATIC') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setStyle('GP_REMOTE','fill',getBoolTag('GP_REMOTE') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setStyle('GP_LOCAL','fill',getBoolTag('GP_LOCAL') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setStyle('GP_SKIP_DEBLOCKED_1','fill',getBoolTag('GP_SKIP_DEBLOCKED') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setStyle('GP_SKIP_DEBLOCKED_2','fill',getBoolTag('GP_SKIP_DEBLOCKED') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setStyle('GP_SKIP_L_MOVING_EMPTY','fill',getBoolTag('GP_SKIP_L_MOVING_EMPTY') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setStyle('GP_SKIP_R_MOVING_EMPTY','fill',getBoolTag('GP_SKIP_R_MOVING_EMPTY') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setVisibility('GP_SKIP_L_CHECK_POINT',getBoolTag('GP_SKIP_L_CHECK_POINT'));
	setVisibility('GP_SKIP_R_CHECK_POINT',getBoolTag('GP_SKIP_R_CHECK_POINT'));
	setVisibility('GP_SKIP_L_LIMIT',getBoolTag('GP_SKIP_L_LIMIT'));
	setVisibility('GP_SKIP_R_LIMIT',getBoolTag('GP_SKIP_R_LIMIT'));
	setVisibility('GP_SKIP_L_ROPE',getBoolTag('GP_SKIP_L_ROPE'));
	setVisibility('GP_SKIP_R_ROPE',getBoolTag('GP_SKIP_R_ROPE'));

	setVisibility('GK_BK_BAN',getBoolTag('GK_BK_BAN'));
	setVisibility('GK_BK_CLOSED',getBoolTag('GK_BK_CLOSED'));
	setVisibility('GK_BK_OPENED',getBoolTag('GK_BK_OPENED'));
	setVisibility('GK_BK_MIDDLE', !(getBoolTag('GK_BK_CLOSED') || getBoolTag('GK_BK_OPENED')));
	setVisibility('GK_BK_OPENING',getBoolTag('GK_BK_OPENING'));
	setVisibility('GK_BK_CLOSING',getBoolTag('GK_BK_CLOSING'));
	setStyle('GK_BK_REQUESTED','fill',getBoolTag('GK_BK_REQUESTED') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');

	setVisibility('GK_NMK_BAN',getBoolTag('GK_MK_BAN'));
	setVisibility('GK_NMK_CLOSED',getBoolTag('GK_NMK_CLOSED'));
	setVisibility('GK_NMK_OPENED',getBoolTag('GK_NMK_OPENED'));
	setVisibility('GK_NMK_MIDDLE', !(getBoolTag('GK_NMK_CLOSED') || getBoolTag('GK_NMK_OPENED')));
	setVisibility('GK_NMK_OPENING',getBoolTag('GK_NMK_OPENING'));
	setVisibility('GK_NMK_CLOSING',getBoolTag('GK_NMK_CLOSING'));
	setStyle('GK_NMK_REQUESTED','fill',getBoolTag('GK_NMK_REQUESTED') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setVisibility('GK_NMK_LATCH_OPENED',getBoolTag('GK_NMK_LATCH_OPENED'));
	setVisibility('GK_NMK_LATCH_CLOSED',getBoolTag('GK_NMK_LATCH_CLOSED'));
	
	setVisibility('GK_VMK_BAN',getBoolTag('GK_MK_BAN'));
	setVisibility('GK_VMK_CLOSED',getBoolTag('GK_VMK_CLOSED'));
	setVisibility('GK_VMK_OPENED',getBoolTag('GK_VMK_OPENED'));
	setVisibility('GK_VMK_MIDDLE', !(getBoolTag('GK_VMK_CLOSED') || getBoolTag('GK_VMK_OPENED')));
	setVisibility('GK_VMK_OPENING',getBoolTag('GK_VMK_OPENING'));
	setVisibility('GK_VMK_CLOSING',getBoolTag('GK_VMK_CLOSING'));
	setStyle('GK_VMK_REQUESTED','fill',getBoolTag('GK_VMK_REQUESTED') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setVisibility('GK_VMK_LATCH_OPENED',getBoolTag('GK_VMK_LATCH_OPENED'));
	setVisibility('GK_VMK_LATCH_CLOSED',getBoolTag('GK_VMK_LATCH_CLOSED'));
	
	setStyle('GK_ATM_VNK_EQUALIZED','fill',getBoolTag('GK_ATM_VNK_EQUALIZED') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setStyle('GK_VMK_NMK_EQUALIZED','fill',getBoolTag('GK_VMK_NMK_EQUALIZED') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setStyle('GK_NMK_FUR_EQUALIZED','fill',getBoolTag('GK_NMK_FUR_EQUALIZED') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');

	setText('VR_ANGLE',getFltTag('VR_ANGLE').format(0,''));
	setRotation('VR_ARROW',(180.0+getFltTag('VR_ANGLE')).format(0,''),950,90);


	
	
	setText('SKIP_POSITION_VALUE_1',(getFltTag('SKIP_POSITION')/100).format(2,''));
	setText('SKIP_POSITION_VALUE_2',(getFltTag('SKIP_POSITION_2')/100).format(2,''));
	setText('SKIP_SPEED',getFltTag('SKIP_SPEED').format(2,''));
	setVisibility('SKIP_L_POSITION',!(getBoolTag('GP_SKIP_L_DOWN_FIXED') || getBoolTag('GP_SKIP_R_DOWN_FIXED')));
	setVisibility('SKIP_R_POSITION',!(getBoolTag('GP_SKIP_L_DOWN_FIXED') || getBoolTag('GP_SKIP_R_DOWN_FIXED')));
	setTranslation('SKIP_L_POSITION_GROUP',160+150*getFltTag('SKIP_POSITION')/100/78.6,60-766*getFltTag('SKIP_POSITION')/100/78.6);
	setTranslation('SKIP_R_POSITION_GROUP',160-150*(1-getFltTag('SKIP_POSITION')/100/78.6),60-766*(1-getFltTag('SKIP_POSITION')/100/78.6));

	setStyle('SKIP_ADDITIONAL_SINTER_REQUESTED','fill',getBoolTag('SKIP_ADDITIONAL_SINTER_REQUESTED') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setStyle('SKIP_ADDITIONAL_COKE_REQUESTED','fill',getBoolTag('SKIP_ADDITIONAL_COKE_REQUESTED') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');

	setStyle('VR_READY','fill',getBoolTag('VR_READY') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setStyle('VR_REMOTE','fill',getBoolTag('VR_REMOTE') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setStyle('VR_AUTOMATIC','fill',getBoolTag('VR_AUTOMATIC') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setVisibility('VR_FORWARD',getBoolTag('VR_FORWARD'));
	setVisibility('VR_BACKWARD',getBoolTag('VR_BACKWARD'));
	if ((VRState==true) && (getBoolTag('GK_VMK_OPENED')==true)) {
		VRState=false;
	} else if ((VRState==false) && (getBoolTag('VR_PROCESSED')==true)) {
		VRState=true;
	}
	setStyle('VR_PROCESSED','fill',VRState ? 'rgb(0,255,0)' : 'rgb(224,224,224)');

	for (i=1; i<=10; i++) {
		var tagName='PROBE'+i.format(0,'')+'_L';
		var tagNameRef='PROBE_REF'+i.format(0,'')+'_L';
		
		setStyle(tagName+'_BACK','fill', 	getBoolTag(tagNameRef) ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
		
		tagName='PROBE'+i.format(0,'')+'_R';
		tagNameRef='PROBE_REF'+i.format(0,'')+'_R';
		
		setStyle(tagName+'_BACK','fill', 	getBoolTag(tagNameRef) ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	}
	CHARGE_LEVEL_L_REF=0.0;
	CHARGE_LEVEL_R_REF=0.0;
	for (i=1; i<=10; i++) {
		var tagNameRef='PROBE_REF'+i.format(0,'')+'_L';
		if (getBoolTag(tagNameRef)) {
			CHARGE_LEVEL_L_REF=LEVEL_REFS[i];
		}
		tagNameRef='PROBE_REF'+i.format(0,'')+'_R';
		if (getBoolTag(tagNameRef)) {
			CHARGE_LEVEL_R_REF=LEVEL_REFS[i];
		}
	}
	var CHARGE_LEVEL_L=0.0;
	CHARGE_LEVEL_L=getBoolTag('LZ_L_PROBE_0') ? 0.0 : CHARGE_LEVEL_L;
	CHARGE_LEVEL_L=getBoolTag('LZ_L_PROBE_1') ? 0.5 : CHARGE_LEVEL_L;
	CHARGE_LEVEL_L=getBoolTag('LZ_L_PROBE_3') ? 0.75 : CHARGE_LEVEL_L;
	CHARGE_LEVEL_L=getBoolTag('LZ_L_PROBE_2') ? 1.0 : CHARGE_LEVEL_L;
	CHARGE_LEVEL_L=getBoolTag('LZ_L_PROBE_4') ? 1.25 : CHARGE_LEVEL_L;
	CHARGE_LEVEL_L=getBoolTag('LZ_L_PROBE_5') ? 1.5 : CHARGE_LEVEL_L;
	CHARGE_LEVEL_L=getBoolTag('LZ_L_PROBE_6') ? 1.75 : CHARGE_LEVEL_L;
	CHARGE_LEVEL_L=getBoolTag('LZ_L_PROBE_7') ? 2.0 : CHARGE_LEVEL_L;
	CHARGE_LEVEL_L=getBoolTag('LZ_L_PROBE_8') ? 2.5 : CHARGE_LEVEL_L;
	CHARGE_LEVEL_L=getBoolTag('LZ_L_PROBE_9') ? 3.0 : CHARGE_LEVEL_L;
	CHARGE_LEVEL_L=getBoolTag('LZ_L_PROBE_10') ? 4.0 : CHARGE_LEVEL_L;
	var CHARGE_LEVEL_R=0.0;
	CHARGE_LEVEL_R=getBoolTag('LZ_L_PROBE_0') ? 0.0 : CHARGE_LEVEL_R;
	CHARGE_LEVEL_R=getBoolTag('LZ_L_PROBE_1') ? 0.5 : CHARGE_LEVEL_R;
	CHARGE_LEVEL_R=getBoolTag('LZ_L_PROBE_3') ? 0.75 : CHARGE_LEVEL_R;
	CHARGE_LEVEL_R=getBoolTag('LZ_L_PROBE_2') ? 1.0 : CHARGE_LEVEL_R;
	CHARGE_LEVEL_R=getBoolTag('LZ_L_PROBE_4') ? 1.25 : CHARGE_LEVEL_R;
	CHARGE_LEVEL_R=getBoolTag('LZ_L_PROBE_5') ? 1.5 : CHARGE_LEVEL_R;
	CHARGE_LEVEL_R=getBoolTag('LZ_L_PROBE_6') ? 1.75 : CHARGE_LEVEL_R;
	CHARGE_LEVEL_R=getBoolTag('LZ_L_PROBE_7') ? 2.0 : CHARGE_LEVEL_R;
	CHARGE_LEVEL_R=getBoolTag('LZ_L_PROBE_8') ? 2.5 : CHARGE_LEVEL_R;
	CHARGE_LEVEL_R=getBoolTag('LZ_L_PROBE_9') ? 3.0 : CHARGE_LEVEL_R;
	CHARGE_LEVEL_R=getBoolTag('LZ_L_PROBE_10') ? 4.0 : CHARGE_LEVEL_R;

	setStyle('LZ_L_PROBE_OK','fill',CHARGE_LEVEL_L>=CHARGE_LEVEL_L_REF ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setStyle('LZ_R_PROBE_OK','fill',CHARGE_LEVEL_R>=CHARGE_LEVEL_R_REF ? 'rgb(0,255,0)' : 'rgb(224,224,224)');

	setText('CHARGE_LEVEL_L_REF',CHARGE_LEVEL_L_REF.format(2,''));
	setText('CHARGE_LEVEL_R_REF',CHARGE_LEVEL_R_REF.format(2,''));
	setText('CHARGE_LEVEL_L',getFltTag('CHARGE_LEVEL_L').format(2,''));
	setText('CHARGE_LEVEL_R',getFltTag('CHARGE_LEVEL_R').format(2,''));

	setStyle('LZ_L_READY','fill',getBoolTag('LZ_L_READY') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setStyle('LZ_L_AUTOMATIC','fill',getBoolTag('LZ_L_AUTOMATIC') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setStyle('LZ_L_MANUAL','fill',getBoolTag('LZ_L_MANUAL') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setStyle('LZ_L_PROBE_TOP','fill',getBoolTag('LZ_L_PROBE_TOP') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setStyle('LZ_L_PROBE_0','fill',getBoolTag('LZ_L_PROBE_0') ? (0.0 < CHARGE_LEVEL_L_REF ? 'rgb(255,255,0)' : 0.0 == CHARGE_LEVEL_L_REF ? 'rgb(0,255,0)' : 'rgb(255,0,0)') : 'rgb(224,224,224)');
	setStyle('LZ_L_PROBE_1','fill',getBoolTag('LZ_L_PROBE_1') ? (0.5 < CHARGE_LEVEL_L_REF ? 'rgb(255,255,0)' : 0.5 == CHARGE_LEVEL_L_REF ? 'rgb(0,255,0)' : 'rgb(255,0,0)') : 'rgb(224,224,224)');
	setStyle('LZ_L_PROBE_2','fill',getBoolTag('LZ_L_PROBE_3') ? (0.75 < CHARGE_LEVEL_L_REF ? 'rgb(255,255,0)' : 0.75 == CHARGE_LEVEL_L_REF ? 'rgb(0,255,0)' : 'rgb(255,0,0)') : 'rgb(224,224,224)');
	setStyle('LZ_L_PROBE_3','fill',getBoolTag('LZ_L_PROBE_2') ? (1.0 < CHARGE_LEVEL_L_REF ? 'rgb(255,255,0)' : 1.0 == CHARGE_LEVEL_L_REF ? 'rgb(0,255,0)' : 'rgb(255,0,0)') : 'rgb(224,224,224)');
	setStyle('LZ_L_PROBE_4','fill',getBoolTag('LZ_L_PROBE_4') ? (1.25 < CHARGE_LEVEL_L_REF ? 'rgb(255,255,0)' : 1.25 == CHARGE_LEVEL_L_REF ? 'rgb(0,255,0)' : 'rgb(255,0,0)') : 'rgb(224,224,224)');
	setStyle('LZ_L_PROBE_5','fill',getBoolTag('LZ_L_PROBE_5') ? (1.5 < CHARGE_LEVEL_L_REF ? 'rgb(255,255,0)' : 1.5 == CHARGE_LEVEL_L_REF ? 'rgb(0,255,0)' : 'rgb(255,0,0)') : 'rgb(224,224,224)');
	setStyle('LZ_L_PROBE_6','fill',getBoolTag('LZ_L_PROBE_6') ? (1.75 < CHARGE_LEVEL_L_REF ? 'rgb(255,255,0)' : 1.75 == CHARGE_LEVEL_L_REF ? 'rgb(0,255,0)' : 'rgb(255,0,0)') : 'rgb(224,224,224)');
	setStyle('LZ_L_PROBE_7','fill',getBoolTag('LZ_L_PROBE_7') ? (2.0 < CHARGE_LEVEL_L_REF ? 'rgb(255,255,0)' : 2.0 == CHARGE_LEVEL_L_REF ? 'rgb(0,255,0)' : 'rgb(255,0,0)') : 'rgb(224,224,224)');
	setStyle('LZ_L_PROBE_8','fill',getBoolTag('LZ_L_PROBE_8') ? (2.5 < CHARGE_LEVEL_L_REF ? 'rgb(255,255,0)' : 2.5 == CHARGE_LEVEL_L_REF ? 'rgb(0,255,0)' : 'rgb(255,0,0)') : 'rgb(224,224,224)');
	setStyle('LZ_L_PROBE_9','fill',getBoolTag('LZ_L_PROBE_9') ? (3.0 < CHARGE_LEVEL_L_REF ? 'rgb(255,255,0)' : 3.0 == CHARGE_LEVEL_L_REF ? 'rgb(0,255,0)' : 'rgb(255,0,0)') : 'rgb(224,224,224)');
	setStyle('LZ_L_PROBE_10','fill',getBoolTag('LZ_L_PROBE_10') ? (4.0 < CHARGE_LEVEL_L_REF ? 'rgb(255,255,0)' : 4.0 == CHARGE_LEVEL_L_REF ? 'rgb(0,255,0)' : 'rgb(255,0,0)') : 'rgb(224,224,224)');
	setVisibility('LZ_L_PROBE_BOTTOM_LIMIT', getBoolTag('LZ_L_PROBE_BOTTOM_LIMIT'));

	setStyle('LZ_R_READY','fill',getBoolTag('LZ_R_READY') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setStyle('LZ_R_AUTOMATIC','fill',getBoolTag('LZ_R_AUTOMATIC') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setStyle('LZ_R_MANUAL','fill',getBoolTag('LZ_R_MANUAL') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setStyle('LZ_R_PROBE_TOP','fill',getBoolTag('LZ_R_PROBE_TOP') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setStyle('LZ_R_PROBE_0','fill',getBoolTag('LZ_R_PROBE_0') ? (0.0 < CHARGE_LEVEL_R_REF ? 'rgb(255,255,0)' : 0.0 == CHARGE_LEVEL_R_REF ? 'rgb(0,255,0)' : 'rgb(255,0,0)') : 'rgb(224,224,224)');
	setStyle('LZ_R_PROBE_1','fill',getBoolTag('LZ_R_PROBE_1') ? (0.5 < CHARGE_LEVEL_R_REF ? 'rgb(255,255,0)' : 0.5 == CHARGE_LEVEL_R_REF ? 'rgb(0,255,0)' : 'rgb(255,0,0)') : 'rgb(224,224,224)');
	setStyle('LZ_R_PROBE_2','fill',getBoolTag('LZ_R_PROBE_3') ? (0.75 < CHARGE_LEVEL_R_REF ? 'rgb(255,255,0)' : 0.75 == CHARGE_LEVEL_R_REF ? 'rgb(0,255,0)' : 'rgb(255,0,0)') : 'rgb(224,224,224)');
	setStyle('LZ_R_PROBE_3','fill',getBoolTag('LZ_R_PROBE_2') ? (1.0 < CHARGE_LEVEL_R_REF ? 'rgb(255,255,0)' : 1.0 == CHARGE_LEVEL_R_REF ? 'rgb(0,255,0)' : 'rgb(255,0,0)') : 'rgb(224,224,224)');
	setStyle('LZ_R_PROBE_4','fill',getBoolTag('LZ_R_PROBE_4') ? (1.25 < CHARGE_LEVEL_R_REF ? 'rgb(255,255,0)' : 1.25 == CHARGE_LEVEL_R_REF ? 'rgb(0,255,0)' : 'rgb(255,0,0)') : 'rgb(224,224,224)');
	setStyle('LZ_R_PROBE_5','fill',getBoolTag('LZ_R_PROBE_5') ? (1.5 < CHARGE_LEVEL_R_REF ? 'rgb(255,255,0)' : 1.5 == CHARGE_LEVEL_R_REF ? 'rgb(0,255,0)' : 'rgb(255,0,0)') : 'rgb(224,224,224)');
	setStyle('LZ_R_PROBE_6','fill',getBoolTag('LZ_R_PROBE_6') ? (1.75 < CHARGE_LEVEL_R_REF ? 'rgb(255,255,0)' : 1.75 == CHARGE_LEVEL_R_REF ? 'rgb(0,255,0)' : 'rgb(255,0,0)') : 'rgb(224,224,224)');
	setStyle('LZ_R_PROBE_7','fill',getBoolTag('LZ_R_PROBE_7') ? (2.0 < CHARGE_LEVEL_R_REF ? 'rgb(255,255,0)' : 2.0 == CHARGE_LEVEL_R_REF ? 'rgb(0,255,0)' : 'rgb(255,0,0)') : 'rgb(224,224,224)');
	setStyle('LZ_R_PROBE_8','fill',getBoolTag('LZ_R_PROBE_8') ? (2.5 < CHARGE_LEVEL_R_REF ? 'rgb(255,255,0)' : 2.5 == CHARGE_LEVEL_R_REF ? 'rgb(0,255,0)' : 'rgb(255,0,0)') : 'rgb(224,224,224)');
	setStyle('LZ_R_PROBE_9','fill',getBoolTag('LZ_R_PROBE_9') ? (3.0 < CHARGE_LEVEL_R_REF ? 'rgb(255,255,0)' : 3.0 == CHARGE_LEVEL_R_REF ? 'rgb(0,255,0)' : 'rgb(255,0,0)') : 'rgb(224,224,224)');
	setStyle('LZ_R_PROBE_10','fill',getBoolTag('LZ_R_PROBE_10') ? (4.0 < CHARGE_LEVEL_R_REF ? 'rgb(255,255,0)' : 4.0 == CHARGE_LEVEL_R_REF ? 'rgb(0,255,0)' : 'rgb(255,0,0)') : 'rgb(224,224,224)');
	setVisibility('LZ_R_PROBE_BOTTOM_LIMIT', getBoolTag('LZ_R_PROBE_BOTTOM_LIMIT'));

	setStyle('LZ_OP_PROBE_BOTTOM','fill',getBoolTag('LZ_OP_PROBE_BOTTOM') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setStyle('LZ_OP_PROBE_NORMAL','fill',getBoolTag('LZ_OP_PROBE_NORMAL') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setStyle('LZ_OP_PROBE_TOP','fill',getBoolTag('LZ_OP_PROBE_TOP') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');

	setStyle('VK_1_READY','fill',getBoolTag('VK_1_READY') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setStyle('VK_1_AUTOMATIC','fill',getBoolTag('VK_1_AUTOMATIC') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setStyle('VK_1_REMOTE','fill',getBoolTag('VK_1_REMOTE') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setVisibility('VK_1_CLOSED', getBoolTag('VK_1_CLOSED'));
	setVisibility('VK_1_OPENED', getBoolTag('VK_1_OPENED'));
	setVisibility('VK_1_MIDDLE', !(getBoolTag('VK_1_CLOSED') || getBoolTag('VK_1_OPENED')));

	setStyle('VK_2_READY','fill',getBoolTag('VK_2_READY') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setStyle('VK_2_AUTOMATIC','fill',getBoolTag('VK_2_AUTOMATIC') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setStyle('VK_2_REMOTE','fill',getBoolTag('VK_2_REMOTE') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setVisibility('VK_2_CLOSED', getBoolTag('VK_2_CLOSED'));
	setVisibility('VK_2_OPENED', getBoolTag('VK_2_OPENED'));
	setVisibility('VK_2_MIDDLE', !(getBoolTag('VK_2_CLOSED') || getBoolTag('VK_2_OPENED')));

	setStyle('NK_1_READY','fill',getBoolTag('NK_1_READY') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setStyle('NK_1_AUTOMATIC','fill',getBoolTag('NK_1_AUTOMATIC') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setStyle('NK_1_REMOTE','fill',getBoolTag('NK_1_REMOTE') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setVisibility('NK_1_CLOSED', getBoolTag('NK_1_CLOSED'));
	setVisibility('NK_1_OPENED', getBoolTag('NK_1_OPENED'));
	setVisibility('NK_1_MIDDLE', !(getBoolTag('NK_1_CLOSED') || getBoolTag('NK_1_OPENED')));

	setStyle('NK_2_READY','fill',getBoolTag('NK_2_READY') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setStyle('NK_2_AUTOMATIC','fill',getBoolTag('NK_2_AUTOMATIC') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setStyle('NK_2_REMOTE','fill',getBoolTag('NK_2_REMOTE') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setVisibility('NK_2_CLOSED', getBoolTag('NK_2_CLOSED'));
	setVisibility('NK_2_OPENED', getBoolTag('NK_2_OPENED'));
	setVisibility('NK_2_MIDDLE', !(getBoolTag('NK_2_CLOSED') || getBoolTag('NK_2_OPENED')));

	setStyle('SK_VALVE_NITROGREN_READY','fill',getBoolTag('SK_VALVE_NITROGREN_READY') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setStyle('SK_VALVE_NITROGREN_LOCAL','fill',getBoolTag('SK_VALVE_NITROGREN_LOCAL') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setStyle('SK_VALVE_NITROGREN_REMOTE','fill',getBoolTag('SK_VALVE_NITROGREN_REMOTE') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setVisibility('SK_VALVE_NITROGREN_OPENED', getBoolTag('SK_VALVE_NITROGREN_OPENED'));
	setVisibility('SK_VALVE_NITROGREN_CLOSED', getBoolTag('SK_VALVE_NITROGREN_CLOSED'));
	setVisibility('SK_VALVE_NITROGREN_MIDDLE', !(getBoolTag('SK_VALVE_NITROGREN_CLOSED') || getBoolTag('SK_VALVE_NITROGREN_OPENED')));

	setStyle('SK_READY','fill',getBoolTag('SK_READY') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setStyle('SK_LOCAL','fill',getBoolTag('SK_LOCAL') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setStyle('SK_REMOTE','fill',getBoolTag('SK_REMOTE') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setStyle('SK_AUTOMATIC','fill',getBoolTag('SK_AUTOMATIC') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setVisibility('SK_OPENED', getBoolTag('SK_OPENED'));
	setVisibility('SK_CLOSED', getBoolTag('SK_CLOSED'));
	setVisibility('SK_MIDDLE', !(getBoolTag('SK_CLOSED') || getBoolTag('SK_OPENED')));

	setStyle('SK_NITROGEN_READY','fill',getBoolTag('SK_NITROGEN_LOCAL') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setStyle('SK_NITROGEN_LOCAL','fill',getBoolTag('SK_NITROGEN_LOCAL') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setStyle('SK_NITROGEN_REMOTE','fill',getBoolTag('SK_NITROGEN_REMOTE') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setStyle('SK_NITROGEN_AUTOMATIC','fill',getBoolTag('SK_NITROGEN_AUTOMATIC') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setVisibility('SK_NITROGEN_OPENED', getBoolTag('SK_NITROGEN_OPENED'));
	setVisibility('SK_NITROGEN_CLOSED', getBoolTag('SK_NITROGEN_CLOSED'));
	setVisibility('SK_NITROGEN_MIDDLE', !(getBoolTag('SK_NITROGEN_CLOSED') || getBoolTag('SK_NITROGEN_OPENED')));

	setStyle('NK_NITROGREN_1_READY','fill',getBoolTag('NK_NITROGREN_1_READY') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setStyle('NK_NITROGEN_1_LOCAL','fill',getBoolTag('NK_NITROGEN_1_LOCAL') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setStyle('NK_NITROGEN_1_REMOTE','fill',getBoolTag('NK_NITROGEN_1_REMOTE') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setStyle('NK_NITROGEN_1_AUTOMATIC','fill',getBoolTag('NK_NITROGEN_1_AUTOMATIC') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setVisibility('NK_NITROGEN_1_OPENED', getBoolTag('NK_NITROGEN_1_OPENED'));
	setVisibility('NK_NITROGEN_1_CLOSED', getBoolTag('NK_NITROGEN_1_CLOSED'));
	setVisibility('NK_NITROGEN_1_MIDDLE', !(getBoolTag('NK_NITROGEN_1_CLOSED') || getBoolTag('NK_NITROGEN_1_OPENED')));

	setStyle('NK_NITROGREN_2_READY','fill',getBoolTag('NK_NITROGREN_2_READY') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setStyle('NK_NITROGEN_2_LOCAL','fill',getBoolTag('NK_NITROGEN_2_LOCAL') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setStyle('NK_NITROGEN_2_REMOTE','fill',getBoolTag('NK_NITROGEN_2_REMOTE') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setStyle('NK_NITROGEN_2_AUTOMATIC','fill',getBoolTag('NK_NITROGEN_2_AUTOMATIC') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setVisibility('NK_NITROGEN_2_OPENED', getBoolTag('NK_NITROGEN_2_OPENED'));
	setVisibility('NK_NITROGEN_2_CLOSED', getBoolTag('NK_NITROGEN_2_CLOSED'));
	setVisibility('NK_NITROGEN_2_MIDDLE', !(getBoolTag('NK_NITROGEN_2_CLOSED') || getBoolTag('NK_NITROGEN_2_OPENED')));

	setStyle('SKIP_SKIPMODE1','fill',getBoolTag('SKIP_SKIPMODE1') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setStyle('SKIP_SKIPMODE2','fill',getBoolTag('SKIP_SKIPMODE2') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setStyle('SKIP_SKIPMODE3','fill',getBoolTag('SKIP_SKIPMODE3') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setStyle('SKIP_SKIPMODE4','fill',getBoolTag('SKIP_SKIPMODE4') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');

	setStyle('NK_MODE_WITH_NITROGEN','fill',getBoolTag('NK_MODE_WITH_NITROGEN') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setStyle('NK_MODE_WITHOUT_NITROGEN','fill',getBoolTag('NK_MODE_WITHOUT_NITROGEN') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');

	setStyle('NK_MODE_STEAM','fill',getBoolTag('NK_MODE_STEAM') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setStyle('NK_MODE_NITROGEN','fill',getBoolTag('NK_MODE_NITROGEN') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');

	setStyle('UK_MODE1','fill',getBoolTag('UK_MODE1') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setStyle('UK_MODE2','fill',getBoolTag('UK_MODE2') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');

	setText('ZDN_SINTER_L',getFltTag('ZDN_SINTER_L').format(0,''));
	setText('SINTER_L',getFltTag('SINTER_L').format(0,''));
	setText('ZDN_COKE_L',getFltTag('ZDN_COKE_L').format(0,''));
	setText('COKE_L',getFltTag('COKE_L').format(0,''));

	setText('ZDN_SINTER_R',getFltTag('ZDN_SINTER_R').format(0,''));
	setText('SINTER_R',getFltTag('SINTER_R').format(0,''));
	setText('ZDN_COKE_R',getFltTag('ZDN_COKE_R').format(0,''));
	setText('COKE_R',getFltTag('COKE_R').format(0,''));

	setVisibility('SINTER_L_LOCK_CLOSED', getBoolTag('SINTER_L_LOCK_CLOSED'));
	setVisibility('SINTER_L_LOCK_OPENED', getBoolTag('SINTER_L_LOCK_OPENED'));
	setVisibility('SINTER_L_LOCK_MIDDLE', !(getBoolTag('SINTER_L_LOCK_CLOSED') || getBoolTag('SINTER_L_LOCK_OPENED')));
	setVisibility('SINTER_L_LOCK_OPENING',getBoolTag('SINTER_L_LOCK_OPENING'));
	setVisibility('SINTER_L_LOCK_CLOSING',getBoolTag('SINTER_L_LOCK_CLOSING'));
	setStyle('SINTER_L_EMPTY','fill',getBoolTag('SINTER_L_EMPTY') ? 'rgb(0,255,255)' : 'rgb(224,224,224)');
	setStyle('SINTER_L_LIMIT','fill',getBoolTag('SINTER_L_LIMIT') ? 'rgb(255,255,0)' : 'rgb(224,224,224)');
	setStyle('SINTER_L_DOZE','fill',getBoolTag('SINTER_L_DOZE') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');

	setVisibility('COKE_L_LOCK_CLOSED', getBoolTag('COKE_L_LOCK_CLOSED'));
	setVisibility('COKE_L_LOCK_OPENED', getBoolTag('COKE_L_LOCK_OPENED'));
	setVisibility('COKE_L_LOCK_MIDDLE', !(getBoolTag('COKE_L_LOCK_CLOSED') || getBoolTag('COKE_L_LOCK_OPENED')));
	setVisibility('COKE_L_LOCK_OPENING',getBoolTag('COKE_L_LOCK_OPENING'));
	setVisibility('COKE_L_LOCK_CLOSING',getBoolTag('COKE_L_LOCK_CLOSING'));
	setStyle('COKE_L_EMPTY','fill',getBoolTag('COKE_L_EMPTY') ? 'rgb(0,255,255)' : 'rgb(224,224,224)');
	setStyle('COKE_L_LIMIT','fill',getBoolTag('COKE_L_LIMIT') ? 'rgb(255,255,0)' : 'rgb(224,224,224)');
	setStyle('COKE_L_DOZE','fill',getBoolTag('COKE_L_DOZE') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');

	setVisibility('COKE_R_LOCK_CLOSED', getBoolTag('COKE_R_LOCK_CLOSED'));
	setVisibility('COKE_R_LOCK_OPENED', getBoolTag('COKE_R_LOCK_OPENED'));
	setVisibility('COKE_R_LOCK_MIDDLE', !(getBoolTag('COKE_R_LOCK_CLOSED') || getBoolTag('COKE_R_LOCK_OPENED')));
	setVisibility('COKE_R_LOCK_OPENING',getBoolTag('COKE_R_LOCK_OPENING'));
	setVisibility('COKE_R_LOCK_CLOSING',getBoolTag('COKE_R_LOCK_CLOSING'));
	setStyle('COKE_R_EMPTY','fill',getBoolTag('COKE_R_EMPTY') ? 'rgb(0,255,255)' : 'rgb(224,224,224)');
	setStyle('COKE_R_LIMIT','fill',getBoolTag('COKE_R_LIMIT') ? 'rgb(255,255,0)' : 'rgb(224,224,224)');
	setStyle('COKE_R_DOZE','fill',getBoolTag('COKE_R_DOZE') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');

	setVisibility('SINTER_R_LOCK_CLOSED', getBoolTag('SINTER_R_LOCK_CLOSED'));
	setVisibility('SINTER_R_LOCK_OPENED', getBoolTag('SINTER_R_LOCK_OPENED'));
	setVisibility('SINTER_R_LOCK_MIDDLE', !(getBoolTag('SINTER_R_LOCK_CLOSED') || getBoolTag('SINTER_R_LOCK_OPENED')));
	setVisibility('SINTER_R_LOCK_OPENING',getBoolTag('SINTER_R_LOCK_OPENING'));
	setVisibility('SINTER_R_LOCK_CLOSING',getBoolTag('SINTER_R_LOCK_CLOSING'));
	setStyle('SINTER_R_EMPTY','fill',getBoolTag('SINTER_R_EMPTY') ? 'rgb(0,255,255)' : 'rgb(224,224,224)');
	setStyle('SINTER_R_LIMIT','fill',getBoolTag('SINTER_R_LIMIT') ? 'rgb(255,255,0)' : 'rgb(224,224,224)');
	setStyle('SINTER_R_DOZE','fill',getBoolTag('SINTER_R_DOZE') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');

	var ts=new Date();

	setVisibility('GP_ALARM',getBoolTag('ZD1_00') ? (ts.getSeconds() % 2)==0 : false);
	setVisibility('GP_LEFT_SIDE_ALARM_1',getBoolTag('ZD1_00') ? (ts.getSeconds() % 2)==0 : false);
	setVisibility('GP_LEFT_SIDE_ALARM_2',getBoolTag('ZD1_00') ? (ts.getSeconds() % 2)==0 : false);
	setVisibility('GP_RIGHT_SIDE_ALARM_1',getBoolTag('ZD1_00') ? (ts.getSeconds() % 2)==0 : false);
	setVisibility('GP_RIGHT_SIDE_ALARM_2',getBoolTag('ZD1_00') ? (ts.getSeconds() % 2)==0 : false);
	setVisibility('GK_ALARM',getBoolTag('ZD1_01') ? (ts.getSeconds() % 2)==0 : false);
	setVisibility('VR_ALARM',getBoolTag('ZD1_02') ? (ts.getSeconds() % 2)==0 : false);
	setVisibility('LZ_L_ALARM',false);
	setVisibility('LZ_R_ALARM',false);
	setVisibility('VK_1_ALARM',getBoolTag('ZD1_03') ? (ts.getSeconds() % 2)==0 : false);
	setVisibility('VK_2_ALARM',getBoolTag('ZD1_04') ? (ts.getSeconds() % 2)==0 : false);
	setVisibility('NK_1_ALARM',getBoolTag('ZD1_05') ? (ts.getSeconds() % 2)==0 : false);
	setVisibility('NK_2_ALARM',getBoolTag('ZD1_06') ? (ts.getSeconds() % 2)==0 : false);
	setVisibility('NK_NITROGREN_1_ALARM',getBoolTag('ZD1_08') ? (ts.getSeconds() % 2)==0 : false);
	setVisibility('NK_NITROGREN_2_ALARM',getBoolTag('ZD1_11') ? (ts.getSeconds() % 2)==0 : false);
	setVisibility('NK_NITROGREN_3_ALARM',getBoolTag('ZD1_09') ? (ts.getSeconds() % 2)==0 : false);
	setVisibility('NK_NITROGREN_4_ALARM',getBoolTag('ZD1_10') ? (ts.getSeconds() % 2)==0 : false);
	setVisibility('NK_NITROGREN_5_ALARM',getBoolTag('ZD1_07') ? (ts.getSeconds() % 2)==0 : false);

	if (getBoolTag('SKIP_EMPTY_PROCESSED')==true) {
		setStyle('L_SKIP_BACK','fill','rgb(224,224,224)');
		setStyle('R_SKIP_BACK','fill','rgb(224,224,224)');
	} else {
		if (getBoolTag('GP_SKIP_R_DOWN_MOVING')) {
			setStyle('L_SKIP_BACK','fill',getBoolTag('SKIP_COKE_PROCESSED') ? 'rgb(63,63,63)' : getBoolTag('SKIP_SINTER_PROCESSED') ? 'rgb(127,0,0)' : 'rgb(224,224,224)');
			setStyle('L_SKIP_TOP_BACK','fill',getBoolTag('SKIP_COKE_PROCESSED') ? 'rgb(63,63,63)' : getBoolTag('SKIP_SINTER_PROCESSED') ? 'rgb(127,0,0)' : 'rgb(224,224,224)');
			setStyle('R_SKIP_BACK','fill','rgb(224,224,224)');
			setStyle('R_SKIP_BOTTOM_BACK','fill','rgb(224,224,224)');
		}
		if (getBoolTag('GP_SKIP_L_DOWN_MOVING')) {
			setStyle('R_SKIP_BACK','fill',getBoolTag('SKIP_COKE_PROCESSED') ? 'rgb(63,63,63)' : getBoolTag('SKIP_SINTER_PROCESSED') ? 'rgb(127,0,0)' : 'rgb(224,224,224)');
			setStyle('R_SKIP_TOP_BACK','fill',getBoolTag('SKIP_COKE_PROCESSED') ? 'rgb(63,63,63)' : getBoolTag('SKIP_SINTER_PROCESSED') ? 'rgb(127,0,0)' : 'rgb(224,224,224)');
			setStyle('L_SKIP_BACK','fill','rgb(224,224,224)');
			setStyle('L_SKIP_BOTTOM_BACK','fill','rgb(224,224,224)');
		}
	}
	
	setStyle('COKE_L_PROCESSED','fill',getBoolTag('SKIP_COKE_PROCESSED') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setStyle('COKE_R_PROCESSED','fill',getBoolTag('SKIP_COKE_PROCESSED') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setStyle('SINTER_L_PROCESSED','fill',getBoolTag('SKIP_SINTER_PROCESSED') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setStyle('SINTER_R_PROCESSED','fill',getBoolTag('SKIP_SINTER_PROCESSED') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setStyle('RPB_L_PROCESSED','fill',getBoolTag('SKIP_RPB') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setStyle('RPB_R_PROCESSED','fill',getBoolTag('SKIP_RPB') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setStyle('SKIP_EMPTY_PROCESSED','fill',getBoolTag('SKIP_EMPTY_PROCESSED') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setVisibility('BK_PROCESSED',getBoolTag('BK_PROCESSED'));
	setStyle('SKIP_ADDITIONAL_PROCESSED','fill',getBoolTag('SKIP_ADDITIONAL_PROCESSED') ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	
	
	setStyle('OXYGEN_Q_MAX','fill',getBoolTag('OXYGEN_Q_MAX')  ? 'rgb(255,0,0)' : 'rgb(224,224,224)');
	setStyle('NITROGEN_NMK_P_MIN_2','fill',getBoolTag('NITROGEN_NMK_P_MIN_2')  ? 'rgb(224,224,224)' : 'rgb(255,0,0)');
	setStyle('NITROGEN_VNK_P_MIN_2','fill',getBoolTag('NITROGEN_VNK_P_MIN_2')  ? 'rgb(224,224,224)' : 'rgb(255,0,0)');
	setStyle('NITROGEN_BK_P_MIN_2','fill',getBoolTag('NITROGEN_BK_P_MIN_2')  ? 'rgb(224,224,224)' : 'rgb(255,0,0)');
	setStyle('STEAM_VMK_P_MIN_2','fill',getBoolTag('STEAM_VMK_P_MIN_2')  ? 'rgb(224,224,224)' : 'rgb(255,0,0)');
	setStyle('STEAM_NMK_P_MIN_2','fill',getBoolTag('STEAM_NMK_P_MIN_2')  ? 'rgb(224,224,224)' : 'rgb(255,0,0)');
	setStyle('STEAM_BK_P_MIN_2','fill',getBoolTag('STEAM_BK_P_MIN_2')  ? 'rgb(224,224,224)' : 'rgb(255,0,0)');
	setStyle('KIP_NMK_FUR_EQUALIZED','fill',getBoolTag('KIP_NMK_FUR_EQUALIZED')  ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setStyle('KIP_VMK_NMK_EQUALIZED','fill',getBoolTag('KIP_VMK_NMK_EQUALIZED')  ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setStyle('KIP_ATM_VNK_EQUALIZED','fill',getBoolTag('KIP_ATM_VNK_EQUALIZED')  ? 'rgb(0,255,0)' : 'rgb(224,224,224)');

	setText('PKG_PK',getFltTag('PKG_PK').format(2,''));
	setText('PKG_NMK',getFltTag('PKG_NMK').format(2,''));
	setText('PKG_VMK',getFltTag('PKG_VMK').format(2,''));
	setText('PKG_BK_DELTA',getFltTag('PD_BK').format(2,''));
	setText('PKG_NMK_DELTA',getFltTag('PD_NM_K').format(2,''));
	setText('PVZ',getFltTag('PVZ').format(2,''));
	setText('PAZ_ZAG',getFltTag('PAZ_ZAG').format(2,''));
	setText('FVZ_VKL',getFltTag('FVZ_VKL').format(0,''));
	setText('PVZ_PKL',getFltTag('PVZ_PKL').format(2,''));

	setText('VMK_POSITION',getFltTag('VMK_POSITION').format(1,''));
	setText('NMK_POSITION',getFltTag('NMK_POSITION').format(1,''));
	setText('BK_POSITION',getFltTag('BK_POSITION').format(1,''));

	
	setText('CHARGE',getFltTag('CHARGE').format(0,''));
	setText('CHARGE_CURRENT_HOUR',getFltTag('CHARGE_CURRENT_HOUR').format(0,''));
	setText('CHARGE_LAST_SHIFT',getFltTag('CHARGE_LAST_SHIFT').format(0,''));
	setText('CHARGE_LAST_HOUR',getFltTag('CHARGE_LAST_HOUR').format(0,''));
	setText('CHARGE_DAY',getFltTag('CHARGE_DAY').format(0,''));

	setText('VMK_SKIP_COUNT',getFltTag('VMK_SKIP_COUNT').format(0,''));
	setText('NMK_SKIP_COUNT',getFltTag('NMK_SKIP_COUNT').format(0,''));
	setText('BK_SKIP_COUNT',getFltTag('BK_SKIP_COUNT').format(0,''));
	setVisibility('VMK_SKIP_COUNT_BACK',getFltTag('VMK_SKIP_COUNT')>0);
	setVisibility('NMK_SKIP_COUNT_BACK',getFltTag('NMK_SKIP_COUNT')>0);
	setVisibility('BK_SKIP_COUNT_BACK',getFltTag('BK_SKIP_COUNT')>0);
		
	var strPrg='';
	for (i=1; i<=10; i++) {
		var currentSkip=getFltTag('VMK_SKIP_PRG_'+i.format(0,''));
		strPrg=strPrg+(currentSkip==1.0 ? 'К' : currentSkip==2.0 ? 'Р' : '');
	}	
	setText('VMK_SKIP_PRG',strPrg);
	strPrg='';
	for (i=1; i<=10; i++) {
		var currentSkip=getFltTag('NMK_SKIP_PRG_'+i.format(0,''));
		strPrg=strPrg+(currentSkip==1.0 ? 'К' : currentSkip==2.0 ? 'Р' : '');
	}	
	setText('NMK_SKIP_PRG',strPrg);
	strPrg='';
	for (i=1; i<=10; i++) {
		var currentSkip=getFltTag('BK_SKIP_PRG_'+i.format(0,''));
		strPrg=strPrg+(currentSkip==1.0 ? 'К' : currentSkip==2.0 ? 'Р' : '');
	}	
	setText('BK_SKIP_PRG',strPrg);


	setStyle('GK_SELECTED_1','fill',getBoolTag('GK_SELECTED_1')  ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	setStyle('GK_SELECTED_2','fill',getBoolTag('GK_SELECTED_2')  ? 'rgb(0,255,0)' : 'rgb(224,224,224)');
	// setText('TMASL_1',getFltTag('TMASL_1').format(1,''));
	// setText('TMASL_2',getFltTag('TMASL_2').format(1,''));

	animateAlarmStroke('SKIP_POSITION_VALUE_1_BACK','SKIP_POSITION');
	animateAlarmStroke('SKIP_POSITION_VALUE_2_BACK','SKIP_POSITION_2');
	animateAlarmBackStroke('SKIP_SPEED');
	animateAlarmBackStroke('SKIP_SPEED');
	animateAlarmBackStroke('CHARGE_LEVEL_L');
	animateAlarmBackStroke('CHARGE_LEVEL_R');
	animateAlarmBackStroke('PKG_PK');
	animateAlarmBackStroke('PKG_NMK');
	animateAlarmBackStroke('PKG_VMK');
	animateAlarmBackStroke('PVZ');
	animateAlarmBackStroke('PAZ_ZAG');
	animateAlarmBackStroke('FVZ_VKL');
	animateAlarmBackStroke('PVZ_PKL');
	animateAlarmBackStroke('VMK_POSITION');
	animateAlarmBackStroke('NMK_POSITION');
	animateAlarmBackStroke('BK_POSITION');
	
		
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
// Формат вызова: charge_refs_click()
// Назначение: Обработчик нажатия на кнопку открытия видеокадра задания программы подач и циклов.
// Параметры: -
//////////////////////////////////////////////////////////////////////////////////////////////
function charge_refs_click() {
	openFrame('charge_refs.svg');
}

//////////////////////////////////////////////////////////////////////////////////////////////
// Формат вызова: charge_modes_click()
// Назначение: Обработчик нажатия на кнопку открытия видеокадра задания режимов работы механизмов загрузки.
// Параметры: -
//////////////////////////////////////////////////////////////////////////////////////////////
function charge_modes_click() {
	openFrame('charge_modes.svg');
}

//////////////////////////////////////////////////////////////////////////////////////////////
// Формат вызова: gydro_click()
// Назначение: Обработчик нажатия на кнопку открытия видеокадра гидросистемы конусов.
// Параметры: -
//////////////////////////////////////////////////////////////////////////////////////////////
function gydro_click() {
	openFrame('gydro.svg');
}

//////////////////////////////////////////////////////////////////////////////////////////////
// Формат вызова: masl_click()
// Назначение: Обработчик нажатия на кнопку открытия видеокадра густых смазок.
// Параметры: -
//////////////////////////////////////////////////////////////////////////////////////////////
function masl_click() {
	openFrame('masl.svg');
}

//////////////////////////////////////////////////////////////////////////////////////////////
// Формат вызова: local_charge_click()
// Назначение: Обработчик нажатия на кнопку вызова дополнительных видеокадров по загрузке.
// Параметры: -
//////////////////////////////////////////////////////////////////////////////////////////////
function local_charge_click() {
	popupMenu(ChargeFramesMenu,frames_menu_click);
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
// Формат вызова: changeLeftLevelRef()
// Назначение: Изменение задание уровня засыпи слева.
// Параметры: -
//////////////////////////////////////////////////////////////////////////////////////////////
function changeLeftLevelRef() {
    var RefValue=getFltTag('LeftLevelRef');
    var answer=prompt('Введите задание уровня засыпи слева (от 0.5м до 4.0м)',RefValue.format(2,''));
    if (isNaN(answer)) {
        alert('Ввод не является числом');
    } else {
        if (!((answer>=0.5) && (answer<=4.0))) {
            alert('Введенное число находится вне допустимого диапазона');
        } else {
            setFltTag('LeftLevelRef',answer);
        }
    }
}

//////////////////////////////////////////////////////////////////////////////////////////////
// Формат вызова: changeRightLevelRef()
// Назначение: Изменение задание уровня засыпи справа.
// Параметры: -
//////////////////////////////////////////////////////////////////////////////////////////////
function changeRightLevelRef() {
    var RefValue=getFltTag('RightLevelRef');
    var answer=prompt('Введите задание уровня засыпи справа (от 0.5м до 4.0м)',RefValue.format(2,''));
    if (isNaN(answer)) {
        alert('Ввод не является числом');
    } else {
        if (!((answer>=0.5) && (answer<=4.0))) {
            alert('Введенное число находится вне допустимого диапазона');
        } else {
            setFltTag('RightLevelRef',answer);
        }
    }
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
		setTranslation('SKIP_SELECT_GROUP',(skip-1)*30,(programPos-1)*30);
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
				if (getBoolTag('P'+selectedSkipProgram+'_PROCESSED')==false) {
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
		setTranslation('PROGRAM_SELECT_GROUP',-2356+(cycle-1)*50,177);
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

function nmk_mode_nitrogen_click(mode) {
	if (mode==1) {
		setBoolTag('NK_MODE_WITH_NITROGEN',false);
		setBoolTag('NK_MODE_WITHOUT_NITROGEN',false);
		setBoolTag('NK_MODE_WITH_NITROGEN',true);
	} else if (mode==2) {
		setBoolTag('NK_MODE_WITH_NITROGEN',false);
		setBoolTag('NK_MODE_WITHOUT_NITROGEN',false);
		setBoolTag('NK_MODE_WITHOUT_NITROGEN',true);		
	}
}