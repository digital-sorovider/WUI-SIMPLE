var dgram = require('dgram')
var server_host = 'localhost'
// var server_port = 4000
server_port = process.argv[2]
// server_protocol = process.argv[3]
var server = dgram.createSocket("udp4")

setTimeout(() => {
    server.bind(server_port, server_host)
    console.log(server_host, server_port)
}, 2000);


// path = process.cwd().replace(/\\/g, "/") + '/exe/memo.lnk';
			// exec(path)