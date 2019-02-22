console.log(module.parent.exports.test)
// const exec = require('child_process').exec
const EventEmitter = require('events').EventEmitter
const is_windows = process.platform === 'win32'
const is_linux = process.platform === 'linux'
const { spawn,exec } = require('promisify-child-process');
var execSync = require('child_process').execSync;

exports.listen = new EventEmitter

var listening
var default_connect
var speed = 500;
exports.listen.on('initial_status', function (data) {
    default_connect = data
})

var pre_port



//チェックしたいポート
// check_port = "4000"
// port = '":' + check_port + ' "'

//プロトコル
// pro = 'UDP'

//サーバーが起動しているかをポートのlisten状態で判断し、結果をクライアントにプッシュする
// exports.listen_check = function (check_port, protocol, channel) {
//     if (pre_port !== check_port) {

//         pre_port = check_port
//     }
//     // console.log(status)
//     // setInterval(() => {
    check_port = "4000"

    port = ':' + check_port + ' '

    //プロトコル
    pro = 'UDP'


    //実行OSを基にnetstatとコマンドのオプションと検索コマンドの分岐
    if (is_windows) {
        args = ' -anp ' + pro + ' '
    }

    if (is_linux) {
        if (pro === 'TCP') args = ' -ant '
        else args = ' -anu '

    }

// var result = "" + execSync('netstat' + args).indexOf(port);
// var result = "" + execSync('netstat' + args + '|' + search_type + port);
// console.log(result.indexOf(port));
// check = result.indexOf(":4000 ")
// console.log(check);

if (execSync('netstat' + args).indexOf(port) > 0) {
// if (execSync('netstat' + args).indexOf(":4000 ") > 0) {
    console.log("開放状態")
}
else {
    console.log("閉鎖");
}

//     //指定されたポートがlistenされているかどうか判定
//     // var result = new Promise(function (resolve) {
//     exec('netstat' + args + '|' + search_type + port, (err, stdout) => {
//         if (!err) exports.listen.emit('listen', true, channel)
//         else exports.listen.emit('listen', false, channel)
//     })
    // })

    //（ポートのlisten確認後）前回の判定結果と今回の判定結果が違う場合はサーバーのステータスが変化したことをクライアントに知らせる
    // result.then(function (data) {
    //     if (listening !== data || default_connect) {
    //         if (data) {
    //             exports.listen.emit('push', "Running!!", 'lightgreen')
    //         }
    //         else {
    //             exports.listen.emit('push', "Not Run!", 'red')
    //         }
    //         listening = data
    //         default_connect = false
    //     }
    // })


    // }, speed)
// }

//先頭の1文字だけ大文字にする関数
exports.Upper = function (str) {
    if (!str || typeof str !== 'string') return str;
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};


exports.startTimer = function (info, channel) {
    exports.status_timer = setInterval(function () {
        // info = config[channel]
        exports.listen_check(info['port'], info['protocol'], channel)
    }, 500);
}

exports.stopTimer = function (timer) {
    clearInterval(timer)
}