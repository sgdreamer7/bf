//////////////////////////////////////////////////////////////////////////////////////////////
// Автор: Владимир Щербина <vns.scherbina@gmail.com>
// copyright 2017
// Версия: 1.0.0
// Модуль tables.js реализует функции создания таблиц.
//////////////////////////////////////////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////////////////////////////////////////
// public функции //
////////////////////

//////////////////////////////////////////////////////////////////////////////////////////////
// Формат вызова: createTable(ElementID,TableDesc)
// Назначение: Построение таблицы.
// Параметры:
//             elementID - идентификатор объекта, который заменяется на построенную таблицу;
//             TableDesc - спецификация создаваемой талицы.
//////////////////////////////////////////////////////////////////////////////////////////////
function createTable(ElementID,TableDesc) {
	var NS='http://www.w3.org/2000/svg';

	var obj=byID(ElementID);
	var x=parseInt(obj.getAttribute('x'));
	var y=parseInt(obj.getAttribute('y'));
	var width=parseInt(obj.getAttribute('width'));
	var height=parseInt(obj.getAttribute('height'));
	var table=document.createElementNS(NS,'g');
	table.setAttributeNS(null,'x',x);
	table.setAttributeNS(null,'y',y);
	table.setAttributeNS(null,'width',width);
	table.setAttributeNS(null,'height',height);
	table.setAttributeNS(null,'id',ElementID);

	var rowsQuantity=TableDesc.length;
	var rowHeight=height/rowsQuantity;
	r=0;
	while (r<rowsQuantity) {
		var RowData=TableDesc[r];
		var colsQuantity=RowData.length;
		var xpos=x;
		var ypos=y+r*rowHeight;
		var row=document.createElementNS(NS,'g');
		row.setAttributeNS(null,'id',ElementID+'_'+r.format(0,'')+'_row');
		row.setAttributeNS(null,'x',xpos);
		row.setAttributeNS(null,'y',ypos);
		row.setAttributeNS(null,'height',rowHeight);
		for (c=0; c<colsQuantity; c++) {
			var colWidth=RowData[c].width;
			var g=document.createElementNS(NS,'g');
			g.setAttributeNS(null,'x',xpos);
			g.setAttributeNS(null,'y',ypos);
			g.setAttributeNS(null,'width',colWidth);
			g.setAttributeNS(null,'height',rowHeight);
			g.setAttributeNS(null,'id',ElementID+'_'+r.format(0,'')+'_'+c.format(0,'')+'_cell');
			var rect=document.createElementNS(NS,'rect');
			rect.setAttributeNS(null,'x',xpos);
			rect.setAttributeNS(null,'y',ypos);
			rect.setAttributeNS(null,'width',colWidth);
			rect.setAttributeNS(null,'height',rowHeight);
			rect.setAttributeNS(null,'style',RowData[c].background);
			rect.setAttributeNS(null,'id',ElementID+'_'+r.format(0,'')+'_'+c.format(0,'')+'_back');
			g.appendChild(rect);
			var text=document.createElementNS(NS,'text');
			text.setAttributeNS(null,'x',xpos);
			text.setAttributeNS(null,'y',ypos);
			text.setAttributeNS(null,'width',colWidth);
			text.setAttributeNS(null,'height',rowHeight);
			text.setAttributeNS(null,'style','font-size:'+rowHeight.format(0,'')+'px;font-style:normal;font-weight:normal;text-align:'+RowData[c].align+';text-anchor:'+RowData[c].align+';fill:#000000;fill-opacity:1;stroke:none;font-family:Arial;');
			text.setAttributeNS("http://www.w3.org/XML/1998/namespace", "xml:space","preserve");
			var tspan=document.createElementNS(NS,'tspan');
			if (RowData[c].align=='middle') {
				tspan.setAttributeNS(null,'x',xpos+colWidth*0.5);
			} else if (RowData[c].align=='start') {
				tspan.setAttributeNS(null,'x',xpos+colWidth*0.005);
			} else if (RowData[c].align=='end') {
				tspan.setAttributeNS(null,'x',xpos+colWidth*0.995);
			} else {
				tspan.setAttributeNS(null,'x',xpos+colWidth*0.5);
			} 
			tspan.setAttributeNS(null,'y',ypos+0.5*rowHeight+Math.floor(rowHeight)/4+2);
			tspan.setAttributeNS(null,'id',ElementID+'_'+r.format(0,'')+'_'+c.format(0,'')+'_text');
			tspan.setAttributeNS(null,'style','font-size:'+rowHeight.format(0,'')+'px;font-style:normal;font-weight:normal;text-align:'+RowData[c].align+';text-anchor:'+RowData[c].align+';fill:#000000;fill-opacity:1;stroke:none;font-family:Arial;');
			tspan.appendChild(document.createTextNode(RowData[c].text));
			text.appendChild(tspan);
			g.appendChild(text);
			row.appendChild(g);
			xpos=xpos+colWidth;
		}
		row.setAttributeNS(null,'width',xpos-x);
		table.appendChild(row);
		r++;
	}
	ParentNode=obj.parentNode;
	ParentNode.replaceChild(table,obj);
}

//////////////////////////////////////////////////////////////////////////////////////////////
// Формат вызова: setTableText(ElementID,Row,Col,Text)
// Назначение: Установка текста ячейки таблицы.
// Параметры:
//             elementID - идентификатор объекта-таблицы;
//             Row - номер строки таблицы;
//             Col - номер столбца таблицы;
//             Text - устанавливаемый текст ячейки таблицы.
//////////////////////////////////////////////////////////////////////////////////////////////
function setTableText(ElementID,Row,Col,Text) {
	var obj=byID(ElementID+'_'+Row.format(0,'')+'_'+Col.format(0,'')+'_text');
	if (obj.childNodes.item(0).nodeValue!=Text) {
		obj.childNodes.item(0).nodeValue=Text;
	}
//	obj.replaceChild(document.createTextNode(Text),obj.childNodes.item(0));
}

//////////////////////////////////////////////////////////////////////////////////////////////
// Формат вызова: getTableText(ElementID,Row,Col)
// Назначение: Получение текста ячейки таблицы.
// Параметры:
//             elementID - идентификатор объекта-таблицы;
//             Row - номер строки таблицы;
//             Col - номер столбца таблицы.
//////////////////////////////////////////////////////////////////////////////////////////////
function getTableText(ElementID,Row,Col) {
	var obj=byID(ElementID+'_'+Row.format(0,'')+'_'+Col.format(0,'')+'_text');
	return obj.childNodes.item(0).nodeValue;
}

//////////////////////////////////////////////////////////////////////////////////////////////
// Формат вызова: setTableBackColor(ElementID,Row,Col,Color)
// Назначение: Установка цвета фона ячейки таблицы.
// Параметры:
//             elementID - идентификатор объекта-таблицы;
//             Row - номер строки таблицы;
//             Col - номер столбца таблицы;
//             Color - устанавливаемый цвет фона ячейки таблицы.
//////////////////////////////////////////////////////////////////////////////////////////////
function setTableBackColor(ElementID,Row,Col,Color) {
	setStyle(ElementID+'_'+Row.format(0,'')+'_'+Col.format(0,'')+'_back','fill',Color);
}

//////////////////////////////////////////////////////////////////////////////////////////////
// Формат вызова: setTableTextColor(ElementID,Row,Col,Color)
// Назначение: Установка цвета текста ячейки таблицы.
// Параметры:
//             elementID - идентификатор объекта-таблицы;
//             Row - номер строки таблицы;
//             Col - номер столбца таблицы;
//             Color - устанавливаемый цвет текста ячейки таблицы.
//////////////////////////////////////////////////////////////////////////////////////////////
function setTableTextColor(ElementID,Row,Col,Color) {
	setStyle(ElementID+'_'+Row.format(0,'')+'_'+Col.format(0,'')+'_text','fill',Color);
}

//////////////////////////////////////////////////////////////////////////////////////////////
// Формат вызова: setTableCellOnactivate(ElementID,Row,Col,onactivateScript)
// Назначение: Установка кода обработчика события onactivate для ячейки таблицы.
// Параметры:
//             elementID - идентификатор объекта-таблицы;
//             Row - номер строки таблицы;
//             Col - номер столбца таблицы;
//             onactivateScript - текст кода обработчика события ячейки таблицы.
//////////////////////////////////////////////////////////////////////////////////////////////
function setTableCellOnactivate(ElementID,Row,Col,onactivateScript) {
	setHighlightButton(ElementID+'_'+Row.format(0,'')+'_'+Col.format(0,'')+'_cell',onactivateScript);
}

//////////////////////////////////////////////////////////////////////////////////////////////
// Формат вызова: setTableCellOnclick(ElementID,Row,Col,onactivateScript)
// Назначение: Установка кода обработчика события onactivate для ячейки таблицы.
// Параметры:
//             elementID - идентификатор объекта-таблицы;
//             Row - номер строки таблицы;
//             Col - номер столбца таблицы;
//             onactivateScript - текст кода обработчика события ячейки таблицы.
//////////////////////////////////////////////////////////////////////////////////////////////
function setTableCellOnclick(ElementID,Row,Col,onclickScript) {
	setClickButton(ElementID+'_'+Row.format(0,'')+'_'+Col.format(0,'')+'_cell',onclickScript);
}

//////////////////////////////////////////////////////////////////////////////////////////////
// Формат вызова: setTableRowOnactivate(ElementID,Row,onactivateScript)
// Назначение: Установка кода обработчика события onactivate для строки таблицы.
// Параметры:
//             elementID - идентификатор объекта-таблицы;
//             Row - номер строки таблицы;
//             onactivateScript - текст кода обработчика события строки таблицы.
//////////////////////////////////////////////////////////////////////////////////////////////
function setTableRowOnactivate(ElementID,Row,onactivateScript) {
	setHighlightButton(ElementID+'_'+Row.format(0,'')+'_row',onactivateScript);
}

//////////////////////////////////////////////////////////////////////////////////////////////
// Формат вызова:  setTableCellTitle(ElementID,Row,Col,Title)
// Назначение: Установка всплывающей подсказки для ячейки таблицы.
// Параметры:
//             elementID - идентификатор объекта-таблицы;
//             Row - номер строки таблицы;
//             Col - номер столбца таблицы;
//             Title - текст всплывающей подсказки.
//////////////////////////////////////////////////////////////////////////////////////////////
function setTableCellTitle(ElementID,Row,Col,Title) {
	var elem = byID(ElementID+'_'+Row.format(0,'')+'_row');
	var childs = elem.getChildNodes();
   	for (var i=0; i<childs.getLength(); i++) {
    	if (childs.item(i).getNodeType() == 1 && childs.item(i).getNodeName() == "title") {
    		var titleElem=childs.item(i);
    		var titleChilds = titleElem ? titleElem.getChildNodes() : null;
   			for (var j=0; titleChilds && j<titleChilds.getLength(); j++) {
      			if (titleChilds.item(j).getNodeType() == 3) {
         			titleChilds.item(j).nodeValue=Title;
         			return;
         		}
         	}
    	}
    }
    var NS='http://www.w3.org/2000/svg';
    var newTitle=document.createElementNS(NS,'title');
    newTitle.appendChild(document.createTextNode(Title));
    elem.appendChild(newTitle);
}