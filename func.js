const EventEmitter = require('events').EventEmitter
const is_windows = process.platform === 'win32'
const is_linux = process.platform === 'linux'
var execSync = require('child_process').execSync;
var servers_info = require('./config.json')["servers_info"]


exports.listen = new EventEmitter

exports.listen.on('initial_status', function (data) {
    default_connect = data
})

exports.listen_check = function (check_port, protocol) {
    port = ':' + check_port + ' '
    if (is_windows) {
        args = ' -anp ' + protocol + ' '
    }

    if (is_linux) {
        if (protocol === 'TCP') args = ' -ant '
        else args = ' -anu '

    }

    result = execSync('netstat' + args).indexOf(port)

    if (result > 0) {
        return true
    }
    else {
        return false
    }

}

//ポートリッスンしてるかどうか返すだけ
exports.listen_get = function (target) {
	serv_info = servers_info[target]
	result = exports.listen_check(serv_info['port'], serv_info['protocol'])
	return result
}


//先頭の1文字だけ大文字にする関数
exports.Upper = function (str) {
    if (!str || typeof str !== 'string') return str;
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

