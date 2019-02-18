console.log(module.parent.exports.test)
var exec = require('child_process').exec
const EventEmitter = require('events').EventEmitter
const is_windows = process.platform === 'win32'
const is_linux = process.platform === 'linux'

exports.listen = new EventEmitter

var listening
var default_connect
var speed = 500;
exports.listen.on('initial_status', function(data){
    default_connect = data
})

//チェックしたいポート
check_port = "4000"
port = '":' + check_port + ' "'

//プロトコル
pro = 'UDP'

//サーバーが起動しているかをポートのlisten状態で判断し、結果をクライアントにプッシュする
// exports.listen_check = function () {
setInterval(() => {


    //実行OSを基にnetstatとコマンドのオプションと検索コマンドの分岐
    if (is_windows) {
        args = ' -anp ' + pro + ' '
        search_type = ' find '
    }

    if (is_linux) {
        search_type = ' grep '
        if (pro === 'TCP') args = ' -ant '
        else args = ' -anu '

    }

    //指定されたポートがlistenされているかどうか判定
    var result = new Promise(function (resolve) {
        exec('netstat' + args + '|' + search_type + port, (err, stdout) => {
            if (!err) resolve(true)
            else resolve(false)
        })
    })

    //（ポートのlisten確認後）前回の判定結果と今回の判定結果が違う場合はサーバーのステータスが変化したことをクライアントに知らせる
    result.then(function (data) {

        console.log(exports.status)
        if (listening !== data || default_connect) {
            if (data) {
                exports.listen.emit('push', "Running!!", 'lightgreen')
            }
            else {
                exports.listen.emit('push', "Not Run!", 'red')
            }
            listening = data
            default_connect = false
        }
    })


}, speed)

exports.Upper = function(str) {
    if (!str || typeof str !== 'string') return str;
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};
