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
// @version 0.07h Reb Edition
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

var VerNo="2018.01.13 Ver0.07h Reb Edition";
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
  popupLeft = 50;
  popupTop = 250;
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
    ADContainer.style.width = "900px";
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

//	 var Setting_Box2 = document.createElement("table");
	 var Setting_Box2 = document.createElement("div");
   Setting_Box2.style.backgroundColor = COLOR_BACK;

var troop_html = (`
	<table border=“1” style="font-size: 9px">
	<tr>
	<td>

	<table border=“1” style="font-size: 9px">
	<tr>
	<td rowspan="3" colspan="2" valign="middle">出兵元</td>
	<td><input type="checkbox">本拠地</td>
	<td><input type="text" style="text-align: center; width: 65px;"></td>
	<td colspan="3"></td>
	</tr>
	<tr>
	<td><input type="checkbox">僻地１</td>
	<td><input type="text" style="text-align: center; width: 65px;"></td>
	<td colspan="3"></td>
	</tr>
	<tr>
	<td><input type="checkbox">僻地２</td>
	<td><input type="text" style="text-align: center; width: 65px;"></td>
	<td colspan="3"></td>
	</tr>

	<tr style="text-align: center;">
	<td colspan="3"></td>
	<td>木</td>
	<td>石</td>
	<td>鉄</td>
	<td>糧</td>
	</tr>

	<tr>
	<td colspan="3">資源最大保有可能量</td>
	<td style="text-align: center;"><input type="text" style="text-align: center; width: 65px;"></td>
	<td style="text-align: center;"><input type="text" style="text-align: center; width: 65px;"></td>
	<td style="text-align: center;"><input type="text" style="text-align: center; width: 65px;"></td>
	<td style="text-align: center;"><input type="text" style="text-align: center; width: 65px;"></td>
	</tr>

	<tr>
	<td rowspan="2" colspan="2" valign="middle">出兵先</td>
	<td><input type="checkbox">★１</td>
	<td>(<input type="text" style="text-align: center; width: 65px;">)</td>
	<td>(<input type="text" style="text-align: center; width: 65px;">)</td>
	<td>(<input type="text" style="text-align: center; width: 65px;">)</td>
	<td>(<input type="text" style="text-align: center; width: 65px;">)</td>
	</tr>
	<tr>
	<td><input type="checkbox">★２</td>
	<td>(<input type="text" style="text-align: center; width: 65px;">)</td>
	<td>(<input type="text" style="text-align: center; width: 65px;">)</td>
	<td>(<input type="text" style="text-align: center; width: 65px;">)</td>
	<td>(<input type="text" style="text-align: center; width: 65px;">)</td>
	</tr>

	<tr style="text-align: center;">
	<td></td>
	<td>武将番号</td>
	<td>最小獲得<BR>鹵獲糧</td>
	<td>木</td>
	<td>石</td>
	<td>鉄</td>
	<td>糧</td>
	</tr>
	<tr>
	<td><input type="checkbox">パッシブ１</td>
	<td><input type="text" style="text-align: center; width: 65px;"></td>
	<td><input type="text" style="text-align: center; width: 65px;"></td>
	<td>(<input type="text" style="text-align: center; width: 65px;">)</td>
	<td>(<input type="text" style="text-align: center; width: 65px;">)</td>
	<td>(<input type="text" style="text-align: center; width: 65px;">)</td>
	<td>(<input type="text" style="text-align: center; width: 65px;">)</td>
	</tr>
	<tr>
	<td><input type="checkbox">パッシブ２</td>
	<td><input type="text" style="text-align: center; width: 65px;"></td>
	<td><input type="text" style="text-align: center; width: 65px;"></td>
	<td>(<input type="text" style="text-align: center; width: 65px;">)</td>
	<td>(<input type="text" style="text-align: center; width: 65px;">)</td>
	<td>(<input type="text" style="text-align: center; width: 65px;">)</td>
	<td>(<input type="text" style="text-align: center; width: 65px;">)</td>
	</tr>
	<tr>
	<td><input type="checkbox">パッシブ３</td>
	<td><input type="text" style="text-align: center; width: 65px;"></td>
	<td><input type="text" style="text-align: center; width: 65px;"></td>
	<td>(<input type="text" style="text-align: center; width: 65px;">)</td>
	<td>(<input type="text" style="text-align: center; width: 65px;">)</td>
	<td>(<input type="text" style="text-align: center; width: 65px;">)</td>
	<td>(<input type="text" style="text-align: center; width: 65px;">)</td>
	</tr>
	<tr>
	<td><input type="checkbox">パッシブ４</td>
	<td><input type="text" style="text-align: center; width: 65px;"></td>
	<td><input type="text" style="text-align: center; width: 65px;"></td>
	<td>(<input type="text" style="text-align: center; width: 65px;">)</td>
	<td>(<input type="text" style="text-align: center; width: 65px;">)</td>
	<td>(<input type="text" style="text-align: center; width: 65px;">)</td>
	<td>(<input type="text" style="text-align: center; width: 65px;">)</td>
	</tr>
	<tr>
	<td><input type="checkbox">パッシブ５</td>
	<td><input type="text" style="text-align: center; width: 65px;"></td>
	<td><input type="text" style="text-align: center; width: 65px;"></td>
	<td>(<input type="text" style="text-align: center; width: 65px;">)</td>
	<td>(<input type="text" style="text-align: center; width: 65px;">)</td>
	<td>(<input type="text" style="text-align: center; width: 65px;">)</td>
	<td>(<input type="text" style="text-align: center; width: 65px;">)</td>
	</tr>
	<tr>
	<td><input type="checkbox">パッシブ６</td>
	<td><input type="text" style="text-align: center; width: 65px;"></td>
	<td><input type="text" style="text-align: center; width: 65px;"></td>
	<td>(<input type="text" style="text-align: center; width: 65px;">)</td>
	<td>(<input type="text" style="text-align: center; width: 65px;">)</td>
	<td>(<input type="text" style="text-align: center; width: 65px;">)</td>
	<td>(<input type="text" style="text-align: center; width: 65px;">)</td>
	</tr>
	<tr>
	<td><input type="checkbox">パッシブ７</td>
	<td><input type="text" style="text-align: center; width: 65px;"></td>
	<td><input type="text" style="text-align: center; width: 65px;"></td>
	<td>(<input type="text" style="text-align: center; width: 65px;">)</td>
	<td>(<input type="text" style="text-align: center; width: 65px;">)</td>
	<td>(<input type="text" style="text-align: center; width: 65px;">)</td>
	<td>(<input type="text" style="text-align: center; width: 65px;">)</td>
	</tr>
	<tr>
	<td><input type="checkbox">パッシブ８</td>
	<td><input type="text" style="text-align: center; width: 65px;"></td>
	<td><input type="text" style="text-align: center; width: 65px;"></td>
	<td>(<input type="text" style="text-align: center; width: 65px;">)</td>
	<td>(<input type="text" style="text-align: center; width: 65px;">)</td>
	<td>(<input type="text" style="text-align: center; width: 65px;">)</td>
	<td>(<input type="text" style="text-align: center; width: 65px;">)</td>
	</tr>
	<tr>
	<td><input type="checkbox">攻奪１</td>
	<td><input type="text" style="text-align: center; width: 65px;"></td>
	<td><input type="text" style="text-align: center; width: 65px;"></td>
	<td>(<input type="text" style="text-align: center; width: 65px;">)</td>
	<td>(<input type="text" style="text-align: center; width: 65px;">)</td>
	<td>(<input type="text" style="text-align: center; width: 65px;">)</td>
	<td>(<input type="text" style="text-align: center; width: 65px;">)</td>
	</tr>
	<tr>
	<td><input type="checkbox">攻奪２</td>
	<td><input type="text" style="text-align: center; width: 65px;"></td>
	<td><input type="text" style="text-align: center; width: 65px;"></td>
	<td>(<input type="text" style="text-align: center; width: 65px;">)</td>
	<td>(<input type="text" style="text-align: center; width: 65px;">)</td>
	<td>(<input type="text" style="text-align: center; width: 65px;">)</td>
	<td>(<input type="text" style="text-align: center; width: 65px;">)</td>
	</tr>
	<tr>
	<td><input type="checkbox">攻奪３</td>
	<td><input type="text" style="text-align: center; width: 65px;"></td>
	<td><input type="text" style="text-align: center; width: 65px;"></td>
	<td>(<input type="text" style="text-align: center; width: 65px;">)</td>
	<td>(<input type="text" style="text-align: center; width: 65px;">)</td>
	<td>(<input type="text" style="text-align: center; width: 65px;">)</td>
	<td>(<input type="text" style="text-align: center; width: 65px;">)</td>
	</tr>
	<tr>
	<td><input type="checkbox">攻奪４</td>
	<td><input type="text" style="text-align: center; width: 65px;"></td>
	<td><input type="text" style="text-align: center; width: 65px;"></td>
	<td>(<input type="text" style="text-align: center; width: 65px;">)</td>
	<td>(<input type="text" style="text-align: center; width: 65px;">)</td>
	<td>(<input type="text" style="text-align: center; width: 65px;">)</td>
	<td>(<input type="text" style="text-align: center; width: 65px;">)</td>
	</tr>
	<tr>
	<td><input type="checkbox">攻奪５</td>
	<td><input type="text" style="text-align: center; width: 65px;"></td>
	<td><input type="text" style="text-align: center; width: 65px;"></td>
	<td>(<input type="text" style="text-align: center; width: 65px;">)</td>
	<td>(<input type="text" style="text-align: center; width: 65px;">)</td>
	<td>(<input type="text" style="text-align: center; width: 65px;">)</td>
	<td>(<input type="text" style="text-align: center; width: 65px;">)</td>
	</tr>
	<tr>
	<td><input type="checkbox">全軍１●</td>
	<td><input type="text" style="text-align: center; width: 65px;"></td>
	<td colspan="5">回復スキル使用に上げ下げする武将カード</td>
	</tr>
	<tr>
	<td><input type="checkbox">全軍２</td>
	<td><input type="text" style="text-align: center; width: 65px;"></td>
	<td colspan="5"></td>
	</tr>
	<tr>
	<td><input type="checkbox">全軍３</td>
	<td><input type="text" style="text-align: center; width: 65px;"></td>
	<td colspan="5"></td>
	</tr>

	</table>

	</td>
	<td valign="top">
	武将を回復する範囲<BR>
	<table border=“1” style="font-size: 9px;">
	<tr>
	<td>回復目安</td>
	<td>下限</td>
	<td><input type="text" style="text-align: center; width: 20px;"></td>
	<td>≦</td>
	<td>上限</td>
	<td><input type="text" style="text-align: center; width: 20px;"></td>
	</tr>
	</table>

	鹵獲武将に使う回復スキル<BR>
	<input type="checkbox">仁君<BR>
	<input type="checkbox">弓腰姫の愛<BR>
	<input type="checkbox">桃色吐息<BR>
	<input type="checkbox">神医の施術<BR>
	<input type="checkbox">神医の術式<BR>
	<input type="checkbox">劉備の契り<BR>
	<input type="checkbox">神卜の方術（未対応）<BR>
	<input type="checkbox">神官の加護<BR>
	<input type="checkbox">娘々敬慕<BR>
	鹵獲武将に使う討伐回復スキル<BR>
	<input type="checkbox">傾国<BR>
	その他機能<BR>
	<input type="checkbox">内政中も発射する<BR>
	<input type="checkbox">鹵獲武将で指定していない武将も発射する<BR>
	<input type="checkbox">パッシブと攻奪が混在する時に全武将を回復してから発射する<BR>

	</td>
	</tr>
	</table>


	<table border=“1” style="font-size: 9px;">
	<tr>
	<td valign="top">
	休戦モード対応
	<table border=“1” style="font-size: 9px">
	<tr>
	<td colspan="3"></td>
	<td>ステータス</td>
	</tr>
	<tr>
	<td><input type="checkbox">防御解除時間</td>
	<td><input type="text" style="text-align: center; width: 20px;">時</td>
	<td><input type="text" style="text-align: center; width: 20px;">分から</td>
	<td><input type="text" style="text-align: center; width: 50px;"></td>
	</tr>
	<tr>
	<td><input type="checkbox">鹵獲設定時間</td>
	<td><input type="text" style="text-align: center; width: 20px;">時</td>
	<td><input type="text" style="text-align: center; width: 20px;">分から</td>
	<td><input type="text" style="text-align: center; width: 50px;"></td>
	</tr>
	<tr>
	<td><input type="checkbox">鹵獲解除時間</td>
	<td><input type="text" style="text-align: center; width: 20px;">時</td>
	<td><input type="text" style="text-align: center; width: 20px;">分から</td>
	<td><input type="text" style="text-align: center; width: 50px;"></td>
	</tr>
	<tr>
	<td><input type="checkbox">防御設定時間</td>
	<td><input type="text" style="text-align: center; width: 20px;">時</td>
	<td><input type="text" style="text-align: center; width: 20px;">分から</td>
	<td><input type="text" style="text-align: center; width: 50px;"></td>
	</tr>
	</table>
	防御武将設定時に使う回復スキル<BR>
	<input type="checkbox">神医の術式<BR>
	<input type="checkbox">劉備の契り<BR>
	休戦モード時の出兵先<BR>
	<input type="checkbox">★１　<input type="checkbox">★２　<input type="checkbox">個別<BR>
	休戦モード明け時の出兵先<BR>
	<input type="checkbox">★１　<input type="checkbox">★２　<input type="checkbox">個別<BR>

	</td>
	<td valign="top">
	防御武将一覧
	<table border=“1” style="font-size: 9px">

	<tr>
	<td>防御武将１</td>
	<td><input type="text" style="text-align: center; width: 65px;"></td>
	<td><input type="checkbox">解除</td>
	<td><input type="checkbox">設定</td>
	</tr>
	<tr>
	<td>防御武将２</td>
	<td><input type="text" style="text-align: center; width: 65px;"></td>
	<td><input type="checkbox">解除</td>
	<td><input type="checkbox">設定</td>
	</tr>
	<tr>
	<td>防御武将３</td>
	<td><input type="text" style="text-align: center; width: 65px;"></td>
	<td><input type="checkbox">解除</td>
	<td><input type="checkbox">設定</td>
	</tr>
	<tr>
	<td>防御武将４</td>
	<td><input type="text" style="text-align: center; width: 65px;"></td>
	<td><input type="checkbox">解除</td>
	<td><input type="checkbox">設定</td>
	</tr>
	<tr>
	<td>防御武将５</td>
	<td><input type="text" style="text-align: center; width: 65px;"></td>
	<td><input type="checkbox">解除</td>
	<td><input type="checkbox">設定</td>
	</tr>
	<tr>
	<td>防御武将６</td>
	<td><input type="text" style="text-align: center; width: 65px;"></td>
	<td><input type="checkbox">解除</td>
	<td><input type="checkbox">設定</td>
	</tr>
	<tr>
	<td>防御武将７</td>
	<td><input type="text" style="text-align: center; width: 65px;"></td>
	<td><input type="checkbox">解除</td>
	<td><input type="checkbox">設定</td>
	</tr>
	<tr>
	<td>防御武将８</td>
	<td><input type="text" style="text-align: center; width: 65px;"></td>
	<td><input type="checkbox">解除</td>
	<td><input type="checkbox">設定</td>
	</tr>
	<tr>
	<td>防御武将９</td>
	<td><input type="text" style="text-align: center; width: 65px;"></td>
	<td><input type="checkbox">解除</td>
	<td><input type="checkbox">設定</td>
	</tr>

	</table>
	スキル発動は行いません
	</td>
	</tr>
	</table>
`);


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
