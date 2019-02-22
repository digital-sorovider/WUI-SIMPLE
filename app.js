const express = require('express')
const app = express()
const EventEmitter = require('events').EventEmitter
// var child = require('child_process')
var exec = require('child_process').exec
const execSync = require('child_process').execSync;
const { spawn } = require('child_process')
const http = require('http').Server(app)
const io = require('socket.io')(http)
const PORT = process.env.Port || 3000

var f = require('./func')
var servers_info = require('./config.json')["servers_info"]
var statuses_setting = require('./config.json')["status_info"]

// console.log(config['test1']['port'])

var status = {}
var pre_status = {}
var udpserver
var pre_listen
var status_timer

//ポートリッスンしてるかどうか返すだけ
function listen_get(target) {
	serv_info = servers_info[target]
	result = f.listen_check(serv_info['name'], serv_info['port'], serv_info['protocol'])
	return result
}

//引数のステータスをもとに要素をセットする
function status_set(target, status) {
	state_opt = statuses_setting[status]
	io.sockets.in(target).emit('server_status', state_opt['message'], state_opt['color'], state_opt['l_name'], state_opt['r_name'], state_opt['is_ing'])
}


//ソケット起動前に各サーバーのステータスを取得しておく
Object.keys(servers_info).forEach(function (key, val) {
	if (listen_get(key)) {
		status[key] = 'run'
	}
	else {
		status[key] = 'not'
	}
})

//各チャンネルに合わせた要素のセット(config.jsonで定義したいな？)
function element_set(target) {
	io.sockets.in(target).emit('change channel', target, f.Upper(target), servers_info[target]['background']); //背景とか要素置き換え
}

//サーバーへのアクション
function server_ctl(action, target) {
	status[target] = action
	info = servers_info[target]
	if (action === 'start') {
		udpserver = spawn('node', ['udp.js', info['port']])
	} else if (action === 'Stop') {
		setTimeout(() => {
			udpserver.kill()
		}, 1000)
	} else if (action === 'Restart') {
		udpserver.kill()
		udpserver = spawn('node', ['udp.js', info['port']])

	}

	var get_id = setInterval(function () {
		listen = listen_get(target);
		if (listen) {
			clearInterval(get_id);//idをclearIntervalで指定している
			status_set(target, 'run')
		}
	}, 500);
}
// console.log(typeof servers_info)

// Object.keys(servers_info).forEach(function(key,val){
// 	info = servers_info[key]
// 	result = f.listen_check(info['name'], info['port'], info['protocol'])
// 	console.log(info['name'],":",result)
// })

//クライアントが接続したら操作受付待ち
io.on('connection', function (socket) {
	console.log("connect")

	var channel = 'test1' //初期チャンネル定義

	//初期セッティング
	socket.join(channel) //チャンネルへ入室
	status_set(channel, status[channel]) //チャンネルのステータスを取得し、要素セット
	element_set(channel) //チャンネル固有の要素セット

	//セレクトボタンが押された時の動作
	socket.on('change channel', function (newChannel) {
		socket.leave(channel); //チャンネルを去る
		socket.join(newChannel); //選択された新しいチャンネルのルームに入る
		status_set(newChannel) //新しいチャンネルのステータスを取得し、要素セット
		element_set(newChannel)//新しいチャンネル用の要素をセット（サーバー名とか背景色とか）
		channel = newChannel; //今いるチャンネルを保存
	})

	socket.on('exe', function (action) {
		server_ctl(action, channel)
	})
})

// 	var channel = 'test1'


// 	var first_check = true


// 	function status_change(status, c_channel) {
// 		ing = 'orange'
// 		switch (status) {
// 			case 'run':
// 				io.sockets.in(c_channel).emit('server_status', "Running!!", 'lightgreen', 'Stop', 'stopp', 'Restart', 'restart')
// 				break;

// 			case 'not':
// 				io.sockets.in(c_channel).emit('server_status', "Not Run!", 'red', 'Start', 'start', 'Backup', 'backup')
// 				break;

// 			case 'start':
// 			case 'stopp':
// 			case 'restart':
// 				io.sockets.in(c_channel).emit('server_status', f.Upper(status) + 'ing...', ing, '', '', '', '', true)
// 				break;
// 			default:
// 				break;
// 		}
// 		console.log(status, "にする")
// 		return status
// 	}


// 	socket.join(channel);


// 	//テストサーバーに対するアクション(単純に起動、停止、再起動の3種類)
// 	socket.on('exe', function (action) {
// 		console.log(action)
// 		status[channel] = action
// 		f.startTimer(servers_info[channel], channel);
// 		// startTimer();


// 		if (action === 'start') {
// 			udpserver = spawn('node', ['udp.js', servers_info[channel]['port']])
// 		} else if (action === 'stopp') {
// 			setTimeout(() => {
// 				udpserver.kill()
// 			}, 1000)
// 		} else if (action === 'restart') {
// 			udpserver.kill()
// 			udpserver = spawn('node', ['udp.js', servers_info[channel]['port']])

// 		}
// 		ing_val = 'ing'
// 		// io.sockets.in(channel).emit('server_status', f.Upper(action) + 'ing...', 'orange', ing_val, '', ing_val, '', true)
// 		status_change(status[channel])
// 	})

// 	function element_set(channel) {
// 		console.log(channel)

// 		io.sockets.in(channel).emit('change channel', channel, f.Upper(channel), servers_info[channel]['background']); //背景とか要素置き換え

// 	}

// 	//セレクトボタンが押されたときにクライアントに値を返す処理
// 	socket.on('change channel', function (newChannel) {

// 		f.listen_check(servers_info[newChannel]['port'], servers_info[newChannel]['protocol'], newChannel)



// 		socket.leave(channel); //チャンネルを去る
// 		socket.join(newChannel); //選択された新しいチャンネルのルームに入る
// 		element_set(newChannel)//新しいチャンネル用の要素をセット（サーバー名とか背景色とか）
// 		// status_change(status[newChannel], newChannel)

// 		channel = newChannel; //今いるチャンネルを保存

// 		// first_check = true


// 		io.sockets.in(channel).emit('debug', status[channel])
// 	})

// 	f.listen.on('listen', function (listen, listen_channel) {
// 		if ((pre_listen !== listen || first_check) && listen_channel === channel) {
// 			console.log("ステータス更新");
// 			f.stopTimer(f.status_timer);
// 			// stopTimer();

// 			if (listen) {
// 				// io.sockets.in(channel).emit('server_status', "Running!!", 'lightgreen', 'Stop', 'stopp', 'Restart', 'restart')
// 				status[channel] = status_change('run')
// 				// status[channel] = "run"
// 			}

// 			else if (status[channel] !== 'restart') {
// 				// io.sockets.in(channel).emit('server_status', "Not Run!", 'red', 'Start', 'start', 'Backup', 'backup')
// 				status[channel] = status_change('not')
// 				// status[channel] = "not"
// 			}
// 			pre_listen = listen
// 			// pre_status = status[channel]
// 			first_check = false;

// 		}
// 	})

// })

http.listen(PORT, function () {
	console.log('server listening Port:' + PORT)
})