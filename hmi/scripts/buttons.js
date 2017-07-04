//////////////////////////////////////////////////////////////////////////////////////////////
// Автор: Владимир Щербина <vns.scherbina@gmail.com>
// copyright 2017
// Версия: 1.0.0
// Модуль buttons.js реализует анимацию элементов как кнопок.
//////////////////////////////////////////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////////////////////////////////////////
// Локальные переменные //
//////////////////////////
var 
	buttonActivated='#00ff00',
	buttonDeactivated='#ffffff';
	lastFilter='none';

//////////////////////////////////////////////////////////////////////////////////////////////
// public функции //
////////////////////

//////////////////////////////////////////////////////////////////////////////////////////////
// Формат вызова: setButton(elementID,buttonScript)
// Назначение: Задание анимации элемента как кнопки с исполнением кода по нажатию,
//             подсвечиванием нажатия и отпускания кнопки "мыши".
// Параметры:
//             elementID - идентификатор элемента, являющегося группой, для которого задается
//                         анимация;
//             buttonScript - строка задающая код, который исполняется при нажатии на элемент.
//////////////////////////////////////////////////////////////////////////////////////////////
function setButton(elementID,buttonScript) {
	setHover(elementID);
	setActivate(elementID);
	setHandler(elementID,'onactivate',fold_event_propagation(buttonScript));
}

//////////////////////////////////////////////////////////////////////////////////////////////
// Формат вызова: setHighlightButton(elementID,buttonScript)
// Назначение: Задание анимации элемента как кнопки с исполнением кода по нажатию и
//             подсвечиванием наведения курсора на элемент.
// Параметры:
//             elementID - идентификатор элемента, являющегося группой, для которого задается
//                         анимация;
//             buttonScript - строка задающая код, который исполняется при нажатии на элемент.
//////////////////////////////////////////////////////////////////////////////////////////////
function setHighlightButton(elementID,buttonScript) {
	setHighlight(elementID);
	setHandler(elementID,'onactivate',fold_event_propagation(buttonScript));
}

//////////////////////////////////////////////////////////////////////////////////////////////
// Формат вызова: setImmediateButton(elementID,buttonScriptDown,buttonScriptUp)
// Назначение: Задание анимации элемента как кнопки с исполнением кода по нажатию и отжатию
//             подсвечиванием наведения курсора на элемент.
// Параметры:
//             elementID - идентификатор элемента, являющегося группой, для которого задается
//                         анимация;
//             buttonScriptDown - строка задающая код, который исполняется при нажатии на элемент;
//             buttonScriptUp 	- строка задающая код, который исполняется при отжатии на элементе.
//////////////////////////////////////////////////////////////////////////////////////////////
function setImmediateButton(elementID,buttonScriptDown,buttonScriptUp) {
	setHighlight(elementID);
	setHandler(elementID,'onmousedown',fold_event_propagation(buttonScriptDown));
	setHandler(elementID,'onmouseup',fold_event_propagation(buttonScriptUp));
	setHandler(elementID,'onmouseout',fold_event_propagation('dehighlight(\''+elementID+'\'); '+buttonScriptUp));
}

//////////////////////////////////////////////////////////////////////////////////////////////
// Формат вызова: setHoverButton(elementID,buttonScript)
// Назначение: Задание анимации элемента как кнопки с исполнением кода по наведению курсором мыши на элемент.
// Параметры:
//             elementID - идентификатор элемента, являющегося группой, для которого задается
//                         анимация;
//             buttonScript - строка задающая код, который исполняется при нажатии на элемент.
//////////////////////////////////////////////////////////////////////////////////////////////
function setHoverButton(elementID,buttonScript) {
	create_hightlignt(elementID);
	setHandler(elementID,'onmouseover',fold_event_propagation('highlight(\''+elementID+'\');'+buttonScript));
	setHandler(elementID,'onmouseout',fold_event_propagation('dehighlight(\''+elementID+'\');'));
}

//////////////////////////////////////////////////////////////////////////////////////////////
// Формат вызова: setClickButton(elementID,buttonScript)
// Назначение: Задание анимации элемента как кнопки с исполнением кода по нажатию.
// Параметры:
//             elementID - идентификатор элемента, являющегося группой, для которого задается
//                         анимация;
//             buttonScript - строка задающая код, который исполняется при нажатии на элемент.
//////////////////////////////////////////////////////////////////////////////////////////////
function setClickButton(elementID,buttonScript) {
	setHandler(elementID,'onactivate',fold_event_propagation(buttonScript));
}


//////////////////////////////////////////////////////////////////////////////////////////////
// private функции //
/////////////////////

function setHover(elementID) {
	create_hightlignt(elementID);
	setHandler(elementID,'onmouseover',fold_event_propagation('hover(\''+elementID+'\');'));
	setHandler(elementID,'onmouseout',fold_event_propagation('dehover(\''+elementID+'\');'));
}

function setHighlight(elementID) {
	create_hightlignt(elementID);
	setHandler(elementID,'onmouseover',fold_event_propagation('highlight(\''+elementID+'\');'));
	setHandler(elementID,'onmouseout',fold_event_propagation('dehighlight(\''+elementID+'\');'));
}

function setActivate(elementID) {
	setHandler(elementID,'onmousedown',fold_event_propagation('activate(\''+elementID+'\');'));
	setHandler(elementID,'onmouseup',fold_event_propagation('deactivate(\''+elementID+'\');'));
}

function hover(elementID) {
	show_highlight(elementID);
}

function dehover(elementID) {
	hide_highlight(elementID);
}

function highlight(elementID) {
	show_highlight(elementID);
}

function dehighlight(elementID) {
	hide_highlight(elementID);
}

function create_hightlignt(elementID) {
	node=byID(elementID);
	if (node==null) {
		alert('Отсутствует элемент: \''+elementID+'\'');
	}
	bbox=node.getBBox();
	bbox_x=bbox.getX();
	bbox_y=bbox.getY();
	bbox_width=bbox.getWidth();
	bbox_height=bbox.getHeight();
	var NS='http://www.w3.org/2000/svg';
	var rect=document.createElementNS(NS,'rect');
	rect.setAttributeNS(null,'x',bbox_x+2);
	rect.setAttributeNS(null,'y',bbox_y+2);
	rect.setAttributeNS(null,'width',bbox_width-4);
	rect.setAttributeNS(null,'height',bbox_height-4);
	rect.setAttributeNS(null,'style','fill:none;fill-opacity:0;stroke:rgb(172,0,0);stroke-width:3.0;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:4;stroke-opacity:1;stroke-dasharray:10,10;stroke-dashoffset:0;display:none');
	rect.setAttributeNS(null,'id',elementID+'_highlight');
	node.appendChild(rect);
}

function show_highlight(elementID) {
	setVisibility(elementID+'_highlight',true);
}

function hide_highlight(elementID) {
	setVisibility(elementID+'_highlight',false);
}

function activate(elementID) {
	node=getFirstNode(byID(elementID));
	if (node!=null) {
		id=node.getAttribute('id');
		setStyle(id,'fill', buttonActivated);
	}
}

function deactivate(elementID) {
	node=getFirstNode(byID(elementID));
	if (node!=null) {
		id=node.getAttribute('id');
		setStyle(id,'fill', buttonDeactivated);
	}
}

function getFirstNode(Element) {
	var child = Element.firstChild;
	var	exitFlag=false;
	while (exitFlag==false) {
		if (child!=null) {
			if (child.nodeType==1) {
				exitFlag=true;
			}
		} else {
			exitFlag=true;
		}
		if (exitFlag==false) {
			child=child.nextSibling;
		}
	}
	return child;
}
