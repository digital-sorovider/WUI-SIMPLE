const express = require('express')
const app = express()
const { spawn } = require('child_process')
const http = require('http').Server(app)
const io = require('socket.io')(http)
const PORT = process.env.Port || 3000

var f = require('./func')
var servers_info = require('./config.json')["servers_info"]
var statuses_setting = require('./config.json')["status_info"]

var status = {}
var listen = {}
var udpserver



//引数のステータスをもとに要素をセットする
function status_set(target, status) {
	state_opt = statuses_setting[status]
	io.sockets.in(target).emit('server_status', state_opt['message'], state_opt['color'], state_opt['l_name'], state_opt['r_name'], state_opt['is_ing'])
}


//ソケット起動前に各サーバーのステータスを取得しておく
Object.keys(servers_info).forEach(function (key, val) {
	if (listen[key] = f.listen_get(key)) {
		status[key] = 'run'
	}
	else {
		status[key] = 'not'
	}
})

//各チャンネルに合わせた要素のセット
function element_set(target) {
	io.sockets.in(target).emit('change channel', target, servers_info[target]['name'], servers_info[target]['background']); //背景とか要素置き換え
}

//サーバーへのアクション
function server_ctl(action, target) {
	status[target] = action
	info = servers_info[target]
	if (action === 'Start') {
		udpserver = spawn('node', ['udp.js', info['port']])
	} else if (action === 'Stop') {
		setTimeout(() => {
			udpserver.kill()
		}, 1000)
	} else if (action === 'Restart') {
		udpserver.kill()
		setTimeout(() => {
			udpserver = spawn('node', ['udp.js', info['port']])
		}, 2000);

	}

	//起こされたアクションに対して期待されているステータスになったら0.5秒ごとのループを終了し、view側にステータスを反映させる
	var get_id = setInterval(function () {
		var check_loop = true

		//まずはlisten状態を確認
		listen[target] = f.listen_get(target);

		//
		if (listen[target] && (action === 'Start' || action === 'Restart')) {
			status[target] = 'run'
			check_loop = false;
		}

		if(!listen[target] && action === 'Stop'){
			status[target] = 'not'
			check_loop = false;
		}

		if(!check_loop) {
			clearInterval(get_id);//idをclearIntervalで指定している
			status_set(target, status[target])
		}
	}, 500);
}

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
		status_set(newChannel, status[newChannel]) //新しいチャンネルのステータスを取得し、要素セット
		element_set(newChannel)//新しいチャンネル用の要素をセット（サーバー名とか背景色とか）
		channel = newChannel; //今いるチャンネルを保存
	})

	socket.on('exe', function (action) {
		server_ctl(action, channel)
		status_set(channel, status[channel])
	})
})

http.listen(PORT, function () {
	console.log('server listening Port:' + PORT)
})