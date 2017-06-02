var USNOTIFY = 30.08;
var JPNOTIFY = 0.2650;
var MIN_US = 65535;
var MIN_JP = 65535;
var MAX_US = 0;
var MAX_JP = 0;
var MAX_USJP = 0;
var MIN_USJP = 65535;

function print_col(obj) {
	let col = "";
	for (var key in obj) {
		col += key + "\t";
	}
	col += "\ttime\t";
	console.log(col);
}

function print_currency(obj) {
	let val = "";
	for (var key in obj) {
		val += obj[key] + "\t\t";
	}
	val += moment().format('MM/DD HH:mm');
	console.log(val);
}

function notify(obj, notify_val) {
	let SpotSelling = obj.SpotSelling;
	if (SpotSelling <= notify_val) {
		console.log("**************\t\t\t%s=%d\t\t\t**************\n", obj.Currency, SpotSelling);
	}
}

function get_proportion(numerator, denominator) {
	let prop = Math.round(numerator / denominator * 1000) / 1000;
	return prop;
}

// 玉山銀行
function esunbank() {
	c.queue([{
		url: 'https://www.esunbank.com.tw/bank/personal/deposit/rate/forex/foreign-exchange-rates',
		callback: function(error, result, $) {
			let lastDay = $("input#TxtDatepicker").val().toString();
			let lastTime = $("input#Txt_deposit1").val().toString();
			let lastUpdate = lastDay +" "+ lastTime;
			lastUpdate = moment(lastUpdate).format('MM/DD HH:mm');

			let us = $("TD:contains('美元(USD)')");
			let usDollar = {
				"Currency": "US dollar",
				"SpotBuying": us.next().text(),
				"SpotSelling": us.next().next().text(),
				"CashBuying": us.next().next().next().text(),
				"CashSelling": us.next().next().next().next().text(),
			};
			let jp = $("TD:contains('日圓(JPY)')");
			let jpDollar = {
				"Currency": "JPY dollar",
				"SpotBuying": jp.next().text(),
				"SpotSelling": jp.next().next().text(),
				"CashBuying": jp.next().next().next().text(),
				"CashSelling": jp.next().next().next().next().text(),
			};
			console.log("\t\tUSNOTIFY = %d , JPNOTIFY = %d", USNOTIFY, JPNOTIFY);

			let us_vs_jp = get_proportion(usDollar.SpotSelling, jpDollar.SpotSelling);
			MAX_USJP = Math.round((Math.max(MAX_USJP, us_vs_jp) * 1000)) / 1000;
			MIN_USJP = Math.round((Math.min(MIN_USJP, us_vs_jp) * 1000)) / 1000;
			console.log("US/JP = %d \t MAX_USJP = %d \t MIN_USJP = %d \t ", us_vs_jp, MAX_USJP, MIN_USJP);
			
			MIN_US = usDollar.SpotSelling <= MIN_US ? usDollar.SpotSelling : MIN_US;
			MAX_US = usDollar.SpotSelling >= MAX_US ? usDollar.SpotSelling : MAX_US;
			MIN_JP = jpDollar.SpotSelling <= MIN_JP ? jpDollar.SpotSelling : MIN_JP;
			MAX_JP = jpDollar.SpotSelling >= MAX_JP ? jpDollar.SpotSelling : MAX_JP;
			console.log("MIN_US = %d \t MAX_US = %d \t MIN_JP = %d \t MAX_JP = %d", MIN_US, MAX_US, MIN_JP, MAX_JP);

			console.log("--------------------------------------"+lastUpdate+"---------------------------------------------------");
			print_col(usDollar);
			console.log("----------------------------------------esunbank----------------------------------------------------");
			print_currency(usDollar);
			notify(usDollar, USNOTIFY);

			print_currency(jpDollar);
			notify(jpDollar, JPNOTIFY);

			console.log("\n\n");
		}
	}]);
}

var Crawler = require("crawler");
var url = require('url');
var moment = require('moment');
var c = new Crawler({
	maxConnections: 10,
	// This will be called for each crawled page
	callback: function(error, result, $) {
		console.log("Crawler default callback");
	}
});

esunbank();
setInterval(esunbank, 300000);