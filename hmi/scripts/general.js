//////////////////////////////////////////////////////////////////////////////////////////////
// Автор: Владимир Щербина <vns.scherbina@gmail.com>
// copyright 2017
// Версия: 1.0.0
// Модуль general.js реализует общеупотребительные функции.
//////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////
// Переопределение объекта String //
////////////////////////////////////
if (typeof String.prototype.startsWith != 'function') {
  String.prototype.startsWith = function (str){
    return this.indexOf(str) == 0;
  };
}

String.prototype.format = function() {
  var args = arguments;
  return this.replace(/{(\d+)}/g, function(match, number) { 
    return typeof args[number] != 'undefined'
      ? args[number]
      : match
    ;
  });
};

String.prototype.win2unicode = function() {
    var charmap   = unescape(
        "%u0402%u0403%u201A%u0453%u201E%u2026%u2020%u2021%u20AC%u2030%u0409%u2039%u040A%u040C%u040B%u040F"+
        "%u0452%u2018%u2019%u201C%u201D%u2022%u2014%u2014%u0000%u2122%u0459%u203A%u045A%u045C%u045B%u045F"+
        "%u00A0%u040E%u045E%u0408%u00A4%u0490%u00A6%u00A7%u0401%u00A9%u0404%u00AB%u00AC%u00AD%u00AE%u0407"+
        "%u00B0%u00B1%u0406%u0456%u0491%u00B5%u00B6%u00B7%u0451%u2116%u0454%u00BB%u0458%u0405%u0455%u0457")
    var code2char = function(code) {
        if(code >= 0xC0 && code <= 0xFF) return String.fromCharCode(code - 0xC0 + 0x0410)
        if(code >= 0x80 && code <= 0xBF) return charmap.charAt(code - 0x80)
        return String.fromCharCode(code)
    }
    var res = ""
    for(var i = 0; i < this.length; i++) res = res + code2char(this.charCodeAt(i))
    return res
};

String.prototype.trim=function(){return this.replace(/^\s+|\s+$/g, '');};

String.prototype.ltrim=function(){return this.replace(/^\s+/,'');};

String.prototype.rtrim=function(){return this.replace(/\s+$/,'');};

String.prototype.fulltrim=function(){return this.replace(/(?:(?:^|\n)\s+|\s+(?:$|\n))/g,'').replace(/\s+/g,' ');};

//////////////////////////////////////////////////////////////////////////////////////////////
// Переопределение объекта Number //
////////////////////////////////////

Number.prototype.format = function(digits,units) {
    if (digits==-1) {
            return this.toString();
    } else {
        if (units=="") {
                return this.toFixed(digits);
        } else {
            return "{0} {1}".format(this.toFixed(digits),units);
        }
    }
};

Number.prototype.format2 = function(digits,units,separator) {
    var r=parseFloat(this);
    var exp10=Math.pow(10,digits);
    r=Math.round(r*exp10)/exp10;
    rr=Number(r).toFixed(digits).toString().split('.');

    b=rr[0].replace(/(\d{1,3}(?=(\d{3})+(?:\.\d|\b)))/g,"\$1"+separator);
    if (rr.length>1) {
        r=b+'.'+rr[1];
    } else {
        r=b;
    }
    if (units=="") {
        return r;
    } else {
        return "{0} {1}".format(r,units);
    }
};

//////////////////////////////////////////////////////////////////////////////////////////////
// Переопределение объекта Object //
////////////////////////////////////
Object.prototype.clone = function() {
	return JSON.parse(JSON.stringify(this));
};

Object.prototype.jsonStringify = function() {
    return JSON.stringify(this);
};


//////////////////////////////////////////////////////////////////////////////////////////////
// public функции //
////////////////////

//////////////////////////////////////////////////////////////////////////////////////////////
// Формат вызова: fold_event_propagation(script)
// Назначение: Блокировка передачи события при его обработке по иерархии элементов.
// Параметры:
//             script - строка задающая выполняемый код в обработчике события.
//////////////////////////////////////////////////////////////////////////////////////////////
function fold_event_propagation(script) {
	var S=script+'\nevent.stopPropagation();\n';
	return S;
}

//////////////////////////////////////////////////////////////////////////////////////////////
// Определение объекта для реализации функциональности FIFO-стека //
////////////////////////////////////////////////////////////////////
function FIFO(size) {
    this.size=size;
    this.queue=new Array();
};

FIFO.prototype.push=function(value) {
    if (this.queue.length>=this.size) {
        this.queue.shift();
    }
    this.queue.push(value);
};

FIFO.prototype.avg=function() {
var i;
var tmp=0;
var sz=this.queue.length;

    for (i=0; i<sz; i++) {
        tmp=tmp+this.queue[i];
    }
    return sz>0 ? tmp/sz : 0.0;
}