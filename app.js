const express = require('express')
const app = express()
const EventEmitter = require('events').EventEmitter
// var child = require('child_process')
var exec = require('child_process').exec
const { spawn } = require('child_process')
const http = require('http').Server(app)
const io = require('socket.io')(http)
const PORT = process.env.Port || 3000

var f = require('./func')
var config = require('./config.json')

// console.log(config['test1']['port'])

var status = {}
var pre_status = {}
var udpserver
var pre_listen
// var status_timer


Object.keys(config).forEach(function(val,key){
	status[val] = true;
	pre_status[val] = false;
})


//クライアントが接続したら操作受付待ち
io.on('connection', function (socket) {
	console.log("connect")

	var channel = 'test1'


	var first_check = true


	function status_change(status, c_channel) {
		ing = 'orange'
		switch (status) {
			case 'run':
				io.sockets.in(c_channel).emit('server_status', "Running!!", 'lightgreen', 'Stop', 'stopp', 'Restart', 'restart')
				break;

			case 'not':
				io.sockets.in(c_channel).emit('server_status', "Not Run!", 'red', 'Start', 'start', 'Backup', 'backup')
				break;

			case 'start':
			case 'stopp':
			case 'restart':
				io.sockets.in(c_channel).emit('server_status', f.Upper(status) + 'ing...', ing, '', '', '', '', true)
				break;
			default:
				break;
		}
		console.log(status, "にする")
		return status
	}


	socket.join(channel);


	//テストサーバーに対するアクション(単純に起動、停止、再起動の3種類)
	socket.on('exe', function (action) {
		console.log(action)
		status[channel] = action
		f.startTimer(config[channel], channel);
		// startTimer();


		if (action === 'start') {
			udpserver = spawn('node', ['udp.js', config[channel]['port']])
		} else if (action === 'stopp') {
			setTimeout(() => {
				udpserver.kill()
			}, 1000)
		} else if (action === 'restart') {
			udpserver.kill()
			udpserver = spawn('node', ['udp.js', config[channel]['port']])

		}
		ing_val = 'ing'
		// io.sockets.in(channel).emit('server_status', f.Upper(action) + 'ing...', 'orange', ing_val, '', ing_val, '', true)
		status_change(status[channel])
	})

	function element_set(channel) {
		console.log(channel)

		io.sockets.in(channel).emit('change channel', channel, f.Upper(channel), config[channel]['background']); //背景とか要素置き換え

	}

	//セレクトボタンが押されたときにクライアントに値を返す処理
	socket.on('change channel', function (newChannel) {

		f.listen_check(config[newChannel]['port'], config[newChannel]['protocol'], newChannel)



		socket.leave(channel); //チャンネルを去る
		socket.join(newChannel); //選択された新しいチャンネルのルームに入る
		element_set(newChannel)//新しいチャンネル用の要素をセット（サーバー名とか背景色とか）
		// status_change(status[newChannel], newChannel)

		channel = newChannel; //今いるチャンネルを保存

		// first_check = true


		io.sockets.in(channel).emit('debug', status[channel])
	})

	f.listen.on('listen', function (listen, listen_channel) {
		if ((pre_listen !== listen || first_check) && listen_channel === channel) {
			console.log("ステータス更新");
			f.stopTimer(f.status_timer);
			// stopTimer();

			if (listen) {
				// io.sockets.in(channel).emit('server_status', "Running!!", 'lightgreen', 'Stop', 'stopp', 'Restart', 'restart')
				status[channel] = status_change('run')
				// status[channel] = "run"
			}

			else if (status[channel] !== 'restart') {
				// io.sockets.in(channel).emit('server_status', "Not Run!", 'red', 'Start', 'start', 'Backup', 'backup')
				status[channel] = status_change('not')
				// status[channel] = "not"
			}
			pre_listen = listen
			// pre_status = status[channel]
			first_check = false;

		}
	})

})

http.listen(PORT, function () {
	console.log('server listening Port:' + PORT)
})