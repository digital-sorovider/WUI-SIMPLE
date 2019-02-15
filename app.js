var express = require('express');
var app = express();
var exec = require('child_process').exec;
var http = require('http').Server(app);
const io = require('socket.io')(http);
const PORT = process.env.Port || 3000;
const is_windows = process.platform === 'win32'
const is_linux = process.platform === 'linux'

var status;

//チェックしたいサーバーがlistenするポート
check_port = "4000"
port = '":' + check_port + ' "'

//プロトコル
pro = 'UDP'


//サーバーが起動しているかをポートのlisten状態で判断し、結果をクライアントにプッシュする
function listen_check() {
	//実行OSを基にnetstatとコマンドのオプションと検索コマンドの分岐
	if (is_windows) {
		args = ' -anp ' + pro + ' '
		search_type = ' find '
	}

	if (is_linux) {
		search_type = ' grep '
		if(pro === 'TCP') args = ' -ant '
		else args = ' -anu '

	}

	//指定されたポートがlistenされているかどうか判定
	var result = new Promise(function (resolve) {
		exec('netstat' + args + '|' + search_type + port, (err, stdout) => {
			if (!err) resolve(true)
			else resolve(false)
		});
	})

	//（ポートのlisten確認後）前回の判定結果と今回の判定結果が違う場合はサーバーのステータスが変化したことをクライアントに知らせる
	result.then(function (data) {

		if (status !== data) {
			if (data) {
				io.emit('message_s', "サーバーが稼働状態になりました");
				io.emit('server_status', "Running!!", 'lightgreen');
			}
			else {
				io.emit('message_s', "サーバーが停止状態になりました");
				io.emit('server_status', "Not Run!", 'red');

			}
			status = data
		}
	});


}

//0.5秒ごとに判定
setInterval(listen_check, 500)

//クライアント接続時の処理
io.on('connection', function (socket) {
	console.log("connect");

	//現在のサーバーステータスをプッシュ
	listen_check()
	if (status) io.emit('server_status', "Running!!", 'lightgreen');
	else io.emit('server_status', "Not Run!", 'red');
});

http.listen(PORT, function () {
	console.log('server listening Port:' + PORT);
});