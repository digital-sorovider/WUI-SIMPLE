var dgram = require('dgram');
var server_host = 'localhost'
var server_port = 4000
var server = dgram.createSocket("udp4")

exports.udp = function (action) {


    // setTimeout(() => {
    //     console.log("1")
    // }, 0);
    // setTimeout(() => {
    //     console.log("2")
    // }, 1000);
    // setTimeout(() => {
    //     console.log("3")
    // }, 2000);

    // setTimeout(() => {



    if (action === 'start') {
        server.bind(server_port, server_host);
        console.log("\n" + 'Test UDP Server Start');
        console.log(server_host, ':', server_port);
    }
    else {
        server.close()
    }

    // }, 3000);

}