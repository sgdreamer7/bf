//////////////////////////////////////////////////////////////////////////////////////////////
// Автор: Владимир Щербина <vns.scherbina@gmail.com>
// copyright 2017
// Версия: 1.0.0
// Модуль trends.js реализует меню для вызова трендов.
//////////////////////////////////////////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////////////////////////////////////////
// Локальные переменные //
//////////////////////////
var trendsFirstRun=true;
if (TrendsParams==undefined) {
	var TrendsParams={};
}
if (TrendsMenu==undefined) {
	var TrendsMenu=[];
}
if (TrendsParamsString==undefined) {
	var TrendsParamsString={};
}
var CyclesSubMenu=[];
var CustomColors={};
var HostName=Packages.com.cmas.hmi.Main.localhostname.replace(new RegExp('-','g'),'_');
var LineType = 0;
var BarType = 1;
var DifferenceType = 2;
var StepType = 3;
var VLineType = 4;
var VZoneType = 5;
var SectionType = 6;
var HLineType = 7;
var HZoneType = 8;
var TrendlineType = 9;
var LeftValueMarkType = 10;
var RightValueMarkType = 11;
var SymbolType = 12;
var ProfileType = 13;
var OHLCVType = 14;
var DigitalType = 15;
var SolidLineStyle = 0;
var DottedLineStyle = 1;
var DashedLineStyle = 2;
var AxisLineStyle = 3;
var Axis2LineStyle = 4;
////////////////////////////////////////////////////////////////////////////////
// Инициализация
////////////////////////////////////////////////////////////////////////////////

getTrendsMenu();

function getTrendsMenu() {
	if (trendsFirstRun==true ) {
		CustomColors['dark blue']=0x005c94;
		CustomColors['blue']=0x0084c8;
		CustomColors['light blue']=0x19aeff;
		CustomColors['dark orange']=0xff6600;
		CustomColors['orange']=0xff9900;
		CustomColors['light orange']=0xffff3e;
		CustomColors['dark red']=0xb50000;
		CustomColors['red']=0xdc0000;
		CustomColors['light red']=0x3effff;
		CustomColors['dark green']=0x009100;
		CustomColors['green']=0x9ade00;
		CustomColors['light green']=0xccff42;
		CustomColors['dark brown']=0x804d00;
		CustomColors['brown']=0xd49725;
		CustomColors['light brown']=0xeccd84;
		CustomColors['dark purple']=0xba00ff;
		CustomColors['purple']=0xd76cff;
		CustomColors['light purple']=0xf1caff;
		CustomColors['dark gray']=0x2d2d2d;
		CustomColors['gray']=0x666666;
		CustomColors['light gray']=0x999999;
		CustomColors['dark metallic']=0x0e232e;
		CustomColors['metallic']=0x364e59;
		CustomColors['light metallic']=0x9eabb0;
		CustomColors['black']=0x000000;
		CustomColors['white']=0xffffff;

		TrendsParams['UPS_1_TRENDS']=trendsConfig(
			'Параметры источника бесперебойного питания ИБП.1',
			dbConfig(
				'ups1',
				[
					'UPS_1_upsBasicBatteryStatus',
					'UPS_1_upsBasicBatteryTimeOnBattery',
					'UPS_1_upsAdvBatteryRunTimeRemaining',
					'UPS_1_upsAdvBatteryReplaceIndicator', 
					'UPS_1_upsHighPrecBatteryCapacity', 
					'UPS_1_upsHighPrecBatteryTemperature', 
					'UPS_1_upsHighPrecBatteryActualVoltage', 
					'UPS_1_upsAdvInputLineFailCause',
					'UPS_1_upsHighPrecInputLineVoltage',
					'UPS_1_upsHighPrecInputMinLineVoltage',
					'UPS_1_upsBasicOutputStatus',
					'UPS_1_upsHighPrecOutputVoltage',
					'UPS_1_upsHighPrecOutputLoad',
					'UPS_1_upsHighPrecOutputCurrent'
				]
			),
			[
				indItem('Статус батарей','dark red',0),
				indItem('Время работы на батареях, сек.','dark green',1),
				indItem('Оставшееся время работы на батареях, сек.','dark blue',1),
				indItem('Признак потребности замены батарей','dark orange',0),
				indItem('Точный уровень заряда батарей, %','dark brown',2),
				indItem('Точная температура батарей, '+String.fromCharCode(176)+'С','dark purple',3),
				indItem('Точное реальное напряжение батарей, В','dark gray',6),
				indItem('Признак причины последнего переключения на батареи','dark metallic',0),
				indItem('Точное входное напряжение, В','dark red',4),
				indItem('Точное минимальное входное напряжение в течение последней минуты, В','dark green',4),
				indItem('Статус выхода','dark blue',0),
				indItem('Точное выходное напряжение, В','dark orange',4),
				indItem('Точная выходная нагрузка, %','dark brown',2),
				indItem('Точный выходной ток, А','dark purple',5)
			]
		);

		TrendsParams['UPS_2_TRENDS']=trendsConfig(
			'Параметры источника бесперебойного питания ИБП.2',
			dbConfig(
				'ups2',
				[
					'UPS_2_upsBasicBatteryStatus',
					'UPS_2_upsBasicBatteryTimeOnBattery',
					'UPS_2_upsAdvBatteryRunTimeRemaining',
					'UPS_2_upsAdvBatteryReplaceIndicator', 
					'UPS_2_upsHighPrecBatteryCapacity', 
					'UPS_2_upsHighPrecBatteryTemperature', 
					'UPS_2_upsHighPrecBatteryActualVoltage', 
					'UPS_2_upsAdvInputLineFailCause',
					'UPS_2_upsHighPrecInputLineVoltage',
					'UPS_2_upsHighPrecInputMinLineVoltage',
					'UPS_2_upsBasicOutputStatus',
					'UPS_2_upsHighPrecOutputVoltage',
					'UPS_2_upsHighPrecOutputLoad',
					'UPS_2_upsHighPrecOutputCurrent'
				]
			),
			[
				indItem('Статус батарей','dark red',0),
				indItem('Время работы на батареях, сек.','dark green',1),
				indItem('Оставшееся время работы на батареях, сек.','dark blue',1),
				indItem('Признак потребности замены батарей','dark orange',0),
				indItem('Точный уровень заряда батарей, %','dark brown',2),
				indItem('Точная температура батарей, '+String.fromCharCode(176)+'С','dark purple',3),
				indItem('Точное реальное напряжение батарей, В','dark gray',6),
				indItem('Признак причины последнего переключения на батареи','dark metallic',0),
				indItem('Точное входное напряжение, В','light red',4),
				indItem('Точное минимальное входное напряжение в течение последней минуты, В','light green',4),
				indItem('Статус выхода','light blue',0),
				indItem('Точное выходное напряжение, В','light orange',4),
				indItem('Точная выходная нагрузка, %','light brown',2),
				indItem('Точный выходной ток, А','light purple',5)
			]
		);

		TrendsParams['UPS_3_TRENDS']=trendsConfig(
			'Параметры источника бесперебойного питания ИБП.3',
			dbConfig(
				'ups3',
				[
					'UPS_3_upsBasicBatteryStatus',
					'UPS_3_upsBasicBatteryTimeOnBattery',
					'UPS_3_upsAdvBatteryRunTimeRemaining',
					'UPS_3_upsAdvBatteryReplaceIndicator', 
					'UPS_3_upsHighPrecBatteryCapacity', 
					'UPS_3_upsHighPrecBatteryTemperature', 
					'UPS_3_upsHighPrecBatteryActualVoltage', 
					'UPS_3_upsAdvInputLineFailCause',
					'UPS_3_upsHighPrecInputLineVoltage',
					'UPS_3_upsHighPrecInputMinLineVoltage',
					'UPS_3_upsBasicOutputStatus',
					'UPS_3_upsHighPrecOutputVoltage',
					'UPS_3_upsHighPrecOutputLoad',
					'UPS_3_upsHighPrecOutputCurrent'
				]
			),
			[
				indItem('Статус батарей','dark red',0),
				indItem('Время работы на батареях, сек.','dark green',1),
				indItem('Оставшееся время работы на батареях, сек.','dark blue',1),
				indItem('Признак потребности замены батарей','dark orange',0),
				indItem('Точный уровень заряда батарей, %','dark brown',2),
				indItem('Точная температура батарей, '+String.fromCharCode(176)+'С','dark purple',3),
				indItem('Точное реальное напряжение батарей, В','dark gray',6),
				indItem('Признак причины последнего переключения на батареи','dark metallic',0),
				indItem('Точное входное напряжение, В','light red',4),
				indItem('Точное минимальное входное напряжение в течение последней минуты, В','light green',4),
				indItem('Статус выхода','light blue',0),
				indItem('Точное выходное напряжение, В','light orange',4),
				indItem('Точная выходная нагрузка, %','light brown',2),
				indItem('Точный выходной ток, А','light purple',5)
			]
		);

		TrendsParams['UPS_4_TRENDS']=trendsConfig(
			'Параметры источника бесперебойного питания ИБП.4',
			dbConfig(
				'ups4',
				[
					'UPS_4_upsBasicBatteryStatus',
					'UPS_4_upsBasicBatteryTimeOnBattery',
					'UPS_4_upsAdvBatteryRunTimeRemaining',
					'UPS_4_upsAdvBatteryReplaceIndicator', 
					'UPS_4_upsHighPrecBatteryCapacity', 
					'UPS_4_upsHighPrecBatteryTemperature', 
					'UPS_4_upsHighPrecBatteryActualVoltage', 
					'UPS_4_upsAdvInputLineFailCause',
					'UPS_4_upsHighPrecInputLineVoltage',
					'UPS_4_upsHighPrecInputMinLineVoltage',
					'UPS_4_upsBasicOutputStatus',
					'UPS_4_upsHighPrecOutputVoltage',
					'UPS_4_upsHighPrecOutputLoad',
					'UPS_4_upsHighPrecOutputCurrent'
				]
			),
			[
				indItem('Статус батарей','dark red',0),
				indItem('Время работы на батареях, сек.','dark green',1),
				indItem('Оставшееся время работы на батареях, сек.','dark blue',1),
				indItem('Признак потребности замены батарей','dark orange',0),
				indItem('Точный уровень заряда батарей, %','dark brown',2),
				indItem('Точная температура батарей, '+String.fromCharCode(176)+'С','dark purple',3),
				indItem('Точное реальное напряжение батарей, В','dark gray',6),
				indItem('Признак причины последнего переключения на батареи','dark metallic',0),
				indItem('Точное входное напряжение, В','light red',4),
				indItem('Точное минимальное входное напряжение в течение последней минуты, В','light green',4),
				indItem('Статус выхода','light blue',0),
				indItem('Точное выходное напряжение, В','light orange',4),
				indItem('Точная выходная нагрузка, %','light brown',2),
				indItem('Точный выходной ток, А','light purple',5)
			]
		);

		TrendsParams['UPS_5_TRENDS']=trendsConfig(
			'Параметры источника бесперебойного питания ИБП.5.1',
			dbConfig(
				'ups5',
				[
					'UPS_5_upsBasicBatteryStatus',
					'UPS_5_upsBasicBatteryTimeOnBattery',
					'UPS_5_upsAdvBatteryRunTimeRemaining',
					'UPS_5_upsAdvBatteryReplaceIndicator', 
					'UPS_5_upsHighPrecBatteryCapacity', 
					'UPS_5_upsHighPrecBatteryTemperature', 
					'UPS_5_upsHighPrecBatteryActualVoltage', 
					'UPS_5_upsAdvInputLineFailCause',
					'UPS_5_upsHighPrecInputLineVoltage',
					'UPS_5_upsHighPrecInputMinLineVoltage',
					'UPS_5_upsBasicOutputStatus',
					'UPS_5_upsHighPrecOutputVoltage',
					'UPS_5_upsHighPrecOutputLoad',
					'UPS_5_upsHighPrecOutputCurrent'
				]
			),
			[
				indItem('Статус батарей','dark red',0),
				indItem('Время работы на батареях, сек.','dark green',1),
				indItem('Оставшееся время работы на батареях, сек.','dark blue',1),
				indItem('Признак потребности замены батарей','dark orange',0),
				indItem('Точный уровень заряда батарей, %','dark brown',2),
				indItem('Точная температура батарей, '+String.fromCharCode(176)+'С','dark purple',3),
				indItem('Точное реальное напряжение батарей, В','dark gray',6),
				indItem('Признак причины последнего переключения на батареи','dark metallic',0),
				indItem('Точное входное напряжение, В','light red',4),
				indItem('Точное минимальное входное напряжение в течение последней минуты, В','light green',4),
				indItem('Статус выхода','light blue',0),
				indItem('Точное выходное напряжение, В','light orange',4),
				indItem('Точная выходная нагрузка, %','light brown',2),
				indItem('Точный выходной ток, А','light purple',5)
			]
		);

		TrendsParams['UPS_6_TRENDS']=trendsConfig(
			'Параметры источника бесперебойного питания ИБП.5.2',
			dbConfig(
				'ups6',
				[
					'UPS_6_upsBasicBatteryStatus',
					'UPS_6_upsBasicBatteryTimeOnBattery',
					'UPS_6_upsAdvBatteryRunTimeRemaining',
					'UPS_6_upsAdvBatteryReplaceIndicator', 
					'UPS_6_upsHighPrecBatteryCapacity', 
					'UPS_6_upsHighPrecBatteryTemperature', 
					'UPS_6_upsHighPrecBatteryActualVoltage', 
					'UPS_6_upsAdvInputLineFailCause',
					'UPS_6_upsHighPrecInputLineVoltage',
					'UPS_6_upsHighPrecInputMinLineVoltage',
					'UPS_6_upsBasicOutputStatus',
					'UPS_6_upsHighPrecOutputVoltage',
					'UPS_6_upsHighPrecOutputLoad',
					'UPS_6_upsHighPrecOutputCurrent'
				]
			),
			[
				indItem('Статус батарей','dark red',0),
				indItem('Время работы на батареях, сек.','dark green',1),
				indItem('Оставшееся время работы на батареях, сек.','dark blue',1),
				indItem('Признак потребности замены батарей','dark orange',0),
				indItem('Точный уровень заряда батарей, %','dark brown',2),
				indItem('Точная температура батарей, '+String.fromCharCode(176)+'С','dark purple',3),
				indItem('Точное реальное напряжение батарей, В','dark gray',6),
				indItem('Признак причины последнего переключения на батареи','dark metallic',0),
				indItem('Точное входное напряжение, В','light red',4),
				indItem('Точное минимальное входное напряжение в течение последней минуты, В','light green',4),
				indItem('Статус выхода','light blue',0),
				indItem('Точное выходное напряжение, В','light orange',4),
				indItem('Точная выходная нагрузка, %','light brown',2),
				indItem('Точный выходной ток, А','light purple',5)
			]
		);

		TrendsParams['UPS_7_TRENDS']=trendsConfig(
			'Параметры источника бесперебойного питания ИБП.5.3',
			dbConfig(
				'ups7',
				[
					'UPS_7_upsBasicBatteryStatus',
					'UPS_7_upsBasicBatteryTimeOnBattery',
					'UPS_7_upsAdvBatteryRunTimeRemaining',
					'UPS_7_upsAdvBatteryReplaceIndicator', 
					'UPS_7_upsHighPrecBatteryCapacity', 
					'UPS_7_upsHighPrecBatteryTemperature', 
					'UPS_7_upsHighPrecBatteryActualVoltage', 
					'UPS_7_upsAdvInputLineFailCause',
					'UPS_7_upsHighPrecInputLineVoltage',
					'UPS_7_upsHighPrecInputMinLineVoltage',
					'UPS_7_upsBasicOutputStatus',
					'UPS_7_upsHighPrecOutputVoltage',
					'UPS_7_upsHighPrecOutputLoad',
					'UPS_7_upsHighPrecOutputCurrent'
				]
			),
			[
				indItem('Статус батарей','dark red',0),
				indItem('Время работы на батареях, сек.','dark green',1),
				indItem('Оставшееся время работы на батареях, сек.','dark blue',1),
				indItem('Признак потребности замены батарей','dark orange',0),
				indItem('Точный уровень заряда батарей, %','dark brown',2),
				indItem('Точная температура батарей, '+String.fromCharCode(176)+'С','dark purple',3),
				indItem('Точное реальное напряжение батарей, В','dark gray',6),
				indItem('Признак причины последнего переключения на батареи','dark metallic',0),
				indItem('Точное входное напряжение, В','light red',4),
				indItem('Точное минимальное входное напряжение в течение последней минуты, В','light green',4),
				indItem('Статус выхода','light blue',0),
				indItem('Точное выходное напряжение, В','light orange',4),
				indItem('Точная выходная нагрузка, %','light brown',2),
				indItem('Точный выходной ток, А','light purple',5)
			]
		);

		TrendsParams['Statistics']=trendsConfig(
			'Статистика работы узла',
			dbConfig(
				'node_stats',
				[
					'MEMORY_TOTAL',
					'MEMORY_PROCESSES',
					'MEMORY_PROCESSES_USED',
					'MEMORY_SYSTEM',
					'MEMORY_BINARY',
					'MEMORY_OS_FREE',
					'PROCESSES_TOTAL',
					'PORTS_TOTAL'
				]
			),
			[
				indItem('MEMORY_TOTAL','dark red',0),
				indItem('MEMORY_PROCESSES','dark green',0),
				indItem('MEMORY_PROCESSES_USED','dark blue',0),
				indItem('MEMORY_SYSTEM','dark orange',0),
				indItem('MEMORY_BINARY','dark brown',2),
				indItemWithBounds('MEMORY_OS_FREE','dark purple',0,0.0,4000000000.0),
				indItem('PROCESSES_TOTAL','dark gray',3),
				indItem('PORTS_TOTAL','dark metallic',4)
			]
		);

		TrendsParams['MemoryStatsTrends']=trendsConfig(
			'Статистика потребления памяти серверым приложением',
			dbConfig(
				'memory_stats',
				[
					'EPMD',
					'INET_GETHOST',
					'ERL',
					'MYSQLD',
					'JAVAWS',
					'JAVAWS2'
				]
			),
			[
				indItem('epmd.exe','dark red',0),
				indItem('inet_gethost.exe','dark orange',0),
				indItem('erl.exe','dark brown',0),
				indItem('mysqld.exe','dark purple',0),
				indItem('javaw.exe','dark gray',1),
				indItem('javaw.exe','light red',1)
			]
		);

		TrendsParams['JVMMemoryStats0']=trendsConfig(
			'Статистика памяти JVM клиента '+HostName+' для левого экрана',
			dbConfig(
				HostName+'_'+'jvm_memory_0',
				[
					HostName+'_'+'MEMORY_CLIENT_USED_0',
					HostName+'_'+'MEMORY_CLIENT_USED_1',
					HostName+'_'+'CLIENT_MEMORY_PERM_GEN_USED_0',
					HostName+'_'+'CLIENT_MEMORY_PERM_GEN_RESERVED_0',
					HostName+'_'+'CLIENT_MEMORY_OLD_GEN_USED_0',
					HostName+'_'+'CLIENT_MEMORY_OLD_GEN_RESERVED_0',
					HostName+'_'+'CLIENT_MEMORY_SURVIVOR_SPACE_USED_0',
					HostName+'_'+'CLIENT_MEMORY_SURVIVOR_SPACE_RESERVED_0',
					HostName+'_'+'CLIENT_MEMORY_EDEN_SPACE_USED_0',
					HostName+'_'+'CLIENT_MEMORY_EDEN_SPACE_RESERVED_0',
					HostName+'_'+'CLIENT_MEMORY_CODE_CACHE_USED_0',
					HostName+'_'+'CLIENT_MEMORY_CODE_CACHE_RESERVED_0'
				]
			),
			[
				indItem('CMS Perm Gen Used','dark red',0),
				indItem('CMS Perm Gen Reserved','dark green',0),
				indItem('CMS Old Gen Used','dark blue',1),
				indItem('CMS Old Gen Reserved','dark orange',1),
				indItem('Par Survivor Space Used','dark brown',0),
				indItem('Par Survivor Space Reserved','dark purple',0),
				indItem('Par Eden Space Used','dark gray',1),
				indItem('Par Eden Space Reserved','dark metallic',1),
				indItem('Code Cache Used','light red',0),
				indItem('Code Cache Reserved','light green',0),
				indItemWithBounds(HostName+'_'+'MEMORY_CLIENT_USED_0','light blue',1,0.0,Runtime.getRuntime().maxMemory()),
				indItemWithBounds(HostName+'_'+'MEMORY_CLIENT_USED_1','light orange',1,0.0,Runtime.getRuntime().maxMemory())
			]
		);	
		
		TrendsParams['JVMMemoryStats1']=trendsConfig(
			'Статистика памяти JVM клиента '+HostName+' для правого экрана',
			dbConfig(
				HostName+'_'+'jvm_memory_1',
				[
					HostName+'_'+'MEMORY_CLIENT_USED_0',
					HostName+'_'+'MEMORY_CLIENT_USED_1',
					HostName+'_'+'CLIENT_MEMORY_PERM_GEN_USED_1',
					HostName+'_'+'CLIENT_MEMORY_PERM_GEN_RESERVED_1',
					HostName+'_'+'CLIENT_MEMORY_OLD_GEN_USED_1',
					HostName+'_'+'CLIENT_MEMORY_OLD_GEN_RESERVED_1',
					HostName+'_'+'CLIENT_MEMORY_SURVIVOR_SPACE_USED_1',
					HostName+'_'+'CLIENT_MEMORY_SURVIVOR_SPACE_RESERVED_1',
					HostName+'_'+'CLIENT_MEMORY_EDEN_SPACE_USED_1',
					HostName+'_'+'CLIENT_MEMORY_EDEN_SPACE_RESERVED_1',
					HostName+'_'+'CLIENT_MEMORY_CODE_CACHE_USED_1',
					HostName+'_'+'CLIENT_MEMORY_CODE_CACHE_RESERVED_1'
				]
			),
			[
				indItem('CMS Perm Gen Used','dark red',0),
				indItem('CMS Perm Gen Reserved','dark green',0),
				indItem('CMS Old Gen Used','dark blue',1),
				indItem('CMS Old Gen Reserved','dark orange',1),
				indItem('Par Survivor Space Used','dark brown',0),
				indItem('Par Survivor Space Reserved','dark purple',0),
				indItem('Par Eden Space Used','dark gray',1),
				indItem('Par Eden Space Reserved','dark metallic',1),
				indItem('Code Cache Used','light red',0),
				indItem('Code Cache Reserved','light green',0),
				indItemWithBounds(HostName+'_'+'MEMORY_CLIENT_USED_0','light blue',1,0.0,Runtime.getRuntime().maxMemory()),
				indItemWithBounds(HostName+'_'+'MEMORY_CLIENT_USED_1','light orange',1,0.0,Runtime.getRuntime().maxMemory())
			]
		);

		TrendsParams['AZ_VZ_ZAG_TRENDS']=trendsConfig(
			'Азотоподавление',
			dbConfig(
				'az_vz_zag',
				[
					'PAZ_ZAG',
					'PVZ',
					'FAZ_ZAG'
				]
			),
			[
				indItemWithBounds('Давление азота, кгс/см кв.','dark green',1,0.0,10.0),
				indItemWithBounds('Давление воздуха, кгс/см кв.','dark blue',1,0.0,10.0),
				indItemWithBounds('Расход азота, м. куб./час','dark red',0,0.0,8500.0)
			]
		);

		TrendsParams['CHARGE_LEVEL_L_TRENDS']=trendsConfig(
			'Уровень засыпи шихты',
			dbConfig(
				'charge_level',
				[
					'CHARGE_LEVEL_R',
					'CHARGE_LEVEL_L'
				]
			),
			[
				indItemWithBoundsInverted('Правая сторона, м','dark blue',1,-5.5,4.0),
				indItemWithBoundsInverted('Левая сторона, м','dark red',0,0.0,9.5)
			]
		);

		TrendsParams['CHARGE_LEVEL_R_TRENDS']=trendsConfig(
			'Уровень засыпи шихты',
			dbConfig(
				'charge_level',
				[
					'CHARGE_LEVEL_R',
					'CHARGE_LEVEL_L'
				]
			),
			[
				indItemWithBoundsInverted('Правая сторона, м','dark blue',1,-5.5,4.0),
				indItemWithBoundsInverted('Левая сторона, м','dark red',0,0.0,9.5)
			]
		);

		TrendsParams['VZ_OS_TRENDS']=trendsConfig(
			'Параметры сжатого воздуха',
			dbConfig(
				'ter',
				[
					'TVZ_OS',
					'PVZ_OS',
					'FVZ_OS'
				]
			),
			[
				indItemWithBounds('Температура сжатого осушенного воздуха, град С.','dark red',0,-40.0,650.0),
				indItemWithBounds('Давление сжатого осушенного воздуха, кгс/см кв.','dark green',1,0.0,10.0),
				indItemWithBounds('Расход сжатого осушенного воздуха, м куб./час','dark blue',2,0.0,3200.0)
			]
		);

		TrendsParams['PKG_TRENDS']=trendsConfig(
			'Давление колошникового газа',
			dbConfig3(
				'pkg',
				[
					'PKG_O',
					'PKG_V',
					'PKG_N'
				],
				'gim',
				[
					'GKG'
				],
				'zdn',
				[
					'ZDN_PKG'
				]
			),
			[
				indItemWithBounds('Давление при остановке, кгс/м кв.','dark blue',2,-100.0,150.0),
				indItemWithBounds('Давление высокое, кгс/см кв.','dark red',0,0.0,2.5),
				indItemWithBounds('Давление низкое, кгс/см кв.','dark green',1,0.0,2500.0),
				indItemWithBounds('Положение ИМ на трубопроводе колошникового газа, %','red',3,0.0,100.0),
				indItemWithBoundsWithLinestyleDigital('Задание давления колошникового газа, кгс/см кв.','dark red',0,0.0,2.5,DashedLineStyle)
			]
		);

		TrendsParams['PKG_ZAG_TRENDS']=trendsConfig(
			'Давление в засыпном аппарате',
			dbConfig(
				'pkg_zag',
				[
					'PKG_NMK',
					'PKG_PK',
					'PKG_VMK'
				]
			),
			[
				indItemWithBounds('Давление в нижнем межконусном пространстве, кгс/см кв.','dark green',0,0.0,2.5),
				indItemWithBounds('Давление в подконусном пространстве, кгс/см кв.','dark blue',0,0.0,2.5),
				indItemWithBounds('Давление в верхнем межконусном пространстве, кгс/см кв.','dark red',0,0.0,2.5)
			]
		);



		TrendsParams['VR_ANGLE_TRENDS']=trendsConfig(
			'Регистрация работы ВРШ',
			dbConfig(
				'vr_angle',
				[
					'VR_ANGLE'
				]
			),
			[
				indItemWithBounds('Угол поворота, град.','dark red',0,0.0,360.0)
			]
		);

		TrendsParams['SKIP_TRENDS']=trendsConfig(
			'Скорость и положение скипов',
			JSON.stringify(
				{
					'tables':[
						{
							'table':'skip_position',
							'fields':[
								'SKIP_POSITION'
							],
							'indexfield':'INDX',
							'scale':0.01,
							'shift':0.0
						},
						{
							'table':'skip_position_2',
							'fields':[
								'SKIP_POSITION_2'
							],
							'indexfield':'INDX',
							'scale':0.01,
							'shift':0.0
						},
						{
							'table':'skip_speed',
							'fields':[
								'SKIP_SPEED'
							],
							'indexfield':'INDX',
							'scale':1.0,
							'shift':0.0
						}
					]
				}
			),
			[
				indItemWithBounds('Положение скипов, датчик 1, м','dark green',1,0.0,80.0),
				indItemWithBounds('Положение скипов, датчик 2, м','dark blue',1,0.0,80.0),
				indItemWithBounds('Скорость движения скипов, см/с','dark red',0,0.0,400.0)
			]
		);

		TrendsParams['K_POSITION_TRENDS']=trendsConfig(
			'Регистрация работы конусов',
			dbConfig(
				'k_position',
				[
					'VMK_POSITION',
					'NMK_POSITION',
					'BK_POSITION'
				]
			),
			[
				indItemWithBounds('Ход верхнего малого конуса, мм','dark red',0,0.0,900.0),
				indItemWithBounds('Ход нижнего малого конуса, мм','dark green',0,0.0,900.0),
				indItemWithBounds('Ход большого конуса, мм','dark blue',0,0.0,900.0)
			]
		);

		TrendsParams['CHARGE_LEVEL_SPEED_L_TRENDS']=trendsConfig(
			'Скорость схода шихты',
			dbConfig(
				'charge_level_speed',
				[
					'CHARGE_LEVEL_SPEED_L',
					'CHARGE_LEVEL_SPEED_R'
				]
			),
			[
				indItemWithBounds('Левая сторона, см/мин','dark red',0,-60.0,60.0),
				indItemWithBounds('Правая сторона, см/мин','dark blue',1,0.0,120.0)
			]
		);

		TrendsParams['CHARGE_LEVEL_SPEED_R_TRENDS']=trendsConfig(
			'Скорость схода шихты',
			dbConfig(
				'charge_level_speed',
				[
					'CHARGE_LEVEL_SPEED_L',
					'CHARGE_LEVEL_SPEED_R'
				]
			),
			[
				indItemWithBounds('Левая сторона, см/мин','dark red',0,0.0,60.0),
				indItemWithBounds('Правая сторона, см/мин','dark blue',0,0.0,60.0)
			]
		);

		TrendsParams['MASL_1_TRENDS']=trendsConfig(
			'Параметры масла гидросистемы 1',
			dbConfig(
				'masl',
				[
					'OIL_LEVEL_1',
					'LMASL_1',
					'PMASL_VMK',
					'PMASL_NMK',
					'TMASL_1',
					'PMASL_BK'
				]
			),
			[
				indItemWithBounds('Уровень масла в маслобаке гидросистемы 1 от датчика 282Б-1','purple',2,-250.0,150.0),
				indItemWithBounds('Уровень масла в маслобаке гидросистемы 1','dark purple',2,-250.0,150.0),
				indItemWithBounds('Давление масла к цилиндру ВМК, кгс/см кв.','dark red',0,0.0,250.0),
				indItemWithBounds('Давление масла к цилиндру НМК, кгс/см кв.','dark green',0,0.0,250.0),
				indItemWithBounds('Температура масла в маслобаке гидросистемы 1, '+String.fromCharCode(176)+'С','dark orange',1,0.0,200.0),
				indItemWithBounds('Давление масла к цилиндру БК, кгс/см кв.','dark blue',0,0.0,250.0)
			]
		);

		TrendsParams['MASL_2_TRENDS']=trendsConfig(
			'Параметры масла гидросистемы 2',
			dbConfig(
				'masl',
				[
					'OIL_LEVEL_2',
					'LMASL_2',
					'PMASL_VMK',
					'PMASL_NMK',
					'TMASL_2',
					'PMASL_BK'
				]
			),
			[
				indItemWithBounds('Уровень масла в маслобаке гидросистемы 2 от датчика 282Б-2','gray',2,-250.0,150.0),
				indItemWithBounds('Уровень масла в маслобаке гидросистемы 2','dark gray',2,-250.0,150.0),
				indItemWithBounds('Давление масла к цилиндру ВМК, кгс/см кв.','dark red',0,0.0,250.0),
				indItemWithBounds('Давление масла к цилиндру НМК, кгс/см кв.','dark green',0,0.0,250.0),
				indItemWithBounds('Температура масла в маслобаке гидросистемы 2, '+String.fromCharCode(176)+'С','dark brown',1,0.0,200.0),
				indItemWithBounds('Давление масла к цилиндру БК, кгс/см кв.','dark blue',0,0.0,250.0)
			]
		);


		TrendsParams['VN_1_TRENDS']=trendsConfig(
			'Параметры работы воздухонагревателя №12',
			dbConfig3(
				'gim',
				[
					'GNA_VN_1'
				],
				'zdn',
				[
					'ZDN_TPP_VN_1'
				],
				'vn_1',
				[
					'TPP_VN_1',
					'FSG_VN_1',
					'TD_VN_1'
				]
			),
			[
				indItemWithBounds('Положение ИМ направляющего аппарата воздухонагревателя, %','red',3,0.0,100.0),
				indItemWithBoundsWithLinestyleDigital('Задание температуры купола, '+String.fromCharCode(176)+'С','dark red',0,0.0,1500.0,DashedLineStyle),
				indItemWithBounds('Температура купола, '+String.fromCharCode(176)+'С','dark red',0,0.0,1500.0),
				indItemWithBounds('Расход смешанного газа, м куб./час','dark brown',2,0.0,75000.0),
				indItemWithBounds('Температура дыма, '+String.fromCharCode(176)+'С','dark blue',0,0.0,1500.0)
			]
		);


		TrendsParams['VN_2_TRENDS']=trendsConfig(
			'Параметры работы воздухонагревателя №13',
			dbConfig3(
				'gim',
				[
					'GNA_VN_2'
				],
				'zdn',
				[
					'ZDN_TPP_VN_2'
				],
				'vn_2',
				[
					'TPP_VN_2',
					'FSG_VN_2',
					'TD_VN_2'
				]
			),
			[
				indItemWithBounds('Положение ИМ направляющего аппарата воздухонагревателя, %','red',3,0.0,100.0),
				indItemWithBoundsWithLinestyleDigital('Задание температуры купола, '+String.fromCharCode(176)+'С','dark red',0,0.0,1500.0,DashedLineStyle),
				indItemWithBounds('Температура купола, '+String.fromCharCode(176)+'С','dark red',0,0.0,1500.0),
				indItemWithBounds('Расход смешанного газа, м куб./час','dark brown',2,0.0,75000.0),
				indItemWithBounds('Температура дыма, '+String.fromCharCode(176)+'С','dark blue',0,0.0,1500.0)
			]
		);

		TrendsParams['VN_3_TRENDS']=trendsConfig(
			'Параметры работы воздухонагревателя №14',
			dbConfig3(
				'gim',
				[
					'GNA_VN_3'
				],
				'zdn',
				[
					'ZDN_TPP_VN_3'
				],
				'vn_3',
				[
					'TPP_VN_3',
					'FSG_VN_3',
					'TD_VN_3'
				]
			),
			[
				indItemWithBounds('Положение ИМ направляющего аппарата воздухонагревателя, %','red',3,0.0,100.0),
				indItemWithBoundsWithLinestyleDigital('Задание температуры купола, '+String.fromCharCode(176)+'С','dark red',0,0.0,1500.0,DashedLineStyle),
				indItemWithBounds('Температура купола, '+String.fromCharCode(176)+'С','dark red',0,0.0,1500.0),
				indItemWithBounds('Расход смешанного газа, м куб./час','dark brown',2,0.0,75000.0),
				indItemWithBounds('Температура дыма, '+String.fromCharCode(176)+'С','dark blue',0,0.0,1500.0)
			]
		);

		TrendsParams['VN_4_TRENDS']=trendsConfig(
			'Параметры работы воздухонагревателя №19',
			dbConfig3(
				'gim',
				[
					'GNA_VN_4'
				],
				'zdn',
				[
					'ZDN_TPP_VN_4'
				],
				'vn_4',
				[
					'TPP_VN_4',
					'FSG_VN_4',
					'TD_VN_4'
				]
			),
			[
				indItemWithBounds('Положение ИМ направляющего аппарата воздухонагревателя, %','red',3,0.0,100.0),
				indItemWithBoundsWithLinestyleDigital('Задание температуры купола, '+String.fromCharCode(176)+'С','dark red',0,0.0,1500.0,DashedLineStyle),
				indItemWithBounds('Температура купола, '+String.fromCharCode(176)+'С','dark red',0,0.0,1500.0),
				indItemWithBounds('Расход смешанного газа, м куб./час','dark brown',2,0.0,75000.0),
				indItemWithBounds('Температура дыма, '+String.fromCharCode(176)+'С','dark blue',0,0.0,1500.0)
			]
		);

		TrendsParams['GSS_TRENDS']=trendsConfig(
			'Параметры работы ГСС',
			dbConfig3(
				'gss',
				[
					'FDG_GSS',
					'PDG_GSS',
					'TDG_GSS',
					'FPG_GSS',
					'PPG_GSS',
					'TPG_GSS',
					'PSG'
				],
				'gim',
				[
					'GDG_GSS',
					'GPG_GSS'
				],
				'zdn',
				[
					'ZDN_PSG',
					'ZDN_FPG_GSS',
					'ZDN_PG_DG'
				]
			),
			[
				indItemWithBounds('Расход доменного газа, м куб./час','dark red',0,0.0,125000.0),
				indItemWithBounds('Давление доменного газа, кгс/см кв.','dark green',1,0.0,1.6),
				indItemWithBounds('Температура доменного газа, '+String.fromCharCode(176)+'С','dark blue',2,-25.0,100.0),
				indItemWithBounds('Расход природного газа, м куб./час','dark orange',6,0.0,1000.0),
				indItemWithBounds('Давление природного газа, кгс/см кв.','dark brown',1,0.0,1.6),
				indItemWithBounds('Температура природного газа, '+String.fromCharCode(176)+'С','dark purple',2,-25.0,100.0),
				indItemWithBounds('Давление смешанного газа, кгс/м кв.','dark gray',3,0.0,1600.0),
				indItemWithBounds('Положение ИМ на трубопроводе доменного газа, %','red',4,0.0,100.0),
				indItemWithBounds('Положение ИМ на трубопроводе природного газа, %','green',4,0.0,100.0),
				indItemWithBoundsWithLinestyleDigital('Задание давления смешанного газа, кгс/м кв.','dark gray',3,0.0,1600.0,DashedLineStyle),
				indItemWithBoundsWithLinestyleDigital('Задание расхода природного газа, м куб./час','dark orange',6,0.0,1000.0,DashedLineStyle),
				indItemWithBoundsWithLinestyleDigital('Задание соотношения расходов природного газа и доменного газа','metallic',5,0.0,1.0,DashedLineStyle)
			]
		);

		TrendsParams['SIOVN_PR_TRENDS']=trendsConfig(
			'СИО воздухонагревателей. Параметры пара.',
			dbConfig3(
				'siovn',
				[
					'FPR_SIO_VN',
					'PPR_SIO_VN',
					'TPR_SIO_VN',
					'LVD_1_VN'
				],
				'gim',
				[
					'GVDPIT_VN'
				],
				'zdn',
				[
					'ZDN_LVD_VN'
				]
			),
			[
				indItemWithBounds('Расход, т/час','dark red',0,0.0,4.0),
				indItemWithBounds('Давление, кгс/см кв.','dark green',1,0.0,1.6),
				indItemWithBounds('Температура, '+String.fromCharCode(176)+'С','dark blue',2,0.0,200.0),
				indItemWithBounds('Уровень, мм','dark orange',3,-315.0,315.0),
				indItemWithBounds('Положение ИМ на трубопроводе питающей воды, %','red',4,0.0,100.0),
				indItemWithBoundsWithLinestyleDigital('Задание уровня, мм','dark orange',3,-315.0,315.0,DashedLineStyle)
			]
		);

		TrendsParams['SIOVN_VD_TRENDS']=trendsConfig(
			'СИО воздухонагревателей. Параметры питательной воды.',
			dbConfig(
				'siovn',
				[
					'PVD_1',
					'PVD_1',
					'FVD_PIT_1',
					'FVD_PIT_2'
				]
			),
			[
				indItemWithBounds('Давление, I подвод, кгс/см кв.','dark red',0,0.0,10.0),
				indItemWithBounds('Давление, I подвод, кгс/см кв.','dark green',0,0.0,10.0),
				indItemWithBounds('Расход, I подвод, м куб./час','dark blue',1,0.0,12.0),
				indItemWithBounds('Расход, II подвод, м куб./час','dark orange',1,0.0,12.0)
			]
		);

		TrendsParams['GD_HD_TRENDS']=trendsConfig(
			'Параметры дутья',
			dbConfig3(
				'gd_hd',
				[
					'TGD',
					'THD',
					'PGD',
					'PHD',
					'FHD',
					'QO2HD',
					'MHD'
				],
				'gim',
				[
					'GGD',
					'GMHD'
				],
				'zdn',
				[
					'ZDN_TGD',
					'ZDN_MHD'
				]
			),
			[
				indItemWithBounds('Температура горячего дутья, '+String.fromCharCode(176)+'С','dark red',0,600.0,1350.0),
				indItemWithBounds('Температура холодного дутья, '+String.fromCharCode(176)+'С','dark green',1,0.0,250.0),
				indItemWithBounds('Давление горячего дутья, кгс/см кв.','dark blue',2,0.0,5.0),
				indItemWithBounds('Давление холодного дутья, кгс/см кв.','dark orange',2,0.0,5.0),
				indItemWithBounds('Расход холодного дутья, м куб./мин','dark brown',3,0.0,3000.0),
				indItemWithBounds('Содержание кислорода в холодном дутье, %','dark purple',4,0.0,100.0),
				indItemWithBounds('Влажность холодного дутья г/м куб.','dark gray',5,0.0,50.0),
				indItemWithBounds('Положение ИМ на смесительном трубопроводе горячего дутья, %','red',6,0.0,100.0),
				indItemWithBounds('Положение ИМ на трубопроводе пара на увлажнение дутья, %','green',6,0.0,100.0),
				indItemWithBoundsWithLinestyleDigital('Задание температуры горячего дутья, '+String.fromCharCode(176)+'С','dark red',0,600.0,1350.0,DashedLineStyle),
				indItemWithBoundsWithLinestyleDigital('Задание влажности холодного дутья г/м куб.','dark gray',5,0.0,50.0,DashedLineStyle)
			]
		);
		
		TrendsParams['PG_HD_TRENDS']=trendsConfig(
			'Параметры природного газа на печь',
			dbConfig3(
				'pg_hd',
				[
					'TPG_HD',
					'PPG_HD',
					'FPG_HD'
				],
				'gim',
				[
					'GPG_HD'
				],
				'zdn',
				[
					'ZDN_FPG_HD'
				]
			),
			[
				indItemWithBounds('Температура природного газа на печь, '+String.fromCharCode(176)+'С','dark red',0,-25.0,100.0),
				indItemWithBounds('Давление природного газа на печь, кгс/см кв.','dark green',1,0.0,10.0),
				indItemWithBounds('Расход природного газа на печь, м куб./час','dark blue',2,0.0,25000.0),
				indItemWithBounds('Положение ИМ на трубопроводе природного газа на печь, %','red',3,0.0,100.0),
				indItemWithBoundsWithLinestyleDigital('Задание расхода природного газа на печь, м куб./час','dark blue',2,0.0,25000.0,DashedLineStyle)
			]
		);

		TrendsParams['PR_HD_TRENDS']=trendsConfig(
			'Параметры пара на увлажнение холодного дутья',
			dbConfig3(
				'pr_hd',
				[
					'TPR_HD',
					'PPR_HD',
					'FPR_HD'
				],
				'gim',
				[
					'GMHD'
				],
				'zdn',
				[
					'ZDN_FPR_HD'
				]
			),
			[
				indItemWithBounds('Температура пара на увлажнение холодного дутья, '+String.fromCharCode(176)+'С','dark red',0,0.0,250.0),
				indItemWithBounds('Давление пара на увлажнение холодного дутья, кгс/см кв.','dark green',1,0.0,10.0),
				indItemWithBounds('Расход пара на увлажнение холодного дутья, м куб./час','dark blue',2,0.0,5.0),
				indItemWithBounds('Положение ИМ на трубопроводе пара на увлажнение дутья, %','red',3,0.0,100.0),
				indItemWithBoundsWithLinestyleDigital('Задание расхода пара на увлажнение холодного дутья, м куб./час','dark blue',2,0.0,5.0,DashedLineStyle)
			]
		);

		TrendsParams['TKG_TRENDS']=trendsConfig(
			'Температура в газоотводах',
			dbConfig(
				'tkg',
				[
					'TKG_1',
					'TKG_2',
					'TKG_3',
					'TKG_4'
				]
			),
			[
				indItemWithBounds('ТГК1, '+String.fromCharCode(176)+'С','dark red',0,0.0,1000.0),
				indItemWithBounds('ТГК2, '+String.fromCharCode(176)+'С','dark green',0,0.0,1000.0),
				indItemWithBounds('ТГК3, '+String.fromCharCode(176)+'С','dark blue',0,0.0,1000.0),
				indItemWithBounds('ТГК4, '+String.fromCharCode(176)+'С','dark orange',0,0.0,1000.0)
			]
		);
		
		TrendsParams['TPP_TRENDS']=trendsConfig(
			'Температура периферии под защитными плитами',
			dbConfig(
				'tpp',
				[
					'TPP_1',
					'TPP_2',
					'TPP_3',
					'TPP_4',
					'TPP_5',
					'TPP_6',
					'TPP_7',
					'TPP_8',
					'TPP_9',
					'TPP_10',
					'TPP_11',
					'TPP_12',
					'TPP_13',
					'TPP_14',
					'TPP_15',
					'TPP_16'
				]
			),
			[
				indItemWithBounds('ТПП1, '+String.fromCharCode(176)+'С','dark red',0,0.0,1000.0),
				indItemWithBounds('ТПП2, '+String.fromCharCode(176)+'С','dark green',0,0.0,1000.0),
				indItemWithBounds('ТПП3, '+String.fromCharCode(176)+'С','dark blue',0,0.0,1000.0),
				indItemWithBounds('ТПП4, '+String.fromCharCode(176)+'С','dark orange',0,0.0,1000.0),
				indItemWithBounds('ТПП5, '+String.fromCharCode(176)+'С','dark brown',0,0.0,1000.0),
				indItemWithBounds('ТПП6, '+String.fromCharCode(176)+'С','dark purple',0,0.0,1000.0),
				indItemWithBounds('ТПП7, '+String.fromCharCode(176)+'С','dark gray',0,0.0,1000.0),
				indItemWithBounds('ТПП8, '+String.fromCharCode(176)+'С','dark metallic',0,0.0,1000.0),
				indItemWithBounds('ТПП9, '+String.fromCharCode(176)+'С','light red',0,0.0,1000.0),
				indItemWithBounds('ТПП10, '+String.fromCharCode(176)+'С','light green',0,0.0,1000.0),
				indItemWithBounds('ТПП11, '+String.fromCharCode(176)+'С','light blue',0,0.0,1000.0),
				indItemWithBounds('ТПП12, '+String.fromCharCode(176)+'С','light orange',0,0.0,1000.0),
				indItemWithBounds('ТПП13, '+String.fromCharCode(176)+'С','light brown',0,0.0,1000.0),
				indItemWithBounds('ТПП14, '+String.fromCharCode(176)+'С','light purple',0,0.0,1000.0),
				indItemWithBounds('ТПП15, '+String.fromCharCode(176)+'С','light gray',0,0.0,1000.0),
				indItemWithBounds('ТПП16, '+String.fromCharCode(176)+'С','light metallic',0,0.0,1000.0)
			]
		);

		TrendsParams['TSHA_1_TRENDS']=trendsConfig(
			'Температура футеровки шахты печи, горизонт 1, отм. +18.850',
			dbConfig(
				'journal11',
				[
					'TSHA_1_1',
					'TSHA_1_2',
					'TSHA_1_3',
					'TSHA_1_4',
					'TSHA_1_5',
					'TSHA_1_6',
					'TSHA_1_7',
					'TSHA_1_8',
					'TSHA_1_9',
					'TSHA_1_10',
					'TSHA_1_11',
					'TSHA_1_12',
					'TSHA_1_13',
					'TSHA_1_14',
					'TSHA_1_15',
					'TSHA_1_16',
					'TSHA_1_17',
					'TSHA_1_18'
				]
			),
			[
				indItemWithBounds('Точка 1, '+String.fromCharCode(176)+'С','dark red',0,0.0,1000.0),
				indItemWithBounds('Точка 2, '+String.fromCharCode(176)+'С','dark green',0,0.0,1000.0),
				indItemWithBounds('Точка 3, '+String.fromCharCode(176)+'С','dark blue',0,0.0,1000.0),
				indItemWithBounds('Точка 4, '+String.fromCharCode(176)+'С','dark orange',0,0.0,1000.0),
				indItemWithBounds('Точка 5, '+String.fromCharCode(176)+'С','dark brown',0,0.0,1000.0),
				indItemWithBounds('Точка 6, '+String.fromCharCode(176)+'С','dark purple',0,0.0,1000.0),
				indItemWithBounds('Точка 7, '+String.fromCharCode(176)+'С','dark gray',0,0.0,1000.0),
				indItemWithBounds('Точка 8, '+String.fromCharCode(176)+'С','dark metallic',0,0.0,1000.0),
				indItemWithBounds('Точка 9, '+String.fromCharCode(176)+'С','light red',0,0.0,1000.0),
				indItemWithBounds('Точка 10, '+String.fromCharCode(176)+'С','light green',0,0.0,1000.0),
				indItemWithBounds('Точка 11, '+String.fromCharCode(176)+'С','light blue',0,0.0,1000.0),
				indItemWithBounds('Точка 12, '+String.fromCharCode(176)+'С','light orange',0,0.0,1000.0),
				indItemWithBounds('Точка 13, '+String.fromCharCode(176)+'С','light brown',0,0.0,1000.0),
				indItemWithBounds('Точка 14, '+String.fromCharCode(176)+'С','light purple',0,0.0,1000.0),
				indItemWithBounds('Точка 15, '+String.fromCharCode(176)+'С','light gray',0,0.0,1000.0),
				indItemWithBounds('Точка 16, '+String.fromCharCode(176)+'С','light metallic',0,0.0,1000.0),
				indItemWithBounds('Точка 17, '+String.fromCharCode(176)+'С','dark green',0,0.0,1000.0),
				indItemWithBounds('Точка 18, '+String.fromCharCode(176)+'С','dark blue',0,0.0,1000.0)
			]
		);

		TrendsParams['TSHA_2_TRENDS']=trendsConfig(
			'Температура футеровки шахты печи, горизонт 2, отм. +21.500',
			dbConfig(
				'journal11',
				[
					'TSHA_2_1',
					'TSHA_2_2',
					'TSHA_2_3',
					'TSHA_2_4',
					'TSHA_2_5',
					'TSHA_2_6',
					'TSHA_2_7',
					'TSHA_2_8',
					'TSHA_2_9',
					'TSHA_2_10',
					'TSHA_2_11',
					'TSHA_2_12',
					'TSHA_2_13',
					'TSHA_2_14',
					'TSHA_2_15',
					'TSHA_2_16',
					'TSHA_2_17',
					'TSHA_2_18'
				]
			),
			[
				indItemWithBounds('Точка 1, '+String.fromCharCode(176)+'С','dark red',0,0.0,1000.0),
				indItemWithBounds('Точка 2, '+String.fromCharCode(176)+'С','dark green',0,0.0,1000.0),
				indItemWithBounds('Точка 3, '+String.fromCharCode(176)+'С','dark blue',0,0.0,1000.0),
				indItemWithBounds('Точка 4, '+String.fromCharCode(176)+'С','dark orange',0,0.0,1000.0),
				indItemWithBounds('Точка 5, '+String.fromCharCode(176)+'С','dark brown',0,0.0,1000.0),
				indItemWithBounds('Точка 6, '+String.fromCharCode(176)+'С','dark purple',0,0.0,1000.0),
				indItemWithBounds('Точка 7, '+String.fromCharCode(176)+'С','dark gray',0,0.0,1000.0),
				indItemWithBounds('Точка 8, '+String.fromCharCode(176)+'С','dark metallic',0,0.0,1000.0),
				indItemWithBounds('Точка 9, '+String.fromCharCode(176)+'С','light red',0,0.0,1000.0),
				indItemWithBounds('Точка 10, '+String.fromCharCode(176)+'С','light green',0,0.0,1000.0),
				indItemWithBounds('Точка 11, '+String.fromCharCode(176)+'С','light blue',0,0.0,1000.0),
				indItemWithBounds('Точка 12, '+String.fromCharCode(176)+'С','light orange',0,0.0,1000.0),
				indItemWithBounds('Точка 13, '+String.fromCharCode(176)+'С','light brown',0,0.0,1000.0),
				indItemWithBounds('Точка 14, '+String.fromCharCode(176)+'С','light purple',0,0.0,1000.0),
				indItemWithBounds('Точка 15, '+String.fromCharCode(176)+'С','light gray',0,0.0,1000.0),
				indItemWithBounds('Точка 16, '+String.fromCharCode(176)+'С','light metallic',0,0.0,1000.0),
				indItemWithBounds('Точка 17, '+String.fromCharCode(176)+'С','dark green',0,0.0,1000.0),
				indItemWithBounds('Точка 18, '+String.fromCharCode(176)+'С','dark blue',0,0.0,1000.0)
			]
		);

		TrendsParams['TSHA_3_TRENDS']=trendsConfig(
			'Температура футеровки шахты печи, горизонт 3, отм. +24.400',
			dbConfig(
				'journal11',
				[
					'TSHA_3_1',
					'TSHA_3_2',
					'TSHA_3_3',
					'TSHA_3_4',
					'TSHA_3_5',
					'TSHA_3_6',
					'TSHA_3_7',
					'TSHA_3_8',
					'TSHA_3_9',
					'TSHA_3_10',
					'TSHA_3_11',
					'TSHA_3_12',
					'TSHA_3_13',
					'TSHA_3_14',
					'TSHA_3_15',
					'TSHA_3_16',
					'TSHA_3_17',
					'TSHA_3_18'
				]
			),
			[
				indItemWithBounds('Точка 1, '+String.fromCharCode(176)+'С','dark red',0,0.0,1000.0),
				indItemWithBounds('Точка 2, '+String.fromCharCode(176)+'С','dark green',0,0.0,1000.0),
				indItemWithBounds('Точка 3, '+String.fromCharCode(176)+'С','dark blue',0,0.0,1000.0),
				indItemWithBounds('Точка 4, '+String.fromCharCode(176)+'С','dark orange',0,0.0,1000.0),
				indItemWithBounds('Точка 5, '+String.fromCharCode(176)+'С','dark brown',0,0.0,1000.0),
				indItemWithBounds('Точка 6, '+String.fromCharCode(176)+'С','dark purple',0,0.0,1000.0),
				indItemWithBounds('Точка 7, '+String.fromCharCode(176)+'С','dark gray',0,0.0,1000.0),
				indItemWithBounds('Точка 8, '+String.fromCharCode(176)+'С','dark metallic',0,0.0,1000.0),
				indItemWithBounds('Точка 9, '+String.fromCharCode(176)+'С','light red',0,0.0,1000.0),
				indItemWithBounds('Точка 10, '+String.fromCharCode(176)+'С','light green',0,0.0,1000.0),
				indItemWithBounds('Точка 11, '+String.fromCharCode(176)+'С','light blue',0,0.0,1000.0),
				indItemWithBounds('Точка 12, '+String.fromCharCode(176)+'С','light orange',0,0.0,1000.0),
				indItemWithBounds('Точка 13, '+String.fromCharCode(176)+'С','light brown',0,0.0,1000.0),
				indItemWithBounds('Точка 14, '+String.fromCharCode(176)+'С','light purple',0,0.0,1000.0),
				indItemWithBounds('Точка 15, '+String.fromCharCode(176)+'С','light gray',0,0.0,1000.0),
				indItemWithBounds('Точка 16, '+String.fromCharCode(176)+'С','light metallic',0,0.0,1000.0),
				indItemWithBounds('Точка 17, '+String.fromCharCode(176)+'С','dark green',0,0.0,1000.0),
				indItemWithBounds('Точка 18, '+String.fromCharCode(176)+'С','dark blue',0,0.0,1000.0)
			]
		);

		TrendsParams['TSHA_4_TRENDS']=trendsConfig(
			'Температура футеровки шахты печи, горизонт 4, отм. +26.506',
			dbConfig(
				'journal11',
				[
					'TSHA_4_1',
					'TSHA_4_2',
					'TSHA_4_3',
					'TSHA_4_4',
					'TSHA_4_5',
					'TSHA_4_6',
					'TSHA_4_7',
					'TSHA_4_8',
					'TSHA_4_9',
					'TSHA_4_10',
					'TSHA_4_11',
					'TSHA_4_12',
					'TSHA_4_13',
					'TSHA_4_14',
					'TSHA_4_15',
					'TSHA_4_16',
					'TSHA_4_17',
					'TSHA_4_18'
				]
			),
			[
				indItemWithBounds('Точка 1, '+String.fromCharCode(176)+'С','dark red',0,0.0,1000.0),
				indItemWithBounds('Точка 2, '+String.fromCharCode(176)+'С','dark green',0,0.0,1000.0),
				indItemWithBounds('Точка 3, '+String.fromCharCode(176)+'С','dark blue',0,0.0,1000.0),
				indItemWithBounds('Точка 4, '+String.fromCharCode(176)+'С','dark orange',0,0.0,1000.0),
				indItemWithBounds('Точка 5, '+String.fromCharCode(176)+'С','dark brown',0,0.0,1000.0),
				indItemWithBounds('Точка 6, '+String.fromCharCode(176)+'С','dark purple',0,0.0,1000.0),
				indItemWithBounds('Точка 7, '+String.fromCharCode(176)+'С','dark gray',0,0.0,1000.0),
				indItemWithBounds('Точка 8, '+String.fromCharCode(176)+'С','dark metallic',0,0.0,1000.0),
				indItemWithBounds('Точка 9, '+String.fromCharCode(176)+'С','light red',0,0.0,1000.0),
				indItemWithBounds('Точка 10, '+String.fromCharCode(176)+'С','light green',0,0.0,1000.0),
				indItemWithBounds('Точка 11, '+String.fromCharCode(176)+'С','light blue',0,0.0,1000.0),
				indItemWithBounds('Точка 12, '+String.fromCharCode(176)+'С','light orange',0,0.0,1000.0),
				indItemWithBounds('Точка 13, '+String.fromCharCode(176)+'С','light brown',0,0.0,1000.0),
				indItemWithBounds('Точка 14, '+String.fromCharCode(176)+'С','light purple',0,0.0,1000.0),
				indItemWithBounds('Точка 15, '+String.fromCharCode(176)+'С','light gray',0,0.0,1000.0),
				indItemWithBounds('Точка 16, '+String.fromCharCode(176)+'С','light metallic',0,0.0,1000.0),
				indItemWithBounds('Точка 17, '+String.fromCharCode(176)+'С','dark green',0,0.0,1000.0),
				indItemWithBounds('Точка 18, '+String.fromCharCode(176)+'С','dark blue',0,0.0,1000.0)
			]
		);

		TrendsParams['TSHA_5_TRENDS']=trendsConfig(
			'Температура футеровки шахты печи, горизонт 5, отм. +29.120',
			dbConfig(
				'journal11',
				[
					'TSHA_5_1',
					'TSHA_5_2',
					'TSHA_5_3',
					'TSHA_5_4',
					'TSHA_5_5',
					'TSHA_5_6',
					'TSHA_5_7',
					'TSHA_5_8',
					'TSHA_5_9',
					'TSHA_5_10',
					'TSHA_5_11',
					'TSHA_5_12',
					'TSHA_5_13',
					'TSHA_5_14',
					'TSHA_5_15',
					'TSHA_5_16',
					'TSHA_5_17',
					'TSHA_5_18'
				]
			),
			[
				indItemWithBounds('Точка 1, '+String.fromCharCode(176)+'С','dark red',0,0.0,1000.0),
				indItemWithBounds('Точка 2, '+String.fromCharCode(176)+'С','dark green',0,0.0,1000.0),
				indItemWithBounds('Точка 3, '+String.fromCharCode(176)+'С','dark blue',0,0.0,1000.0),
				indItemWithBounds('Точка 4, '+String.fromCharCode(176)+'С','dark orange',0,0.0,1000.0),
				indItemWithBounds('Точка 5, '+String.fromCharCode(176)+'С','dark brown',0,0.0,1000.0),
				indItemWithBounds('Точка 6, '+String.fromCharCode(176)+'С','dark purple',0,0.0,1000.0),
				indItemWithBounds('Точка 7, '+String.fromCharCode(176)+'С','dark gray',0,0.0,1000.0),
				indItemWithBounds('Точка 8, '+String.fromCharCode(176)+'С','dark metallic',0,0.0,1000.0),
				indItemWithBounds('Точка 9, '+String.fromCharCode(176)+'С','light red',0,0.0,1000.0),
				indItemWithBounds('Точка 10, '+String.fromCharCode(176)+'С','light green',0,0.0,1000.0),
				indItemWithBounds('Точка 11, '+String.fromCharCode(176)+'С','light blue',0,0.0,1000.0),
				indItemWithBounds('Точка 12, '+String.fromCharCode(176)+'С','light orange',0,0.0,1000.0),
				indItemWithBounds('Точка 13, '+String.fromCharCode(176)+'С','light brown',0,0.0,1000.0),
				indItemWithBounds('Точка 14, '+String.fromCharCode(176)+'С','light purple',0,0.0,1000.0),
				indItemWithBounds('Точка 15, '+String.fromCharCode(176)+'С','light gray',0,0.0,1000.0),
				indItemWithBounds('Точка 16, '+String.fromCharCode(176)+'С','light metallic',0,0.0,1000.0),
				indItemWithBounds('Точка 17, '+String.fromCharCode(176)+'С','dark green',0,0.0,1000.0),
				indItemWithBounds('Точка 18, '+String.fromCharCode(176)+'С','dark blue',0,0.0,1000.0)
			]
		);
		TrendsParams['THPL_1_TRENDS']=trendsConfig(
			'Температура тела холодильных плит, 1 ряд заплечиков, отм. +14.908',
			dbConfig(
				'journal12',
				[
					'THPL_1_1',
					'THPL_1_2',
					'THPL_1_3',
					'THPL_1_4',
					'THPL_1_5',
					'THPL_1_6'
				]
			),
			[
				indItemWithBounds('ТХП611, '+String.fromCharCode(176)+'С','dark red',0,0.0,500.0),
				indItemWithBounds('ТХП612, '+String.fromCharCode(176)+'С','dark green',0,0.0,500.0),
				indItemWithBounds('ТХП613, '+String.fromCharCode(176)+'С','dark blue',0,0.0,500.0),
				indItemWithBounds('ТХП614, '+String.fromCharCode(176)+'С','dark orange',0,0.0,500.0),
				indItemWithBounds('ТХП615, '+String.fromCharCode(176)+'С','dark brown',0,0.0,500.0),
				indItemWithBounds('ТХП616	, '+String.fromCharCode(176)+'С','dark purple',0,0.0,500.0)
			]
		);

		TrendsParams['THPL_2_TRENDS']=trendsConfig(
			'Температура тела холодильных плит, 2 ряд заплечиков, отм. +16.135',
			dbConfig(
				'journal12',
				[
					'THPL_2_1',
					'THPL_2_2',
					'THPL_2_3',
					'THPL_2_4',
					'THPL_2_5',
					'THPL_2_6'
				]
			),
			[
				indItemWithBounds('ТХП621, '+String.fromCharCode(176)+'С','dark red',0,0.0,500.0),
				indItemWithBounds('ТХП622, '+String.fromCharCode(176)+'С','dark green',0,0.0,500.0),
				indItemWithBounds('ТХП623, '+String.fromCharCode(176)+'С','dark blue',0,0.0,500.0),
				indItemWithBounds('ТХП624, '+String.fromCharCode(176)+'С','dark orange',0,0.0,500.0),
				indItemWithBounds('ТХП625, '+String.fromCharCode(176)+'С','dark brown',0,0.0,500.0),
				indItemWithBounds('ТХП626	, '+String.fromCharCode(176)+'С','dark purple',0,0.0,500.0)
			]
		);

		TrendsParams['THPL_3_TRENDS']=trendsConfig(
			'Температура тела холодильных плит, 1 ряд шахты печи, отм. +17.755',
			dbConfig(
				'journal12',
				[
					'THPL_3_1',
					'THPL_3_2',
					'THPL_3_3',
					'THPL_3_4',
					'THPL_3_5',
					'THPL_3_6'
				]
			),
			[
				indItemWithBounds('ТХП631, '+String.fromCharCode(176)+'С','dark red',0,0.0,500.0),
				indItemWithBounds('ТХП632, '+String.fromCharCode(176)+'С','dark green',0,0.0,500.0),
				indItemWithBounds('ТХП633, '+String.fromCharCode(176)+'С','dark blue',0,0.0,500.0),
				indItemWithBounds('ТХП634, '+String.fromCharCode(176)+'С','dark orange',0,0.0,500.0),
				indItemWithBounds('ТХП635, '+String.fromCharCode(176)+'С','dark brown',0,0.0,500.0),
				indItemWithBounds('ТХП636	, '+String.fromCharCode(176)+'С','dark purple',0,0.0,500.0)
			]
		);

		TrendsParams['THPL_4_TRENDS']=trendsConfig(
			'Температура тела холодильных плит, 3 ряд шахты печи, отм. +20.125',
			dbConfig(
				'journal12',
				[
					'THPL_4_1',
					'THPL_4_2',
					'THPL_4_3',
					'THPL_4_4',
					'THPL_4_5',
					'THPL_4_6'
				]
			),
			[
				indItemWithBounds('ТХП641, '+String.fromCharCode(176)+'С','dark red',0,0.0,500.0),
				indItemWithBounds('ТХП642, '+String.fromCharCode(176)+'С','dark green',0,0.0,500.0),
				indItemWithBounds('ТХП643, '+String.fromCharCode(176)+'С','dark blue',0,0.0,500.0),
				indItemWithBounds('ТХП644, '+String.fromCharCode(176)+'С','dark orange',0,0.0,500.0),
				indItemWithBounds('ТХП645, '+String.fromCharCode(176)+'С','dark brown',0,0.0,500.0),
				indItemWithBounds('ТХП646	, '+String.fromCharCode(176)+'С','dark purple',0,0.0,500.0)
			]
		);

		TrendsParams['THPL_5_TRENDS']=trendsConfig(
			'Температура тела холодильных плит, 4 ряд шахты печи, отм. +21.576',
			dbConfig(
				'journal12',
				[
					'THPL_5_1',
					'THPL_5_2',
					'THPL_5_3',
					'THPL_5_4',
					'THPL_5_5',
					'THPL_5_6'
				]
			),
			[
				indItemWithBounds('ТХП651, '+String.fromCharCode(176)+'С','dark red',0,0.0,500.0),
				indItemWithBounds('ТХП652, '+String.fromCharCode(176)+'С','dark green',0,0.0,500.0),
				indItemWithBounds('ТХП653, '+String.fromCharCode(176)+'С','dark blue',0,0.0,500.0),
				indItemWithBounds('ТХП654, '+String.fromCharCode(176)+'С','dark orange',0,0.0,500.0),
				indItemWithBounds('ТХП655, '+String.fromCharCode(176)+'С','dark brown',0,0.0,500.0),
				indItemWithBounds('ТХП656	, '+String.fromCharCode(176)+'С','dark purple',0,0.0,500.0)
			]
		);

		TrendsParams['THPL_6_TRENDS']=trendsConfig(
			'Температура тела холодильных плит, 6 ряд шахты печи, отм. +25.237',
			dbConfig(
				'journal12',
				[
					'THPL_6_1',
					'THPL_6_2',
					'THPL_6_3',
					'THPL_6_4',
					'THPL_6_5',
					'THPL_6_6'
				]
			),
			[
				indItemWithBounds('ТХП661, '+String.fromCharCode(176)+'С','dark red',0,0.0,500.0),
				indItemWithBounds('ТХП662, '+String.fromCharCode(176)+'С','dark green',0,0.0,500.0),
				indItemWithBounds('ТХП663, '+String.fromCharCode(176)+'С','dark blue',0,0.0,500.0),
				indItemWithBounds('ТХП664, '+String.fromCharCode(176)+'С','dark orange',0,0.0,500.0),
				indItemWithBounds('ТХП665, '+String.fromCharCode(176)+'С','dark brown',0,0.0,500.0),
				indItemWithBounds('ТХП666	, '+String.fromCharCode(176)+'С','dark purple',0,0.0,500.0)
			]
		);

		TrendsParams['PD_TRENDS']=trendsConfig(
			'Перепад давления по высоте печи',
			dbConfig(
				'pd',
				[
					'PDO',
					'PDN',
					'PDV'
				]
			),
			[
				indItemWithBounds('Общий, кгс/см кв.','dark red',0,0.0,2.4),
				indItemWithBounds('Нижний, кгс/см кв.','dark blue',0,0.0,2.4),
				indItemWithBounds('Верхний, кгс/см кв.','dark green',0,0.0,2.4)
			]
		);

		TrendsParams['TCHUG_TRENDS']=trendsConfig(
			'Температура чугуна на выпуске',
			dbConfig(
				'tchug',
				[
					'TCHUG_1',
					'TCHUG_2'
				]
			),
			[
				indItemWithBounds('Температура чугуна из летки №1, '+String.fromCharCode(176)+'С','dark red',0,1000.0,1600.0),
				indItemWithBounds('Температура чугуна из летки №2, '+String.fromCharCode(176)+'С','dark orange',0,1000.0,1600.0)
			]
		);

		TrendsParams['GELOB_1_TRENDS']=trendsConfig(
			'Температура сушки и кожуха желоба 1',
			dbConfig(
				'gelob1',
				[
					'TGELFUT_1_1',
					'TGELFUT_1_2',
					'TGELFUT_1_3',
					'TGELFUT_1_4',
					'TGELFUT_1_5',
					'TGELKOG_1_1',
					'TGELKOG_1_2',
					'TGELKOG_1_3',
					'TGELKOG_1_4',
					'TGELKOG_1_5',
					'TGELKOG_1_6'
				]
			),
			[
				indItemWithBounds('ТСЖ1-1, '+String.fromCharCode(176)+'С','dark red',0,0.0,1000.0),
				indItemWithBounds('ТСЖ2-1, '+String.fromCharCode(176)+'С','dark green',0,0.0,1000.0),
				indItemWithBounds('ТСЖ3-1, '+String.fromCharCode(176)+'С','dark blue',0,0.0,1000.0),
				indItemWithBounds('ТСЖ4-1, '+String.fromCharCode(176)+'С','dark orange',0,0.0,1000.0),
				indItemWithBounds('ТСЖ5-1, '+String.fromCharCode(176)+'С','dark brown',0,0.0,1000.0),
				indItemWithBounds('ТКЖ4-1, '+String.fromCharCode(176)+'С','dark purple',1,0.0,500.0),
				indItemWithBounds('ТКЖ1-1, '+String.fromCharCode(176)+'С','dark gray',1,0.0,500.0),
				indItemWithBounds('ТКЖ5-1, '+String.fromCharCode(176)+'С','dark metallic',1,0.0,500.0),
				indItemWithBounds('ТКЖ2-1, '+String.fromCharCode(176)+'С','light red',1,0.0,500.0),
				indItemWithBounds('ТКЖ6-1, '+String.fromCharCode(176)+'С','light green',1,0.0,500.0),
				indItemWithBounds('ТКЖ3-1, '+String.fromCharCode(176)+'С','light blue',1,0.0,500.0)
			]
		);

		TrendsParams['GELOB_2_TRENDS']=trendsConfig(
			'Температура сушки и кожуха желоба 2',
			dbConfig(
				'gelob2',
				[
					'TGELFUT_2_1',
					'TGELFUT_2_2',
					'TGELFUT_2_3',
					'TGELFUT_2_4',
					'TGELFUT_2_5',
					'TGELKOG_2_1',
					'TGELKOG_2_2',
					'TGELKOG_2_3',
					'TGELKOG_2_4',
					'TGELKOG_2_5',
					'TGELKOG_2_6'
				]
			),
			[
				indItemWithBounds('ТСЖ1-2, '+String.fromCharCode(176)+'С','dark red',0,0.0,1000.0),
				indItemWithBounds('ТСЖ2-2, '+String.fromCharCode(176)+'С','dark green',0,0.0,1000.0),
				indItemWithBounds('ТСЖ3-2, '+String.fromCharCode(176)+'С','dark blue',0,0.0,1000.0),
				indItemWithBounds('ТСЖ4-2, '+String.fromCharCode(176)+'С','dark orange',0,0.0,1000.0),
				indItemWithBounds('ТСЖ5-2, '+String.fromCharCode(176)+'С','dark brown',0,0.0,1000.0),
				indItemWithBounds('ТКЖ4-2, '+String.fromCharCode(176)+'С','dark purple',1,0.0,500.0),
				indItemWithBounds('ТКЖ1-2, '+String.fromCharCode(176)+'С','dark gray',1,0.0,500.0),
				indItemWithBounds('ТКЖ2-2, '+String.fromCharCode(176)+'С','dark metallic',1,0.0,500.0),
				indItemWithBounds('ТКЖ5-2, '+String.fromCharCode(176)+'С','light red',1,0.0,500.0),
				indItemWithBounds('ТКЖ6-2, '+String.fromCharCode(176)+'С','light green',1,0.0,500.0),
				indItemWithBounds('ТКЖ3-2, '+String.fromCharCode(176)+'С','light blue',1,0.0,500.0)
			]
		);


		TrendsParams['NASSIO_TRENDS']=trendsConfig(
			'Параметры работы насосной станции СИО на отм. +30.650.',
			dbConfig(
				'nassio',
				[
					'FVD_NAP_1',
					'FVD_NAP_1'
				]
			),
			[
				indItemWithBounds('Расход воды в напорном трубопроводе циркуляционных насосов секции барабана-сепаратор №1, м куб./час','dark red',0,0.0,360.0),
				indItemWithBounds('Расход воды в напорном трубопроводе циркуляционных насосов секции барабана-сепаратор №2, м куб./час','dark green',0,0.0,360.0)
			]
		);

		TrendsParams['SIO_1_TRENDS']=trendsConfig(
			'Параметры работы СИО печи. Барабан-сепаратор №1.',
			dbConfig3(
				'sio1',
				[
					'PVD_1',
					'PVD_2',
					'PPR_SIO_1',
					'TPR_SIO_1',
					'FPR_SIO_1',
					'LVD_1_1',
					'LVD_2_1'
				],
				'gim',
				[
					'GVDPIT_1'
				],
				'zdn',
				[
					'ZDN_LVD_1'
				]
			),
			[
				indItemWithBounds('Давление воды на I подводе, кгс/см кв.','dark red',0,0.0,12.0),
				indItemWithBounds('Давление воды на II подводе, кгс/см кв.','dark green',0,0.0,12.0),
				indItemWithBounds('Давление пара, кгс/см кв.','dark blue',1,0.0,10.0),
				indItemWithBounds('Температура пара, '+String.fromCharCode(176)+'С','dark orange',2,0.0,375.0),
				indItemWithBounds('Расход пара, т/ч','dark brown',3,0.0,4.0),
				indItemWithBounds('Уровень воды (1 точка), мм','dark purple',4,-315.0,315.0),
				indItemWithBounds('Уровень воды (2 точка), мм','dark gray',4,-315.0,315.0),
				indItemWithBounds('Положение ИМ на трубопроводе питающей воды, %','red',5,0.0,100.0),
				indItemWithBoundsWithLinestyleDigital('Задание уровня воды, мм','dark purple',4,-315.0,315.0,DashedLineStyle)
			]
		);

		TrendsParams['SIO_2_TRENDS']=trendsConfig(
			'Параметры работы СИО печи. Барабан-сепаратор №2.',
			dbConfig3(
				'sio2',
				[
					'PVD_1',
					'PVD_2',
					'PPR_SIO_2',
					'TPR_SIO_2',
					'FPR_SIO_2',
					'LVD_1_2',
					'LVD_2_2'
				],
				'gim',
				[
					'GVDPIT_2'
				],
				'zdn',
				[
					'ZDN_LVD_2'
				]
			),
			[
				indItemWithBounds('Давление воды на I подводе, кгс/см кв.','dark red',0,0.0,12.0),
				indItemWithBounds('Давление воды на II подводе, кгс/см кв.','dark green',0,0.0,12.0),
				indItemWithBounds('Давление пара, кгс/см кв.','dark blue',1,0.0,10.0),
				indItemWithBounds('Температура пара, '+String.fromCharCode(176)+'С','dark orange',2,0.0,375.0),
				indItemWithBounds('Расход пара, т/ч','dark brown',3,0.0,4.0),
				indItemWithBounds('Уровень воды (1 точка), мм','dark purple',4,-315.0,315.0),
				indItemWithBounds('Уровень воды (2 точка), мм','dark gray',4,-315.0,315.0),
				indItemWithBounds('Положение ИМ на трубопроводе питающей воды, %','red',5,0.0,100.0),
				indItemWithBoundsWithLinestyleDigital('Задание уровня воды, мм','dark purple',4,-315.0,315.0,DashedLineStyle)
			]
		);

		TrendsParams['AZ_TRENDS']=trendsConfig(
			'Параметры азота на общем подводе',
			dbConfig(
				'energo',
				[
					'TAZ',
					'PAZ',
					'FAZ',
					'QO2AZ'
				]
			),
			[
				indItemWithBounds('Температура, град С.','dark red',0,-25.0,100.0),
				indItemWithBounds('Давление , кгс/см кв.','dark green',1,0.0,10.0),
				indItemWithBounds('Расход, м куб./час','dark blue',2,0.0,10000.0),
				indItemWithBounds('Содержание кислорода, %','dark orange',3,0.0,10.0)
			]
		);

		TrendsParams['AZ_ZAG_TRENDS']=trendsConfig(
			'Параметры азота на загрузку',
			dbConfig(
				'energo',
				[
					'TAZ_ZAG',
					'PAZ_ZAG',
					'FAZ_ZAG'
				]
			),
			[
				indItemWithBounds('Температура, град С.','dark red',0,-25.0,100.0),
				indItemWithBounds('Давление , кгс/см кв.','dark green',1,0.0,10.0),
				indItemWithBounds('Расход, м куб./час','dark blue',2,0.0,10000.0)
			]
		);

		TrendsParams['AZ_ZA_TRENDS']=trendsConfig(
			'Параметры азота в засыпной аппарат',
			dbConfig(
				'energo',
				[
					'TAZ_VMK',
					'PAZ_VMK',
					'FAZ_VMK',
					'TAZ_NMK',
					'PAZ_NMK',
					'FAZ_NMK',
					'TAZ_BK',
					'PAZ_BK',
					'FAZ_BK',
					'FAZ_SK'
				]
			),
			[
				indItemWithBounds('Температура в ВМК, '+String.fromCharCode(176)+'С','dark red',0,-25.0,100.0),
				indItemWithBounds('Давление в ВМК, кгс/см кв.','dark green',1,0.0,10.0),
				indItemWithBounds('Расход в ВМК, м куб./час','dark blue',2,0.0,10000.0),
				indItemWithBounds('Температура в НМК, '+String.fromCharCode(176)+'С','dark orange',0,-25.0,100.0),
				indItemWithBounds('Давление в НМК, кгс/см кв.','dark brown',1,0.0,10.0),
				indItemWithBounds('Расход в НМК, м куб./час','dark purple',2,10000.0),
				indItemWithBounds('Температура под БК, '+String.fromCharCode(176)+'С','dark gray',0,-25.0,100.0),
				indItemWithBounds('Давление под БК, кгс/см кв.','dark metallic',1,0.0,10.0),
				indItemWithBounds('Расход под БК, м куб./час','light red',2,10000.0),
				indItemWithBounds('Расход на межштанговый зазор, м куб./час','light green',2,10000.0)
			]
		);

		TrendsParams['FPG_TRENDS']=trendsConfig(
			'Расход природного газа по фурмам',
			dbConfig2(
				'fpg',
				[
					'FPG_1',
					'FPG_2',
					'FPG_3',
					'FPG_4',
					'FPG_5',
					'FPG_6',
					'FPG_7',
					'FPG_8',
					'FPG_9',
					'FPG_10',
					'FPG_11',
					'FPG_12',
					'FPG_13',
					'FPG_14',
					'FPG_15',
					'FPG_16',
					'FPG_17',
					'FPG_18',
					'FPG_19',
					'FPG_20'
				],
				'gim',
				[
					'GPG_1',
					'GPG_2',
					'GPG_3',
					'GPG_4',
					'GPG_5',
					'GPG_6',
					'GPG_7',
					'GPG_8',
					'GPG_9',
					'GPG_10',
					'GPG_11',
					'GPG_12',
					'GPG_13',
					'GPG_14',
					'GPG_15',
					'GPG_16',
					'GPG_17',
					'GPG_18',
					'GPG_19',
					'GPG_20'
				]
			),
			[
				indItemWithBounds('Фурма №1, м куб./час','dark red',0,0.0,1250.0),
				indItemWithBounds('Фурма №2, м куб./час','dark green',0,0.0,1250.0),
				indItemWithBounds('Фурма №3, м куб./час','dark blue',0,0.0,1250.0),
				indItemWithBounds('Фурма №4, м куб./час','dark orange',0,0.0,1250.0),
				indItemWithBounds('Фурма №5, м куб./час','dark brown',0,0.0,1250.0),
				indItemWithBounds('Фурма №6, м куб./час','dark purple',0,0.0,1250.0),
				indItemWithBounds('Фурма №7, м куб./час','dark gray',0,0.0,1250.0),
				indItemWithBounds('Фурма №8, м куб./час','dark metallic',0,0.0,1250.0),
				indItemWithBounds('Фурма №9, м куб./час','light red',0,0.0,1250.0),
				indItemWithBounds('Фурма №10, м куб./час','light green',0,0.0,1250.0),
				indItemWithBounds('Фурма №11, м куб./час','light blue',0,0.0,1250.0),
				indItemWithBounds('Фурма №12, м куб./час','light orange',0,0.0,1250.0),
				indItemWithBounds('Фурма №13, м куб./час','light brown',0,0.0,1250.0),
				indItemWithBounds('Фурма №14, м куб./час','light purple',0,0.0,1250.0),
				indItemWithBounds('Фурма №15, м куб./час','light gray',0,0.0,1250.0),
				indItemWithBounds('Фурма №16, м куб./час','light metallic',0,0.0,1250.0),
				indItemWithBounds('Фурма №17, м куб./час','red',0,0.0,1250.0),
				indItemWithBounds('Фурма №18, м куб./час','green',0,0.0,1250.0),
				indItemWithBounds('Фурма №19, м куб./час','blue',0,0.0,1250.0),
				indItemWithBounds('Фурма №20, м куб./час','orange',0,0.0,1250.0),
				indItemWithBounds('Фурма №20, м куб./час','brown',0,0.0,1250.0),
				indItemWithBoundsWithLinestyle('Фурма №1, положение ИМ, %','dark red',1,0.0,100.0,DashedLineStyle),
				indItemWithBoundsWithLinestyle('Фурма №2, положение ИМ, %','dark green',1,0.0,100.0,DashedLineStyle),
				indItemWithBoundsWithLinestyle('Фурма №3, положение ИМ, %','dark blue',1,0.0,100.0,DashedLineStyle),
				indItemWithBoundsWithLinestyle('Фурма №4, положение ИМ, %','dark orange',1,0.0,100.0,DashedLineStyle),
				indItemWithBoundsWithLinestyle('Фурма №5, положение ИМ, %','dark brown',1,0.0,100.0,DashedLineStyle),
				indItemWithBoundsWithLinestyle('Фурма №6, положение ИМ, %','dark purple',1,0.0,100.0,DashedLineStyle),
				indItemWithBoundsWithLinestyle('Фурма №7, положение ИМ, %','dark gray',1,0.0,100.0,DashedLineStyle),
				indItemWithBoundsWithLinestyle('Фурма №8, положение ИМ, %','dark metallic',1,0.0,100.0,DashedLineStyle),
				indItemWithBoundsWithLinestyle('Фурма №9, положение ИМ, %','light red',1,0.0,100.0,DashedLineStyle),
				indItemWithBoundsWithLinestyle('Фурма №10, положение ИМ, %','light green',1,0.0,100.0,DashedLineStyle),
				indItemWithBoundsWithLinestyle('Фурма №11, положение ИМ, %','light blue',1,0.0,100.0,DashedLineStyle),
				indItemWithBoundsWithLinestyle('Фурма №12, положение ИМ, %','light orange',1,0.0,100.0,DashedLineStyle),
				indItemWithBoundsWithLinestyle('Фурма №13, положение ИМ, %','light brown',1,0.0,100.0,DashedLineStyle),
				indItemWithBoundsWithLinestyle('Фурма №14, положение ИМ, %','light purple',1,0.0,100.0,DashedLineStyle),
				indItemWithBoundsWithLinestyle('Фурма №15, положение ИМ, %','light gray',1,0.0,100.0,DashedLineStyle),
				indItemWithBoundsWithLinestyle('Фурма №16, положение ИМ, %','light metallic',1,0.0,100.0,DashedLineStyle),
				indItemWithBoundsWithLinestyle('Фурма №17, положение ИМ, %','red',1,0.0,100.0,DashedLineStyle),
				indItemWithBoundsWithLinestyle('Фурма №18, положение ИМ, %','green',1,0.0,100.0,DashedLineStyle),
				indItemWithBoundsWithLinestyle('Фурма №19, положение ИМ, %','blue',1,0.0,100.0,DashedLineStyle),
				indItemWithBoundsWithLinestyle('Фурма №20, положение ИМ, %','orange',1,0.0,100.0,DashedLineStyle),
				indItemWithBoundsWithLinestyle('Фурма №20, положение ИМ, %','brown',1,0.0,100.0,DashedLineStyle)
			]
		);


		TrendsParams['PR_TRENDS']=trendsConfig(
			'Параметры пара',
			dbConfig(
				'energo',
				[
					'TPR',
					'PPR',
					'FPR',
					'TPR_HD',
					'PPR_HD',
					'FPR_HD',
					'FPR_PYL'
				]
			),
			[
				indItemWithBounds('Температура на печь, '+String.fromCharCode(176)+'С','dark red',0,0.0,375.0),
				indItemWithBounds('Давление на печь, кгс/см кв.','dark green',1,0.0,10.0),
				indItemWithBounds('Расход на печь, м куб./час','dark blue',2,0.0,20.0),
				indItemWithBounds('Температура в дутье, '+String.fromCharCode(176)+'С','dark orange',0,0.0,375.0),
				indItemWithBounds('Давление в дутье, кгс/см кв.','dark brown',1),
				indItemWithBounds('Расход в дутье, м куб./час','dark purple',2,0.0,20.0),
				indItemWithBounds('Расход на пылеуловитель, м куб./час','green',2,0.0,20.0)
			]
		);

		TrendsParams['PR_ZA_TRENDS']=trendsConfig(
			'Расход пара в засыпной аппарат',
			dbConfig(
				'energo',
				[
					'FPR_VMK',
					'FPR_NMK',
					'FPR_BK',
					'FPR_SK'
				]
			),
			[
				indItemWithBounds('ВМК, м куб./час','dark red',0,0.0,4.0),
				indItemWithBounds('НМК, м куб./час','dark green',0,0.0,4.0),
				indItemWithBounds('БК, м куб./час','dark blue',0,0.0,4.0),
				indItemWithBounds('Межштанговый зазор, м куб./час','dark orange',0,0.0,4.0)
			]
		);

		TrendsParams['VD_TRENDS']=trendsConfig(
			'Параметры воды в подающих водоводах',
			dbConfig(
				'energo',
				[
					'PVD_1',
					'PVD_2',
					'FVD_1',
					'FVD_2'
				]
			),
			[
				indItemWithBounds('Давление в водоводе I, кгс/см кв.','dark red',0,0.0,10.0),
				indItemWithBounds('Давление в водоводе II, кгс/см кв.','dark green',0,0.0,10.0),
				indItemWithBounds('Расход в водоводе I, м куб./час','dark blue',1,0.0,5000.0),
				indItemWithBounds('Расход в водоводе II, м куб./час','dark orange',1,0.0,5000.0)
			]
		);

		TrendsParams['VD_MASL_TRENDS']=trendsConfig(
			'Параметры воды на охлаждение масла гидравлики, пылеуловитель',
			dbConfig(
				'energo',
				[
					'PVD_MASL',
					'FVD_MASL'
				]
			),
			[
				indItemWithBounds('Давление, кгс/см кв.','dark red',0,0.0,20.0),
				indItemWithBounds('Расход, м куб./час','dark green',1,0.0,300.0)
			]
		);

		TrendsParams['VZ_TRENDS']=trendsConfig(
			'Параметры сжатого воздуха',
			dbConfig(
				'energo',
				[
					'TVZ',
					'PVZ',
					'FVZ',
					'FVZ_VKL',
					'PVZ_PKL'
				]
			),
			[
				indItemWithBounds('Температура на печь, град С.','dark red',0,0.0,75.0),
				indItemWithBounds('Давление на печь, кгс/см кв.','dark green',1,0.0,10.0),
				indItemWithBounds('Расход на печь, м куб./час','dark blue',2,0.0,5000.0),
				indItemWithBounds('Расход на выхлопные клапана, м куб./час','dark orange',2,0.0,5000.0),
				indItemWithBounds('Давление сжатого воздуха к пневмоклапанам, кгс/см кв.','dark brown',3,0.0,10.0)
			]
		);

		TrendsParams['O2_TRENDS']=trendsConfig(
			'Параметры кислорода на ремонтные нужды',
			dbConfig(
				'energo',
				[
					'TO2',
					'PO2',
					'FO2'
				]
			),
			[
				indItemWithBounds('Температура, град С.','dark red',0,0.0,50.0),
				indItemWithBounds('Давление, кгс/см кв.','dark green',1,0.0,25.0),
				indItemWithBounds('Расход, м куб./час','dark blue',2,0.0,150.0)
			]
		);

		TrendsParams['PG_TRENDS']=trendsConfig(
			'Параметры природного газа на собственные нужды',
			dbConfig(
				'energo',
				[
					'TPG_GEL',
					'PPG_GEL',
					'FPG_GEL'
				]
			),
			[
				indItemWithBounds('Температура, град С.','dark red',0,0.0,50.0),
				indItemWithBounds('Давление, кгс/см кв.','dark green',1,0.0,10.0),
				indItemWithBounds('Расход, м куб./час','dark blue',2,0.0,750.0)
			]
		);

		TrendsParams['DG_TRENDS']=trendsConfig(
			'Параметры доменного газа после газоочистки',
			dbConfig(
				'dg',
				[
					'TDG',
					'PDG',
					'FDG'
				]
			),
			[
				indItemWithBounds('Температура, град С.','dark red',0,0.0,600.0),
				indItemWithBounds('Давление, кгс/см м.','dark green',1,0.0,1600.0),
				indItemWithBounds('Расход, м куб./час','dark blue',2,0.0,320000.0)
			]
		);

		TrendsParams['TVD_PU3_PU2_TRENDS']=trendsConfig(
			'Температура, расход воды в трубопроводах охлаждения горна и лещади. ПУ-2, ПУ-3.',
			dbConfig(
				'tvd_pu3_pu2',
				[
					'TVD_3_29C',
					'TVD_3_25C',
					'TVD_3_21C',
					'TVD_3_7C',
					'TVD_3_2C',
					'TVD_2_23C',
					'TVD_2_17C',
					'TVD_2_12C',
					'TVD_2_9C',
					'TVD_2_8C',
					'TVD_2_18C',
					'TVD_2_25C',
					'TVD_2_3C',
					'TVD_3_29C_DELTA',
					'TVD_3_25C_DELTA',
					'TVD_3_21C_DELTA',
					'TVD_3_7C_DELTA',
					'TVD_3_2C_DELTA',
					'TVD_2_23C_DELTA',
					'TVD_2_17C_DELTA',
					'TVD_2_12C_DELTA',
					'TVD_2_9C_DELTA',
					'TVD_2_8C_DELTA',
					'TVD_2_18C_DELTA',
					'TVD_2_25C_DELTA',
					'TVD_2_3C_DELTA',
					'FVD_3_29C',
					'FVD_3_25C',
					'FVD_3_21C',
					'FVD_3_7C',
					'FVD_3_2C',
					'FVD_2_23C',
					'FVD_2_17C',
					'FVD_2_12C',
					'FVD_2_9C',
					'FVD_2_8C',
					'FVD_2_18C',
					'FVD_2_25C',
					'FVD_2_3C'
				]
			),
			[
				indItemSplittedWithBounds('3-29c, t, '+String.fromCharCode(176)+'C','dark red',0,'3-29c',10.0,30.0),
				indItemSplittedWithBounds('3-25c, t, '+String.fromCharCode(176)+'C','dark red',0,'3-25c',10.0,30.0),
				indItemSplittedWithBounds('3-21c, t, '+String.fromCharCode(176)+'C','dark red',0,'3-21c',10.0,30.0),
				indItemSplittedWithBounds('3-7c, t, '+String.fromCharCode(176)+'C','dark red',0,'3-7c',10.0,30.0),
				indItemSplittedWithBounds('3-2c, t, '+String.fromCharCode(176)+'C','dark red',0,'3-2c',10.0,30.0),
				indItemSplittedWithBounds('2-23c, t, '+String.fromCharCode(176)+'C','dark red',0,'2-23c',10.0,30.0),
				indItemSplittedWithBounds('2-17c, t, '+String.fromCharCode(176)+'C','dark red',0,'2-17c',10.0,30.0),
				indItemSplittedWithBounds('2-12c, t, '+String.fromCharCode(176)+'C','dark red',0,'2-12c',10.0,30.0),
				indItemSplittedWithBounds('2-9c, t, '+String.fromCharCode(176)+'C','dark red',0,'2-9c',10.0,30.0),
				indItemSplittedWithBounds('2-8c, t, '+String.fromCharCode(176)+'C','dark red',0,'2-8c',10.0,30.0),
				indItemSplittedWithBounds('2-18c, t, '+String.fromCharCode(176)+'C','dark red',0,'2-18c',10.0,30.0),
				indItemSplittedWithBounds('2-25c, t, '+String.fromCharCode(176)+'C','dark red',0,'2-25c',10.0,30.0),
				indItemSplittedWithBounds('2-3c, t, '+String.fromCharCode(176)+'C','dark red',0,'2-3c',10.0,30.0),
				indItemSplittedWithBounds('3-29c, dt, '+String.fromCharCode(176)+'C','dark green',1,'3-29c',0.0,10.0),
				indItemSplittedWithBounds('3-25c, dt, '+String.fromCharCode(176)+'C','dark green',1,'3-25c',0.0,10.0),
				indItemSplittedWithBounds('3-21c, dt, '+String.fromCharCode(176)+'C','dark green',1,'3-21c',0.0,10.0),
				indItemSplittedWithBounds('3-7c, dt, '+String.fromCharCode(176)+'C','dark green',1,'3-7c',0.0,10.0),
				indItemSplittedWithBounds('3-2c, dt, '+String.fromCharCode(176)+'C','dark green',1,'3-2c',0.0,10.0),
				indItemSplittedWithBounds('2-23c, dt, '+String.fromCharCode(176)+'C','dark green',1,'2-23c',0.0,10.0),
				indItemSplittedWithBounds('2-17c, dt, '+String.fromCharCode(176)+'C','dark green',1,'2-17c',0.0,10.0),
				indItemSplittedWithBounds('2-12c, dt, '+String.fromCharCode(176)+'C','dark green',1,'2-12c',0.0,10.0),
				indItemSplittedWithBounds('2-9c, dt, '+String.fromCharCode(176)+'C','dark green',1,'2-9c',0.0,10.0),
				indItemSplittedWithBounds('2-8c, dt, '+String.fromCharCode(176)+'C','dark green',1,'2-8c',0.0,10.0),
				indItemSplittedWithBounds('2-18c, dt, '+String.fromCharCode(176)+'C','dark green',1,'2-18c',0.0,10.0),
				indItemSplittedWithBounds('2-25c, dt, '+String.fromCharCode(176)+'C','dark green',1,'2-25c',0.0,10.0),
				indItemSplittedWithBounds('2-3c, dt, '+String.fromCharCode(176)+'C','dark green',1,'2-3c',0.0,10.0),
				indItemSplittedWithBounds('3-29c, f, м куб./час','dark blue',2,'3-29c',0.0,20.0),
				indItemSplittedWithBounds('3-25c, f, м куб./час','dark blue',2,'3-25c',0.0,20.0),
				indItemSplittedWithBounds('3-21c, f, м куб./час','dark blue',2,'3-21c',0.0,20.0),
				indItemSplittedWithBounds('3-7c, f, м куб./час','dark blue',2,'3-7c',0.0,20.0),
				indItemSplittedWithBounds('3-2c, f, м куб./час','dark blue',2,'3-2c',0.0,20.0),
				indItemSplittedWithBounds('2-23c, f, м куб./час','dark blue',2,'2-23c',0.0,20.0),
				indItemSplittedWithBounds('2-17c, f, м куб./час','dark blue',2,'2-17c',0.0,20.0),
				indItemSplittedWithBounds('2-12c, f, м куб./час','dark blue',2,'2-12c',0.0,20.0),
				indItemSplittedWithBounds('2-9c, f, м куб./час','dark blue',2,'2-9c',0.0,20.0),
				indItemSplittedWithBounds('2-8c, f, м куб./час','dark blue',2,'2-8c',0.0,20.0),
				indItemSplittedWithBounds('2-18c, f, м куб./час','dark blue',2,'2-18c',0.0,20.0),
				indItemSplittedWithBounds('2-25c, f, м куб./час','dark blue',2,'2-25c',0.0,20.0),
				indItemSplittedWithBounds('2-3c, f, м куб./час','dark blue',2,'2-3c',0.0,20.0)
			]
		);

		TrendsParams['TVD_PU1_PU6_TRENDS']=trendsConfig(
			'Температура, расход воды в трубопроводах охлаждения горна и лещади. ПУ-1, ПУ-6.',
			dbConfig(
				'tvd_pu1_pu6',
				[
					'TVD_1_27C',
					'TVD_1_23C',
					'TVD_1_19C',
					'TVD_1_16C',
					'TVD_6_10C',
					'TVD_6_7C',
					'TVD_6_4C',
					'TVD_6_1C',
					'TVD_1_27C_DELTA',
					'TVD_1_23C_DELTA',
					'TVD_1_19C_DELTA',
					'TVD_1_16C_DELTA',
					'TVD_6_10C_DELTA',
					'TVD_6_7C_DELTA',
					'TVD_6_4C_DELTA',
					'TVD_6_1C_DELTA',
					'FVD_1_27C',
					'FVD_1_23C',
					'FVD_1_19C',
					'FVD_1_16C',
					'FVD_6_10C',
					'FVD_6_7C',
					'FVD_6_4C',
					'FVD_6_1C'
				]
			),
			[
				indItemSplittedWithBounds('1-27c, t, '+String.fromCharCode(176)+'C','dark red',0,'1-27c',10.0,30.0),
				indItemSplittedWithBounds('1-23c, t, '+String.fromCharCode(176)+'C','dark red',0,'1-23c',10.0,30.0),
				indItemSplittedWithBounds('1-19c, t, '+String.fromCharCode(176)+'C','dark red',0,'1-19c',10.0,30.0),
				indItemSplittedWithBounds('1-16c, t, '+String.fromCharCode(176)+'C','dark red',0,'1-16c',10.0,30.0),
				indItemSplittedWithBounds('6-10c, t, '+String.fromCharCode(176)+'C','dark red',0,'6-10c',10.0,30.0),
				indItemSplittedWithBounds('6-7c, t, '+String.fromCharCode(176)+'C','dark red',0,'6-7c',10.0,30.0),
				indItemSplittedWithBounds('6-4c, t, '+String.fromCharCode(176)+'C','dark red',0,'6-4c',10.0,30.0),
				indItemSplittedWithBounds('6-1c, t, '+String.fromCharCode(176)+'C','dark red',0,'6-1c',10.0,30.0),
				indItemSplittedWithBounds('1-27c, dt, '+String.fromCharCode(176)+'C','dark green',1,'1-27c',0.0,10.0),
				indItemSplittedWithBounds('1-23c, dt, '+String.fromCharCode(176)+'C','dark green',1,'1-23c',0.0,10.0),
				indItemSplittedWithBounds('1-19c, dt, '+String.fromCharCode(176)+'C','dark green',1,'1-19c',0.0,10.0),
				indItemSplittedWithBounds('1-16c, dt, '+String.fromCharCode(176)+'C','dark green',1,'1-16c',0.0,10.0),
				indItemSplittedWithBounds('6-10c, dt, '+String.fromCharCode(176)+'C','dark green',1,'6-10c',0.0,10.0),
				indItemSplittedWithBounds('6-7c, dt, '+String.fromCharCode(176)+'C','dark green',1,'6-7c',0.0,10.0),
				indItemSplittedWithBounds('6-4c, dt, '+String.fromCharCode(176)+'C','dark green',1,'6-4c',0.0,10.0),
				indItemSplittedWithBounds('6-1c, dt, '+String.fromCharCode(176)+'C','dark green',1,'6-1c',0.0,10.0),
				indItemSplittedWithBounds('1-27c, f, м куб./час','dark blue',2,'1-27c',0.0,20.0),
				indItemSplittedWithBounds('1-23c, f, м куб./час','dark blue',2,'1-23c',0.0,20.0),
				indItemSplittedWithBounds('1-19c, f, м куб./час','dark blue',2,'1-19c',0.0,20.0),
				indItemSplittedWithBounds('1-16c, f, м куб./час','dark blue',2,'1-16c',0.0,20.0),
				indItemSplittedWithBounds('6-10c, f, м куб./час','dark blue',2,'6-10c',0.0,20.0),
				indItemSplittedWithBounds('6-7c, f, м куб./час','dark blue',2,'6-7c',0.0,20.0),
				indItemSplittedWithBounds('6-4c, f, м куб./час','dark blue',2,'6-4c',0.0,20.0),
				indItemSplittedWithBounds('6-1c, f, м куб./час','dark blue',2,'6-1c',0.0,20.0)
			]
		);


		TrendsParams['TVD_PU5_PU4_TRENDS']=trendsConfig(
			'Температура, расход воды в трубопроводах охлаждения горна и лещади. ПУ-4, ПУ-5.',
			dbConfig(
				'tvd_pu5_pu4',
				[
					'TVD_5_13C',
					'TVD_5_10C',
					'TVD_5_7C',
					'TVD_5_3C',
					'TVD_4_30C',
					'TVD_4_26C',
					'TVD_4_23C',
					'TVD_4_20C',
					'TVD_4_10C',
					'TVD_4_7C',
					'TVD_4_3C',
					'TVD_5_13C_DELTA',
					'TVD_5_10C_DELTA',
					'TVD_5_7C_DELTA',
					'TVD_5_3C_DELTA',
					'TVD_4_30C_DELTA',
					'TVD_4_26C_DELTA',
					'TVD_4_23C_DELTA',
					'TVD_4_20C_DELTA',
					'TVD_4_10C_DELTA',
					'TVD_4_7C_DELTA',
					'TVD_4_3C_DELTA',
					'FVD_5_13C',
					'FVD_5_10C',
					'FVD_5_7C',
					'FVD_5_3C',
					'FVD_4_30C',
					'FVD_4_26C',
					'FVD_4_23C',
					'FVD_4_20C',
					'FVD_4_10C',
					'FVD_4_7C',
					'FVD_4_3C'
				]
			),
			[
				indItemSplittedWithBounds('5-13c, t, '+String.fromCharCode(176)+'C','dark red',0,'5-13c',10.0,30.0),
				indItemSplittedWithBounds('5-10c, t, '+String.fromCharCode(176)+'C','dark red',0,'5-10c',10.0,30.0),
				indItemSplittedWithBounds('5-7c, t, '+String.fromCharCode(176)+'C','dark red',0,'5-7c',10.0,30.0),
				indItemSplittedWithBounds('5-3c, t, '+String.fromCharCode(176)+'C','dark red',0,'5-3c',10.0,30.0),
				indItemSplittedWithBounds('4-30c, t, '+String.fromCharCode(176)+'C','dark red',0,'4-30c',10.0,30.0),
				indItemSplittedWithBounds('4-26c, t, '+String.fromCharCode(176)+'C','dark red',0,'4-26c',10.0,30.0),
				indItemSplittedWithBounds('4-23c, t, '+String.fromCharCode(176)+'C','dark red',0,'4-23c',10.0,30.0),
				indItemSplittedWithBounds('4-20c, t, '+String.fromCharCode(176)+'C','dark red',0,'4-20c',10.0,30.0),
				indItemSplittedWithBounds('4-10c, t, '+String.fromCharCode(176)+'C','dark red',0,'4-10c',10.0,30.0),
				indItemSplittedWithBounds('4-7c, t, '+String.fromCharCode(176)+'C','dark red',0,'4-7c',10.0,30.0),
				indItemSplittedWithBounds('4-3c, t, '+String.fromCharCode(176)+'C','dark red',0,'4-3c',10.0,30.0),
				indItemSplittedWithBounds('5-13c, dt, '+String.fromCharCode(176)+'C','dark green',1,'5-13c',0.0,10.0),
				indItemSplittedWithBounds('5-10c, dt, '+String.fromCharCode(176)+'C','dark green',1,'5-10c',0.0,10.0),
				indItemSplittedWithBounds('5-7c, dt, '+String.fromCharCode(176)+'C','dark green',1,'5-7c',0.0,10.0),
				indItemSplittedWithBounds('5-3c, dt, '+String.fromCharCode(176)+'C','dark green',1,'5-3c',0.0,10.0),
				indItemSplittedWithBounds('4-30c, dt, '+String.fromCharCode(176)+'C','dark green',1,'4-30c',0.0,10.0),
				indItemSplittedWithBounds('4-26c, dt, '+String.fromCharCode(176)+'C','dark green',1,'4-26c',0.0,10.0),
				indItemSplittedWithBounds('4-23c, dt, '+String.fromCharCode(176)+'C','dark green',1,'4-23c',0.0,10.0),
				indItemSplittedWithBounds('4-20c, dt, '+String.fromCharCode(176)+'C','dark green',1,'4-20c',0.0,10.0),
				indItemSplittedWithBounds('4-10c, dt, '+String.fromCharCode(176)+'C','dark green',1,'4-10c',0.0,10.0),
				indItemSplittedWithBounds('4-7c, dt, '+String.fromCharCode(176)+'C','dark green',1,'4-7c',0.0,10.0),
				indItemSplittedWithBounds('4-3c, dt, '+String.fromCharCode(176)+'C','dark green',1,'4-3c',0.0,10.0),
				indItemSplittedWithBounds('5-13c, f, м куб./час','dark blue',2,'5-13c',0.0,20.0),
				indItemSplittedWithBounds('5-10c, f, м куб./час','dark blue',2,'5-10c',0.0,20.0),
				indItemSplittedWithBounds('5-7c, f, м куб./час','dark blue',2,'5-7c',0.0,20.0),
				indItemSplittedWithBounds('5-3c, f, м куб./час','dark blue',2,'5-3c',0.0,20.0),
				indItemSplittedWithBounds('4-30c, f, м куб./час','dark blue',2,'4-30c',0.0,20.0),
				indItemSplittedWithBounds('4-26c, f, м куб./час','dark blue',2,'4-26c',0.0,20.0),
				indItemSplittedWithBounds('4-23c, f, м куб./час','dark blue',2,'4-23c',0.0,20.0),
				indItemSplittedWithBounds('4-20c, f, м куб./час','dark blue',2,'4-20c',0.0,20.0),
				indItemSplittedWithBounds('4-10c, f, м куб./час','dark blue',2,'4-10c',0.0,20.0),
				indItemSplittedWithBounds('4-7c, f, м куб./час','dark blue',2,'4-7c',0.0,20.0),
				indItemSplittedWithBounds('4-3c, f, м куб./час','dark blue',2,'4-3c',0.0,20.0)
			]
		);

		TrendsParams['TVD_FURM_TRENDS']=trendsConfig(
			'Температура воды в трубопроводах охлаждения фурменной зоны. Давление-разрежение контроля прогара фурм.',
			dbConfig(
				'tvd_furm',
				[
					'TVD_1_8C',
					'TVD_1_9C',
					'TVD_1_10C',
					'TVD_1_11C',
					'TVD_1_14C',
					'TVD_2_28C',
					'TVD_2_29C',
					'TVD_3_16C',
					'TVD_3_17C',
					'TVD_3_18C',
					'TVD_4_16C',
					'TVD_4_17C',
					'TVD_4_18C',
					'TVD_5_16C',
					'TVD_5_17C',
					'TVD_5_18C',
					'TVD_5_19C',
					'TVD_5_24C',
					'TVD_5_25C',
					'TVD_5_26C',
					'TVD_1_8C_DELTA',
					'TVD_1_9C_DELTA',
					'TVD_1_10C_DELTA',
					'TVD_1_11C_DELTA',
					'TVD_1_14C_DELTA',
					'TVD_2_28C_DELTA',
					'TVD_2_29C_DELTA',
					'TVD_3_16C_DELTA',
					'TVD_3_17C_DELTA',
					'TVD_3_18C_DELTA',
					'TVD_4_16C_DELTA',
					'TVD_4_17C_DELTA',
					'TVD_4_18C_DELTA',
					'TVD_5_16C_DELTA',
					'TVD_5_17C_DELTA',
					'TVD_5_18C_DELTA',
					'TVD_5_19C_DELTA',
					'TVD_5_24C_DELTA',
					'TVD_5_25C_DELTA',
					'TVD_5_26C_DELTA',
					'PVD_7_6C',
					'PVD_7_8C',
					'PVD_7_10C',
					'PVD_7_12C',
					'PVD_8_4C',
					'PVD_8_8C',
					'PVD_8_12C',
					'PVD_8_16C',
					'PVD_8_20C',
					'PVD_9_4C',
					'PVD_9_8C',
					'PVD_9_12C',
					'PVD_9_16C',
					'PVD_9_20C',
					'PVD_10_4C',
					'PVD_10_8C',
					'PVD_10_18C',
					'PVD_10_20C',
					'PVD_10_22C',
					'PVD_7_3C'
				]
			),
			[
				indItemSplittedWithBounds('1-8c, t, '+String.fromCharCode(176)+'C','dark red',0,'Фурма 1',10.0,30.0),
				indItemSplittedWithBounds('1-9c, t, '+String.fromCharCode(176)+'C','dark red',0,'Фурма 2',10.0,30.0),
				indItemSplittedWithBounds('1-10c, t, '+String.fromCharCode(176)+'C','dark red',0,'Фурма 3',10.0,30.0),
				indItemSplittedWithBounds('1-11c, t, '+String.fromCharCode(176)+'C','dark red',0,'Фурма 4',10.0,30.0),
				indItemSplittedWithBounds('1-14c, t, '+String.fromCharCode(176)+'C','dark red',0,'Фурма 5',10.0,30.0),
				indItemSplittedWithBounds('2-28c, t, '+String.fromCharCode(176)+'C','dark red',0,'Фурма 6',10.0,30.0),
				indItemSplittedWithBounds('2-29c, t, '+String.fromCharCode(176)+'C','dark red',0,'Фурма 7',10.0,30.0),
				indItemSplittedWithBounds('3-16c, t, '+String.fromCharCode(176)+'C','dark red',0,'Фурма 8',10.0,30.0),
				indItemSplittedWithBounds('3-17c, t, '+String.fromCharCode(176)+'C','dark red',0,'Фурма 9',10.0,30.0),
				indItemSplittedWithBounds('3-18c, t, '+String.fromCharCode(176)+'C','dark red',0,'Фурма 10',10.0,30.0),
				indItemSplittedWithBounds('4-16c, t, '+String.fromCharCode(176)+'C','dark red',0,'Фурма 11',10.0,30.0),
				indItemSplittedWithBounds('4-17c, t, '+String.fromCharCode(176)+'C','dark red',0,'Фурма 12',10.0,30.0),
				indItemSplittedWithBounds('4-18c, t, '+String.fromCharCode(176)+'C','dark red',0,'Фурма 13',10.0,30.0),
				indItemSplittedWithBounds('5-16c, t, '+String.fromCharCode(176)+'C','dark red',0,'Фурма 14',10.0,30.0),
				indItemSplittedWithBounds('5-17c, t, '+String.fromCharCode(176)+'C','dark red',0,'Фурма 16',10.0,30.0),
				indItemSplittedWithBounds('5-18c, t, '+String.fromCharCode(176)+'C','dark red',0,'Фурма 15',10.0,30.0),
				indItemSplittedWithBounds('5-19c, t, '+String.fromCharCode(176)+'C','dark red',0,'Фурма 17',10.0,30.0),
				indItemSplittedWithBounds('5-24c, t, '+String.fromCharCode(176)+'C','dark red',0,'Фурма 18',10.0,30.0),
				indItemSplittedWithBounds('5-25c, t, '+String.fromCharCode(176)+'C','dark red',0,'Фурма 19',10.0,30.0),
				indItemSplittedWithBounds('5-26c, t, '+String.fromCharCode(176)+'C','dark red',0,'Фурма 20',10.0,30.0),
				indItemSplittedWithBounds('1-8c, dt, '+String.fromCharCode(176)+'C','dark green',1,'Фурма 1',0.0,10.0),
				indItemSplittedWithBounds('1-9c, dt, '+String.fromCharCode(176)+'C','dark green',1,'Фурма 2',0.0,10.0),
				indItemSplittedWithBounds('1-10c, dt, '+String.fromCharCode(176)+'C','dark green',1,'Фурма 3',0.0,10.0),
				indItemSplittedWithBounds('1-11c, dt, '+String.fromCharCode(176)+'C','dark green',1,'Фурма 4',0.0,10.0),
				indItemSplittedWithBounds('1-14c, dt, '+String.fromCharCode(176)+'C','dark green',1,'Фурма 5',0.0,10.0),
				indItemSplittedWithBounds('2-28c, dt, '+String.fromCharCode(176)+'C','dark green',1,'Фурма 6',0.0,10.0),
				indItemSplittedWithBounds('2-29c, dt, '+String.fromCharCode(176)+'C','dark green',1,'Фурма 7',0.0,10.0),
				indItemSplittedWithBounds('3-16c, dt, '+String.fromCharCode(176)+'C','dark green',1,'Фурма 8',0.0,10.0),
				indItemSplittedWithBounds('3-17c, dt, '+String.fromCharCode(176)+'C','dark green',1,'Фурма 9',0.0,10.0),
				indItemSplittedWithBounds('3-18c, dt, '+String.fromCharCode(176)+'C','dark green',1,'Фурма 10',0.0,10.0),
				indItemSplittedWithBounds('4-16c, dt, '+String.fromCharCode(176)+'C','dark green',1,'Фурма 11',0.0,10.0),
				indItemSplittedWithBounds('4-17c, dt, '+String.fromCharCode(176)+'C','dark green',1,'Фурма 12',0.0,10.0),
				indItemSplittedWithBounds('4-18c, dt, '+String.fromCharCode(176)+'C','dark green',1,'Фурма 13',0.0,10.0),
				indItemSplittedWithBounds('5-16c, dt, '+String.fromCharCode(176)+'C','dark green',1,'Фурма 14',0.0,10.0),
				indItemSplittedWithBounds('5-17c, dt, '+String.fromCharCode(176)+'C','dark green',1,'Фурма 16',0.0,10.0),
				indItemSplittedWithBounds('5-18c, dt, '+String.fromCharCode(176)+'C','dark green',1,'Фурма 15',0.0,10.0),
				indItemSplittedWithBounds('5-19c, dt, '+String.fromCharCode(176)+'C','dark green',1,'Фурма 17',0.0,10.0),
				indItemSplittedWithBounds('5-24c, dt, '+String.fromCharCode(176)+'C','dark green',1,'Фурма 18',0.0,10.0),
				indItemSplittedWithBounds('5-25c, dt, '+String.fromCharCode(176)+'C','dark green',1,'Фурма 19',0.0,10.0),
				indItemSplittedWithBounds('5-26c, dt, '+String.fromCharCode(176)+'C','dark green',1,'Фурма 20',0.0,10.0),
				indItemSplittedWithBounds('7-6c, P, кгс/см кв.','dark blue',2,'Фурма 1',-0.015,0.015),
				indItemSplittedWithBounds('7-8c, P, кгс/см кв.','dark blue',2,'Фурма 2',-0.015,0.015),
				indItemSplittedWithBounds('7-10c, P, кгс/см кв.','dark blue',2,'Фурма 3',-0.015,0.015),
				indItemSplittedWithBounds('7-12c, P, кгс/см кв.','dark blue',2,'Фурма 4',-0.015,0.015),
				indItemSplittedWithBounds('8-4c, P, кгс/см кв.','dark blue',2,'Фурма 5',-0.015,0.015),
				indItemSplittedWithBounds('8-8c, P, кгс/см кв.','dark blue',2,'Фурма 6',-0.015,0.015),
				indItemSplittedWithBounds('8-12c, P, кгс/см кв.','dark blue',2,'Фурма 7',-0.015,0.015),
				indItemSplittedWithBounds('8-16c, P, кгс/см кв.','dark blue',2,'Фурма 8',-0.015,0.015),
				indItemSplittedWithBounds('8-20c, P, кгс/см кв.','dark blue',2,'Фурма 9',-0.015,0.015),
				indItemSplittedWithBounds('9-4c, P, кгс/см кв.','dark blue',2,'Фурма 10',-0.015,0.015),
				indItemSplittedWithBounds('9-8c, P, кгс/см кв.','dark blue',2,'Фурма 11',-0.015,0.015),
				indItemSplittedWithBounds('9-12c, P, кгс/см кв.','dark blue',2,'Фурма 12',-0.015,0.015),
				indItemSplittedWithBounds('9-16c, P, кгс/см кв.','dark blue',2,'Фурма 13',-0.015,0.015),
				indItemSplittedWithBounds('9-20c, P, кгс/см кв.','dark blue',2,'Фурма 14',-0.015,0.015),
				indItemSplittedWithBounds('10-4c, P, кгс/см кв.','dark blue',2,'Фурма 15',-0.015,0.015),
				indItemSplittedWithBounds('10-8c, P, кгс/см кв.','dark blue',2,'Фурма 16',-0.015,0.015),
				indItemSplittedWithBounds('10-18c, P, кгс/см кв.','dark blue',2,'Фурма 17',-0.015,0.015),
				indItemSplittedWithBounds('10-20c, P, кгс/см кв.','dark blue',2,'Фурма 18',-0.015,0.015),
				indItemSplittedWithBounds('10-22c, P, кгс/см кв.','dark blue',2,'Фурма 19',-0.015,0.015),
				indItemSplittedWithBounds('7-3c, P, кгс/см кв.','dark blue',2,'Фурма 20',-0.015,0.015)
			]
		);

		TrendsParams['TVD_BOT_TRENDS']=trendsConfig(
			'Температура, расход воды в трубопроводах охлаждения донышка.',
			dbConfig(
				'tvd_bot',
				[
					'TVD_4_13C',
					'TVD_4_14C',
					'TVD_4_15C',
					'TVD_6_20C',
					'TVD_6_21C',
					'TVD_6_22C',
					'TVD_6_23C',
					'TVD_6_24C',
					'TVD_6_25C',
					'TVD_6_26C',
					'TVD_4_13C_DELTA',
					'TVD_4_14C_DELTA',
					'TVD_4_15C_DELTA',
					'TVD_6_20C_DELTA',
					'TVD_6_21C_DELTA',
					'TVD_6_22C_DELTA',
					'TVD_6_23C_DELTA',
					'TVD_6_24C_DELTA',
					'TVD_6_25C_DELTA',
					'TVD_6_26C_DELTA',
					'FVD_4_13C',
					'FVD_4_14C',
					'FVD_4_15C',
					'FVD_6_20C',
					'FVD_6_21C',
					'FVD_6_22C',
					'FVD_6_23C',
					'FVD_6_24C',
					'FVD_6_25C',
					'FVD_6_26C'
				]
			),
			[
				indItemSplittedWithBounds('4-13c, t, '+String.fromCharCode(176)+'C','dark red',0,'4-13c',10.0,30.0),
				indItemSplittedWithBounds('4-14c, t, '+String.fromCharCode(176)+'C','dark red',0,'4-14c',10.0,30.0),
				indItemSplittedWithBounds('4-15c, t, '+String.fromCharCode(176)+'C','dark red',0,'4-15c',10.0,30.0),
				indItemSplittedWithBounds('6-20c, t, '+String.fromCharCode(176)+'C','dark red',0,'6-20c',10.0,30.0),
				indItemSplittedWithBounds('6-21c, t, '+String.fromCharCode(176)+'C','dark red',0,'6-21c',10.0,30.0),
				indItemSplittedWithBounds('6-22c, t, '+String.fromCharCode(176)+'C','dark red',0,'6-22c',10.0,30.0),
				indItemSplittedWithBounds('6-23c, t, '+String.fromCharCode(176)+'C','dark red',0,'6-23c',10.0,30.0),
				indItemSplittedWithBounds('6-24c, t, '+String.fromCharCode(176)+'C','dark red',0,'6-24c',10.0,30.0),
				indItemSplittedWithBounds('6-25c, t, '+String.fromCharCode(176)+'C','dark red',0,'6-25c',10.0,30.0),
				indItemSplittedWithBounds('6-26c, t, '+String.fromCharCode(176)+'C','dark red',0,'6-26c',10.0,30.0),
				indItemSplittedWithBounds('4-13c, dt, '+String.fromCharCode(176)+'C','dark green',1,'4-13c',0.0,10.0),
				indItemSplittedWithBounds('4-14c, dt, '+String.fromCharCode(176)+'C','dark green',1,'4-14c',0.0,10.0),
				indItemSplittedWithBounds('4-15c, dt, '+String.fromCharCode(176)+'C','dark green',1,'4-15c',0.0,10.0),
				indItemSplittedWithBounds('6-20c, dt, '+String.fromCharCode(176)+'C','dark green',1,'6-20c',0.0,10.0),
				indItemSplittedWithBounds('6-21c, dt, '+String.fromCharCode(176)+'C','dark green',1,'6-21c',0.0,10.0),
				indItemSplittedWithBounds('6-22c, dt, '+String.fromCharCode(176)+'C','dark green',1,'6-22c',0.0,10.0),
				indItemSplittedWithBounds('6-23c, dt, '+String.fromCharCode(176)+'C','dark green',1,'6-23c',0.0,10.0),
				indItemSplittedWithBounds('6-24c, dt, '+String.fromCharCode(176)+'C','dark green',1,'6-24c',0.0,10.0),
				indItemSplittedWithBounds('6-25c, dt, '+String.fromCharCode(176)+'C','dark green',1,'6-25c',0.0,10.0),
				indItemSplittedWithBounds('6-26c, dt, '+String.fromCharCode(176)+'C','dark green',1,'6-26c',0.0,10.0),
				indItemSplittedWithBounds('4-13c, f, м куб./час','dark blue',2,'4-13c',0.0,20.0),
				indItemSplittedWithBounds('4-14c, f, м куб./час','dark blue',2,'4-14c',0.0,20.0),
				indItemSplittedWithBounds('4-15c, f, м куб./час','dark blue',2,'4-15c',0.0,20.0),
				indItemSplittedWithBounds('6-20c, f, м куб./час','dark blue',2,'6-20c',0.0,20.0),
				indItemSplittedWithBounds('6-21c, f, м куб./час','dark blue',2,'6-21c',0.0,20.0),
				indItemSplittedWithBounds('6-22c, f, м куб./час','dark blue',2,'6-22c',0.0,20.0),
				indItemSplittedWithBounds('6-23c, f, м куб./час','dark blue',2,'6-23c',0.0,20.0),
				indItemSplittedWithBounds('6-24c, f, м куб./час','dark blue',2,'6-24c',0.0,20.0),
				indItemSplittedWithBounds('6-25c, f, м куб./час','dark blue',2,'6-25c',0.0,20.0),
				indItemSplittedWithBounds('6-26c, f, м куб./час','dark blue',2,'6-26c',0.0,20.0)
			]
		);

		TrendsParams['TVD_TAP_TRENDS']=trendsConfig(
			'Температура, расход воды в трубопроводах охлаждения холодильников чугунных леток.',
			dbConfig(
				'tvd_tap',
				[
					'TVD_1_1C',
					'TVD_1_2C',
					'TVD_1_5C',
					'TVD_1_12C',
					'TVD_1_13C',
					'TVD_5_20C',
					'TVD_5_21C',
					'TVD_5_22C',
					'TVD_5_23C',
					'TVD_5_28C',
					'TVD_5_29C',
					'TVD_5_30C',
					'TVD_6_27C',
					'TVD_6_28C',
					'TVD_6_29C',
					'TVD_6_30C',
					'TVD_1_1C_DELTA',
					'TVD_1_2C_DELTA',
					'TVD_1_5C_DELTA',
					'TVD_1_12C_DELTA',
					'TVD_1_13C_DELTA',
					'TVD_5_20C_DELTA',
					'TVD_5_21C_DELTA',
					'TVD_5_22C_DELTA',
					'TVD_5_23C_DELTA',
					'TVD_5_28C_DELTA',
					'TVD_5_29C_DELTA',
					'TVD_5_30C_DELTA',
					'TVD_6_27C_DELTA',
					'TVD_6_28C_DELTA',
					'TVD_6_29C_DELTA',
					'TVD_6_30C_DELTA',
					'FVD_1_1C',
					'FVD_1_2C',
					'FVD_1_5C',
					'FVD_1_12C',
					'FVD_1_13C',
					'FVD_5_20C',
					'FVD_5_21C',
					'FVD_5_22C',
					'FVD_5_23C',
					'FVD_5_28C',
					'FVD_5_29C',
					'FVD_5_30C',
					'FVD_6_28C',
					'FVD_6_29C',
					'FVD_6_30C'
				]
			),
			[
				indItemSplittedWithBounds('1-1c, t, '+String.fromCharCode(176)+'C','dark red',0,'1-1c',10.0,30.0),
				indItemSplittedWithBounds('1-2c, t, '+String.fromCharCode(176)+'C','dark red',0,'1-2c',10.0,30.0),
				indItemSplittedWithBounds('1-5c, t, '+String.fromCharCode(176)+'C','dark red',0,'1-5c',10.0,30.0),
				indItemSplittedWithBounds('1-12c, t, '+String.fromCharCode(176)+'C','dark red',0,'1-12c',10.0,30.0),
				indItemSplittedWithBounds('1-13c, t, '+String.fromCharCode(176)+'C','dark red',0,'1-13c',10.0,30.0),
				indItemSplittedWithBounds('5-20c, t, '+String.fromCharCode(176)+'C','dark red',0,'5-20c',10.0,30.0),
				indItemSplittedWithBounds('5-21c, t, '+String.fromCharCode(176)+'C','dark red',0,'5-21c',10.0,30.0),
				indItemSplittedWithBounds('5-22c, t, '+String.fromCharCode(176)+'C','dark red',0,'5-22c',10.0,30.0),
				indItemSplittedWithBounds('5-23c, t, '+String.fromCharCode(176)+'C','dark red',0,'5-23c',10.0,30.0),
				indItemSplittedWithBounds('5-28c, t, '+String.fromCharCode(176)+'C','dark red',0,'5-28c',10.0,30.0),
				indItemSplittedWithBounds('5-29c, t, '+String.fromCharCode(176)+'C','dark red',0,'5-29c',10.0,30.0),
				indItemSplittedWithBounds('5-30c, t, '+String.fromCharCode(176)+'C','dark red',0,'5-30c',10.0,30.0),
				indItemSplittedWithBounds('6-27c, t, '+String.fromCharCode(176)+'C','dark red',0,'6-27c',10.0,30.0),
				indItemSplittedWithBounds('6-28c, t, '+String.fromCharCode(176)+'C','dark red',0,'6-28c',10.0,30.0),
				indItemSplittedWithBounds('6-29c, t, '+String.fromCharCode(176)+'C','dark red',0,'6-29c',10.0,30.0),
				indItemSplittedWithBounds('6-30c, t, '+String.fromCharCode(176)+'C','dark red',0,'6-30c',10.0,30.0),
				indItemSplittedWithBounds('1-1c, dt, '+String.fromCharCode(176)+'C','dark green',1,'1-1c',0.0,10.0),
				indItemSplittedWithBounds('1-2c, dt, '+String.fromCharCode(176)+'C','dark green',1,'1-2c',0.0,10.0),
				indItemSplittedWithBounds('1-5c, dt, '+String.fromCharCode(176)+'C','dark green',1,'1-5c',0.0,10.0),
				indItemSplittedWithBounds('1-12c, dt, '+String.fromCharCode(176)+'C','dark green',1,'1-12c',0.0,10.0),
				indItemSplittedWithBounds('1-13c, dt, '+String.fromCharCode(176)+'C','dark green',1,'1-13c',0.0,10.0),
				indItemSplittedWithBounds('5-20c, dt, '+String.fromCharCode(176)+'C','dark green',1,'5-20c',0.0,10.0),
				indItemSplittedWithBounds('5-21c, dt, '+String.fromCharCode(176)+'C','dark green',1,'5-21c',0.0,10.0),
				indItemSplittedWithBounds('5-22c, dt, '+String.fromCharCode(176)+'C','dark green',1,'5-22c',0.0,10.0),
				indItemSplittedWithBounds('5-23c, dt, '+String.fromCharCode(176)+'C','dark green',1,'5-23c',0.0,10.0),
				indItemSplittedWithBounds('5-28c, dt, '+String.fromCharCode(176)+'C','dark green',1,'5-28c',0.0,10.0),
				indItemSplittedWithBounds('5-29c, dt, '+String.fromCharCode(176)+'C','dark green',1,'5-29c',0.0,10.0),
				indItemSplittedWithBounds('5-30c, dt, '+String.fromCharCode(176)+'C','dark green',1,'5-30c',0.0,10.0),
				indItemSplittedWithBounds('6-27c, dt, '+String.fromCharCode(176)+'C','dark green',1,'6-27c',0.0,10.0),
				indItemSplittedWithBounds('6-28c, dt, '+String.fromCharCode(176)+'C','dark green',1,'6-28c',0.0,10.0),
				indItemSplittedWithBounds('6-29c, dt, '+String.fromCharCode(176)+'C','dark green',1,'6-29c',0.0,10.0),
				indItemSplittedWithBounds('6-30c, dt, '+String.fromCharCode(176)+'C','dark green',1,'6-30c',0.0,10.0),
				indItemSplittedWithBounds('1-1c, f, м куб./час','dark blue',2,'1-1c',0.0,20.0),
				indItemSplittedWithBounds('1-2c, f, м куб./час','dark blue',2,'1-2c',0.0,20.0),
				indItemSplittedWithBounds('1-5c, f, м куб./час','dark blue',2,'1-5c',0.0,20.0),
				indItemSplittedWithBounds('1-12c, f, м куб./час','dark blue',2,'1-12c',0.0,20.0),
				indItemSplittedWithBounds('1-13c, f, м куб./час','dark blue',2,'1-13c',0.0,20.0),
				indItemSplittedWithBounds('5-20c, f, м куб./час','dark blue',2,'5-20c',0.0,20.0),
				indItemSplittedWithBounds('5-21c, f, м куб./час','dark blue',2,'5-21c',0.0,20.0),
				indItemSplittedWithBounds('5-22c, f, м куб./час','dark blue',2,'5-22c',0.0,20.0),
				indItemSplittedWithBounds('5-23c, f, м куб./час','dark blue',2,'5-23c',0.0,20.0),
				indItemSplittedWithBounds('5-28c, f, м куб./час','dark blue',2,'5-28c',0.0,20.0),
				indItemSplittedWithBounds('5-29c, f, м куб./час','dark blue',2,'5-29c',0.0,20.0),
				indItemSplittedWithBounds('5-30c, f, м куб./час','dark blue',2,'5-30c',0.0,20.0),
				indItemSplittedWithBounds('6-28c, f, м куб./час','dark blue',2,'6-28c',0.0,20.0),
				indItemSplittedWithBounds('6-29c, f, м куб./час','dark blue',2,'6-29c',0.0,20.0),
				indItemSplittedWithBounds('6-30c, f, м куб./час','dark blue',2,'6-30c',0.0,20.0)
			]
		);

		TrendsParams['TVD_HORN_V_N_TRENDS']=trendsConfig(
			'Температура технической воды в перемычках повязки холодильных плит. Горн верхний ряд - нижний ряд.',
			dbConfig(
				'tvd_horn_v_n',
				[
					'TVD_HORN_V_N_XP_3',
					'TVD_HORN_V_N_XP_4',
					'TVD_HORN_V_N_XP_5',
					'TVD_HORN_V_N_XP_6',
					'TVD_HORN_V_N_XP_7',
					'TVD_HORN_V_N_XP_8',
					'TVD_HORN_V_N_XP_9',
					'TVD_HORN_V_N_XP_10',
					'TVD_HORN_V_N_XP_11',
					'TVD_HORN_V_N_XP_12',
					'TVD_HORN_V_N_XP_13',
					'TVD_HORN_V_N_XP_14',
					'TVD_HORN_V_N_XP_15',
					'TVD_HORN_V_N_XP_16',
					'TVD_HORN_V_N_XP_17',
					'TVD_HORN_V_N_XP_18',
					'TVD_HORN_V_N_XP_19',
					'TVD_HORN_V_N_XP_20',
					'TVD_HORN_V_N_XP_21',
					'TVD_HORN_V_N_XP_22',
					'TVD_HORN_V_N_XP_23',
					'TVD_HORN_V_N_XP_24',
					'TVD_HORN_V_N_XP_25',
					'TVD_HORN_V_N_XP_26',
					'TVD_HORN_V_N_XP_27',
					'TVD_HORN_V_N_XP_3_DELTA',
					'TVD_HORN_V_N_XP_4_DELTA',
					'TVD_HORN_V_N_XP_5_DELTA',
					'TVD_HORN_V_N_XP_6_DELTA',
					'TVD_HORN_V_N_XP_7_DELTA',
					'TVD_HORN_V_N_XP_8_DELTA',
					'TVD_HORN_V_N_XP_9_DELTA',
					'TVD_HORN_V_N_XP_10_DELTA',
					'TVD_HORN_V_N_XP_11_DELTA',
					'TVD_HORN_V_N_XP_12_DELTA',
					'TVD_HORN_V_N_XP_13_DELTA',
					'TVD_HORN_V_N_XP_14_DELTA',
					'TVD_HORN_V_N_XP_15_DELTA',
					'TVD_HORN_V_N_XP_16_DELTA',
					'TVD_HORN_V_N_XP_17_DELTA',
					'TVD_HORN_V_N_XP_18_DELTA',
					'TVD_HORN_V_N_XP_19_DELTA',
					'TVD_HORN_V_N_XP_20_DELTA',
					'TVD_HORN_V_N_XP_21_DELTA',
					'TVD_HORN_V_N_XP_22_DELTA',
					'TVD_HORN_V_N_XP_23_DELTA',
					'TVD_HORN_V_N_XP_24_DELTA',
					'TVD_HORN_V_N_XP_25_DELTA',
					'TVD_HORN_V_N_XP_26_DELTA',
					'TVD_HORN_V_N_XP_27_DELTA'
				]
			),
			[
				indItemSplittedWithBounds('ХП3, t, '+String.fromCharCode(176)+'C','dark red',0,'ХП3',10.0,30.0),
				indItemSplittedWithBounds('ХП4, t, '+String.fromCharCode(176)+'C','dark red',0,'ХП4',10.0,30.0),
				indItemSplittedWithBounds('ХП5, t, '+String.fromCharCode(176)+'C','dark red',0,'ХП5',10.0,30.0),
				indItemSplittedWithBounds('ХП6, t, '+String.fromCharCode(176)+'C','dark red',0,'ХП6',10.0,30.0),
				indItemSplittedWithBounds('ХП7, t, '+String.fromCharCode(176)+'C','dark red',0,'ХП7',10.0,30.0),
				indItemSplittedWithBounds('ХП8, t, '+String.fromCharCode(176)+'C','dark red',0,'ХП8',10.0,30.0),
				indItemSplittedWithBounds('ХП9, t, '+String.fromCharCode(176)+'C','dark red',0,'ХП9',10.0,30.0),
				indItemSplittedWithBounds('ХП10, t, '+String.fromCharCode(176)+'C','dark red',0,'ХП10',10.0,30.0),
				indItemSplittedWithBounds('ХП11, t, '+String.fromCharCode(176)+'C','dark red',0,'ХП11',10.0,30.0),
				indItemSplittedWithBounds('ХП12, t, '+String.fromCharCode(176)+'C','dark red',0,'ХП12',10.0,30.0),
				indItemSplittedWithBounds('ХП13, t, '+String.fromCharCode(176)+'C','dark red',0,'ХП13',10.0,30.0),
				indItemSplittedWithBounds('ХП14, t, '+String.fromCharCode(176)+'C','dark red',0,'ХП14',10.0,30.0),
				indItemSplittedWithBounds('ХП15, t, '+String.fromCharCode(176)+'C','dark red',0,'ХП15',10.0,30.0),
				indItemSplittedWithBounds('ХП16, t, '+String.fromCharCode(176)+'C','dark red',0,'ХП16',10.0,30.0),
				indItemSplittedWithBounds('ХП17, t, '+String.fromCharCode(176)+'C','dark red',0,'ХП17',10.0,30.0),
				indItemSplittedWithBounds('ХП18, t, '+String.fromCharCode(176)+'C','dark red',0,'ХП18',10.0,30.0),
				indItemSplittedWithBounds('ХП19, t, '+String.fromCharCode(176)+'C','dark red',0,'ХП19',10.0,30.0),
				indItemSplittedWithBounds('ХП20, t, '+String.fromCharCode(176)+'C','dark red',0,'ХП20',10.0,30.0),
				indItemSplittedWithBounds('ХП21, t, '+String.fromCharCode(176)+'C','dark red',0,'ХП21',10.0,30.0),
				indItemSplittedWithBounds('ХП22, t, '+String.fromCharCode(176)+'C','dark red',0,'ХП22',10.0,30.0),
				indItemSplittedWithBounds('ХП23, t, '+String.fromCharCode(176)+'C','dark red',0,'ХП23',10.0,30.0),
				indItemSplittedWithBounds('ХП24, t, '+String.fromCharCode(176)+'C','dark red',0,'ХП24',10.0,30.0),
				indItemSplittedWithBounds('ХП25, t, '+String.fromCharCode(176)+'C','dark red',0,'ХП25',10.0,30.0),
				indItemSplittedWithBounds('ХП26, t, '+String.fromCharCode(176)+'C','dark red',0,'ХП26',10.0,30.0),
				indItemSplittedWithBounds('ХП27, t, '+String.fromCharCode(176)+'C','dark red',0,'ХП27',10.0,30.0),
				indItemSplittedWithBounds('ХП3, dt, '+String.fromCharCode(176)+'C','dark green',1,'ХП3',0.0,10.0),
				indItemSplittedWithBounds('ХП4, dt, '+String.fromCharCode(176)+'C','dark green',1,'ХП4',0.0,10.0),
				indItemSplittedWithBounds('ХП5, dt, '+String.fromCharCode(176)+'C','dark green',1,'ХП5',0.0,10.0),
				indItemSplittedWithBounds('ХП6, dt, '+String.fromCharCode(176)+'C','dark green',1,'ХП6',0.0,10.0),
				indItemSplittedWithBounds('ХП7, dt, '+String.fromCharCode(176)+'C','dark green',1,'ХП7',0.0,10.0),
				indItemSplittedWithBounds('ХП8, dt, '+String.fromCharCode(176)+'C','dark green',1,'ХП8',0.0,10.0),
				indItemSplittedWithBounds('ХП9, dt, '+String.fromCharCode(176)+'C','dark green',1,'ХП9',0.0,10.0),
				indItemSplittedWithBounds('ХП10, dt, '+String.fromCharCode(176)+'C','dark green',1,'ХП10',0.0,10.0),
				indItemSplittedWithBounds('ХП11, dt, '+String.fromCharCode(176)+'C','dark green',1,'ХП11',0.0,10.0),
				indItemSplittedWithBounds('ХП12, dt, '+String.fromCharCode(176)+'C','dark green',1,'ХП12',0.0,10.0),
				indItemSplittedWithBounds('ХП13, dt, '+String.fromCharCode(176)+'C','dark green',1,'ХП13',0.0,10.0),
				indItemSplittedWithBounds('ХП14, dt, '+String.fromCharCode(176)+'C','dark green',1,'ХП14',0.0,10.0),
				indItemSplittedWithBounds('ХП15, dt, '+String.fromCharCode(176)+'C','dark green',1,'ХП15',0.0,10.0),
				indItemSplittedWithBounds('ХП16, dt, '+String.fromCharCode(176)+'C','dark green',1,'ХП16',0.0,10.0),
				indItemSplittedWithBounds('ХП17, dt, '+String.fromCharCode(176)+'C','dark green',1,'ХП17',0.0,10.0),
				indItemSplittedWithBounds('ХП18, dt, '+String.fromCharCode(176)+'C','dark green',1,'ХП18',0.0,10.0),
				indItemSplittedWithBounds('ХП19, dt, '+String.fromCharCode(176)+'C','dark green',1,'ХП19',0.0,10.0),
				indItemSplittedWithBounds('ХП20, dt, '+String.fromCharCode(176)+'C','dark green',1,'ХП20',0.0,10.0),
				indItemSplittedWithBounds('ХП21, dt, '+String.fromCharCode(176)+'C','dark green',1,'ХП21',0.0,10.0),
				indItemSplittedWithBounds('ХП22, dt, '+String.fromCharCode(176)+'C','dark green',1,'ХП22',0.0,10.0),
				indItemSplittedWithBounds('ХП23, dt, '+String.fromCharCode(176)+'C','dark green',1,'ХП23',0.0,10.0),
				indItemSplittedWithBounds('ХП24, dt, '+String.fromCharCode(176)+'C','dark green',1,'ХП24',0.0,10.0),
				indItemSplittedWithBounds('ХП25, dt, '+String.fromCharCode(176)+'C','dark green',1,'ХП25',0.0,10.0),
				indItemSplittedWithBounds('ХП26, dt, '+String.fromCharCode(176)+'C','dark green',1,'ХП26',0.0,10.0),
				indItemSplittedWithBounds('ХП27, dt, '+String.fromCharCode(176)+'C','dark green',1,'ХП27',0.0,10.0)
			]
		);

		TrendsParams['TVD_HORN_N_LESH_V_TRENDS']=trendsConfig(
			'Температура технической воды в перемычках повязки холодильных плит. Горн нижний ряд - верхняя лещадь.',
			dbConfig(
				'tvd_horn_n_lesh_v',
				[
					'TVD_HORN_N_LESH_V_XP_3',
					'TVD_HORN_N_LESH_V_XP_4',
					'TVD_HORN_N_LESH_V_XP_5',
					'TVD_HORN_N_LESH_V_XP_6',
					'TVD_HORN_N_LESH_V_XP_7',
					'TVD_HORN_N_LESH_V_XP_8',
					'TVD_HORN_N_LESH_V_XP_9',
					'TVD_HORN_N_LESH_V_XP_10',
					'TVD_HORN_N_LESH_V_XP_11',
					'TVD_HORN_N_LESH_V_XP_12',
					'TVD_HORN_N_LESH_V_XP_13',
					'TVD_HORN_N_LESH_V_XP_14',
					'TVD_HORN_N_LESH_V_XP_15',
					'TVD_HORN_N_LESH_V_XP_16',
					'TVD_HORN_N_LESH_V_XP_17',
					'TVD_HORN_N_LESH_V_XP_18',
					'TVD_HORN_N_LESH_V_XP_19',
					'TVD_HORN_N_LESH_V_XP_20',
					'TVD_HORN_N_LESH_V_XP_21',
					'TVD_HORN_N_LESH_V_XP_22',
					'TVD_HORN_N_LESH_V_XP_23',
					'TVD_HORN_N_LESH_V_XP_24',
					'TVD_HORN_N_LESH_V_XP_25',
					'TVD_HORN_N_LESH_V_XP_26',
					'TVD_HORN_N_LESH_V_XP_27',
					'TVD_HORN_N_LESH_V_XP_3_DELTA',
					'TVD_HORN_N_LESH_V_XP_4_DELTA',
					'TVD_HORN_N_LESH_V_XP_5_DELTA',
					'TVD_HORN_N_LESH_V_XP_6_DELTA',
					'TVD_HORN_N_LESH_V_XP_7_DELTA',
					'TVD_HORN_N_LESH_V_XP_8_DELTA',
					'TVD_HORN_N_LESH_V_XP_9_DELTA',
					'TVD_HORN_N_LESH_V_XP_10_DELTA',
					'TVD_HORN_N_LESH_V_XP_11_DELTA',
					'TVD_HORN_N_LESH_V_XP_12_DELTA',
					'TVD_HORN_N_LESH_V_XP_13_DELTA',
					'TVD_HORN_N_LESH_V_XP_14_DELTA',
					'TVD_HORN_N_LESH_V_XP_15_DELTA',
					'TVD_HORN_N_LESH_V_XP_16_DELTA',
					'TVD_HORN_N_LESH_V_XP_17_DELTA',
					'TVD_HORN_N_LESH_V_XP_18_DELTA',
					'TVD_HORN_N_LESH_V_XP_19_DELTA',
					'TVD_HORN_N_LESH_V_XP_20_DELTA',
					'TVD_HORN_N_LESH_V_XP_21_DELTA',
					'TVD_HORN_N_LESH_V_XP_22_DELTA',
					'TVD_HORN_N_LESH_V_XP_23_DELTA',
					'TVD_HORN_N_LESH_V_XP_24_DELTA',
					'TVD_HORN_N_LESH_V_XP_25_DELTA',
					'TVD_HORN_N_LESH_V_XP_26_DELTA',
					'TVD_HORN_N_LESH_V_XP_27_DELTA'
				]
			),
			[
				indItemSplittedWithBounds('ХП3, t, '+String.fromCharCode(176)+'C','dark red',0,'ХП3',10.0,30.0),
				indItemSplittedWithBounds('ХП4, t, '+String.fromCharCode(176)+'C','dark red',0,'ХП4',10.0,30.0),
				indItemSplittedWithBounds('ХП5, t, '+String.fromCharCode(176)+'C','dark red',0,'ХП5',10.0,30.0),
				indItemSplittedWithBounds('ХП6, t, '+String.fromCharCode(176)+'C','dark red',0,'ХП6',10.0,30.0),
				indItemSplittedWithBounds('ХП7, t, '+String.fromCharCode(176)+'C','dark red',0,'ХП7',10.0,30.0),
				indItemSplittedWithBounds('ХП8, t, '+String.fromCharCode(176)+'C','dark red',0,'ХП8',10.0,30.0),
				indItemSplittedWithBounds('ХП9, t, '+String.fromCharCode(176)+'C','dark red',0,'ХП9',10.0,30.0),
				indItemSplittedWithBounds('ХП10, t, '+String.fromCharCode(176)+'C','dark red',0,'ХП10',10.0,30.0),
				indItemSplittedWithBounds('ХП11, t, '+String.fromCharCode(176)+'C','dark red',0,'ХП11',10.0,30.0),
				indItemSplittedWithBounds('ХП12, t, '+String.fromCharCode(176)+'C','dark red',0,'ХП12',10.0,30.0),
				indItemSplittedWithBounds('ХП13, t, '+String.fromCharCode(176)+'C','dark red',0,'ХП13',10.0,30.0),
				indItemSplittedWithBounds('ХП14, t, '+String.fromCharCode(176)+'C','dark red',0,'ХП14',10.0,30.0),
				indItemSplittedWithBounds('ХП15, t, '+String.fromCharCode(176)+'C','dark red',0,'ХП15',10.0,30.0),
				indItemSplittedWithBounds('ХП16, t, '+String.fromCharCode(176)+'C','dark red',0,'ХП16',10.0,30.0),
				indItemSplittedWithBounds('ХП17, t, '+String.fromCharCode(176)+'C','dark red',0,'ХП17',10.0,30.0),
				indItemSplittedWithBounds('ХП18, t, '+String.fromCharCode(176)+'C','dark red',0,'ХП18',10.0,30.0),
				indItemSplittedWithBounds('ХП19, t, '+String.fromCharCode(176)+'C','dark red',0,'ХП19',10.0,30.0),
				indItemSplittedWithBounds('ХП20, t, '+String.fromCharCode(176)+'C','dark red',0,'ХП20',10.0,30.0),
				indItemSplittedWithBounds('ХП21, t, '+String.fromCharCode(176)+'C','dark red',0,'ХП21',10.0,30.0),
				indItemSplittedWithBounds('ХП22, t, '+String.fromCharCode(176)+'C','dark red',0,'ХП22',10.0,30.0),
				indItemSplittedWithBounds('ХП23, t, '+String.fromCharCode(176)+'C','dark red',0,'ХП23',10.0,30.0),
				indItemSplittedWithBounds('ХП24, t, '+String.fromCharCode(176)+'C','dark red',0,'ХП24',10.0,30.0),
				indItemSplittedWithBounds('ХП25, t, '+String.fromCharCode(176)+'C','dark red',0,'ХП25',10.0,30.0),
				indItemSplittedWithBounds('ХП26, t, '+String.fromCharCode(176)+'C','dark red',0,'ХП26',10.0,30.0),
				indItemSplittedWithBounds('ХП27, t, '+String.fromCharCode(176)+'C','dark red',0,'ХП27',10.0,30.0),
				indItemSplittedWithBounds('ХП3, dt, '+String.fromCharCode(176)+'C','dark green',1,'ХП3',0.0,10.0),
				indItemSplittedWithBounds('ХП4, dt, '+String.fromCharCode(176)+'C','dark green',1,'ХП4',0.0,10.0),
				indItemSplittedWithBounds('ХП5, dt, '+String.fromCharCode(176)+'C','dark green',1,'ХП5',0.0,10.0),
				indItemSplittedWithBounds('ХП6, dt, '+String.fromCharCode(176)+'C','dark green',1,'ХП6',0.0,10.0),
				indItemSplittedWithBounds('ХП7, dt, '+String.fromCharCode(176)+'C','dark green',1,'ХП7',0.0,10.0),
				indItemSplittedWithBounds('ХП8, dt, '+String.fromCharCode(176)+'C','dark green',1,'ХП8',0.0,10.0),
				indItemSplittedWithBounds('ХП9, dt, '+String.fromCharCode(176)+'C','dark green',1,'ХП9',0.0,10.0),
				indItemSplittedWithBounds('ХП10, dt, '+String.fromCharCode(176)+'C','dark green',1,'ХП10',0.0,10.0),
				indItemSplittedWithBounds('ХП11, dt, '+String.fromCharCode(176)+'C','dark green',1,'ХП11',0.0,10.0),
				indItemSplittedWithBounds('ХП12, dt, '+String.fromCharCode(176)+'C','dark green',1,'ХП12',0.0,10.0),
				indItemSplittedWithBounds('ХП13, dt, '+String.fromCharCode(176)+'C','dark green',1,'ХП13',0.0,10.0),
				indItemSplittedWithBounds('ХП14, dt, '+String.fromCharCode(176)+'C','dark green',1,'ХП14',0.0,10.0),
				indItemSplittedWithBounds('ХП15, dt, '+String.fromCharCode(176)+'C','dark green',1,'ХП15',0.0,10.0),
				indItemSplittedWithBounds('ХП16, dt, '+String.fromCharCode(176)+'C','dark green',1,'ХП16',0.0,10.0),
				indItemSplittedWithBounds('ХП17, dt, '+String.fromCharCode(176)+'C','dark green',1,'ХП17',0.0,10.0),
				indItemSplittedWithBounds('ХП18, dt, '+String.fromCharCode(176)+'C','dark green',1,'ХП18',0.0,10.0),
				indItemSplittedWithBounds('ХП19, dt, '+String.fromCharCode(176)+'C','dark green',1,'ХП19',0.0,10.0),
				indItemSplittedWithBounds('ХП20, dt, '+String.fromCharCode(176)+'C','dark green',1,'ХП20',0.0,10.0),
				indItemSplittedWithBounds('ХП21, dt, '+String.fromCharCode(176)+'C','dark green',1,'ХП21',0.0,10.0),
				indItemSplittedWithBounds('ХП22, dt, '+String.fromCharCode(176)+'C','dark green',1,'ХП22',0.0,10.0),
				indItemSplittedWithBounds('ХП23, dt, '+String.fromCharCode(176)+'C','dark green',1,'ХП23',0.0,10.0),
				indItemSplittedWithBounds('ХП24, dt, '+String.fromCharCode(176)+'C','dark green',1,'ХП24',0.0,10.0),
				indItemSplittedWithBounds('ХП25, dt, '+String.fromCharCode(176)+'C','dark green',1,'ХП25',0.0,10.0),
				indItemSplittedWithBounds('ХП26, dt, '+String.fromCharCode(176)+'C','dark green',1,'ХП26',0.0,10.0),
				indItemSplittedWithBounds('ХП27, dt, '+String.fromCharCode(176)+'C','dark green',1,'ХП27',0.0,10.0)
			]
		);

		TrendsParams['TVD_LESH_V_N_TRENDS']=trendsConfig(
			'Температура технической воды в перемычках повязки холодильных плит. Верхняя лещадь - нижняя лещадь.',
			dbConfig(
				'tvd_lesh_v_n',
				[
					'TVD_LESH_V_N_XP_3',
					'TVD_LESH_V_N_XP_4',
					'TVD_LESH_V_N_XP_5',
					'TVD_LESH_V_N_XP_6',
					'TVD_LESH_V_N_XP_7',
					'TVD_LESH_V_N_XP_8',
					'TVD_LESH_V_N_XP_9',
					'TVD_LESH_V_N_XP_10',
					'TVD_LESH_V_N_XP_11',
					'TVD_LESH_V_N_XP_12',
					'TVD_LESH_V_N_XP_13',
					'TVD_LESH_V_N_XP_14',
					'TVD_LESH_V_N_XP_15',
					'TVD_LESH_V_N_XP_16',
					'TVD_LESH_V_N_XP_17',
					'TVD_LESH_V_N_XP_18',
					'TVD_LESH_V_N_XP_19',
					'TVD_LESH_V_N_XP_20',
					'TVD_LESH_V_N_XP_21',
					'TVD_LESH_V_N_XP_22',
					'TVD_LESH_V_N_XP_23',
					'TVD_LESH_V_N_XP_24',
					'TVD_LESH_V_N_XP_25',
					'TVD_LESH_V_N_XP_26',
					'TVD_LESH_V_N_XP_27',
					'TVD_LESH_V_N_XP_3_DELTA',
					'TVD_LESH_V_N_XP_4_DELTA',
					'TVD_LESH_V_N_XP_5_DELTA',
					'TVD_LESH_V_N_XP_6_DELTA',
					'TVD_LESH_V_N_XP_7_DELTA',
					'TVD_LESH_V_N_XP_8_DELTA',
					'TVD_LESH_V_N_XP_9_DELTA',
					'TVD_LESH_V_N_XP_10_DELTA',
					'TVD_LESH_V_N_XP_11_DELTA',
					'TVD_LESH_V_N_XP_12_DELTA',
					'TVD_LESH_V_N_XP_13_DELTA',
					'TVD_LESH_V_N_XP_14_DELTA',
					'TVD_LESH_V_N_XP_15_DELTA',
					'TVD_LESH_V_N_XP_16_DELTA',
					'TVD_LESH_V_N_XP_17_DELTA',
					'TVD_LESH_V_N_XP_18_DELTA',
					'TVD_LESH_V_N_XP_19_DELTA',
					'TVD_LESH_V_N_XP_20_DELTA',
					'TVD_LESH_V_N_XP_21_DELTA',
					'TVD_LESH_V_N_XP_22_DELTA',
					'TVD_LESH_V_N_XP_23_DELTA',
					'TVD_LESH_V_N_XP_24_DELTA',
					'TVD_LESH_V_N_XP_25_DELTA',
					'TVD_LESH_V_N_XP_26_DELTA',
					'TVD_LESH_V_N_XP_27_DELTA'
				]
			),
			[
				indItemSplittedWithBounds('ХП3, t, '+String.fromCharCode(176)+'C','dark red',0,'ХП3',10.0,30.0),
				indItemSplittedWithBounds('ХП4, t, '+String.fromCharCode(176)+'C','dark red',0,'ХП4',10.0,30.0),
				indItemSplittedWithBounds('ХП5, t, '+String.fromCharCode(176)+'C','dark red',0,'ХП5',10.0,30.0),
				indItemSplittedWithBounds('ХП6, t, '+String.fromCharCode(176)+'C','dark red',0,'ХП6',10.0,30.0),
				indItemSplittedWithBounds('ХП7, t, '+String.fromCharCode(176)+'C','dark red',0,'ХП7',10.0,30.0),
				indItemSplittedWithBounds('ХП8, t, '+String.fromCharCode(176)+'C','dark red',0,'ХП8',10.0,30.0),
				indItemSplittedWithBounds('ХП9, t, '+String.fromCharCode(176)+'C','dark red',0,'ХП9',10.0,30.0),
				indItemSplittedWithBounds('ХП10, t, '+String.fromCharCode(176)+'C','dark red',0,'ХП10',10.0,30.0),
				indItemSplittedWithBounds('ХП11, t, '+String.fromCharCode(176)+'C','dark red',0,'ХП11',10.0,30.0),
				indItemSplittedWithBounds('ХП12, t, '+String.fromCharCode(176)+'C','dark red',0,'ХП12',10.0,30.0),
				indItemSplittedWithBounds('ХП13, t, '+String.fromCharCode(176)+'C','dark red',0,'ХП13',10.0,30.0),
				indItemSplittedWithBounds('ХП14, t, '+String.fromCharCode(176)+'C','dark red',0,'ХП14',10.0,30.0),
				indItemSplittedWithBounds('ХП15, t, '+String.fromCharCode(176)+'C','dark red',0,'ХП15',10.0,30.0),
				indItemSplittedWithBounds('ХП16, t, '+String.fromCharCode(176)+'C','dark red',0,'ХП16',10.0,30.0),
				indItemSplittedWithBounds('ХП17, t, '+String.fromCharCode(176)+'C','dark red',0,'ХП17',10.0,30.0),
				indItemSplittedWithBounds('ХП18, t, '+String.fromCharCode(176)+'C','dark red',0,'ХП18',10.0,30.0),
				indItemSplittedWithBounds('ХП19, t, '+String.fromCharCode(176)+'C','dark red',0,'ХП19',10.0,30.0),
				indItemSplittedWithBounds('ХП20, t, '+String.fromCharCode(176)+'C','dark red',0,'ХП20',10.0,30.0),
				indItemSplittedWithBounds('ХП21, t, '+String.fromCharCode(176)+'C','dark red',0,'ХП21',10.0,30.0),
				indItemSplittedWithBounds('ХП22, t, '+String.fromCharCode(176)+'C','dark red',0,'ХП22',10.0,30.0),
				indItemSplittedWithBounds('ХП23, t, '+String.fromCharCode(176)+'C','dark red',0,'ХП23',10.0,30.0),
				indItemSplittedWithBounds('ХП24, t, '+String.fromCharCode(176)+'C','dark red',0,'ХП24',10.0,30.0),
				indItemSplittedWithBounds('ХП25, t, '+String.fromCharCode(176)+'C','dark red',0,'ХП25',10.0,30.0),
				indItemSplittedWithBounds('ХП26, t, '+String.fromCharCode(176)+'C','dark red',0,'ХП26',10.0,30.0),
				indItemSplittedWithBounds('ХП27, t, '+String.fromCharCode(176)+'C','dark red',0,'ХП27',10.0,30.0),
				indItemSplittedWithBounds('ХП3, dt, '+String.fromCharCode(176)+'C','dark green',1,'ХП3',0.0,10.0),
				indItemSplittedWithBounds('ХП4, dt, '+String.fromCharCode(176)+'C','dark green',1,'ХП4',0.0,10.0),
				indItemSplittedWithBounds('ХП5, dt, '+String.fromCharCode(176)+'C','dark green',1,'ХП5',0.0,10.0),
				indItemSplittedWithBounds('ХП6, dt, '+String.fromCharCode(176)+'C','dark green',1,'ХП6',0.0,10.0),
				indItemSplittedWithBounds('ХП7, dt, '+String.fromCharCode(176)+'C','dark green',1,'ХП7',0.0,10.0),
				indItemSplittedWithBounds('ХП8, dt, '+String.fromCharCode(176)+'C','dark green',1,'ХП8',0.0,10.0),
				indItemSplittedWithBounds('ХП9, dt, '+String.fromCharCode(176)+'C','dark green',1,'ХП9',0.0,10.0),
				indItemSplittedWithBounds('ХП10, dt, '+String.fromCharCode(176)+'C','dark green',1,'ХП10',0.0,10.0),
				indItemSplittedWithBounds('ХП11, dt, '+String.fromCharCode(176)+'C','dark green',1,'ХП11',0.0,10.0),
				indItemSplittedWithBounds('ХП12, dt, '+String.fromCharCode(176)+'C','dark green',1,'ХП12',0.0,10.0),
				indItemSplittedWithBounds('ХП13, dt, '+String.fromCharCode(176)+'C','dark green',1,'ХП13',0.0,10.0),
				indItemSplittedWithBounds('ХП14, dt, '+String.fromCharCode(176)+'C','dark green',1,'ХП14',0.0,10.0),
				indItemSplittedWithBounds('ХП15, dt, '+String.fromCharCode(176)+'C','dark green',1,'ХП15',0.0,10.0),
				indItemSplittedWithBounds('ХП16, dt, '+String.fromCharCode(176)+'C','dark green',1,'ХП16',0.0,10.0),
				indItemSplittedWithBounds('ХП17, dt, '+String.fromCharCode(176)+'C','dark green',1,'ХП17',0.0,10.0),
				indItemSplittedWithBounds('ХП18, dt, '+String.fromCharCode(176)+'C','dark green',1,'ХП18',0.0,10.0),
				indItemSplittedWithBounds('ХП19, dt, '+String.fromCharCode(176)+'C','dark green',1,'ХП19',0.0,10.0),
				indItemSplittedWithBounds('ХП20, dt, '+String.fromCharCode(176)+'C','dark green',1,'ХП20',0.0,10.0),
				indItemSplittedWithBounds('ХП21, dt, '+String.fromCharCode(176)+'C','dark green',1,'ХП21',0.0,10.0),
				indItemSplittedWithBounds('ХП22, dt, '+String.fromCharCode(176)+'C','dark green',1,'ХП22',0.0,10.0),
				indItemSplittedWithBounds('ХП23, dt, '+String.fromCharCode(176)+'C','dark green',1,'ХП23',0.0,10.0),
				indItemSplittedWithBounds('ХП24, dt, '+String.fromCharCode(176)+'C','dark green',1,'ХП24',0.0,10.0),
				indItemSplittedWithBounds('ХП25, dt, '+String.fromCharCode(176)+'C','dark green',1,'ХП25',0.0,10.0),
				indItemSplittedWithBounds('ХП26, dt, '+String.fromCharCode(176)+'C','dark green',1,'ХП26',0.0,10.0),
				indItemSplittedWithBounds('ХП27, dt, '+String.fromCharCode(176)+'C','dark green',1,'ХП27',0.0,10.0)
			]
		);

		TrendsParams['MM1_ICP_CHANNEL_VALUES_1_TRENDS']=trendsConfig(
			'Мост-мультиплексор ММ.1, порт 1, температура компенсации холодного спая',
			dbConfig(
				'MM1_ICP_CHANNEL_VALUES_1',
				[
					'MM1_ICP_CHANNEL_VALUE_1_1_9',
					'MM1_ICP_CHANNEL_VALUE_1_2_9',
					'MM1_ICP_CHANNEL_VALUE_1_3_9',
					'MM1_ICP_CHANNEL_VALUE_1_4_9',
					'MM1_ICP_CHANNEL_VALUE_1_5_9',
					'MM1_ICP_CHANNEL_VALUE_1_6_9',
					'MM1_ICP_CHANNEL_VALUE_1_7_9',
					'MM1_ICP_CHANNEL_VALUE_1_8_9',
					'MM1_ICP_CHANNEL_VALUE_1_9_9'
				]
			),
			[
				indItemSplittedWithBounds('ММ.1, порт 1, модуль 1, температура CJC '+String.fromCharCode(176)+'C','dark red',0,'ICP1.1.1',-40.0,70.0),
				indItemSplittedWithBounds('ММ.1, порт 1, модуль 2, температура CJC '+String.fromCharCode(176)+'C','dark red',0,'ICP1.1.2',-40.0,70.0),
				indItemSplittedWithBounds('ММ.1, порт 1, модуль 3, температура CJC '+String.fromCharCode(176)+'C','dark red',0,'ICP1.1.3',-40.0,70.0),
				indItemSplittedWithBounds('ММ.1, порт 1, модуль 4, температура CJC '+String.fromCharCode(176)+'C','dark red',0,'ICP1.1.4',-40.0,70.0),
				indItemSplittedWithBounds('ММ.1, порт 1, модуль 5, температура CJC '+String.fromCharCode(176)+'C','dark red',0,'ICP1.1.5',-40.0,70.0),
				indItemSplittedWithBounds('ММ.1, порт 1, модуль 6, температура CJC '+String.fromCharCode(176)+'C','dark red',0,'ICP1.1.6',-40.0,70.0),
				indItemSplittedWithBounds('ММ.1, порт 1, модуль 7, температура CJC '+String.fromCharCode(176)+'C','dark red',0,'ICP1.1.7',-40.0,70.0),
				indItemSplittedWithBounds('ММ.1, порт 1, модуль 8, температура CJC '+String.fromCharCode(176)+'C','dark red',0,'ICP1.1.8',-40.0,70.0),
				indItemSplittedWithBounds('ММ.1, порт 1, модуль 9, температура CJC '+String.fromCharCode(176)+'C','dark red',0,'ICP1.1.9',-40.0,70.0)
			]
		);

		TrendsParams['MM1_ICP_CHANNEL_VALUES_2_TRENDS']=trendsConfig(
			'Мост-мультиплексор ММ.1, порт 2, температура компенсации холодного спая',
			dbConfig(
				'MM1_ICP_CHANNEL_VALUES_2',
				[
					'MM1_ICP_CHANNEL_VALUE_2_1_9',
					'MM1_ICP_CHANNEL_VALUE_2_2_9',
					'MM1_ICP_CHANNEL_VALUE_2_3_9',
					'MM1_ICP_CHANNEL_VALUE_2_4_9',
					'MM1_ICP_CHANNEL_VALUE_2_5_9',
					'MM1_ICP_CHANNEL_VALUE_2_6_9',
					'MM1_ICP_CHANNEL_VALUE_2_7_9',
					'MM1_ICP_CHANNEL_VALUE_2_8_9',
					'MM1_ICP_CHANNEL_VALUE_2_9_9'
				]
			),
			[
				indItemSplittedWithBounds('ММ.1, порт 2, модуль 1, температура CJC '+String.fromCharCode(176)+'C','dark red',0,'ICP1.2.1',-40.0,70.0),
				indItemSplittedWithBounds('ММ.1, порт 2, модуль 2, температура CJC '+String.fromCharCode(176)+'C','dark red',0,'ICP1.2.2',-40.0,70.0),
				indItemSplittedWithBounds('ММ.1, порт 2, модуль 3, температура CJC '+String.fromCharCode(176)+'C','dark red',0,'ICP1.2.3',-40.0,70.0),
				indItemSplittedWithBounds('ММ.1, порт 2, модуль 4, температура CJC '+String.fromCharCode(176)+'C','dark red',0,'ICP1.2.4',-40.0,70.0),
				indItemSplittedWithBounds('ММ.1, порт 2, модуль 5, температура CJC '+String.fromCharCode(176)+'C','dark red',0,'ICP1.2.5',-40.0,70.0),
				indItemSplittedWithBounds('ММ.1, порт 2, модуль 6, температура CJC '+String.fromCharCode(176)+'C','dark red',0,'ICP1.2.6',-40.0,70.0),
				indItemSplittedWithBounds('ММ.1, порт 2, модуль 7, температура CJC '+String.fromCharCode(176)+'C','dark red',0,'ICP1.2.7',-40.0,70.0),
				indItemSplittedWithBounds('ММ.1, порт 2, модуль 8, температура CJC '+String.fromCharCode(176)+'C','dark red',0,'ICP1.2.8',-40.0,70.0),
				indItemSplittedWithBounds('ММ.1, порт 2, модуль 9, температура CJC '+String.fromCharCode(176)+'C','dark red',0,'ICP1.2.9',-40.0,70.0)
			]
		);

		TrendsParams['MM1_ICP_CHANNEL_VALUES_3_TRENDS']=trendsConfig(
			'Мост-мультиплексор ММ.1, порт 3, температура компенсации холодного спая',
			dbConfig(
				'MM1_ICP_CHANNEL_VALUES_3',
				[
					'MM1_ICP_CHANNEL_VALUE_3_1_9',
					'MM1_ICP_CHANNEL_VALUE_3_2_9',
					'MM1_ICP_CHANNEL_VALUE_3_3_9',
					'MM1_ICP_CHANNEL_VALUE_3_4_9',
					'MM1_ICP_CHANNEL_VALUE_3_5_9',
					'MM1_ICP_CHANNEL_VALUE_3_6_9',
					'MM1_ICP_CHANNEL_VALUE_3_7_9',
					'MM1_ICP_CHANNEL_VALUE_3_8_9',
					'MM1_ICP_CHANNEL_VALUE_3_9_9'
				]
			),
			[
				indItemSplittedWithBounds('ММ.1, порт 3, модуль 1, температура CJC '+String.fromCharCode(176)+'C','dark red',0,'ICP1.3.1',-40.0,70.0),
				indItemSplittedWithBounds('ММ.1, порт 3, модуль 2, температура CJC '+String.fromCharCode(176)+'C','dark red',0,'ICP1.3.2',-40.0,70.0),
				indItemSplittedWithBounds('ММ.1, порт 3, модуль 3, температура CJC '+String.fromCharCode(176)+'C','dark red',0,'ICP1.3.3',-40.0,70.0),
				indItemSplittedWithBounds('ММ.1, порт 3, модуль 4, температура CJC '+String.fromCharCode(176)+'C','dark red',0,'ICP1.3.4',-40.0,70.0),
				indItemSplittedWithBounds('ММ.1, порт 3, модуль 5, температура CJC '+String.fromCharCode(176)+'C','dark red',0,'ICP1.3.5',-40.0,70.0),
				indItemSplittedWithBounds('ММ.1, порт 3, модуль 6, температура CJC '+String.fromCharCode(176)+'C','dark red',0,'ICP1.3.6',-40.0,70.0),
				indItemSplittedWithBounds('ММ.1, порт 3, модуль 7, температура CJC '+String.fromCharCode(176)+'C','dark red',0,'ICP1.3.7',-40.0,70.0),
				indItemSplittedWithBounds('ММ.1, порт 3, модуль 8, температура CJC '+String.fromCharCode(176)+'C','dark red',0,'ICP1.3.8',-40.0,70.0),
				indItemSplittedWithBounds('ММ.1, порт 3, модуль 9, температура CJC '+String.fromCharCode(176)+'C','dark red',0,'ICP1.3.9',-40.0,70.0)
			]
		);

		TrendsParams['MM1_ICP_CHANNEL_VALUES_4_TRENDS']=trendsConfig(
			'Мост-мультиплексор ММ.1, порт 4, температура компенсации холодного спая',
			dbConfig(
				'MM1_ICP_CHANNEL_VALUES_4',
				[
					'MM1_ICP_CHANNEL_VALUE_4_1_9',
					'MM1_ICP_CHANNEL_VALUE_4_2_9',
					'MM1_ICP_CHANNEL_VALUE_4_3_9',
					'MM1_ICP_CHANNEL_VALUE_4_4_9',
					'MM1_ICP_CHANNEL_VALUE_4_5_9',
					'MM1_ICP_CHANNEL_VALUE_4_6_9',
					'MM1_ICP_CHANNEL_VALUE_4_7_9',
					'MM1_ICP_CHANNEL_VALUE_4_8_9',
					'MM1_ICP_CHANNEL_VALUE_4_9_9'
				]
			),
			[
				indItemSplittedWithBounds('ММ.1, порт 4, модуль 1, температура CJC '+String.fromCharCode(176)+'C','dark red',0,'ICP1.4.1',-40.0,70.0),
				indItemSplittedWithBounds('ММ.1, порт 4, модуль 2, температура CJC '+String.fromCharCode(176)+'C','dark red',0,'ICP1.4.2',-40.0,70.0),
				indItemSplittedWithBounds('ММ.1, порт 4, модуль 3, температура CJC '+String.fromCharCode(176)+'C','dark red',0,'ICP1.4.3',-40.0,70.0),
				indItemSplittedWithBounds('ММ.1, порт 4, модуль 4, температура CJC '+String.fromCharCode(176)+'C','dark red',0,'ICP1.4.4',-40.0,70.0),
				indItemSplittedWithBounds('ММ.1, порт 4, модуль 5, температура CJC '+String.fromCharCode(176)+'C','dark red',0,'ICP1.4.5',-40.0,70.0),
				indItemSplittedWithBounds('ММ.1, порт 4, модуль 6, температура CJC '+String.fromCharCode(176)+'C','dark red',0,'ICP1.4.6',-40.0,70.0),
				indItemSplittedWithBounds('ММ.1, порт 4, модуль 7, температура CJC '+String.fromCharCode(176)+'C','dark red',0,'ICP1.4.7',-40.0,70.0),
				indItemSplittedWithBounds('ММ.1, порт 4, модуль 8, температура CJC '+String.fromCharCode(176)+'C','dark red',0,'ICP1.4.8',-40.0,70.0),
				indItemSplittedWithBounds('ММ.1, порт 4, модуль 9, температура CJC '+String.fromCharCode(176)+'C','dark red',0,'ICP1.4.9',-40.0,70.0)
			]
		);

		TrendsParams['MM2_ICP_CHANNEL_VALUES_1_TRENDS']=trendsConfig(
			'Мост-мультиплексор ММ.2, порт 1, температура компенсации холодного спая',
			dbConfig(
				'MM2_ICP_CHANNEL_VALUES_1',
				[
					'MM2_ICP_CHANNEL_VALUE_1_1_9',
					'MM2_ICP_CHANNEL_VALUE_1_2_9',
					'MM2_ICP_CHANNEL_VALUE_1_3_9',
					'MM2_ICP_CHANNEL_VALUE_1_4_9',
					'MM2_ICP_CHANNEL_VALUE_1_5_9',
					'MM2_ICP_CHANNEL_VALUE_1_6_9',
					'MM2_ICP_CHANNEL_VALUE_1_7_9',
					'MM2_ICP_CHANNEL_VALUE_1_8_9',
					'MM2_ICP_CHANNEL_VALUE_1_9_9'
				]
			),
			[
				indItemSplittedWithBounds('ММ.2, порт 1, модуль 1, температура CJC '+String.fromCharCode(176)+'C','dark red',0,'ICP2.1.1',-40.0,70.0),
				indItemSplittedWithBounds('ММ.2, порт 1, модуль 2, температура CJC '+String.fromCharCode(176)+'C','dark red',0,'ICP2.1.2',-40.0,70.0),
				indItemSplittedWithBounds('ММ.2, порт 1, модуль 3, температура CJC '+String.fromCharCode(176)+'C','dark red',0,'ICP2.1.3',-40.0,70.0),
				indItemSplittedWithBounds('ММ.2, порт 1, модуль 4, температура CJC '+String.fromCharCode(176)+'C','dark red',0,'ICP2.1.4',-40.0,70.0),
				indItemSplittedWithBounds('ММ.2, порт 1, модуль 5, температура CJC '+String.fromCharCode(176)+'C','dark red',0,'ICP2.1.5',-40.0,70.0),
				indItemSplittedWithBounds('ММ.2, порт 1, модуль 6, температура CJC '+String.fromCharCode(176)+'C','dark red',0,'ICP2.1.6',-40.0,70.0),
				indItemSplittedWithBounds('ММ.2, порт 1, модуль 7, температура CJC '+String.fromCharCode(176)+'C','dark red',0,'ICP2.1.7',-40.0,70.0),
				indItemSplittedWithBounds('ММ.2, порт 1, модуль 8, температура CJC '+String.fromCharCode(176)+'C','dark red',0,'ICP2.1.8',-40.0,70.0),
				indItemSplittedWithBounds('ММ.2, порт 1, модуль 9, температура CJC '+String.fromCharCode(176)+'C','dark red',0,'ICP2.1.9',-40.0,70.0)
			]
		);

		TrendsParams['MM2_ICP_CHANNEL_VALUES_2_TRENDS']=trendsConfig(
			'Мост-мультиплексор ММ.2, порт 2, температура компенсации холодного спая',
			dbConfig(
				'MM2_ICP_CHANNEL_VALUES_2',
				[
					'MM2_ICP_CHANNEL_VALUE_2_1_9',
					'MM2_ICP_CHANNEL_VALUE_2_2_9',
					'MM2_ICP_CHANNEL_VALUE_2_3_9',
					'MM2_ICP_CHANNEL_VALUE_2_4_9',
					'MM2_ICP_CHANNEL_VALUE_2_5_9',
					'MM2_ICP_CHANNEL_VALUE_2_6_9',
					'MM2_ICP_CHANNEL_VALUE_2_7_9',
					'MM2_ICP_CHANNEL_VALUE_2_8_9',
					'MM2_ICP_CHANNEL_VALUE_2_9_9'
				]
			),
			[
				indItemSplittedWithBounds('ММ.2, порт 2, модуль 1, температура CJC '+String.fromCharCode(176)+'C','dark red',0,'ICP2.2.1',-40.0,70.0),
				indItemSplittedWithBounds('ММ.2, порт 2, модуль 2, температура CJC '+String.fromCharCode(176)+'C','dark red',0,'ICP2.2.2',-40.0,70.0),
				indItemSplittedWithBounds('ММ.2, порт 2, модуль 3, температура CJC '+String.fromCharCode(176)+'C','dark red',0,'ICP2.2.3',-40.0,70.0),
				indItemSplittedWithBounds('ММ.2, порт 2, модуль 4, температура CJC '+String.fromCharCode(176)+'C','dark red',0,'ICP2.2.4',-40.0,70.0),
				indItemSplittedWithBounds('ММ.2, порт 2, модуль 5, температура CJC '+String.fromCharCode(176)+'C','dark red',0,'ICP2.2.5',-40.0,70.0),
				indItemSplittedWithBounds('ММ.2, порт 2, модуль 6, температура CJC '+String.fromCharCode(176)+'C','dark red',0,'ICP2.2.6',-40.0,70.0),
				indItemSplittedWithBounds('ММ.2, порт 2, модуль 7, температура CJC '+String.fromCharCode(176)+'C','dark red',0,'ICP2.2.7',-40.0,70.0),
				indItemSplittedWithBounds('ММ.2, порт 2, модуль 8, температура CJC '+String.fromCharCode(176)+'C','dark red',0,'ICP2.2.8',-40.0,70.0),
				indItemSplittedWithBounds('ММ.2, порт 2, модуль 9, температура CJC '+String.fromCharCode(176)+'C','dark red',0,'ICP2.2.9',-40.0,70.0)
			]
		);

		TrendsParams['MM2_ICP_CHANNEL_VALUES_3_TRENDS']=trendsConfig(
			'Мост-мультиплексор ММ.2, порт 3, температура компенсации холодного спая',
			dbConfig(
				'MM2_ICP_CHANNEL_VALUES_3',
				[
					'MM2_ICP_CHANNEL_VALUE_3_1_9',
					'MM2_ICP_CHANNEL_VALUE_3_2_9',
					'MM2_ICP_CHANNEL_VALUE_3_3_9',
					'MM2_ICP_CHANNEL_VALUE_3_4_9',
					'MM2_ICP_CHANNEL_VALUE_3_5_9',
					'MM2_ICP_CHANNEL_VALUE_3_6_9',
					'MM2_ICP_CHANNEL_VALUE_3_7_9',
					'MM2_ICP_CHANNEL_VALUE_3_8_9',
					'MM2_ICP_CHANNEL_VALUE_3_9_9'
				]
			),
			[
				indItemSplittedWithBounds('ММ.2, порт 3, модуль 1, температура CJC '+String.fromCharCode(176)+'C','dark red',0,'ICP2.3.1',-40.0,70.0),
				indItemSplittedWithBounds('ММ.2, порт 3, модуль 2, температура CJC '+String.fromCharCode(176)+'C','dark red',0,'ICP2.3.2',-40.0,70.0),
				indItemSplittedWithBounds('ММ.2, порт 3, модуль 3, температура CJC '+String.fromCharCode(176)+'C','dark red',0,'ICP2.3.3',-40.0,70.0),
				indItemSplittedWithBounds('ММ.2, порт 3, модуль 4, температура CJC '+String.fromCharCode(176)+'C','dark red',0,'ICP2.3.4',-40.0,70.0),
				indItemSplittedWithBounds('ММ.2, порт 3, модуль 5, температура CJC '+String.fromCharCode(176)+'C','dark red',0,'ICP2.3.5',-40.0,70.0),
				indItemSplittedWithBounds('ММ.2, порт 3, модуль 6, температура CJC '+String.fromCharCode(176)+'C','dark red',0,'ICP2.3.6',-40.0,70.0),
				indItemSplittedWithBounds('ММ.2, порт 3, модуль 7, температура CJC '+String.fromCharCode(176)+'C','dark red',0,'ICP2.3.7',-40.0,70.0),
				indItemSplittedWithBounds('ММ.2, порт 3, модуль 8, температура CJC '+String.fromCharCode(176)+'C','dark red',0,'ICP2.3.8',-40.0,70.0),
				indItemSplittedWithBounds('ММ.2, порт 3, модуль 9, температура CJC '+String.fromCharCode(176)+'C','dark red',0,'ICP2.3.9',-40.0,70.0)
			]
		);

		TrendsParams['MM2_ICP_CHANNEL_VALUES_4_TRENDS']=trendsConfig(
			'Мост-мультиплексор ММ.2, порт 4, температура компенсации холодного спая',
			dbConfig(
				'MM2_ICP_CHANNEL_VALUES_4',
				[
					'MM2_ICP_CHANNEL_VALUE_4_1_9',
					'MM2_ICP_CHANNEL_VALUE_4_2_9',
					'MM2_ICP_CHANNEL_VALUE_4_3_9',
					'MM2_ICP_CHANNEL_VALUE_4_4_9',
					'MM2_ICP_CHANNEL_VALUE_4_5_9',
					'MM2_ICP_CHANNEL_VALUE_4_6_9',
					'MM2_ICP_CHANNEL_VALUE_4_7_9',
					'MM2_ICP_CHANNEL_VALUE_4_8_9',
					'MM2_ICP_CHANNEL_VALUE_4_9_9'
				]
			),
			[
				indItemSplittedWithBounds('ММ.2, порт 4, модуль 1, температура CJC '+String.fromCharCode(176)+'C','dark red',0,'ICP2.4.1',-40.0,70.0),
				indItemSplittedWithBounds('ММ.2, порт 4, модуль 2, температура CJC '+String.fromCharCode(176)+'C','dark red',0,'ICP2.4.2',-40.0,70.0),
				indItemSplittedWithBounds('ММ.2, порт 4, модуль 3, температура CJC '+String.fromCharCode(176)+'C','dark red',0,'ICP2.4.3',-40.0,70.0),
				indItemSplittedWithBounds('ММ.2, порт 4, модуль 4, температура CJC '+String.fromCharCode(176)+'C','dark red',0,'ICP2.4.4',-40.0,70.0),
				indItemSplittedWithBounds('ММ.2, порт 4, модуль 5, температура CJC '+String.fromCharCode(176)+'C','dark red',0,'ICP2.4.5',-40.0,70.0),
				indItemSplittedWithBounds('ММ.2, порт 4, модуль 6, температура CJC '+String.fromCharCode(176)+'C','dark red',0,'ICP2.4.6',-40.0,70.0),
				indItemSplittedWithBounds('ММ.2, порт 4, модуль 7, температура CJC '+String.fromCharCode(176)+'C','dark red',0,'ICP2.4.7',-40.0,70.0),
				indItemSplittedWithBounds('ММ.2, порт 4, модуль 8, температура CJC '+String.fromCharCode(176)+'C','dark red',0,'ICP2.4.8',-40.0,70.0),
				indItemSplittedWithBounds('ММ.2, порт 4, модуль 9, температура CJC '+String.fromCharCode(176)+'C','dark red',0,'ICP2.4.9',-40.0,70.0)
			]
		);

		var i=0;
		var j=0;
		var menuItems=[];
		for (i=1; i<=83; i++) {
			var Fields=[];
			var Items=[];
			for (j=0; j<=15; j++) {
				Fields[j]='Z_MOD'+i.format(0,'')+'_'+(j<10 ? '0' : '')+j.format(0,'');
				var item={name:'Z_MOD'+i.format(0,''),'labelOff':'бит '+(j<10 ? '0' : '')+j.format(0,'')+'=0',labelOn:'бит '+(j<10 ? '0' : '')+j.format(0,'')+'=1'};
				Items[j]=item;
			}
			TrendsParams['Z_MOD'+i.format(0,'')+'_TRENDS']=trendsConfig(
				'Циклограмма состояний сигналов контроллера МПК.З, слово Z_MOD'+i.format(0,''),
				dbConfig(
					'Z_MODS'+i.format(0,''),
					Fields
				),
				indItems(Items)
			);
		}
		var menuItems=[];
		for (i=0; i<=8; i++) {
			var subMenuItems=[];
			var startPos=i==0 ? 1 : 0;
			var finishPos=i==8 ? 3 : 9;
			for (j=startPos; j<=finishPos; j++) {
				subMenuItems[j-startPos]={
					text:'Слово Z_MOD'+(i*10+j).format(0,''),
					id:'Z_MOD'+(i*10+j).format(0,'')+'_TRENDS'
				};
			}
			menuItems[i]={
				text:'Слова Z_MOD'+(i*10+(i==0 ? 1 : 0)).format(0,'')+'...Z_MOD'+(i*10+(i==8 ? 3 : 9)).format(0,''),
				id:'Z_MOD'+(i*10+(i==0 ? 1 : 0)).format(0,'')+'_Z_MOD'+(i*10+(i==8 ? 3 : 9)).format(0,'')+'_TRENDS',
				submenu:subMenuItems
			};
		}

		TrendsParams['MPK_1_OUTPUTS_COUNTERS_TRENDS']=trendsConfig(
			'Счетчик состояния выхода МПК.1.',
			dbConfig(
				'mpk_1_outputs_counters',
				[
					'MPK_1_OUTPUT_1_1_COUNTER',
					'MPK_1_OUTPUT_1_2_COUNTER',
					'MPK_1_OUTPUT_1_3_COUNTER',
					'MPK_1_OUTPUT_1_4_COUNTER',
					'MPK_1_OUTPUT_1_5_COUNTER',
					'MPK_1_OUTPUT_1_6_COUNTER',
					'MPK_1_OUTPUT_1_7_COUNTER',
					'MPK_1_OUTPUT_1_8_COUNTER',
					'MPK_1_OUTPUT_1_9_COUNTER',
					'MPK_1_OUTPUT_1_10_COUNTER',
					'MPK_1_OUTPUT_1_11_COUNTER',
					'MPK_1_OUTPUT_1_12_COUNTER',
					'MPK_1_OUTPUT_1_13_COUNTER',
					'MPK_1_OUTPUT_1_14_COUNTER',
					'MPK_1_OUTPUT_1_15_COUNTER',
					'MPK_1_OUTPUT_1_16_COUNTER',
					'MPK_1_OUTPUT_1_17_COUNTER',
					'MPK_1_OUTPUT_1_18_COUNTER',
					'MPK_1_OUTPUT_1_19_COUNTER',
					'MPK_1_OUTPUT_1_20_COUNTER',
					'MPK_1_OUTPUT_1_21_COUNTER',
					'MPK_1_OUTPUT_1_22_COUNTER',
					'MPK_1_OUTPUT_1_23_COUNTER',
					'MPK_1_OUTPUT_1_24_COUNTER',
					'MPK_1_OUTPUT_1_25_COUNTER',
					'MPK_1_OUTPUT_1_26_COUNTER',
					'MPK_1_OUTPUT_1_27_COUNTER',
					'MPK_1_OUTPUT_1_28_COUNTER',
					'MPK_1_OUTPUT_1_29_COUNTER',
					'MPK_1_OUTPUT_1_30_COUNTER',
					'MPK_1_OUTPUT_1_31_COUNTER',
					'MPK_1_OUTPUT_1_32_COUNTER',
					'MPK_1_OUTPUT_2_1_COUNTER',
					'MPK_1_OUTPUT_2_2_COUNTER',
					'MPK_1_OUTPUT_2_3_COUNTER',
					'MPK_1_OUTPUT_2_4_COUNTER',
					'MPK_1_OUTPUT_2_5_COUNTER',
					'MPK_1_OUTPUT_2_6_COUNTER',
					'MPK_1_OUTPUT_2_7_COUNTER',
					'MPK_1_OUTPUT_2_8_COUNTER',
					'MPK_1_OUTPUT_2_9_COUNTER',
					'MPK_1_OUTPUT_2_10_COUNTER',
					'MPK_1_OUTPUT_2_11_COUNTER',
					'MPK_1_OUTPUT_2_12_COUNTER',
					'MPK_1_OUTPUT_2_13_COUNTER',
					'MPK_1_OUTPUT_2_14_COUNTER',
					'MPK_1_OUTPUT_2_15_COUNTER',
					'MPK_1_OUTPUT_2_16_COUNTER',
					'MPK_1_OUTPUT_2_17_COUNTER',
					'MPK_1_OUTPUT_2_18_COUNTER',
					'MPK_1_OUTPUT_2_19_COUNTER',
					'MPK_1_OUTPUT_2_20_COUNTER',
					'MPK_1_OUTPUT_2_21_COUNTER',
					'MPK_1_OUTPUT_2_22_COUNTER',
					'MPK_1_OUTPUT_2_23_COUNTER',
					'MPK_1_OUTPUT_2_24_COUNTER',
					'MPK_1_OUTPUT_2_25_COUNTER',
					'MPK_1_OUTPUT_2_26_COUNTER',
					'MPK_1_OUTPUT_2_27_COUNTER',
					'MPK_1_OUTPUT_2_28_COUNTER',
					'MPK_1_OUTPUT_2_29_COUNTER',
					'MPK_1_OUTPUT_2_30_COUNTER',
					'MPK_1_OUTPUT_2_31_COUNTER',
					'MPK_1_OUTPUT_2_32_COUNTER',
					'MPK_1_OUTPUT_3_1_COUNTER',
					'MPK_1_OUTPUT_3_2_COUNTER',
					'MPK_1_OUTPUT_3_3_COUNTER',
					'MPK_1_OUTPUT_3_4_COUNTER',
					'MPK_1_OUTPUT_3_5_COUNTER',
					'MPK_1_OUTPUT_3_6_COUNTER',
					'MPK_1_OUTPUT_3_7_COUNTER',
					'MPK_1_OUTPUT_3_8_COUNTER',
					'MPK_1_OUTPUT_3_9_COUNTER',
					'MPK_1_OUTPUT_3_10_COUNTER',
					'MPK_1_OUTPUT_3_11_COUNTER',
					'MPK_1_OUTPUT_3_12_COUNTER',
					'MPK_1_OUTPUT_3_13_COUNTER',
					'MPK_1_OUTPUT_3_14_COUNTER',
					'MPK_1_OUTPUT_3_15_COUNTER',
					'MPK_1_OUTPUT_3_16_COUNTER',
					'MPK_1_OUTPUT_3_17_COUNTER',
					'MPK_1_OUTPUT_3_18_COUNTER',
					'MPK_1_OUTPUT_3_19_COUNTER',
					'MPK_1_OUTPUT_3_20_COUNTER',
					'MPK_1_OUTPUT_3_21_COUNTER',
					'MPK_1_OUTPUT_3_22_COUNTER',
					'MPK_1_OUTPUT_3_23_COUNTER',
					'MPK_1_OUTPUT_3_24_COUNTER',
					'MPK_1_OUTPUT_3_25_COUNTER',
					'MPK_1_OUTPUT_3_26_COUNTER',
					'MPK_1_OUTPUT_3_27_COUNTER',
					'MPK_1_OUTPUT_3_28_COUNTER',
					'MPK_1_OUTPUT_3_29_COUNTER',
					'MPK_1_OUTPUT_3_30_COUNTER',
					'MPK_1_OUTPUT_3_31_COUNTER',
					'MPK_1_OUTPUT_3_32_COUNTER'
				]
			),
			[
				indItemSplittedWithBoundsDigital('МПК.1, модуль 7, выход 1, счетчик','dark red',0,'модуль 7, выход 1, PSG, больше',0.0,2000.0),
				indItemSplittedWithBoundsDigital('МПК.1, модуль 7, выход 2, счетчик','dark red',0,'модуль 7, выход 2, PSG, меньше',0.0,2000.0),
				indItemSplittedWithBoundsDigital('МПК.1, модуль 7, выход 3, счетчик','dark red',0,'модуль 7, выход 3, FPG_GSS, больше',0.0,2000.0),
				indItemSplittedWithBoundsDigital('МПК.1, модуль 7, выход 4, счетчик','dark red',0,'модуль 7, выход 4, FPG_GSS, меньше',0.0,2000.0),
				indItemSplittedWithBoundsDigital('МПК.1, модуль 7, выход 5, счетчик','dark red',0,'модуль 7, выход 5, FDG_GSS, снижение',0.0,2000.0),
				indItemSplittedWithBoundsDigital('МПК.1, модуль 7, выход 6, счетчик','dark red',0,'модуль 7, выход 6, MHD, больше',0.0,2000.0),
				indItemSplittedWithBoundsDigital('МПК.1, модуль 7, выход 7, счетчик','dark red',0,'модуль 7, выход 7, MHD, меньше',0.0,2000.0),
				indItemSplittedWithBoundsDigital('МПК.1, модуль 7, выход 8, счетчик','dark red',0,'модуль 7, выход 8, FPG_HD, больше',0.0,2000.0),
				indItemSplittedWithBoundsDigital('МПК.1, модуль 7, выход 9, счетчик','dark red',0,'модуль 7, выход 9, FPG_HD, меньше',0.0,2000.0),
				indItemSplittedWithBoundsDigital('МПК.1, модуль 7, выход 10, счетчик','dark red',0,'модуль 7, выход 10, TGD, больше',0.0,2000.0),
				indItemSplittedWithBoundsDigital('МПК.1, модуль 7, выход 11, счетчик','dark red',0,'модуль 7, выход 11, TGD, меньше',0.0,2000.0),
				indItemSplittedWithBoundsDigital('МПК.1, модуль 7, выход 12, счетчик','dark red',0,'модуль 7, выход 12, PKG, больше',0.0,2000.0),
				indItemSplittedWithBoundsDigital('МПК.1, модуль 7, выход 13, счетчик','dark red',0,'модуль 7, выход 13, PKG, меньше',0.0,2000.0),
				indItemSplittedWithBoundsDigital('МПК.1, модуль 7, выход 14, счетчик','dark red',0,'модуль 7, выход 14, FPG_17, больше',0.0,2000.0),
				indItemSplittedWithBoundsDigital('МПК.1, модуль 7, выход 15, счетчик','dark red',0,'модуль 7, выход 15, FPG_17, меньше',0.0,2000.0),
				indItemSplittedWithBoundsDigital('МПК.1, модуль 7, выход 16, счетчик','dark red',0,'модуль 7, выход 16, FPG_18, больше',0.0,2000.0),
				indItemSplittedWithBoundsDigital('МПК.1, модуль 7, выход 17, счетчик','dark red',0,'модуль 7, выход 17, FPG_18, меньше',0.0,2000.0),
				indItemSplittedWithBoundsDigital('МПК.1, модуль 7, выход 18, счетчик','dark red',0,'модуль 7, выход 18, FPG_19, больше',0.0,2000.0),
				indItemSplittedWithBoundsDigital('МПК.1, модуль 7, выход 19, счетчик','dark red',0,'модуль 7, выход 19, FPG_19, меньше',0.0,2000.0),
				indItemSplittedWithBoundsDigital('МПК.1, модуль 7, выход 20, счетчик','dark red',0,'модуль 7, выход 20, FPG_20, больше',0.0,2000.0),
				indItemSplittedWithBoundsDigital('МПК.1, модуль 7, выход 21, счетчик','dark red',0,'модуль 7, выход 21, FPG_20, меньше',0.0,2000.0),
				indItemSplittedWithBoundsDigital('МПК.1, модуль 7, выход 22, счетчик','dark red',0,'модуль 7, выход 22',0.0,2000.0),
				indItemSplittedWithBoundsDigital('МПК.1, модуль 7, выход 23, счетчик','dark red',0,'модуль 7, выход 23',0.0,2000.0),
				indItemSplittedWithBoundsDigital('МПК.1, модуль 7, выход 24, счетчик','dark red',0,'модуль 7, выход 24',0.0,2000.0),
				indItemSplittedWithBoundsDigital('МПК.1, модуль 7, выход 25, счетчик','dark red',0,'модуль 7, выход 25',0.0,2000.0),
				indItemSplittedWithBoundsDigital('МПК.1, модуль 7, выход 26, счетчик','dark red',0,'модуль 7, выход 26',0.0,2000.0),
				indItemSplittedWithBoundsDigital('МПК.1, модуль 7, выход 27, счетчик','dark red',0,'модуль 7, выход 27',0.0,2000.0),
				indItemSplittedWithBoundsDigital('МПК.1, модуль 7, выход 28, счетчик','dark red',0,'модуль 7, выход 28',0.0,2000.0),
				indItemSplittedWithBoundsDigital('МПК.1, модуль 7, выход 29, счетчик','dark red',0,'модуль 7, выход 29',0.0,2000.0),
				indItemSplittedWithBoundsDigital('МПК.1, модуль 7, выход 30, счетчик','dark red',0,'модуль 7, выход 30',0.0,2000.0),
				indItemSplittedWithBoundsDigital('МПК.1, модуль 7, выход 31, счетчик','dark red',0,'модуль 7, выход 31',0.0,2000.0),
				indItemSplittedWithBoundsDigital('МПК.1, модуль 7, выход 32, счетчик','dark red',0,'модуль 7, выход 32',0.0,2000.0),
				indItemSplittedWithBoundsDigital('МПК.1, модуль 8, выход 1, счетчик','dark red',0,'модуль 8, выход 1',0.0,2000.0),
				indItemSplittedWithBoundsDigital('МПК.1, модуль 8, выход 2, счетчик','dark red',0,'модуль 8, выход 2',0.0,2000.0),
				indItemSplittedWithBoundsDigital('МПК.1, модуль 8, выход 3, счетчик','dark red',0,'модуль 8, выход 3',0.0,2000.0),
				indItemSplittedWithBoundsDigital('МПК.1, модуль 8, выход 4, счетчик','dark red',0,'модуль 8, выход 4',0.0,2000.0),
				indItemSplittedWithBoundsDigital('МПК.1, модуль 8, выход 5, счетчик','dark red',0,'модуль 8, выход 5',0.0,2000.0),
				indItemSplittedWithBoundsDigital('МПК.1, модуль 8, выход 6, счетчик','dark red',0,'модуль 8, выход 6',0.0,2000.0),
				indItemSplittedWithBoundsDigital('МПК.1, модуль 8, выход 7, счетчик','dark red',0,'модуль 8, выход 7',0.0,2000.0),
				indItemSplittedWithBoundsDigital('МПК.1, модуль 8, выход 8, счетчик','dark red',0,'модуль 8, выход 8',0.0,2000.0),
				indItemSplittedWithBoundsDigital('МПК.1, модуль 8, выход 9, счетчик','dark red',0,'модуль 8, выход 9',0.0,2000.0),
				indItemSplittedWithBoundsDigital('МПК.1, модуль 8, выход 10, счетчик','dark red',0,'модуль 8, выход 10',0.0,2000.0),
				indItemSplittedWithBoundsDigital('МПК.1, модуль 8, выход 11, счетчик','dark red',0,'модуль 8, выход 11',0.0,2000.0),
				indItemSplittedWithBoundsDigital('МПК.1, модуль 8, выход 12, счетчик','dark red',0,'модуль 8, выход 12',0.0,2000.0),
				indItemSplittedWithBoundsDigital('МПК.1, модуль 8, выход 13, счетчик','dark red',0,'модуль 8, выход 13',0.0,2000.0),
				indItemSplittedWithBoundsDigital('МПК.1, модуль 8, выход 14, счетчик','dark red',0,'модуль 8, выход 14',0.0,2000.0),
				indItemSplittedWithBoundsDigital('МПК.1, модуль 8, выход 15, счетчик','dark red',0,'модуль 8, выход 15',0.0,2000.0),
				indItemSplittedWithBoundsDigital('МПК.1, модуль 8, выход 16, счетчик','dark red',0,'модуль 8, выход 16',0.0,2000.0),
				indItemSplittedWithBoundsDigital('МПК.1, модуль 8, выход 17, счетчик','dark red',0,'модуль 8, выход 17',0.0,2000.0),
				indItemSplittedWithBoundsDigital('МПК.1, модуль 8, выход 18, счетчик','dark red',0,'модуль 8, выход 18',0.0,2000.0),
				indItemSplittedWithBoundsDigital('МПК.1, модуль 8, выход 19, счетчик','dark red',0,'модуль 8, выход 19',0.0,2000.0),
				indItemSplittedWithBoundsDigital('МПК.1, модуль 8, выход 20, счетчик','dark red',0,'модуль 8, выход 20',0.0,2000.0),
				indItemSplittedWithBoundsDigital('МПК.1, модуль 8, выход 21, счетчик','dark red',0,'модуль 8, выход 21',0.0,2000.0),
				indItemSplittedWithBoundsDigital('МПК.1, модуль 8, выход 22, счетчик','dark red',0,'модуль 8, выход 22',0.0,2000.0),
				indItemSplittedWithBoundsDigital('МПК.1, модуль 8, выход 23, счетчик','dark red',0,'модуль 8, выход 23',0.0,2000.0),
				indItemSplittedWithBoundsDigital('МПК.1, модуль 8, выход 24, счетчик','dark red',0,'модуль 8, выход 24',0.0,2000.0),
				indItemSplittedWithBoundsDigital('МПК.1, модуль 8, выход 25, счетчик','dark red',0,'модуль 8, выход 25',0.0,2000.0),
				indItemSplittedWithBoundsDigital('МПК.1, модуль 8, выход 26, счетчик','dark red',0,'модуль 8, выход 26',0.0,2000.0),
				indItemSplittedWithBoundsDigital('МПК.1, модуль 8, выход 27, счетчик','dark red',0,'модуль 8, выход 27',0.0,2000.0),
				indItemSplittedWithBoundsDigital('МПК.1, модуль 8, выход 28, счетчик','dark red',0,'модуль 8, выход 28',0.0,2000.0),
				indItemSplittedWithBoundsDigital('МПК.1, модуль 8, выход 29, счетчик','dark red',0,'модуль 8, выход 29',0.0,2000.0),
				indItemSplittedWithBoundsDigital('МПК.1, модуль 8, выход 30, счетчик','dark red',0,'модуль 8, выход 30',0.0,2000.0),
				indItemSplittedWithBoundsDigital('МПК.1, модуль 8, выход 31, счетчик','dark red',0,'модуль 8, выход 31',0.0,2000.0),
				indItemSplittedWithBoundsDigital('МПК.1, модуль 8, выход 32, счетчик','dark red',0,'модуль 8, выход 32',0.0,2000.0),
				indItemSplittedWithBoundsDigital('МПК.1, модуль 9, выход 1, счетчик','dark red',0,'модуль 9, выход 1',0.0,2000.0),
				indItemSplittedWithBoundsDigital('МПК.1, модуль 9, выход 2, счетчик','dark red',0,'модуль 9, выход 2',0.0,2000.0),
				indItemSplittedWithBoundsDigital('МПК.1, модуль 9, выход 3, счетчик','dark red',0,'модуль 9, выход 3',0.0,2000.0),
				indItemSplittedWithBoundsDigital('МПК.1, модуль 9, выход 4, счетчик','dark red',0,'модуль 9, выход 4',0.0,2000.0),
				indItemSplittedWithBoundsDigital('МПК.1, модуль 9, выход 5, счетчик','dark red',0,'модуль 9, выход 5',0.0,2000.0),
				indItemSplittedWithBoundsDigital('МПК.1, модуль 9, выход 6, счетчик','dark red',0,'модуль 9, выход 6, ВН №12, Tдыма>400 град.',0.0,2000.0),
				indItemSplittedWithBoundsDigital('МПК.1, модуль 9, выход 7, счетчик','dark red',0,'модуль 9, выход 7',0.0,2000.0),
				indItemSplittedWithBoundsDigital('МПК.1, модуль 9, выход 8, счетчик','dark red',0,'модуль 9, выход 8',0.0,2000.0),
				indItemSplittedWithBoundsDigital('МПК.1, модуль 9, выход 9, счетчик','dark red',0,'модуль 9, выход 9',0.0,2000.0),
				indItemSplittedWithBoundsDigital('МПК.1, модуль 9, выход 10, счетчик','dark red',0,'модуль 9, выход 10',0.0,2000.0),
				indItemSplittedWithBoundsDigital('МПК.1, модуль 9, выход 11, счетчик','dark red',0,'модуль 9, выход 11',0.0,2000.0),
				indItemSplittedWithBoundsDigital('МПК.1, модуль 9, выход 12, счетчик','dark red',0,'модуль 9, выход 12',0.0,2000.0),
				indItemSplittedWithBoundsDigital('МПК.1, модуль 9, выход 13, счетчик','dark red',0,'модуль 9, выход 13',0.0,2000.0),
				indItemSplittedWithBoundsDigital('МПК.1, модуль 9, выход 14, счетчик','dark red',0,'модуль 9, выход 14, ВН №13, Tдыма>400 град.',0.0,2000.0),
				indItemSplittedWithBoundsDigital('МПК.1, модуль 9, выход 15, счетчик','dark red',0,'модуль 9, выход 15',0.0,2000.0),
				indItemSplittedWithBoundsDigital('МПК.1, модуль 9, выход 16, счетчик','dark red',0,'модуль 9, выход 16',0.0,2000.0),
				indItemSplittedWithBoundsDigital('МПК.1, модуль 9, выход 17, счетчик','dark red',0,'модуль 9, выход 17',0.0,2000.0),
				indItemSplittedWithBoundsDigital('МПК.1, модуль 9, выход 18, счетчик','dark red',0,'модуль 9, выход 18',0.0,2000.0),
				indItemSplittedWithBoundsDigital('МПК.1, модуль 9, выход 19, счетчик','dark red',0,'модуль 9, выход 19',0.0,2000.0),
				indItemSplittedWithBoundsDigital('МПК.1, модуль 9, выход 20, счетчик','dark red',0,'модуль 9, выход 20',0.0,2000.0),
				indItemSplittedWithBoundsDigital('МПК.1, модуль 9, выход 21, счетчик','dark red',0,'модуль 9, выход 21',0.0,2000.0),
				indItemSplittedWithBoundsDigital('МПК.1, модуль 9, выход 22, счетчик','dark red',0,'модуль 9, выход 22, ВН №14, Tдыма>400 град.',0.0,2000.0),
				indItemSplittedWithBoundsDigital('МПК.1, модуль 9, выход 23, счетчик','dark red',0,'модуль 9, выход 23',0.0,2000.0),
				indItemSplittedWithBoundsDigital('МПК.1, модуль 9, выход 24, счетчик','dark red',0,'модуль 9, выход 24',0.0,2000.0),
				indItemSplittedWithBoundsDigital('МПК.1, модуль 9, выход 25, счетчик','dark red',0,'модуль 9, выход 25',0.0,2000.0),
				indItemSplittedWithBoundsDigital('МПК.1, модуль 9, выход 26, счетчик','dark red',0,'модуль 9, выход 26',0.0,2000.0),
				indItemSplittedWithBoundsDigital('МПК.1, модуль 9, выход 27, счетчик','dark red',0,'модуль 9, выход 27',0.0,2000.0),
				indItemSplittedWithBoundsDigital('МПК.1, модуль 9, выход 28, счетчик','dark red',0,'модуль 9, выход 28',0.0,2000.0),
				indItemSplittedWithBoundsDigital('МПК.1, модуль 9, выход 29, счетчик','dark red',0,'модуль 9, выход 29',0.0,2000.0),
				indItemSplittedWithBoundsDigital('МПК.1, модуль 9, выход 30, счетчик','dark red',0,'модуль 9, выход 30, ВН №19, Tдыма>400 град.',0.0,2000.0),
				indItemSplittedWithBoundsDigital('МПК.1, модуль 9, выход 31, счетчик','dark red',0,'модуль 9, выход 31',0.0,2000.0),
				indItemSplittedWithBoundsDigital('МПК.1, модуль 9, выход 32, счетчик','dark red',0,'модуль 9, выход 32',0.0,2000.0)
			]
		);

		ShihtaDiagLabels=[
			'Нет кокса',
			'Кокс',
			'Нет руды',
			'Руда',
			'Левый скип не в яме',
			'Левый скип в яме',
			'Левый скип - нет движения вверх',
			'Левый скип - движение вверх',
			'Правый скип не в яме',
			'Правый скип в яме',
			'Правый скип - нет движения вверх',
			'Правый скип - движение вверх',

			'Правый коксовый затвор неисп.',
			'Правый коксовый затвор закр.',
			'Правый коксовый затвор пром.',
			'Правый коксовый затвор откр.',
			'Правый коксовый грохот выкл.',
			'Правый коксовый грохот вкл.',

			'Левый коксовый затвор неисп.',
			'Левый коксовый затвор закр.',
			'Левый коксовый затвор пром.',
			'Левый коксовый затвор откр.',
			'Левый коксовый грохот выкл.',
			'Левый коксовый грохот вкл.',

			'Правый конв. добавок выкл.',
			'Правый конв. добавок вкл.',

			'Правый затвор Д3-Д4 неисп.',
			'Правый затвор Д3-Д4 закр.',
			'Правый затвор Д3-Д4 пром.',
			'Правый затвор Д3-Д4 откр.',
			'Правый питатель Д4 выкл.',
			'Правый питатель Д4 вкл.',
			'Правый питатель Д3 выкл.',
			'Правый питатель Д3 вкл.',

			'Правый затвор Д1-Д2 неисп.',
			'Правый затвор Д1-Д2 закр.',
			'Правый затвор Д1-Д2 пром.',
			'Правый затвор Д1-Д2 откр.',
			'Правый питатель Д2 выкл.',
			'Правый питатель Д2 вкл.',
			'Правый питатель Д1 выкл.',
			'Правый питатель Д1 вкл.',

			'Правый затвор О3-О4 неисп.',
			'Правый затвор О3-О4 закр.',
			'Правый затвор О3-О4 пром.',
			'Правый затвор О3-О4 откр.',
			'Правый питатель О4 выкл.',
			'Правый питатель О4 вкл.',
			'Правый питатель О3 выкл.',
			'Правый питатель О3 вкл.',

			'Правый затвор О1-О2 неисп.',
			'Правый затвор О1-О2 закр.',
			'Правый затвор О1-О2 пром.',
			'Правый затвор О1-О2 откр.',
			'Правый питатель О2 выкл.',
			'Правый питатель О2 вкл.',
			'Правый питатель О1 выкл.',
			'Правый питатель О1 вкл.',

			'Левый конв. добавок выкл.',
			'Левый конв. добавок вкл.',

			'Левый затвор Д3-Д4 неисп.',
			'Левый затвор Д3-Д4 закр.',
			'Левый затвор Д3-Д4 пром.',
			'Левый затвор Д3-Д4 откр.',
			'Левый питатель Д4 выкл.',
			'Левый питатель Д4 вкл.',
			'Левый питатель Д3 выкл.',
			'Левый питатель Д3 вкл.',

			'Левый затвор Д1-Д2 неисп.',
			'Левый затвор Д1-Д2 закр.',
			'Левый затвор Д1-Д2 пром.',
			'Левый затвор Д1-Д2 откр.',
			'Левый питатель Д2 выкл.',
			'Левый питатель Д2 вкл.',
			'Левый питатель Д1 выкл.',
			'Левый питатель Д1 вкл.',

			'Левый затвор О3-О4 неисп.',
			'Левый затвор О3-О4 закр.',
			'Левый затвор О3-О4 пром.',
			'Левый затвор О3-О4 откр.',
			'Левый питатель О4 выкл.',
			'Левый питатель О4 вкл.',
			'Левый питатель О3 выкл.',
			'Левый питатель О3 вкл.',

			'Левый затвор О1-О2 неисп.',
			'Левый затвор О1-О2 закр.',
			'Левый затвор О1-О2 пром.',
			'Левый затвор О1-О2 откр.',
			'Левый питатель О2 выкл.',
			'Левый питатель О2 вкл.',
			'Левый питатель О1 выкл.',
			'Левый питатель О1 вкл.',

			'Правый рудный затвор неисп.',
			'Правый рудный затвор закр.',
			'Правый рудный затвор пром.',
			'Правый рудный затвор откр.',
			'Правый грохот А2 выкл.',
			'Правый грохот А2 вкл.',
			'Правый грохот А1 выкл.',
			'Правый грохот А1 вкл.',
			'Левый рудный затвор неисп.',
			'Левый рудный затвор закр.',
			'Левый рудный затвор пром.',
			'Левый рудный затвор откр.',
			'Левый грохот А2 выкл.',
			'Левый грохот А2 вкл.',
			'Левый грохот А1 выкл.',
			'Левый грохот А1 вкл.'
		];
		TrendsParams['ShihtaDiag']=trendsConfig(
			'Циклограмма работы механизмов шихтоподачи',
			JSON.stringify(
				{
					'tables':[
						{
							'table':'shihta_diag_2',
							'fields':[
								'SKIP_COKE_PROCESSED',
								'SKIP_SINTER_PROCESSED',
								'GP_SKIP_L_DOWN_FIXED',
								'GP_SKIP_R_DOWN_MOVING',
								'GP_SKIP_R_DOWN_FIXED',
								'GP_SKIP_L_DOWN_MOVING',
								
								'SHIHTA_DIAG_26',
								'SHIHTA_DIAG_22',

								'SHIHTA_DIAG_25',
								'SHIHTA_DIAG_21',
								
								'SHIHTA_DIAG_98',

								'SHIHTA_DIAG_96',
								'SHIHTA_DIAG_92',
								'SHIHTA_DIAG_90',

								'SHIHTA_DIAG_94',
								'SHIHTA_DIAG_88',
								'SHIHTA_DIAG_86',

								'SHIHTA_DIAG_60',
								'SHIHTA_DIAG_56',
								'SHIHTA_DIAG_54',

								'SHIHTA_DIAG_58',
								'SHIHTA_DIAG_52',
								'SHIHTA_DIAG_50',

								'SHIHTA_DIAG_99',

								'SHIHTA_DIAG_97',
								'SHIHTA_DIAG_93',
								'SHIHTA_DIAG_91',

								'SHIHTA_DIAG_95',
								'SHIHTA_DIAG_89',
								'SHIHTA_DIAG_87',

								'SHIHTA_DIAG_61',
								'SHIHTA_DIAG_57',
								'SHIHTA_DIAG_55',

								'SHIHTA_DIAG_59',
								'SHIHTA_DIAG_53',
								'SHIHTA_DIAG_52',

								'SHIHTA_DIAG_74',
								'SHIHTA_DIAG_44',
								'SHIHTA_DIAG_42',

								'SHIHTA_DIAG_75',
								'SHIHTA_DIAG_43',
								'SHIHTA_DIAG_41'
							],
							'indexfield':'INDX',
							'scale':1.0,
							'shift':0.0
						},
						{
							'table':'shihta_diag_2',
							'fields':[
								'SKIP_POSITION',
								'SKIP_POSITION_2'
							],
							'indexfield':'INDX',
							'scale':0.01,
							'shift':0.0
						}
					]
				}
			),
			[
				indItemDigitalWithShiftAndLabels('',0,0,ShihtaDiagLabels),
				indItemDigitalWithShiftAndLabels('',0,2,[]),
				indItemDigitalWithShiftAndLabels('',0,4,[]),
				indItemDigitalWithShiftAndLabels('',0,6,[]),
				indItemDigitalWithShiftAndLabels('',0,8,[]),
				indItemDigitalWithShiftAndLabels('',0,10,[]),

				indItemDigitalWithShiftAndLabels('',0,12,[]),
				indItemDigitalWithShiftAndLabels('',0,16,[]),

				indItemDigitalWithShiftAndLabels('',0,18,[]),
				indItemDigitalWithShiftAndLabels('',0,22,[]),

				indItemDigitalWithShiftAndLabels('',0,24,[]),

				indItemDigitalWithShiftAndLabels('',0,26,[]),
				indItemDigitalWithShiftAndLabels('',0,30,[]),
				indItemDigitalWithShiftAndLabels('',0,32,[]),

				indItemDigitalWithShiftAndLabels('',0,34,[]),
				indItemDigitalWithShiftAndLabels('',0,38,[]),
				indItemDigitalWithShiftAndLabels('',0,40,[]),

				indItemDigitalWithShiftAndLabels('',0,42,[]),
				indItemDigitalWithShiftAndLabels('',0,46,[]),
				indItemDigitalWithShiftAndLabels('',0,48,[]),

				indItemDigitalWithShiftAndLabels('',0,50,[]),
				indItemDigitalWithShiftAndLabels('',0,54,[]),
				indItemDigitalWithShiftAndLabels('',0,56,[]),

				indItemDigitalWithShiftAndLabels('',0,58,[]),

				indItemDigitalWithShiftAndLabels('',0,60,[]),
				indItemDigitalWithShiftAndLabels('',0,64,[]),
				indItemDigitalWithShiftAndLabels('',0,66,[]),

				indItemDigitalWithShiftAndLabels('',0,68,[]),
				indItemDigitalWithShiftAndLabels('',0,72,[]),
				indItemDigitalWithShiftAndLabels('',0,74,[]),

				indItemDigitalWithShiftAndLabels('',0,76,[]),
				indItemDigitalWithShiftAndLabels('',0,80,[]),
				indItemDigitalWithShiftAndLabels('',0,82,[]),

				indItemDigitalWithShiftAndLabels('',0,84,[]),
				indItemDigitalWithShiftAndLabels('',0,88,[]),
				indItemDigitalWithShiftAndLabels('',0,90,[]),

				indItemDigitalWithShiftAndLabels('',0,92,[]),
				indItemDigitalWithShiftAndLabels('',0,96,[]),
				indItemDigitalWithShiftAndLabels('',0,98,[]),

				indItemDigitalWithShiftAndLabels('',0,100,[]),
				indItemDigitalWithShiftAndLabels('',0,104,[]),
				indItemDigitalWithShiftAndLabels('',0,106,[]),

				indItemWithBounds('Положение скипов, датчик 1, м','dark blue',1,0.0,80.0),
				indItemWithBounds('Положение скипов, датчик 2, м','light blue',1,0.0,80.0)
			]
		);

		ShihtaDiagLabels2=[
			' ',
			'Кокс',
			' ',
			'Руда',
			' ',
			'Левый скип в яме',
			' ',
			'Левый скип - движение вверх',
			' ',
			'Правый скип в яме',
			' ',
			'Правый скип - движение вверх',

			' ',
			'Правый коксовый затвор мелочи закр.',
			' ',
			'Правый коксовый затвор мелочи откр.',
			' ',
			'Правый коксовый затвор закр.',
			' ',
			'Правый коксовый затвор откр.',
			'Правый коксовый грохот выкл.',
			'Правый коксовый грохот вкл.',

			' ',
			'Левый коксовый затвор мелочи закр.',
			' ',
			'Левый коксовый затвор мелочи откр.',
			' ',
			'Левый коксовый затвор закр.',
			' ',
			'Левый коксовый затвор откр.',
			'Левый коксовый грохот выкл.',
			'Левый коксовый грохот вкл.',

			' ',
			'Правый рудный затвор мелочи закр.',
			' ',
			'Правый рудный затвор мелочи откр.',
			' ',
			'Правый рудный затвор закр.',
			' ',
			'Правый рудный затвор откр.',
			'Правый грохот А2 выкл.',
			'Правый грохот А2 вкл.',
			'Правый грохот А1 выкл.',
			'Правый грохот А1 вкл.',
			' ',
			'Левый рудный затвор мелочи закр.',
			' ',
			'Левый рудный затвор мелочи откр.',
			' ',
			'Левый рудный затвор закр.',
			' ',
			'Левый рудный затвор откр.',
			'Левый грохот А2 выкл.',
			'Левый грохот А2 вкл.',
			'Левый грохот А1 выкл.',
			'Левый грохот А1 вкл.'
		];
		TrendsParams['ShihtaDiag2']=trendsConfig(
			'Циклограмма работы механизмов загрузки',
			JSON.stringify(
				{
					'tables':[
						{
							'table':'shihta_diag_2',
							'fields':[
								'SKIP_COKE_PROCESSED',
								'SKIP_SINTER_PROCESSED',
								'GP_SKIP_L_DOWN_FIXED',
								'GP_SKIP_R_DOWN_MOVING',
								'GP_SKIP_R_DOWN_FIXED',
								'GP_SKIP_L_DOWN_MOVING',
								
								'SHIHTA_DIAG_28',
								'SHIHTA_DIAG_26',
								'SHIHTA_DIAG_22',

								'SHIHTA_DIAG_29',
								'SHIHTA_DIAG_25',
								'SHIHTA_DIAG_21',

								'SHIHTA_DIAG_104',
								'SHIHTA_DIAG_74',
								'SHIHTA_DIAG_44',
								'SHIHTA_DIAG_42',

								'SHIHTA_DIAG_103',
								'SHIHTA_DIAG_75',
								'SHIHTA_DIAG_43',
								'SHIHTA_DIAG_41'
							],
							'indexfield':'INDX',
							'scale':1.0,
							'shift':0.0
						},
						{
							'table':'shihta_diag_2',
							'fields':[
								'SKIP_POSITION',
								'SKIP_POSITION_2'
							],
							'indexfield':'INDX',
							'scale':0.01,
							'shift':0.0
						}
					]
				}
			),
			[
				indItemDigitalWithShiftAndLabels('',0,0,ShihtaDiagLabels2),
				indItemDigitalWithShiftAndLabels('',0,2,[]),
				indItemDigitalWithShiftAndLabels('',0,4,[]),
				indItemDigitalWithShiftAndLabels('',0,6,[]),
				indItemDigitalWithShiftAndLabels('',0,8,[]),
				indItemDigitalWithShiftAndLabels('',0,10,[]),

				indItemDigitalWithShiftAndLabels('',0,12,[]),
				indItemDigitalWithShiftAndLabels('',0,16,[]),
				indItemDigitalWithShiftAndLabels('',0,20,[]),

				indItemDigitalWithShiftAndLabels('',0,22,[]),
				indItemDigitalWithShiftAndLabels('',0,26,[]),
				indItemDigitalWithShiftAndLabels('',0,30,[]),

				indItemDigitalWithShiftAndLabels('',0,32,[]),
				indItemDigitalWithShiftAndLabels('',0,36,[]),
				indItemDigitalWithShiftAndLabels('',0,40,[]),
				indItemDigitalWithShiftAndLabels('',0,42,[]),

				indItemDigitalWithShiftAndLabels('',0,44,[]),
				indItemDigitalWithShiftAndLabels('',0,48,[]),
				indItemDigitalWithShiftAndLabels('',0,52,[]),
				indItemDigitalWithShiftAndLabels('',0,54,[]),

				indItemWithBounds('Положение скипов, датчик 1, м','dark blue',1,0.0,80.0),
				indItemWithBounds('Положение скипов, датчик 2, м','light blue',1,0.0,80.0)
			]
		);



		TrendsMenu=[
			{text:'Загрузка',id:'Charge',
				submenu:[
					trendItem('AZ_VZ_ZAG_TRENDS'),
					trendItem('CHARGE_LEVEL_L_TRENDS'),
					trendItem('PKG_ZAG_TRENDS'),
					trendItem('VZ_OS_TRENDS'),
					trendItem('VR_ANGLE_TRENDS'),
					trendItem('K_POSITION_TRENDS'),
					trendItem('CHARGE_LEVEL_SPEED_L_TRENDS'),
					trendItem('SKIP_TRENDS'),
					trendItem('MASL_1_TRENDS'),
					trendItem('MASL_2_TRENDS')
				]
			},
			{text:'Воздухонагреватели и ГСС',id:'Stoves',
				submenu:[
					trendItem('GSS_TRENDS'),
					trendItem('VN_1_TRENDS'),
					trendItem('VN_2_TRENDS'),
					trendItem('VN_3_TRENDS'),
					trendItem('VN_4_TRENDS')
				]
			},
			{text:'СИО воздухонагревателей',id:'SIOVN',
				submenu:[
					trendItem('SIOVN_PR_TRENDS'),
					trendItem('SIOVN_VD_TRENDS')	
				]
			},
			{text:'Центральный узел доменной печи',id:'Furnace',
				submenu:[
					trendItem('PKG_TRENDS'),
					trendItem('GD_HD_TRENDS'),
					trendItem('PG_HD_TRENDS'),
					trendItem('PR_HD_TRENDS'),
					trendItem('TKG_TRENDS'),
					trendItem('TPP_TRENDS'),
					trendItem('TSHA_1_TRENDS'),
					trendItem('TSHA_2_TRENDS'),
					trendItem('TSHA_3_TRENDS'),
					trendItem('TSHA_4_TRENDS'),
					trendItem('TSHA_5_TRENDS'),
					trendItem('THPL_1_TRENDS'),
					trendItem('THPL_2_TRENDS'),
					trendItem('THPL_3_TRENDS'),
					trendItem('THPL_4_TRENDS'),
					trendItem('THPL_5_TRENDS'),
					trendItem('THPL_6_TRENDS'),
					trendItem('TCHUG_TRENDS'),
					trendItem('GELOB_1_TRENDS'),
					trendItem('GELOB_2_TRENDS'),
					trendItem('PD_TRENDS'),
					trendItem('SIO_1_TRENDS'),
					trendItem('SIO_2_TRENDS'),
					trendItem('NASSIO_TRENDS'),
					trendItem('FPG_TRENDS')
				]
			},
			{text:'Энергоносители',id:'Energo',
				submenu:[
					trendItem('AZ_TRENDS'),
					trendItem('AZ_ZAG_TRENDS'),
					trendItem('AZ_ZA_TRENDS'),
					trendItem('PR_TRENDS'),
					trendItem('PR_ZA_TRENDS'),
					trendItem('VD_TRENDS'),
					trendItem('VD_MASL_TRENDS'),
					trendItem('VZ_TRENDS'),
					trendItem('O2_TRENDS'),
					trendItem('PG_TRENDS'),
					trendItem('DG_TRENDS')
				]
			},
			{text:'САК контроля теплового состояния и остаточной толщины футеровки металлоприемника',id:'SAK',
				submenu:[
					trendItem('TVD_PU3_PU2_TRENDS'),
					trendItem('TVD_PU1_PU6_TRENDS'),
					trendItem('TVD_PU5_PU4_TRENDS'),
					trendItem('TVD_FURM_TRENDS'),
					trendItem('TVD_BOT_TRENDS'),
					trendItem('TVD_TAP_TRENDS'),
					trendItem('TVD_HORN_V_N_TRENDS'),
					trendItem('TVD_HORN_N_LESH_V_TRENDS'),
					trendItem('TVD_LESH_V_N_TRENDS')
				]
			},
			{text:'Служебные тренды',id:'Service',
				submenu:[				
					trendItem('ShihtaDiag'),
					trendItem('ShihtaDiag2'),
					trendItem('Statistics'),
					trendItem('MemoryStatsTrends'),
					trendItem('JVMMemoryStats0'),
					trendItem('JVMMemoryStats1'),
					{text:'Параметры источников бесперебойного питания',id:'UPS_TRENDS',
						submenu:[
							trendItem('UPS_1_TRENDS'),
							trendItem('UPS_2_TRENDS'),
							trendItem('UPS_3_TRENDS'),
							trendItem('UPS_4_TRENDS'),
							trendItem('UPS_5_TRENDS'),
							trendItem('UPS_6_TRENDS'),
							trendItem('UPS_7_TRENDS')
						]
					},
					{text:'Температуры CJC  для модулей ICP-DAS',id:'ICP-CJC',
						submenu:[
							{text:'Мост-мультиплексор ММ.1',id:'ICP_CJC_MM_1',
							submenu:[
									trendItem('MM1_ICP_CHANNEL_VALUES_1_TRENDS'),
									trendItem('MM1_ICP_CHANNEL_VALUES_2_TRENDS'),
									trendItem('MM1_ICP_CHANNEL_VALUES_3_TRENDS'),
									trendItem('MM1_ICP_CHANNEL_VALUES_4_TRENDS')
								]
							},
							{text:'Мост-мультиплексор ММ.2',id:'ICP_CJC_MM_2',
							submenu:[
									trendItem('MM2_ICP_CHANNEL_VALUES_1_TRENDS'),
									trendItem('MM2_ICP_CHANNEL_VALUES_2_TRENDS'),
									trendItem('MM2_ICP_CHANNEL_VALUES_3_TRENDS'),
									trendItem('MM2_ICP_CHANNEL_VALUES_4_TRENDS')
								]
							}
						]
					},
					{text:'Циклограмма состояний сигналов контроллера МПК.З, словf Z_MOD1...Z_MOD83',id:'Z_MOD1_Z_MOD83_TRENDS',submenu:menuItems},
					trendItem('MPK_1_OUTPUTS_COUNTERS_TRENDS')
				]
			}
		];
		for (var TrendID in TrendsParams) {
			if (typeof TrendsParams[TrendID] !== 'function') {
				var TrendParams=JSON.stringify(TrendsParams[TrendID]);
				TrendsParamsString[TrendID]=TrendParams;
			}
		}
		trendsFirstRun=false;
	}
	return TrendsMenu;
}
//////////////////////////////////////////////////////////////////////////////////////////////
// public функции //
////////////////////


//////////////////////////////////////////////////////////////////////////////////////////////
// Формат вызова: trends_menu_click(result)
// Назначение: Обработчик выбора пункта меню.
// Параметры:
//             result - параметры выбранного пункта меню.
//////////////////////////////////////////////////////////////////////////////////////////////
function trends_menu_click(result) {
	ID=result.key;
	Params=TrendsParams[ID];
	showTrend(Params);
}

//////////////////////////////////////////////////////////////////////////////////////////////
// Формат вызова: showTrendByID(TrendID)
// Назначение: Вызов видеокадра для отображения трендов по идентификатору.
// Параметры:
//             TrendID - идентификатор отображаемых трендов.
//////////////////////////////////////////////////////////////////////////////////////////////
function showTrendByID(TrendID) {
	getTrendsMenu();
	Params=TrendsParams[TrendID];
	showTrend(Params);
}

//////////////////////////////////////////////////////////////////////////////////////////////
// Формат вызова: showTrend(Trend)
// Назначение: Вызов видеокадра для отображения трендов.
// Параметры:
//             Trend - параметры отображаемых трендов.
//////////////////////////////////////////////////////////////////////////////////////////////
function showTrend(Trend) {
	TrendsFrame.show(JSON.stringify({template:'trends',data:'trends',args:Trend}),TrendsMenu,TrendsParamsString);
}

//////////////////////////////////////////////////////////////////////////////////////////////
// Формат вызова: trendItem(Id)
// Назначение: Формирование пункта меню трендов.
// Параметры:
//             Id - идентификатор конфигурации трендов.
//////////////////////////////////////////////////////////////////////////////////////////////
function trendItem(Id) {
	return {text:TrendsParams[Id].header,id:Id};
}

//////////////////////////////////////////////////////////////////////////////////////////////
// Формат вызова: indItem(Name,Color,Group)
// Назначение: Формирование конфигурации тренда.
// Параметры:
//             Name 	- наименование линии тренда;
//             Color 	- наименование цвета линии тренда;
//             Group 	- номер группы линии тренда.
//////////////////////////////////////////////////////////////////////////////////////////////
function indItem(Name,Color,Group) {
	return {
		header:Name,
		type:LineType,
		group:Group,
		inverted:false,
		thickness:2.0,
		linestyle:SolidLineStyle,
		color:CustomColors[Color],
		color2:CustomColors[Color],
		symbolcode:0,
		scale:1.0,
		shift:0.0,
		lower_limit:0.0,
		upper_limit:0.0,
		lower_bound:0.0,
		upper_bound:0.0,
		labels:[]
	};
}

//////////////////////////////////////////////////////////////////////////////////////////////
// Формат вызова: indItemSplitted(Name,Color,Group,SplitGroup)
// Назначение: Формирование конфигурации тренда.
// Параметры:
//             Name 		- наименование линии тренда;
//             Color 		- наименование цвета линии тренда;
//             Group 		- номер группы линии тренда;
//             SplitGroup 	- имя группы для отображения линии тренда.
//////////////////////////////////////////////////////////////////////////////////////////////
function indItemSplitted(Name,Color,Group,SplitGroup) {
	return {
		header:Name,
		type:LineType,
		group:Group,
		split:SplitGroup,
		inverted:false,
		thickness:2.0,
		linestyle:SolidLineStyle,
		color:CustomColors[Color],
		color2:CustomColors[Color],
		symbolcode:0,
		scale:1.0,
		shift:0.0,
		lower_limit:0.0,
		upper_limit:0.0,
		lower_bound:0.0,
		upper_bound:0.0,
		labels:[]
	};
}

//////////////////////////////////////////////////////////////////////////////////////////////
// Формат вызова: indItemSplittedWithBounds(Name,Color,Group,SplitGroup,LowerBound,UpperBound)
// Назначение: Формирование конфигурации тренда.
// Параметры:
//             Name 		- наименование линии тренда;
//             Color 		- наименование цвета линии тренда;
//             Group 		- номер группы линии тренда;
//             SplitGroup 	- имя группы для отображения линии тренда;
//             LowerBound 	- нижняя граница шкалы линии тренда;
//             UpperBound 	- верхняя граница шкалы линии тренда.
//////////////////////////////////////////////////////////////////////////////////////////////
function indItemSplittedWithBounds(Name,Color,Group,SplitGroup,LowerBound,UpperBound) {
	return {
		header:Name,
		type:LineType,
		group:Group,
		split:SplitGroup,
		inverted:false,
		thickness:2.0,
		linestyle:SolidLineStyle,
		color:CustomColors[Color],
		color2:CustomColors[Color],
		symbolcode:0,
		scale:1.0,
		shift:0.0,
		lower_limit:0.0,
		upper_limit:0.0,
		lower_bound:LowerBound,
		upper_bound:UpperBound,
		labels:[]
	};
}

//////////////////////////////////////////////////////////////////////////////////////////////
// Формат вызова: indItemSplittedWithBoundsDigital(Name,Color,Group,SplitGroup,LowerBound,UpperBound)
// Назначение: Формирование конфигурации тренда.
// Параметры:
//             Name 		- наименование линии тренда;
//             Color 		- наименование цвета линии тренда;
//             Group 		- номер группы линии тренда;
//             SplitGroup 	- имя группы для отображения линии тренда;
//             LowerBound 	- нижняя граница шкалы линии тренда;
//             UpperBound 	- верхняя граница шкалы линии тренда.
//////////////////////////////////////////////////////////////////////////////////////////////
function indItemSplittedWithBoundsDigital(Name,Color,Group,SplitGroup,LowerBound,UpperBound) {
	return {
		header:Name,
		type:DigitalType,
		group:Group,
		split:SplitGroup,
		inverted:false,
		thickness:2.0,
		linestyle:SolidLineStyle,
		color:CustomColors[Color],
		color2:CustomColors[Color],
		symbolcode:0,
		scale:1.0,
		shift:0.0,
		lower_limit:0.0,
		upper_limit:0.0,
		lower_bound:LowerBound,
		upper_bound:UpperBound,
		labels:[]
	};
}

//////////////////////////////////////////////////////////////////////////////////////////////
// Формат вызова: indItemDigitalWithShiftAndLabels(Name,Group,Shift,Labels)
// Назначение: Формирование конфигурации тренда.
// Параметры:
//             Name 		- наименование линии тренда;
//             Group 		- номер группы линии тренда;
//             Shift 		- смещение значений;
//             Labels 		- маркировки.
//////////////////////////////////////////////////////////////////////////////////////////////
function indItemDigitalWithShiftAndLabels(Name,Group,Shift,Labels) {
	return {
		header:Name,
		type:DigitalType,
		group:Group,
		inverted:false,
		thickness:2.0,
		linestyle:SolidLineStyle,
		color:'0xFF0000',
		color2:'0x007F00',
		symbolcode:0,
		scale:1.0,
		shift:Shift,
		lower_limit:0.0,
		upper_limit:0.0,
		lower_bound:0.0,
		upper_bound:0.0,
		labels:Labels
	};
}

//////////////////////////////////////////////////////////////////////////////////////////////
// Формат вызова: indItemWithBounds(Name,Color,Group,LowerBound,UpperBound)
// Назначение: Формирование конфигурации тренда.
// Параметры:
//             Name 		- наименование линии тренда;
//             Color 		- наименование цвета линии тренда;
//             Group 		- номер группы линии тренда;
//             LowerBound 	- нижняя граница шкалы линии тренда;
//             UpperBound 	- верхняя граница шкалы линии тренда.
//////////////////////////////////////////////////////////////////////////////////////////////
function indItemWithBounds(Name,Color,Group,LowerBound,UpperBound) {
	return {
		header:Name,
		type:LineType,
		group:Group,
		inverted:false,
		thickness:2.0,
		linestyle:SolidLineStyle,
		color:CustomColors[Color],
		color2:CustomColors[Color],
		symbolcode:0,
		scale:1.0,
		shift:0.0,
		lower_limit:0.0,
		upper_limit:0.0,
		lower_bound:LowerBound,
		upper_bound:UpperBound,
		labels:[]
	};
}

//////////////////////////////////////////////////////////////////////////////////////////////
// Формат вызова: indItemWithBoundsWithLinestyle(Name,Color,Group,LowerBound,UpperBound,LineStyle)
// Назначение: Формирование конфигурации тренда.
// Параметры:
//             Name 		- наименование линии тренда;
//             Color 		- наименование цвета линии тренда;
//             Group 		- номер группы линии тренда;
//             LowerBound 	- нижняя граница шкалы линии тренда;
//             UpperBound 	- верхняя граница шкалы линии тренда;
//             LineStyle 	- стиль начертания линии тренда.
//////////////////////////////////////////////////////////////////////////////////////////////
function indItemWithBoundsWithLinestyle(Name,Color,Group,LowerBound,UpperBound,LineStyle) {
	return {
		header:Name,
		type:LineType,
		group:Group,
		inverted:false,
		thickness:2.0,
		linestyle:LineStyle,
		color:CustomColors[Color],
		color2:CustomColors[Color],
		symbolcode:0,
		scale:1.0,
		shift:0.0,
		lower_limit:0.0,
		upper_limit:0.0,
		lower_bound:LowerBound,
		upper_bound:UpperBound,
		labels:[]
	};
}

//////////////////////////////////////////////////////////////////////////////////////////////
// Формат вызова: indItemWithBoundsWithLinestyleDigital(Name,Color,Group,LowerBound,UpperBound,LineStyle)
// Назначение: Формирование конфигурации тренда.
// Параметры:
//             Name 		- наименование линии тренда;
//             Color 		- наименование цвета линии тренда;
//             Group 		- номер группы линии тренда;
//             LowerBound 	- нижняя граница шкалы линии тренда;
//             UpperBound 	- верхняя граница шкалы линии тренда;
//             LineStyle 	- стиль начертания линии тренда.
//////////////////////////////////////////////////////////////////////////////////////////////
function indItemWithBoundsWithLinestyleDigital(Name,Color,Group,LowerBound,UpperBound,LineStyle) {
	return {
		header:Name,
		type:DigitalType,
		group:Group,
		inverted:false,
		thickness:2.0,
		linestyle:LineStyle,
		color:CustomColors[Color],
		color2:CustomColors[Color],
		symbolcode:0,
		scale:1.0,
		shift:0.0,
		lower_limit:0.0,
		upper_limit:0.0,
		lower_bound:LowerBound,
		upper_bound:UpperBound,
		labels:[]
	};
}
//////////////////////////////////////////////////////////////////////////////////////////////
// Формат вызова: indItemWithBoundsInverted(Name,Color,Group,LowerBound,UpperBound)
// Назначение: Формирование конфигурации тренда.
// Параметры:
//             Name 		- наименование линии тренда;
//             Color 		- наименование цвета линии тренда;
//             Group 		- номер группы линии тренда;
//             LowerBound 	- нижняя граница шкалы линии тренда;
//             UpperBound 	- верхняя граница шкалы линии тренда.
//////////////////////////////////////////////////////////////////////////////////////////////
function indItemWithBoundsInverted(Name,Color,Group,LowerBound,UpperBound) {
	return {
		header:Name,
		type:LineType,
		group:Group,
		inverted:true,
		thickness:2.0,
		linestyle:SolidLineStyle,
		color:CustomColors[Color],
		color2:CustomColors[Color],
		symbolcode:0,
		scale:1.0,
		shift:0.0,
		lower_limit:0.0,
		upper_limit:0.0,
		lower_bound:LowerBound,
		upper_bound:UpperBound,
		labels:[]
	};
}

//////////////////////////////////////////////////////////////////////////////////////////////
// Формат вызова: trendsConfig(Name,ArgsStr,Indicators)
// Назначение: Формирование конфигурации трендов.
// Параметры:
//             Name 		- наименование трендов;
//             ArgsStr 		- параметры формирования данных;
//             Indicators 	- список конфигураций линий трендов.
//////////////////////////////////////////////////////////////////////////////////////////////
function trendsConfig(Name,ArgsStr,Indicators) {
	return {
		backcolor:'0xFFFFFF',
		header:Name,
		header_size:12,
		timescale:7200,
		args:ArgsStr,
		indicators:Indicators
	};
}

//////////////////////////////////////////////////////////////////////////////////////////////
// Формат вызова: dbConfig(TableName,TableFields)
// Назначение: Формирование конфигурации данных для трендов.
// Параметры:
//             TableName 	- имя таблицы баз данных;
//             TableFields 	- список полей таблицы баз данных.
//////////////////////////////////////////////////////////////////////////////////////////////
function dbConfig(TableName,TableFields) {
	return JSON.stringify(
		{
			'tables':
				[
					{
						'table':TableName,
						'fields':TableFields,
						'indexfield':'INDX',
						'scale':1.0,
						'shift':0.0
					}
				]
		}
	);
}

//////////////////////////////////////////////////////////////////////////////////////////////
// Формат вызова: dbConfig2(TableName1,TableFields1,TableName2,TableFields2)
// Назначение: Формирование конфигурации данных для трендов.
// Параметры:
//             TableName1 		- имя 1 таблицы баз данных;
//             TableFields1 	- список полей 1 таблицы баз данных;
//             TableName2 		- имя 2 таблицы баз данных;
//             TableFields2 	- список полей 2 таблицы баз данных.
//////////////////////////////////////////////////////////////////////////////////////////////
function dbConfig2(TableName1,TableFields1,TableName2,TableFields2) {
	return JSON.stringify(
		{
			'tables':
				[
					{
						'table':TableName1,
						'fields':TableFields1,
						'indexfield':'INDX',
						'scale':1.0,
						'shift':0.0
					},
					{
						'table':TableName2,
						'fields':TableFields2,
						'indexfield':'INDX',
						'scale':1.0,
						'shift':0.0
					}
				]
		}
	);
}

//////////////////////////////////////////////////////////////////////////////////////////////
// Формат вызова: dbConfig3(TableName1,TableFields1,TableName2,TableFields2,TableName3,TableFields3)
// Назначение: Формирование конфигурации данных для трендов.
// Параметры:
//             TableName1 		- имя 1 таблицы баз данных;
//             TableFields1 	- список полей 1 таблицы баз данных;
//             TableName2 		- имя 2 таблицы баз данных;
//             TableFields2 	- список полей 2 таблицы баз данных;
//             TableName3 		- имя 3 таблицы баз данных;
//             TableFields3 	- список полей 3 таблицы баз данных.
//////////////////////////////////////////////////////////////////////////////////////////////
function dbConfig3(TableName1,TableFields1,TableName2,TableFields2,TableName3,TableFields3) {
	return JSON.stringify(
		{
			'tables':
				[
					{
						'table':TableName1,
						'fields':TableFields1,
						'indexfield':'INDX',
						'scale':1.0,
						'shift':0.0
					},
					{
						'table':TableName2,
						'fields':TableFields2,
						'indexfield':'INDX',
						'scale':1.0,
						'shift':0.0
					},
					{
						'table':TableName3,
						'fields':TableFields3,
						'indexfield':'INDX',
						'scale':1.0,
						'shift':0.0
					}
				]
		}
	);
}

//////////////////////////////////////////////////////////////////////////////////////////////
// Формат вызова: indItem(Name,Color,Group)
// Назначение: Формирование конфигурации тренда.
// Параметры:
//             Name 	- наименование линии тренда;
//             Color 	- наименование цвета линии тренда;
//             Group 	- номер группы линии тренда.
//////////////////////////////////////////////////////////////////////////////////////////////
function indItems(Items) {
	var q=Items.length;
	var i;
	var res=[];
	var textLabels=[];
	for (i=0; i<q; i++) {
		textLabels[i*2]=Items[i].labelOff;
		textLabels[i*2+1]=Items[i].labelOn;
	}
	for (i=0; i<q; i++) {
		res[i]={
			header:Items[i].name,
			type:DigitalType,
			group:0,
			inverted:false,
			thickness:2.0,
			linestyle:SolidLineStyle,
			color:'0xFF0000',
			color2:'0x007F00',
			symbolcode:0,
			scale:1.0,
			shift:i*2,
			lower_limit:0.0,
			upper_limit:0.0,
			lower_bound:0.0,
			upper_bound:0.0,
			labels:i==0 ? textLabels : ''
		}
	}
	return res;
}

function updateTrends() {
	getURL(
		'/userscripts/trends.js',
		processTrendsUpdate
	);
}

function processTrendsUpdate(result) {
	if (result.success==true) {
		if (lastTrendsScript!='') {
			if (result.content.toString()==lastTrendsScript) {
			} else {
				window.evaluateScript(result.content.toString());
			}
		}
		lastTrendsScript=result.content.toString();
	}
}