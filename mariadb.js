var mysql = require('mysql');
var node_uuid = require('node-uuid');
var Wireless = require('wireless');

var connection = mysql.createConnection({
	host:'localhost',
	database:'wify',
	user:'root',
	password:''
});

var json_test = { 
  last_tick: 1,
  encryption_any: true,
  encryption_wep: false,
  encryption_wpa: false,
  encryption_wpa2: true,
  address: '38:AA:3C:47:B0:92',
  channel: '6',
  quality: '41',
  strength: '-69',
  ssid: 'AndroidAP',
  mode: 'Master',
  date: 'Thu Mar 26 2015 06:22:07 GMT+0000 (WET)' };



var wireless = new Wireless({
    iface: 'wlan4',
	updateFrequency: 10, // Optional, seconds to scan for networks
	connectionSpyFrequency: 2, // Optional, seconds to scan if connected
	vanishThreshold: 2 // Optional, how many scans before network considered gone
});

wireless.enable(function(err) {
	if(err){
		console.log(" cant enable wireless ");
	}else {
	}
});

		
wireless.start();
	wireless.on('error', function(err){
	console.dir(err);
});

wireless.on('appear', function(network){
	if(network!=undefined){
		// console.dir(network);
		var checkQuery = 'select * from aps_test where ssid=?';
		connection.query(checkQuery, [network.ssid], function(err, rows, fields){
			if(err){
				console.dir(err);
			}else {
				if(rows.length==0){
					// not found insert it
					network.uuid = node_uuid.v1();
					console.dir(network);
					var insertQuery = 'insert into aps_test (uuid, ssid) values(?, ?)';
					connection.query(insertQuery, [network.uuid, network.ssid], function(err, insertRes){
						if(err){
							console.dir(err);
						}else {
							console.dir(insertRes);
						}
					});
				}else {
					console.log("-----------------------------------");
					console.log("that app already exists");
					console.dir(network);
					console.log("-----------------------------------");
				}
			}
		});
	}else {

	}
});