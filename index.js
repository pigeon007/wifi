var qs = require('querystring');
var Promise = require('promise');

var events = require('events');
var e = new events.EventEmitter();

var redis = require('redis');
var redisClient = redis.createClient();

var redisKey = 'wifi:tutorial:list';

var fs = require('fs');
var restify = require('restify');
var server = restify.createServer();

server.use(restify.acceptParser(server.acceptable));
server.use(restify.queryParser());
server.use(restify.bodyParser());

var socket_io = require('socket.io');

var io = socket_io.listen(server.server);

var Wireless = require('wireless');

var nic = 'wlan4';

var wireless = new Wireless({
    iface: nic,
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
					// before insert check if exists
					var promise = new Promise(function(result, reject){
						redisClient.lrange(redisKey, 0, -1, function(err, lrangeRes){
							if(err){
								console.dir(err);
								var msg = {
									status:"OK",
									msg:"unable to lrange"
								};
								res.send(msg);
							}else {
								// console.dir(network);
								var found = false;
								for(var i=0;i<lrangeRes.length;i++){
									var msg_obj = JSON.parse(lrangeRes[i]);
									if(msg_obj.address==network.address){
										found = true;
										// console.log("found ["+JSON.stringify(msg_obj)+"]");
										result(msg_obj);
									}else {
										found = false;
									}
								}
								if(!found){
									network.date = new Date();
									reject(network);
								}
							}
						});
					});

					promise.then(function(found){
						// if found do nothing
					}, function(network){
						e.emit('appear_event', network);
						redisClient.lpush(redisKey, JSON.stringify(network), function(err, lpushRes){
							if(err){
								 console.dir(err);
							}else {
								 console.dir(network);			
							}
						});
					});

				}else {
					console.dir("invalid networks")
				}
		});


io.sockets.on('connection', function (socket) {
	console.log("socket connected");
	e.on('appear_event', function(wifi_data){
		console.log("sending event to browsers");
		console.dir(wifi_data);
		socket.emit('new_wifi_appear', JSON.stringify(wifi_data));			
	});
});

		server.get('/wifi/realtime', function(req, res, next){
			fs.createReadStream(__dirname+'/wifi_template.html').pipe(res);
		});

		server.get('/', function(req, res, next){
			fs.createReadStream(__dirname+'/wifi_api.html').pipe(res);
		});

		server.get('/api/json', function(req, res, next){
			redisClient.lrange(redisKey, 0, -1, function(err, lrangeRes){
				if(err){
					var msg = {
						status:"ERR",
						msg:"unable to lrange"
					};
					res.send(msg);
					next();

				}else {
					var list = [];
					for(var i=0;i<lrangeRes.length;i++){
						var msg_obj = JSON.parse(lrangeRes[i]);
						list.push(msg_obj);
					}
					var msg = {
						status:"OK",
						msg:list
					};
					res.setHeader("Access-Control-Allow-Origin", "*");
					res.send(msg);
				}
			});
		});

		server.get('/api/json/p/:num', function(req, res, next){
			var num = req.params.num;
			var step = 100;
			if(num!=undefined && num>=0){
				var list = [];
				redisClient.lrange(redisKey, num*step, (num+1)*step, function(err, lrangeRes){
					for(var i=0;i<lrangeRes.length;i++){
						var msg_obj = JSON.parse(lrangeRes[i]);
						list.push(msg_obj)
					}
					var msg = {
						status:"OK",
						msg:list
					};
					res.send(msg);
				});
			}else {
			
			}
		});

		server.del('/api/delete/ap', function(req, res){
			var data = qs.parse(req.body);
			if(data.address!=undefined){
				// loop and lrem and redirect
				var promise = new Promise(function(result, reject){
					redisClient.lrange(redisKey, 0, -1, function(err, lrangeRes){
						if(err){
							var msg = {
								status:"ERR",
								msg:"unable to lrange"
							};
							res.send(msg);
						}else {
							for(var i=0;i<lrangeRes.length();i++){
								//console.dir(lrangeRes);
							}
						}
					});
				});
			}else {
				//console.dir(data);
				var msg = {
					status:"ERR",
					msg:"invalid address"
				};
				res.send(msg);
			}
		});

		server.get('/static/js/:name', function(req, res, next){
			var name = req.params.name;
			var fullpath = __dirname+'/public/js/'+name;
			fs.exists(fullpath, function(bool){
				var stream = fs.createReadStream(fullpath);
				stream.pipe(res);
			});
		});

		server.get('/static/css/:name', function(req, res, next){
			var name = req.params.name;
			var fullpath = __dirname+'/public/css/'+name;
			fs.exists(fullpath, function(bool){
				var stream = fs.createReadStream(fullpath);
				stream.pipe(res);
			});
		});

		server.get('/wifi/map', function(req, res, next){
			fs.createReadStream(__dirname+'/wifi_map.html').pipe(res);
		});

		server.get('/wifi/map/:bssid', function(req, res, next){
			fs.createReadStream(__dirname+'/wifi_ap_map.html').pipe(res);			
		});

		server.get('/wifi/json/:bssid', function(req, res, next){
			var bssid = req.params.bssid;
			var promise = new Promise(function(result, reject){
				redisClient.lrange(redisKey, 0, -1, function(err, lrangeRes){
					if(err){
						console.dir(err);
						var msg = {
							status:"OK",
							msg:"unable to lrange"
						};
						res.send(msg);
					}else {
						// console.dir(network);
						var found = false;
						for(var i=0;i<lrangeRes.length;i++){
							var msg_obj = JSON.parse(lrangeRes[i]);
							if(msg_obj.address==bssid){
								found = true;
								console.log("found ["+JSON.stringify(msg_obj)+"]");
								result(msg_obj);
							}else {
								found = false;
							}
						}

						if(!found){
							reject();
						}
					}
				});
			});

			promise.then(function(found){
					// if found do nothing
					var msg = {
						status:"OK",
						msg:found
					};
					res.send(msg);
				}, function(not_found){
					var msg = {
						status:"ERR",
						msg:"not found"
					};
					res.send(msg);
			});
		});

		

		console.log("http://localhost:8080");
		server.listen(8080, '0.0.0.0');













