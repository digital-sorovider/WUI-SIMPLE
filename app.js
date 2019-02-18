const express = require('express')
const app = express()
const EventEmitter = require('events').EventEmitter
// var child = require('child_process')
// var spawn = require('child_process').spawn
const { spawn } = require('child_process')
const http = require('http').Server(app)
const io = require('socket.io')(http)
const PORT = process.env.Port || 3000

var f = require('./func')
module.exports.test = 'yomikomen'


var udpserver
var status;
var pre_listen;


//0.5秒ごとに判定
// setInterval(() => {
// 	f.listen_check(status)
// }, 500);

// setInterval(() => {
// 	f.listen_check()
// 	if (status !== f.status) {
// 		if (f.status) {
// 			io.emit('server_status', "Running!!", 'lightgreen')
// 		}
// 		else {
// 			io.emit('server_status', "Not Run!", 'red')
// 		}
// 		status = f.status
// 	}
// }, 500)

//クライアントが接続したら操作受付待ち
io.on('connection', function (socket) {
	console.log("connect")

	//現在のサーバーステータスをプッシュ
	// f.listen_check()
	// if (f.status) io.emit('server_status', "Running!!", 'lightgreen')
	// else io.emit('server_status', "Not Run!", 'red')
	// status = f.status
	default_connect = true

	f.listen.on('listen', function (enable) {
		// io.emit('server_status', data, color)
		if (pre_listen !== enable || default_connect) {
			console.log(status)
			if (enable) {
				io.emit('server_status', "Running!!", 'lightgreen')
				io.emit('load', false)

			}
			else
			if(status !== 'restart'){
				io.emit('server_status', "Not Run!", 'red')
				io.emit('load', false)
			}
			pre_listen = enable
			default_connect = false;
		}
	})

	//テストサーバーに対するアクション(単純に起動、停止、再起動の3種類)
	socket.on('exe', function (action) {
		io.emit('server_status', f.Upper(action) + 'ing...', 'orange')
		io.emit('load', true)
		status = action

		if (action === 'start') {
			udpserver = spawn('node', ['udp.js'])

		} else

			if (action === 'stopp') {
				setTimeout(() => {
					udpserver.kill()
				}, 2000);
			} else

				if (action === 'restart') {
					udpserver.kill()
					udpserver = spawn('node', ['udp.js'])

				}
	})

})

http.listen(PORT, function () {
	console.log('server listening Port:' + PORT)
})