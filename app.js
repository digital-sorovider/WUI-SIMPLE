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


var udpserver
var status
var pre_listen


//クライアントが接続したら操作受付待ち
io.on('connection', function (socket) {
	console.log("connect")

	var channel = 'test1'
	var status_timer
	var first_check = true

	function startTimer() {
		status_timer = setInterval(function () {
			info = config[channel]
			f.listen_check(info['port'], info['protocol'], channel)
		}, 500);
	}

	function stopTimer() {
		clearInterval(status_timer)
	}


	socket.join(channel);


	//現在のサーバーステータスをプッシュ
	// f.listen_check(config[channel]['port'], config[channel]['protocol'], channel)
	// if (f.status) io.emit('server_status', "Running!!", 'lightgreen')
	// else io.emit('server_status', "Not Run!", 'red')
	// status = f.status




	//テストサーバーに対するアクション(単純に起動、停止、再起動の3種類)
	socket.on('exe', function (action) {
		status = action
		startTimer();


		if (action === 'start') {
			udpserver = spawn('node', ['udp.js', config[channel]['port']])
			// path = process.cwd().replace(/\\/g, "/") + '/exe/memo.lnk';
			// exec(path)

		} else if (action === 'stopp') {
			setTimeout(() => {
				udpserver.kill()
			}, 2000)
		} else if (action === 'restart') {
			udpserver.kill()
			udpserver = spawn('node', ['udp.js', config[channel]['port']])

		}
		ing_val = 'ing'
		io.sockets.in(channel).emit('server_status', f.Upper(action) + 'ing...', 'orange', ing_val, '', ing_val, '', true)
	})

	//セレクトボタンが押されたときにクライアントに値を返す処理
	socket.on('change channel', function (newChannel) {
		f.listen_check(config[newChannel]['port'], config[newChannel]['protocol'], newChannel)
		switch (newChannel) {
			case 'test1': back = '#668d9c'
				break

			case 'test2': back = '#669c6b'
				break

			case 'test3': back = '#bcc977'
				break

			default:
				break
		}

		socket.leave(channel); //チャンネルを去る
		socket.join(newChannel); //選択された新しいチャンネルのルームに入る

		channel = newChannel; //今いるチャンネルを保存
		io.sockets.in(channel).emit('change channel', newChannel, f.Upper(channel), back); //チャンネルを変えたこと自分に送信
		io.sockets.in(channel).emit('your', channel);
		first_check = true
	})

	f.listen.on('listen', function (listen, listen_channel) {
		if ((pre_listen !== listen || first_check) && listen_channel === channel) {
			console.log("ステータス更新");
			stopTimer();

			if (listen) {
				io.sockets.in(channel).emit('server_status', "Running!!", 'lightgreen', 'Stop', 'stopp', 'Restart', 'restart')
			}

			else if (status !== 'restart') {
				io.sockets.in(channel).emit('server_status', "Not Run!", 'red', 'Start', 'start', 'Backup', 'backup')
			}
			pre_listen = listen
			first_check = false;

		}
	})

})

http.listen(PORT, function () {
	console.log('server listening Port:' + PORT)
})