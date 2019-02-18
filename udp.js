var dgram = require('dgram')
var server_host = 'localhost'
var server_port = 4000
var server = dgram.createSocket("udp4")

setTimeout(() => {
    server.bind(server_port, server_host)
    console.log(server_host, server_port)
}, 4000);