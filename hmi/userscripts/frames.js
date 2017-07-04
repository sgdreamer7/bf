//////////////////////////////////////////////////////////////////////////////////////////////
// Автор: Владимир Щербина <vns.scherbina@gmail.com>
// copyright 2017
// Версия: 1.0.0
// Модуль frames.js реализует меню для вызова видеокадров.
//////////////////////////////////////////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////////////////////////////////////////
// Локальные переменные //
//////////////////////////
var isSecuredFrame={};
var Pwd='pwd';

////////////////////////////////////////////////////////////////////////////////
// Инициализация
////////////////////////////////////////////////////////////////////////////////
isSecuredFrame['alarm.svg']=false;
isSecuredFrame['asbe.svg']=false;
isSecuredFrame['asld.svg']=false;
isSecuredFrame['cak_bottom.svg']=false;
isSecuredFrame['cak_prog.svg']=false;
isSecuredFrame['cak_pu1_pu6.svg']=false;
isSecuredFrame['cak_pu2_pu3.svg']=false;
isSecuredFrame['cak_pu4_pu5.svg']=false;
isSecuredFrame['cak_tap.svg']=false;
isSecuredFrame['charge.svg']=false;
isSecuredFrame['charge_modes.svg']=false;
isSecuredFrame['charge_refs.svg']=false;
isSecuredFrame['energo.svg']=false;
isSecuredFrame['fisher_diag.svg']=false;
isSecuredFrame['fpg_horn.svg']=false;
isSecuredFrame['furnace.svg']=false;
isSecuredFrame['gelob.svg']=false;
isSecuredFrame['gss.svg']=false;
isSecuredFrame['gydro.svg']=false;
isSecuredFrame['icp_diag.svg']=false;
isSecuredFrame['main.svg']=false;
isSecuredFrame['masl.svg']=false;
isSecuredFrame['momentum_diag.svg']=false;
isSecuredFrame['mpk1_diag.svg']=false;
isSecuredFrame['mpk2_diag.svg']=false;
isSecuredFrame['nassio.svg']=false;
isSecuredFrame['pids.svg']=true;
isSecuredFrame['profile1.svg']=false;
isSecuredFrame['profile2.svg']=false;
isSecuredFrame['prog.svg']=false;
isSecuredFrame['sio1.svg']=false;
isSecuredFrame['sio2.svg']=false;
isSecuredFrame['siovn.svg']=false;
isSecuredFrame['stoves.svg']=false;
isSecuredFrame['tag_info.svg']=true;
isSecuredFrame['temp.svg']=false;
isSecuredFrame['thpl.svg']=false;
isSecuredFrame['ups_diag.svg']=false;

//////////////////////////////////////////////////////////////////////////////////////////////
// public функции //
////////////////////
function openFrame(url) {
	if (isSecuredFrame[url]!=null) {
		if (isSecuredFrame[url]==true) {
			if (prompt("Введите код",'')==Pwd) {
				openURL(url,true);
			}
		} else {
			openURL(url,true);
		}
	}
}

function openFrameWithParameters(url,initialScript) {
	if (isSecuredFrame[url]!=null) {
		if (isSecuredFrame[url]==true) {
			if (prompt("Введите код",'')==Pwd) {
				openURLWithParameters(url,true,initialScript);
			}
		} else {
			openURLWithParameters(url,true,initialScript);
		}
	}
}