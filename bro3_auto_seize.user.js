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
// @version 0.01 final edition
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

var VerNo="2017.12.24 Ver0.01 Rev Edition";
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
var WDPLC = "-999,-999";	//出兵先アドレス

//------------------//
// オプション設定管理用 //
//------------------//
var g_capture_options = {};
var g_skills_options  = [];
var g_event_process   = false;
var g_hp;//鹵獲武将たちの最小HP格納エリア
var g_gg;//鹵獲武将たちの最小ゲージ格納エリア
var g_hp_min;//鹵獲武将たちの最小限回復する必要があるHP数の格納エリア
var g_deck_cost;
var g_rokaku_cards = [];//出兵用武将カード
var g_h_all1="";//全軍セット状態
var g_rokaku_cnt;//デッキで待機している鹵獲武将の数
var g_zengun_cnt;//デッキで待機している全軍武将の数
var g_rokaku_su;//設定されている鹵獲武将の数
var g_zengun_su;//設定されている全軍武将の数
var g_run_cnt;//出兵中の武将数
var g_set_cnt;//デッキ中の内政武将数
var g_set_flg;//内政中有無フラグ
var g_hp_max=100;//最大限回復して良いHP数

//------------------//
// 保存設定部品定義    //
//------------------//
//
var H_AUT_CAP     = 'aut0';   // 自動鹵獲スイッチ
var H_TROOPSS     = 'trs0';		// 出兵元
var H_TROOPSE0    = 'tre0';		// 出兵先チェックボックス（木）
var H_TROOPSE1    = 'tre1';		// 出兵先チェックボックス（石）
var H_TROOPSE2    = 'tre2';		// 出兵先チェックボックス（鉄）
var H_TROOPSE3    = 'tre3';		// 出兵先チェックボックス（糧）
var H_TROOPSELV0  = 'trl0';		// 出兵先テキスト（木）
var H_TROOPSELV1  = 'trl1';		// 出兵先テキスト（石）
var H_TROOPSELV2  = 'trl2';		// 出兵先テキスト（鉄）
var H_TROOPSELV3  = 'trl3';		// 出兵先テキスト（糧）
var H_MaxTROOP0   = 'mtr0';		// 獲得限度上限（木）
var H_MaxTROOP1   = 'mtr1';		// 獲得限度上限（石）
var H_MaxTROOP2   = 'mtr2';		// 獲得限度上限（鉄）
var H_MaxTROOP3   = 'mtr3';		// 獲得限度上限（糧）

var H_Cap1        = 'cap1';		// 武将番号
var H_Cap2        = 'cap2';		// 武将番号
var H_Cap3        = 'cap3';		// 武将番号
var H_Cap4        = 'cap4';		// 武将番号
var H_Cap5        = 'cap5';		// 武将番号
var H_Cap6        = 'cap6';		// 武将番号
var H_MinCap1     = 'mcp1';		// 鹵獲高
var H_MinCap2     = 'mcp2';		// 鹵獲高
var H_MinCap3     = 'mcp3';		// 鹵獲高
var H_MinCap4     = 'mcp4';		// 鹵獲高
var H_MinCap5     = 'mcp5';		// 鹵獲高
var H_MinCap6     = 'mcp6';		// 鹵獲高

var H_All1        = 'all1';		// 全軍
var H_All2        = 'all2';		// 全軍

var H_POTIONS0    = 'pts0';		// 回復用ラベルNO
var H_POTIONO1    = 'pto1';		// 回復HP下限
var H_POTIONO2    = 'pto2';		// 回復HP上限

var H_POTATO1     = 'pta1';		// 自動HP回復
var H_POTATO2     = 'pta2';		// 自動討伐回復

var H_OPT_Skill01 = 'sl01';		// スキル
var H_OPT_Skill02 = 'sl02';		// スキル
var H_OPT_Skill03 = 'sl03';		// スキル
var H_OPT_Skill04 = 'sl04';		// スキル
var H_OPT_Skill05 = 'sl05';		// スキル
var H_OPT_Skill06 = 'sl06';		// スキル
var H_OPT_Skill07 = 'sl07';		// スキル
var H_OPT_Skill08 = 'sl08';		// スキル
var H_OPT_Skill09 = 'sl09';		// スキル

var H_OPT_Skill21 = 'sl21';		// スキル
var H_OPT_Skill31 = 'sl31';		// スキル

var wdnl;
var stnl;
var irnl;
var rcnl;

initGMFunctions();	//GM関数の初期化

( function() {

console.log('*** bro3_AUTO_CAPTURE start ***'+location.pathname);
q$("#whiteWrapper").append("<span style='font-weight:bold'>("+"BRO3_AUTO_CAPTURE 判定開始("+VerNo+"))</span><BR>");
q$("#whiteWrapper").append("<span>("+"サーバー時間 "+$x("//span[@id='server_time']",d).innerHTML+""+")</span><BR>");


	console.log('*** bro3_AUTO_CAPTURE end ***');
}
})();
