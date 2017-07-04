//////////////////////////////////////////////////////////////////////////////////////////////
// Автор: Владимир Щербина <vns.scherbina@gmail.com>
// copyright 2017
// Версия: 1.0.0
// Модуль tag_info.js реализует анимацию и логику диалогового взаимодействия для видеокадра tag_info.
//////////////////////////////////////////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////////////////////////////////////////
// Локальные переменные //
//////////////////////////
var NormalColor='rgb(0,255,0)';
var InactiveColor='rgb(255,0,0)';
var UndefinedColor='rgb(255,255,255)';
var TableRows=75;
var MultiPages=5;
var PageNumber=1;
var PagesQuantity=0;
var TagsList=null;
var tsStart=new Date();
var tsFinish=new Date();
var tsDiff=0;
var lastCommCounter=0;
var currentMessage=1;
var MessagesQuantity;
var avgDiff=new FIFO(30);
var foundTag="";

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
	var i;
	var j;


	setButton('EXIT_BUTTON','exit_click();');
	setButton('TRENDS_BUTTON','popupMenu(getTrendsMenu(),trends_menu_click);');
	setButton('REPORTS_BUTTON','popupMenu(ReportsMenu,reports_menu_click);');
	setButton('ALARM_BUTTON','alarm_click();');
	setButton('LOGIN_BUTTON','login_click();');
	var BackgroundStyle='fill:#ffffff;fill-opacity:1;stroke:#000000;stroke-width:1.0;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:4;stroke-opacity:1;stroke-dasharray:none';

	var Col1Width=50;
	var Col2Width=300;
	var Col3Width=750;
	var Col4Width=240;
	var Col5Width=70;
	var Col6Width=70;
	var Col7Width=100;
	var Col8Width=100;
	var Col9Width=100;
	var Col10Width=100;
	
	var Header1={width:Col1Width,background:BackgroundStyle,align:'middle',text:'№ п/п'};
	var Header2={width:Col2Width,background:BackgroundStyle,align:'middle',text:'Тег'};
	var Header3={width:Col3Width,background:BackgroundStyle,align:'middle',text:'Наименование'};
	var Header4={width:Col4Width,background:BackgroundStyle,align:'middle',text:'Значение'};
	var Header5={width:Col5Width,background:BackgroundStyle,align:'middle',text:'Сигнализ.'};
	var Header6={width:Col6Width,background:BackgroundStyle,align:'middle',text:'Приоритет'};
	var Header7={width:Col7Width,background:BackgroundStyle,align:'middle',text:'LOLO'};
	var Header8={width:Col8Width,background:BackgroundStyle,align:'middle',text:'LO'};
	var Header9={width:Col9Width,background:BackgroundStyle,align:'middle',text:'HI'};
	var Header10={width:Col10Width,background:BackgroundStyle,align:'middle',text:'HIHI'};

	var Col1={width:Col1Width,background:BackgroundStyle,align:'middle',text:''};
	var Col2={width:Col2Width,background:BackgroundStyle,align:'start',text:''};
	var Col3={width:Col3Width,background:BackgroundStyle,align:'start',text:''};
	var Col4={width:Col4Width,background:BackgroundStyle,align:'start',text:''};
	var Col5={width:Col5Width,background:BackgroundStyle,align:'middle',text:''};
	var Col6={width:Col6Width,background:BackgroundStyle,align:'middle',text:''};
	var Col7={width:Col7Width,background:BackgroundStyle,align:'middle',text:''};
	var Col8={width:Col8Width,background:BackgroundStyle,align:'middle',text:''};
	var Col9={width:Col9Width,background:BackgroundStyle,align:'middle',text:''};
	var Col10={width:Col10Width,background:BackgroundStyle,align:'middle',text:''};

	var RowData=[Col1,Col2,Col3,Col4,Col5,Col6,Col7,Col8,Col9,Col10];

	var Table=[
		[Header1,Header2,Header3,Header4,Header5,Header6,Header7,Header8,Header9,Header10]
	];
	for (i=1; i<TableRows; i++) {
		Table[i]=RowData;
	}

	createTable('TAGS_TABLE',Table);
	
	for (i=1; i<TableRows; i++) {
		setTableCellOnactivate('TAGS_TABLE',i,2,'editTagField('+i.format(0,'')+',2);');
		setTableCellOnactivate('TAGS_TABLE',i,4,'editTagField('+i.format(0,'')+',4);');
		setTableCellOnactivate('TAGS_TABLE',i,5,'editTagField('+i.format(0,'')+',5);');
		setTableCellOnactivate('TAGS_TABLE',i,6,'editTagField('+i.format(0,'')+',6);');
		setTableCellOnactivate('TAGS_TABLE',i,7,'editTagField('+i.format(0,'')+',7);');
		setTableCellOnactivate('TAGS_TABLE',i,8,'editTagField('+i.format(0,'')+',8);');
		setTableCellOnactivate('TAGS_TABLE',i,9,'editTagField('+i.format(0,'')+',9);');
	}

	setHighlightButton('RIGHTPAGES_BUTTON','right_pages_click();');
	setHighlightButton('RIGHTPAGE_BUTTON','right_page_click();');
	setHighlightButton('LEFTPAGE_BUTTON','left_page_click();');
	setHighlightButton('LEFTPAGES_BUTTON','left_pages_click();');
	setHighlightButton('SEARCH_BUTTON','search_click();');
	
	addKeyAction(exit_click,KeyEvent.VK_ESCAPE,0);
	addKeyAction(alarm_click,KeyEvent.VK_A,KeyEvent.CTRL_MASK);
	addKeyAction(function() { popupMenu(getTrendsMenu(),trends_menu_click); },KeyEvent.VK_T,KeyEvent.CTRL_MASK);
	addKeyAction(function() { popupMenu(ReportsMenu,reports_menu_click); },KeyEvent.VK_P,KeyEvent.CTRL_MASK);
	addKeyAction(function() { right_pages_click(); },KeyEvent.VK_RIGHT,KeyEvent.CTRL_MASK);
	addKeyAction(function() { right_page_click(); },KeyEvent.VK_RIGHT,0);
	addKeyAction(function() { left_page_click(); },KeyEvent.VK_LEFT,0);
	addKeyAction(function() { left_pages_click(); },KeyEvent.VK_LEFT,KeyEvent.CTRL_MASK);
	addKeyAction(search_click,KeyEvent.VK_F,KeyEvent.CTRL_MASK);
	addKeyAction(function() { exitApp(); },KeyEvent.VK_Q,KeyEvent.CTRL_MASK);
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
	animate_tags();
	setText('BACKEND','Текущий активный сервер: \''+Main.lastBackend+'\''+(Main.getSelectedBackend()=='' ? ' (автоматически)' : ' (вручную)'));
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
// Формат вызова: animate_tags()
// Назначение: Анимация для отображения значений тегов.
// Параметры: -
//////////////////////////////////////////////////////////////////////////////////////////////
function animate_tags() {
	if (currentMessage==1) {
		var TagsListRes=[];
		TagsListRes[0]=Main.getTagsList();
		TagsList=process_tags_list(TagsListRes);
		MessagesQuantity=TagsList.length;
		PagesQuantity=Math.floor(MessagesQuantity/(TableRows-1))+1;
		if (PageNumber>PagesQuantity) {
			PageNumber=PagesQuantity;
		}
		setText('PageNumber',PageNumber.format(0,''));
		setText('PagesQuantity',PagesQuantity.format(0,''));
	}
	if (TagsList!=null) {
		var i=currentMessage;
		var Index=(PageNumber-1)*(TableRows-1)+i-1;
		var RowColor;
		if (Index<MessagesQuantity) {
			TagName=TagsList[Index];
			RowColor=((getStrTag(TagName+'.A_CV')=='да') || (getStrTag(TagName+'.A_CV')=='норма') || (getStrTag(TagName+'.A_CV')=='есть')) ? NormalColor : ((getStrTag(TagName+'.A_CV')=='нет') || (getStrTag(TagName+'.A_CV')=='сработка')) ? InactiveColor : UndefinedColor;
			RowColor=foundTag==TagName ? 'rgb(0,0,255)' : RowColor;
			setTableText('TAGS_TABLE',i,0,(Index+1).format(0,''));
			setTableText('TAGS_TABLE',i,1,TagName);
			setTableText('TAGS_TABLE',i,2,getStrTag(TagName+'.A_DESC'));
			setTableText('TAGS_TABLE',i,3,(getStrTag(TagName+'.A_CV')+' '+getStrTag(TagName+'.A_EGUDESC')).substr(0,48));
			setTableText('TAGS_TABLE',i,4,getBoolTag(TagName+'.F_ENAB') ? 'Да' : 'Нет');
			setTableText('TAGS_TABLE',i,5,getFltTag(TagName+'.F_PRI').format(0,''));
			if (getStrTag(TagName+'.A_ETAG')=='ANALOG') {
				setTableText('TAGS_TABLE',i,6,getFltTag(TagName+'.F_LOLO').toString());
				setTableText('TAGS_TABLE',i,7,getFltTag(TagName+'.F_LO').toString());
				setTableText('TAGS_TABLE',i,8,getFltTag(TagName+'.F_HI').toString());
				setTableText('TAGS_TABLE',i,9,getFltTag(TagName+'.F_HIHI').toString());
			} else if (getStrTag(TagName+'.A_ETAG')=='DIGITAL') {
				setTableText('TAGS_TABLE',i,6,'\''+getStrTag(TagName+'.A_OPENDESC')+'\'');
				setTableText('TAGS_TABLE',i,7,'\''+getStrTag(TagName+'.A_CLOSEDESC')+'\'');
				setTableText('TAGS_TABLE',i,8,'');
				setTableText('TAGS_TABLE',i,9,getStrTag(TagName+'.A_ALMCK'));
			} else {
				setTableText('TAGS_TABLE',i,6,'');
				setTableText('TAGS_TABLE',i,7,'');
				setTableText('TAGS_TABLE',i,8,'');
				setTableText('TAGS_TABLE',i,9,'');	
			}
		} else {
			RowColor=UndefinedColor;
			setTableText('TAGS_TABLE',i,0,'');
			setTableText('TAGS_TABLE',i,1,'');
			setTableText('TAGS_TABLE',i,2,'');
			setTableText('TAGS_TABLE',i,3,'');
			setTableText('TAGS_TABLE',i,4,'');
			setTableText('TAGS_TABLE',i,5,'');
			setTableText('TAGS_TABLE',i,6,'');
			setTableText('TAGS_TABLE',i,7,'');
			setTableText('TAGS_TABLE',i,8,'');
			setTableText('TAGS_TABLE',i,9,'');
		}
		setTableBackColor('TAGS_TABLE',i,0,RowColor);
		setTableBackColor('TAGS_TABLE',i,1,RowColor);
		setTableBackColor('TAGS_TABLE',i,2,RowColor);
		setTableBackColor('TAGS_TABLE',i,3,RowColor);
		setTableBackColor('TAGS_TABLE',i,4,RowColor);
		setTableBackColor('TAGS_TABLE',i,5,RowColor);
		setTableBackColor('TAGS_TABLE',i,6,RowColor);
		setTableBackColor('TAGS_TABLE',i,7,RowColor);
		setTableBackColor('TAGS_TABLE',i,8,RowColor);
		setTableBackColor('TAGS_TABLE',i,9,RowColor);
		currentMessage=currentMessage==(TableRows-1) ? 1: currentMessage+1;
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
// Формат вызова: left_pages_click()
// Назначение: Обработчик нажатия на кнопку перехода на первую страницу.
// Параметры: -
//////////////////////////////////////////////////////////////////////////////////////////////
function left_pages_click() {
	var NewPageNumber=PageNumber-MultiPages;
	if (NewPageNumber<1) {
		NewPageNumber=1;
	}
	PageNumber=NewPageNumber;
}

//////////////////////////////////////////////////////////////////////////////////////////////
// Формат вызова: left_page_click()
// Назначение: Обработчик нажатия на кнопку перехода на предыдущую страницу.
// Параметры: -
//////////////////////////////////////////////////////////////////////////////////////////////
function left_page_click() {
	var NewPageNumber=PageNumber-1;
	if (NewPageNumber<1) {
		NewPageNumber=1;
	}
	PageNumber=NewPageNumber;
}

//////////////////////////////////////////////////////////////////////////////////////////////
// Формат вызова: right_page_click()
// Назначение: Обработчик нажатия на кнопку перехода на следующую страницу.
// Параметры: -
//////////////////////////////////////////////////////////////////////////////////////////////
function right_page_click() {
	var NewPageNumber=PageNumber+1;
	if (NewPageNumber>PagesQuantity) {
		NewPageNumber=PagesQuantity;
	}
	PageNumber=NewPageNumber;
}

//////////////////////////////////////////////////////////////////////////////////////////////
// Формат вызова: right_pages_click()
// Назначение: Обработчик нажатия на кнопку перехода на последнюю страницу.
// Параметры: -
//////////////////////////////////////////////////////////////////////////////////////////////
function right_pages_click() {
	var NewPageNumber=PageNumber+MultiPages;
	if (NewPageNumber>PagesQuantity) {
		NewPageNumber=PagesQuantity;
	}
	PageNumber=NewPageNumber;
}

//////////////////////////////////////////////////////////////////////////////////////////////
// Формат вызова: search_click()
// Назначение: Обработчик нажатия на кнопку поиска тега по имени.
// Параметры: -
//////////////////////////////////////////////////////////////////////////////////////////////
function search_click() {
	var i=0;
	var foundIndex=-1;
	var res=prompt("Введите имя искомого тега:","");
	if (res!=null) {
		if (res!="") {
			for (i=(PageNumber-1)*(TableRows-1)+1; i<TagsList.length; i++) {
				if (TagsList[i].indexOf(res)>=0) {
					foundIndex=i;
					foundTag=TagsList[i];
					break;
				}
			}
			if (foundIndex>=0) {
				PageNumber=Math.floor(foundIndex/(TableRows-1))+1;		
			}
		}
	}
}

//////////////////////////////////////////////////////////////////////////////////////////////
// private функции //
/////////////////////

//////////////////////////////////////////////////////////////////////////////////////////////
// Формат вызова: login_click()
// Назначение: Обработчик нажатия на кнопку блокировки/деблокировки пользовательского интерфейса.
// Параметры: -
//////////////////////////////////////////////////////////////////////////////////////////////
function  login_click() {
	lock_unlock();
}

//////////////////////////////////////////////////////////////////////////////////////////////
// Формат вызова: alarm_click()
// Назначение: Обработчик нажатия на кнопку вызова видеокадра отображения аварийных сообщений.
// Параметры: -
//////////////////////////////////////////////////////////////////////////////////////////////
function  alarm_click() {
	openFrame('alarm.svg');
}

//////////////////////////////////////////////////////////////////////////////////////////////
// Формат вызова: exitApp()
// Назначение: Завершение работы клитентского приложения.
// Параметры: -
//////////////////////////////////////////////////////////////////////////////////////////////
function exitApp() {
	Packages.com.cmas.hmi.Main.exitApp();
}

function editTagField(Row,Col) {
	var res;
	var editedTagName=TagsList[(PageNumber-1)*(TableRows-1)+Row-1];
	if ((PageNumber-1)*(TableRows-1)+Row-1<MessagesQuantity) {
		if (Col==2) {
			var tagDesc=getStrTag(editedTagName+'.A_DESC');
			res=prompt('Введите новое наименование тега \''+editedTagName+'\':', tagDesc);
			if (!(res==null)) {
				setStrTag(editedTagName+'.A_DESC',new java.lang.String(res));
			}
		} else if (Col==4) {
			var tagEnab=getBoolTag(editedTagName+'.F_ENAB');
			if (tagEnab==true) {
				if (confirm('Вы уверены, что хотите выключить аварийную и предупредительную сигнализацию для тега \''+editedTagName+'\'?')==true) {
					setBoolTag(editedTagName+'.F_ENAB',false);
				}
			} else {
				if (confirm('Вы уверены, что хотите включить аварийную и предупредительную сигнализацию для тега \''+editedTagName+'\'?')==true) {
					setBoolTag(editedTagName+'.F_ENAB',true);
				}
			}
		} else if (Col==5) {
			changeRefValue(editedTagName+'.F_PRI',1,1000,'\'F_PRI\' для тега \''+editedTagName+'\'');
		}
		if (getStrTag(editedTagName+'.A_ETAG')=='ANALOG') {
			if (Col==6) {
				changeRefValue(editedTagName+'.F_LOLO',-1000000000000,1000000000000,'\'LOLO\' для тега \''+editedTagName+'\'');
			} else if (Col==7) {
				changeRefValue(editedTagName+'.F_LO',-1000000000000,1000000000000,'\'LO\' для тега \''+editedTagName+'\'');
			} else if (Col==8) {
				changeRefValue(editedTagName+'.F_HI',-1000000000000,1000000000000,'\'HI\' для тега \''+editedTagName+'\'');
			} else if (Col==9) {
				changeRefValue(editedTagName+'.F_HIHI',-1000000000000,1000000000000,'\'HIHI\' для тега \''+editedTagName+'\'');
			}
		} else if (getStrTag(editedTagName+'.A_ETAG')=='DIGITAL') {
			if (Col==6) {
				var tagOpenDesc=getStrTag(editedTagName+'.A_OPENDESC');
				res=prompt('Введите новое наименование состояния \'0\' для тега \''+editedTagName+'\':', tagOpenDesc);
				if (!(res==null)) {
					setStrTag(editedTagName+'.A_OPENDESC',new java.lang.String(res));
				}
			} else if (Col==7) {
				var tagCloseDesc=getStrTag(editedTagName+'.A_CLOSEDESC');
				res=prompt('Введите новое наименование состояния \'1\' для тега \''+editedTagName+'\':', tagCloseDesc);
				if (!(res==null)) {
					setStrTag(editedTagName+'.A_CLOSEDESC',new java.lang.String(res));
				}
			} else if (Col==9) {
				var tagAlmck=getStrTag(editedTagName+'.A_ALMCK');
				if (tagAlmck=='NONE') {
					setStrTag(editedTagName+'.A_ALMCK','OPEN');
				} else if (tagAlmck=='OPEN') {
					setStrTag(editedTagName+'.A_ALMCK','CLOSE');
				} else if (tagAlmck=='CLOSE') {
					setStrTag(editedTagName+'.A_ALMCK','CHANGE');
				} else if (tagAlmck=='CHANGE') {
					setStrTag(editedTagName+'.A_ALMCK','NONE');
				} else {
					setStrTag(editedTagName+'.A_ALMCK','NONE');
				}
			}
		}
	}
}

