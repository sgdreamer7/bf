//////////////////////////////////////////////////////////////////////////////////////////////
// Автор: Владимир Щербина <vns.scherbina@gmail.com>
// copyright 2017
// Версия: 1.0.0
// Модуль buttons_menu.js реализует анимацию и логику диалогового взаимодействия для кнопок вызова видеокадров.
//////////////////////////////////////////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////////////////////////////////////////
// Локальные переменные //
//////////////////////////

////////////////////////////////////////////////////////////////////////////////
// Инициализация
////////////////////////////////////////////////////////////////////////////////
	DiagnosticsFramesMenu=[
		{text:'Диагностика УСО Momentum для токовых сигналов',id:'momentum_diag.svg'},
		{text:'Диагностика УСО ICP для термопарных сигналов',id:'icp_diag.svg'},
		{text:'Диагностика МПК1, модули №№ 2, 3, 4, 5, 6, 7, 8, 9',id:'mpk1_diag.svg'},
		{text:'Диагностика МПК2, модули №№ 2, 4',id:'mpk2_diag.svg'},
		{text:'Диагностика датчиков Fisher-Rosemount',id:'fisher_diag.svg'},
		{text:'Диагностика источников бесперебойного питания',id:'ups_diag.svg'},
		{text:'Перечень тегов',id:'tag_info.svg'},
		{text:'Настройки регуляторов',id:'pids.svg'}		
	];

//////////////////////////////////////////////////////////////////////////////////////////////
// public функции //
////////////////////

/////////////////////////////////////////////////////////////////////////////////////////////
// Формат вызова: frames_menu_click(result)
// Назначение: Обработчик выбора пункта меню.
// Параметры:
//             result - параметры выбранного пункта меню.
//////////////////////////////////////////////////////////////////////////////////////////////
function frames_menu_click(result) {
	openFrame(result.key);
}

//////////////////////////////////////////////////////////////////////////////////////////////
// Формат вызова: init_buttons_menu()
// Назначение: Начальная инициализация кнопок вызова видеокадров.
// Параметры: -
//////////////////////////////////////////////////////////////////////////////////////////////
function init_buttons_menu() {	
	setHighlightButton('TRENDS_BUTTON','popupMenu(getTrendsMenu(),trends_menu_click);');
	setHighlightButton('REPORTS_BUTTON','popupMenu(ReportsMenu,reports_menu_click);');
	setHighlightButton('LOGIN_BUTTON','login_click();');
	setHighlightButton('DIAGNOSTICS_BUTTON','diagnostics_click();');
	setHighlightButton('ALARM_BUTTON','alarm_click();');

	setHighlightButton('CHARGE_BUTTON','charge_click();');
	setHighlightButton('FURNACE_BUTTON','furnace_click();');
	setHighlightButton('STOVES_BUTTON','stoves_click();');
	
	addKeyAction(charge_click,KeyEvent.VK_F1,0);
	addKeyAction(furnace_click,KeyEvent.VK_F2,0);
	addKeyAction(stoves_click,KeyEvent.VK_F3,0);
	
	addKeyAction(alarm_click,KeyEvent.VK_A,KeyEvent.CTRL_MASK);
	addKeyAction(diagnostics_click,KeyEvent.VK_D,KeyEvent.CTRL_MASK);
	addKeyAction(function() { popupMenu(getTrendsMenu(),trends_menu_click); },KeyEvent.VK_T,KeyEvent.CTRL_MASK);
	addKeyAction(function() { popupMenu(ReportsMenu,reports_menu_click); },KeyEvent.VK_P,KeyEvent.CTRL_MASK);
}

//////////////////////////////////////////////////////////////////////////////////////////////
// Формат вызова: init_basic_buttons_menu()
// Назначение: Начальная инициализация базовых кнопок вызова видеокадров.
// Параметры: -
//////////////////////////////////////////////////////////////////////////////////////////////
function init_basic_buttons_menu() {	
	setHighlightButton('TRENDS_BUTTON','popupMenu(getTrendsMenu(),trends_menu_click);');
	setHighlightButton('REPORTS_BUTTON','popupMenu(ReportsMenu,reports_menu_click);');
	setHighlightButton('LOGIN_BUTTON','login_click();');
	setHighlightButton('DIAGNOSTICS_BUTTON','diagnostics_click();');
	setHighlightButton('ALARM_BUTTON','alarm_click();');

	addKeyAction(alarm_click,KeyEvent.VK_A,KeyEvent.CTRL_MASK);
	addKeyAction(diagnostics_click,KeyEvent.VK_D,KeyEvent.CTRL_MASK);
	addKeyAction(function() { popupMenu(getTrendsMenu(),trends_menu_click); },KeyEvent.VK_T,KeyEvent.CTRL_MASK);
	addKeyAction(function() { popupMenu(ReportsMenu,reports_menu_click); },KeyEvent.VK_P,KeyEvent.CTRL_MASK);
}

//////////////////////////////////////////////////////////////////////////////////////////////
// Формат вызова: init_basic_without_diags_buttons_menu()
// Назначение: Начальная инициализация базовых кнопок вызова видеокадров, без диагностики.
// Параметры: -
//////////////////////////////////////////////////////////////////////////////////////////////
function init_basic_without_diags_buttons_menu() {	
	setHighlightButton('TRENDS_BUTTON','popupMenu(getTrendsMenu(),trends_menu_click);');
	setHighlightButton('REPORTS_BUTTON','popupMenu(ReportsMenu,reports_menu_click);');
	setHighlightButton('LOGIN_BUTTON','login_click();');
	setHighlightButton('ALARM_BUTTON','alarm_click();');

	addKeyAction(alarm_click,KeyEvent.VK_A,KeyEvent.CTRL_MASK);
	addKeyAction(function() { popupMenu(getTrendsMenu(),trends_menu_click); },KeyEvent.VK_T,KeyEvent.CTRL_MASK);
	addKeyAction(function() { popupMenu(ReportsMenu,reports_menu_click); },KeyEvent.VK_P,KeyEvent.CTRL_MASK);
}

//////////////////////////////////////////////////////////////////////////////////////////////
// private функции //
/////////////////////

//////////////////////////////////////////////////////////////////////////////////////////////
// Формат вызова: alarm_click()
// Назначение: Обработчик нажатия на кнопку вызова видеокадра отображения аварийных сообщений.
// Параметры: -
//////////////////////////////////////////////////////////////////////////////////////////////
function alarm_click() {
	openFrame('alarm.svg');
}

//////////////////////////////////////////////////////////////////////////////////////////////
// Формат вызова: login_click()
// Назначение: Обработчик нажатия на кнопку блокировки/деблокировки пользовательского интерфейса.
// Параметры: -
//////////////////////////////////////////////////////////////////////////////////////////////
function login_click() {
	lock_unlock();
}

//////////////////////////////////////////////////////////////////////////////////////////////
// Формат вызова: diagnostics_click()
// Назначение: Обработчик нажатия на кнопку вызова видеокадра отображения диагностики.
// Параметры: -
//////////////////////////////////////////////////////////////////////////////////////////////
function diagnostics_click() {
	popupMenu(DiagnosticsFramesMenu,frames_menu_click);
}

//////////////////////////////////////////////////////////////////////////////////////////////
// Формат вызова: charge_click()
// Назначение: Обработчик нажатия на кнопку вызова видеокадра отображения параметров загрузки.
// Параметры: -
//////////////////////////////////////////////////////////////////////////////////////////////
function charge_click() {
	openFrame('charge.svg');
}

//////////////////////////////////////////////////////////////////////////////////////////////
// Формат вызова: furnace_click()
// Назначение: Обработчик нажатия на кнопку вызова видеокадра отображения параметров доменной печи.
// Параметры: -
//////////////////////////////////////////////////////////////////////////////////////////////
function furnace_click() {
	openFrame('furnace.svg');
}

//////////////////////////////////////////////////////////////////////////////////////////////
// Формат вызова: stoves_click()
// Назначение: Обработчик нажатия на кнопку вызова видеокадра отображения параметров блока воздухонагревателей.
// Параметры: -
//////////////////////////////////////////////////////////////////////////////////////////////
function stoves_click() {
	openFrame('stoves.svg');
}