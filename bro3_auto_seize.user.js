// ==UserScript==
// @name        bro3_auto_seizu
// @namespace   http://y17.3gokushi.jp/
// @description じどうでろかくできるかも by ぼっち@yabage17w
// @include     http://*.3gokushi.jp/village.php*
// @include     http://*.3gokushi.jp/land.php*
// @include     http://*.3gokushi.jp/card/deck.php*
// @include     http://*.3gokushi.jp/user*
// @exclude	    http://*.3gokushi.jp/maintenance*
// @require	    http://ajax.googleapis.com/ajax/libs/jquery/1.12.4/jquery.min.js
// @require     http://ajax.googleapis.com/ajax/libs/jqueryui/1.11.4/jquery-ui.min.js
// @connect	    3gokushi.jp
// @grant GM_getValue
// @grant GM_setValue
// @grant GM_xmlhttpRequest
// @grant GM_log
// @version 0.07a Reb Edition
// ==/UserScript==

//2017.12.24 ツールの再作成に着手
//全軍上げ下げ用武将はLV0を想定 上げ下げによるHP回復に45秒要する
//籠城の状態を確認していないので注意
//停戦中の出兵先領地が別同盟に取得されていることをチェックしていないので注意
// load jQuery
jQuery.noConflict();
q$ = jQuery;

// ヘルパー関数
function xpath(query,targetDoc) {
	return document.evaluate(query, targetDoc, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);
}

//	console.log('*** bro3_AUTO_CAPTURE 2***');//

var VerNo="2018.01.13 Ver0.07a Reb Edition";
var g_MD="";
var d = document;
var $ = function(id) { return d.getElementById(id); };
var $x = function(xp,dc) { return d.evaluate(xp, dc||d, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue; };
var $a = function(xp,dc) { var r = d.evaluate(xp, dc||d, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null); var a=[]; for(var i=0; i<r.snapshotLength; i++){ a.push(r.snapshotItem(i)); } return a; };
var $e = function(e,t,f) { if (!e) return; e.addEventListener(t, f, false); };
var $v = function(key) { return d.evaluate(key, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null); };		// 2013.12.18

var SERVER_NAME = location.hostname.match(/^(.*)\.3gokushi/)[1];
var HOST = location.hostname; //アクセスURLホスト

//ssidを取得
var cok = d.cookie;
var ssid = cok.match(/(SSID=)[0-9a-zA-Z]+/)[0].replace(/(SSID=)/,'');

//------------------//
// オプション設定管理用 //
//------------------//

//------------------//
// 保存設定部品定義    //
//------------------//
//
var H_AUT_CAP     = 'aut0';   // 自動鹵獲スイッチ

initGMFunctions();	//GM関数の初期化

( function() {

console.log('*** bro3_AUTO_SEIZU start ***'+location.pathname);
q$("#whiteWrapper").append("<span style='font-weight:bold'>("+"bro3_AUTO_SEIZU 判定開始("+VerNo+"))</span><BR>");
q$("#whiteWrapper").append("<span>("+"サーバー時間 "+$x("//span[@id='server_time']",d).innerHTML+""+")</span><BR>");

//メニュー追加用
addOpenSettingLink();

console.log('*** bro3_AUTO_SEIZU end ***');

})();


function addOpenSettingLink() {
	var openLink = document.createElement("a");
    openLink.id = "Auto_Seize";
    openLink.href = "javascript:void(0);";
    openLink.style.marginTop = "0px";
    openLink.style.marginLeft = "0px";
    openLink.innerHTML = "<BR> [自動鹵獲Reb]";
    openLink.style.font = "10px 'ＭＳ ゴシック'";
    openLink.style.color = "#FFFFFF";
    openLink.style.cursor = "pointer";
		openLink.addEventListener("click", function() {
			openSettingBox();
		}, true);
    var sidebar_list = xpath('//*[@class="sideBox"]', d);
    if (sidebar_list.snapshotLength) {
       sidebar_list.snapshotItem(0).appendChild(openLink);
    }
}
function openSettingBox() {
//  closeSettingBox(); //[自動鹵獲]がクリックされて画面が開いてたら一旦閉じる
	// 色設定
  var COLOR_FRAME = "#333333";	// 枠背景色
  var COLOR_BASE	= "#654634";	// 拠点リンク色
  var COLOR_TITLE = "#FFCC00";	// 各BOXタイトル背景色
  var COLOR_BACK	= "#FFF2BB";	// 各BOX背景色
  var FONTSTYLE = "bold 10px 'ＭＳ ゴシック'";	// ダイアログの基本フォントスタイル
	// 表示位置をロード
  popupLeft = 150;
  popupTop = 150;
// ==========[ 表示コンテナ作成 ]==========
    var ADContainer = document.createElement("div");
    ADContainer.id = "ADContainerAC";
    ADContainer.style.position = "absolute";
    ADContainer.style.color = COLOR_BASE;
    ADContainer.style.backgroundColor = COLOR_FRAME;
    ADContainer.style.opacity= 1.0;
    ADContainer.style.border = "solid 2px black";
    ADContainer.style.left = popupLeft + "px";
    ADContainer.style.top = popupTop + "px";
    ADContainer.style.font = FONTSTYLE;
    ADContainer.style.padding = "2px";
    ADContainer.style.MozBorderRadius = "4px";
    ADContainer.style.zIndex = 9999;
    ADContainer.style.width = "450px";
	document.body.appendChild(ADContainer);
  $e(ADContainer, "mousedown", function(event){
    if( event.target != $("ADContainerAC")) {return false;}
    g_MD="ADContainerAC";
    g_MX=event.pageX-parseInt(this.style.left,10);
    g_MY=event.pageY-parseInt(this.style.top,10);
    event.preventDefault();
  });
  $e(document, "mousemove", function(event){
    if(g_MD != "ADContainerAC") return true;
    var ADContainer = $("ADContainerAC");
    if( !ADContainer ) return true;
    var popupLeft = event.pageX - g_MX;
    var popupTop  = event.pageY - g_MY;
    ADContainer.style.left = popupLeft + "px";
    ADContainer.style.top = popupTop + "px";
//ポップアップ位置を永続保存
    setVALUE("popup_left", popupLeft);
    setVALUE("popup_top", popupTop);
   });
   $e(document, "mouseup", function(event){g_MD="";});
// ==========[ タイトル＋バージョン ]==========
	  var title = document.createElement("span");
    title.style.color = "#FFFFFF";
    title.style.font = 'bold 120% "ＭＳ ゴシック"';
    title.style.margin = "2px";
    title.innerHTML = "Auto Seize ";
    ADContainer.appendChild(title);
    var vno = document.createElement("span");
    vno.style.color = COLOR_TITLE;
    vno.style.margin = "2px";
    vno.innerHTML = " Ver_" + VerNo;
    ADContainer.appendChild(vno);
// ==========[ 設定 ]==========

	 var Setting_Box2 = document.createElement("table");
   Setting_Box2.style.backgroundColor = COLOR_BACK;

	 Setting_Box2.innerHTML+='<table border="1">';
	 Setting_Box2.innerHTML+='<tr>';
	 Setting_Box2.innerHTML+='<td class="vertical">資源取得方法</td>';
	 Setting_Box2.innerHTML+='<td valign="top">';
	 Setting_Box2.innerHTML+='<input type="radio" name="hyouka" value="0" checked="checked">資源均等取得<BR>';
	 Setting_Box2.innerHTML+='<input type="radio" name="hyouka" value="1">得意資源優先取得<BR>';
	 Setting_Box2.innerHTML+='<input type="radio" name="hyouka" value="2">糧取得→得意資源優先取得<BR>';
	 Setting_Box2.innerHTML+='<input type="radio" name="hyouka" value="3">得意資源優先取得→糧取得</td>';
	 Setting_Box2.innerHTML+='</tr>';
	 Setting_Box2.innerHTML+='<tr>';
	 Setting_Box2.innerHTML+='<td colspan="2" width="380">※意資源優先取得は、得意資源を優先して取得し目標収入量に達したら次の得意資源を優先して取得する</td>';
	 Setting_Box2.innerHTML+='</tr>';
	 Setting_Box2.innerHTML+='</table>';

	 Setting_Box2.innerHTML+='<table border="1">';
	 Setting_Box2.innerHTML+='<tr>';
	 Setting_Box2.innerHTML+='<td class="vertical">資源取得方法</td>';
	 Setting_Box2.innerHTML+='<td valign="top">';
	 Setting_Box2.innerHTML+='<input type="radio" name="hyouka" value="0" checked="checked">資源均等取得<BR>';
	 Setting_Box2.innerHTML+='<input type="radio" name="hyouka" value="1">得意資源優先取得<BR>';
	 Setting_Box2.innerHTML+='<input type="radio" name="hyouka" value="2">糧取得→得意資源優先取得<BR>';
	 Setting_Box2.innerHTML+='<input type="radio" name="hyouka" value="3">得意資源優先取得→糧取得</td>';
	 Setting_Box2.innerHTML+='</tr>';
	 Setting_Box2.innerHTML+='<tr>';
	 Setting_Box2.innerHTML+='<td colspan="2" width="380">※意資源優先取得は、得意資源を優先して取得し目標収入量に達したら次の得意資源を優先して取得する</td>';
	 Setting_Box2.innerHTML+='</tr>';
	 Setting_Box2.innerHTML+='</table>';

/*	 Setting_Box2.insertAdjacentHTML('afterend', `
<table border="1">
<tr>
<td class="vertical">資源取得方法</td>
<td valign="top">
<input type="radio" name="hyouka" value="0" checked="checked">資源均等取得<BR>
<input type="radio" name="hyouka" value="1">得意資源優先取得<BR>
<input type="radio" name="hyouka" value="2">糧取得→得意資源優先取得<BR>
<input type="radio" name="hyouka" value="3">得意資源優先取得→糧取得</td>
</tr>
<tr>
<td colspan="2" width="380">※意資源優先取得は、得意資源を優先して取得し目標収入量に達したら次の得意資源を優先して取得する</td>
</tr>
</table>
`);
*/

	 Setting_Box2.innerHTML+= '資源取得方法<BR>';
//	 Setting_Box2.insertAdjacentHTML('afterend', '資源取得方法');

var troop_html = (function(){/*
	<div id="landRokakuDataBox">
		鹵獲ツール<br />
		<table>
			<tr data-type="tree">
				<td>木：</td>
				<td><span class="troop_land_xy">{{html rokakuTreeXY}}</span></td>
				<td><a class="save">[登録]</a></td>
				<td><a class="del">[解除]</a></td>
			</tr>
			<tr data-type="stone">
				<td>石：</td>
				<td><span class="troop_land_xy">{{html rokakuStoneXY}}</span></td>
				<td><a class="save">[登録]</a></td>
				<td><a class="del">[解除]</a></td>
			</tr>
			<tr data-type="iron">
				<td>鉄：</td>
				<td><span class="troop_land_xy">{{html rokakuIronXY}}</span></td>
				<td><a class="save">[登録]</a></td>
				<td><a class="del">[解除]</a></td>
			</tr>
			<tr data-type="rice">
				<td>糧：</td>
				<td><span class="troop_land_xy">{{html rokakuRiceXY}}</span></td>
				<td><a class="save">[登録]</a></td>
				<td><a class="del">[解除]</a></td>
			</tr>
		</table>
	</div>
	<style>
	<!--
		#landRokakuDataBox{
			width:200px;
			padding:5px;
			background-color:#FFFFFF;
			border:1px solid #000000;
			color:#333333;
		}
		#landRokakuDataBox a{
			color:#0000DD;
			cursor:pointer;
		}
		#landRokakuDataBox span{
			color:#DD0000;
		}
	-->
	</style>
*/});


Setting_Box2.innerHTML+= troop_html;

	 ADContainer.appendChild(Setting_Box2);
// ==========[ ボタンエリア ]==========


// 閉じるボタン
}






/*****************************************************************************
 * initGMFunctions
 * @description GM関数初期化
 */
function initGMFunctions() {
	// @copyright	  2009, 2010 James Campos
	// @license		cc-by-3.0; http://creativecommons.org/licenses/by/3.0/
	if (typeof GM_getValue == 'undefined') {

		GM_addStyle = function(css) {
			var style = document.createElement('style');
			style.textContent = css;
			document.getElementsByTagName('head')[0].appendChild(style);
		};

		GM_deleteValue = function(key) {
			localStorage.removeItem(key);
		};

		GM_getValue = function(key, defaultValue) {
			var value = localStorage.getItem(key);
			if (!value) return defaultValue;
			var type = value[0];
			value = value.substring(1);
			switch (type) {
				case 'b': return value == 'true';
				case 'n': return Number(value);
				default : return value;
			}
		};

		GM_log = function(message, level) {
			if (typeof console == 'object') {
				console.log(message, level);
			}
		};

		GM_openInTab = function(url) {
			return window.open(url, "_blank");
		};

		GM_registerMenuCommand = function(name, funk) {
			throw new Error('not supported');
		};

		GM_setValue = function(name, value) {
			switch (typeof value) {
				case 'string':
				case 'number':
				case 'boolean':
					break;
				default:
					throw new TypeError();
			}
			value = (typeof value)[0] + value;
			localStorage.setItem(name, value);
		};

		//additional function by romer
		GM_listValues = function() {
			var len = localStorage.length;
			var res = new Object();
			var key = '';
			for (var i = 0; i < len; i++) {
				key = localStorage.key(i);
				res[key] = key;
			}
			return res;
		};

		GM_xmlhttpRequest = function(requestParam) {
			var xhr;
			if (typeof XMLHttpRequest == 'function') {
				xhr = XMLHttpRequest;
			} else {
				return;
			}
			var req = new xhr();
		   ['onload', 'onerror', 'onreadystatechange'].forEach(function (event) {
				if ((event in requestParam) == false) {
					return;
				}
				req[event] = function () {
					var isComplete = (req.readyState == 4);
					var responseState = {
							responseText: req.responseText,
							readyState: req.readyState,
							responseHeaders: isComplete ? req.getAllResponseHeaders() : '',
							status: isComplete ? req.status : 0,
							statusText: isComplete ? req.statusText : '',
							finalUrl: isComplete ? requestParam.url : ''
					};
					requestParam[event](responseState);
				};
			});

			try {
				req.open(requestParam.method ? requestParam.method : 'GET', requestParam.url, true);
			} catch(e) {
				if (requestParam.onerror) {
					requestParam.onerror({readyState:4, responseHeaders:'', responseText:'', status:403, statusText:'Forbidden', finalUrl:''});
				}
				return;
			}

			if ('headers' in requestParam && typeof requestParam.headers == 'object') {
				for (var name in requestParam.headers) {
					req.setRequestHeader(name, requestParam.headers[name]);
				}
			}

			req.send(('data' in requestParam) ? requestParam.data : null);
			return req;
		};
	}
}
