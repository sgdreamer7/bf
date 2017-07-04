//////////////////////////////////////////////////////////////////////////////////////////////
// Автор: Владимир Щербина <vns.scherbina@gmail.com>
// copyright 2017
// Версия: 1.0.0
// Модуль svg_helpers.js реализует функции доступа к элементам SVG и их атрибутам.
//////////////////////////////////////////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////////////////////////////////////////
// public функции //
////////////////////

//////////////////////////////////////////////////////////////////////////////////////////////
// Формат вызова: byID(elementID)
// Назначение: Получение объекта документа по его идентификатору.
// Параметры:
//             elementID - идентификатор объекта.
//////////////////////////////////////////////////////////////////////////////////////////////
function byID(elementID) {
    var obj=document.getElementById(elementID);
    if (obj==null) {
        print('Отсутствует элемент: \''+elementID+'\'');
    }
	return obj;
}

//////////////////////////////////////////////////////////////////////////////////////////////
// Формат вызова: setAttr(elementID,attrName,attrValue)
// Назначение: Установка значения атрибута объекта документа.
// Параметры:
//             elementID - идентификатор объекта;
//             attrName - имя атрибута;
//             attrValue - значение атрибута.
//////////////////////////////////////////////////////////////////////////////////////////////
function setAttr(elementID,attrName,attrValue) {
	var obj=byID(elementID);
    if (obj.getAttribute(attrName)!=attrValue) {
        obj.setAttribute(attrName, attrValue);
    }
}

//////////////////////////////////////////////////////////////////////////////////////////////
// Формат вызова: setStyle(elementID,styleName,styleValue)
// Назначение: Установка значения элемента стиля объекта документа.
// Параметры:
//             elementID - идентификатор объекта;
//             styleName - имя элемента стиля;
//             styleValue - значение элемента стиля.
//////////////////////////////////////////////////////////////////////////////////////////////
function setStyle(elementID,styleName,styleValue) {
    var obj=byID(elementID);
    if (obj.style.getPropertyValue(styleName)!=styleValue) {
        obj.style.setProperty(styleName, styleValue, 'important');
    }
}

//////////////////////////////////////////////////////////////////////////////////////////////
// Формат вызова: setHandler(elementID,handlerName,handlerScript)
// Назначение: Установка обработчика события для объекта документа.
// Параметры:
//             elementID - идентификатор объекта;
//             handlerName - имя события;
//             handlerScript - текст кода обработчика события.
//////////////////////////////////////////////////////////////////////////////////////////////
function setHandler(elementID,handlerName,handlerScript) {
	setAttr(elementID,handlerName,handlerScript);
}

//////////////////////////////////////////////////////////////////////////////////////////////
// Формат вызова: setText(elementID,text)
// Назначение: Установка значения текстового объекта документа.
// Параметры:
//             elementID - идентификатор объекта;
//             text - устанавливаемый текст.
//////////////////////////////////////////////////////////////////////////////////////////////
function setText(elementID,text) {
    var obj=byID(elementID).firstChild;
    while ((obj!=null) && (obj.nodeType!=3)) {
        obj=obj.firstChild;
    }
    if (obj!=null) {
        if (obj.nodeValue!=text) {
            obj.nodeValue=text;
        }
    }
}

//////////////////////////////////////////////////////////////////////////////////////////////
// Формат вызова: setVisibility(elementID,visible)
// Назначение: Установка свойства видимости объекта документа.
// Параметры:
//             elementID - идентификатор объекта;
//             visible - устанавливаемый признак видимости.
//////////////////////////////////////////////////////////////////////////////////////////////
function setVisibility(elementID,visible) {
    if (visible==false) {
        setStyle(elementID,'display','none');
    } else {
        setStyle(elementID,'display','block');
    }
}

//////////////////////////////////////////////////////////////////////////////////////////////
// Формат вызова: setPosition(elementID,x,y)
// Назначение: Установка положения объекта документа.
// Параметры:
//             elementID - идентификатор объекта;
//             x - устанавливаемая горизонтальная координата;
//             y - устанавливаемая вертикальная координата.
//////////////////////////////////////////////////////////////////////////////////////////////
function setPosition(elementID,x,y) {
    setAttr(elementID,'x',x);
    setAttr(elementID,'y',y);
}

//////////////////////////////////////////////////////////////////////////////////////////////
// Формат вызова: setTranslation(elementID,x,y)
// Назначение: Установка смещения объекта документа.
// Параметры:
//             elementID - идентификатор объекта;
//             x - устанавливаемая горизонтальное смещение;
//             y - устанавливаемая вертикальное смещение.
//////////////////////////////////////////////////////////////////////////////////////////////
function setTranslation(elementID,x,y) {
    setAttr(elementID,'transform','translate({0},{1})'.format(x,y));
}

//////////////////////////////////////////////////////////////////////////////////////////////
// Формат вызова: setRotation(elementID,angle,x,y)
// Назначение: Установка вращения объекта документа.
// Параметры:
//             elementID - идентификатор объекта;
//             angle - угол вращения;
//             x - горизонтальная координата центра вращения;
//             y - вертикальная координата центра вращения.
//////////////////////////////////////////////////////////////////////////////////////////////
function setRotation(elementID,angle,x,y) {
    setAttr(elementID,'transform','rotate({0},{1},{2})'.format(angle,x,y));
}

//////////////////////////////////////////////////////////////////////////////////////////////
// Формат вызова: setRef(elementID,refName)
// Назначение: Установка ссылки на шаблон для объекта документа.
// Параметры:
//             elementID - идентификатор объекта;
//             refName - имя шаблона.
//////////////////////////////////////////////////////////////////////////////////////////////
function setRef(elementID,refName) {
    setAttr(elementID,'xlink:href','#{0}'.format(refName));
}

//////////////////////////////////////////////////////////////////////////////////////////////
// Формат вызова: setClass(elementID,className)
// Назначение: Установка класса CSS для объекта документа.
// Параметры:
//             elementID - идентификатор объекта;
//             className - имя CSS класса.
//////////////////////////////////////////////////////////////////////////////////////////////
function setClass(elementID,className) {
    setAttr(elementID,'class',className);
}

//////////////////////////////////////////////////////////////////////////////////////////////
// Формат вызова: setOpacity(elementID,opacity)
// Назначение: Установка степени непрозраности объекта документа.
// Параметры:
//             elementID - идентификатор объекта;
//             opacity - степень непрозрачности.
//////////////////////////////////////////////////////////////////////////////////////////////
function setOpacity(elementID,opacity) {
	setStyle(elementID,'fill-opacity',opacity);
	setStyle(elementID,'stroke-opacity',opacity);
}

//////////////////////////////////////////////////////////////////////////////////////////////
// Формат вызова: animateAlarmStroke(elementID,TagName)
// Назначение: Анимация аварийных и предупредительных значенийа.
// Параметры:
//             elementID - идентификатор объекта;
//             TagName - имя тега.
//////////////////////////////////////////////////////////////////////////////////////////////
function animateAlarmStroke(elementID,TagName) {
    var alarmState=getStrTag(TagName+'.A_CUALM');
    var ts=new Date();
    // var AlarmWidth=(4*(1+Math.sin(ts.getTime()/2000.0*2*Math.PI))/2+3).format(0,'px');
    var AlarmWidth='4px'; //(4*(ts.getSeconds() % 2)+3).format(0,'px');
    setStyle(
        elementID,
        'stroke',
        alarmState=='OK' ? 'rgb(192,192,192)' :
        alarmState=='ERROR' ? 'rgb(255,0,255)' :
        alarmState=='LOLO' ? 'rgb(255,0,0)' :
        alarmState=='LO' ? 'rgb(255,255,0)' :
        alarmState=='HI' ? 'rgb(255,255,0)' :
        alarmState=='HIHI' ? 'rgb(255,0,0)' : 
        'rgb(0,0,0)'
    );
    setStyle(
        elementID,
        'stroke-width',
        alarmState=='OK' ? '1px' :
        alarmState=='ERROR' ? AlarmWidth :
        alarmState=='LOLO' ? AlarmWidth :
        alarmState=='LO' ? AlarmWidth :
        alarmState=='HI' ? AlarmWidth :
        alarmState=='HIHI' ? AlarmWidth : 
        '5px'
    );
}

//////////////////////////////////////////////////////////////////////////////////////////////
// Формат вызова: animateAlarmFill(elementID,TagName)
// Назначение: Анимация аварийных и предупредительных значенийа.
// Параметры:
//             elementID - идентификатор объекта;
//             TagName - имя тега.
//////////////////////////////////////////////////////////////////////////////////////////////
function animateAlarmFill(elementID,TagName) {
    var alarmState=getStrTag(TagName+'.A_CUALM');
    var ts=new Date();
    setStyle(
        elementID,
        'fill',
        alarmState=='OK' ? 'rgb(192,192,192)' :
        alarmState=='ERROR' ? 'rgb(255,0,255)' :
        alarmState=='LOLO' ? 'rgb(255,0,0)' :
        alarmState=='LO' ? 'rgb(255,255,0)' :
        alarmState=='HI' ? 'rgb(255,255,0)' :
        alarmState=='HIHI' ? 'rgb(255,0,0)' : 
        'rgb(0,0,0)'
    );
}
//////////////////////////////////////////////////////////////////////////////////////////////
// Формат вызова: animateAlarmBackStroke(id)
// Назначение: Анимация аварийного и предупредительного значения.
// Параметры:
//             id       - идентификатор тега/объекта.
//////////////////////////////////////////////////////////////////////////////////////////////
function animateAlarmBackStroke(id) {
    animateAlarmStroke(id+'_BACK',id);
}
var globalBackgroundColor=Main.backgroundColor;
setStyle('Background','fill','rgb('+((globalBackgroundColor >> 16) & 0x0000FF).format(0,'')+','+((globalBackgroundColor >> 8) & 0x0000FF).format(0,'')+','+(globalBackgroundColor & 0x0000FF).format(0,'')+')');