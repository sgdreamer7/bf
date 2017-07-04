//////////////////////////////////////////////////////////////////////////////////////////////
// Автор: Владимир Щербина <vns.scherbina@gmail.com>
// copyright 2017
// Версия: 1.0.0
// Модуль reports.js реализует меню для вызова протоколов и рапортов.
//////////////////////////////////////////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////////////////////////////////////////
// Локальные переменные //
//////////////////////////
if (ReportsParams==undefined) {
	var ReportsParams={};
}

////////////////////////////////////////////////////////////////////////////////
// Инициализация
////////////////////////////////////////////////////////////////////////////////

	ReportsParams['ID1_1']={template:'messages',datasource:'alarm_messages',shift:1};
	ReportsParams['ID1_2']={template:'messages',datasource:'alarm_messages',shift:2};
	ReportsParams['ID1_3']={template:'messages',datasource:'alarm_messages',shift:3};
	ReportsParams['ID_CHARGE_1']={template:'messages',datasource:'alarm_messages2',shift:1};
	ReportsParams['ID_CHARGE_2']={template:'messages',datasource:'alarm_messages2',shift:2};
	ReportsParams['ID_CHARGE_3']={template:'messages',datasource:'alarm_messages2',shift:3};
	ReportsParams['ID2_1']={template:'messages2',datasource:'equipment_messages',shift:1};
	ReportsParams['ID2_2']={template:'messages2',datasource:'equipment_messages',shift:2};
	ReportsParams['ID2_3']={template:'messages2',datasource:'equipment_messages',shift:3};
	ReportsParams['ID3_1']={template:'messages2',datasource:'personel_messages',shift:1};
	ReportsParams['ID3_2']={template:'messages2',datasource:'personel_messages',shift:2};
	ReportsParams['ID3_3']={template:'messages2',datasource:'personel_messages',shift:3};
	ReportsParams['ID4_1']={template:'messages',datasource:'system_messages',shift:1};
	ReportsParams['ID4_2']={template:'messages',datasource:'system_messages',shift:2};
	ReportsParams['ID4_3']={template:'messages',datasource:'system_messages',shift:3};
	ReportsParams['ID_PROGS']={template:'progs',datasource:'progs'};
	ReportsParams['ID_CYCLES']={template:'cycles',datasource:'cycles'};
	ReportsParams['ID_DOWNLOADS_BY_SHIFT_1']={template:'downloads_by_shift',datasource:'downloads_by_shift',shift:1};
	ReportsParams['ID_DOWNLOADS_BY_SHIFT_2']={template:'downloads_by_shift',datasource:'downloads_by_shift',shift:2};
	ReportsParams['ID_DOWNLOADS_BY_SHIFT_3']={template:'downloads_by_shift',datasource:'downloads_by_shift',shift:3};
	ReportsParams['ID_DOWNLOADS_BY_DAY']={template:'downloads_by_day',datasource:'downloads_by_day'};
	ReportsParams['ID_COKE_BY_SHIFT_1']={template:'coke_by_shift',datasource:'coke_by_shift',shift:1};
	ReportsParams['ID_COKE_BY_SHIFT_2']={template:'coke_by_shift',datasource:'coke_by_shift',shift:2};
	ReportsParams['ID_COKE_BY_SHIFT_3']={template:'coke_by_shift',datasource:'coke_by_shift',shift:3};
	ReportsParams['ID_DOZING']={template:'dozing',datasource:'dozing'};
	ReportsParams['ID_CHARGE_PROGRAM_BY_SHIFT_1']={template:'charge_program_by_shift',datasource:'charge_program_by_shift',shift:1};
	ReportsParams['ID_CHARGE_PROGRAM_BY_SHIFT_2']={template:'charge_program_by_shift',datasource:'charge_program_by_shift',shift:2};
	ReportsParams['ID_CHARGE_PROGRAM_BY_SHIFT_3']={template:'charge_program_by_shift',datasource:'charge_program_by_shift',shift:3};
	ReportsParams['ID_MOMENTARY_VALUES']={template:'momentary_values',datasource:'momentary_values'};
	ReportsParams['ID_TER']={template:'fuel_energy',datasource:'fuel_energy'};
	ReportsParams['ID_DAILY_FUEL_ENERGY_1']={template:'average_daily_fuel_energy',datasource:'average_daily_fuel_energy',shift:1};
	ReportsParams['ID_DAILY_FUEL_ENERGY_2']={template:'average_daily_fuel_energy',datasource:'average_daily_fuel_energy',shift:2};
	ReportsParams['ID_DAILY_FUEL_ENERGY_3']={template:'average_daily_fuel_energy',datasource:'average_daily_fuel_energy',shift:3};
	ReportsParams['ID_DAILY_FUEL_ENERGY_4']={template:'average_daily_fuel_energy',datasource:'average_daily_fuel_energy',shift:4};
	ReportsParams['ID_MONTHLY_FUEL_ENERGY']={template:'average_monthly_fuel_energy',datasource:'average_monthly_fuel_energy'};
	ReportsParams['ID_JOURNAL_1']={template:'journal1',datasource:'journal1'};
	ReportsParams['ID_JOURNAL_2']={template:'journal2',datasource:'journal2'};
	ReportsParams['ID_JOURNAL_3']={template:'journal3',datasource:'journal3'};
	ReportsParams['ID_JOURNAL_4']={template:'journal4',datasource:'journal4'};
	ReportsParams['ID_JOURNAL_5']={template:'journal5',datasource:'journal5'};
	ReportsParams['ID_JOURNAL_6']={template:'journal6',datasource:'journal6'};
	ReportsParams['ID_JOURNAL_7']={template:'journal7',datasource:'journal7'};
	ReportsParams['ID_JOURNAL_8']={template:'journal8',datasource:'journal8'};
	ReportsParams['ID_JOURNAL_9_1']={template:'journal9',datasource:'journal9',shift:1};
	ReportsParams['ID_JOURNAL_9_2']={template:'journal9',datasource:'journal9',shift:2};
	ReportsParams['ID_JOURNAL_9_3']={template:'journal9',datasource:'journal9',shift:3};
	ReportsParams['ID_JOURNAL_9_4']={template:'journal9',datasource:'journal9',shift:4};
	ReportsParams['ID_JOURNAL_10']={template:'journal10',datasource:'journal10'};
	ReportsParams['ID_JOURNAL_11']={template:'journal11',datasource:'journal11'};
	ReportsParams['ID_JOURNAL_12']={template:'journal12',datasource:'journal12'};
	ReportsParams['ID_JOURNAL_13']={template:'journal13',datasource:'journal13'};
	ReportsMenu=[
		{
			text:'Печной журнал',
			id:'ID_JOURNAL',
			submenu:[
				{
					text:'Параметры хода печи',
					id:'ID_JOURNAL_1'
				},
				{
					text:'Параметры газодинамики',
					id:'ID_JOURNAL_13'
				},
				{
					text:'Температура верхней части печи',
					id:'ID_JOURNAL_2'
				},
				{
					text:'Выпуск чугуна',
					id:'ID_JOURNAL_3'
				},
				{
					text:'Выпуск шлака',
					id:'ID_JOURNAL_4'
				},
				{
					text:'Состав шихты',
					id:'ID_JOURNAL_5'
				},
				{
					text:'Химический состав сырья',
					id:'ID_JOURNAL_6'
				},
				{
					text:'Система загрузки',
					id:'ID_JOURNAL_7'
				},
				{
					text:'Режим работы ГСС',
					id:'ID_JOURNAL_8'
				},
				{
					text:'Режим работы воздухонагревателей',
					id:'ID_JOURNAL_9',
					submenu:[
						{text:'Воздухонагреватель №12',id:'ID_JOURNAL_9_1'},
						{text:'Воздухонагреватель №13',id:'ID_JOURNAL_9_2'},
						{text:'Воздухонагреватель №14',id:'ID_JOURNAL_9_3'},
						{text:'Воздухонагреватель №19',id:'ID_JOURNAL_9_4'}
					]
				},
				{
					text:'Работа воздушных фурм',
					id:'ID_JOURNAL_10'
				},
				{
					text:'Температура футеровки и гарнисажа шахты печи',
					id:'ID_JOURNAL_11'
				},
				{
					text:'Температура тела холодильных плит',
					id:'ID_JOURNAL_12'
				}
			]
		},
		{
			text:'Сменные протоколы',
			id:'ID_PROTOCOLS_BY_SHIFT',
			submenu:[
				{
					text:'Сменный протокол аварийных и предупредительных сообщений',
					id:'ID1',
					submenu:[
						{text:'Смена 1',id:'ID1_1'},
						{text:'Смена 2',id:'ID1_2'},
						{text:'Смена 3',id:'ID1_3'}
					]
				},
				{
					text:'Сменный протокол аварийных и предупредительных сообщений по загрузке',
					id:'ID_CHARGE',
					submenu:[
						{text:'Смена 1',id:'ID_CHARGE_1'},
						{text:'Смена 2',id:'ID_CHARGE_2'},
						{text:'Смена 3',id:'ID_CHARGE_3'}
					]
				},
				{
					text:'Сменный протокол загрузки',
					id:'ID_CHARGE_PROGRAM_BY_SHIFT',
					submenu:[
						{text:'Смена 1',id:'ID_CHARGE_PROGRAM_BY_SHIFT_1'},
						{text:'Смена 2',id:'ID_CHARGE_PROGRAM_BY_SHIFT_2'},
						{text:'Смена 3',id:'ID_CHARGE_PROGRAM_BY_SHIFT_3'}
					]
				},
				{text:'Мгновенные значения измеряемых технологических параметров работы печи на текущий момент',id:'ID_MOMENTARY_VALUES'},
				{
					text:'Сменный протокол действий технологического персонала',
					id:'ID3',
					submenu:[
						{text:'Смена 1',id:'ID3_1'},
						{text:'Смена 2',id:'ID3_2'},
						{text:'Смена 3',id:'ID3_3'}
					]
				}
			]
		},
		{
			text:'Суточные рапорта',
			id:'ID_PROTOCOLS_BY_DAY',
			submenu:[
				{
					text:'Выходная форма хозрасчетных данных для учета расхода топливно-энергетических ресурсов на ДП-4 и другие параметры выплавки чугуна',
					id:'ID_TER'
				},
				{
					text:'Среднесуточные показатели расхода сырья и ТЭР',
					id:'ID_DAILY_FUEL_ENERGY',
					submenu:[
						{text:'Неделя 1',id:'ID_DAILY_FUEL_ENERGY_1'},
						{text:'Неделя 2',id:'ID_DAILY_FUEL_ENERGY_2'},
						{text:'Неделя 3',id:'ID_DAILY_FUEL_ENERGY_3'},
						{text:'Неделя 4',id:'ID_DAILY_FUEL_ENERGY_4'}
					]
				},
				{
					text:'Средненедельные показатели расхода сырья и ТЭР',
					id:'ID_MONTHLY_FUEL_ENERGY'
				}
			]
		},
		{
			text:'Протоколы и рапорта по шихтоподаче',
			id:'ID_REPORTS',
			submenu:[
				{text:'Протокол подач',id:'ID_PROGS'},
				{text:'Протокол циклов',id:'ID_CYCLES'},
				{
					text:'Сменный рапорт загрузки печи',
					id:'ID_DOWNLOADS_BY_SHIFT',
					submenu:[
						{text:'Смена 1',id:'ID_DOWNLOADS_BY_SHIFT_1'},
						{text:'Смена 2',id:'ID_DOWNLOADS_BY_SHIFT_2'},
						{text:'Смена 3',id:'ID_DOWNLOADS_BY_SHIFT_3'}
					]
				},
				{text:'Суточный рапорт загрузки печи',id:'ID_DOWNLOADS_BY_DAY'},
				{
					text:'Сменный протокол дозирования кокса',
					id:'ID_COKE_BY_SHIFT',
					submenu:[
						{text:'Смена 1',id:'ID_COKE_BY_SHIFT_1'},
						{text:'Смена 2',id:'ID_COKE_BY_SHIFT_2'},
						{text:'Смена 3',id:'ID_COKE_BY_SHIFT_3'}
					]
				},
				{text:'Протокол дозирования',id:'ID_DOZING'}
			]
		},
		{
			text:'Служебные протоколы',
			id:'ID_PROTOCOLS_SYSTEM',
			submenu:[
				
				{
					text:'Сменный протокол работы оборудования',
					id:'ID2',
					submenu:[
						{text:'Смена 1',id:'ID2_1'},
						{text:'Смена 2',id:'ID2_2'},
						{text:'Смена 3',id:'ID2_3'}
					]
				},
				{
					text:'Сменный протокол системной регистрации работы рабочей станции',
					id:'ID4',
					submenu:[
						{text:'Смена 1',id:'ID4_1'},
						{text:'Смена 2',id:'ID4_2'},
						{text:'Смена 3',id:'ID4_3'}
					]
				}
	
			]
		}
	];

//////////////////////////////////////////////////////////////////////////////////////////////
// public функции //
////////////////////

//////////////////////////////////////////////////////////////////////////////////////////////
// Формат вызова: showReport(template,data,args)
// Назначение: Вызов видеокадра для рапорта.
// Параметры:
//             template - имя шаблона рапорта;
//             data - имя источника данных рапорта;
//             args - параметры источника данных рапорта.
//////////////////////////////////////////////////////////////////////////////////////////////
function showReport(template,data,args) {
	BrowserFrame.show(JSON.stringify({template:template,data:data,args:args}),ReportsMenu,ReportsParams);
}


//////////////////////////////////////////////////////////////////////////////////////////////
// Формат вызова: reports_menu_click(result)
// Назначение: Обработчик выбора пункта меню.
// Параметры:
//             result - параметры выбранного пункта меню.
//////////////////////////////////////////////////////////////////////////////////////////////
function reports_menu_click(result) {
	ID=result.key;
	Params=ReportsParams[ID];
	ts=new Date();
	if ((ID=='ID_PROGS') || (ID=='ID_CYCLES')) {
		// Протоколы и рапорта за период
		res=Packages.com.cmas.hmi.Main.selectDatetime(ts.getFullYear(),ts.getMonth()+1,ts.getDate(),0,0,0,'Выбор начала периода для рапорта');
		if (res!=null) {
			res2=Packages.com.cmas.hmi.Main.selectDatetime(ts.getFullYear(),ts.getMonth()+1,ts.getDate(),0,0,0,'Выбор окончания периода для рапорта');
			if (res2!=null) {
				Args={
					'report_date':{
						'year':res[0],
						'month':res[1],
						'day':res[2],
						'hour':res[3],
						'minute':res[4],
						'second':res[5]
					},
					'report_date2':{
						'year':res2[0],
						'month':res2[1],
						'day':res2[2],
						'hour':res2[3],
						'minute':res2[4],
						'second':res2[5]
					}
				};
				showReport(Params.template,Params.datasource,Args);
			}
		}
	} else if (
		(ID=='ID_DOWNLOADS_BY_DAY') || 
		(ID=='ID_DOZING') ||
		(ID=='ID_TER') ||
		(ID=='ID_MONTHLY_FUEL_ENERGY') ||
		(ID=='ID_JOURNAL_1') ||
		(ID=='ID_JOURNAL_2') ||
		(ID=='ID_JOURNAL_3') ||
		(ID=='ID_JOURNAL_4') ||
		(ID=='ID_JOURNAL_5') ||
		(ID=='ID_JOURNAL_6') ||
		(ID=='ID_JOURNAL_7') ||
		(ID=='ID_JOURNAL_8') ||
		(ID=='ID_JOURNAL_10') ||
		(ID=='ID_JOURNAL_11') ||
		(ID=='ID_JOURNAL_12') ||
		(ID=='ID_JOURNAL_13')
		) {
		// Протоколы и рапорта за сутки
		res=Packages.com.cmas.hmi.Main.selectDatetime(ts.getFullYear(),ts.getMonth()+1,ts.getDate(),0,0,0,'Выбор даты рапорта');
		if (res!=null) {
			Args={
				'report_date':{
					'year':res[0],
					'month':res[1],
					'day':res[2],
					'hour':res[3],
					'minute':res[4],
					'second':res[5]
				}
			};
			showReport(Params.template,Params.datasource,Args);
		}
	} else if (ID=='ID_MOMENTARY_VALUES') {
		Args={
			'report_date':{
				'year':res[0],
				'month':res[1],
				'day':res[2],
				'hour':res[3],
				'minute':res[4],
				'second':res[5]
			}
		};
		showReport(Params.template,Params.datasource,Args);
	} else {
		// Протоколы и рапорта за смену
		res=Packages.com.cmas.hmi.Main.selectDatetime(ts.getFullYear(),ts.getMonth()+1,ts.getDate(),0,0,0,'Выбор даты рапорта');
		if (res!=null) {
			Args={
				'report_date':{
					'year':res[0],
					'month':res[1],
					'day':res[2],
					'hour':res[3],
					'minute':res[4],
					'second':res[5]
				},
				'shift':(Params.shift).format(0,'')
			};
			showReport(Params.template,Params.datasource,Args);
		}
	}
}

function updateReports() {
	getURL(
		'/userscripts/reports.js',
		processReportsUpdate
	);
}

function processReportsUpdate(result) {
	print("processReportsUpdate starting...");
	if (result.success==true) {
		print("processReportsUpdate success.");
		if (lastReportsScript!='') {
			print("processReportsUpdate not empty.");
			if (result.content.toString()==lastReportsScript) {
			} else {
				print("processReportsUpdate evaluating...");
				window.evaluateScript(result.content.toString());
				print("processReportsUpdate evaluated.");
			}
		}
		print("processReportsUpdate storing.");
		lastReportsScript=result.content.toString();
	}
	print("processReportsUpdate finished.");
}